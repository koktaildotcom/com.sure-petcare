'use strict'

const axios = require('axios')

class SurePetcareApi {

    constructor (token) {
        this.baseUrl = 'https://app.api.surehub.io/api'
        this.token = token
    }

    hasToken () {
        return this.token
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

    async authenticate (username, password) {
        const login = await this.authLogin(username, password)

        if (false === login.hasOwnProperty('token')) {
            throw new Error('No token attribute in `login` configuration.')
        }

        this.token = login.token

        return this.token
    }

    async authLogin (username, password) {
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
            return response.data.data
        }).catch(function (error) {
            console.error(error)
        })
    }

    async getPhoto (id) {
        const account = await this.getAccountConfiguration()

        return account.photos.find((photo) => { return id === photo.id })
    }

    async getProfile () {
        return axios(
          {
              method: 'get',
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
        ).then((response) => {
            return response.data.data
        }).catch(function (error) {
            console.error(error)
        })
    }

    async getDevices () {
        const account = await this.getAccountConfiguration()

        if (false === account.hasOwnProperty('devices')) {
            throw new Error(
              'No devices attribute in `account.data` configuration.')
        }

        return account.devices
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
            return response.data.data
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
            return response.data.data
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

module.exports = SurePetcareApi
