// @flow
'use strict';

/**
 * Created by jalil on 6/5/2017.
 * Functions used in the spaitalTrajectory3D class
 */

const math = require('mathjs');
const quaternion = require('./quaternion.js');

module.exports.integrationTrapz = function (signal: Object, model: string) {
    /*To Calculate Integration of Matrix using Trapz Method.The Input is a math.matrix.
     *Considering the spacing between the point is not constant
     */
    if (signal._size[0] > signal._size[1]) {
        signal = math.transpose(signal);
    }
    const result = math.matrix(math.zeros(signal._size));
    for (let iRow = 0; iRow < signal._size[0] ; ++iRow) {
        let sum = 0;
        for (let iColumn = 0; iColumn < signal._size[1]; ++iColumn) {
            result._data[iRow][iColumn] = 0.5 * sum;
            sum = sum + (((iColumn + 1) - iColumn) * (signal._data[iRow][iColumn] + signal._data[iRow][iColumn + 1]));
        }
    }
    if (model === 'trapz') {
        return math.transpose(result)._data[result._size[1] - 1];
    } else if (model === 'cumtrapz') {
        return result._data;
    } else {
        throw new Error('integrationTrapz Model : Error Here');
    }
};

module.exports.propagateQuaternions = function (accSignal: Object,gyrSignal: Object, qStart: Array<number>,qEnd: Array<number>,sensorSamplingRate: number) {
    if (gyrSignal._size[1] !== 3) {
        gyrSignal = math.transpose(gyrSignal);
    }

    // TODO "accSignal is never used", it is a local variable!!! (says Michael Hasenstein) = ANS: As for now only one Method is implemented
    // TODO but when further methods are implemented then accSginal will be used.
    // if (accSignal._size[1] !== 3) {
    //     accSignal = math.transpose(accSignal);
    // }

    //Here should be a if Statement checking if the gyrUnits is a string deg or not. but here for simplicity we assume it is
    //Converting degree to rad
    gyrSignal._data = gyrSignal._data.map(x => x.map(y => (math.PI / 180) * y));

    // We are just Implementing the First orientationMethod. Should be List of Methonds based upon Spatial Object SensorTrajectory3D Property orientationMethod
    // Here just GyrDI is implemented
    return orientationMethodgyrDI(gyrSignal,qStart,sensorSamplingRate);
};

module.exports.removeGravity = function (gravityDirection: Array<number>, q: Array<Array<number>>, accSignal: Object) {
    const gWorldFrame = math.clone(gravityDirection);
    //q needs to be sensortoWOrld quaternion else change transformDirection = Inverted;
    const transformDirection = 'NotInverted';
    let accSignalWorld = math.matrix(coordTransform (q, accSignal,transformDirection));
    //remove gravityDirection
    let repmat = math.matrix([gWorldFrame]);
    for (let i = 1; i < accSignal._size[1] ; ++i) {
        repmat = math.concat(repmat,[gWorldFrame],0);
    }
    accSignalWorld = math.subtract(accSignalWorld, repmat);
    const constantg = 9.80665;
    accSignalWorld._data = accSignalWorld._data.map(x => x.map(y => constantg * y));
    return accSignalWorld;
};

/** This function performs integration on acc signals.
 %   obj:        SensorTrajectory3D object
 %   accSignal:  accSignal for one stride*/
module.exports.deDriftedIntegration = function (accSignal: Object,gyrSignal: Object,sensorSamplingRate: number,gravityDirection: Array<number>) {
    // there should be a parameter of integrationMethod as per matlab
    //  An if Statment for integrationMethod = 'OF' , with application of high pass butter filter
    const acc = math.clone(accSignal);
    //Just applying the first tool: %double integration with drift estimation from begin to end of stride
    //Furthter in DI method Just implemented FixedPlatue which is the needed one for acceleration and velocity
    return toolDI (acc,gyrSignal,sensorSamplingRate,gravityDirection);
};

/** piecewise Linear drift function from ramp */
function getDriftFunctionPWL (k: number, y0: number, l: number, y1: number, len: number) {
    const drift = math.zeros(len);
    drift._data.fill(y0,0,k - 1);
    math.zeros(l - k + 1)._data.forEach((e,index) => {
        drift._data[k + index - 1] = (index + 1) / (l - k) * ((y1 - y0) + y0);
    });
    drift._data.fill(y1,l,drift.length);
    return drift._data;
}

