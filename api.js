const Homey = require('homey')

module.exports = [
    {
        method: 'POST',
        path: '/login',
        fn: (args, callback) => {
            Homey.app.login().then((token) => {
                return callback(null, JSON.stringify(token))
            })
        },
    },
]