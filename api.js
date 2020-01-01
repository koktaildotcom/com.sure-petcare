const Homey = require('homey')

module.exports = [
    {
        method: 'POST',
        path: '/login',
        fn: (args, callback) => {
            Homey.app.login(args.body.username, args.body.password).then((token) => {
                return callback(null, token)
            })
        },
    },
    {
        method: 'GET',
        path: '/profile',
        fn: (args, callback) => {
            Homey.app.client.getProfile().then((profile) => {
                return callback(null, profile)
            })
        },
    },
    {
        method: 'GET',
        path: '/photo/:id',
        fn: (args, callback) => {
            Homey.app.client.getPhoto(parseInt(args.params.id)).then((photo) => {
                return callback(null, photo)
            })
        },
    },
]