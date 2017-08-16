// @flow
'use strict';

/**
 * @module recipes for the one.Picture APP
 * @author <a href="lukas-forster-augsburg@web.de">Lukas Forster</a>
 * @license http://creativecommons.org/licenses/by-nc-sa/2.5/
 * All content on this website (including text, images, source code and any other original
 * works), unless otherwise noted, is licensed under a Creative Commons License.
 * @version 0.0.1
 */
const ObjectRecipes = require('One/lib/object-recipes');

/*
 * This object is used to store the data produced by several sensors during one(!) recording
 * session for one(!) patient. PersonID and sessionID are therefore the two keys needed for an
 * explicit identification of each object (since there might be several sessions for one
 * patient and, of course, several different persons which all start with their first
 * session). The most important attribute of this object is sensorData which is a list/array
 * of EGaitSensorDataObj (which contain the actually recorded sensor data).
 */

ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitFullSensorData',
    rule: [
        {
            //MANDATORY
            // <span itemprop="personID">${number}</span>
            type: 'RecipeRule',
            itemprop: 'personID',
            isId: true,
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="sessionID">${number}</span>
            type: 'RecipeRule',
            itemprop: 'sessionID',
            isId: true,
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="startTime">${number}</span>
            type: 'RecipeRule',
            itemprop: 'startTime',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="stopTime">${number}</span>
            type: 'RecipeRule',
            itemprop: 'stopTime',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="instructor">${string}</span>
            type: 'RecipeRule',
            itemprop: 'instructor',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="comment">${string}</span>
            type: 'RecipeRule',
            itemprop: 'comment',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="sensorData" itemscope itemtype="http://gecko.io/EGaitSensorData">
            //        <span itemprop="header" itemscope itemtype="http://gecko.io/EGaitSensorDataHeader">
            //              <span itemprop="sensorPosition">${string}</span>
            //              <span itemprop="bluetoothMac">${string}</span>
            //              <span itemprop="sensorType">${string}</span>
            //              <span itemprop="samplingRate">${number}</span>
            //              <span itemprop="rangeAcc">${number}</span>
            //              <span itemprop="rangeGyr">${number}</span>
            //              <span itemprop="rangeAccUnits">${string}</span>
            //              <span itemprop="rangeGyrUnits">${string}</span>
            //              <span itemprop="dateLegend">${string[]}</span>
            //        </span>
            //        <span itemprop="rawData">${number[]}</span>
            //        <span itemprop="dimensionality">${number[]}</span>
            //        <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //              <span itemprop="labelName">${string}</span>
            //              <span itemprop="startSample">${number}</span>
            //              <span itemprop="duration">${number}</span>
            //        </span>
            //        <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //              <span itemprop="labelName">${string}</span>
            //              <span itemprop="startSample">${number}</span>
            //              <span itemprop="duration">${number}</span>
            //        </span>
            // </span>
            type: 'RecipeRule',
            itemprop: 'sensorData',
            includedType: new Set(['EGaitSensorData']),
            multiple: true,
            sequenceMatters: true
        }
    ]
});

