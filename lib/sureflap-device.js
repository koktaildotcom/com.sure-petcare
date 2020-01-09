'use strict'

const Homey = require('homey')

const lockStates = {
    open: 0,
    keep_inside: 1,
    keep_outside: 2,
    lock_both_ways: 3,
}

const cronName = 'sync_sure_flap';

class SureflapDevice extends Homey.Device {

    async onInit () {
        this.uuid = await this.getDeviceData('id')

        await this.registerFlowCards()
        await this.registerListeners()

        if (Homey.app.client.hasToken()) {
            await this.updateDevice()
        }

        Homey.ManagerCron.unregisterAllTasks().then(result => {
            this.log('Cron job deleted successfully')
        }).catch(error => {
            this.error(`Cron job deletion failed (${error}`)
        })

        Homey.ManagerCron.getTask(cronName).then(task => {
            this.log('The task exists: ' + cronName)
            task.on('run', () => lib.TurnOffDevices())
        }).catch(err => {
            if (err.code == 404) {
                this.log(
                  'The task has not been registered yet, registering task: ' +
                  cronName)
                Homey.ManagerCron.registerTask(cronName, '*/30 * * * * *',
                  null).then(task => {
                    task.on('run', () => lib.TurnOffDevices())
                }).catch(err => {
                    this.log(
                      `problem with registering cronjob: ${err.message}`)
                })
            } else {
                this.log(`other cron error: ${err.message}`)
            }
        })
    }

    async registerFlowCards () {
        this.lockModeIs = new Homey.FlowCardCondition('lock_mode_is').register();
        this.lockModeChanged = new Homey.FlowCardTriggerDevice('lock_mode_changed').register()
        this.lockModeSet = new Homey.FlowCardAction('set_lock_mode').register();
    }

    async registerListeners () {
        this.registerCapabilityListener('lock_mode', async (state) => {
            const lockStateIndex = this._getProperty(lockStates, [state])
            console.log('CapabilityListener lock_mode changed to ' + lockStateIndex)
            return Promise.resolve(await this.setLockState(state))
        })

        this.lockModeSet.registerRunListener(async (args, state) => {
            if (args.hasOwnProperty('lock_mode')) {
                console.log('FlowCardAction set lock capability for device `' + this.uuid + '` mode to `' + args.lock_mode + '`')

                return Promise.resolve(await this.setLockState(args.lock_mode))
            }
        })

        this.lockModeIs.registerRunListener((args, state) => {
            console.log('FlowCardCondition check if lock capability for device `' + this.uuid + '` is `' + args.lock_mode + '`')
            return args.hasOwnProperty('lock_mode') && args.lock_mode === this.getCapabilityValue('lock_mode')
        })
    }

    /**
     * @param lockState string
     *
     * @returns {Promise.<boolean>}
     */
    async setLockState (lockState) {
        const response = await Homey.app.client.setDeviceControl(
          this.uuid,
          lockStates[lockState],
        )

        if (response) {
            await this.setCapabilityValue('lock_mode', lockState);
            await this.lockModeChanged.trigger(this, {
                lock_mode: lockState,
            })
            return true
        }

        return false
    }

    async updateDevice () {
        const device = await Homey.app.client.getDeviceControl(this.uuid);

        const lockStateIndex = this._getProperty(
          device,
          ['locking'],
        )

        const lockState = await this.getLockNameFromIndex(lockStateIndex);
        const deviceState = await this.getCapabilityValue('lock_mode');

        console.log('check if lockstate is out of sync ' + deviceState + ' !== ' + lockState)
        if(deviceState === lockState) {
            return false;
        }

        console.log('set lock capability for device `' + this.uuid +'` mode to `' + lockState + '`')
        return await this.setLockState(lockState);
    }

    /**
     * @param state string
     */
    async getLockNameFromIndex (state) {
        for (let lockState in lockStates) {
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
