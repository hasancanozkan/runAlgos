// @flow
'use strict';

/**
 * Created by jalil on 5/27/2017.
 * Basic dataype for any kind of labels on SensorData
 * Returns a Name, Start, Sample Number, Length
 * If Label is instantanous, then Length = 0;
 * Example: let label = new Label(Name, StartSample, Length);
 */


class Label {
    name: string;
    start: number;
    length: number;
    constructor (labelName: string, startSample: number, labelLength: number) {
        if (typeof (labelName) === 'string') {
            this.name = labelName;
        } else {
            throw new Error('Error@Label:Constructor, labelName is not a string');
        }
        if (Number.isInteger(startSample) === true && Number.isInteger(labelLength) === true) {
            this.start = startSample;
            this.length = labelLength;
        } else {
            throw new Error('Error@Label:Constructor, Label Start and Label Length have to beintegers');
        }
    }

    //Methods
    // TODO unused method
    // setStart (start: number) {
    //     this.start = start;
    // }

    // TODO unused method
    // rename (newName: string) {
    //     if (typeof (newName) === 'string') {
    //         this.name = newName;
    //     } else {
    //         throw new Error('Error@Label:rename, Renaming requires a string as new Name');
    //     }
    // }
}

module.exports = Label;