/*
 * Each EGaitFullSensorDataObj can contain data recorded by several sensors. This is
 * accomplished by the introduction of a EGaitSenorDataObj which contains (besides the actual
 * recorded sensor data) information about the sensor (e.g. the sensor type) as an attribute
 * header and a list of potential data label (which are defined by SensorDataLabel). Each
 * EGaitFullSensorDataObj contains a list of such EGaitSensorDataobj
 */
ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitSensorData',
    rule: [
        {
            //MANDATORY
            // <span itemprop="header" itemscope itemtype="http://gecko.io/EGaitSensorDataHeader">
            //      <span itemprop="sensorPosition">${string}</span>
            //      <span itemprop="bluetoothMac">${string}</span>
            //      <span itemprop="sensorType">${string}</span>
            //      <span itemprop="samplingRate">${number}</span>
            //      <span itemprop="rangeAcc">${number}</span>
            //      <span itemprop="rangeGyr">${number}</span>
            //      <span itemprop="rangeAccUnits">${string}</span>
            //      <span itemprop="rangeGyrUnits">${string}</span>
            //      <span itemprop="dateLegend">${string[]}</span>
            // </span>
            type: 'RecipeRule',
            itemprop: 'header',
            includedType: new Set(['EGaitSensorDataHeader'])
        },
        {
            //MANDATORY
            // <span itemprop="rawData">${number}</span>
            // <span itemprop="rawData">${number}</span>
            // <span itemprop="rawData">${number}</span>
            type: 'RecipeRule',
            itemprop: 'rawData',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="dimensionality">${number}</span>
            // <span itemprop="dimensionality">${number}</span>
            // <span itemprop="dimensionality">${number}</span>
            type: 'RecipeRule',
            itemprop: 'dimensionality',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //OPTIONAL
            // <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName">${string}</span>
            //      <span itemprop="startSample">${number}</span>
            //      <span itemprop="duration">${number}</span>
            // </span>
            // <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName">${string}</span>
            //      <span itemprop="startSample">${number}</span>
            //      <span itemprop="duration">${number}</span>
            // </span>
            // <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName">${string}</span>
            //      <span itemprop="startSample">${number}</span>
            //      <span itemprop="duration">${number}</span>
            // </span>
            type: 'RecipeRule',
            itemprop: 'labels',
            includedType: new Set(['EGaitLabel']),
            multiple: true,
            sequenceMatters: true
        }
    ]
});

/*
 * The EGaitLabelObj is part of the EGaitSensorDataObj and the EGaitSegmentObj. Here, a list of
 * EGaitLabelObj is used to allow annotation of the data recorded by this sensor.
 */
ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitLabel',
    rule: [
        {
            //MANDATORY
            // <span itemprop="labelName">${string}</span>
            type: 'RecipeRule',
            itemprop: 'labelName',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="startSample">${number}</span>
            type: 'RecipeRule',
            itemprop: 'startSample',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="duration">${number}</span>
            type: 'RecipeRule',
            itemprop: 'duration',
            jsType: 'number'
        }
    ]
});

/*
 * The EGaitSensorDataHeaderObj is part of the EGaitSensorDataObj and contains basic information
 * about the recording sensor.
 */
ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitSensorDataHeader',
    rule: [
        {
            //MANDATORY
            // <span itemprop="sensorposition">${string}</span>
            type: 'RecipeRule',
            itemprop: 'sensorPosition',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="bluetoothMac">${string}</span>
            type: 'RecipeRule',
            itemprop: 'bluetoothMac',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="sensorType">${string}</span>
            type: 'RecipeRule',
            itemprop: 'sensorType',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="samplingRate">${number}</span>
            type: 'RecipeRule',
            itemprop: 'samplingRate',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="rangeAcc">${number}</span>
            type: 'RecipeRule',
            itemprop: 'rangeAcc',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="RangeGyr">${number}</span>
            type: 'RecipeRule',
            itemprop: 'rangeGyr',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="RangeAccUnits">${string}</span>
            type: 'RecipeRule',
            itemprop: 'rangeAccUnits',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="RangeGyrUnits">${string}</span>
            type: 'RecipeRule',
            itemprop: 'rangeGyrUnits',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="dataLegend">${string[]}</span>
            type: 'RecipeRule',
            itemprop: 'dataLegend',
            multiple: true,
            sequenceMatters: true,
            jsType: 'string'
        }
    ]
});



