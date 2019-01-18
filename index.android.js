import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Button,
    PermissionsAndroid,
    ToastAndroid,
    DeviceEventEmitter,
    FlatList,
    TouchableOpacity,
    Platform
} from 'react-native';

import TipiLockModule from 'react-native-tipilock';

export default class TipiLockDemo extends Component {
    dataContainer = [];

    lockItemObj = {};
    selectLockMac = "";

    constructor(props) {
        super(props)
        this.state = {
            sourceData: []
        }

        this.initLockApi()
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    TipiLock Demo
                </Text>
                <Button title={"Scan BT Lock Device"} onPress={this.requestPermission.bind(this)}/>
                <Button title={"Click to Unlock By User"} onPress={this.onClickUnlock.bind(this)}/>
                <Button title={"Click to Unlock By Admin"} onPress={this.onClickUnlockByAdmin.bind(this)}/>
                <Button title={"Get lock time"} onPress={this.onGetLockTime.bind(this)}/>
                <Button title={"Set time to lock"} onPress={this.onSetLockTime.bind(this)}/>
                <Button title={"Set admin pin"} onPress={this.onSetAdminPin.bind(this)}/>
                <Button title={"Reset lock"} onPress={this.onClickResetLock.bind(this)}/>
                <FlatList
                    renderItem={({item}) =>
                        <TouchableOpacity onPress={() => this.onItemClick(item)}>
                            <Text style={styles.lockListItem}>
                                {item.lockName}
                            </Text>
                        </TouchableOpacity>
                    } data={this.state.sourceData} extraData={this.state}/>
            </View>
        );
    }

    initLockApi() {
        TipiLockModule.init()
        this.startBtService()
    }

    onItemClick(item) {
        if (item.isSettingMode) {
            this.selectLockMac = item.lockMacAddress
            TipiLockModule.lockInitialize(item.lockMacAddress, result => {
                this.lockItemObj = JSON.parse(result.lockDataJsonString)
                let initResultString = result.success ? "lock init success" : "lock init fail";
                let errormsg = result.errorCode
                this.show(initResultString)
                if (result.success) {
                    this.onStopScanAndListener()
                }
            })
        }
    }

    onClickUnlock() {
        if (this.lockItemObj === null) {
            return
        }
        TipiLockModule.unlockByUser(this.lockItemObj, map => {
            let unlockNotify = map.success ? "Unlock success" : "Unlock fail" + map.errorCode;
            this.show(unlockNotify)
        })
    }

    onClickUnlockByAdmin() {
        if (this.lockItemObj === null) {
            return
        }
        TipiLockModule.unlockByAdministrator(this.lockItemObj, map => {
            let unlockNotify = map.success ? "Unlock success" : "Unlock fail" + map.errorCode;
            this.show(unlockNotify)
        })
    }

    onClickResetLock() {
        if (this.lockItemObj === null) {
            return
        }
        TipiLockModule.resetLock(this.lockItemObj, map => {
            let resetString = map.success ? "reset success" : "fail";
            this.show(resetString)
        })
    }

    onGetLockTime() {
        if (this.lockItemObj === null) {
            return
        }
        TipiLockModule.getLockTime(this.lockItemObj, map => {
            let resetString = map.success ? "lock time is: " : "fail";
            this.show(resetString + +map.timestamp)
        })
    }

    onSetLockTime() {
        if (this.lockItemObj === null) {
            return
        }
        TipiLockModule.setLockTime(new Date().getTime(), this.lockItemObj, map => {
            let resetString = map.success ? "lock time is be corrected" : "correct time fail";
            this.show(resetString + +new Date().getTime())
        })
    }

    onSetAdminPin() {
        if (this.lockItemObj === null) {
            return
        }
        TipiLockModule.setAdminKeyboardPassword("2222", this.lockItemObj, map => {
            let resetString = map.success ? "admin pin changed to 2222" : "fail";
            this.show(resetString)
        })
    }

    async requestPermission() {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                    {
                        'title': 'Need Location Permission',
                        'message': 'it can not work without location permission'
                    }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    this.show("get location permission success")
                    this.startScanDevice()
                } else {
                    this.show("get permission fail")
                }
            } catch (e) {
                this.show(e.toString())
            }
        } else {
            this.startScanDevice()
        }

    }

    show(data) {
        ToastAndroid.show(data, ToastAndroid.LONG)
    }

    /**
     *
     * @param lockItemMap lock device map object
     * lockName(String) lockMac(String) isSettingMode(Bool) rssi(Number) isTouch(Bool)
     *
     * Notice：same lock device will repeat receive.Only isSettingMode is true the lock can be added.
     */
    updateDataSouce(lockItemMap) {
        let endString = lockItemMap.isSettingMode ? "---No Admin---click to add" : "";
        let itemText = lockItemMap.lockName + endString
        let lockObj = {
            key: lockItemMap.lockMac,
            lockName: itemText,
            lockMacAddress: lockItemMap.lockMac,
            isSettingMode: lockItemMap.isSettingMode,
            rssi: lockItemMap.rssi,
            isTouch: lockItemMap.isTouch
        }
        this.filterLockItem(lockObj)
    }

    filterLockItem(newItem) {
        let index = -1;
        let arrayLen = this.dataContainer.length;
        for (let i = 0; i < arrayLen; i++) {
            let child = this.dataContainer[i];
            if (child.lockMacAddress === newItem.lockMacAddress) {
                index = i;
                break
            }
        }

        if (index !== -1) {
            this.show("--data change--" + newItem.isSettingMode)
            if (newItem.isSettingMode) {
                this.dataContainer.splice(index, 1)
                this.dataContainer.splice(0, 0, newItem)
            } else {
                this.dataContainer.splice(index, 1, newItem)
            }
        } else {
            this.dataContainer.push(newItem)
        }

        this.setState({
            sourceData: this.dataContainer
        })
    }

    /**
     * stop scan and remove listener.
     */
    onStopScanAndListener() {
        TipiLockModule.stopDeviceScan()
        this.dataContainer = []
        this.setState({
            sourceData: this.dataContainer
        })
        TipiLockModule.removeReceiveScanDeviceListener()
    }


    /**
     * start blue tooth service for Android is required
     */
    startBtService() {
        TipiLockModule.startBleService()
    }

    /**
     * Scan blueTooth lock，Android 6.0 need ACCESS_COARSE_LOCATION permission。
     */
    startScanDevice() {
        /**
         * add listener of scan device,more info please see README。
         */
        TipiLockModule.addReceiveScanDeviceListener(lockItemMap => {
            this.updateDataSouce(lockItemMap)
        })

        TipiLockModule.startDeviceScan()
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },

    lockListItem: {
        fontSize: 14,
        margin: 8,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});

AppRegistry.registerComponent('tipilockdemo', () => TipiLockDemo);
