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
const eGaitData = require('../modules/import_eGaITData');
const calibrate = require('../modules/calibrate');
const filter = require('../modules/filter');
const hardCoded = require('../modules/test');
const sDTW = require('../modules/sDTW');
const gaitEvents = require('../modules/gaitEvents');
const spatialTrajectory3D = require('../modules/spatialTrajectory3D');
const SensorData = require('../modules/SensorData');
const gaitEventFeatures = require('../modules/gaitFeatures');


// to run the code, created a run function
export async function run ()  {
    console.time('Overall Pipeline time = ');
    let sensorData;
    /*
    * Evaluating the gait features from the spatial information of all strides
    * */
    console.time('Setting up sensor data');
    sensorData = await eGaitData.importData('/storage/emulated/0/Documents/data/TestData/');
    console.timeEnd('Setting up sensor data');

    // await RNFetchBlob.fs.writeFile('/storage/emulated/0/Documents/Outputs/rnRawDataLeftFoot5.csv',
    //     sensorData.data[0][5].toString(), 'utf-8');
    // console.log('Wrote the file');

    /*
    * Creating Calibration File
    * */
    console.time('Setting up calibration');
    const calibrationFiles = [
        {
            foot: 'LeftFoot',
            Acc: await calibrate.csv2Mat('/storage/emulated/0/Documents/data/dataset/B4F4_acc_left.csv','acc'),
            Gyr: await calibrate.csv2Mat('/storage/emulated/0/Documents/data/dataset/B4F4_gyro_left.csv','gyro')
        },
        {
            foot: 'RightFoot',
            Acc: await calibrate.csv2Mat('/storage/emulated/0/Documents/data/dataset/B4F0_acc_right.csv','acc'),
            Gyr: await calibrate.csv2Mat('/storage/emulated/0/Documents/data/dataset/B4F0_gyro_right.csv','gyro')
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
    console.timeEnd('Setting up calibration');

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
    console.time('sDTW Algorithm');
    sensorData.data.forEach((v,i) => {
        normalizedSensorData[i] = math.matrix([math.divide(calibFilteredFinalData[i][4], 500), math.divide(calibFilteredFinalData[i][5], 500)]);
        const temp = new sDTW();
        temp.result(math.transpose(normalizedSensorData[i]), template,35);
        sDTWObj.push(temp);
    });
    console.timeEnd('sDTW Algorithm');

    /*
    * Evaluating the Gait Events from the strides
    * */
    // sDTWObj.push(hardCoded.labelListLeft());
    // sDTWObj.push(hardCoded.labelListRight());

    console.time('Gait Events Algorithm');
    sensorData.data.forEach((v,i) => {
        const temp = new gaitEvents();
        const labelListStrides = sDTWObj[i].labelList;
        temp.getGaitEventResults(sensorData, labelListStrides, i);
        gaitEventObj.push(temp);
    });
    console.timeEnd('Gait Events Algorithm');

    /*
    * Computing the 3D trajectory
    * */
    console.time('3D trajectory Algorithm');
    const spatialObj = new spatialTrajectory3D({});
    spatialObj.maxIntTime(sensorData, sDTWObj);
    spatialObj.computeTrajectory(sensorData, gaitEventObj);
    console.timeEnd('3D trajectory Algorithm');

    console.time('Gait Events Algorithm');
    const gaitFeatures = new gaitEventFeatures();
    gaitFeatures.getFeatures(sensorData, spatialObj, gaitEventObj);
    console.timeEnd('Gait Events Algorithm');

    console.timeEnd('Overall Pipeline time = ');

    return gaitFeatures.strideLength;
}

// run();