/*
 * sDTW - Main Object
 * The EGaitSegmentationObj is used to store the segmentation of data (For one patient + one
 * session) produces in the segmentation step of the eGait-pipeline. The segmentation results
 * for each sensor are stored in a EGaitSegmentationSensorObj which is the main component of
 * this object.
 */
ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitSegmentation',
    rule: [
        {
            // MANDATORY
            //<span itemprop="personID">${number}<\span>
            type: 'RecipeRule',
            itemprop: 'personID',
            isId: true,
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="sessionID">${number}</span>
            type: 'RecipeRule',
            itemprop: 'sessionID',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="segmentationSensors" itemscope itemtype="http://gecko.io/EGaitSegmentaionSensor">
            //      <span itemprop="distMatrix">${number[]}</span>
            //      <span itemprop="distMatrix">${number[]}</span>
            //      <span itemprop="costMatrix">${number[]}</span>
            //      <span itemprop="costMatrix">${number[]}</span>
            //      <span itemprop="segments" itemscope itemtype="http://gecko.io/EGaitSegment">
            //          <span itemprop="path">${number}</span>
            //          <span itemprop="path">${number}</span>
            //          <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //              <span itemprop="labelName">${string}</span>
            //              <span itemprop="startSample">${number}</span>
            //              <span itemprop="duration">${number}</span>
            //          </span>
            //          <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //              <span itemprop="labelName">${string}</span>
            //              <span itemprop="startSample">${number}</span>
            //              <span itemprop="duration">${number}</span>
            //          </span>
            //      </span>
            // </span>
            type: 'RecipeRule',
            itemprop: 'segmentationSensors',
            includedType: new Set(['EGaitSegmentationSensor']),
            multiple: true,
            sequenceMatters: true
        }
    ]
});

/*
 * sDTW - Sub Object
 * EGaitSegmentationSensorObjs contain contains data relevant for segmentation such as the
 * distance matrix, the cost matrix and a list of EGaitSegmentObj (one/detected segment).
 */
ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitSegmentationSensor',
    rule: [
        {
            //MANDATORY
            // <span itemprop="distMatrix">${number[]}</span>
            // <span itemprop="distMatrix">${number[]}</span>
            type: 'RecipeRule',
            itemprop: 'distMatrix',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="costMatrix">${number[]}</span>
            // <span itemprop="costMatrix">${number[]}</span>
            type: 'RecipeRule',
            itemprop: 'costMatrix',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="segments" itemscope itemtype="http://gecko.io/EGaitSegment">
            //      <span itemprop="path">${number}</span>
            //      <span itemprop="path">${number}</span>
            //      <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //          <span itemprop="labelName">${string}</span>
            //          <span itemprop="startSample">${number}</span>
            //          <span itemprop="duration">${number}</span>
            //      </span>
            //      <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //          <span itemprop="labelName">${string}</span>
            //          <span itemprop="startSample">${number}</span>
            //          <span itemprop="duration">${number}</span>
            //      </span>
            // </span>
            type: 'RecipeRule',
            itemprop: 'segments',
            includedType: new Set(['EGaitSegment']),
            multiple: true,
            sequenceMatters: true
        }
    ]
});

//ToDO Update the description once the segmentation step is actually added to the pipeline.
/*
 * sDTW - Sub Object
 * EGaitSegmentObjs contain information regarding one segment identified using sDTW.
 */
ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitSegment',
    rule: [
        {
            //MANDATORY
            // <span itemprop="path">${number}</span>
            // <span itemprop="path">${number}</span>
            // <span itemprop="path">${number}</span>
            type: 'RecipeRule',
            itemprop: 'path',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName">${string}</span>
            //      <span itemprop="startSample">${number}</span>
            //      <span itemprop="duration">${number}</span>
            // </span>
            // <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName">${string}</span>
            //      <span itemprop="startSample">${number}</span>
            //      <span itemprop="duration">${number}</span>
            // </span>
            // <span itemprop="labels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName">${string}</span>
            //      <span itemprop="startSample">${number}</span>
            //      <span itemprop="duration">${number}</span>
            // </span>
            type: 'RecipeRule',
            itemprop: 'labelList',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        }
    ]
});




