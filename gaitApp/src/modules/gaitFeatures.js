// @flow
'use strict';

/**
 * Created by Prashant on 3/31/2017.
 * Class to evaluate gait features
 */

const math = require('mathjs');
const quaternion = require('./quaternion.js');
const SensorData = require('./SensorData.js');

class gaitFeatures {
    strideTime: Array<Array<number>>;
    timeStamp: Array<Array<number>>;
    swingTime: Array<Array<number>>;
    stanceTime: Array<Array<number>>;
    strideLength: Array<Array<number>>;
    lateralDisplacement: Array<Array<number>>;
    maxLateralSwing: Array<Array<number>>;
    groundVelocity: Array<Array<number>>;
    heelStrikeAngle: Array<Array<number>>;
    toeOffAngle: Array<Array<number>>;
    maxToeClearance: Array<Array<number>>;
    pushOffAcc: Array<Array<number>>;
    landingAcc: Array<Array<number>>;
    groundTurningAngle: Array<Array<number>>;
    relHSSample: Array<Array<number>>;
    relTOSample: Array<Array<number>>;
    angle: Array<Array<{Frontal: [], Transversal: [], Sagittal: []}>>;
    pos: Array<Array<{Longitudinal: [], Transversal: [], Sagittal: []}>>;
    vel: Array<Array<{Longitudinal: [], Transversal: [], Sagittal: []}>>;
    acc: Array<Array<{Longitudinal: [], Transversal: [], Sagittal: []}>>;

    constructor () {
        this.strideTime = [[], []];
        this.timeStamp = [[], []];
        this.swingTime = [[], []];
        this.stanceTime = [[], []];
        this.strideLength = [[], []];
        this.lateralDisplacement = [[], []];
        this.maxLateralSwing = [[], []];
        this.groundVelocity = [[], []];
        this.heelStrikeAngle = [[], []];
        this.toeOffAngle = [[], []];
        this.maxToeClearance = [[], []];
        this.pushOffAcc = [[], []];
        this.landingAcc = [[], []];
        this.groundTurningAngle = [[], []];
        this.relHSSample = [[], []];
        this.relTOSample = [[], []];
        this.angle = [[{Frontal: [], Transversal: [], Sagittal: []}], [{Frontal: [], Transversal: [], Sagittal: []}]];
        this.pos = [[{Longitudinal: [], Transversal: [], Sagittal: []}], [{Longitudinal: [], Transversal: [], Sagittal: []}]];
        this.vel = [[{Longitudinal: [], Transversal: [], Sagittal: []}], [{Longitudinal: [], Transversal: [], Sagittal: []}]];
        this.acc = [[{Longitudinal: [], Transversal: [], Sagittal: []}], [{Longitudinal: [], Transversal: [], Sagittal: []}]];
    }

