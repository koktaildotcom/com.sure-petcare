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
    }

    async login (username, password) {
        const token = await Homey.app.client.authenticate(username, password);
        await Homey.ManagerSettings.set('token', token);

        return token
    }
}

module.exports = SureFlap