/*
 * Event Labels - Main Object
 * The EGaitEventLabelsObj stores the labels associated to each step by the patient. The
 * attribute eventLabelsSensor contains the labels for each step for each individual sensor
 * used for recording. The attributes personID and sessionID are used for identification of
 * a specific session for one patient.
 */
ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitEventLabels',
    rule: [
        {
            //MANDATORY
            // <span itemprop="personID">${number}</span>
            type: 'RecipeRule',
            itemprop: 'personID',
            isId: true,
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="sessionID">${number}</span>
            type: 'RecipeRule',
            itemprop: 'sessionID',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="eventLabelsSensor" itemscope itemtype="http://gecko.io/EGaitEventLabelsSensor">
            //      <span itemprop="toLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //          <span itemprop="labelName">${string}</span>
            //          <span itemprop="startSample">${number}</span>
            //          <span itemprop="duration">${number}</span>
            //      </span>
            //      <span itemprop="hsLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //          <span itemprop="labelName">${string}</span>
            //          <span itemprop="startSample">${number}</span>
            //          <span itemprop="duration">${number}</span>
            //      </span>
            //      <span itemprop="msLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //          <span itemprop="labelName">${string}</span>
            //          <span itemprop="startSample">${number}</span>
            //          <span itemprop="duration">${number}</span>
            //      </span>
            type: 'RecipeRule',
            itemprop: 'eventLabelsSensors',
            includedType: new Set(['EGaitEventLabelsSensor']),
            multiple: true,
            sequenceMatters: true
        }
    ]
});

/*
 * Event Labels - Sub Object
 * This object contains the the different labels associated to each step (->list)
 * of a patient.
 */

ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitEventLabelsSensor',
    rule: [
        {
            //MANDATORY
            // <span itemprop="toLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName>${string}</span>
            //      <span itemprop="startSample>${number}</span>
            //      <span itemprop="duration">${number}</span>
            // <span itemprop="toLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName>${string}</span>
            //      <span itemprop="startSample>${number}</span>
            //      <span itemprop="duration">${number}</span>
            // <span itemprop="toLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName>${string}</span>
            //      <span itemprop="startSample>${number}</span>
            //      <span itemprop="duration">${number}</span>
            type: 'RecipeRule',
            itemprop: 'toLabels',
            includedType: new Set(['EGaitLabel']),
            multiple: true,
            sequenceMatters: true
        },
        {
            //MANDATORY
            // <span itemprop="hsLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName>${string}</span>
            //      <span itemprop="startSample>${number}</span>
            //      <span itemprop="duration">${number}</span>
            // <span itemprop="hsLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName>${string}</span>
            //      <span itemprop="startSample>${number}</span>
            //      <span itemprop="duration">${number}</span>
            // <span itemprop="hsLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName>${string}</span>
            //      <span itemprop="startSample>${number}</span>
            //      <span itemprop="duration">${number}</span>
            type: 'RecipeRule',
            itemprop: 'hsLabels',
            includedType: new Set(['EGaitLabel']),
            multiple: true,
            sequenceMatters: true
        },
        {
            //MANDATORY
            // <span itemprop="msLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName>${string}</span>
            //      <span itemprop="startSample>${number}</span>
            //      <span itemprop="duration">${number}</span>
            // <span itemprop="msLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName>${string}</span>
            //      <span itemprop="startSample>${number}</span>
            //      <span itemprop="duration">${number}</span>
            // <span itemprop="msLabels" itemscope itemtype="http://gecko.io/EGaitLabel">
            //      <span itemprop="labelName>${string}</span>
            //      <span itemprop="startSample>${number}</span>
            //      <span itemprop="duration">${number}</span>
            type: 'RecipeRule',
            itemprop: 'msLabels',
            includedType: new Set(['EGaitLabel']),
            multiple: true,
            sequenceMatters: true
        }
    ]
});




