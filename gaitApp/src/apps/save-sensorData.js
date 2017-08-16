// @flow
'use strict';

/**
 * Created by Lukas on 25.04.2017.
 * This is an simple example where a ONE object is created for a predefined FullSensorDataObj
 * and this predefined FullSensorDataObj is stored in json fromat as well.
 */

/* eslint-disable no-extra-parens */

require('One/lib/logger.js').start();

const Instance = require('One/lib/instance.js');
const Storage = require('One/lib/storage.js');
const MessageBus = require('One/lib/message-bus.js').create('app');
const fs = require('fs');
// TODO this is wrong - everything in modules/ will go into ONE storage and won't be available
// as filesystem (that's the intent used when how PROEJCT_ROOT/build.js was made at least)

require('../lib/recipes.js');
//recipes.addAll();

process.on('unhandledRejection', reason => {
    MessageBus.send('error', 'Unhandled rejected promise detected!');
    MessageBus.send('error', reason);
    process.exit(1);
});

const settings = require('../settings.js');

const EXAMPLE_FULLSENSORDATA_OBJECT: EGaitFullSensorDataObj = {
    type: 'EGaitFullSensorData',
    personID: 1,
    sessionID: 1,
    startTime: 1,
    stopTime: 1,
    instructor: 'Hans Dieter',
    comment: 'Heute ist der erste Tag von Hans Dieter.',
    sensorData: [
        {
            type: 'EGaitSensorData',
            header: {
                type: 'EGaitSensorDataHeader',
                sensorPosition: 'Knie',
                bluetoothMac: 'someMAC',
                sensorType: 'ExampleSensor',
                samplingRate: 50,
                rangeAcc: 34,
                rangeGyr: 56,
                rangeAccUnits: 'm/s2',
                rangeGyrUnits: 'Grad',
                dataLegend: ['AccX', 'GyrX']
            },
            rawData: [13, 32, 23, 23, 45, 53],
            dimensionality: [3, 3]
        },
        {
            type: 'EGaitSensorData',
            header: {
                type: 'EGaitSensorDataHeader',
                sensorPosition: 'Kopf',
                bluetoothMac: 'anotherMAC',
                sensorType: 'ExampleSensor',
                samplingRate: 50,
                rangeAcc: 34,
                rangeGyr: 56,
                rangeAccUnits: 'm/s2',
                rangeGyrUnits: 'Grad',
                dataLegend: ['AccX', 'GyrX']
            },
            rawData: [24, 16, 31, 46, 34, 10],
            dimensionality: [3, 3]
        }
    ]
};

const run = async function () {
    // We don't need the returned Instance object
    await Instance.init(settings.initialDataObj);

    /** save the EXAMPLE_FULLSENSORDATA_OBJECT in one */
    const sensorResult = await Storage.createSingleObjectThroughPlan(
        {
            module: 'lib/identity'
        },
        EXAMPLE_FULLSENSORDATA_OBJECT
    );

    //store object as .txt file in json format
    const json = JSON.stringify(sensorResult.obj);
    fs.writeFile('/ONE/TestFile.txt', json, err => {
        if (err) {
            return MessageBus.send('log', 'There was an error writing the json-file:' + err);
        }
    });
};

//noinspection JSIgnoredPromiseFromCall
run()
.catch(err =>
    MessageBus.send('error', err)
);
