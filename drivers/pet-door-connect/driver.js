'use strict'

const Homey = require('homey')

class PetDoorConnectDriver extends Homey.Driver {

    onInit () {
        this.log('PetDoorConnectDriver has been inited')
    }

    onPair (socket) {

        if (!Homey.ManagerSettings.get('token')) {
            socket.on('login', (data, callback) => {
                Homey.ManagerSettings.set('username', data.username)
                Homey.ManagerSettings.set('password', data.password)

                const username = Homey.ManagerSettings.get('username')
                const password = Homey.ManagerSettings.get('password')

                Homey.app.client.login(username, password).then((token) => {
                    Homey.ManagerSettings.set('token', token)
                    callback(null, true)
                }).catch((error) => {
                    callback('Error when logging in')
                    throw new Error(error)
                })
            })
        }

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