// @flow
'use strict';

/**
 * This is a Javascript implementation of the Matlab function segmentaion.sDTW.
 * It defines the Basic Dataype of any kind of the SensorData.
 * It is notthe complete implementation as the data current available is not of the right type and properly arranged.
 * */

const math = require('mathjs');
const func = require('./sDTW_functions.js');

class sDTW {
    distMatrix: {_data: Array<Array<number>>, _size: Array<number>, _datatype: string};
    costMatrix: {_data: Array<Array<number>>, _size: Array<number>, _datatype: string};
    labelList: Array<Array<number>>;
    pathLength: Array<number>;
    paths: Array<Object>;
    distFunc: {_data: Array<number>, _size: Array<number>, _datatype: string};

    constructor () {
        this.distMatrix = {_data: [], _size: [], _datatype: ''};
        this.costMatrix = {_data: [], _size: [], _datatype: ''};
        this.distFunc = {_data: [], _size: [], _datatype: ''};
        this.paths = [];
        this.labelList = [];
        this.pathLength = [];
        //sensorData = [];
        //thresh = [];
        //channels = [];
        //sensors =  [];
        //metric = [];
        //ignoreSize  = [];
        //maxSegmentSize = [];
        //minSegmentSize = [];
    }

    result (sensorData: Object,template: Object, threshold: number) {
        // Start : STORING ALL INPUT IN inputParser
        const inputParser = {};
        // Have to check if the sensorData, template, and Threshold are of the requried typeof.
        inputParser.sensorData = sensorData;
        inputParser.template = template;
        inputParser.threshold = threshold;
        // Place a Check here for Number of Channels
        // Place a Check here for Number of Sensors

        // Have to check if the input metic is of the already defined type else through error.
        //if(inputParser.hasOwnProperty('metric') == false){
        //  inputParser.metric = 'euclidean';
        //}

        // the sensorData should be of the type SensorData. so it will provide us with the all information about the
        // dataHeaders. so for current I am hard coding the sampling rate.
        // set the max and min segment size and sized to be ignored in serach in distFunc
        inputParser.maxSegmentSize = math.ceil(2000e-3 * 102.400); //sampling hard coded should be extracted from the sensorData type object.
        inputParser.minSegmentSize = math.floor(250e-3 * 102.400);
        inputParser.ignoreSize = math.floor(100e-3 * 102.400);
        //>>>>>   End : STORING ALL INPUT IN inputParser <<<<<<<<< //
        // We have to check for normalization;

        //identify subseqences and compute teh labelList for each senor .. in this phase we have only one.
        // this should ba accessed from sensorData type object
        this.distMatrix = func.getDistanceMatrix(template,sensorData);

        this.costMatrix = func.getCostMatrix(this.distMatrix);

        this.distFunc = func.getDistanceFunction(this.costMatrix);

        // Getting Paths
        const outputs = func.getSubsequences(this.distFunc,this.costMatrix,inputParser.threshold,inputParser.minSegmentSize,inputParser.maxSegmentSize,inputParser.ignoreSize);
        this.paths = outputs[0];
        this.pathLength = outputs[1];
        //getting labelListlist;
        this.labelList = func.getLabelList(this.paths, this.pathLength);
    }
}
module.exports = sDTW;
