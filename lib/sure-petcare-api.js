'use strict'

const axios = require('axios')

class SurePetcareApi {

    constructor (token) {
        this.baseUrl = 'https://app.api.surehub.io/api'
        this.token = token
        this.client = axios.create({
            baseURL: this.baseUrl
        });

        this.client.interceptors.request.use(function (request) {
            console.log('sending request: ' + request.url)
            return request;
        }, function (error) {
            return Promise.reject(error);
        });

        this.client.interceptors.response.use(function (response) {
            console.log('getting response: ' + response.statusText)
            return response;
        }, function (error) {
            return Promise.reject(error);
        });
    }

    hasToken () {
        return this.token
    }

    async getDevice (uuid) {
        try {
            const response = await this.client.request(
              {
                  method: 'get',
                  url: '/device/' + uuid,
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + this.token,
                  },
              },
            )

            return response.data
        }
        catch (e) {
            throw new Error(e)
        }
    }

    async authenticate (username, password) {
        try {
            const login = await this.authLogin(username, password)
        }
        catch (e) {
            throw new Error(e)
        }

        if (false === login.hasOwnProperty('token')) {
            throw new Error('No token attribute in `login` configuration.')
        }

        this.token = login.token

        return this.token
    }

    async authLogin (username, password) {
        try {
            const response = await this.client.request(
              {
                  method: 'post',
                  url: '/auth/login',
                  data: JSON.stringify({
                      email_address: username,
                      password: password,
                      device_id: Math.floor(
                        Math.random() * (999999999 - 100000000) + 100000000,
                      ).toString(),
                  }),
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                  },
              },
            )

            return response.data.data
        }
        catch (e) {
            throw new Error(e)
        }
    }

    async getPhoto (id) {
        try {
            const start = await this.getStart()

            return start.photos.find((photo) => { return id === photo.id })
        }
        catch (e) {
            throw new Error(e)
        }
    }

    async getProfile () {
        try {
            const response = await this.client.request(
              {
                  method: 'get',
                  url: '/me',
                  params: {
                      with: [
                          'profilePhoto',
                      ],
                  },
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + this.token,
                  },
              },
            )

            return response.data.data
        }
        catch (e) {
            throw new Error(e)
        }
    }

    async getDevices () {
        try {
            const account = await this.getStart()
        }
        catch (e) {
            throw new Error(e)
        }

        if (false === account.hasOwnProperty('devices')) {
            throw new Error(
              'No devices attribute in `account.data` configuration.')
        }

        return account.devices
    }

    async getStart () {
        try {
            const response = await this.client.request(
              {
                  method: 'get',
                  url: '/me/start',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + this.token,
                  },
              },
            )

            return response.data.data
        }
        catch (e) {
            throw new Error(e)
        }
    }

    async getDeviceControl (uuid) {
        try {
            const response = await this.client.request(
              {
                  method: 'get',
                  url: '/device/' + uuid + '/control',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + this.token,
                  },
              },
            )

            return response.data.data
        }
        catch (e) {
            throw new Error(e)
        }
    }

    async setDeviceControl (uuid, state) {
        try {
            const response = await this.client.request(
              {
                  method: 'put',
                  url: '/device/' + uuid + '/control',
                  data: JSON.stringify({
                      locking: state,
                  }),
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + this.token,
                  },
              },
            )

            return response.data
        }
        catch (e) {
            throw new Error(e)
        }
    }
}

module.exports = SurePetcareApi
