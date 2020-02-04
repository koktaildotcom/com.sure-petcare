'use strict'

const axios = require('axios')

class SurePetcareApi {

    constructor (token) {
        this.baseUrl = 'https://app.api.surehub.io/api'
        this.token = token
        this.timeout = 2000;
    }

    hasToken () {
        return this.token
    }

    async getDevice (uuid) {
        const response = await axios(
          {
              method: 'get',
              timeout: this.timeout,
              url: this.baseUrl + '/device/' + uuid,
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this.token,
              },
          },
        )

        return response.data
    }

    async authenticate (username, password) {
        const login = await this.authLogin(username, password)

        if (false === login.hasOwnProperty('token')) {
            throw new Error('No token attribute in `login` configuration.')
        }

        this.token = login.token

        return this.token
    }

    async authLogin (username, password) {
        const response = await axios(
          {
              method: 'post',
              timeout: this.timeout,
              url: this.baseUrl + '/auth/login',
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

    async getPhoto (id) {
        const account = await this.getStart()

        return account.photos.find((photo) => { return id === photo.id })
    }

    async getProfile () {
        const response = await axios(
          {
              method: 'get',
              timeout: this.timeout,
              url: this.baseUrl + '/me',
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

    async getDevices () {
        const account = await this.getStart()

        if (false === account.hasOwnProperty('devices')) {
            throw new Error(
              'No devices attribute in `account.data` configuration.')
        }

        return account.devices
    }

    async getStart () {
        const response = await axios(
          {
              method: 'get',
              timeout: this.timeout,
              url: this.baseUrl + '/me/start',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this.token,
              },
          },
        )

        return response.data.data
    }

    async getDeviceControl (uuid) {
        const response = await axios(
          {
              method: 'get',
              timeout: this.timeout,
              url: this.baseUrl + '/device/' + uuid + '/control',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this.token,
              },
          },
        )

        return response.data.data
    }

    async setDeviceControl (uuid, state) {
        const response = await axios(
          {
              method: 'put',
              timeout: this.timeout,
              url: this.baseUrl + '/device/' + uuid + '/control',
              data: JSON.stringify({
                  locking: state,
              }),
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this.token,
              },
          },
        )

        console.log('succesfully set lock for device `' + uuid + '` mode to `' + state +'`')
        return response.data
    }
}

module.exports = SurePetcareApi
