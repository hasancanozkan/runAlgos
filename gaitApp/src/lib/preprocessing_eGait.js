// @flow
'use strict';

/**
 * Created by Lukas Forster on 08.05.2017.
 * This module comprises of three modules, namely calibrate.js, filter.js and
 * preprocess.js, written by Prashant Chaudhari which can be found at
 * https://github.com/jalilahmed/myApp/tree/master/lib. These modules provide several functions
 * used in the preprocessing step of the pipeline for data evaluation.
 *
 * Several adaptions were made to the original code:
 *  - removed never used requirements
 *  - changed overall export-structure from module.exports = {...}; to
 *    module.exports.FUNCTIONNAME = function (...) {...};
 *  - changed internal functions of map from function(params) {...} to (params) => {...}
 *  - exchanged var for let and const
 *  - defined some variables outside of the loops in which they were used instead of inside
 *    these loops (even though, one could be even more strict at this point)
 *  - general reformation
 *  - changed from synchronous file reading to asynchronous file reading using Promises
 */

const math = require('mathjs');
const fs = require('fs');

// ToDo Update function description and add furhter comments!
// Since there is close to no documentation so far. Maybe a job for Jalil and Prashant since
// they should know what the algorithms are supposed to do better than I do right now.

module.exports.change_axis = function (array: Array<Array<number>>) {
    const temp = array[0];
    array[0] = array[1];
    array[1] = temp;

    // Hard coded sign change for AccZ
    array[2] = array[2].map(element => {
        return element * (-1);
    });


    return array;
};


module.exports.invert_axis = function (array: Array<Array<number>>) {

    // Hard coded as of now, needs a better logic

    // AccX
    array[0] = array[0].map(element => {
        return element * (-1);
    });

    // AccZ
    array[2] = array[2].map(element => {
        return element * (-1);
    });

    // GyroX
    array[3] = array[3].map(element => {
        return element * (-1);
    });

    // GyroZ
    array[5] = array[5].map(element => {
        return element * (-1);
    });

    return array;
};


module.exports.invert_axis_rightOnly = function (array: Array<Array<number>>) {

    array[2] = array[2].map(element => {
        return element * (-1);
    });

    array[3] = array[3].map(element => {
        return element * (-1);
    });

    array[4] = array[4].map(element => {
        return element * (-1);
    });

    return array;
};


// Reading the calibration data Asyncronously
module.exports.csv2Mat = function (fileName: string, tag: string) {
    return new Promise((resolve, reject) => {
        if (tag === 'acc') {
            fs.readFile(fileName, (err, content) => {
                if (err) {
                    reject(err);
                }
                const str = content.toString().split(/[, \r\n]+/);

                const calibAcc = {
                    bias: math.matrix([str[0], str[7], str[14]]),
                    rotation: math.matrix([
                        str[1],
                        str[2],
                        str[3],
                        str[8],
                        str[9],
                        str[10],
                        str[15],
                        str[16],
                        str[17]]
                    ).reshape([3, 3]),
                    scaling: math.matrix([
                        str[4],
                        str[5],
                        str[6],
                        str[11],
                        str[12],
                        str[13],
                        str[18],
                        str[19],
                        str[20]]
                    ).reshape([3, 3])
                };
                resolve(calibAcc);
            });
        } else {
            fs.readFile(fileName, (err, content) => {
                if (err) {
                    reject(err);
                }
                const str = content.toString().split(/[, \r\n]+/);

                const calibGyro = {
                    bias: math.matrix([str[0], str[7], str[14]]),
                    rotation: math.matrix([
                        str[1],
                        str[2],
                        str[3],
                        str[8],
                        str[9],
                        str[10],
                        str[15],
                        str[16],
                        str[17]
                    ]).reshape([3, 3]),
                    scaling: math.matrix([
                        str[4],
                        str[5],
                        str[6],
                        str[11],
                        str[12],
                        str[13],
                        str[18],
                        str[19],
                        str[20]
                    ]).reshape([3, 3])
                };
                resolve(calibGyro);

            });
        }
    });
};


