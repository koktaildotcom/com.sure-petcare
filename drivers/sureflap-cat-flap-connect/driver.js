'use strict';

const SurePetcareDriver = require('../../lib/sure-petcare-driver');

module.exports = class SureflapCatFlapConnectDriver extends SurePetcareDriver {

  getProductId() {
    return 6;
  }

};
