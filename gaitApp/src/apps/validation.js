//@flow
'use strict';

const fs = require('fs');
const math = require('mathjs');
const eGaitData = require('../lib/modules/import_eGaITData');
const calibrate = require('../lib/modules/calibrate');
const filter = require('../lib/modules/filter');
const gaitEvents = require('../lib/modules/gaitEvents');
const spatialTrajectory3D = require('../lib/modules/spatialTrajectory3D.js');
const SensorData = require('../lib/modules/SensorData.js');
const gaitEventFeatures = require('../lib/modules/gaitFeatures.js');
const validate = require('../lib/modules/readValidationData');

const mkDir = function (directory) {
    return new Promise((resolve, reject) => {
        fs.mkdir(directory, 0o777, err => {
            if (!err || err.code === 'EEXIST') {
                resolve(directory);
            } else if (err) {
                reject(err);
            }
        });
    });
};

// Async function to read all the files in a directory
const readDir = function (dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
};

const processAllFiles = async () => {

    const validationFiles = await readDir('../data/dataset/ValidationRawData');
    const strideBorders = await readDir('../data/dataset/GoldStandard_StrideBorders');
    await mkDir('../data/dataset/gaitApp_Results/');

    const calibFiles = [
        {
            foot: 'LeftFoot',
            Acc: calibrate.csv2Mat('../data/dataset/calibration/A917_acc.csv','acc'),
            Gyr: calibrate.csv2Mat('../data/dataset/calibration/A917_gyro.csv','gyro')
        },
        {
            foot: 'RightFoot',
            Acc: calibrate.csv2Mat('../data/dataset/calibration/A6DF_acc.csv','acc'),
            Gyr: calibrate.csv2Mat('../data/dataset/calibration/A6DF_gyro.csv','gyro')
        }
    ];

    for (let iFile = 0; iFile < validationFiles.length; iFile += 2) {
        const sensorData = eGaitData.importDataValidation(validationFiles[iFile], validationFiles[iFile + 1]);

        const calibratedData = [];
        const calibratedFinalData = [];
        const calibratedFilteredFinalData = [];

        sensorData.data.forEach((v, i) => {
            const data = math.clone(sensorData.data[i]);
            const position = SensorData.getSensorPosition(sensorData, i);
            calibratedData[i] = calibrate.calibrateRawData(data, calibFiles[i].Acc, calibFiles[i].Gyr);
            calibratedFinalData[i] = calibrate.changeAxis(calibratedData[i]);

            if (position === 'RightFoot') {
                calibratedFinalData[i] = calibrate.invertAxis(calibratedFinalData[i]);
            }
            const temp = [];
            for (let j = 0; j < calibratedFinalData[i].length; ++j) {
                temp[j] = filter.getFilteredData(5, calibratedFinalData[i][j]);
            }

            calibratedFilteredFinalData[i] = math.clone(temp);
            if (position === 'RightFoot') {
                calibratedFilteredFinalData[i] = calibrate.invertAxisRightOnly(calibratedFilteredFinalData[i]);
            }

        });

        sensorData.data = calibratedFinalData;

        const labelListValidation = validate.getStrideBorders(strideBorders[iFile], strideBorders[iFile + 1]);

        const sDTWObj = [{
            labelList: labelListValidation[0]
        }, {
            labelList: labelListValidation[1]
        }];

        const gaitEventObj = [];
        sensorData.data.forEach((v, i) => {
            const temp = new gaitEvents();
            const labelListStrides = sDTWObj[i].labelList;
            temp.getGaitEventResults(sensorData, labelListStrides, i);
            gaitEventObj.push(temp);
        });

        const spatialObj = new spatialTrajectory3D({});
        spatialObj.maxIntTime(sensorData, sDTWObj);
        spatialObj.computeTrajectory(sensorData, gaitEventObj);

        const gaitFeatures = new gaitEventFeatures();
        gaitFeatures.getFeatures(sensorData, spatialObj, gaitEventObj);

        const compareToGaitRiteLeft = {
            name: validationFiles[iFile],
            StrideLength: gaitFeatures.strideLength[0],
            StrideTime: gaitFeatures.strideTime[0],
            StanceTime: gaitFeatures.stanceTime[0],
            SwingTime: gaitFeatures.swingTime[0]
        };
        const compareToGaitRiteRight = {
            name: validationFiles[iFile + 1],
            StrideLength: gaitFeatures.strideLength[1],
            StrideTime: gaitFeatures.strideTime[1],
            StanceTime: gaitFeatures.stanceTime[1],
            SwingTime: gaitFeatures.swingTime[1]
        };

        const compareToGaitRiteLeftFinal = JSON.stringify(compareToGaitRiteLeft, null, 4);
        const compareToGaitRiteRightFinal = JSON.stringify(compareToGaitRiteRight, null, 4);

        // eslint-disable-next-line no-sync
        fs.writeFileSync('../data/dataset/gaitApp_Results/' + validationFiles[iFile], compareToGaitRiteLeftFinal);
        // eslint-disable-next-line no-sync
        fs.writeFileSync('../data/dataset/gaitApp_Results/' + validationFiles[iFile + 1], compareToGaitRiteRightFinal);
    }
};

processAllFiles()
.catch(console.log);
