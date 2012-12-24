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
    request = require('request'),
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
    if (req.url.match('^\/gist')) return getGist(req, res);
    req.addListener('end', function () {
        server.serve(req, res);
    });
}

function getGist (req, res) {
    var gistID = req.url.split('/gist/')[1].replace('/[^0-9]+/g', '');
    request({json: true, url: 'https://api.github.com/gists/' + gistID}).pipe(res);
}

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