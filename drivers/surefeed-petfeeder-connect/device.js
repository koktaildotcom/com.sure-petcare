'use strict';

const Homey = require('homey');

class SurefeedPetfeederConnect extends Homey.Device {

  onInit() {
    this.log('SurefeedPetfeederConnect has been inited');
  }

}

module.exports = SurefeedPetfeederConnect;
