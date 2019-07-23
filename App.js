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
    AsyncStorage,
    NativeModules,
    Platform,
} from 'react-native';

import TipiLockModule from 'react-native-tipilock';

const LOCK_OBJ_KEY = 'LAST_LOCK_OBJ'
export default class TipiLockDemo extends Component {
    dataContainer = [];
    state = {
        lockItemObj: null
    }

    selectLockMac = '';

    constructor(props) {
        super(props);
        this.state = {
            sourceData: [],
        };
        AsyncStorage.getItem(LOCK_OBJ_KEY).then(value => {
            console.log(' AsyncStorage.getItem', value)
            if (value) {
                this.setState({
                    lockItemObj: JSON.parse(value)
                })
                alert('lock object load from storage ,' + value)
            }
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>TipiLock Demo</Text>

                <Button
                    title={'init'}
                    onPress={this.initLockApi.bind(this)}
                />
                <Button
                    title={'Scan BT Lock Device'}
                    onPress={this.requestPermissionAndStartScanDevice.bind(this)}
                />
                <Button
                    title={'Click to Unlock By User'}
                    color={this.state.lockItemObj ? undefined : '#999'}
                    onPress={this.onClickUnlock.bind(this)}
                />

                <Button
                    title={'Click to Unlock 06'}
                    onPress={this.onClickUnlock06.bind(this)}
                />
                <Button
                    title={'Click to Unlock By Admin'}
                    color={this.state.lockItemObj ? undefined : '#999'}
                    onPress={this.onClickUnlockByAdmin.bind(this)}
                />
                <Button
                    title={'Get lock time'}
                    color={this.state.lockItemObj ? undefined : '#999'}
                    onPress={this.onGetLockTime.bind(this)}
                />
                <Button
                    title={'Set time to lock'}
                    color={this.state.lockItemObj ? undefined : '#999'}
                    onPress={this.onSetLockTime.bind(this)}
                />
                <Button
                    title={'Set admin pin'}
                    color={this.state.lockItemObj ? undefined : '#999'}
                    onPress={this.onSetAdminPin.bind(this)}
                />
                <Button
                    title={'Reset lock'}
                    color={this.state.lockItemObj ? undefined : '#999'}
                    onPress={this.onClickResetLock.bind(this)}
                />
                <FlatList
                    renderItem={({item}) => (
                        <TouchableOpacity onPress={() => this.onItemClick(item)}>
                            <Text style={styles.lockListItem}>{item.lockName}</Text>
                        </TouchableOpacity>
                    )}
                    data={this.state.sourceData}
                    extraData={this.state}
                />
            </View>
        );
    }

    initLockApi() {
        TipiLockModule.init();
    }

    onItemClick(item) {
        console.log('onItemClick : ', item)
        if (item.isSettingMode) {
            this.selectLockMac = item.lockMacAddress;
            TipiLockModule.lockInitialize(item.lockMacAddress, result => {
                console.log('lockInitialize : ', result);
                let initResultString = result.success
                    ? 'lock init success'
                    : 'lock init fail';
                let errormsg = result.errorCode;
                this.show(initResultString);
                if (result.success) {
                    AsyncStorage.setItem(LOCK_OBJ_KEY, result.lockDataJsonString)
                        .then(() => {
                            this.setState({
                                lockItemObj: JSON.parse(result.lockDataJsonString)
                            });
                            alert('lock object saved in storage ,' + result.lockDataJsonString)
                        });
                    this.onStopScanAndListener();
                }


            });
        }
    }

    onClickUnlock() {
        if (this.state.lockItemObj === null) {
            return;
        }
        TipiLockModule.unlockByUser(this.state.lockItemObj, map => {
            let unlockNotify = map.success
                ? 'Unlock success'
                : 'Unlock fail' + map.errorCode;
            this.show(unlockNotify);
        });
    }

    onClickUnlock06() {

        let sampleEKeyFromApi = {
            "date": 1539168803000,
            "specialValue": 54771,
            "lockAlias": "MG06_2e3b46",
            "keyStatus": "110401",
            "endDate": 1854748800000,
            "keyId": 2343395,
            "lockMac": "E0:1B:C9:D3:72:7C",
            "timezoneRawOffset": 16200000,
            "lockId": 1284873,
            "electricQuantity": 100,
            "lockFlagPos": 0,
            "keyboardPwdVersion": 4,
            "aesKeyStr": "68,cc,f6,31,4c,e7,cd,ba,a5,ce,d5,bb,fc,b5,f2,bd",

            "remoteEnable": 2,
            "lockVersion": {
                "showAdminKbpwdFlag": true,
                "logoUrl": "",

                "protocolVersion": "3",
                "protocolType": "5",
                "groupId": "10",
                "scene": "2",
                "orgId": "21"
            },
            "userType": "110302",
            "lockKey": "MTI2LDEyMCwxMjIsMTI3LDEyNSwxMjMsMTIyLDEyNSwxMjIsMTI1LDQ4",
            "lockName": "MG06_7c72d3",

            "startDate": 1539043200000,
            "remarks": "",
            "keyRight": 0,

        };

        TipiLockModule.unlockByUser(sampleEKeyFromApi, map => {
            let unlockNotify = map.success
                ? 'Unlock success'
                : 'Unlock fail' + map.errorCode;
            this.show(unlockNotify);
        });
    }

    onClickUnlockByAdmin() {
        if (this.state.lockItemObj === null) {
            return;
        }
        TipiLockModule.unlockByAdministrator(this.state.lockItemObj, map => {
            let unlockNotify = map.success
                ? 'Unlock success'
                : 'Unlock fail' + map.errorCode;
            this.show(unlockNotify);
        });
    }

    onClickResetLock() {
        if (this.state.lockItemObj === null) {
            return;
        }
        TipiLockModule.resetLock(this.state.lockItemObj, map => {
            let resetString = map.success ? 'reset success' : 'fail';
            this.show(resetString);
            if (map.success) {
                AsyncStorage.removeItem(LOCK_OBJ_KEY).then((s) => {
                    console.log(' AsyncStorage.removeItem', s);
                    alert('lock object removed from storage ,')
                })
                this.state.lockItemObj = null
            }
        });
    }

    onGetLockTime() {
        if (this.state.lockItemObj === null) {
            return;
        }
        TipiLockModule.getLockTime(this.state.lockItemObj, map => {
            console.log('TipiLockModule.getLockTime', map)
            let resetString = map.success ? 'lock time is: ' : 'fail';
            this.show(resetString + +map.timestamp);
        });
    }

    onSetLockTime() {
        if (this.state.lockItemObj === null) {
            return;
        }
        TipiLockModule.setLockTime(new Date().getTime(), this.state.lockItemObj, map => {
            console.log('TipiLockModule.setLockTime', map)
            let resetString = map.success
                ? 'lock time is be corrected'
                : 'correct time fail';
            this.show(resetString + +new Date().getTime());
        });
    }

    onSetAdminPin() {
        if (this.state.lockItemObj === null) {
            return;
        }
        TipiLockModule.setAdminKeyboardPassword('2222', this.state.lockItemObj, map => {
            console.log('TipiLockModule.setAdminKeyboardPassword', map)
            let resetString = map.success ? 'admin pin changed to 2222' : 'fail';
            this.show(resetString);
        });
    }

    async requestPermissionAndStartScanDevice() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                    {
                        title: 'Need Location Permission',
                        message: 'it can not work without location permission'
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    this.show('get location permission success');
                    this.startScanDevice();
                } else {
                    this.show('get permission fail');
                }
            } catch (e) {
                this.show(e.toString());
            }
        } else {
            this.startScanDevice();
        }
    }

    show(data) {
        if (Platform.OS === 'android')
            ToastAndroid.show(data, ToastAndroid.LONG);
        else
            alert(data)
    }

    /**
     *
     * @param lockItemMap lock device map object
     * lockName(String) lockMac(String) isSettingMode(Bool) rssi(Number) isTouch(Bool)
     *
     * Notice：same lock device will repeat receive.Only isSettingMode is true the lock can be added.
     */
    updateDataSouce(lockItemMap) {
        let endString = lockItemMap.isSettingMode
            ? '---No Admin---click to add'
            : '';
        let itemText = lockItemMap.lockName + endString;
        let lockObj = {
            key: lockItemMap.lockMac,
            lockName: itemText,
            lockMacAddress: lockItemMap.lockMac,
            isSettingMode: lockItemMap.isSettingMode,
            rssi: lockItemMap.rssi,
            isTouch: lockItemMap.isTouch,
        };
        this.filterLockItem(lockObj);
    }

    filterLockItem(newItem) {
        let index = -1;
        let arrayLen = this.dataContainer.length;
        for (let i = 0; i < arrayLen; i++) {
            let child = this.dataContainer[i];
            if (child.lockMacAddress === newItem.lockMacAddress) {
                index = i;
                break;
            }
        }

        if (index !== -1) {
            // alert(JSON.stringify(newItem))
            this.show('--data change--' + newItem.isSettingMode);
            if (newItem.isSettingMode) {
                this.dataContainer.splice(index, 1);
                this.dataContainer.splice(0, 0, newItem);
            } else {
                this.dataContainer.splice(index, 1, newItem);
            }
        } else {
            this.dataContainer.push(newItem);
        }

        this.setState({
            sourceData: this.dataContainer,
        });
    }

    /**
     * stop scan and remove listener.
     */
    onStopScanAndListener() {
        TipiLockModule.stopDeviceScan();
        this.dataContainer = [];
        this.setState({
            sourceData: this.dataContainer,
        });
        TipiLockModule.removeReceiveScanDeviceListener();
    }

    /**
     * start blue tooth service for Android is required
     */
    startBtService() {
        TipiLockModule.startBleService();
    }

    /**
     * Scan blueTooth lock，Android 6.0 need ACCESS_COARSE_LOCATION permission。
     */
    startScanDevice() {
        /**
         * add listener of scan device,more info please see README。
         */
        TipiLockModule.addReceiveScanDeviceListener(lockItemMap => {
            this.updateDataSouce(lockItemMap);
        });

        TipiLockModule.startDeviceScan();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
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
