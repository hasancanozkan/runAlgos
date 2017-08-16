// @flow
'use strict';

const fs = require('fs');

module.exports.getCombinedEvents = function (gaitEventObj: {
    TOLabels: Array<{name: string, start: number, length: number}>,
    HSLabels: Array<{name: string, start: number, length: number}>,
    MSLabels: Array<{name: string, start: number, length: number}>,
    strideSequences: Array<{name: string, start: number, length: number}>,
    samplingRate: number
}) {

    const combinedEvents = [];
    for (let i = 0; i < gaitEventObj.TOLabels.length; i++) {
        combinedEvents.push([gaitEventObj.TOLabels[i].start, gaitEventObj.HSLabels[i].start, gaitEventObj.MSLabels[i].start]);
    }

    return combinedEvents;
};

module.exports.save = function (fileName3: string, varToSave: Array<Array<number>>) {

    const file = fs.createWriteStream(fileName3);
    file.on('error', err => {
        if (err) {
            throw err;
        }
    });
    varToSave.forEach(v => {
        file.write(v.join(', ') + '\n');
    });
    file.end();
};
