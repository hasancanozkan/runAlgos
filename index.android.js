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
  /*async getData () {
    const data=  await RNFetchBlob.fs.readFile('/storage/emulated/0/Documents/data/TestData/templateSh3.csv','utf8');
    console.log('this is data: ' + data);
  }*/
  /*
    getData () {
        RNFetchBlob.fs.readFile('/storage/emulated/0/Documents/data/TestData/templateSh3.csv','utf8')
            .then((data) => {
                console.log('this is data: ' + data.toString());
            }).catch((error)=>{
            console.log("there is an error:");
            alert(error.message);
        });
        }*/
    try (){
        const newRun = demoPipeline.run();
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
            title="DATA"
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
