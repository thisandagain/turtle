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

    var user        = 'Astro::' + rand + epoch,
        users       = new Object(null),
        size        = {
            width:  $(window).width(),
            height: $(window).height()
        };

    var canvas_ctx  = document.getElementById('render').getContext('2d');
    var turtle_ctx  = document.getElementById('turtle').getContext('2d');

    /**
     * Window resize calc
     */
    function calc() {
        size.width  = $(window).width();
        size.height = $(window).height();

        canvas_ctx.canvas.width  = size.width;
        canvas_ctx.canvas.height = size.height;
        turtle_ctx.canvas.width  = size.width;
        turtle_ctx.canvas.height = size.height;
    }
    calc();

    $(window).resize(function() {
        calc();
    });

    /**
     * Socket.io events
     */
    var socket = io.connect('http://192.168.1.66');

    socket.on('instruction', function (data) {
        console.dir(data);

        // Check for user context & create if not found
        if (typeof users[data.uid] === 'undefined') {
            users[data.uid] = new CanvasTurtle(canvas_ctx, turtle_ctx, size.width, size.height);
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

        users[data.uid].end();
        console.log('x: %1 | y: %1', users[data.uid].x, users[data.uid].y);
    });

    socket.on('error', function (data) {
        console.dir(data);
    });

    /**
     * Form
     */
    $('form').submit(function() {
        socket.emit('command', user, $('form input:first').val());
        $('form input:first').val('');
        return false;
    });

});