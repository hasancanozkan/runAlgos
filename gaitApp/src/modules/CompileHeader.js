// @flow
'use strict';

/**
 * Created by jalil on 3/25/2017.
 */

module.exports.CompileHeader = function (Mote: Object) {

    const Header = {};
    Header.SensorPosition = Mote.Position;
    Header.BluetoothMac = Mote.BluetoothMac;
    Header.SensorType = Mote.Type;

    if (isNaN(Mote.SamplingRate)) {
        switch (Mote.SamplingRate) {
            case 'SAMPLING_50HZ':
                Header.SamplingRate = 51.2;
                break;
            case 'SAMPLING_100HZ':
                Header.SamplingRate = 102.4;
                break;
            case 'SAMPLING_200HZ':
                Header.SamplingRate = 204.8;
                break;
            default:
                throw new Error ('No Conversion Rule for SamplingRate');

        }
    } else {
        Header.SamplingRate = parseFloat(Mote.SamplingRate);
    }

    switch (Mote.Sensitivity) {
        case 'RANGE_8_0G':
            Header.RangeAcc = 8.;
            break;
        case 'RANGE_6_0_G':
            Header.RangeAcc = 6.;
            break;
        case 'RANGE_6_0G':
            Header.RangeAcc = 6.;
            break;
        case '6.0':
            Header.RangeAcc = 6.;
            break;
        case '8.0':
            Header.RangeAcc = 8.;
            break;
        default:
            throw new Error ('No Conversion Rule for Sensitivity');
    }
    Header.RangeGyr = 500.;
    Header.RangeAccUnits = 'g';
    Header.RangeGyrUnits = 'A/sec';

    Header.DataLegend = ['AccX', 'AccY', 'AccZ', 'GyrX', 'GyrY', 'GyrZ'];

    return Header;
};
