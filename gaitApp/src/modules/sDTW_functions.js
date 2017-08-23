// @flow
'use strict';

const math = require('mathjs');
//TODO: flow annotations
module.exports.getDistanceMatrix = function (template,signal) {

    //defualt Metris is euclidean aka euc. You can also use other metric also. but for starter I will implement only the euclidean
    //Example for help:
    // 0) what we get in input is [channels x #samples]
    // 0a) we convert it to [#Samples x Channels]
    // 1) General Format for the template and Signal  : [#Samples x Channels ]
    // 2) So for example, template(200 x 6) and signal (800 x 6)
    // 3) I make a distance matrix D which is (200 x 800)
    if (math.size(template)._data[1] !== math.size(signal)._data[1]) {
        template = math.transpose(template);
        signal = math.transpose(signal);
    }

    // A distance Matix of [200 x 800]
    let distMatrix = math.zeros(math.size(template)._data[0], math.size(signal)._data[0]);
    for (let iChannel = 0 ;iChannel < template._size[1]; ++iChannel) {
        const temp = pdist2(col(template,iChannel),col(signal,iChannel));
        distMatrix = math.add(distMatrix,temp);
    }
    return distMatrix;
};

module.exports.getCostMatrix = function (distMatrix: Object) {
    let costMatrix = math.zeros(math.size(distMatrix)._data[0], math.size(distMatrix)._data[1]);
    //Making first column Infinte.
    costMatrix = math.transpose(costMatrix);
    costMatrix._data[0].map((x, i, ar) => costMatrix._data[0][i] = Number.MAX_VALUE);
    costMatrix = math.transpose(costMatrix);
    //Making first row of the Cost Matrix
    costMatrix._data[0] = distMatrix._data[0]; // row can be reached by direct index but column needs a function col()
    for (let m = 1 ; m < distMatrix._size[0] ; ++m) {
        // m is the number of row aka #samples in template
        for (let n = 1 ; n < distMatrix._size[1] ; ++n) {
            // n is the number of Column aka #samples in Signal
            costMatrix._data[m][n] = distMatrix._data[m][n] + math.min(costMatrix._data[m - 1][n - 1],costMatrix._data[m - 1][n],costMatrix._data[m][n - 1]);
        }
    }
    return costMatrix;
};

module.exports.getDistanceFunction = function (costMatrix: Object) {
    return math.matrix(costMatrix._data[costMatrix._size[0] - 1]);
};

module.exports.getSubsequences = function (distFunc: Object,costMatrix: Object,threshold: number,minSegmentSize: number,maxSegmentSize: number,ignoreSize: number) {
    // creating a template of Distance Function
    const temp = distFunc.clone(distFunc);
    // Creating an arry to store Path
    const path = [];
    //Creating an array to store Path Length
    const pathLength = [];
    // Creating a control vector to avoid laps
    const control = math.zeros(math.max(costMatrix._size));
    let bnew = temp._data.indexOf(math.min(temp._data));
    do {
        // Find the global minimum of distance function
        // compute DTW miniminzing index anew via warpoing Path
        let warpingPath = getWarpingPath(costMatrix, bnew);
        let anew = warpingPath._data[warpingPath._size[0] - 1][1];
        //Avoid OverLaps
        while ((control._data[anew + 1] === 1) && (anew + 1 < bnew)) {
            anew = anew + 1;
        }
        // check if steps between anew and bnew have been found brfore
        if (control._data.some(x => x !== 0) === true) {
            temp._data[bnew] = Number.MAX_VALUE;
        }
        control._data.slice(anew, bnew).map((value, index) => control._data[anew + index] = 1);
        //Modify path according to anew
        warpingPath = math.transpose(warpingPath);
        warpingPath._data[1].slice(warpingPath._data[1].findIndex(x => x === anew),
            warpingPath._size[1])
            .map((value, index) => warpingPath._data[1][warpingPath._data[1].findIndex(
                x => x === anew) + index] = anew);
        warpingPath = math.transpose(warpingPath);
        // compute path length
        const lengthPath = bnew - anew;
        //Store Path Length if its in range
        if (lengthPath > minSegmentSize && lengthPath < maxSegmentSize) {
            path.push(warpingPath);
            pathLength.push(lengthPath);
        }
        //set distFunc = inf within suitable neighbourhood
        if ((bnew + ignoreSize) > math.max(costMatrix._size)) {
            temp._data.slice(anew, temp._size)
                .map((value, index) => temp._data[anew + index] = Number.MAX_VALUE);
        } else {
            temp._data.slice(anew + 1, bnew + ignoreSize)
                .map((value, index) => temp._data[anew + 1 + index] = Number.MAX_VALUE);
        }
        bnew = temp._data.indexOf(math.min(temp._data));
        //if the value is less then threshold
    } while (temp._data[bnew] < threshold);
    return [path, pathLength];
};