/** Implements the drift compensation as published by Rampp et al.*/
function getDriftFixed (signal: Object, model: string) {
    //Signal should be math.matrix, and model is a string either "acc" or "vel"
    //Here optimiztion can be done by take transpose of signal already
    //let transp;
    if (signal._size[0] < signal._size[1]) {
        signal = math.transpose(signal);
        //transp = true;
    } else {
        //transp = false;
    }
    const drifts = math.transpose(math.zeros(signal._size));
    if (model === 'acc') {
        const k = math.round(0.04 * math.max(signal._size));
        const l = math.max(signal._size) - math.round(0.02 * math.max(signal._size));
        for (let iChannel = 0; iChannel < 1/*signal._size[1]*/; ++iChannel) {
            const y0 = math.mean(math.transpose(signal)._data[iChannel].slice(0, k));
            const y1 = math.mean(math.transpose(signal)._data[iChannel].slice(l - 1, signal._size[0]));
            drifts[iChannel] = getDriftFunctionPWL(k, y0, l, y1, math.max(signal._size));
        }
    } else if (model === 'vel') {
        for (let iChannel = 0; iChannel < signal._size[1]; ++iChannel) {
            const y1 = math.mean(math.transpose(signal)._data[iChannel].slice(-6));
            drifts[iChannel].forEach((element, index) => {
                drifts[iChannel][index] = index * y1 / math.max(signal._size);
            });
        }
    } else {
        throw new Error('deDrift_Fixed : Error Here');
    }
    return math.transpose(drifts);
}

/** double integration with drift estimation from begin to end of stride
 * Performs double integration using direct integration
 *   with linear or pchip dedrifting.
 * TODO gyrSignal is unused!
 */
function toolDI (accSignal: Object, gyrSignal: Object, fs: number, gravityDirection: Array<number>) {
    // Calulating driftsAcc
    const driftsAcc = getDriftFixed (accSignal,'acc');
    //dedrfit acceleration signal
    const accDedr = math.subtract(accSignal._data,driftsAcc);
    //Integrat the accSignal
    let v = module.exports.integrationTrapz (math.matrix(accDedr),'cumtrapz');
    v = v.map(x => x.map(y => y / fs));
    //Calculate drifts for velocity
    const driftsVel = getDriftFixed (math.matrix(v),'vel');
    //dedrift the velocity
    const vDedr = math.subtract(v,math.transpose(driftsVel));
    //Integrat velocity
    let s = module.exports.integrationTrapz(math.matrix(vDedr),'cumtrapz');
    s = s.map(x => x.map(y => y / fs));
    //compute the linear drift on clearance as even ground is assumed, There should be an if here
    const gravityDirectionIdx = gravityDirection.findIndex(x => x !== 0);
    //Here should be switch for Style, Just applying getDrift_Fixed
    const driftClearance = getDriftFixed(math.matrix([s[gravityDirectionIdx]]),'vel');
    const sDedr = math.subtract([s[gravityDirectionIdx]],math.transpose(driftClearance));
    s[gravityDirectionIdx] = sDedr[0];
    return [vDedr, s];
}

/** Transform between sensor and world frame */
function coordTransform (q: Array<Array<number>>, accSignal: Object,transformDirection: string) {
    // Make sure signal is in correct format
    let signal = [];
    let flipDim = true;
    if (accSignal._size[0] === 3) {
        accSignal = math.transpose(accSignal);
        flipDim = false;
    }
    //Make sure no of quaternions is equal to the no of samples of signal
    if (q.length !== accSignal._size[0]) {
        throw new Error ('Error in spatialFunctions>Length ofquaternionsequenceand signal do notmatch');
    }
    //do the transform
    for (let iSample = 0; iSample < accSignal._size[0]; ++iSample) {
        let A = quaternion.attitudeMatrix(q[iSample]);
        if (transformDirection === 'Inverted') {
            A = math.transpose(A);
        }
        signal[iSample] = math.multiply(A, math.transpose(accSignal._data[iSample]));
    }
    if (flipDim) {
        signal = math.transpose(signal);
    }
    return signal;
}

/** this functions quaternions based on gyroDI method. There are other methods as well. but this
 is default*  . */
function orientationMethodgyrDI (gyrSignal: Object, qStart: Array<number>,sensorSamplingRate: number) {
    /*Making an array  to store all the quaternions of the stride*/
    const q = [];
    q.push(qStart);
    for (let i = 1; i < gyrSignal._size[0] ; ++i) {
        //calculate derivate quaternion
        let qGyr = quaternion.product(q[i - 1],[0,...gyrSignal._data[i]]);
        qGyr = qGyr.map(x => (1 / (2 * sensorSamplingRate)) * x);
        // add derivatie to the pervious estimate
        q.push(math.add(q[i - 1],qGyr));
        //normalize
        q[i].map(x => x / math.norm(q[i]));
    }
    return q;
}

