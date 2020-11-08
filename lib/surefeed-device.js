'use strict';

const Homey = require('homey');

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

    Homey.app.registerDevice(this);
  }

  /**
   * @param deviceData
   *
   * @returns {Promise.<void>}
   */
  async update(deviceData) {
    /**
     {
  id: 361471,
  parent_device_id: 290557,
  product_id: 4,
  household_id: 58876,
  name: 'Surefeed mauwie',
  serial_number: 'U004-0056817',
  mac_address: 'F1DD00C0F9D5B370',
  index: 1,
  version: 'ODc=',
  created_at: '2019-07-19T13:38:45+00:00',
  updated_at: '2020-11-05T19:26:44+00:00',
  pairing_at: '2020-08-29T15:30:12+00:00',
  control: {
    bowls: { settings: [Array], type: 4 },
    fast_polling: false,
    lid: { close_delay: 4 },
    training_mode: 0
  },
  parent: {
    id: 290557,
    product_id: 1,
    household_id: 58876,
    name: 'Driehoekje',
    serial_number: 'H008-0290557',
    mac_address: '0000801F12913282',
    version: 'MjU3',
    created_at: '2019-04-18T14:30:09+00:00',
    updated_at: '2020-11-05T19:26:43+00:00'
  },
  status: {
    version: { device: [Object] },
    battery: 6.01,
    learn_mode: null,
    online: true,
    signal: { device_rssi: -89, hub_rssi: -87.25 }
  },
  tags: [
    {
      id: 86163,
      index: 0,
      profile: 2,
      version: 'MA==',
      created_at: '2020-08-29T15:30:29+00:00',
      updated_at: '2020-08-29T15:30:29+00:00'
    }
  ]
}
     */
    if (this.hasCapability('measure_battery')) {
      const batteryStatus = Homey.app.getProperty(
        deviceData,
        ['status', 'battery'],
      );

      await this.setCapabilityValue('measure_battery', await Homey.app.calculateBatteryPercentage(batteryStatus));
    }

    if (Object.prototype.hasOwnProperty.call(deviceData, 'control') !== false) {
      // console.log(deviceData.control.bowls.settings);
      // { food_type: 1, target: 100 }, { food_type: 2, target: 100 }
    }

    if (Object.prototype.hasOwnProperty.call(deviceData, 'household_id') !== false) {
      const syncData = await Homey.app.client.getTimeline(deviceData.household_id);
      const context = syncData.filter(timeline => {
        return [21, 22, 24].includes(timeline.type) && timeline.devices.find(device => {
          return device.id === this.getId();
        });
      });

      if (context.length > 0) {
        const current = context[0];
        if (Object.prototype.hasOwnProperty.call(current, 'weights') !== false && current.weights.length > 0) {
          const { frames } = current.weights[0];
          if (frames.length === 1) {
            await this.tryToAddCapability('weight.both');
            await this.tryToRemoveCapability('weight.left');
            await this.tryToRemoveCapability('weight.right');

            await this.tryTriggerChange('both', frames[0].current_weight);
          } else if (frames.length === 2) {
            await this.tryToAddCapability('weight.left');
            await this.tryToAddCapability('weight.right');
            await this.tryToRemoveCapability('weight.both');

            await this.tryTriggerChange('left', frames[0].current_weight);
            await this.tryTriggerChange('right', frames[1].current_weight);
          }
        }

        /**
         {
            "id": 58658113,
            "device_id": 361471,
            "tag_id": 86163,
            "duration": 135,
            "context": 1,
            "created_at": "2020-11-07T16:39:29+00:00",
            "updated_at": "2020-11-07T16:39:29+00:00",
            "frames": [
                {
                    "id": 117316018,
                    "index": 0,
                    "current_weight": 18.89,
                    "change": -0.15,
                    "created_at": "2020-11-07T16:39:29+00:00",
                    "updated_at": "2020-11-07T16:39:29+00:00"
                },
                {
                    "id": 117316019,
                    "index": 1,
                    "current_weight": 24.78,
                    "change": -2.45,
                    "created_at": "2020-11-07T16:39:29+00:00",
                    "updated_at": "2020-11-07T16:39:29+00:00"
                }
            ]
          }
         */
      }
      // const deviceLockState = await this.getCapabilityValue('lock_mode');
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
    if (value !== newValue) {
      const rounded = Math.round((newValue + Number.EPSILON) * 100) / 100;
      this.setDeviceCapabilityValue(capability, ((rounded < 0) ? 0 : rounded));
      Homey.ManagerFlow.getCard('trigger', 'weight_changed').trigger(this, {
        bowl: bowlType,
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
    if (!Homey.app.hasProperties(pet, ['status', 'feeding', 'at'])) {
      return;
    }

    if (!Homey.app.hasProperties(storedPet, ['status', 'feeding', 'at'])) {
      storedPet.status = {
        feeding: {
          at: null,
        },
      };
    }

    if (storedPet.status.feeding.at !== pet.status.feeding.at) {
      Homey.app.logMessage('log', `change feeding for ${pet.name}`);
      storedPet.status.feeding = pet.status.feeding;
      const feeding = Homey.app.getProperty(pet, ['status', 'feeding']);
      let deviceId = '';
      if (Object.prototype.hasOwnProperty.call(feeding, 'device_id')) {
        deviceId = feeding['device_id'];
      }

      if (deviceId === this.getId() || deviceId === '') {
        const bowls = (feeding.change.length === 2) ? DOUBLE_BOWLS : SINGLE_BOWL;
        for (const [i] of bowls.entries()) {
          const rounded = Math.round((feeding.change[i] + Number.EPSILON) * 100) / 100;
          if (rounded <= 0) {
            continue;
          }
          const petData = {
            pet: pet.name,
            bowl: (feeding.change.length === 2) ? DOUBLE_BOWLS[i] : SINGLE_BOWL[i],
            amount: (0 - feeding.change[i]),
          };

          Homey.ManagerFlow.getCard('trigger', 'pet_has_eating').trigger(this, petData);
          Homey.ManagerFlow.getCard('trigger', 'specific_pet_has_eating').trigger(this, petData, {
            petId: pet.id,
          });
        }
      }
    } else {
      // add initial one
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
    Homey.app.registerDevice(this);
  }

  /**
   * Unregister device
   */
  onDeleted() {
    Homey.app.unregisterDevice(this);
  }

};
