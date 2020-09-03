'use strict';

const Homey = require('homey');

const lockStates = {
  open: 0,
  keep_inside: 1,
  keep_outside: 2,
  lock_both_ways: 3,
};

class SureflapDevice extends Homey.Device {

  async onInit() {
    this.id = await this.getDeviceData('id');

    if (this.hasCapability('measure_battery') === false) {
      await this.addCapability('measure_battery');
    }

    await this.registerFlowCards();
    await this.registerListeners();

    Homey.app.registerDevice(this);
  }

  /**
     * @returns {Promise.<void>}
     */
  async registerFlowCards() {
    this.lockModeIs = new Homey.FlowCardCondition('lock_mode_is').register();
    this.lockModeChanged = new Homey.FlowCardTriggerDevice('lock_mode_changed').register();
    this.lockModeSet = new Homey.FlowCardAction('set_lock_mode').register();
  }

  /**
     * @param deviceData
     * @returns {Promise.<boolean>}
     */
  async update(deviceData) {
    if (this.hasCapability('measure_battery')) {
      const batteryStatus = this._getProperty(
        deviceData,
        ['status', 'battery'],
      );
      let batteryPercentage = Math.round(((batteryStatus - 5) / (6 - 5)) * 100);
      batteryPercentage > 100 ? batteryPercentage = 100 : null;
      batteryPercentage < 0 ? batteryPercentage = 0 : null;

      this.setCapabilityValue('measure_battery', batteryPercentage);
    }

    const lockStateIndex = this._getProperty(
      deviceData,
      ['status', 'locking', 'mode'],
    );
    const lockState = await this.getLockNameFromIndex(lockStateIndex);
    const deviceLockState = await this.getCapabilityValue('lock_mode');

    console.log(`check if lockstate is out of sync ${deviceLockState} !== ${lockState}`);
    if (!lockState || deviceLockState === lockState) {
      return false;
    }

    console.log(`set lock capability for device \`${this.id}\` mode to \`${lockState}\``);
    return await this._setLockState(lockState);
  }

  /**
     * @returns {Promise.<void>}
     */
  async registerListeners() {
    this.registerCapabilityListener('lock_mode', async state => {
      const lockStateIndex = this._getProperty(lockStates, [state]);
      console.log(`CapabilityListener lock_mode changed to ${lockStateIndex}`);

      if (!state) {
        return Promise.resolve();
      }

      return Promise.resolve(await this._setLockState(state));
    });

    this.lockModeSet.registerRunListener(async (args, state) => {
      if (args.hasOwnProperty('lock_mode')) {
        console.log(`FlowCardAction set lock capability for device \`${this.id}\` mode to \`${args.lock_mode}\``);

        return Promise.resolve(await this._setLockState(args.lock_mode));
      }
    });

    this.lockModeIs.registerRunListener((args, state) => {
      console.log(`FlowCardCondition check if lock capability for device \`${this.id}\` is \`${args.lock_mode}\``);
      return args.hasOwnProperty('lock_mode') && args.lock_mode === this.getCapabilityValue('lock_mode');
    });
  }

  /**
     * @param lockState string
     *
     * @returns {Promise.<boolean>}
     */
  async _setLockState(lockState) {
    const response = await Homey.app.client.setDeviceControl(
      this.id,
      lockStates[lockState],
    );

    if (response) {
      await this.setCapabilityValue('lock_mode', lockState);
      await this.lockModeChanged.trigger(this, {
        lock_mode: lockState,
      });
      return true;
    }

    return false;
  }

  /**
     * @param state string
     */
  async getLockNameFromIndex(state) {
    for (const lockState in lockStates) {
      if (lockStates[lockState] === state) {
        return lockState;
      }
    }
  }

  /**
     * @param property
     *
     * @returns {Promise.<*>}
     */
  async getDeviceData(property) {
    const deviceData = await this.getData();
    if (deviceData.hasOwnProperty(property)) {
      return deviceData[property];
    }
  }

  /**
     * @returns string
     */
  getId() {
    return this.id;
  }

  /**
     * Register device
     */
  onAdded() {
    Homey.app.registerDevice(this);
  }

  /**
     * Unregister device
     */
  onDeleted() {
    Homey.app.unregisterDevice(this);
  }

  /**
     * @private
     *
     * @param target
     * @param params
     *
     * @returns {*}
     */
  _getProperty(target, params) {
    for (const param of params) {
      if (target.hasOwnProperty(param) === false) {
        throw new Error(`Unknown param: ${param}`);
      }
      target = target[param];
    }
    return target;
  }

}

module.exports = SureflapDevice;
