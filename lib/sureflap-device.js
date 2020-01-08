'use strict'

const Homey = require('homey')

const lockStates = {
    open: 0,
    keep_inside: 1,
    keep_outside: 2,
    lock_both_ways: 3,
}

class SureflapDevice extends Homey.Device {

    onInit () {
        this.uuid = this.getDeviceData('id')

        this.registerListeners()

        if (Homey.app.client.hasToken()) {
            this.updateDevice()
        }
    }

    registerListeners () {
        this.lockModeIs = new Homey.FlowCardCondition(
          'lock_mode_is').register().registerRunListener((args, state) => {
            console.log(
              'check if lock capability for device `' + this.uuid + '` is `' +
              args.lock_mode + '`')
            return args.hasOwnProperty('lock_mode') &&
              args.lock_mode === this.getCapabilityValue('lock_mode')
        })

        this.lockModeChanged = new Homey.FlowCardTriggerDevice(
          'lock_mode_changed').register()

        this.lockModeSet = new Homey.FlowCardAction('set_lock_mode').register().
          registerRunListener((args, state) => {
              console.log(args)
              if (args.hasOwnProperty('lock_mode')) {
                  this.setLockState(args.lock_mode).then(() => {
                      return Promise.resolve(true)
                  })
              }
          })

        this.registerCapabilityListener('lock_mode', async (state) => {

            const targetState = this._getProperty(lockStates, [state])

            Homey.app.client.setDeviceControl(
              this.uuid,
              targetState,
            ).then(() => {
                this.lockModeChange.trigger({lock_mode: currentLockState})
            })
        })
    }

    updateDevice () {
        Homey.app.client.getDeviceControl(this.uuid).then((device) => {
            const currentLockState = this._getProperty(
              device,
              ['locking'],
            )
            this.setLockState(currentLockState).then(() => {
                // success
            })
        })
    }

    /**
     * @param state string
     */
    async setLockState (state) {
        for (let lockState in lockStates) {
            if (lockStates[lockState] === state) {
                console.log('set lock capability for device `' + this.uuid +
                  '` mode to `' + lockState + '`')
                return this.setCapabilityValue('lock_mode', lockState)
            }
        }
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

module.exports = SureflapDevice
