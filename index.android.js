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
import RNFetchBlob from 'react-native-fetch-blob';
const demoPipeline = require('./gaitApp/src/apps/Demopipline');

export default class runAlgos extends Component {
    try (){
        const newRun = demoPipeline.run; // does not accept run()
        console.log('whatever this is : ' + newRun);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Welcome to React Native!
                </Text>
                <Button
                    color='yellowgreen'
                    title="Run Demopipeline"
                    onPress={this.try.bind(this)}
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
