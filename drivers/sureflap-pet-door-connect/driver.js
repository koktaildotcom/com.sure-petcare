'use strict'

const SureflapDriver = require('../../lib/sureflap-driver.js')

class SureflapPetDoorConnectDriver extends SureflapDriver {
    getProductId () {
        return 2
    }
}

module.exports = SureflapPetDoorConnectDriver
