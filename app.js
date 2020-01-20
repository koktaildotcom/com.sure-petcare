'use strict'

const Homey = require('homey')
const SurePetcareClient = require('./lib/sure-petcare-api.js')

class SurePetcare extends Homey.App {

    onInit () {
        this.log('SureFlap is running...')
        this.syncInProgress = false
        this.devices = []
        this.storedPets = []

        if (undefined === Homey.ManagerSettings.get('token')) {
            Homey.ManagerSettings.set('token', null)
        }

        this.client = new SurePetcareClient(Homey.ManagerSettings.get('token'))

        this.petCameHome = new Homey.FlowCardTrigger('pet_came_home')
        this.petCameHome.register()

        this.petCameHome.registerRunListener((args, state) => {
            console.log(args, state)
        })

        this.petCameHome.getArgument('search_pet').
          registerAutocompleteListener((query, args) => {
              let matches = this.storedPets.filter(
                (pet) => { return pet.name.match(new RegExp(query, 'gi')) },
              )
              if (!matches) {
                  matches = []
              }
              return Promise.resolve(matches)
          })
    }

    startSync () {
        console.log('startSync')
        if (Homey.app.client.hasToken()) {
            this._synchronise()
        }
    }

    /**
     * @param device SureflapDevice
     */
    registerDevice (device) {
        console.log('register device ' + device)
        this.devices.push(device)
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
     * @private
     *
     * start the synchronisation
     */
    _synchronise () {

        console.log('_synchronise')

        console.log(this.syncInProgress)

        if (false === this.syncInProgress) {
            try {
                this.syncInProgress = true
                let updateDevicesTime = new Date()
                if (this.devices.length > 0) {
                    console.log('get start')
                    Homey.app.client.getStart().then(syncData => {

                        const pets = this._getProperty(syncData, ['pets'])
                        if (pets.length > 0) {
                            for (const pet of pets) {
                                const storedPet = this.getStoredPet(pet.name);
                                if (!storedPet) {
                                    this.client.getPhoto(
                                      parseInt(pet.photo_id)).then((photo) => {
                                        console.log('add ' + pet.name)
                                        this.storedPets.push({
                                            image: photo.location,
                                            name: pet.name,
                                            description: pet.name,
                                        })
                                    }).catch(() => {
                                        console.log('add ' + pet.name)
                                        this.storedPets.push({
                                            name: pet.name,
                                            description: pet.name,
                                        })
                                    })
                                }
                            }
                        }

                        Homey.app.updateDevices(this.devices, syncData).
                          then(() => {
                              console.log('Hub sync complete in: ' +
                                (new Date() - updateDevicesTime) / 1000 +
                                ' seconds')
                              this.syncInProgress = false
                              this._setNewTimeout()
                          }).
                          catch(error => {
                              this.syncInProgress = false
                              this._setNewTimeout()
                              console.log(error)
                          })
                    })
                } else {
                    this.syncInProgress = false
                    console.log('No devices found, try next time')
                    this._setNewTimeout()
                }
            } catch (error) {
                this.syncInProgress = false
                this._setNewTimeout()
                console.log(error)
            }
        } else {
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
    async updateDevices (devices, data) {
        console.log('_updateDevices')
        return await devices.reduce((promise, device) => {
            return promise.then(() => {
                console.log('reduce')
                return Homey.app.updateDevice(device, data).catch((error) => {
                    console.log(error.message)
                })

            }).catch(error => {
                console.log(error.message)
            })
        }, Promise.resolve())
    }

    /**
     * update the devices one by one
     *
     * @param device SureflapDevice
     *
     * @returns {Promise.<SureflapDevice>}
     */
    async updateDevice (device, data) {

        const pets = this._getProperty(syncData, ['pets'])
        if (pets.length > 0) {
            for (const pet of pets) {
                if(this._getProperty(pet, ['status', 'activity', 'device_id']) === device.getId()){
                    console.log('throught this device!');
                }
                const storedPet = this.getStoredPet(pet.name);
                if(storedPet){
                    this.petCameHome.trigger({
                        'pet': pet.name
                    })
                }
            }
        }



        /**
         status:
         { activity:
            { tag_id: 86163,
              device_id: 477790,
              where: 1,
              since: '2020-01-12T07:21:00+00:00' } } }
         */

        //console.log(data)
        //console.log(device)

        return device
    }

    async login (username, password) {
        const token = await Homey.app.client.authenticate(username, password)
        await Homey.ManagerSettings.set('token', token)

        return token
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

    /**
     * @private
     *
     * set a new timeout for synchronisation
     */
    _setNewTimeout () {
        let interval = 1000 * 10

        setTimeout(this._synchronise.bind(this), interval)
    }
}

module.exports = SurePetcare
