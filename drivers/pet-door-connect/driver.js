'use strict'

const Homey = require('homey')

class PetDoorConnectDriver extends Homey.Driver {

    onInit () {
        this.log('PetDoorConnectDriver has been inited')
    }

    onPair (socket) {
        let username = ''
        let password = ''

        socket.on('login', (data, callback) => {
            username = data.username
            password = data.password

            console.log(data)
            callback(null, true)
        })

        socket.on('list_devices', (data, callback) => {

            // MyAPI.login({ username, password })
            // .then(api => {
            //     return api.getDevices();
            // })
            // .then(myDevices => {
            //
            // });

            Homey.app.client.getDevices().then((sureFlapDevices) => {

                const petDoors = sureFlapDevices.filter((sureFlapDevice) => {
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