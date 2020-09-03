'use strict';

const SurePetcareDriver = require('../../lib/sure-petcare-driver.js');

class SureflapPetDoorConnectDriver extends SurePetcareDriver {

  getProductId() {
    return 3;
  }

}

module.exports = SureflapPetDoorConnectDriver;
