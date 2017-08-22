// @flow
'use strict';

/**
 * @module Calibration
 * @author Prashant Chaudhari <prashant123219@gmail.com> 3/31/2017.
 * Functions for calibration of raw Data....
 */

import RNFetchBlob from 'react-native-fetch-blob';
const math = require('mathjs');
//const fs = require('fs');

/**
 * This function swaps the AccX and AccY axis of one sensor data required for calibration.
 * @param {Array<Array<number>>} array The sensor data
 * @returns {Array<Array<number>>}
 */
module.exports.changeAxis = function (array: Array<Array<number>>) {
    const temp = array[0];
    array[0] = array[1];
    array[1] = temp;
    array[2] = array[2].map(element => element * (-1));

    return array;
};

/**
 * This function inverts the AccX, AccZ, GyroX, GyroZ axis of one sensor data
 * @param {Array.<Array.<number>>} array The sensor data
 * @returns {Array<Array<number>>}
 */
module.exports.invertAxis = function (array: Array<Array<number>>) {

    array[0] = array[0].map(element => element * (-1));
    array[2] = array[2].map(element => element * (-1));
    array[3] = array[3].map(element => element * (-1));
    array[5] = array[5].map(element => element * (-1));

    return array;
};

/**
 * This function inverts AccZ, GyroX, GyroY axis of right sensor data ONLY
 * @param {Array.<Array.<number>>} array
 * @returns {Array.<Array.<number>>}
 */
module.exports.invertAxisRightOnly = function (array: Array<Array<number>>) {

    array[2] = array[2].map(element => element * (-1));
    array[3] = array[3].map(element => element * (-1));
    array[4] = array[4].map(element => element * (-1));

    return array;
};

export async function csv2Mat (fileName: string, tag: string) {
    //console.log('check the path for csv2Mat');
    //console.log(fileName);
    //const str = await RNFetchBlob.fs.readFile(fileName,'utf8').toString().split(/[, \r\n]+/);
    //console.log('check str');
    //console.log(str);
    if (tag === 'acc') {
        // eslint-disable-next-line no-sync
        //const str = fs.readFileSync(fileName).toString().split(/[, \r\n]+/);
        const str = RNFetchBlob.fs.readFile(fileName,'utf8').toString().split(/[, \r\n]+/);
        console.log('check str ACC');
        console.log(str);
        return {
            bias: math.matrix([ str[0], str[7], str[14] ]),
            rotation: math.matrix([str[1], str[2], str[3], str[8], str[9], str[10], str[15], str[16], str[17]]).reshape([3,3]),
            scaling: math.matrix([str[4], str[5], str[6], str[11], str[12], str[13], str[18], str[19], str[20]]).reshape([3,3])
        };
    } else {
        // eslint-disable-next-line no-sync
        const str = await RNFetchBlob.fs.readFile(fileName,'utf8').toString().split(/[, \r\n]+/);
        console.log('check strNOTACC');
        console.log(str);
        return {
            bias: math.matrix([ str[0], str[7], str[14] ]),
            rotation: math.matrix([str[1], str[2], str[3], str[8], str[9], str[10], str[15], str[16], str[17]]).reshape([3,3]),
            scaling: math.matrix([str[4], str[5], str[6], str[11], str[12], str[13], str[18], str[19], str[20]]).reshape([3,3])
        };
    }
}

/**
 * This function reads the calibration file(.csv) and converts to an object with bias, rotation and scaling parameters
 * @param fileName
 * @param tag
 * @returns {{bias: *, rotation: (Matrix|Array|*), scaling: (Matrix|Array|*)}}
 *//*
module.exports.csv2Mat = function (fileName: string, tag: string) {

    if (tag === 'acc') {
        // eslint-disable-next-line no-sync
        //const str = fs.readFileSync(fileName).toString().split(/[, \r\n]+/);
        //const str = RNFetchBlob.fs.readStream(fileName).toString().split(/[, \r\n]+/);
        return {
            bias: math.matrix([ str[0], str[7], str[14] ]),
            rotation: math.matrix([str[1], str[2], str[3], str[8], str[9], str[10], str[15], str[16], str[17]]).reshape([3,3]),
            scaling: math.matrix([str[4], str[5], str[6], str[11], str[12], str[13], str[18], str[19], str[20]]).reshape([3,3])
        };
    } else {
        // eslint-disable-next-line no-sync
        const str = fs.readFileSync(fileName).toString().split(/[, \r\n]+/);
        return {
            bias: math.matrix([ str[0], str[7], str[14] ]),
            rotation: math.matrix([str[1], str[2], str[3], str[8], str[9], str[10], str[15], str[16], str[17]]).reshape([3,3]),
            scaling: math.matrix([str[4], str[5], str[6], str[11], str[12], str[13], str[18], str[19], str[20]]).reshape([3,3])
        };
    }
};*/

/**
 * This function calibrates the raw sensor data
 * @param {Array.<Array.<number>>} array
 * @param acc
 * @param gyro
 * @returns {Array.<Array.<number>>}
 */
module.exports.calibrateRawData = function (
    array: Array<Array<number>>,
    acc: {bias: math.matrix<number>, rotation: math.matrix<number>, scaling: math.matrix<number>},
    gyro: {bias: math.matrix<number>, rotation: math.matrix<number>, scaling: math.matrix<number>}) {

    const accBias = acc.bias._data;
    const tempAccMul = math.multiply(math.inv(acc.rotation._data), math.inv(acc.scaling._data));

    const gyroBias = gyro.bias._data;
    const tempGyroMul = math.multiply(math.inv(gyro.rotation._data), math.inv(gyro.scaling._data));

    const final = [];
    const finalData = [ [], [], [], [], [], [] ];

    // Lopping through all the time points
    for (let j = 0; j < array[0].length; ++j) {
        const tempAcc = math.matrix([ array[0][j], array[1][j], array[2][j] ]);
        const t1 = math.subtract(tempAcc._data, accBias);
        const finalAcc = math.multiply(tempAccMul, t1);

        const tempGyro = math.matrix([ array[3][j], array[4][j], array[5][j] ]);
        const t2 = math.subtract(tempGyro._data, gyroBias);
        const finalGyro = math.multiply(tempGyroMul, t2);

        // Join calibrated acc and gyro data for current time point
        final[j] = math.concat(finalAcc.valueOf(), finalGyro.valueOf());


        // Pushing the calibrated data back into array format
        for (let i = 0; i < 6; ++i) {
            finalData[i].push(final[j][i]);
        }
    }
    return finalData;
};
