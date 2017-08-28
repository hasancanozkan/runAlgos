//@flow
'use strict';

/**
 * Created by jalil on 3/25/2017.
 */

const xmlread = require('./xmlread.js');
const getHeader = require('./CompileHeader.js');
const preprocess = require('./preprocess.js');
const SensorData = require('./SensorData.js');
const Label = require('./Label.js');

/*
* Parse Session.xml File
* */
export async function importData (folderName: string) {
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

            case 'SH2':
                rawData[iMote] = await preprocess.getRawData(fileName);
                break;
            case 'SH2R':
                rawData[iMote] = await preprocess.getRawData(fileName);
                break;
            case 'SH3':
                rawData[iMote] = await preprocess.getRawData(fileName);
                break;
            default:
                throw new Error('Currently egait import is only supported for sh2r andsh3 sensor types');
        }
    }
    //console.log('RawData');
    //console.log(rawData[0]);
    // Build up the GaitData
    const data = new SensorData();
    SensorData.setMetadata(data, simpleTag);
    SensorData.setData(data, dataHeader, rawData);

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
}

