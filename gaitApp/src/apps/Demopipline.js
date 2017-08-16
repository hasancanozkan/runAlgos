//@flow
'use strict';

/*
 * Created by jalil on 6/4/2017.
 * Javascript implementation of the Demopipline in Matlab.
 * 1) Reads files
 * 2) Calulates Dynamic Time Warping
 * 3) Gait Events
 * 4) Spatial Parameters.
 */
import RNFetchBlob from 'react-native-fetch-blob';

const math = require('mathjs');
const eGaitData = require('./gaitApp/src/modules/import_eGaITData');
const calibrate = require('./gaitApp/src/modules/calibrate');
const filter = require('./gaitApp/src/modules/filter');
const hardCoded = require('./gaitApp/src/modules/test');
const sDTW = require('./gaitApp/src/modules/sDTW');
const gaitEvents = require('./gaitApp/src/modules/gaitEvents');
const spatialTrajectory3D = require('./gaitApp/src/modules/spatialTrajectory3D');
const SensorData = require('./gaitApp/src/modules/SensorData');
const gaitEventFeatures = require('./gaitApp/src/modules/gaitFeatures');
//const fs = require('fs');
/*
 * Reading SensorData and Creating SensorData Obj
 * */
//const sensorData = eGaitData.importData('../data/TestData/');
async function sensorData (){
    const sensorData = await RNFetchBlob.fs.readFile('/storage/emulated/0/Documents/data/TestData','utf8');
};

/*
 * Creating Calibration File
 * */
const calibrationFiles = [
    {
        foot: 'LeftFoot',
        Acc: calibrate.csv2Mat('../data/dataset/B4F4_acc_left.csv','acc'), // WHAT IS csv2MAT
        Gyr: calibrate.csv2Mat('../data/dataset/B4F4_gyro_left.csv','gyro')
    },
    {
        foot: 'RightFoot',
        Acc: calibrate.csv2Mat('../data/dataset/B4F0_acc_right.csv','acc'),
        Gyr: calibrate.csv2Mat('../data/dataset/B4F0_gyro_right.csv','gyro')
    }
];

const calibratedData = [];
const calibratedFinalData = [];
const calibFilteredFinalData = [];

/*
* Calibrating the sensor data
* Filtering the calibrated sensor data for sDTW()
* */
sensorData.data.forEach((v, i) => {
    const data = math.clone(sensorData.data[i]);
    const position = SensorData.getSensorPosition(sensorData,i);
    calibratedData[i] = calibrate.calibrateRawData(data, calibrationFiles[i].Acc, calibrationFiles[i].Gyr);
    calibratedFinalData[i] = calibrate.changeAxis(calibratedData[i]);

    if (position === 'RightFoot') {
        calibratedFinalData[i] = calibrate.invertAxis(calibratedFinalData[i]);
    }
    const temp = [];
    for (let j = 0; j < calibratedFinalData[i].length; ++j) {
        temp[j] = filter.getFilteredData(5, calibratedFinalData[i][j]);
    }

    calibFilteredFinalData[i] = math.clone(temp);
    if (position === 'RightFoot') {
        calibFilteredFinalData[i] = calibrate.invertAxisRightOnly(calibFilteredFinalData[i]);
    }
});

/*
* Setting the sensor data object with calibrated data
* */
SensorData.setData(sensorData, sensorData.dataHeader, calibratedFinalData);

const normalizedSensorData = [];
const sDTWObj = [];
const tem = math.transpose(hardCoded.template());
const template = math.transpose(math.matrix([tem._data[4],tem._data[5]]));
const gaitEventObj = [];

/*
* Evaluating the Strides with Subsequent Dynamic Time Warping algorithm
* */
sensorData.data.forEach((v,i) => {
    normalizedSensorData[i] = math.matrix([math.divide(calibFilteredFinalData[i][4], 500), math.divide(calibFilteredFinalData[i][5], 500)]);
    const temp = new sDTW();
    temp.result(math.transpose(normalizedSensorData[i]), template,35);
    sDTWObj.push(temp);
});

/*
* Evaluating the Gait Events from the strides
* */
sensorData.data.forEach((v,i) => {
    const temp = new gaitEvents();
    const labelListStrides = sDTWObj[i].labelList;
    temp.getGaitEventResults(sensorData, labelListStrides, i);
    gaitEventObj.push(temp);
});

/*
* Computing the 3D trajectory
* */
const spatialObj = new spatialTrajectory3D({});
spatialObj.maxIntTime(sensorData, sDTWObj);
spatialObj.computeTrajectory(sensorData, gaitEventObj);

/*
* Evaluating the gait features from the spatial information of all strides
* */
const gaitFeatures = new gaitEventFeatures();
gaitFeatures.getFeatures(sensorData, spatialObj, gaitEventObj);
// add a console.log here  console.log(gaitFeatures.strideLength[0]);

// to run the code, created a run function
const run = function(){
    const gaitFeatures = new gaitEventFeatures();
    gaitFeatures.getFeatures(sensorData, spatialObj, gaitEventObj);
    //console.log(gaitFeatures.strideLength[0]);
    return gaitFeatures.strideLength[0];
}
run();

/**Exporting Results from
 * Demopipline in ../data/datasets/Results/ */
/*THIS IS PROBABLY NOT NECESSARY FOR RN CODE
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

mkDir('../data/dataset/Results/');
let resultsLeft = {
    StrideLength: gaitFeatures.strideLength[0],
    StrideTime: gaitFeatures.strideTime[0],
    StanceTime: gaitFeatures.stanceTime[0],
    SwingTime: gaitFeatures.swingTime[0]
};
let resultsRight = {
    StrideLength: gaitFeatures.strideLength[1],
    StrideTime: gaitFeatures.strideTime[1],
    StanceTime: gaitFeatures.stanceTime[1],
    SwingTime: gaitFeatures.swingTime[1]
};

resultsLeft = JSON.stringify(resultsLeft, null, 4);
resultsRight = JSON.stringify(resultsRight, null, 4);

// eslint-disable-next-line no-sync
fs.writeFileSync('../data/dataset/Results/resultsLeft.csv', resultsLeft);
// eslint-disable-next-line no-sync
fs.writeFileSync('../data/dataset/Results/resultsRight.csv' , resultsRight);
*/