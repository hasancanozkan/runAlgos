//@flow
'use strict';

/**
 * Created by jalil on 3/25/2017.
 */

const xmlread = require('./xmlread.js');
const getHeader = require('./CompileHeader.js');
const reshape = require('./preprocess.js');
const SensorData = require('./SensorData.js');
const Label = require('./Label.js');


//TODO PROMPTING USER TO GET FOLDER NAME

/** Parse Session.xml File */
//module.exports.importData = function (folderName: string) {
export async function importData (folderName: string) { // I changed it to async but does not change
    // TODO: unused variable "headerTag"
    const [simpleTag, headerTag , TestList] = await xmlread.parseSessionXML_Egait(
        folderName + 'GA414031_2MIN/session.xml'
    );
    if (TestList.length === 0) {
        throw new Error('Error:No Finished Test in session.xml for Subject');
    }
    // Read in the data and convert the headers //
    const rawData = [], dataHeader = [];
    for (let iMote = 0; iMote < (Object.keys(TestList[0].MoteList).length); iMote++) {
        //Headers
        dataHeader[iMote] = getHeader.CompileHeader(TestList[0].MoteList[iMote]);
        //data
        const fileName = (folderName + 'GA414031_2MIN/' + TestList[0].MoteList[iMote].File);
        switch (dataHeader[iMote].SensorType) {
            //TODO : getRawData is based upon Chunksize, Chunksize: unint16 or int16
            //TODO : make code small
            case 'SH2':
                rawData[iMote] = reshape.getRawData(fileName, 6);
                break;
            case 'SH2R':
                rawData[iMote] = reshape.getRawData(fileName, 6);
                break;
            case 'SH3':
                rawData[iMote] = reshape.getRawData(fileName, 6);
                break;
            default:
                throw new Error('Currently egait import is only supported for sh2r andsh3 sensor types');
        }
    }
    // Build up the GaitData
    console.log('importData 6');
    const data = new SensorData();
    SensorData.setMetadata(data, simpleTag);
    SensorData.setData(data,dataHeader, rawData);

    for (let iTest = 0; iTest < TestList.length; ++iTest) {
        const Name = TestList[0].TestName;
        for (let iSensor = 0; iSensor < rawData.length; ++iSensor) {
            const startSample = Number(TestList[iTest].MoteList[iSensor].Start);
            const stopSample = Number(TestList[iTest].MoteList[iSensor].Stop);
            const label = new Label(Name, startSample, stopSample - startSample);
            SensorData.addLabel(data,iSensor, label);
        }
    }
    return data;
};
console.log('importData 7');
module.exports.importDataValidation = function (fileNameLeft: string, fileNameRight: string) {
    const rawData = [];
    const files = [fileNameLeft, fileNameRight];
    const sensorPos = ['LeftFoot', 'RightFoot'];

    const dataHeader = new Array(2);

    for (let iMote = 0; iMote < 2; iMote++) {
        const fileName = files[iMote];
        dataHeader[iMote] = {
            SensorPosition: sensorPos[iMote],
            SamplingRate: 102.4,
            RangeAcc: 6.0,
            RangeGyr: 500,
            RangeAccUnits: 'g',
            RangeGyrUnits: 'A/sec',
            DataLegend: ['AccX', 'AccY', 'AccZ', 'GyrX', 'GyrY', 'GyrZ']
        };

        rawData[iMote] = reshape.getRawData('../data/dataset/ValidationRawData/' + fileName, 6);
    }
    console.log('importData 8');
    const data = new SensorData();
    SensorData.setData(data, dataHeader, rawData);
    //console.log('importData 9');
    return data;

};
//console.log('importData 8');
