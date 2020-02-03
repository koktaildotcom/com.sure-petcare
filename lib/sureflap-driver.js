'use strict'

const Homey = require('homey')

class SureflapDriver extends Homey.Driver {

    onInit () {
        for (const device of this.getDevices()) {
            Homey.app.registerDevice(device)
        }

        Homey.app.startSync()
    }

    onPair (socket) {
        socket.on('list_devices', (data, callback) => {
            try {
                Homey.app.client.getDevices().then(sureFlapDevices => {
                    const petDoors = sureFlapDevices.filter(
                      (sureFlapDevice) => {
                          return sureFlapDevice.hasOwnProperty('product_id') &&
                            this.getProductId().toString() ===
                            sureFlapDevice.product_id.toString()
                      })

                    const devices = []
                    for (const petDoor of petDoors) {
                        devices.push({
                            name: petDoor.name,
                            data: petDoor,
                        })
                    }

                    callback(null, devices)
                }).catch((error) => {
                    callback(error)
                })
            }
            catch (error) {
                callback(error)
            }
        })
    }
}

module.exports = SureflapDriver
