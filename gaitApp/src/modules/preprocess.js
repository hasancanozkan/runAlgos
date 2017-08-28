// @flow
'use strict';

//const fs = require('fs');
import RNFetchBlob from 'react-native-fetch-blob';
const base64 = require('base-64');

const base64ToUInt16 = function (base64D) {
    // Decoding the base64 data
    // both atob and decode gives same result but atob works on browser and only debug mode, therefore I prefer this
    const binary_string = base64.decode(base64D);
    const len = binary_string.length;

    let uInt16D = [];
    let hexValue = [];
    // let uInt16D = new Uint16Array(len);

    /*
    * Parsing the 16 bit hex into Int
    * Here I know it should be little endian, hence first (i+1) + (i)
    * */
    for (let i = 0, j = 0; i < len; i+=2, ++j) {

        /*
        * The problem is here, for ex
        * if byte1 = '71' and byte2 = '0'
        * in string concat only '71' is registered, but it should be '710'
        * Resolved this problem using the if condition below
        * */
        const byte1 = binary_string.charCodeAt(i+1).toString(16);
        const byte2 = binary_string.charCodeAt(i).toString(16);
        hexValue[j] = byte1.concat(byte2);

        /*
        ********** Debugging **********
        * Trying to pad a 0 if only one byte is registered in hexValue
        * However, still some hexadecimal values are incorrect
        * Ex: '0' + '1c' = 28 but I cross checked with Matlab and it should be '6' + 'D6' = 1750
        * ^ this case still remains even if the following condition is not set*/
        if (hexValue[j].length === 2) {
            hexValue[j] = hexValue[j].padEnd(3, 0);
        }

        uInt16D[j] = parseInt(hexValue[j], 16);
    }

    return uInt16D;
};

export async function getRawData(fileName: string) {

    let base64Data = await RNFetchBlob.fs.readFile(fileName, 'base64');
    const uInt16Data = base64ToUInt16(base64Data);

    let pos = [];

    /*
    * ********** Debugging **********
    * An array to find the position where the values are less than 500 (ideally no value should be less than 500)
    * Found 38 for left foot data and 44 for right foot data
    * */
    for (let i = 0; i < uInt16Data.length; ++i) {
        if (uInt16Data[i] < 500) {
            pos.push(i);
        }
    }

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