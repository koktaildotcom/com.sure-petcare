'use strict'

const Homey = require('homey')

const lockStates = {
    open: 0,
    keep_inside: 1,
    keep_outside: 2,
    lock_both_ways: 3,
}

class SureflapDevice extends Homey.Device {

    async onInit () {
        this.uuid = await this.getDeviceData('id')

        await this.registerFlowCards()
        await this.registerListeners()

        if (Homey.app.client.hasToken()) {
            await this.updateDevice()
        }
    }

    async registerFlowCards () {
        this.lockModeIs = new Homey.FlowCardCondition('lock_mode_is').register();
        this.lockModeChanged = new Homey.FlowCardTriggerDevice('lock_mode_changed').register()
        this.lockModeSet = new Homey.FlowCardAction('set_lock_mode').register();
    }

    async registerListeners () {
        this.registerCapabilityListener('lock_mode', async (state) => {
            const targetState = this._getProperty(lockStates, [state])
            console.log('CapabilityListener lock_mode changed to ' + targetState)
            const response = await Homey.app.client.setDeviceControl(
              this.uuid,
              targetState,
            )

            if(response) {
                console.log('CapabilityListener successfull setDeviceControl to ' + targetState)
                console.log('FlowCardTriggerDevice trigger action card' + currentLockState)
                this.lockModeChanged.trigger({lock_mode: currentLockState})
            }
        })

        this.lockModeSet.registerRunListener(async (args, state) => {
            if (args.hasOwnProperty('lock_mode')) {
                console.log(args.lock_mode)
                console.log('FlowCardAction set lock capability for device `' + this.uuid +
                  '` mode to `' + args.lock_mode + '`')
                await this.setCapabilityValue('lock_mode', args.lock_mode);
                return Promise.resolve(true)
            }
        })

        this.lockModeIs.registerRunListener((args, state) => {
            console.log('FlowCardCondition check if lock capability for device `' + this.uuid + '` is `' + args.lock_mode + '`')
            return args.hasOwnProperty('lock_mode') && args.lock_mode === this.getCapabilityValue('lock_mode')
        })
    }

    async updateDevice () {
        const device = await Homey.app.client.getDeviceControl(this.uuid);

        const lockStateIndex = this._getProperty(
          device,
          ['locking'],
        )

        const lockState = await this.getLockIndex(lockStateIndex);
        const deviceState = await this.getCapabilityValue('lock_mode');

        console.log('check if lockstate is out of sync ' + deviceState + ' !== ' + lockState)
        if(deviceState === lockState) {
            return false;
        }

        console.log('set lock capability for device `' + this.uuid +'` mode to `' + lockState + '`')
        await this.setCapabilityValue('lock_mode', lockState);
        return true;
    }

    /**
     * @param state string
     */
    async getLockIndex (state) {
        for (let lockState in lockStates) {
            console.log('try set lock capability for device `' + lockStates[lockState] + ' === ' + state + '`')
            if (lockStates[lockState] === state) {
                return lockState;
            }
        }
    }

    async getDeviceData (property) {
        const deviceData = await this.getData()
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