    getFeatures (
        sensorDataObj: SensorData,
        spatial: {
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
        },
        gaitEventObj: Array<{
            TOLabels: Array<{name: string, start: number, length: number}>,
            HSLabels: Array<{name: string, start: number, length: number}>,
            MSLabels: Array<{name: string, start: number, length: number}>,
            strideSequences: Array<{name: string, start: number, length: number}>,
            samplingRate: number
        }>) {

        for (let iSensor = 0; iSensor < sensorDataObj.dataHeader.length; ++iSensor) {
            const fs = gaitEventObj[iSensor].samplingRate;
            const gWorldFrame = spatial.gravityDirection;
            const gravityDirection1 = this.find(gWorldFrame);
            const groundDirections = [0, 1, 2].filter(x => gravityDirection1.indexOf(x) < 0);
            const gravityDirection = gravityDirection1.slice(-1).pop();
            const antPostDirection1 = this.find(spatial.forwardDirection[iSensor]);
            const medioLatDirection = groundDirections.filter(x => antPostDirection1.indexOf(x) < 0).slice(-1).pop();
            const antPostDirection = antPostDirection1.slice(-1).pop();
            const nStrides = spatial.q[iSensor].length;

            for (let iStride = 0; iStride < nStrides; ++iStride) {

                if (typeof spatial.s[iSensor][iStride] === 'undefined') {
                    continue;
                }

                this.timeStamp[iSensor].push(gaitEventObj[iSensor].HSLabels[iStride].start / fs);
                const strideTime = (gaitEventObj[iSensor].HSLabels[iStride + 1].start - gaitEventObj[iSensor].HSLabels[iStride].start) / fs;
                this.strideTime[iSensor].push(strideTime);
                const swingTime = (gaitEventObj[iSensor].HSLabels[iStride + 1].start - gaitEventObj[iSensor].TOLabels[iStride + 1].start) / fs;
                this.swingTime[iSensor].push(swingTime);
                this.stanceTime[iSensor].push(strideTime - swingTime);

                // {end} Extracting the last array at [iStride]
                // {footDisplacement} Saving the values from end at the indices given in groundDirections [0,2]
                const end = spatial.s[iSensor][iStride][spatial.s[iSensor][iStride].length - 1];
                const footDisplacement = end.filter((val,index) => groundDirections.includes(index));

                this.strideLength[iSensor].push(math.norm(footDisplacement));

                const tmp = math.abs(footDisplacement);
                const lateralDirection = tmp.indexOf(math.min(tmp));
                this.lateralDisplacement[iSensor].push(math.abs(footDisplacement[lateralDirection]));

                const t1 = spatial.s[iSensor][iStride][0];
                const q1 = t1.filter((val, index) => groundDirections.includes(index));
                q1.push(0);

                const t2 = spatial.s[iSensor][iStride][spatial.s[iSensor][iStride].length - 1];
                const q2 = t2.filter((val, index) => groundDirections.includes(index));
                q2.push(0);

                const lateralSwing = [];

                spatial.s[iSensor][iStride].forEach(value => {
                    const x = value.filter((v,i) => groundDirections.includes(i));
                    x.push(0);
                    const a = math.cross(math.subtract(q2,q1), math.subtract(x,q1));
                    const b = math.norm(math.subtract(q2,q1));
                    lateralSwing.push(math.norm(math.divide(a,b)));
                });
                this.maxLateralSwing[iSensor].push(math.max(lateralSwing));

                // Calculating the Velocity (m/s)
                const p = (gaitEventObj[iSensor].HSLabels[iStride + 1].start - gaitEventObj[iSensor].HSLabels[iStride].start) / fs;
                this.groundVelocity[iSensor].push(this.strideLength[iSensor][iStride] / p);

                // Calculating angle course around all three axes [rad]
                const tMSabs = gaitEventObj[iSensor].MSLabels[iStride].start; //Absolute time
                const tMS = tMSabs - spatial.segmentStart[iSensor][iStride]; // Not taking +1 because indexing starts from 0
                const qMS = spatial.q[iSensor][iStride][tMS];

                const angleCourse = [];
                spatial.q[iSensor][iStride].forEach((val, ind) => {
                    const qMStoT = quaternion.product(val, quaternion.inverse(qMS));
                    angleCourse[ind] = quaternion.quaternionToEuler(qMStoT);
                });

                // Calculating the TO Angle
                // TODO: Check for the comments in matlab for iStride + 1
                const tTOabs = gaitEventObj[iSensor].TOLabels[iStride + 1].start;
                const tTO = tTOabs - spatial.segmentStart[iSensor][iStride] + 1;
                this.relTOSample[iSensor].push(tTO);
                this.toeOffAngle[iSensor].push(-this.radToDegree(angleCourse[tTO][medioLatDirection]));

                // Calculating HS angle
                const tHSabs = gaitEventObj[iSensor].HSLabels[iStride + 1].start;
                const tHS = tHSabs - spatial.segmentStart[iSensor][iStride] + 1;

                this.relHSSample[iSensor].push(tHS);
                this.heelStrikeAngle[iSensor].push(-this.radToDegree(angleCourse[tHS][medioLatDirection]));

                //  Distance btw sensor and toe during TO
                const sensorLiftTO = spatial.s[iSensor][iStride][tTO][gravityDirection];
                const lToe = sensorLiftTO / math.sin(angleCourse[tTO][medioLatDirection]);

                // Calculating toe clearance course from sensor clearance -- Almost same as matlab
                const toeClearanceCourse = [];
                angleCourse.forEach((val, ind) => {
                    const sgn = math.sign(val[medioLatDirection]);
                    const delta = sgn * lToe * math.sin(val[medioLatDirection]);
                    toeClearanceCourse.push(spatial.s[iSensor][iStride][ind][gravityDirection] + (sgn * delta));
                });
                this.maxToeClearance[iSensor].push(math.max(toeClearanceCourse));

                // Calculating max Heel Clearance
                // Not yet implemented

                // Calculating ground Turning angle -- Almost same as matlab
                const qTurn = quaternion.product(spatial.q[iSensor][iStride][0],
                    quaternion.inverse(spatial.q[iSensor][iStride][spatial.q[iSensor][iStride].length - 1]));
                const turningAngleEuler = quaternion.quaternionToEuler(qTurn);
                this.groundTurningAngle[iSensor].push(this.radToDegree(turningAngleEuler[gravityDirection]));

                // Calculating TO ant-post acc. (pushOff) -- spatial.a values significantly not same as matlab hence wrong results
                const accFree = spatial.a[iSensor][iStride];

                const te1 = accFree.slice(tMS, tTO + 1);
                const te = te1.map(v => -v[antPostDirection]);
                const pushOffAcc = math.max(te);
                this.pushOffAcc[iSensor].push(pushOffAcc);

                // Calculating HS vertical acc (landing) -- spatial.a values significantly not same as matlab hence wrong results
                const w = math.round(0.0500 * fs); //search in a window of 10ms around the two events
                const l = math.max([1, tHS - w]);
                const r = math.min([accFree.length, tHS + w]);

                const _t1 = accFree.slice(l, r + 1);
                const _t = _t1.map(v => -v[gravityDirection]);
                const landing = math.abs(math.min(_t));

                this.landingAcc[iSensor].push(landing);

                // Append angle courses and trajectories,velocities, gravity free accs

                const angleC = math.transpose(angleCourse);
                this.angle[iSensor].push({
                    Frontal: math.subtract(angleC[antPostDirection], angleC[antPostDirection][0]).map(v => this.radToDegree(v)),
                    Transversal: math.subtract(angleC[gravityDirection], angleC[gravityDirection][0]).map(v => this.radToDegree(-v)),
                    Sagittal: math.subtract(angleC[medioLatDirection], angleC[medioLatDirection][0]).map(v => this.radToDegree(v))
                });

                const spatialS = math.transpose(spatial.s[iSensor][iStride]);
                this.pos[iSensor].push({
                    Longitudinal: spatialS[gravityDirection].map(x => (x === 0) ? 0 : -100 * x),
                    Transversal: spatialS[medioLatDirection].map(x => 100 * x),
                    Sagittal: spatialS[antPostDirection].map(x => (x === 0) ? 0 : -100 * x)
                });

                const spatialV = math.transpose(spatial.v[iSensor][iStride]);
                this.vel[iSensor].push({
                    Longitudinal: spatialV[gravityDirection].map(x => (x === 0) ? 0 : -1 * x),
                    Transversal: spatialV[medioLatDirection],
                    Sagittal: spatialV[antPostDirection].map(x => (x === 0) ? 0 : -1 * x)
                });

                const spatialA = math.transpose(spatial.a[iSensor][iStride]);
                this.acc[iSensor].push({
                    Longitudinal: spatialA[gravityDirection].map(x => (x === 0) ? 0 : -1 * x),
                    Transversal: spatialA[medioLatDirection],
                    Sagittal: spatialA[antPostDirection].map(x => (x === 0) ? 0 : -1 * x)
                });
            }
        }
    }

    find (arr: Array<number>): Array<number> {
        const t = [];
        for (let i = 0; i < arr.length; ++i) {
            if (arr[i] !== 0) {
                t.push(i);
            }
        }
        return t;
    }

    radToDegree (angle: number): number {
        if (angle === 0) {
            return 0;
        } else {
            return angle * (180 / Math.PI);
        }
    }
}

module.exports = gaitFeatures;
