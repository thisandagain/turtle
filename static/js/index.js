/**
 * Primary application logic.
 *
 * @package turtle
 * @author Andrew Sliwinski <andrew@diy.org>
 */
$(document).ready(function() {

    /**
     * Setup
     */
    var epoch       = Math.round((new Date()).getTime() / 1000);    // Timestamp
    var rand        = Math.floor(Math.random()*10001)               // Random seed

    var user        = 'guest::' + rand + epoch,
        users       = new Object(null),
        history     = [],
        history_i   = 0;
        size        = {
            width:  $(window).width(),
            height: $(window).height()
        };

    var network_ctx = document.getElementById('network').getContext('2d');
    var user_ctx    = document.getElementById('user').getContext('2d');
    var turtle_ctx  = document.getElementById('turtle').getContext('2d');

    /**
     * Window resize calc
     */
    function calc() {
        size.width  = $(window).width();
        size.height = $(window).height();

        network_ctx.canvas.width    = size.width;
        network_ctx.canvas.height   = size.height;
        user_ctx.canvas.width       = size.width;
        user_ctx.canvas.height      = size.height;
        turtle_ctx.canvas.width     = size.width;
        turtle_ctx.canvas.height    = size.height;
    }
    calc();

    $(window).resize(function() {
        calc();
    });

    /**
     * Init new user
     */
    users[user] = new CanvasTurtle(user_ctx, true, size.width, size.height);
    users[user].home();

    /**
     * Socket.io events
     */
    var socket = io.connect('http://192.168.1.66');

    socket.on('instruction', function (data) {
        // Check for user context & create if not found
        if (typeof users[data.uid] === 'undefined') {
            users[data.uid] = new CanvasTurtle(network_ctx, false, size.width, size.height);
        }

        // Pass package to user context
        for (var i = 0; i < data.package.length; i++) {
            for (var prop in data.package[i]) {
                users[data.uid][prop](
                    data.package[i][prop][0], 
                    data.package[i][prop][1], 
                    data.package[i][prop][2]
                );
            }
        }

        // End
        users[data.uid].end();

        // Debug
        console.dir(data);
        console.log('x: %s | y: %s', users[data.uid].x, users[data.uid].y);
    });

    socket.on('error', function (data) {
        console.dir(data);
    });

    /**
     * UI events
     */
    $('form').submit(function() {
        var cmd = $('form input:first').val();
        history.push(cmd); history_i = history.length;
        console.log(history_i);

        socket.emit('command', user, cmd);
        $('form input:first').val('');
        $('form input:first').focus();

        return false;
    });

    $(window).keydown (function (e) {

        function reflect () {
            console.dir(history);
            console.log('Index: ' + history_i);
            console.log('--------------------')
            var cmd = history[history_i];
            $('form input:first').val(cmd);
            $('form input:first').focus();
        }

        switch (e.keyCode) {
            // Up
            case 38: 
                if (history_i > 0) {
                    history_i--; reflect();
                }
                e.preventDefault();
                return false;
                break;
            // Down
            case 40:
                if (history_i < history.length) {
                    history_i++; reflect();
                }
                e.preventDefault();
                return false;
                break;
        }
    });

});