// @flow
'use strict';

/**
 * Created by Lukas on 20.06.2017.
 * Continued(Modified) by Prashant on 01.07.2017
 * This is the ONE version of the Demopipeline.js version -> 22.06.2017, 8:53AM !!!
 * In addition to the original pipeline, ONE-objects are created and stored.
 */

import type {VersionedObjectCreationResult, WriteStorageApiObj} from 'One/lib/storage';

const math = require('mathjs');
const eGaitData = require('./import_eGaITData.js');
const calibrate = require('./calibrate.js');
const filter = require('./filter.js');
const hardCoded = require('./test.js');
const sDTW = require('./sDTW.js');
const gaitEvents = require('./gaitEvents.js');
const spatialTrajectory3D = require('./spatialTrajectory3D.js');
const SensorData = require('./SensorData.js');
const gaitEventFeatures = require('./gaitFeatures.js');

//ToDO COMMENT: Right now the demopipeline is based on JavaScript-objects. The ONE-objects are "filled" using the
//information content of these JavaScript-objects. In this scenario, two different kinds of objects with (at least close
//to) redundant information are created. It might be beneficial to change the functions used in the pipeline (a) to
//produce ONE-objects directly or (b) to produce "primitive" output which can be used to "fill" ONE-objects AND
//JavaScript-objects (since the later ones might be useful for debugging purposes this might be the better solution).

//ToDO COMMENT: In case you want to adapt the current ONE-objects you have to do this in lib/recipes.js AS WELL AS in
//flow-typed/One.js!