/**
 * 3D Trajectory - Main Object
 * This Object is used to store the 3D trajectories computed for each sensor signal and each stride during the eGait-pipeline. The attributes
 * personID and sessionID are used for object identification while trajectoriesSenor contains the trajectories computed for each sensor (each
 * element corresponds to one sensor)
 */
ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitTrajectory3D',
    rule: [
        {
            //MANDATORY
            // <span itemprop="personID">${number}</span>
            type: 'RecipeRule',
            itemprop: 'personID',
            isId: true,
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="sessionID">${number}</span>
            type: 'RecipeRule',
            itemprop: 'sessionID',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="trajectoriesSensor" itemscope itemtype="http://gecko.io/EGaitTrajectories3DSensor">
            //      <span itemprop="trajectoriesStride itemscope itemtype="http://gecko.io/EGaitTrajectories3DStride">
            //          <span itemprop="q">${number[]}</span>
            //          <span itemprop="a">${number[]}</span>
            //          <span itemprop="v">${number[]}</span>
            //          <span itemprop="s">${number[]}</span>
            //      </span>
            //      <span itemprop="trajectoriesStride itemscope itemtype="http://gecko.io/EGaitTrajectories3DStride">
            //          <span itemprop="q">${number[]}</span>
            //          <span itemprop="a">${number[]}</span>
            //          <span itemprop="v">${number[]}</span>
            //          <span itemprop="s">${number[]}</span>
            //      </span>
            // </span>
            // <span itemprop="trajectoriesSensor" itemscope itemtype="http://gecko.io/EGaitTrajectories3DSensor">
            //      <span itemprop="trajectoriesStride itemscope itemtype="http://gecko.io/EGaitTrajectories3DStride">
            //          <span itemprop="q">${number[]}</span>
            //          <span itemprop="a">${number[]}</span>
            //          <span itemprop="v">${number[]}</span>
            //          <span itemprop="s">${number[]}</span>
            //      </span>
            //      <span itemprop="trajectoriesStride itemscope itemtype="http://gecko.io/EGaitTrajectories3DStride">
            //          <span itemprop="q">${number[]}</span>
            //          <span itemprop="a">${number[]}</span>
            //          <span itemprop="v">${number[]}</span>
            //          <span itemprop="s">${number[]}</span>
            //      </span>
            // </span>
            type: 'RecipeRule',
            itemprop: 'trajectoriesSensor',
            includedType: new Set(['EGaitTrajectory3DSensor']),
            multiple: true,
            sequenceMatters: true
        }
    ]
});

/**
 * 3D Trajectory - Sub Object
 * This object is used to store the trajectories for each stride for an individual sensor. These trajectories can be found in
 * trajectoriesStride (each element corresponds to one stride).
 */

ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitTrajectory3DSensor',
    rule: [
        {
            //MANDATORY
            // <span itemprop="trajectoriesStride itemscope itemtype="http://gecko.io/EGaitTrajectories3DStride">
            //      <span itemprop="q">${number[]}</span>
            //      <span itemprop="a">${number[]}</span>
            //      <span itemprop="v">${number[]}</span>
            //      <span itemprop="s">${number[]}</span>
            // </span>
            type: 'RecipeRule',
            itemprop: 'trajectoriesStride',
            includedType: new Set(['EGaitTrajectory3DStride']),
            multiple: true,
            sequenceMatters: true
        }
    ]
});

/**
 * 3D Trajectory - Sub Object
 * This object contains the trajectories for each individual stride. q corresponds to quaternions, a to acceleration, v to speed and s to
 * distance.
 */

ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitTrajectory3DStride',
    rule: [
        {
            //MANDATORY
            // <span itemprop="q">${number[]}</span>
            type: 'RecipeRule',
            itemprop: 'q',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="a">${number[]}</span>
            type: 'RecipeRule',
            itemprop: 'a',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="v">${number[]}</span>
            type: 'RecipeRule',
            itemprop: 'v',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="s">${number[]}</span>
            type: 'RecipeRule',
            itemprop: 's',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        }
    ]
});



