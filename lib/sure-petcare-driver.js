'use strict';

const Homey = require('homey');

module.exports = class SurePetcareDriver extends Homey.Driver {

  async onInit() {
    console.log('SurePetcareDriver device init');
  }

  async onPair(session) {
    let username = this.homey.settings.get('username');
    let password = this.homey.settings.get('password');

    session.setHandler('login', async data => {
      try {
        username = data.username;
        password = data.password;

        this.homey.settings.set('username', username);
        this.homey.settings.set('password', password);

        const token = await this.homey.app.client.authenticate(username, password);

        await this.homey.settings.set('token', token);

        return true;
      } catch (e) {
        console.log(e);

        // @todo add correct error
        throw e;
      }
    });

    session.setHandler('list_devices', async data => {
      try {
        const found = [];

        const devices = await this.homey.app.client.getDevices();

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
      } catch (e) {
        console.log(e);

        // @todo add correct error
        throw e;
      }
    });
  }

};
