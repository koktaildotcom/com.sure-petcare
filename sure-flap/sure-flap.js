'use strict'

const axios = require('axios')

class SureFlapClient {

    constructor () {
        this.baseUrl = 'https://app.api.surehub.io/api'
    }

    async getDevice (uuid) {
        return axios(
          {
              method: 'get',
              url: this.baseUrl + '/device/' + uuid,
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this.token,
              },
          },
        ).then((response) => {
            return response.data
        }).catch(function (error) {
            console.error(error)
        })
    }

    async login (username, password) {
        const login = await this.getLogin(username, password)

        if (false === login.hasOwnProperty('data')) {
            throw new Error('No data attribute in `auth` configuration.')
        }

        if (false === login.data.hasOwnProperty('token')) {
            throw new Error('No token attribute in `login` configuration.')
        }

        this.token = login.data.token

        return this.token
    }

    async getLogin (username, password) {
        return axios(
          {
              method: 'post',
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
        ).then((response) => {
            return response.data
        }).catch(function (error) {
            console.error(error)
        })
    }

    async getDevices () {
        const account = await this.getAccountConfiguration()

        if (false === account.hasOwnProperty('data')) {
            throw new Error('No data attribute in `account` configuration.')
        }

        if (false === account.data.hasOwnProperty('devices')) {
            throw new Error(
              'No devices attribute in `account.data` configuration.')
        }

        return account.data.devices
    }

    async getAccountConfiguration () {
        return axios(
          {
              method: 'get',
              url: this.baseUrl + '/me/start',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this.token,
              },
          },
        ).then((response) => {
            return response.data
        }).catch(function (error) {
            console.error(error)
        })
    }

    async getDeviceControl (uuid) {
        return axios(
          {
              method: 'get',
              url: this.baseUrl + '/device/' + uuid + '/control',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this.token,
              },
          },
        ).then((response) => {
            return response.data
        }).catch(function (error) {
            console.error(error)
        })
    }

    async setDeviceControl (uuid, state) {
        return axios(
          {
              method: 'put',
              url: this.baseUrl + '/device/' + uuid + '/control',
              data: JSON.stringify({
                  locking: state,
              }),
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + this.token,
              },
          },
        ).then((response) => {
            return response.data
        }).catch(function (error) {
            console.error(error)
        })
    }
}

module.exports = SureFlapClient