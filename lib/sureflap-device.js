'use strict';

const Homey = require('homey');

const lockStates = {
  open: 0,
  keep_inside: 1,
  keep_outside: 2,
  lock_both_ways: 3,
};

module.exports = class SureflapDevice extends Homey.Device {

  async onInit() {
    console.log('Sureflap device init');
    this.id = await this.getDeviceData('id');

    if (this.hasCapability('measure_battery') === false) {
      await this.addCapability('measure_battery');
    }

    if (this.hasCapability('sureflap_lock_mode') === false) {
      await this.addCapability('sureflap_lock_mode');
    }

    if (this.hasCapability('lock_mode')) {
      await this.setCapabilityValue('sureflap_lock_mode', this.getCapabilityValue('lock_mode'));
      await this.removeCapability('lock_mode');
    }

    await this.registerFlowCards();
    await this.registerListeners();

    this.homey.app.registerDevice(this);
  }

  getDeviceId() {
    return this.id;
  }

  /**
   * @returns {Promise.<void>}
   */
  async registerFlowCards() {
    this.lockModeIs = this.homey.flow.getConditionCard('lock_mode_is');
    this.lockModeChanged = this.homey.flow.getTriggerCard('lock_mode_changed');
    this.lockModeSet = this.homey.flow.getActionCard('set_lock_mode');
  }

  /**
   * @param deviceData
   */
  async update(deviceData) {
    if (this.hasCapability('measure_battery')) {
      const batteryStatus = this.homey.app.getProperty(
        deviceData,
        ['status', 'battery'],
      );

      await this.setCapabilityValue('measure_battery', await this.homey.app.calculateBatteryPercentage(batteryStatus));
    }

    const lockStateIndex = this.homey.app.getProperty(
      deviceData,
      ['status', 'locking', 'mode'],
    );

    const lockState = Object.keys(lockStates).find(key => lockStates[key] === lockStateIndex);
    const deviceLockState = await this.getCapabilityValue('sureflap_lock_mode');

    console.log(`check if lockstate is out of sync ${deviceLockState} !== ${lockState}`);
    if (!lockState || deviceLockState === lockState) {
      return;
    }

    console.log(`set lock capability for device \`${this.id}\` mode to \`${lockState}\``);
    await this._setLockState(lockState);
  }

  /**
   * @returns {Promise.<void>}
   */
  async registerListeners() {
    this.registerCapabilityListener('sureflap_lock_mode', async state => {
      const lockStateIndex = this.homey.app.getProperty(lockStates, [state]);
      console.log(`CapabilityListener lock_mode changed to ${lockStateIndex}`);

      if (!state) {
        return Promise.resolve();
      }

      return Promise.resolve(await this._setLockState(state));
    });

    this.lockModeSet.registerRunListener(async (args, state) => {
      if (Object.prototype.hasOwnProperty.call(args, 'sureflap_lock_mode')) {
        console.log(`FlowCardAction set lock capability for device \`${this.id}\` mode to \`${args.lock_mode}\``);

        return Promise.resolve(await this._setLockState(args.lock_mode));
      }

      return Promise.resolve();
    });

    this.lockModeIs.registerRunListener((args, state) => {
      console.log(`FlowCardCondition check if lock capability for device \`${this.id}\` is \`${args.lock_mode}\``);
      return Object.prototype.hasOwnProperty.call(args, 'sureflap_lock_mode') && args.lock_mode === this.getCapabilityValue('sureflap_lock_mode');
    });
  }

  /**
   * @param storedPet
   * @param pet
   *
   * @returns {Promise<void>}
   */
  async checkPetChange(storedPet, pet) {
    if (!this.homey.app.hasProperties(pet, ['position', 'since'])) {
      return;
    }

    if (!this.homey.app.hasProperties(storedPet, ['position', 'since'])) {
      // store the first in cache
      storedPet.position = {
        since: null,
      };
      this.homey.app.patchStoredPet(storedPet);
    }

    if (storedPet.position.since !== pet.position.since) {
      this.homey.app.logMessage('log', `change position for ${pet.name}`);
      storedPet.position = pet.position;
      this.homey.app.patchStoredPet(storedPet);
      const position = this.homey.app.getProperty(pet, ['position']);
      let deviceId = '';
      if (Object.prototype.hasOwnProperty.call(position, 'device_id')) {
        deviceId = position['device_id'];
      }
      if (deviceId === this.getDeviceId() || deviceId === '') {
        const petData = {
          pet: pet.name,
        };
        if (pet.position.where === 1) {
          this.homey.flow.getTriggerCard('pet_home')
            .trigger(this, petData)
            .catch(this.error);
          this.homey.flow.getTriggerCard('specific_pet_home')
            .trigger(this, petData, {
              petId: pet.id,
            })
            .catch(this.error);
        }
        if (pet.position.where === 2) {
          this.homey.flow.getTriggerCard('pet_away')
            .trigger(this, petData)
            .catch(this.error);
          this.homey.flow.getTriggerCard('specific_pet_away')
            .trigger(this, petData, {
              petId: pet.id,
            })
            .catch(this.error);
        }
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
    if (Object.prototype.hasOwnProperty.call(deviceData, property)) {
      return deviceData[property];
    }

    return Promise.resolve();
  }

  /**
   * Register device
   */
  onAdded() {
    this.homey.app.registerDevice(this);
  }

  /**
   * Unregister device
   */
  onDeleted() {
    this.homey.app.unregisterDevice(this);
  }

  /**
   * @param lockState string
   *
   * @returns {Promise.<boolean>}
   */
  async _setLockState(lockState) {
    const response = await this.homey.app.client.setDeviceControl(
      this.id,
      lockStates[lockState],
    );

    if (response) {
      await this.setCapabilityValue('sureflap_lock_mode', lockState);
      await this.lockModeChanged
        .trigger({
          lock_mode: lockState,
        })
        .catch(this.error);
      return true;
    }

    return false;
  }

};
