'use strict';

const Homey = require('homey');

class SurePetcareDriver extends Homey.Driver {

  async onPairListDevices() {
    const found = [];

    try {
      const devices = await Homey.app.client.getDevices();

      const driverDevices = devices.filter(device => {
        return Object.prototype.hasOwnProperty.call(device, 'product_id') && this.getProductId().toString() === device.product_id.toString();
      });

      const newSureDevices = driverDevices.filter(device => {
        return !this.getDevices().find(known => known.id === device.id);
      });

      for (const current of newSureDevices) {
        found.push({
          id: current.name,
          name: current.name,
          data: current,
        });
      }

      return found;
    } catch (error) {
      return found;
    }
  }

}

module.exports = SurePetcareDriver;