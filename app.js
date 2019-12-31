'use strict'

const Homey = require('homey')
const DeviceClient = require('./lib/sure-flap.js')

class SureFlap extends Homey.App {
    onInit () {
        this.log('SureFlap is running...')
        if (undefined === Homey.ManagerSettings.get('token')) {
            Homey.ManagerSettings.set('token', null)
        }
        this.client = new DeviceClient(Homey.ManagerSettings.get('token'))

        if (false === Homey.app.client.hasToken()) {
            this.login()
        }
    }

    async login () {
        const token = Homey.ManagerSettings.get('token')
        const username = Homey.ManagerSettings.get('username')
        const password = Homey.ManagerSettings.get('password')
        return Homey.app.client.authenticate(username, password).then((token) => {
            return Homey.ManagerSettings.set('token', token, () => {
                return token
            })
        }).catch((error) => {
            console.error('Error when logging in')
            throw new Error(error)
        })
    }
}

module.exports = SureFlap