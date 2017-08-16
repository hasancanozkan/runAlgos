// @flow
'use strict';

const math = require('mathjs');
const filter = require('./filter.js');

/**
 *
 * @param {Array.<Object>} labelList
 * @returns {Array}
 */
module.exports.clusterLabelList = function (labelList: Array<Object>) {
    const startSamples = [];
    const lengths = [];
    const endSamples = [];
    let sum = 0;
    const startIdx = [1];
    const strideSequence = [];

    for (let i = 0; i < labelList.length; ++i) {
        startSamples.push(labelList[i][1]);
        lengths.push(labelList[i][2]);
        //Summing all the lengths for avg
        sum += lengths[i];
        endSamples.push(startSamples[i] + lengths[i]);
    }

    const maxSeparation = 0.5 * (sum / lengths.length);

    const x = math.subtract(startSamples.slice(1, startSamples.length),endSamples.slice(0, endSamples.length - 1));

    for (let i = 0; i < x.length; ++i) {
        if (x[i] > maxSeparation) {
            startIdx.push(x.indexOf(x[i], i) + 2);
        }
    }

    // Mapping every value from startIdx -1
    const endIdx = startIdx.map(value => value - 1);

    // Removing the first element and adding the last --> length of endSamples
    endIdx.splice(0, 1);
    endIdx.splice(endIdx.length, 0, endSamples.length);

    for (let i = 0; i < startIdx.length; ++i) {
        strideSequence.push({
            name: 'Sequence ' + (i + 1),
            start: startSamples[startIdx[i] - 1],
            length: endSamples[endIdx[i] - 1] - startSamples[startIdx[i] - 1]
        });
    }

    return strideSequence;
};

/**
 * Calculating the Toe Off labels for one stride
 * @param {Array.<Array.<number>>} gyrZSignal
 * @param {number} startSampleStep
 * @param {number} stepNumber
 * @returns {{name: string, start: number, length: number}}
 */
module.exports.getToeOff = function (gyrZSignal: Array<Array<number>>, startSampleStep: number, stepNumber: number) {

    const signs = math.sign(gyrZSignal);
    let flipSignIdx = 0;
    let shifts, toSample;

    // Checking when sign is not the same as the last entry ---> save that index position in flipSignIdx
    for (flipSignIdx = 0; flipSignIdx < signs.length; ++flipSignIdx) {
        if (signs[flipSignIdx] !== signs[flipSignIdx + 1]) {
            break;
        }
    }

    // get the first zero crossing and also look left-right from this
    if (flipSignIdx === 1) {
        shifts = [0, 1];
    } else {
        shifts = [-1, 0, 1];
    }

    // Adding the flipSignIndex to shifts array
    const pos = shifts.map(value => (value + flipSignIdx));

    // Extracting the gyroZ values at shifts positions
    const newGyrZSignal = [];
    pos.forEach(v => newGyrZSignal.push(math.abs(gyrZSignal[v])));

    // Finding the index of shifts at which the gyroZ is min
    const shiftIdx = newGyrZSignal.indexOf(math.min(newGyrZSignal));
    toSample = flipSignIdx + shifts[shiftIdx];
    toSample = toSample + startSampleStep;

    return {
        name: 'TO' + (1 + stepNumber),
        start: toSample,
        length: 0
    };
};

/**
 * Calculating the Heel Strike label for one stride
 * @param {Array.<number>} gyrZSignal
 * @param {Array.<number>} accXSignal
 * @param {number} windowSize
 * @param {number} startSampleStep
 * @param {number} stepNumber
 * @returns {{name: string, start: number, length: number}}
 */
module.exports.getHeelStrike = function (
    gyrZSignal: Array<number>,
    accXSignal: Array<number>,
    windowSize: number,
    startSampleStep: number,
    stepNumber: number) {

    /*
    * Compute the gradient for that part of the signal,
    * Finite Diff for first and last, central diff for the rest
    * */
    const gradientGyrZ = [];
    gyrZSignal.forEach((value, i) => {
        if (i === 0) {
            const temp = gyrZSignal[i + 1] - value;
            gradientGyrZ.push(temp);
        } else if (i === gyrZSignal.length - 1) {
            const temp = value - gyrZSignal[i - 1];
            gradientGyrZ.push(temp);
        } else {
            const temp = (gyrZSignal[i + 1] - gyrZSignal[i - 1]) / 2;
            gradientGyrZ.push(temp);
        }
    });

    /*
    * Determine the range to search in for the inflection point between absolute max of gyrZSignal and end of the first half
    * r1 --> psoition of max abs value in GyroZ
    * r2 --> ceil round of GyroZ Signal/2
    * */
    const range = {
        r1: gyrZSignal.indexOf(math.max(gyrZSignal)),
        r2: math.ceil(0.5 * gyrZSignal.length)
    };

    // Searching for the Inflection point in the given range of the gradientGyrZ signal [r1, r2]
    const t1 = gradientGyrZ.slice(range.r1, range.r2 + 1);
    let p1 = t1.indexOf(math.min(t1));

    // Since we are applying p2 again to gradientGyrZ[] to extract the max value, I do p1 - 1 in slice
    const t2 = gradientGyrZ.slice(p1, range.r2 + 1);
    let p2 = t2.indexOf(math.max(t2));

    // rescale indices to the scope of calib_final_data
    p1 = p1 + range.r1;
    p2 = p2 + p1;

    // search for minimum between inflection points
    const t3 = gyrZSignal.slice(p1, p2 + 1);
    let tmpHS = t3.indexOf(math.min(t3));
    tmpHS = tmpHS + p1;

    // Search for minimum in accel signal around minium in gyro signal
    const e1 = math.max([1, math.floor(tmpHS - windowSize)]);
    const e2 = math.min([accXSignal.length - 1, math.ceil(tmpHS + windowSize)]);

    // Compute the HS sample
    const t4 = accXSignal.slice(e1, e2 + 1);
    let hs = t4.indexOf(math.min(t4));

    // var hs_value = math.min(accXSignal.slice(e1 - 1, e2));
    hs = e1 + hs;

    // Adding the final label
    hs = hs + startSampleStep;
    return {
        name: 'HS' + (1 + stepNumber),
        start: hs,
        length: 0
    };
};

