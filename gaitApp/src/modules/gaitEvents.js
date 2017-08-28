// @flow
'use strict';

const computeLabels = require('./computeLabels.js');

class gaitEvents {
    TOLabels: Array<{name: string, start: number, length: number}>;
    HSLabels: Array<{name: string, start: number, length: number}>;
    MSLabels: Array<{name: string, start: number, length: number}>;
    strideSequences: Array<{name: string, start: number, length: number}>;
    samplingRate: number;
    constructor () {
        this.TOLabels = [];
        this.HSLabels = [];
        this.MSLabels = [];
        this.strideSequences = [];
        this.samplingRate = 0;
    }

    //  Here @params{foot} represents the number for foot, 0: left & 1: right
    getGaitEventResults (
        sensorData: Object,
        labelListSteps: Array<Object>,
        foot: number) {


        /* cluster the stride labels to stride sequences
        form is [ ['Sequence 1', start, length], ['Seq 2', start, length], ...., ['Sequence 5', start, length] ]
        */
        this.strideSequences = computeLabels.clusterLabelList(labelListSteps);

        // Get the Gyroscope Data from sensorData
        const gyrSignalSession = [ sensorData.data[foot][3], sensorData.data[foot][4], sensorData.data[foot][5] ];
        const samplingRate = sensorData.dataHeader[foot].SamplingRate;
        const windowHS = 0.05 * samplingRate;
        const windowMS = 0.14 * samplingRate;
        const overlapMS = 0.5 * windowMS;
        this.samplingRate = samplingRate;

        /*
        * Computing event labels per stride
        *
        * Loop should go until labelListSteps.length
        * */

        for (let i = 0; i < labelListSteps.length; ++i) {
            const start = labelListSteps[i][1];
            const stop = start + labelListSteps[i][2];

            // Compiling Signals needed for event detection
            const gyrZSignal = sensorData.data[foot][5].slice(start, stop + 1);
            const accXSignal = sensorData.data[foot][0].slice(start, stop + 1);

            // This requires sampling rate of left or right foot
            this.TOLabels[i] = computeLabels.getToeOff(gyrZSignal, start, i);
            this.HSLabels[i] = computeLabels.getHeelStrike(gyrZSignal, accXSignal, windowHS, start, i);
            this.MSLabels[i] = computeLabels.getMidStance(gyrSignalSession, windowMS, overlapMS, start, stop, i);
        }
    }
}

module.exports = gaitEvents;
