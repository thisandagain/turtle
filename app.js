/**
 * REPL + MMO = WAT
 *
 * @package turtle
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var crypto  = require('crypto'),
    http    = require('http'),
    router  = require('router');

var logo    = require('logo');

/**
 * Server
 */
var config  = {
    host:       process.env.HOST || process.argv[2] || 'localhost',
    port:       Number(process.env.PORT) || '3000',
    production: process.env.NODE_ENV === 'production'
};
var route   = require('./route.js')(router, config),
    app     = http.createServer(route);

/**
 * Composition
 */
function compose (from, state, cmd, obj) {
    return {
        user:       from.split('::')[0],
        uid:        from,
        state:      state,
        command:    cmd,
        digest:     crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex'),
        package:    obj
    }
}

/**
 * Sockets
 */
var io = require('socket.io').listen(app);
io.configure(function () {
    io.enable('browser client etag');
    io.enable('browser client minification')
    io.set('log level', 2);
});

io.sockets.on('connection', function (socket) {
    socket.on('command', function (from, state, data) {
        logo.convert(data, function (err, obj) {
            if (err) return socket.emit('error', compose(from, state, data, err));

            // Emit to sender & volatile emit to all
            socket.emit('instruction', compose(from, state, data, obj));
            socket.broadcast.volatile.emit('instruction', compose(from, state, data, obj));
        });
    });
});

/**
 * Listen
 */
app.listen(config.port);
console.log('Turtle listening at %s on port %d', config.host, config.port);