/**
 * Calculating the Mid Stance label for one stride
 * @param {Array.<Array.<number>>} gyrSignal
 * @param {number} windowSize
 * @param {number} overlap
 * @param {number} startSampleStep
 * @param {number} stopSampleStep
 * @param {number} stepNumber
 * @returns {{name: string, start: number, length: number}}
 */
module.exports.getMidStance = function (
    gyrSignal: Array<Array<number>>,
    windowSize: number,
    overlap: number,
    startSampleStep: number,
    stopSampleStep: number,
    stepNumber: number) {

    windowSize = math.round(windowSize);
    if (windowSize % 2 !== 0) {
        ++windowSize;
    }
    overlap = math.round(overlap);

    /*
     Get energy in each window
     */
    let energyGyr = [];

    // Slicing the Gyro data from start to stop Sample
    gyrSignal.forEach(val => energyGyr.push(val.slice(startSampleStep, stopSampleStep + 1)));

    energyGyr = getEnergy(energyGyr);
    const energyGyr2 = math.abs(filter.getFilteredData(5, energyGyr));
    const energyPerWindowBufferGyr = bufferEnergySignal(energyGyr2, windowSize, overlap);

    const windowLength = energyPerWindowBufferGyr.length;
    // Filling the leading and tailing zeros
    for (let i = 0; i < windowSize; ++i) {
        // Condition for the 1st column of energy Window containing leading zeros
        if (energyPerWindowBufferGyr[0][i] === 0) {

            /* Square and add from gyrSignal start index, i-2--> one -1 for this loop and other -1 for gyrSignal indexing
             possible to add j in the loop for gyrSignal indexing
             */
            energyPerWindowBufferGyr[0][i] = [math.pow(gyrSignal[0][startSampleStep - i - 2], 2),
                math.pow(gyrSignal[1][startSampleStep - i - 2], 2),
                math.pow(gyrSignal[2][startSampleStep - i - 2], 2)].reduce((a, b) => a + b);
        }
        /* Condition for the last column of energy Window containing tailing zeros, start from the last 0 in that column,
         hence using windowSize-1-i
         */
        if (energyPerWindowBufferGyr[windowLength - 1][windowSize - 1 - i] === 0) {
            // Square and add from gyrSignal stop index
            energyPerWindowBufferGyr[windowLength - 1][windowSize - 1 - i] =
                [math.pow(gyrSignal[0][stopSampleStep + i + 1], 2),
                    math.pow(gyrSignal[1][stopSampleStep + i + 1], 2),
                    math.pow(gyrSignal[2][stopSampleStep + i + 1], 2)].reduce((a, b) => a + b);
        }
    }

    // Reduce to the total energy per window --> Mean of each column

    const energyPerWindowGyr = energyPerWindowBufferGyr.map(v => v.reduce((a,b) => a + b) / windowSize);

    const minIdxGyr = energyPerWindowGyr.indexOf(math.min(energyPerWindowGyr)) + 1;
    const ms = (minIdxGyr * (windowSize - overlap)) - (windowSize / 2);

    return {
        name: 'MS' + (1 + stepNumber),
        start: ms + startSampleStep - 1,
        length: 0
    };
};


/**
 * Calculates the energy of a digital signal.
 * @param {Array.<Array.<number>>} signal is an N cross 3 digital signal
 * @returns {Array.<number>} The squared sum of N cross 3 digital signal
 */
function getEnergy (signal: Array<Array<number>>): Array<number> {
    const energySignal = new Array(signal[0].length);

    for (let i = 0; i < energySignal.length; i++) {
        energySignal[i] = math.pow(signal[0][i],2) + math.pow(signal[1][i],2) + math.pow(signal[2][i],2);
    }

    return energySignal;
}

/**
*  Buffer signal vector into matrix of data frames
*  @param {Array<number>} energyGyr The energy of the digital signal
*  @param {number} windowSize Length of each of the non-overlapping data segments (frames)
*  @param {number} overlap Number of samples in each frame
*  @returns {Array<Array<number>>} buffer
*/
function bufferEnergySignal (
    energyGyr: Array<number>,
    windowSize: number,
    overlap: number) {
    const data = math.clone(energyGyr);

    //Adding the zeros in the beginning , n = overlap
    for (let i = 0; i < overlap; i++) {
        data.unshift(0);
    }

    const buffer = [];

    // Looping --> Add n elements from previous row and and continue with the rest from data
    for (let i = 0; i < data.length; ++i) {
        const t = i * (windowSize - overlap);
        buffer.push(data.slice(t, t + windowSize));

        // Condition to check when all the elements are added
        if (buffer[i].length < windowSize) {
            break;
        }
    }

    // Adding the extra zeros at the end
    const x = buffer[buffer.length - 1].length;
    const diff = windowSize - x;

    for (let i = 0; i < diff; ++i) {
        buffer[buffer.length - 1].push(0);
    }

    return buffer;
}

