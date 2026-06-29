'use strict';

const Homey = require('homey');

const MEASURE_BATTERY = 'measure_battery';
const MEASURE_SIGNAL_STRENGTH = 'measure_signal_strength';
const MEASURE_FILL_LEVEL = 'measure_fill_level';
const ALARM_OFFLINE = 'alarm_offline';

module.exports = class FelaquaDevice extends Homey.Device {

  async onInit() {
    this.log('Felaqua device init');

    this.id = await this.getDeviceData('id');

    await this.tryToAddCapability(MEASURE_BATTERY);
    await this.tryToAddCapability(MEASURE_SIGNAL_STRENGTH);
    await this.tryToAddCapability(MEASURE_FILL_LEVEL);
    await this.tryToAddCapability(ALARM_OFFLINE);

    this.homey.app.registerDevice(this);
  }

  getDeviceId() {
    return this.id;
  }

  /**
   * @param deviceData
   *
   * @returns {Promise.<void>}
   */
  async update(deviceData) {
    if (this.hasCapability(MEASURE_BATTERY)) {
      const batteryStatus = this.homey.app.getProperty(deviceData, ['status', 'battery']);
      await this.setCapabilityValue(MEASURE_BATTERY, await this.homey.app.calculateBatteryPercentage(batteryStatus));
    }

    if (this.hasCapability(MEASURE_SIGNAL_STRENGTH)) {
      const signalStrength = this.homey.app.getProperty(deviceData, ['status', 'signal', 'device_rssi']);
      await this.setCapabilityValue(MEASURE_SIGNAL_STRENGTH, signalStrength);
    }

    const fillPercent = Math.round(this.homey.app.getProperty(deviceData, ['status', 'bowl_status', 0, 'fill_percent']));
    if (this.getCapabilityValue(MEASURE_FILL_LEVEL) === null) {
      await this.setCapabilityValue(MEASURE_FILL_LEVEL, fillPercent);
    }
    this.tryTriggerChange(fillPercent);

    const offlineState = this.homey.app.getProperty(deviceData, ['status', 'online']) !== true;
    if (this.hasCapability(ALARM_OFFLINE)) {
      await this.setCapabilityValue(ALARM_OFFLINE, offlineState);
    }
  }

  async tryToAddCapability(capability) {
    if (this.hasCapability(capability) === false) {
      return this.addCapability(capability);
    }
    return Promise.resolve();
  }

  /**
   * try triggering change
   *
   * @param newValue
   */
  tryTriggerChange(newValue) {
    const currentValue = this.getCapabilityValue(MEASURE_FILL_LEVEL);
    this.homey.app.logMessage('log', `change fill level of ${this.getName()} - new ${newValue} - current ${currentValue}`);
    if (currentValue !== newValue) {
      this.setDeviceCapabilityValue(MEASURE_FILL_LEVEL, newValue);
      const fillLevelData = {
        fill_level: newValue,
      };

      if (currentValue < newValue) {
        this.homey.flow.getDeviceTriggerCard('felaqua_was_refilled')
          .trigger(this)
          .catch(this.error);
      }

      this.homey.flow.getDeviceTriggerCard('felaqua_fill_level_changed')
        .trigger(this, fillLevelData)
        .catch(this.error);
      this.homey.flow.getDeviceTriggerCard('felaqua_fill_level_less_than')
        .trigger(this, fillLevelData, fillLevelData)
        .catch(this.error);
    }
  }

  /**
   * Set the CapabilityValue
   *
   * @param key
   * @param value
   */
  setDeviceCapabilityValue(key, value) {
    this.setCapabilityValue(key, value)
      .then(() => {
        console.log(`Setting ${key} with value ${value}`);
      })
      .catch(error => {
        console.error(`Setting ${key} with value ${value} gives an error:${error.message}`);
      });
  }

  /**
   * @param storedPet
   * @param pet
   *
   * @returns {Promise<void>}
   */
  async checkPetChange(storedPet, pet) {
    if (!this.homey.app.hasProperties(pet, ['status', 'drinking', 'at'])) {
      return;
    }

    if (!this.homey.app.hasProperties(storedPet, ['status', 'drinking', 'at'])) {
      // store the first in cache
      storedPet.status = {
        drinking: {
          at: null,
        },
      };
      this.homey.app.patchStoredPet(storedPet);
    }

    if (storedPet.status.drinking.at !== pet.status.drinking.at) {
      const drinking = this.homey.app.getProperty(pet, ['status', 'drinking']);
      let deviceId = '';
      if (Object.prototype.hasOwnProperty.call(drinking, 'device_id')) {
        deviceId = drinking['device_id'];
      }

      if (deviceId === this.getDeviceId() || deviceId === '') {
        // only update the stored pet if the device id matches or is empty, otherwise we might override the drinking status of another device
        storedPet.status.drinking = pet.status.drinking;
        this.homey.app.patchStoredPet(storedPet);

        const rounded = 0 - Math.round(drinking.change[0]);
        this.homey.app.logMessage('log', `change drinking for ${pet.name} on ${this.getName()}: drank ${rounded} ml`);
        if (rounded > 0) {
          const petData = {
            pet: pet.name,
            amount: rounded,
          };
          this.homey.app.logMessage('log', `trigger pet_drank on ${this.getName()} with ${petData.pet} and ${petData.amount} ml`);
          this.homey.flow.getDeviceTriggerCard('pet_drank')
            .trigger(this, petData)
            .catch(this.error);
          this.homey.app.logMessage('log', `trigger specific_pet_drank on ${this.getName()} with ${petData.pet} and ${petData.amount} ml`);
          this.homey.flow.getDeviceTriggerCard('specific_pet_drank')
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

};
