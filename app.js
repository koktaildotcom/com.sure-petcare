'use strict'

const Homey = require('homey')
const SurePetcareClient = require('./lib/sure-petcare-api.js')

class SurePetcare extends Homey.App {

    onInit() {
        this.log('SureFlap is running...')
        this.syncInProgress = false
        this.timeout = null
        this.devices = []
        this.storedPets = []

        if (undefined === Homey.ManagerSettings.get('token')) {
            Homey.ManagerSettings.set('token', null)
        }

        this.client = new SurePetcareClient(Homey.ManagerSettings.get('token'))

        new Homey.FlowCardTriggerDevice('specific_pet_away')
            .registerRunListener((args, state) => {
                let match = false
                if (args.hasOwnProperty('pet') && args.pet.hasOwnProperty('id')) {
                    match = args.pet.id === state.petId
                }
                return Promise.resolve(match)
            })
            .register()
            .getArgument('pet')
            .registerAutocompleteListener((query, args) => {
                let matches = this.storedPets.filter(
                    (pet) => {
                        return pet.name.match(new RegExp(query, 'gi'))
                    },
                )
                if (!matches) {
                    matches = []
                }
                return Promise.resolve(matches)
            })

        new Homey.FlowCardTriggerDevice('specific_pet_home')
            .registerRunListener((args, state) => {
                let match = false
                if (args.hasOwnProperty('pet') && args.pet.hasOwnProperty('id')) {
                    match = args.pet.id === state.petId
                }
                return Promise.resolve(match)
            })
            .register()
            .getArgument('pet')
            .registerAutocompleteListener((query, args) => {
                let matches = this.storedPets.filter(
                    (pet) => {
                        return pet.name.match(new RegExp(query, 'gi'))
                    },
                )
                if (!matches) {
                    matches = []
                }
                return Promise.resolve(matches)
            })

        new Homey.FlowCardTriggerDevice('pet_away').register()
        new Homey.FlowCardTriggerDevice('pet_home').register()

        this.triggerError = new Homey.FlowCardTrigger('log_message').register()
    }

    logMessage(severity, message) {
        console.log(this._getDateTime(new Date()) + ' ' + message);
        if (severity === 'error' || severity === 'debug')
            if (this.triggerError) {
                this.triggerError.trigger({
                    'severity': severity,
                    'message': message,
                })
            }
    }


    /**
     * @param date Date
     * @returns {string}
     * @private
     */
    _getDateTime(date) {

        let hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;

        let min = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;

        let sec = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;

        let year = date.getFullYear();

        let month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;

        let day = date.getDate();
        day = (day < 10 ? "0" : "") + day;

        return day + "-" + month + "-" + year + " " + hour + ":" + min + ":" + sec;
    }

    /**
     * start the sync process
     */
    startSync() {
        this.logMessage('log', 'startSync')
        if (Homey.app.client.hasToken()) {
            this._synchronise()
        }
    }

    /**
     * @param device SureflapDevice
     */
    registerDevice(device) {
        this.logMessage('log', 'register device ' + device.id)
        this.devices.push(device)
    }

    /**
     * @param device SureflapDevice
     */
    unregisterDevice(device) {
        this.logMessage('log', 'unregister device ' + device.id)
        for (const index in this.devices) {
            if (device.name === this.devices[index].name) {
                this.devices.splice(index, 1)
            }
        }
    }

    /**
     * Find a stored pet by name
     *
     * @param name
     */
    getStoredPet(name) {
        return this.storedPets.find((storedPet) => storedPet.name === name)
    }

    /**
     * Patch a stored pet by name
     *
     * @param pet
     */
    patchStoredPet(pet) {
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
        if (true === this.syncInProgress) {
            this.logMessage('log', 'syncInProgress not ready yet, wait for it')
            return;
        }

        this.syncInProgress = true

        let updateDevicesTime = new Date()
        if (this.devices.length > 0) {
            Homey.app.client.getStart()
                .then(syncData => {
                    const pets = this._getProperty(syncData, ['pets'])
                    if (pets.length > 0) {
                        for (const pet of pets) {
                            const storedPet = this.getStoredPet(pet.name);
                            if (!storedPet) {
                                this.storedPets.push({
                                    id: pet.id,
                                    image: this._getProperty(pet, ['photo', 'location']),
                                    name: pet.name,
                                    description: pet.comments,
                                    position: this._getProperty(pet, ['position'])
                                })
                            }
                        }
                    }
                    return syncData;
                })
                .then((syncData) => {
                    return Homey.app.updateDevices(this.devices, syncData)
                })
                .then(() => {
                    this.logMessage('log', 'Hub sync complete in: ' + (new Date() - updateDevicesTime) / 1000 + ' seconds')
                    this._setNewTimeout()
                })
                .catch(error => {
                    this.logMessage('error', error)
                    this._setNewTimeout()
                })
        } else {
            this.logMessage('debug', 'No devices found')
            this._setNewTimeout()
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
        return await devices.reduce((promise, device) => {
            return promise.then(() => {
                return Homey.app.updateDevice(device, data)
            })
        }, Promise.resolve())
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
        const pets = this._getProperty(data, ['pets'])
        if (pets.length > 0) {
            for (const pet of pets) {
                const storedPet = this.getStoredPet(pet.name)
                if (pet.position.where !== storedPet.position.where) {
                    this.logMessage('log', 'change position for ' + pet.name)
                    storedPet.position = pet.position
                    this.patchStoredPet(storedPet);
                    const deviceId = this._getProperty(pet, ['position', 'device_id'])
                    if (deviceId === device.getId()) {
                        const petData = {
                            'pet': pet.name,
                        }
                        if (pet.position.where === 1) {
                            Homey.ManagerFlow.getCard('trigger', 'pet_home').trigger(device, petData);
                            Homey.ManagerFlow.getCard('trigger', 'specific_pet_home').trigger(device, petData, {
                                petId: pet.id,
                            })
                        }
                        if (pet.position.where === 2) {
                            Homey.ManagerFlow.getCard('trigger', 'pet_away').trigger(device, petData);
                            Homey.ManagerFlow.getCard('trigger', 'specific_pet_away').trigger(device, petData, {
                                petId: pet.id,
                            })
                        }
                    }
                }
            }
        }

        return device
    }

    /**
     * @param username
     * @param password
     *
     * @returns {Promise}
     */
    async login(username, password) {
        const token = await Homey.app.client.authenticate(username, password)
        await Homey.ManagerSettings.set('token', token)

        return token
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
            if (target.hasOwnProperty(param)) {
                target = target[param]
            }
        }
        return target
    }

    /**
     * @private
     *
     * set a new timeout for synchronisation
     */
    _setNewTimeout() {
        let interval = 1000 * 5

        this.syncInProgress = false

        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this._synchronise.bind(this), interval)
    }
}

module.exports = SurePetcare
