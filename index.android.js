/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Button
} from 'react-native';
const demoPipeline = require('./gaitApp/src/apps/Demopipline');

export default class runAlgos extends Component {

    _try = async () => {
        const newRun = await demoPipeline.run();
        console.log('this is: ');
        console.log(newRun);
    };

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Welcome to React Native!
                </Text>
                <Button
                    color='yellowgreen'
                    title="Run Demopipeline"
                    onPress={async () => this._try()}
                />

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
});

AppRegistry.registerComponent('runAlgos', () => runAlgos);
