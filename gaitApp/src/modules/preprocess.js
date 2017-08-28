// @flow
'use strict';

//const fs = require('fs');
import RNFetchBlob from 'react-native-fetch-blob';
const base64 = require('base-64');

const base64ToUInt16 = function (base64D) {
    // Decoding the base64 data
    const binary_string = base64.decode(base64D); // both atob and decode gives same result but atob works on browser and only debug mode, therefore I prefer this
    const len = binary_string.length;

    // let uInt16D = [];
    let hexValue = [];
     let uInt16D = new Uint16Array(len);
    /*
    * Parsing the 16 bit hex into Int
    * Here I know it should be little endian, hence first (i+1) + (i)*/
    for (let i = 0, j = 0; i < len; i+=2, ++j) {

        /*
        * The problem is here, for ex
        * if byte1 = '71' and byte2 = '0'
        * in string concat only '71' is registered, but it should be '710'
        * */
        const byte1 = binary_string.charCodeAt(i+1).toString(16);
        const byte2 = binary_string.charCodeAt(i).toString(16);
        hexValue[j] = byte1.concat(byte2);

        uInt16D[j] = parseInt(hexValue[j], 16);
    }
    console.log(hexValue);
    console.log(uInt16D);
    return uInt16D;
};

export async function getRawData(fileName: string) {

    let base64Data = await RNFetchBlob.fs.readFile(fileName, 'base64');
    const uInt16Data = base64ToUInt16(base64Data);

    let pos = [];
    // An array to find the postion where the values r less than 500 for debugging
    for (let i = 0; i < uInt16Data.length; ++i) {
        if (uInt16Data[i] < 500) {
            pos.push(i);
        }
    }
    console.log(pos);

    let rawData = [[], [], [], [], [], []];

    // Re-arranging the Data in the required form of [ AccX, AccY, AccZ, GyroX, GyroY, GyroZ ]
    for (let i = 0; i < uInt16Data.length; i+=6) {
        rawData[0].push(uInt16Data[i]);
        rawData[1].push(uInt16Data[i+1]);
        rawData[2].push(uInt16Data[i+2]);
        rawData[3].push(uInt16Data[i+3]);
        rawData[4].push(uInt16Data[i+4]);
        rawData[5].push(uInt16Data[i+5]);
    }

    return rawData;
}