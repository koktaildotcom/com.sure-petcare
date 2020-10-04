'use strict';

const Homey = require('homey');

module.exports = class SurefeedDevice extends Homey.Device {

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
    // this.lockModeIs = new Homey.FlowCardCondition('lock_mode_is').register();
    // this.lockModeChanged = new Homey.FlowCardTriggerDevice('lock_mode_changed').register();
    // this.lockModeSet = new Homey.FlowCardAction('set_lock_mode').register();
  }

  /**
   * @param deviceData
   *
   * @returns {Promise.<void>}
   */
  async update(deviceData) {
    if (this.hasCapability('measure_battery')) {
      const batteryStatus = Homey.app.getProperty(
        deviceData,
        ['status', 'battery'],
      );

      await this.setCapabilityValue('measure_battery', await Homey.app.calculateBatteryPercentage(batteryStatus));
    }
  }

  /**
   * @returns {Promise.<void>}
   */
  async registerListeners() {
    // this.registerCapabilityListener('lock_mode', async state => {
    //   const lockStateIndex = Homey.app.getProperty(lockStates, [state]);
    //   console.log(`CapabilityListener lock_mode changed to ${lockStateIndex}`);
    //
    //   if (!state) {
    //     return Promise.resolve();
    //   }
    //
    //   return Promise.resolve(await this._setLockState(state));
    // });
    //
    // this.lockModeSet.registerRunListener(async (args, state) => {
    //   if (args.hasOwnProperty('lock_mode')) {
    //     console.log(`FlowCardAction set lock capability for device \`${this.id}\` mode to \`${args.lock_mode}\``);
    //
    //     return Promise.resolve(await this._setLockState(args.lock_mode));
    //   }
    // });
    //
    // this.lockModeIs.registerRunListener((args, state) => {
    //   console.log(`FlowCardCondition check if lock capability for device \`${this.id}\` is \`${args.lock_mode}\``);
    //   return args.hasOwnProperty('lock_mode') && args.lock_mode === this.getCapabilityValue('lock_mode');
    // });
  }

  /**
   * @param storedPet
   * @param pet
   *
   * @returns {Promise<void>}
   */
  async checkPetChange(storedPet, pet) {
    console.log(storedPet, pet);
    // if (this.hasProperty(pet, 'position') && storedPet.position && storedPet.position.since !== pet.position.since) {
    //   this.logMessage('log', `change position for ${pet.name}`);
    //   storedPet.position = pet.position;
    //   this.patchStoredPet(storedPet);
    //   const position = Homey.app.getProperty(pet, ['position']);
    //   let deviceId = '';
    //   if (Object.prototype.hasOwnProperty.call(position, 'device_id')) {
    //     deviceId = position['device_id'];
    //   }
    //   if (deviceId === this.getId() || deviceId === '') {
    //     const petData = {
    //       pet: pet.name,
    //     };
    //     Homey.ManagerFlow.getCard('trigger', 'pet_eating').trigger(this, petData);
    //     Homey.ManagerFlow.getCard('trigger', 'specific_pet_eating').trigger(this, petData, {
    //       petId: pet.id,
    //     });
    //   }
    // }
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

};