exports.createObjects = async function (
    WriteStorage: WriteStorageApiObj,
    //TODO Change this to actual filename!!! Hardcoded filenames are never a good idea!
    fileDirectory: string,
    accCalibrationLeft: string,
    gyroCalibrationLeft: string,
    accCalibrationRight: string,
    gyroCalibrationRight: string
): Promise<VersionedObjectCreationResult<EGaitTrajectory3DObj>> {

    //PIPELINE STEP BEGIN
    /** Reading SensorData and Creating SensorData Obj*/
    const sensorData = eGaitData.importData(fileDirectory);

    const calibrationFiles = [
        {
            foot: 'LeftFoot',
            Acc: calibrate.csv2Mat(accCalibrationLeft, 'acc'),
            Gyr: calibrate.csv2Mat(gyroCalibrationLeft, 'gyro')
        },
        {
            foot: 'RightFoot',
            Acc: calibrate.csv2Mat(accCalibrationRight, 'acc'),
            Gyr: calibrate.csv2Mat(gyroCalibrationRight, 'gyro')
        }
    ];

    const calibratedData = [];
    const calibratedFinalData = [];
    const calibFilteredFinalData = [];

    sensorData.data.forEach((v, i) => {
        const data = math.clone(sensorData.data[i]);
        const position = SensorData.getSensorPosition(sensorData,i);
        calibratedData[i] = calibrate.calibrateRawData(data, calibrationFiles[i].Acc, calibrationFiles[i].Gyr);
        calibratedFinalData[i] = calibrate.changeAxis(calibratedData[i]);

        if (position === 'RightFoot') {
            calibratedFinalData[i] = calibrate.invertAxis(calibratedFinalData[i]);
        }
        const temp = [];
        for (let j = 0; j < calibratedFinalData[i].length; ++j) {
            temp[j] = filter.getFilteredData(5, calibratedFinalData[i][j]);
        }

        calibFilteredFinalData[i] = math.clone(temp);
        if (position === 'RightFoot') {
            calibFilteredFinalData[i] = calibrate.invertAxisRightOnly(calibFilteredFinalData[i]);
        }
    });

    SensorData.setData(sensorData, sensorData.dataHeader, calibratedFinalData);
    //PIPELINE STEP END

    //Store sensorData in ONE
    //Initialize object. The description for this object can be found in lib/recipes.js#L708 and flow-typed/One.js#L140.
    const fullSensorDataObjONE: EGaitFullSensorDataObj = {
        type: 'EGaitFullSensorData',
        personID: sensorData.metainfo.PersonId,
        sessionID: sensorData.metainfo.SessionId,
        startTime: sensorData.metainfo.StartTime,
        stopTime: sensorData.metainfo.StopTime,
        instructor: sensorData.metainfo.Instructor,
        comment: sensorData.metainfo.Comment,
        sensorData: []
    };

    //Set data for each sensor ("First" dimension of sensorData.data and sensorData.dataHeader)
    let arraySize;

    for (let i = 0; i < sensorData.data.length; i++) {
        arraySize = math.size(sensorData.data[i]);
        fullSensorDataObjONE.sensorData.push({
            type: 'EGaitSensorData',
            header: {
                type: 'EGaitSensorDataHeader',
                sensorPosition: sensorData.dataHeader[i].SensorPosition,
                bluetoothMac: sensorData.dataHeader[i].BluetoothMac,
                sensorType: sensorData.dataHeader[i].SensorType,
                samplingRate: sensorData.dataHeader[i].SamplingRate,
                rangeAcc: sensorData.dataHeader[i].RangeAcc,
                rangeGyr: sensorData.dataHeader[i].RangeGyr,
                rangeAccUnits: sensorData.dataHeader[i].RangeAccUnits,
                rangeGyrUnits: sensorData.dataHeader[i].RangeGyrUnits,
                dataLegend: sensorData.dataHeader[i].DataLegend
            },
            rawData: math.flatten(sensorData.data[i]),
            dimensionality: new Array(arraySize[0]).fill(arraySize[1])
        });
    }

    //TODO Store labels as well!

    //Store the crated EGaitFullSensorDataObj in ONE
    await WriteStorage.storeVersionedObject(fullSensorDataObjONE);

    //PIPELINE STEP BEGIN
    const normalizedSensorData = [];
    const sDTWObj = [];
    const tem = math.transpose(hardCoded.template());
    const template = math.transpose(math.matrix([tem._data[4],tem._data[5]]));

    sensorData.data.forEach((v,i) => {
        normalizedSensorData[i] = math.matrix([math.divide(calibFilteredFinalData[i][4], 500), math.divide(calibFilteredFinalData[i][5], 500)]);
        const temp = new sDTW();
        temp.result(math.transpose(normalizedSensorData[i]), template,35);
        sDTWObj.push(temp);
    });
    //PIPELINE STEP END

    //Store sDTWObj in ONE
    //Initialize object. The description for this object can be found in lib/recipes.js#L631 and flow-typed/One.js#L164
    const segmentationObjONE: EGaitSegmentationObj = {
        type: 'EGaitSegmentation',
        personID: sensorData.metainfo.PersonId,
        sessionID: sensorData.metainfo.SessionId,
        segmentationSensors: []
    };

    //Set data for each sensor (Length of sDTWObj)
    for (let i = 0; i < sDTWObj.length; i++) {
        const tempSegments = [];
        //TODO I am not sure about this but i do not fully understand your sDTW-object. Please check this at some point
        //of time!
        for (let j = 0; j < sDTWObj[i].paths.length; j++) {
            tempSegments.push({
                type: 'EGaitSegment',
                path: math.flatten(sDTWObj[i].paths[j]._data),
                labelList: sDTWObj[i].labelList[j]
            });
        }

        segmentationObjONE.segmentationSensors.push({
            type: 'EGaitSegmentationSensor',
            //TODO Since there is no dimensionality information in the ONE object the distMatrix must be nxn!
            //Correct if this is not the case (but should be valid for distance matrix). Same for costMatrix and path.
            //TODO PLEASE CHECK THIS: math.flatten(sDTWObj[i].distMatrix._data) did not work for some reason!
            distMatrix: sDTWObj[i].distMatrix._data[0],
            costMatrix: sDTWObj[i].costMatrix._data[0],
            segments: []
        });


    }

    //Store the created EGaitSegmentationObj in ONE
    await WriteStorage.storeVersionedObject(segmentationObjONE);

    //PIPELINE STEP BEGIN
    const gaitEventObj = [];

    sensorData.data.forEach((v,i) => {
        const temp = new gaitEvents();
        const labelListStrides = sDTWObj[i].labelList;
        temp.getGaitEventResults(sensorData, labelListStrides, i);
        gaitEventObj.push(temp);
    });
    //PIPELINE STEP END

    //Store gaitEventObj in ONE
    //Initialize object. The description for this object can be found in lib/recipes.js#L20 and flow-typed/One.js#L82
    const eventLabelsObjONE: EGaitEventLabelsObj = {
        type: 'EGaitEventLabels',
        personID: sensorData.metainfo.PersonId,
        sessionID: sensorData.metainfo.SessionId,
        eventLabelsSensors: []
    };

    //Set data for each sensor (Array elements of gaitEventObj)
    //TODO Maybe use map instead.
    for (let i = 0; i < gaitEventObj.length; i++) {
        const toTemp = [];
        const hsTemp = [];
        const msTemp = [];

        //TODO Check whether the lengths of TOLabels, HSLabels and MSLabels are identical -> one loop is sufficient.
        //Since I cannot simply assume this, one loop/label type is used.
        for (let j = 0; j < gaitEventObj[i].TOLabels.length; j++) {
            toTemp.push({
                type: 'EGaitLabel',
                labelName: gaitEventObj[i].TOLabels[j].name,
                startSample: gaitEventObj[i].TOLabels[j].start,
                duration: gaitEventObj[i].TOLabels[j].length
            });

            hsTemp.push({
                type: 'EGaitLabel',
                labelName: gaitEventObj[i].HSLabels[j].name,
                startSample: gaitEventObj[i].HSLabels[j].start,
                duration: gaitEventObj[i].HSLabels[j].length
            });

            msTemp.push({
                type: 'EGaitLabel',
                labelName: gaitEventObj[i].MSLabels[j].name,
                startSample: gaitEventObj[i].MSLabels[j].start,
                duration: gaitEventObj[i].MSLabels[j].length
            });
        }

        eventLabelsObjONE.eventLabelsSensors.push({
            type: 'EGaitEventLabelsSensor',
            toLabels: toTemp,
            hsLabels: hsTemp,
            msLabels: msTemp
        });
    }

    //Store the created EGaitSegmentationObj in ONE
    await WriteStorage.storeVersionedObject(eventLabelsObjONE);

    //PIPELINE STEP BEGIN
    const spatialObj = new spatialTrajectory3D({});
    spatialObj.maxIntTime(sensorData, sDTWObj);
    spatialObj.computeTrajectory(sensorData, gaitEventObj);
    //PIPELINE STEP END

    //Store spatialObj in ONE
    //Initialize object. The description for this object can be found in lib/recipes.js#L949 and flow-typed/One.js#L224
    const trajectory3DObjONE: EGaitTrajectory3DObj = {
        type: 'EGaitTrajectory3D',
        personID: sensorData.metainfo.PersonId,
        sessionID: sensorData.metainfo.SessionId,
        trajectoriesSensor: []
    };

    // Set data for each sensor ("First" dimension of q/a/v/s)
    // TODO Maybe use map instead.
    for (let iSensor = 0; iSensor < spatialObj.q.length; ++iSensor) { // Sensor loop [0]-> Left, [1]-> Right
        const tempTrajectory3DSensor = [];

        for (let jStride = 0; jStride < spatialObj.q[iSensor].length; ++jStride) {
            tempTrajectory3DSensor.push({
                type: 'EGaitTrajectory3DStride',
                //TODO FIX ME: Something is wrong with spatialTrajectory3D.js
                // Trying to store one array although at every stride there is an array<array>
                // q -> Each stride N*4 array<array> & a,v,s -> Each stride N*3 array<array>
                q: [1,2,3], //spatialObj.q[iSensor][jStride],
                a: [1,2,3], //spatialObj.a[iSensor][jStride],
                v: [1,2,3], //spatialObj.v[iSensor][jStride],
                s: [1,2,3] //spatialObj.s[iSensor][jStride]//
            });
        }

        trajectory3DObjONE.trajectoriesSensor.push({
            type: 'EGaitTrajectory3DSensor',
            trajectoriesStride: tempTrajectory3DSensor
        });
    }

    //Store the created EGaitSegmentationObj in ONE
    await WriteStorage.storeVersionedObject(trajectory3DObjONE);

    //PIPELINE STEP BEGIN
    const gaitFeatures = new gaitEventFeatures();
    gaitFeatures.getFeatures(sensorData, spatialObj, gaitEventObj);
    //PIPELINE STEP END

    // Store gaitFeatures in ONE
    // Initialize object. Description can be found in lib/recipes.js#L679 and flow-typed/One.js#L224
    // const gaitFeaturesONE: EGaitFeaturesObj = {
    //     type: EGaitFeatures,
    //     personID: sensorData.metainfo.PersonId,
    //     sessionID: sensorData.metainfo.SessionId,
    //     featuresSensor: []
    // };
    //
    // gaitFeaturesONE.featuresSensor.push({
    //     type: 'EGaitFeaturesSensor',
    //     featuresStride: {
    //         type: EGaitFeaturesStride,
    //         angleFrontal: gaitFeatures.angle[0][0].Frontal,
    //         angleTransversal: gaitFeatures.angle[0][0].Transversal,
    //         angleSagittal: gaitFeatures.angle[0][0].Sagittal,
    //         posFrontal: gaitFeatures.pos[0][0].Frontal,
    //         posTransversal: gaitFeatures.pos[0][0].Transversal,
    //         posSagittal: gaitFeatures.pos[0][0].Sagittal,
    //         velFrontal: gaitFeatures.vel[0][0].Frontal,
    //         velTransversal: gaitFeatures.vel[0][0].Transversal,
    //         velSagittal: gaitFeatures.vel[0][0].Transversal,
    //         accFrontal: gaitFeatures.acc[0][0].Transversal,
    //         accTransversal: gaitFeatures.acc[0][0].Transversal,
    //         accSagittal: gaitFeatures.acc[0][0].Transversal,
    //         timeStamp: gaitFeatures.timeStamp[0],
    //         strideTime: gaitFeatures.strideTime[0],
    //         swingTime: gaitFeatures.swingTime[0],
    //         stanceTime: gaitFeatures.stanceTime[0],
    //         strideLength: gaitFeatures.strideLength[0],
    //         lateralDisplacement: gaitFeatures.lateralDisplacement[0],
    //         maxLateralSwing: gaitFeatures.maxLateralSwing[0],
    //         groundVelocity: gaitFeatures.groundVelocity[0],
    //         heelStrikeAngle: gaitFeatures.heelStrikeAngle[0],
    //         toeOffAngle: gaitFeatures.toeOffAngle[0],
    //         maxToeClearance: gaitFeatures.maxToeClearance[0],
    //         pushOffAcc: gaitFeatures.pushOffAcc[0],
    //         landingAcc: gaitFeatures.landingAcc[0],
    //         groundTurningAngle: gaitFeatures.groundTurningAngle[0],
    //         relHSSample: gaitFeatures.relHSSample[0],
    //         relTOSample: gaitFeatures.relTOSample[0]
    //     }
    // });
    // console.log(gaitFeaturesONE);
    //
    // WriteStorage.storeVersionedObject(gaitFeaturesONE);

    //Store the created EGaitTrajectory3DObj in ONE and return it
    // TODO In the current demopipeline version the features are not computed. Once this is added to the pipeline an
    // EGaitFeaturesObj (lib/recipes.js#L135 and  flow-typed/One.js#L96) should be returned instead and (1) added.
    return WriteStorage.storeVersionedObject(trajectory3DObjONE);
};
