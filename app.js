/**
 * REPL + MMO = WAT
 *
 * @package turtle
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var app     = require('http').createServer(handler),
    crypto  = require('crypto'),
    io      = require('socket.io').listen(app),
    static  = require('node-static');

var logo    = require('logo');

/**
 * Listen
 */
var port    = Number(process.env.PORT) || '3000';
app.listen(port);
console.log('Turtle listening on port %d', port);

/**
 * Server
 */
var server  = new static.Server('./static', { cache: 0 });
function handler (req, res) {
    req.addListener('end', function () {
        server.serve(req, res);
    });
}

/**
 * Composition
 */
function compose (from, cmd, obj) {
    return {
        user:       from.split('::')[0],
        uid:        from,
        command:    cmd,
        digest:     crypto.createHash('sha1').update(JSON.stringify(obj)).digest("hex"),
        package:    obj
    }
}

/**
 * Sockets
 */
io.configure(function () {
    io.enable('browser client etag');
    io.enable('browser client minification')
    io.set('log level', 2);
});

io.sockets.on('connection', function (socket) {
    socket.on('command', function (from, data) {
        logo.convert(data, function (err, obj) {
            if (err) {
                socket.emit('error', compose(from, data, err));
            } else {
                // Emit to sender
                socket.emit('instruction', compose(from, data, obj));

                // Volatile broadcast to all
                socket.broadcast.volatile.emit('instruction', compose(from, data, obj));
            }
        });
    });
});