module.exports.calib_rawData = function (
    array: Array<Array<number>>,
    acc: {bias: math.matrix<number>, rotation: math.matrix<number>, scaling: math.matrix<number>},
    gyro: {bias: math.matrix<number>, rotation: math.matrix<number>, scaling: math.matrix<number>}) {
    // var acc_mat = math.matrix()
    const accB = acc.bias._data;
    const accInvR = math.inv(acc.rotation._data);
    const accInvS = math.inv(acc.scaling._data);
    const accTempMul = math.multiply(accInvR, accInvS);

    const gyroB = gyro.bias._data;
    const gyroInvR = math.inv(gyro.rotation._data);
    const gyroInvS = math.inv(gyro.scaling._data);
    const gyroTempMul = math.multiply(gyroInvR, gyroInvS);
    // var acc_calib_final_data = math.matrix();
    // var gyro_calib_final_data = math.matrix();
    const final = [];
    const data = [[], [], [], [], [], []];
    let accTemp;
    let temp;
    let accCalibFinalData;
    let gyroTemp;
    let gyroCalibFinalData;

    // Lopping through all the time points
    for (let j = 0; j < array[0].length; ++j) {

        // [araw(t) - b] ---> Equation 2
        accTemp = math.matrix([array[0][j], array[1][j], array[2][j]]);
        temp = math.subtract(accTemp._data, accB);

        // acal(t) = Rinv * Sinv * (araw(t) - b) ---> Equation 2
        accCalibFinalData = math.multiply(accTempMul, temp);

        gyroTemp = math.matrix([array[3][j], array[4][j], array[5][j]]);
        temp = math.subtract(gyroTemp._data, gyroB);
        gyroCalibFinalData = math.multiply(gyroTempMul, temp);
        final[j] = math.concat(accCalibFinalData.valueOf(), gyroCalibFinalData.valueOf());


        // Pushing the calibrated data back into array format
        for (let i = 0; i < 6; ++i) {
            data[i].push(final[j][i]);
        }
    }
    return data;
};


// Get raw Data and seperate coulmn-wise
module.exports.getRawData = function (fileName: string, chunkSize: number) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, x) => {
            if (err) {
                reject(err);
            } else {
                const arr = [];

                // Setting no-assert 'true' to allows offset to be beyond the end of buf
                for (let i = 0, j = 0; i < x.length; i += 2) {
                    arr[j] = x.readUInt16LE(i, true);
                    ++j;
                }

                // Aligning [ AccX, AccY, AccZ, GyroX, GyroY, GyroZ from arr]
                const R = [];

                for (let i = 0, len = arr.length; i < len; i += chunkSize) {
                    R.push(arr.slice(i, i + chunkSize));
                }

                // Rearranging the data
                const finalArray = new Array(6);
                // final_array.length = 6;
                for (let j = 0; j < 6; ++j) {
                    finalArray[j] = new Array(R.length);

                    for (let i = 0; i < R.length; ++i) {
                        finalArray[j][i] = R[i][j];
                    }
                }

                resolve(finalArray);
            }
        });
    });
};

module.exports.getFilteredData = function (data: Array<Array<number>>) {

    // var b = [0.2, 0.2, 0.2];
    // var a = 1;
    // Hence window size is 5
    const filteredData = new Array(6);

    // Looping through all the 6 channels (Accx, AccY, AccZ, GyroX, GyroY, GyroZ)
    for (let i = 0; i < 6; ++i) {
        filteredData[i] = new Array(data[0].length);

        // Assigning values for first 2 positions to avoid undefined error in the next for loop
        filteredData[i][0] = data[i][0] / 5;
        filteredData[i][1] = (data[i][1] + data[i][0]) / 5;

        // Looping through all the time points and performing moving averaging filter of window
        // size 5
        for (let j = 2; j < data[0].length; ++j) {
            filteredData[i][j] = (1 / 5) * (data[i][j] + data[i][j - 1] + data[i][j - 2]);
        }
    }

    return filteredData;
};
