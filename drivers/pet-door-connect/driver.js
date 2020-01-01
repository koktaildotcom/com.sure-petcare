'use strict'

const Homey = require('homey')

class PetDoorConnectDriver extends Homey.Driver {

    onInit () {
        this.log('PetDoorConnectDriver has been inited')
    }

    onPair (socket) {
        socket.on('list_devices', (data, callback) => {
            Homey.app.client.getDevices().then(sureFlapDevices => {
                const petDoors = sureFlapDevices.filter(
                  (sureFlapDevice) => {
                      return sureFlapDevice.hasOwnProperty('product_id') &&
                        3 === sureFlapDevice.product_id
                  })

                const devices = []
                for (const petDoor of petDoors) {
                    devices.push({
                        name: petDoor.name,
                        data: petDoor,
                    })
                }

                callback(null, devices)
            })
        })
    }
}

module.exports = PetDoorConnectDriver