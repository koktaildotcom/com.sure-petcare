'use strict';

const Homey = require('homey');

module.exports = class SurePetcareDriver extends Homey.Driver {

  async onInit() {
    console.log('SurePetcareDriver device init');
    // this.id = await this.getDeviceData('id');
    //
    // if (this.hasCapability('measure_battery') === false) {
    //   await this.addCapability('measure_battery');
    // }
    //
    // Homey.app.registerDevice(this);
  }

  // async onPairListDevices(data, callback) {
  // const found = [];
  //
  // try {
  //   const devices = await Homey.app.client.getDevices();
  //
  //   const driverDevices = devices.filter(device => {
  //     return Object.prototype.hasOwnProperty.call(device, 'product_id') && this.getProductId().toString() === device.product_id.toString();
  //   });
  //
  //   const newSureDevices = driverDevices.filter(device => {
  //     return !this.getDevices().find(known => known.id === device.id);
  //   });
  //
  //   for (const current of newSureDevices) {
  //     found.push({
  //       id: current.name,
  //       name: current.name,
  //       data: current,
  //     });
  //   }
  //
  //   callback(null, found);
  // } catch (error) {
  //   callback(null, found);
  // }
  // }

};
