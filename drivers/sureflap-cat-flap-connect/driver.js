'use strict'

const SureflapDriver = require('../../lib/sureflap-driver.js')

class SureflapCatFlapConnectDriver extends SureflapDriver {
    getProductId () {
        return 6
    }
}

module.exports = SureflapCatFlapConnectDriver
