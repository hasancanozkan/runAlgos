// @flow
'use strict';

//const fs = require('fs');
import RNFetchBlob from 'react-native-fetch-blob';

export async function getRawData(fileName: string, chunkSize: number) {
    // Get raw Data and seperate coulmn-wise
    // eslint-disable-next-line no-sync
    //const x = fs.readFileSync(fileName);
    //console.log('filename');
    //console.log(fileName)
    const x = await RNFetchBlob.fs.readStream(fileName,'ascii')
        /*.then((stream) => {
            let data = '';
            stream.open();
            stream.onData((chunk) => {
                //const buffer = new ArrayBuffer(chunk.length);
                const Uint16View = new Uint16Array(chunk);
                console.log(Uint16View.length);
            });

            stream.onEnd(() => {
                //console.log('Unint16');
                //console.log();
            })
        })*/
    x.open();
    x.onData((chunk) =>{
        const Uint16View = new Uint16Array(chunk);
        //console.log(Uint16View);
    });
    x.onEnd();


    const arr = [];
    const bool = true;

    // Setting no-assert 'true' to allows offset to be beyond the end of buf
    for (let i = 0, j = 0; i < x.length; i += 2) {
        arr[j] = x.readUInt16LE(i, bool);
        ++j;
    }

    // Aligning [ AccX, AccY, AccZ, GyroX, GyroY, GyroZ from arr]
    const R = [];

    for (let i = 0, len = arr.length; i < len; i += chunkSize) {
        R.push(arr.slice(i, i + chunkSize));
    }

    // Rearranging the data
    const finalArray = new Array(6);
    for (let j = 0; j < 6; ++j) {
        finalArray[j] = new Array(R.length);
        for (let i = 0; i < R.length; ++i) {
            finalArray[j][i] = R[i][j];
        }
    }

    return finalArray;
}
/*
module.exports.getRawData = function (fileName: string, chunkSize: number) {
    // Get raw Data and seperate coulmn-wise
    // eslint-disable-next-line no-sync
    const x = fs.readFileSync(fileName);
    const arr = [];
    const bool = true;

    // Setting no-assert 'true' to allows offset to be beyond the end of buf
    for (let i = 0, j = 0; i < x.length; i += 2) {
        arr[j] = x.readUInt16LE(i, bool);
        ++j;
    }

    // Aligning [ AccX, AccY, AccZ, GyroX, GyroY, GyroZ from arr]
    const R = [];

    for (let i = 0, len = arr.length; i < len; i += chunkSize) {
        R.push(arr.slice(i, i + chunkSize));
    }

    // Rearranging the data
    const finalArray = new Array(6);
    for (let j = 0; j < 6; ++j) {
        finalArray[j] = new Array(R.length);
        for (let i = 0; i < R.length; ++i) {
            finalArray[j][i] = R[i][j];
        }
    }

    return finalArray;
};
*/