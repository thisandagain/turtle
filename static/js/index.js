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
        history_i   = 0,
        z_i         = 99,
        size        = {
            width:  2880,
            height: 1800
        };

    var network_ctx = document.getElementById('network').getContext('2d');
    var user_ctx    = document.getElementById('user').getContext('2d');
    var turtle_ctx  = document.getElementById('turtle').getContext('2d');

    network_ctx.canvas.width = size.width; network_ctx.canvas.height = size.height;
    user_ctx.canvas.width    = size.width; user_ctx.canvas.height    = size.height;
    turtle_ctx.canvas.width  = size.width; turtle_ctx.canvas.height  = size.height;

    /**
     * Scroll to center point
     */
    $('html body').scrollLeft( (size.width / 2) - ($(window).width() / 2) );
    $('html body').scrollTop( (size.height / 2) - ($(window).height() / 2) );

    /**
     * Command helper
     */
    function runCommand(cmd) {
        // Update history
        history.push(cmd); history_i = history.length;

        // Hide command layer details
        $('.cmd .detail').css('display', 'none');

        // Emit & reset
        socket.emit('command', user, users[user], cmd);
        $('form input').first().val('');
        $('form input').first().focus();
    }

    /**
     * Init new user
     */
    users[user] = new CanvasTurtle(user_ctx, turtle_ctx, true, size.width, size.height);
    users[user].home();

    /**
     * Socket.io events
     */
    var socket = io.connect(_host || 'http://localhost:3000');
    socket.on('instruction', function (data) {
        // Check for user context & create if not found
        if (typeof users[data.uid] === 'undefined') {
            users[data.uid] = new CanvasTurtle(network_ctx, turtle_ctx, false, size.width, size.height);
            
            users[data.uid].x = data.state.x;
            users[data.uid].y = data.state.y;
            users[data.uid].r = data.state.r;
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

        // Render command layer
        if (data.uid !== user && data.command.toUpperCase() !== 'HOME' && data.command.toUpperCase() !== 'CLEAN') {
            z_i++;      // Ensure that command layer is at the top of the stack
            var inject_cmd = '<div class="cmd" style="top: ' + users[data.uid].y + 'px; left: ' + users[data.uid].x + 'px; z-index: ' + z_i + ';"><img src="/images/ui_dot.gif" width="20" height="20" alt="" />';
            var inject_det = '<div class="detail">' + data.command.toUpperCase() + '</div>';
            $('#command').append(inject_cmd + inject_det + '</div>');
        }

        // Debug
        console.log('x: %s | y: %s | r: %s --> %s', users[data.uid].x, users[data.uid].y, users[data.uid].r, data.uid);
    });

    socket.on('error', function (data) {
        alert(data.package);
        console.dir(data);
    });

    /**
     * Form
     */
    $('form').submit(function (e) {
        e.preventDefault();

        var cmd = $('form input').first().val();
        runCommand(cmd);
    });

    $(window).on('keydown', function (e) {
        function reflect () {
            var cmd = history[history_i];
            $('form input').first().val(cmd);
            $('form input').first().focus();
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

    /**
     * Buttons
     */
    $('#helpBtn').on('click', function (e) {
        window.open('http://www.terrapinlogo.com/Help/commands.html');
    });

    $('#saveBtn').on('click', function (e) {
        var canvas = document.getElementById('user');
        window.open(canvas.toDataURL('image/png'));
    });

    /**
     * Commands
     */
    $('.cmd').live('click', function (e) {
        // Bring to front
        z_i++;
        $(this).css('z-index', z_i);

        // Toggle detail
        var item = $(this).find('.detail');
        if (item.css('display') === 'block') {
            item.css('display', 'none');
        } else {
            item.css('display', 'block');
        }

        // Reset
        $('.cmd').not(this).find('.detail').css('display', 'none');
    });

    $('.cmd > .detail').live('click', function (e) {
        var command = $(this).html();
        $('form input').first().val(command);
        $('form input').first().focus();
    });
});