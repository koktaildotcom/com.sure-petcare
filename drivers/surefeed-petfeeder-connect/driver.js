'use strict';

const SurePetcareDriver = require('../../lib/sure-petcare-driver.js');

class SurefeedPetfeederConnectDriver extends SurePetcareDriver {

  getProductId() {
    return 4;
  }

}

module.exports = SurefeedPetfeederConnectDriver;