/**
 * GAIT FEATURES - Main Object
 * This object is used to store the features resulting form the eGait-pipeline which can be interpreted by a physician. The features are
 * stored by sensor (and strides) in featuresSensor. The attributes personID and sessionID are used for identification.
 */
ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitFeatures',
    rule: [
        {
            //MANDATORY
            // <span itemprop="personID">${number}</span>
            type: 'RecipeRule',
            itemprop: 'personID',
            isId: true,
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="sessionID">{number}</span>
            type: 'RecipeRule',
            itemprop: 'sessionID',
            jsType: 'string'
        },
        {
            //MANDATORY
            // <span itemprop="featuresSensor" itemscope itemtype="http://gecko.io/EGaitFeaturesSensor>
            //      <span itemprop="featuresStride" itemscope itemtype="http://gecko.io/EGaitFeaturesStride">
            //          <span itemprop="angleFrontal">${number[]}</span>
            //          <span itemprop="angleTransversal">${number[]}</span>
            //          <span itemprop="angleSagittal">${number[]}</span>
            //          <span itemprop="posFrontal">${number[]}</span>
            //          <span itemprop="posTransversal">${number[]}</span>
            //          <span itemprop="posSagittal">${number[]}</span>
            //          <span itemprop="velFrontal">${number[]}</span>
            //          <span itemprop="velTransversal">${number[]}</span>
            //          <span itemprop="velSagittal">${number[]}</span>
            //          <span itemprop="accFrontal">${number[]}</span>
            //          <span itemprop="accTransversal">${number[]}</span>
            //          <span itemprop="accSagittal">${number[]}</span>
            //          <span itemprop="timeStamp">${number}</span>
            //          <span itemprop="strideTime">${number}</span>
            //          <span itemprop="swingTime">${number}</span>
            //          <span itemprop="stanceTime">${number}</span>
            //          <span itemprop="strideLength">${number}</span>
            //          <span itemprop="lateralDisplacement">${number}</span>
            //          <span itemprop="maxLateralSwing">${number}</span>
            //          <span itemprop="groundVelocity">${number}</span>
            //          <span itemprop="heelStrikeAngle">${number}</span>
            //          <span itemprop="toeOffAngle">${number}</span>
            //          <span itemprop="maxToeClearance">${number}</span>
            //          <span itemprop="pushOffAcc">${number}</span>
            //          <span itemprop="landingAcc">${number}</span>
            //          <span itemprop="groundTurningAngle">${number}</span>
            //          <span itemprop="relHSSample">${number}</span>
            //          <span itemprop="relTOSample">${number}</span>
            //      </span>
            //      <span itemprop="featuresStride" itemscope itemtype="http://gecko.io/EGaitFeaturesStride">
            //          <span itemprop="angleFrontal">${number[]}</span>
            //          <span itemprop="angleTransversal">${number[]}</span>
            //          <span itemprop="angleSagittal">${number[]}</span>
            //          <span itemprop="posFrontal">${number[]}</span>
            //          <span itemprop="posTransversal">${number[]}</span>
            //          <span itemprop="posSagittal">${number[]}</span>
            //          <span itemprop="velFrontal">${number[]}</span>
            //          <span itemprop="velTransversal">${number[]}</span>
            //          <span itemprop="velSagittal">${number[]}</span>
            //          <span itemprop="accFrontal">${number[]}</span>
            //          <span itemprop="accTransversal">${number[]}</span>
            //          <span itemprop="accSagittal">${number[]}</span>
            //          <span itemprop="timeStamp">${number}</span>
            //          <span itemprop="strideTime">${number}</span>
            //          <span itemprop="swingTime">${number}</span>
            //          <span itemprop="stanceTime">${number}</span>
            //          <span itemprop="strideLength">${number}</span>
            //          <span itemprop="lateralDisplacement">${number}</span>
            //          <span itemprop="maxLateralSwing">${number}</span>
            //          <span itemprop="groundVelocity">${number}</span>
            //          <span itemprop="heelStrikeAngle">${number}</span>
            //          <span itemprop="toeOffAngle">${number}</span>
            //          <span itemprop="maxToeClearance">${number}</span>
            //          <span itemprop="pushOffAcc">${number}</span>
            //          <span itemprop="landingAcc">${number}</span>
            //          <span itemprop="groundTurningAngle">${number}</span>
            //          <span itemprop="relHSSample">${number}</span>
            //          <span itemprop="relTOSample">${number}</span>
            //      </span>
            // </span>
            type: 'RecipeRule',
            itemprop: 'featuresSensor',
            includedType: new Set(['EGaitFeaturesSensor']),
            multiple: true,
            sequenceMatters: true
        }
    ]
});

