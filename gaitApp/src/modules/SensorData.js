// @flow
'use strict';

/**
 * Created by jalil on 5/27/2017.
 * Class Definition of the SensorData, Basic datatype of any kind of SensorData.
 * SensorData returns, metainfo, dataHeader, data and labelList.Filled and handled while importing
 */

const Label = require('./Label.js');

class SensorData {
    //Properties
    metainfo: {
        PersonId: string,
        SessionId: string,
        StartTime: string,
        StopTime: string,
        Instructor: string,
        GaitRecorderVersion: number,
        UploadComplete: string,
        Comment: string
      };
    dataHeader: Array<{
        SensorPosition: string,
        BluetoothMac: string,
        SensorType: string,
        SamplingRate: number,
        RangeAcc: number,
        RangeGyr: number,
        RangeAccUnits: string,
        RangeGyrUnits: string,
        DataLegend: Array<string>,
    }>;

    data: Array<Array<Array<number>>>;
    labelList: Array<Label>;
    data: Array<Array<Array<number>>>;
    calibrationFileAcc: Array<number>;
    calibrationFileGyro: Array<number>;

    constructor () {
        this.metainfo = {};
        this.dataHeader = [];
        this.data = [];
        this.labelList = [];
        this.calibrationFileAcc = [];
        this.calibrationFileGyro = [];
    }

    // Methods
    static setMetadata (SensorDataobj: Object, metainfo: Object) {
        if (typeof (metainfo) === 'object') {
            SensorDataobj.metainfo = metainfo;
        } else {
            throw new Error('Error@SensorData:setMetadata : Metadata has to be object');
        }
    }

    static setData (SensorDataobj: Object, dataHeader: Array<Object>, data: Array<Array<Array<number>>>) {
        if (dataHeader.length !== data.length) {
            throw new Error('Error@SensorData:setData, Not every entry in the data has a header');
        }
        SensorDataobj.dataHeader = dataHeader;
        SensorDataobj.data = data;
        if (SensorDataobj.labelList.length === 0) {
            SensorDataobj.labelList = new Array(data.length);
        }
    }

    static addLabel (SensorDataobj: Object,iSensor: number, label: Label) {
        if (label instanceof Label !== true) {
            throw new Error('Error@SensorData:addLabel, Label given not of type Label');
        } else if (SensorDataobj.labelList.length === 0) {
            throw new Error(
                'Error@SensorData:addLabel,first have to set the data beforestart adding labels');
        }
        SensorDataobj.labelList[iSensor] = [SensorDataobj.labelList[iSensor], label];
    }

    static getNumDataSets (SensorDataobj: Object) {
        return SensorDataobj.data.length;
    }

    static getAllPositions (SensorDataobj: Object) {
        const positions = new Array(SensorDataobj.data.length);
        for (let iSets = 0; iSets < SensorDataobj.data.length; ++iSets) {
            positions[iSets] = SensorDataobj.dataHeader[iSets].SensorPosition;
        }
        return positions;
    }

    static getAllAxes (SensorDataobj: Object, position: string) {
        //position must be a string, either 'LeftFoot', or 'RightFoot';
        const positions = SensorData.getAllPositions(SensorDataobj);
        if (positions.includes(position)) {
            const iPos = SensorData.getSensorPositionIndex(SensorDataobj, position);
            return SensorDataobj.dataHeader[iPos].DataLegend;
        }
    }

    static getSensorPositionIndex (SensorDataobj: Object, position: string) {
        //Position should be in string, 'LeftFoot'.
        const positions = SensorData.getAllPositions(SensorDataobj);
        if (positions.includes(position)) {
            return positions.indexOf(position);
        }
    }

    static getSensorPosition (SensorDataobj: Object, idx: number) {
        const allIdx = new Array(SensorData.getNumDataSets(SensorDataobj)).fill()
        .map((x, i) => i);
        if (allIdx.includes(idx)) {
            return SensorDataobj.dataHeader[idx].SensorPosition;
        }
    }

    static getAxesIndex (SensorDataobj: Object, position: string, selectAxes: string) {
        const positions = SensorData.getAllPositions(SensorDataobj);
        if (positions.includes(position)) {
            const axes = SensorData.getAllAxes(SensorDataobj, position);
            if (axes) {
                return axes.indexOf(selectAxes);
            }
        }
    }

    static getData (SensorDataobj: Object, position: string) {
        let iPos = 0;
        if (SensorData.getAllPositions(SensorDataobj).includes(position)) {
            iPos = SensorData.getSensorPositionIndex(SensorDataobj, position);
        }
        return SensorDataobj.data[iPos];
    }

    static getAxesData (SensorDataobj: Object, idx: number, Axes: string) {
        if (Axes === 'Acc') {
            return SensorDataobj.data[idx].slice(0, 3);
        } else if (Axes === 'Gyr') {
            return SensorDataobj.data[idx].slice(3, 6);
        }
    }
}

module.exports = SensorData;

