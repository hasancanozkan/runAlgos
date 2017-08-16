// @flow
'use strict';

import type {VersionedObjectCreationResult} from 'One/lib/storage';
import type {ModuleObj} from 'One/lib/object-recipes';


/**
 * Created by Lukas Forster on 09.05.2017.
 * This app conducts the first steps of the eGait-pipeline including reading the raw data and
 * pre-processing this raw data (calibration, filtering) originally written by Prashant Chauhari.
 *
 * Furthermore, this apps should produces a versioned ONEObject as a result (position in storage
 * defined by settings).
 */

// ToDo Further comments on the single steps in the pipeline
// Right now, there is not a lot of documentation in the code.

// ONE requirements
require('One/lib/logger.js').start();
const Instance = require('One/lib/instance.js');
const Storage = require('One/lib/storage.js');
const ModuleImporterNodeJs = require('One/lib/system/module-importer.js');
const MessageBus = require('One/lib/message-bus.js').create('app');

require('../lib/recipes.js');

const path = require('path');

const settings = require('../settings.js');

process.on('unhandledRejection', reason => {
    MessageBus.send('error', 'Unhandled rejected promise detected!');
    MessageBus.send('error', reason);
    process.exit(1);
});

const run = async function () {
    //test input
    const fileDirectory: string = '../data/TestData/';
    const accCalibrationLeft: string = '../data/dataset/B4F4_acc_left.csv';
    const gyroCalibrationLeft: string = '../data/dataset/B4F4_gyro_left.csv';
    const accCalibrationRight: string = '../data/dataset/B4F0_acc_right.csv';
    const gyroCalibrationRight: string = '../data/dataset/B4F0_gyro_right.csv';

    //initialize instance
    await Instance.init(settings.initialDataObj);

    //load all modules in gaitApp/lib/modules to ONE
    const modulesResults: Array<VersionedObjectCreationResult<ModuleObj>> =
        await ModuleImporterNodeJs.importJsModulesFromFs(
            path.join(__dirname, '..', 'lib', 'modules')
        );

    MessageBus.send('log', 'Modules imported:\n' +
        modulesResults.map((result: VersionedObjectCreationResult<ModuleObj>) =>
            result.obj.name + ' [' + result.objHash + ']'
        ).join(', ')
    );

    // TODO
    // By the way, regarding the "Plan" used for this demo, here the debug message that shows how
    // it is called:
    //
    // > storage-plan debug Run Plan [@module/Demopipeline_ONE]
    // [
    //    "../data/TestData/","../data/dataset/B4F4_acc_left.csv",
    //    "../data/dataset/B4F4_gyro_left.csv",
    //    "../data/dataset/B4F0_acc_right.csv",
    //    "../data/dataset/B4F0_gyro_right.csv"
    // ]
    //
    // In production this would not work. If the data changes but the filenames are the same the
    // next call to create the data would have the exact same arguments - and ONE would think "Oh I
    // already executed this exact same Plan. Let me return the results from last time!".
    //
    // It's sort of like the "pure function" concept in functional programming with Plans, the
    // result is supposed to only depend on what is given as parameter. So if there is some
    // invisible state (here: actual contents of those files) there must be a way to let ONE
    // know that two Plans are not the same. For example, I could include a dummy timestamp
    // parameter in the call, unused by the actual Plan function but part of the parameters, so
    // each Plan call looks different.
    //
    // Ideally the actual data would be in those parameters, or, suggestion: put the
    // HASH of the data (for each file) in the parameter list!) (if the data itself is too much and
    // is to be thrown away)
    //
    // About the hash suggestion, how it works if the data is to be kept: Save the data as BLOB in
    // ONE and you get such a hash. Then give the hash instead of a filename to the Plan function.
    // Of course, does not work if the data is ephemeral.

    //create versioned object using a plan
    const test: VersionedObjectCreationResult<EGaitTrajectory3DObj> =
        await Storage.createSingleObjectThroughPlan(
            {module: '@module/Demopipeline_ONE'},
            fileDirectory,
            accCalibrationLeft,
            gyroCalibrationLeft,
            accCalibrationRight,
            gyroCalibrationRight
        );

    // MessageBus.send('log', test.objHash);
    //
    // // create id object
    // const fullSensorDataIdObject = {
    //     type: 'EGaitFullSensorData',
    //     personID: test.obj.personID,
    //     sessionID: test.obj.sessionID,
    //     startTime: '',
    //     stopTime: '',
    //     instructor: '',
    //     comment: '',
    //     sensorData: []
    // };
    //
    // //check whether it is possible to get the object associated to this id object
    // const test2: VersionedObjectResult<EGaitFullSensorDataObj> = await Storage.getObjectByIdObj(
    //     fullSensorDataIdObject
    // );
    //
    // MessageBus.send('log', test2.obj.comment);
};


//noinspection JSIgnoredPromiseFromCall
run().catch(err =>
    MessageBus.send('error', err)
);
