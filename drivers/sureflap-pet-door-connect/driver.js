'use strict'

const SureflapDriver = require('../../lib/sureflap-driver.js')

class SureflapPetDoorConnectDriver extends SureflapDriver {
    getProductId () {
        return 3
    }
}

module.exports = SureflapPetDoorConnectDriver
