'use strict'

const Homey = require('homey')

const lockStates = {
    open: 0,
    keep_inside: 1,
    keep_outside: 2,
    lock_both_ways: 3,
}

class SureflapPetDoorConnect extends Homey.Device {

    onInit () {
        this.log('PetDoorConnect has been inited')

        this.uuid = this.getDeviceData('id')

        this.registerListeners()

        if (Homey.app.client.hasToken()) {
            this.updateDevice()
        }
    }

    updateDevice () {
        Homey.app.client.getDeviceControl(this.uuid).then((device) => {
            const currentLockState = this._getProperty(
              device,
              ['locking'],
            )
            for (let lockState in lockStates) {
                if (lockStates[lockState] === currentLockState) {
                    this.setCapabilityValue('lock_mode', lockState)
                }
            }
        })
    }

    registerListeners () {
        this.registerCapabilityListener('lock_mode', async (state) => {

            const targetState = this._getProperty(lockStates, [state])

            Homey.app.client.setDeviceControl(
              this.uuid,
              targetState,
            )
        })
    }

    getDeviceData (property) {
        const deviceData = this.getData()
        if (deviceData.hasOwnProperty(property)) {
            return deviceData[property]
        }
    }

    _getProperty (target, params) {
        for (const param of params) {
            if (false === target.hasOwnProperty(param)) {
                throw new Error('Unknown param: ' + param)
            }
            target = target[param]
        }
        return target
    }
}

module.exports = SureflapPetDoorConnect
