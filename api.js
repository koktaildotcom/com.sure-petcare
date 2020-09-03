const Homey = require('homey');

module.exports = [
  {
    method: 'POST',
    path: '/login',
    fn: (args, callback) => {
      if (args.body.hasOwnProperty('username') === false) {
        callback('No username found');
      }

      if (args.body.hasOwnProperty('password') === false) {
        callback('No password found');
      }

      this.homey.app.login(args.body.username, args.body.password)
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
      Homey.app.client.getPhoto(parseInt(args.params.id))
        .then(photo => {
          return callback(null, photo);
        }).catch(error => {
          return callback(error.message, null);
        });
    },
  },
];
