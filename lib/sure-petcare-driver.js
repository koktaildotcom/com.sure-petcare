'use strict';

const Homey = require('homey');
const SurePetcareClient = require('./sure-petcare-api');

module.exports = class SurePetcareDriver extends Homey.Driver {

  async onInit() {
    console.log('SurePetcareDriver device init');
    this.client = new SurePetcareClient(this.homey.settings.get('token'));
  }

  async onPair(session) {
    let username = '';
    let password = '';

    console.log('onpair');
    session.setHandler('login', async data => {
      try {
        console.log('try login');
        username = data.username;
        password = data.password;

        console.log('try authenticate');
        const token = await this.client.authenticate(username, password);
        console.log('token!!!');
        console.log(token);
        await this.homey.settings.set('token', token);

        console.log('works!');
        return true;
      } catch (e) {
        return false;
      }
    });

    session.setHandler('list_devices', async data => {
      const found = [];

      try {
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
      } catch (error) {
        return found;
      }
    });
  }

};