module.exports.getLabelList = function (paths: Array<Object>, pathLength: Array<number>) {
    const labelList = [];
    if (paths.length === 0) {
        return labelList;
    }
    for (let iLabel = 0; iLabel < paths.length; ++iLabel) {
        const temp = new Array(3);
        temp[0] = iLabel;
        temp[1] = paths[iLabel]._data[paths[iLabel]._size[0] - 1][1];
        temp[2] = pathLength[iLabel];
        labelList.push(temp);
    }
    labelList.sort(sortFunction);
    //TODO: Check if arrow function is correctly defined
    labelList.forEach((value, index, array) => labelList[index][0] = index);
    return labelList;
};

/** To get whole column of an array */
function col (M, i) {
    return math.matrix(math.flatten(M.subset(math.index(math.range(0, M._size[0]),i))).toArray());
}

/**  This function will return a distance matrix per channel. */
function pdist2 (Y ,X) {
    // X and Y are vectors(Matrices) of [Obersavations x Variables]

    const sizeX = math.size(X)._data;
    const sizeY = math.size(Y)._data;
    if (sizeX[1] !== sizeY[1]) {
        throw new Error('Error(sDTW_functions:pdist2) : Size Mismatch');
    }
    //if (metric != "euc"){
    //    throw "Error(sDTW_functions:pdist2) : Unknown Metric Function"
    //  }
    const temp = math.zeros(math.size(Y)._data[0], math.size(X)._data[0]);
    for (let m = 0 ; m < temp._size[0] ; ++m) {
        // m is the number of row
        for (let n = 0 ; n < temp._size[1] ; ++n) {
            // n is the number of Column
            temp._data[m][n] = math.sqrt(math.square(Y._data[m] - X._data[n]));
        }
    }
    return temp._data;
}
/** Calculate WarpingPath as per Barth et al */
function getWarpingPath (costMatrix,start) {
    let minCostPath = math.matrix([[costMatrix._size[0] - 1,start]]);
    let stencil;
    while (minCostPath._data[minCostPath._size[0] - 1][0] !== 1) {
        // set the stencil
        if (minCostPath._data[minCostPath._size[0] - 1][0] !== 1 && minCostPath._data[minCostPath._size[0] - 1][1] !== 1) {
            stencil = math.matrix([[-1,0],[0,-1],[-1,-1]]);
        } else if (minCostPath._data[minCostPath._size[0] - 1][0] === 1) {
            stencil = math.matrix([[0,-1]]);
        } else {
            stencil = math.matrix([[-1,0]]);
        }
        const scanD = math.zeros(1,stencil._size[0]);
        for (let j = 0; j < stencil._size[0] ; ++j) {
            let x = minCostPath._data[minCostPath._size[0] - 1][0];
            x = x + stencil._data[j][0];
            let y = minCostPath._data[minCostPath._size[0] - 1][1];
            y = y + stencil._data[j][1];
            scanD._data[j] = costMatrix._data[x][y];
        }

        const minValScanD = math.min(scanD._data);
        const minPosScanD = scanD._data.indexOf(minValScanD);

        const temp = math.matrix([math.add(minCostPath._data[minCostPath._size[0] - 1],stencil._data[minPosScanD])]);
        minCostPath = math.concat(minCostPath, temp ,0);
    }
    return minCostPath;
}

/** From StackFlow > sorting Function to sort array*/
function sortFunction (a, b) {
    if (a[1] === b[1]) {
        return 0;
    } else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}
