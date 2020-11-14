'use strict';

const SurePetcareDriver = require('../../lib/sure-petcare-driver.js');

module.exports = class SurefeedPetfeederConnectDriver extends SurePetcareDriver {

  getProductId() {
    return 4;
  }

};
