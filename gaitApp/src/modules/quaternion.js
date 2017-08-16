// @flow
'use strict';

const math = require('mathjs');

module.exports.product = function (a: Array<number> , b: Array<number>) {
    const r1 = a[0];
    const v1 = a.slice(1,4);
    const r2 = b[0];
    const v2 = b.slice(1,4);

    const r = math.multiply(r1,r2) - math.dot(v1,v2);
    let v = math.add(math.cross(v1,v2),v1.map(x => x * r2));
    v = math.add(v,v2.map(x => x * r1));

    return [r,...v];
};

module.exports.attitudeMatrix = function (a: Array<number>) {

    const real = a[0];
    const imag = a.slice(1,4);
    const A = [[],[],[]];

    A[0][0] = math.square(real) + math.square(imag[0]) - math.square(imag[1]) - math.square(imag[2]);
    A[0][1] = (2 * imag[0] * imag[1]) - (2 * real * imag[2]);
    A[0][2] = (2 * imag[0] * imag[2]) - (2 * real * imag[1]);

    A[1][0] = (2 * imag[0] * imag[1]) + (2 * real * imag[2]);
    A[1][1] = math.square(real) - math.square(imag[0]) + math.square(imag[1]) - math.square(imag[2]);
    A[1][2] = (2 * imag[1] * imag[2]) - (2 * real * imag[0]);

    A[2][0] = (2 * imag[0] * imag[2]) - (2 * real * imag[1]);
    A[2][1] = (2 * imag[1] * imag[2]) + (2 * real * imag[0]);
    A[2][2] = math.square(real) - math.square(imag[0]) - math.square(imag[1]) + math.square(imag[2]);

    return A;
};

module.exports.inverse = function (q: Array<number>) {
    // TODO Variable is redundant
    //let qInv = q.length;

    const a = q.slice(1,4);
    let sum = 0;

    a.forEach(val => {
        sum += math.square(val);
    });

    const tmp = math.square(q[0]) + sum;

    // TODO redundant
    //const qInv =
    return q.map((v,i) => {
        if (i === 0) {
            return v / tmp;
        } else {
            return -v / tmp;
        }
    });

    // TODO redundant
    //return qInv;
};

module.exports.quatToEuler = function (q: Array<number>) {
    //  Rotation matrix saved in the form of row matrix
    const R = [[], [], []];
    R[0][0] = (2 * (q[0] * q[0])) - 1 + (2 * (q[1] * q[1]));
    R[0][1] = 0;
    R[0][2] = 0;
    R[1][0] = 2 * ((q[1] * q[2]) - (q[0] * q[3]));
    R[1][1] = 0;
    R[1][2] = 0;
    R[2][0] = 2 * ((q[1] * q[3]) + (q[0] * q[2]));
    R[2][1] = 2 * ((q[2] * q[3]) - (q[0] * q[1]));
    R[2][2] = (2 * (q[0] * q[0])) - 1 + (2 * (q[3] * q[3]));

    const _phi = math.atan2(R[2][1], R[0][0]);
    const theta = -math.atan2(R[2][0], math.sqrt(1 - math.square(R[2][0])));
    const psi = math.atan2(R[1][0], R[0][0]);

    return [_phi, theta, psi];
};
