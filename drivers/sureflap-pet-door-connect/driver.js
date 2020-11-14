'use strict';

const SurePetcareDriver = require('../../lib/sure-petcare-driver.js');

module.exports = class SureflapPetDoorConnectDriver extends SurePetcareDriver {

  getProductId() {
    return 3;
  }

};
