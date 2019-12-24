'use strict';

const Homey = require('homey');

class SureFlap extends Homey.App {
	
	onInit() {
		this.log('SureFlap is running...');
	}
	
}

module.exports = SureFlap;