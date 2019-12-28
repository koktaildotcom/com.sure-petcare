'use strict'

const axios = require('axios')

class SureFlapClient {

    constructor () {
    }

    async getDevice (uuid) {
        const request = {
            method: 'get',
            url: '/device/' + uuid,
        }
        return this.client(request).then((response) => {
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
        const request = {
            method: 'get',
            url: '/me/start',
        }
        return this.client(request).then((response) => {
            return response.data
        }).catch(function (error) {
            console.error(error)
        })
    }

    async getDeviceControl (uuid) {
        const request = {
            method: 'get',
            url: '/device/' + uuid + '/control',
        }
        return this.client(request).then((response) => {
            return response.data
        }).catch(function (error) {
            console.error(error)
        })
    }

    async setDeviceControl (uuid, state) {
        const request = {
            method: 'put',
            url: '/device/' + uuid + '/control',
            data: JSON.stringify({
                locking: state,
            }),
        }
        return this.client(request).then((response) => {
            return response.data
        }).catch(function (error) {
            console.error(error)
        })
    }
}

module.exports = SureFlapClient