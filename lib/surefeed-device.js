'use strict';

const Homey = require('homey');

const SINGLE = 'single';
const DOUBLE = 'double';

const SINGLE_BOWL = [
  'both',
];

const DOUBLE_BOWLS = [
  'left',
  'right',
];

module.exports = class SurefeedDevice extends Homey.Device {

  async onInit() {
    console.log('Surefeed device init');
    this.id = await this.getDeviceData('id');

    if (this.hasCapability('measure_battery') === false) {
	  await this.addCapability('measure_battery');
    }

    this.homey.app.registerDevice(this);
  }

  /**
   * @param deviceData
   *
   * @returns {Promise.<void>}
   */
  async update(deviceData) {
    if (this.hasCapability('measure_battery')) {
	  const batteryStatus = this.homey.app.getProperty(
        deviceData,
        ['status', 'battery'],
	  );

	  await this.setCapabilityValue('measure_battery', await this.homey.app.calculateBatteryPercentage(batteryStatus));
    }

    if (Object.prototype.hasOwnProperty.call(deviceData, 'control') !== false) {
	  if (deviceData.control.bowls.type === 1) {
        await this.updateSetting({ bowlType: SINGLE });
	  } else {
        await this.updateSetting({ bowlType: DOUBLE });
	  }
    }

    if (Object.prototype.hasOwnProperty.call(deviceData, 'household_id') !== false) {
      const syncData = await this.homey.app.client.getTimeline(deviceData.household_id);
      const context = syncData.filter(timeline => {
        return [21, 22, 24].includes(timeline.type) && timeline.devices.find(device => {
		  return device.id === this.getId();
        });
	  });

	  if (context.length > 0) {
        const current = context[0];
        if (Object.prototype.hasOwnProperty.call(current, 'weights') !== false && current.weights.length > 0) {
		  const { frames } = current.weights[0];
		  if (await this.getSetting('bowlType') === SINGLE) {
            await this.tryToAddCapability('weight.both');
            await this.tryToRemoveCapability('weight.left');
            await this.tryToRemoveCapability('weight.right');

            await this.tryTriggerChange('both', frames[0].current_weight);
		  } else if (await this.getSetting('bowlType') === DOUBLE) {
            await this.tryToAddCapability('weight.left');
            await this.tryToAddCapability('weight.right');
            await this.tryToRemoveCapability('weight.both');

            await this.tryTriggerChange('left', frames[0].current_weight);
            await this.tryTriggerChange('right', frames[1].current_weight);
		  }
        }
	  }
    }
  }

  async tryToAddCapability(capability) {
    if (this.hasCapability(capability) === false) {
	  return this.addCapability(capability);
    }

    return Promise.resolve();
  }

  async tryToRemoveCapability(capability) {
    if (this.hasCapability(capability) === true) {
	  return this.removeCapability(capability);
    }

    return Promise.resolve();
  }

  /**
   * try triggering change
   *
   * @param bowlType
   * @param newValue
   */
  tryTriggerChange(bowlType, newValue) {
    const capability = `weight.${bowlType}`;
    const value = this.getCapabilityValue(capability);
    let rounded = Math.round((newValue + Number.EPSILON) * 100) / 100;
    rounded = (rounded <= 0) ? 0 : rounded;
    if (value !== rounded) {
      this.setDeviceCapabilityValue(capability, rounded);
      this.homey.flow.getTriggerCard('weight_changed').trigger(this, {
        bowl: this.homey.__(bowlType),
        amount: ((rounded < 0) ? 0 : rounded),
	  });
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
    if (!this.homey.app.hasProperties(pet, ['status', 'feeding', 'at'])) {
	  return;
    }

    if (!this.homey.app.hasProperties(storedPet, ['status', 'feeding', 'at'])) {
	  // store the first in cache
	  storedPet.status = {
        feeding: {
		  at: null,
        },
	  };
	  this.homey.app.patchStoredPet(storedPet);
    }

    if (storedPet.status.feeding.at !== pet.status.feeding.at) {
	  this.homey.app.logMessage('log', `change feeding for ${pet.name}`);
	  storedPet.status.feeding = pet.status.feeding;
	  this.homey.app.patchStoredPet(storedPet);
	  const feeding = this.homey.app.getProperty(pet, ['status', 'feeding']);
	  let deviceId = '';
	  if (Object.prototype.hasOwnProperty.call(feeding, 'device_id')) {
        deviceId = feeding['device_id'];
	  }

	  if (deviceId === this.getId() || deviceId === '') {
        let rounded = 0;
        if (await this.getSetting('bowlType') === SINGLE) {
		  rounded = 0 - Math.round((feeding.change[0] + Number.EPSILON) * 100) / 100;
		  if (rounded > 0) {
            const petData = {
			  pet: pet.name,
			  bowl: this.homey.__(SINGLE_BOWL[0]),
			  amount: rounded,
            };
            this.homey.flow.getFlowCardTrigger('pet_has_eating').trigger(this, petData);
            this.homey.flow.getFlowCardTrigger('specific_pet_has_eating').trigger(this, petData, {
              petId: pet.id,
            });
		  }
        } else if (await this.getSetting('bowlType') === DOUBLE) {
		  rounded = 0 - Math.round((feeding.change[0] + Number.EPSILON) * 100) / 100;
		  if (rounded > 0) {
            const petData = {
			  pet: pet.name,
			  bowl: this.homey.__(DOUBLE_BOWLS[0]),
			  amount: rounded,
            };
            this.homey.flow.getFlowCardTrigger('pet_has_eating').trigger(this, petData);
            this.homey.flow.getFlowCardTrigger('specific_pet_has_eating').trigger(this, petData, {
              petId: pet.id,
            });
		  }
		  rounded = 0 - Math.round((feeding.change[1] + Number.EPSILON) * 100) / 100;
		  if (rounded > 0) {
            const petData = {
			  pet: pet.name,
			  bowl: this.homey.__(DOUBLE_BOWLS[1]),
			  amount: rounded,
            };
            this.homey.flow.getFlowCardTrigger('pet_has_eating').trigger(this, petData);
            this.homey.flow.getFlowCardTrigger('specific_pet_has_eating').trigger(this, petData, {
              petId: pet.id,
            });
		  }
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
   * @returns string
   */
  getId() {
    return this.id;
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

  async updateSetting(setting) {
    const settings = await this.getSettings();
    return this.setSettings({ ...settings, ...setting });
  }

};
