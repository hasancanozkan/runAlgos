// @flow
'use strict';

/**
 * Created by jalil on 3/24/2017.
 */

//const fs = require('fs');
import RNFetchBlob from 'react-native-fetch-blob';
const xml2js = require('react-native-xml2js');
//module.exports.parseSessionXML_Egait = function (folderName: string) {
export async function parseSessionXML_Egait(folderName: string) {
    let simpleTag;
    let headerTag;
    let testListNodes;
    const newTest = [];
    const sensor = [];
    const channel = [];
    const size = [];
    const parser = new xml2js.Parser();
    // eslint-disable-next-line no-sync
    let data;
    try{
        data = await RNFetchBlob.fs.readFile(folderName,'utf8');
        //console.log('data is :');
        //console.log(data);
    }
    catch (err){
        console.log('error is :');
        console.log(err);
    }
    parser.parseString(data, (err, result) => {
        simpleTag = {
            PersonId: result.Session.PersonId[0],
            SessionId: result.Session.SessionId[0],
            StartTime: result.Session.Start[0],
            StopTime: result.Session.Stop[0],
            Instructor: result.Session.Instructor[0],
            GaitRecorderVersion: result.Session.GaitRecorderVersion[0],
            UploadComplete: result.Session.UploadComplete[0],
            Comment: result.Session.Comment[0]
        };
        for (let i = 0; i < result.Session.Header[0].Column.length; i++) {
            sensor[i] = result.Session.Header[0].Column[i].Sensor[0];
            channel[i] = result.Session.Header[0].Column[i].Channel[0];
            size[i] = result.Session.Header[0].Column[i].Size[0];
        }
        headerTag = {sensor: sensor, channel: channel, size: size};
        testListNodes = result.Session.TestList;
        for (let i = 0; i < testListNodes.length; i++) {
            newTest[i] = {
                TestName: result.Session.TestList[i].Test[i].Name[0],
                ShortDescription: result.Session.TestList[i].Test[i].ShortDescription[0],
                Description: result.Session.TestList[i].Test[i].Description[0],
                Video: result.Session.TestList[i].Test[i].Video[0],
                CountdownTime: result.Session.TestList[i].Test[i].CountdownTime[0],
                AddInfo: result.Session.TestList[i].Test[i].AdditionalInfo[0],
                Finished: result.Session.TestList[i].Test[i].Finished[0],
                TestComment: result.Session.TestList[i].Test[i].Comment[0],
                Duration: result.Session.TestList[i].Test[i].Duration[0],
                MoteList: {}
            };
            if (newTest[i].Finished === 'true') {
                for (let j = 0; j < 2; ++j) {
                    const mote = {
                        Position: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].Position[0],
                        BluetoothMac: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].BluetoothMac[0],
                        SamplingRate: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].SamplingRate[0],
                        Sensitivity: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].Sensitivity[0],
                        Type: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].Type[0],
                        File: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].File[0],
                        DBFileId: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].DBFileId[0],
                        Start: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].Tag[0].Start[0],
                        Stop: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].Tag[0].Stop[0],
                        EvalutionParameterList: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].EvaluationParameterList[0]
                    };
                    if (mote.Position === 'LeftFoot') {
                        newTest[i].MoteList[0] = mote;
                    }
                    if (mote.Position === 'RightFoot') {
                        newTest[i].MoteList[1] = mote;
                    }
                }
            }
        }
    });
    return [simpleTag, headerTag, newTest];
};
/*
module.exports.parseSessionXML_Egait = function (folderName: string) {

    let simpleTag;
    let headerTag;
    let testListNodes;
    const newTest = [];
    const sensor = [];
    const channel = [];
    const size = [];
    const parser = new xml2js.Parser();
    // eslint-disable-next-line no-sync
    const data = fs.readFileSync(folderName).toString();

    parser.parseString(data, (err, result) => {
        simpleTag = {
            PersonId: result.Session.PersonId[0],
            SessionId: result.Session.SessionId[0],
            StartTime: result.Session.Start[0],
            StopTime: result.Session.Stop[0],
            Instructor: result.Session.Instructor[0],
            GaitRecorderVersion: result.Session.GaitRecorderVersion[0],
            UploadComplete: result.Session.UploadComplete[0],
            Comment: result.Session.Comment[0]
        };
        for (let i = 0; i < result.Session.Header[0].Column.length; i++) {
            sensor[i] = result.Session.Header[0].Column[i].Sensor[0];
            channel[i] = result.Session.Header[0].Column[i].Channel[0];
            size[i] = result.Session.Header[0].Column[i].Size[0];
        }
        headerTag = {sensor: sensor, channel: channel, size: size};
        testListNodes = result.Session.TestList;
        for (let i = 0; i < testListNodes.length; i++) {
            newTest[i] = {
                TestName: result.Session.TestList[i].Test[i].Name[0],
                ShortDescription: result.Session.TestList[i].Test[i].ShortDescription[0],
                Description: result.Session.TestList[i].Test[i].Description[0],
                Video: result.Session.TestList[i].Test[i].Video[0],
                CountdownTime: result.Session.TestList[i].Test[i].CountdownTime[0],
                AddInfo: result.Session.TestList[i].Test[i].AdditionalInfo[0],
                Finished: result.Session.TestList[i].Test[i].Finished[0],
                TestComment: result.Session.TestList[i].Test[i].Comment[0],
                Duration: result.Session.TestList[i].Test[i].Duration[0],
                MoteList: {}
            };

            if (newTest[i].Finished === 'true') {
                for (let j = 0; j < 2; ++j) {
                    const mote = {
                        Position: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].Position[0],
                        BluetoothMac: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].BluetoothMac[0],
                        SamplingRate: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].SamplingRate[0],
                        Sensitivity: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].Sensitivity[0],
                        Type: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].Type[0],
                        File: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].File[0],
                        DBFileId: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].DBFileId[0],
                        Start: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].Tag[0].Start[0],
                        Stop: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].Tag[0].Stop[0],
                        EvalutionParameterList: result.Session.TestList[i].Test[i].MoteList[i].Mote[j].EvaluationParameterList[0]
                    };
                    if (mote.Position === 'LeftFoot') {
                        newTest[i].MoteList[0] = mote;
                    }
                    if (mote.Position === 'RightFoot') {
                        newTest[i].MoteList[1] = mote;
                    }
                }
            }
        }

    });

    return [simpleTag, headerTag, newTest];
};
*/