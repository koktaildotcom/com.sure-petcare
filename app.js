'use strict'

const Homey = require('homey')
const DeviceClient = require('./sure-flap/sure-flap.js')

class SureFlap extends Homey.App {
    onInit () {
        this.log('SureFlap is running...')
        this.client = new DeviceClient(Homey.ManagerSettings.get('token'))

        if (false === Homey.app.client.hasToken()) {
            this.login()
        }
    }

    login () {
        const token = Homey.ManagerSettings.get('token')
        console.log('login?')
        console.log(token)
        const username = Homey.ManagerSettings.get('username')
        const password = Homey.ManagerSettings.get('password')
        Homey.app.client.authenticate(username, password).then((token) => {
            Homey.ManagerSettings.set('token', token)
            return token
        }).catch((error) => {
            console.error('Error when logging in')
            throw new Error(error)
        })
    }
}

module.exports = SureFlap