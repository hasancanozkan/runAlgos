// @flow
'use strict';

/**
 * Created by jalil on 6/1/2017.
 * spatialTrajectory3D object. Calculates acceletration, velocity and distance of each stride.*/
const math = require('mathjs');
const functions = require('./spatialFunctions.js');
const SensorData = require('./SensorData.js');
//const sDTW = require('./sDTW.js');

class spatialTrajectory3D {
    //Constructor
    sensorData: SensorData;
    DebugPlots: boolean;
    orientationMethod: string;
    integrationMethod: string;
    assumeLevelGround: number;
    orientationMethodinactiveMask: string;
    groundVel: number;
    q: Array<Array<Array<Array<number>>>>;
    a: Array<Array<Array<number>>>;
    v: Array<Array<Array<number>>>;
    s: Array<Array<Array<number>>>;
    currentSensor: number;
    accChannels: Array<Array<number>>;
    segmentStart: Array<Array<number>>;
    orientationMethodfilterActive: string;
    maxIntegrationTime: number;
    gravityDirection: Array<number>;
    forwardDirection: Array<Array<number>>;
    constructor (...args: *) {
        if (args[0].hasOwnProperty('sensorData')) {
            this.sensorData = args[0].sensorData;
        } else {
            this.sensorData = new SensorData();
        }
        if (args[0].hasOwnProperty('DebugPlots')) {
            this.DebugPlots = args[0].DebugPlots;
        } else {
            this.DebugPlots = false;
        }
        if (args[0].hasOwnProperty('Method_OE')) {
            this.orientationMethod = args[0].Method_OE;
        } else {
            this.orientationMethod = 'GyrDI';
        }
        if (args[0].hasOwnProperty('Method_Int')) {
            this.integrationMethod = args[0].Method_Int;
        } else {
            this.integrationMethod = 'FixedPlateau';
        }
        if (args[0].hasOwnProperty('AssumeLevelGround')) {
            this.assumeLevelGround = args[0].AssumeLevelGround;
        } else {
            this.assumeLevelGround = 0;
        }
        if (args[0].hasOwnProperty('OE_InactiveFilterMask')) {
            this.orientationMethodinactiveMask = args[0].OE_InactiveFilterMask;
        } else {
            this.orientationMethodinactiveMask = 'None';
        }
        if (args[0].hasOwnProperty('GroundVelocity')) {
            this.groundVel = args[0].GroundVelocity;
        } else {
            this.groundVel = 0;
        }

        this.q = [[],[]];
        this.a = [[],[]];
        this.v = [[],[]];
        this.s = [[],[]];
        this.currentSensor = 0;
        this.accChannels = [];
        this.segmentStart = [[],[]];


        this.orientationMethodfilterActive = '';
        this.maxIntegrationTime = 0;
        this.gravityDirection = [];
        this.forwardDirection = [];
    }
    //Methods
    maxIntTime (sensorDataObj: SensorData ,sDTWObj: Array<Object>) {
        // Label list and array of of array, With every component array comprising of [Segment Number, Segment Start, Segment Length]
        let mean = 0;
        const sensorSamplingRate = sensorDataObj.dataHeader[1].SamplingRate;
        const leftLabelList = sDTWObj[0].labelList;
        const rightLabelList = sDTWObj[1].labelList;
        for (let i = 0; i < leftLabelList.length; ++i) {
            mean = math.sum(mean, leftLabelList[i][2]);
        }
        if (sensorDataObj.dataHeader.length === 2) {
            for (let i = 0; i < rightLabelList.length; ++i) {
                mean = math.sum(mean, rightLabelList[i][2]);
            }
        }
        mean = mean / (leftLabelList.length + rightLabelList.length);
        this.maxIntegrationTime = (1.75 * mean) / sensorSamplingRate;
    }

    getGravityDirection (
        accChannels: Array<Array<number>>,
        msLabels: Array<{name: string, start: number, length: number}>) {
        const accG = math.transpose(accChannels)[msLabels[0].start];
        const idX = math.abs(accG).indexOf(math.max(math.abs(accG)));
        const gWorldFrame = [0, 0, 0];
        gWorldFrame[idX] = math.sign(accG[idX]);
        this.gravityDirection = gWorldFrame;
    }
    getForwardDirection (signal: Object) {
        const groundDirection = [0,1,2].filter(x => x !== this.gravityDirection.findIndex(x => x !== 0));
        if (signal._size[0] < signal._size[1]) {
            signal = math.transpose(signal);
        }
        const integrals = functions.integrationTrapz(math.abs(signal),'trapz');
        let forward;
        if (math.norm(integrals[groundDirection[0]]) > math.norm(integrals[groundDirection[1]])) {
            forward = groundDirection[0];
        } else {
            forward = groundDirection[1];
        }
        const forwardDirection = math.zeros(this.gravityDirection.length);
        forwardDirection._data[forward] = 1;
        return forwardDirection._data;
    }

