'use strict'

const Homey = require('homey')

class PetDoorConnectDriver extends Homey.Driver {

    onInit () {
        this.log('PetDoorConnectDriver has been inited')
    }

    onPairListDevices (data, callback) {
        const devices = [
            {
                // Required properties:
                'data': {'id': 'abcd'},

                // Optional properties, these overwrite those specified in app.json:
                // "name": "My Device",
                // "icon": "/my_icon.svg", // relative to: /drivers/<driver_id>/assets/
                // "capabilities": [ "onoff", "dim" ],
                // "capabilitiesOptions: { "onoff": {} },

                // Optional properties, device-specific:
                // "store": { "foo": "bar" },
                // "settings": { "my_setting": "my_value" },

            },
        ]

        callback(null, devices)
    }
}

module.exports = PetDoorConnectDriver