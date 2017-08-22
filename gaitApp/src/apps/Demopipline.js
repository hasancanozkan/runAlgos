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
//const fs = require('fs');
/*
 * Reading SensorData and Creating SensorData Obj
 * */
console.log('demopipeline 1');
//const sensorData = eGaitData.importData('../data/TestData/');
let sensorData;

// to run the code, created a run function
const run = async function(){
    console.log('demopipeline 2');
    /*
* Evaluating the gait features from the spatial information of all strides
* */
    //const gaitFeatures = new gaitEventFeatures();
    sensorData = await eGaitData.importData('/storage/emulated/0/Documents/data/TestData/');
    console.log('SensorData.data')
    console.log(SensorData.data);
    //gaitFeatures.getFeatures(sensorData, spatialObj, gaitEventObj);
    /*
 * Creating Calibration File
 * *//*
    console.log('demopipeline 3');
    const calibrationFiles = [
        {
            foot: 'LeftFoot',
            Acc: calibrate.csv2Mat('/storage/emulated/0/Documents/data/dataset/B4F4_acc_left.csv','acc'), // WHAT IS csv2MAT
            Gyr: calibrate.csv2Mat('/storage/emulated/0/Documents/data/dataset/B4F4_gyro_left.csv','gyro')
        },
        {
            foot: 'RightFoot',
            Acc: calibrate.csv2Mat('/storage/emulated/0/Documents/data/dataset/B4F0_acc_right.csv','acc'),
            Gyr: calibrate.csv2Mat('/storage/emulated/0/Documents/data/dataset/B4F0_gyro_right.csv','gyro')
        }
    ];

    const calibratedData = [];
    const calibratedFinalData = [];
    const calibFilteredFinalData = [];
    console.log('demopipeline 4');*/
    /*
* Calibrating the sensor data
* Filtering the calibrated sensor data for sDTW()
* *//*
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
    });*/
    // calibrated data can be  checked now
    //console.log('demopipeline 5');
    /*
* Setting the sensor data object with calibrated data
* *//*
    SensorData.setData(sensorData, sensorData.dataHeader, calibratedFinalData);

    const normalizedSensorData = [];
    const sDTWObj = [];
    const tem = math.transpose(hardCoded.template());
    const template = math.transpose(math.matrix([tem._data[4],tem._data[5]]));
    const gaitEventObj = [];
    console.log('demopipeline 6');*/
    /*
* Evaluating the Strides with Subsequent Dynamic Time Warping algorithm
* *//*
    sensorData.data.forEach((v,i) => {
        normalizedSensorData[i] = math.matrix([math.divide(calibFilteredFinalData[i][4], 500), math.divide(calibFilteredFinalData[i][5], 500)]);
        const temp = new sDTW();
        temp.result(math.transpose(normalizedSensorData[i]), template,35);
        sDTWObj.push(temp);
    });
    // dont check here because values are unreadable big matrices therefore go next part
    console.log('demopipeline 7');*/
    /*
* Evaluating the Gait Events from the strides
* *//*
    sensorData.data.forEach((v,i) => {
        const temp = new gaitEvents();
        const labelListStrides = sDTWObj[i].labelList;
        temp.getGaitEventResults(sensorData, labelListStrides, i);
        gaitEventObj.push(temp);
    });*/
    //labelListStrides console yapabilirsin
    //console.log('demopipeline 8');
    /*
* Computing the 3D trajectory
* *//*
    const spatialObj = new spatialTrajectory3D({});
    spatialObj.maxIntTime(sensorData, sDTWObj);
    spatialObj.computeTrajectory(sensorData, gaitEventObj);


    console.log('demopipeline 9');
    //console.log(gaitFeatures.strideLength[0]);
    const gaitFeatures = new gaitEventFeatures();
    gaitFeatures.getFeatures(sensorData, spatialObj, gaitEventObj);*/
    //return gaitFeatures.strideLength[0];
}
run();