'use strict';

const SurePetcareDriver = require('../../lib/sure-petcare-driver');

module.exports = class FelaquaConnectDriver extends SurePetcareDriver {

  getProductId() {
    return 8;
  }

};
