'use strict';

const SurePetcareDriver = require('../../lib/sure-petcare-driver.js');

class SureflapCatFlapConnectDriver extends SurePetcareDriver {

  getProductId() {
    return 6;
  }

}

module.exports = SureflapCatFlapConnectDriver;
