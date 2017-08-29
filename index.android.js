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
    TouchableOpacity,
    ScrollView,
    Button
} from 'react-native';
const demoPipeline = require('./gaitApp/src/apps/Demopipline');

export default class runAlgos extends Component {

    constructor () {
        super ();
        this.state = {
            strideLengthLeft: [],
            strideLengthRight: [],
        }
    }

    _try = async () => {
        const gaitFeatures = await demoPipeline.run();
        console.log(gaitFeatures);
        this.setState({strideLengthLeft: gaitFeatures[0]});
        this.setState({strideLengthRight: gaitFeatures[1]});
    };

    showValues (foot) {
        return foot.map((value, index) => {
            return (
                <Text key={index}>
                    {value + '\n'}
                </Text>
            );
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        GaitLab Toolbox
                    </Text>
                </View>
                <View style={styles.chartsContainer}>
                    <ScrollView contentContainerStyle={{flexGrow: 1, alignItems : 'center'}}>
                        <Text style={{fontSize: 20, color: 'black'}}> {this.showValues(this.state.strideLengthLeft)} </Text>
                    </ScrollView>
                    <ScrollView contentContainerStyle={{flexGrow: 1, alignItems : 'center'}}>
                        <Text style={{fontSize: 20, color: 'black'}}> {this.showValues(this.state.strideLengthRight)} </Text>
                    </ScrollView>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.runButton} onPress={() => this._try() }>
                        <Text style={styles.buttonText}>Run</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartsContainer: {
        flex: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        margin: 30
    },
    buttonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 35,
        color: 'black',
        textAlign: 'center'
    },
    runButton: {
        borderRadius: 10,
        backgroundColor: '#0ac3cc',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 30
    },
    buttonText: {
        fontSize: 20,
        color: 'black',
        margin: 30
    }
});

AppRegistry.registerComponent('runAlgos', () => runAlgos);
