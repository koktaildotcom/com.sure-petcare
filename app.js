'use strict';

const Homey = require('homey');
const DeviceClient = require('./sure-flap/sure-flap.js')

class SureFlap extends Homey.App {
	onInit() {
		this.client = new DeviceClient()
		this.log('SureFlap is running...');
	}
}

module.exports = SureFlap;