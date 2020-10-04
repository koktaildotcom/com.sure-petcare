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

    if (undefined === Homey.ManagerSettings.get('token')) {
      Homey.ManagerSettings.set('token', null);
    }

    this.client = new SurePetcareClient(Homey.ManagerSettings.get('token'));

    new Homey.FlowCardTriggerDevice('specific_pet_eating')
      .registerRunListener((args, state) => {
        let match = false;
        if (Object.prototype.hasOwnProperty.call(args, 'pet') && Object.prototype.hasOwnProperty.call(args.pet, 'id')) {
          match = args.pet.id === state.petId;
        }
        return Promise.resolve(match);
      })
      .register()
      .getArgument('pet')
      .registerAutocompleteListener((query, args) => {
        let matches = this.storedPets.filter(
          pet => {
            return pet.name.match(new RegExp(query, 'gi'));
          },
        );
        if (!matches) {
          matches = [];
        }
        return Promise.resolve(matches);
      });

    new Homey.FlowCardTriggerDevice('specific_pet_away')
      .registerRunListener((args, state) => {
        let match = false;
        if (Object.prototype.hasOwnProperty.call(args, 'pet') && Object.prototype.hasOwnProperty.call(args.pet, 'id')) {
          match = args.pet.id === state.petId;
        }
        return Promise.resolve(match);
      })
      .register()
      .getArgument('pet')
      .registerAutocompleteListener((query, args) => {
        let matches = this.storedPets.filter(
          pet => {
            return pet.name.match(new RegExp(query, 'gi'));
          },
        );
        if (!matches) {
          matches = [];
        }
        return Promise.resolve(matches);
      });

    new Homey.FlowCardTriggerDevice('specific_pet_home')
      .registerRunListener((args, state) => {
        let match = false;
        if (Object.prototype.hasOwnProperty.call(args, 'pet') && Object.prototype.hasOwnProperty.call(args.pet, 'id')) {
          match = args.pet.id === state.petId;
        }
        return Promise.resolve(match);
      })
      .register()
      .getArgument('pet')
      .registerAutocompleteListener((query, args) => {
        let matches = this.storedPets.filter(
          pet => {
            return pet.name.match(new RegExp(query, 'gi'));
          },
        );
        if (!matches) {
          matches = [];
        }
        return Promise.resolve(matches);
      });

    new Homey.FlowCardTriggerDevice('pet_away').register();
    new Homey.FlowCardTriggerDevice('pet_home').register();
    new Homey.FlowCardTriggerDevice('pet_eating').register();

    this.triggerError = new Homey.FlowCardTrigger('log_message').register();

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

    if (Homey.app.client.hasToken() === false) {
      this.logMessage('log', 'Not authorized');
      this._setNewTimeout();
      return;
    }

    this.syncInProgress = true;

    const updateDevicesTime = new Date();
    if (this.devices.length > 0) {
      Homey.app.client.getStart()
        .then(syncData => {
          const pets = this.getProperty(syncData, ['pets']);
          if (pets.length > 0) {
            for (const pet of pets) {
              const storedPet = this.getStoredPet(pet.name);
              if (!storedPet) {
                const imageUrl = this.getProperty(pet, ['photo', 'location']);
                const newPet = {
                  id: pet.id,
                  imageUrl,
                  name: pet.name,
                  description: pet.comments,
                };

                try {
                  newPet.status.feeding = this.getProperty(pet, ['status', 'feeding']);
                } catch (e) {
                  // don't support feeding
                }

                try {
                  newPet.position = this.getProperty(pet, ['position']);
                } catch (e) {
                  // don't support position
                }

                this.storedPets.push(newPet);
              }
            }
          }
          return syncData;
        })
        .then(syncData => {
          return Homey.app.updateDevices(this.devices, syncData);
        })
        .then(() => {
          this.logMessage('log', `Hub sync complete in: ${(new Date() - updateDevicesTime) / 1000} seconds`);
          this._setNewTimeout();
        })
        .catch(error => {
          this.logMessage('error', error.toString());
          this._setNewTimeout();
        });
    } else {
      this.logMessage('log', 'No devices found');
      this._setNewTimeout();
    }
  }

  /**
   * update the devices one by one
   *
   * @param devices SureflapDevice[]
   * @param data object
   *
   * @returns {Promise.<SureflapDevice[]>}
   */
  async updateDevices(devices, data) {
    return devices.reduce((promise, device) => {
      return promise.then(() => {
        return Homey.app.updateDevice(device, data);
      });
    }, Promise.resolve());
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
    await device.update(data.devices.find(deviceData => deviceData.id === device.id));
    const pets = this.getProperty(data, ['pets']);

    if (pets.length > 0) {
      for (const pet of pets) {
        const storedPet = this.getStoredPet(pet.name);
        if (storedPet) {
          await device.checkPetChange(storedPet, pet);
        }
      }
    }

    return device;
  }

  /**
   * @param username
   * @param password
   *
   * @returns {Promise}
   */
  async login(username, password) {
    const token = await Homey.app.client.authenticate(username, password);
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