/**
 * GAIT FEATURES - Sub Object
 * This object stores the features computed by the eGait-pipeline for each stride.
 */

ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitFeaturesSensor',
    rule: [
        {
            //MANDATORY
            // <span itemprop="featuresStride" itemscope itemtype="http://gecko.io/EGaitFeaturesStride">
            //      <span itemprop="angleFrontal">${number[]}</span>
            //      <span itemprop="angleTransversal">${number[]}</span>
            //      <span itemprop="angleSagittal">${number[]}</span>
            //      <span itemprop="posFrontal">${number[]}</span>
            //      <span itemprop="posTransversal">${number[]}</span>
            //      <span itemprop="posSagittal">${number[]}</span>
            //      <span itemprop="velFrontal">${number[]}</span>
            //      <span itemprop="velTransversal">${number[]}</span>
            //      <span itemprop="velSagittal">${number[]}</span>
            //      <span itemprop="accFrontal">${number[]}</span>
            //      <span itemprop="accTransversal">${number[]}</span>
            //      <span itemprop="accSagittal">${number[]}</span>
            //      <span itemprop="timeStamp">${number}</span>
            //      <span itemprop="strideTime">${number}</span>
            //      <span itemprop="swingTime">${number}</span>
            //      <span itemprop="stanceTime">${number}</span>
            //      <span itemprop="strideLength">${number}</span>
            //      <span itemprop="lateralDisplacement">${number}</span>
            //      <span itemprop="maxLateralSwing">${number}</span>
            //      <span itemprop="groundVelocity">${number}</span>
            //      <span itemprop="heelStrikeAngle">${number}</span>
            //      <span itemprop="toeOffAngle">${number}</span>
            //      <span itemprop="maxToeClearance">${number}</span>
            //      <span itemprop="pushOffAcc">${number}</span>
            //      <span itemprop="landingAcc">${number}</span>
            //      <span itemprop="groundTurningAngle">${number}</span>
            //      <span itemprop="relHSSample">${number}</span>
            //      <span itemprop="relTOSample">${number}</span>
            // </span>
            type: 'RecipeRule',
            itemprop: 'featuresStride',
            includedType: new Set(['EGaitFeaturesStride']),
            multiple: true,
            sequenceMatters: true
        }
    ]
});

/**
 * GAIT FEATURES - Sub Object
 * The features produced by the eGait-pipeline.
 */
ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'EGaitFeaturesStride',
    rule: [
        {
            //MANDATORY
            // <span itemprop="angleFrontal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'angleFrontal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="angleTransversal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'angleTransversal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="angleSagittal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'angleSagittal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="posFrontal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'posFrontal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="posTransversal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'posTransversal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="posSagittal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'posSagittal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="velFrontal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'velFrontal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="velTransversal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'velTransversal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="velSagittal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'velSagittal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="accFrontal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'accFrontal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="accTransversal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'accTransversal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="accSagittal">${number[]}{/span}
            type: 'RecipeRule',
            itemprop: 'accSagittal',
            multiple: true,
            sequenceMatters: true,
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="timeStamp">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'timeStamp',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="strideTime">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'strideTime',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="swingTime">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'swingTime',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="stanceTime">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'stanceTime',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="strideLength">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'strideLength',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="lateralDisplacement">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'lateralDisplacement',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="maxLateralSwing">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'maxLateralSwing',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="groundVelocity">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'groundVelocity',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="heelStrikeAngle">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'heelStrikeAngle',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="toeOffAngle">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'toeOffAngle',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="maxToeClearance">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'maxToeClearance',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="pushOffAcc">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'pushOffAcc',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="landingAcc">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'landingAcc',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="groundTurningAngle">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'groundTurningAngle',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="relHSSample">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'relHSSample',
            jsType: 'number'
        },
        {
            //MANDATORY
            // <span itemprop="relTOSample">${number}{/span}
            type: 'RecipeRule',
            itemprop: 'relTOSample',
            jsType: 'number'
        }
    ]
});
