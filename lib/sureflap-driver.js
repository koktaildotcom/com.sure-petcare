'use strict'

const Homey = require('homey')

class SureflapDriver extends Homey.Driver {

    onInit() {
        for (const device of this.getDevices()) {
            Homey.app.registerDevice(device)
        }

        Homey.app.startSync()
    }

    onPair(socket) {
        socket.on('list_devices', (data, callback) => {
            try {
                Homey.app.client.getDevices().then(sureFlapDevices => {
                    const petDoors = sureFlapDevices.filter((device) => {
                        return device.hasOwnProperty('product_id') &&
                            this.getProductId().toString() === device.product_id.toString()
                    })

                    const newPetDoors = petDoors.filter((device) => {
                        return !this.getDevices().find((known) => known.id === device.id);
                    })

                    const devices = []
                    for (const petDoor of newPetDoors) {
                        devices.push({
                            id: petDoor.name,
                            name: petDoor.name,
                            data: petDoor,
                        })
                    }

                    callback(null, devices)
                }).catch((error) => {
                    callback(error)
                })
            } catch (error) {
                callback(error)
            }
        })
    }
}

module.exports = SureflapDriver
