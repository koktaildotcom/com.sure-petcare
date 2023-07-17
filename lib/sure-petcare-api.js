'use strict';

const axios = require('axios');

module.exports = class SurePetcareApi {

  constructor(token) {
    this.baseUrl = 'https://app.api.surehub.io/api';
    this.token = token;
    this.timeout = 20000;
    this.client = axios.create({
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0' },
      baseURL: this.baseUrl,
    });

    this.client.interceptors.request.use(request => {
      return request;
    }, error => {
      console.error(error);
      return Promise.reject(error);
    });

    this.client.interceptors.response.use(response => {
      return response;
    }, error => {
      console.error(error);
      return Promise.reject(error);
    });
  }

  hasToken() {
    return this.token;
  }

  async getDevice(uuid) {
    const response = await this.client.request(
      {
        method: 'get',
        timeout: this.timeout,
        url: `${this.baseUrl}/device/${uuid}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    return response.data;
  }

  async getStream(url) {
    const response = await this.client.request(
      {
        method: 'get',
        timeout: this.timeout,
        responseType: 'stream',
        url,
      },
    );

    return response.data;
  }

  async authenticate(username, password) {
    const login = await this.authLogin(username, password);

    if (Object.prototype.hasOwnProperty.call(login, 'token') === false) {
      throw new Error('No token attribute in `login` configuration.');
    }

    this.token = login.token;

    return this.token;
  }

  async authLogin(username, password) {
    const response = await this.client.request(
      {
        method: 'post',
        timeout: this.timeout,
        url: `${this.baseUrl}/auth/login`,
        data: JSON.stringify({
          email_address: username,
          password,
          device_id: Math.floor(
            Math.random() * (999999999 - 100000000) + 100000000,
          ).toString(),
        }),
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    return response.data.data;
  }

  async getPhoto(id) {
    const account = await this.getStart();

    if (Object.prototype.hasOwnProperty.call(account, 'photos') === false) {
      throw new Error('No photo found.');
    }

    return account.photos.find(photo => {
      return id === photo.id;
    });
  }

  async getTimeline(householdId) {
    const response = await this.client.request(
      {
        method: 'get',
        timeout: this.timeout,
        url: `${this.baseUrl}/timeline/household/${householdId}`,
        params: {
          page: 1,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    return response.data.data;
  }

  async getProfile() {
    const response = await this.client.request(
      {
        method: 'get',
        timeout: this.timeout,
        url: `${this.baseUrl}/me`,
        params: {
          with: [
            'profilePhoto',
          ],
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    return response.data.data;
  }

  async getDevices() {
    const account = await this.getStart();

    if (Object.prototype.hasOwnProperty.call(account, 'devices') === false) {
      throw new Error(
        'No devices attribute in `account.data` configuration.',
      );
    }

    return account.devices;
  }

  async getStart() {
    const response = await this.client.request(
      {
        method: 'get',
        timeout: this.timeout,
        url: `${this.baseUrl}/me/start`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    return response.data.data;
  }

  async getDeviceControl(uuid) {
    const response = await this.client.request(
      {
        method: 'get',
        timeout: this.timeout,
        url: `${this.baseUrl}/device/${uuid}/control`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    return response.data.data;
  }

  async setDeviceControl(uuid, state) {
    const response = await this.client.request(
      {
        method: 'put',
        timeout: this.timeout,
        url: `${this.baseUrl}/device/${uuid}/control`,
        data: JSON.stringify({
          locking: state,
        }),
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    console.log(`successfully set lock for device \`${uuid}\` mode to \`${state}\``);
    return response.data;
  }

};
