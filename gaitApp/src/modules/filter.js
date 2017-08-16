// @flow
'use strict';

/**
 *
 * @param {number} windowSize The size of the window for moving average filter
 * @param {Array<number>} data The data to be filtered
 * @returns {Array<number>}
 */
module.exports.getFilteredData = function (windowSize: number, data: Array<number>) {
    // var b = (1/windowSize)*ones(1,windowSize);
    // var a = 1;

    const filteredData = [];
    filteredData.push(data[0] / windowSize);

    // Assigning values for first i=windowSize positions to avoid undefined error in the next for loop
    for (let i = 2; i <= windowSize; ++i) {
        let temp = data.slice(0, i);
        temp = temp.reduce((a, b) => {
            return a + b;
        }, 0);
        filteredData.push((temp / windowSize));
    }

    // Looping through all the rest time points and performing moving averaging filter of windowSize samples
    for (let j = (windowSize + 1); j <= data.length; ++j) {
        let temp = data.slice((j - windowSize), j);
        temp = temp.reduce((a, b) => {
            return a + b;
        }, 0);
        filteredData.push((temp / windowSize));
    }

    return filteredData;
};
