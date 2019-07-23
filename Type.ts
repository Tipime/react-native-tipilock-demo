type Api = {
    // other
    keyboardPwdVersion?: number
    remoteEnable?: number
    "lockVersion": {
        "showAdminKbpwdFlag": true,
        "groupId": 10,
        "protocolVersion": 3,
        "protocolType": 5,
        "orgId": 21,
        "logoUrl": "",
        "scene": 2
    },
    userType?
    remarks?
    keyRight?
}

export type LockModel = {
    // from api
    startDate: string
    keyId: string
    lockId: string
    keyStatus: string
    lockAlias: string
    endDate: string
    lockMac: string
    timezoneRawOffset: string
    electricQuantity: string
    lockFlagPos: string
    aesKeyStr: string
    lockKey: string
    lockName: string

    protocolType: string
    protocolVersion: string
    scene: string
    groupId: string
    orgId: string

    // from scan model
    nbRssi: string



    //
    uid: string
    noKeyPwd: string
    lockVersion: string
    adminPwd: string
    deletePwd: string
    specialValue: string
    //
    modelNum: string
    pwdInfo: string
    hardwareRevision: string
    firmwareRevision: string
    nbNodeId: string
    nbCardNumber: string
    nbOperator: string
    timestamp: string
    //
    version: string
}


type ScanModel = {

    /**
     * Bluetooth mac address
     * */
    lockMac: string

    /**
     * Bluetooth mac
     * */
    lockName: string

    /**
     * Bluetooth signal strength
     * */
    rssi: string

    /**
     *  Whether the lock is touched
     * */
    isTouch: string

    /**
     * Can you add status
     * */
    isSettingMode: boolean

    protocolType: string
    protocolVersion: string
}



