'use strict';

const Homey = require('homey');

module.exports = [
  {
    method: 'POST',
    path: '/login',
    fn: (args, callback) => {
      if (Object.prototype.hasOwnProperty.call(args, 'body') === false) {
        callback('No body found');
      }

      if (Object.prototype.hasOwnProperty.call(args.body, 'username') === false) {
        callback('No username found');
      }

      if (Object.prototype.hasOwnProperty.call(args.body, 'password') === false) {
        callback('No password found');
      }

      Homey.app.login(args.body.username, args.body.password)
        .then(token => {
          return callback(null, token);
        }).catch(error => {
          return callback(error.message, null);
        });
    },
  },
  {
    method: 'GET',
    path: '/profile',
    fn: (args, callback) => {
      Homey.app.client.getProfile()
        .then(profile => {
          return callback(null, profile);
        }).catch(error => {
          return callback(error.message, null);
        });
    },
  },
  {
    method: 'GET',
    path: '/photo/:id',
    fn: (args, callback) => {
      Homey.app.client.getPhoto(parseInt(args.params.id, 10))
        .then(photo => {
          return callback(null, photo);
        }).catch(error => {
          return callback(error.message, null);
        });
    },
  },
];
