'use strict';

const Homey = require('homey');
const SurePetcareClient = require('./lib/sure-petcare-api');

module.exports = class SurePetcare extends Homey.App {

  onInit() {
    this.log('SureFlap is running...');
    this.syncInProgress = false;
    this.timeout = null;

    this.devices = [];
    this.storedPets = [];

    if (undefined === this.homey.settings.get('token')) {
      this.homey.settings.set('token', null);
    }

    this.client = new SurePetcareClient(this.homey.settings.get('token'));

    this.homey.flow.getDeviceTriggerCard('specific_pet_has_eating')
      .registerRunListener(async (args, state) => {
        let match = false;
        if (Object.prototype.hasOwnProperty.call(args, 'pet') && Object.prototype.hasOwnProperty.call(args.pet, 'id')) {
          match = args.pet.id === state.petId;
        }
        return match;
      })
      .getArgument('pet')
      .registerAutocompleteListener(async (query, args) => {
        let matches = this.storedPets.filter(
          pet => {
            return pet.name.match(new RegExp(query, 'gi'));
          },
        );
        if (!matches) {
          matches = [];
        }
        return matches;
      });

    this.homey.flow.getDeviceTriggerCard('specific_pet_away')
      .registerRunListener(async (args, state) => {
        let match = false;
        if (Object.prototype.hasOwnProperty.call(args, 'pet') && Object.prototype.hasOwnProperty.call(args.pet, 'id')) {
          match = args.pet.id === state.petId;
        }
        return match;
      })
      .getArgument('pet')
      .registerAutocompleteListener(async (query, args) => {
        let matches = this.storedPets.filter(
          pet => {
            return pet.name.match(new RegExp(query, 'gi'));
          },
        );
        if (!matches) {
          matches = [];
        }
        return matches;
      });

    this.homey.flow.getDeviceTriggerCard('specific_pet_home')
      .registerRunListener(async (args, state) => {
        let match = false;
        if (Object.prototype.hasOwnProperty.call(args, 'pet') && Object.prototype.hasOwnProperty.call(args.pet, 'id')) {
          match = args.pet.id === state.petId;
        }
        return match;
      })
      .getArgument('pet')
      .registerAutocompleteListener(async (query, args) => {
        let matches = this.storedPets.filter(
          pet => {
            return pet.name.match(new RegExp(query, 'gi'));
          },
        );
        if (!matches) {
          matches = [];
        }
        return matches;
      });

    this.homey.flow.getDeviceTriggerCard('pet_away');
    this.homey.flow.getDeviceTriggerCard('pet_home');
    this.homey.flow.getDeviceTriggerCard('pet_has_eating');
    this.homey.flow.getDeviceTriggerCard('weight_changed');

    this.triggerError = this.homey.flow.getTriggerCard('log_message');

    this._synchronise();
  }

  /**
   * @param severity
   * @param message
   */
  logMessage(severity, message) {
    console.log(`${this._getDateTime(new Date())} ${message}`);
    if (severity === 'error' || severity === 'debug') {
      if (this.triggerError) {
        this.triggerError.trigger({
          severity,
          message,
        });
      }
    }
  }

  /**
   * @param date Date
   * @returns {string}
   * @private
   */
  _getDateTime(date) {
    let hour = date.getHours();
    hour = (hour < 10 ? '0' : '') + hour;

    let min = date.getMinutes();
    min = (min < 10 ? '0' : '') + min;

    let sec = date.getSeconds();
    sec = (sec < 10 ? '0' : '') + sec;

    const year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = (month < 10 ? '0' : '') + month;

    let day = date.getDate();
    day = (day < 10 ? '0' : '') + day;

    return `${day}-${month}-${year} ${hour}:${min}:${sec}`;
  }

  /**
   * @param device SureflapDevice
   */
  registerDevice(device) {
    this.logMessage('log', `register device ${device.getId()}`);
    this.devices.push(device);
  }

  /**
   * @param device SureflapDevice
   */
  unregisterDevice(device) {
    this.logMessage('log', `unregister device ${device.id}`);
    this.devices = this.devices.filter(current => current.name !== device.name);
  }

  /**
   * Find a stored pet by name
   *
   * @param name
   */
  getStoredPet(name) {
    return this.storedPets.find(storedPet => storedPet.name === name);
  }

  /**
   * Patch a stored pet by name
   *
   * @param pet
   */
  patchStoredPet(pet) {
    // eslint-disable-next-line no-restricted-syntax
    for (const index in this.storedPets) {
      if (pet.name === this.storedPets[index].name) {
        this.storedPets[index] = pet;
      }
    }
  }

  /**
   * @private
   *
   * start the synchronisation
   */
  _synchronise() {
    this.logMessage('log', 'startSync');

    if (this.syncInProgress === true) {
      this.logMessage('log', 'syncInProgress not ready yet, wait for it');
      return;
    }

    if (this.client.hasToken() === false) {
      this.logMessage('log', 'Not authorized');
      this._setNewTimeout();
      return;
    }

    this.syncInProgress = true;

    const updateDevicesTime = new Date();
    if (this.devices.length === 0) {
      this.logMessage('log', 'No devices found');
      this._setNewTimeout();

      return;
    }

    this.client.getStart()
      .then(syncData => {
        const pets = this.getProperty(syncData, ['pets']);
        if (pets.length > 0) {
          for (const pet of pets) {
            const storedPet = this.getStoredPet(pet.name);
            if (!storedPet) {
              this.storedPets.push({ ...pet });
            }
          }
        }
        return syncData;
      })
      .then(syncData => {
        return this.devices.reduce((promise, device) => {
          promise.then(async () => {
            const pets = this.getProperty(syncData, ['pets']);
            if (pets.length > 0) {
              for (const pet of pets) {
                const storedPet = this.getStoredPet(pet.name);
                if (storedPet) {
                  await device.checkPetChange(storedPet, pet);
                }
              }
            }
          });

          return Promise.resolve(syncData);
        }, Promise.resolve());
      })
      .then(syncData => {
        return this.devices.reduce((promise, device) => {
          return promise.then(() => {
            return this.updateDevice(device, syncData);
          });
        }, Promise.resolve(syncData));
      })
      .then(() => {
        this.logMessage('log', `Hub sync complete in: ${(new Date() - updateDevicesTime) / 1000} seconds`);
        this._setNewTimeout();
      })
      .catch(error => {
        this.logMessage('error', error.toString());
        this._setNewTimeout();
      });
  }

  /**
   * update the devices one by one
   *
   * @param device SureflapDevice
   * @param data object
   *
   * @returns {Promise.<SureflapDevice>}
   */
  async updateDevice(device, data) {
    return device.update(data.devices.find(deviceData => deviceData.id === device.id));
  }

  /**
   * @param username
   * @param password
   *
   * @returns {Promise}
   */
  async login(username, password) {
    const token = await this.client.authenticate(username, password);
    await Homey.ManagerSettings.set('token', token);

    return token;
  }

  /**
   * @private
   *
   * set a new timeout for synchronisation
   */
  _setNewTimeout() {
    const interval = 1000 * 5;

    this.syncInProgress = false;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this._synchronise.bind(this), interval);
  }

  /**
   * @param target
   * @param params
   *
   * @returns {*}
   */
  getProperty(target, params) {
    for (const param of params) {
      if (!this.hasProperties(target, [param])) {
        throw new Error(`Unknown param: ${param}`);
      }
      target = target[param];
    }
    return target;
  }

  /**
   * @param target
   * @param params
   *
   * @returns {boolean}
   */
  hasProperties(target, params) {
    for (const param of params) {
      if (!Object.prototype.hasOwnProperty.call(target, param)) {
        return false;
      }
      target = target[param];
    }
    return true;
  }

  /**
   *
   * @param status
   *
   * @returns {Promise<number>}
   */
  async calculateBatteryPercentage(status) {
    let batteryPercentage = Math.round(((status - 5) / (6 - 5)) * 100);
    if (batteryPercentage > 100) {
      batteryPercentage = 100;
    }

    if (batteryPercentage < 0) {
      batteryPercentage = 0;
    }

    return batteryPercentage;
  }

};