    initQuaternions (gSensor: Array<number>) {
        const gWorld = this.gravityDirection;
        //  math.Cross(gSensor,gWorld): q = SensorToWorld
        //  math.cross(gWorld,gSensor): q = WorldToSensor
        // Here the Question of Cross Resulting in Zero Vector
        let n = math.cross(gSensor,gWorld);
        //WHy do we need in the fourth quadrent
        const theta = math.atan2(math.norm(n),math.dot(gSensor,gWorld));
        if (n.length !== 3) {
            n = math.transpose(n);
        }
        let q = [math.cos(theta / 2)];
        q = q.concat(n.map(x => x * math.sin(theta / 2) / math.norm(n)));
        return q;
    }

    computeTrajectory (
        sensorDataObj: Object,
        gaitEventObj: Array<{
            TOLabels: Array<{name: string, start: number, length: number}>,
            HSLabels: Array<{name: string, start: number, length: number}>,
            MSLabels: Array<{name: string, start: number, length: number}>,
            strideSequences: Array<{name: string, start: number, length: number}>,
            samplingRate: number
        }>) {
        for (let iSensor = 0; iSensor < sensorDataObj.dataHeader.length; ++iSensor) {
            const msLabels = gaitEventObj[iSensor].MSLabels;
            const sensorSamplingRate = sensorDataObj.dataHeader[iSensor].SamplingRate;
            const numStrides = msLabels.length - 1;
            this.q[iSensor] = new Array(numStrides);
            this.a[iSensor] = new Array(numStrides);
            this.v[iSensor] = new Array(numStrides);
            this.s[iSensor] = new Array(numStrides);
            this.segmentStart[iSensor] = new Array(numStrides);
            this.currentSensor = iSensor;
            this.accChannels = SensorData.getAxesData(sensorDataObj,iSensor,'Acc');
            this.getGravityDirection(this.accChannels, msLabels);

            for (let iStride = 0; iStride < numStrides; ++iStride) {
                const start = msLabels[iStride].start;
                const stop = msLabels[iStride + 1].start - 1;
                //Skip iteration if the intergration time is too long
                if (((stop - start) / sensorSamplingRate) > this.maxIntegrationTime) {
                    continue;
                }
                //write absolute start time
                this.segmentStart[iSensor][iStride] = start;
                // get the signal from start to stop
                const signal = math.matrix(math.transpose(sensorDataObj.data[iSensor]).slice(start, stop + 1));
                this.forwardDirection[iSensor] = this.getForwardDirection(signal);
                const gyrSignal = math.matrix(math.transpose(signal._data).slice(3, 6));
                const accSignal = math.matrix(math.transpose(signal._data).slice(0, 3));
                //get initial orientation at ZUPT using accelerometer(world2Sensor Orientation)
                const gSensorStart = math.transpose(accSignal._data)[0];
                const gSensorEnd = math.transpose(accSignal._data)[accSignal._size[1] - 1];
                const qStart = this.initQuaternions(gSensorStart);
                const qEnd = this.initQuaternions(gSensorEnd);
                const q_iStride =
                    functions.propagateQuaternions(accSignal,
                        gyrSignal,
                        qStart,
                        qEnd,
                        sensorSamplingRate);
                //remove gravity from the signal;
                const aTemp = functions.removeGravity(this.gravityDirection,
                    q_iStride,
                    accSignal);
                this.a[iSensor][iStride] = aTemp._data;
                const result = functions.deDriftedIntegration(aTemp,
                    gyrSignal,
                    sensorSamplingRate,
                    this.gravityDirection);
                this.q[iSensor][iStride] = q_iStride;
                this.v[iSensor][iStride] = math.transpose(result[0]);
                this.s[iSensor][iStride] = math.transpose(result[1]);
            }
        }
    }
}

module.exports = spatialTrajectory3D;
