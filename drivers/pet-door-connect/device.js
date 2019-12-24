'use strict';

const Homey = require('homey');

class PetDoorConnect extends Homey.Device {
	
	onInit() {
		this.log('PetDoorConnect has been inited');
	}
	
}

module.exports = PetDoorConnect;