// @flow
'use strict';

const fs = require('fs');

module.exports.getStrideBorders = function (fileNameLeft: string, fileNameRight: string) {
    const files = [fileNameLeft, fileNameRight];
    const sensorPos = ['LeftFoot', 'RightFoot'];
    const x = [];
    const labelList = [[],[]];

    sensorPos.forEach((value,index) => {
        x[index] = fs.readFileSync('../data/dataset/GoldStandard_StrideBorders/' + files[index]).toString().split(/[, \r\n]+/).map((v, i) => parseFloat(v));
        const temp = x[index].slice(18, x[index].length - 1);
        let j = 0;
        for (let i = 0; i < temp.length / 2; ++i) {
            labelList[index].push([i, temp[j], temp[j + 1] - temp[j]]);
            j += 2;
        }
    });

    return labelList;
};
