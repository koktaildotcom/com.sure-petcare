'use strict';

module.exports = {
  async postLogin({ homey, body }) {
    if (!body) {
      return 'No body found';
    }

    if (Object.prototype.hasOwnProperty.call(body, 'username') === false) {
      return 'No username found';
    }

    if (Object.prototype.hasOwnProperty.call(body, 'password') === false) {
      return 'No password found';
    }

    return homey.app.login(body.username, body.password)
      .then(token => {
        return token;
      }).catch(error => {
        return error.message;
      });
  },

  async getProfile({ homey }) {
    return homey.app.client.getProfile()
      .then(profile => {
        return profile;
      }).catch(error => {
        return error.message;
      });
  },

  async getPhoto({ homey }) {
    return homey.app.client.getProfile()
      .then(profile => {
        return profile;
      }).catch(error => {
        return error.message;
      });
  },
};
