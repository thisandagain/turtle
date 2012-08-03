/**
 * Translates instructions from the logo interpreter into a command stream.
 *
 * @package logo
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Module
 */
var Turtle = function () {
    var self = this;

    self.buffer     = [];
    self.commands   = ['begin', 'end', 'move', 'turn', 'setposition', 'setheading', 'home', 'arc', 'showturtle' , 'hideturtle', 'clear', 'clearscreen', 'pendown', 'penup', 'setpenmode', 'setpencolor', 'setwidth', 'setcolor'];
    
    self.extract    = function (input, lead, tail) {
        return input.match(lead + '(.*?)' + tail)[1];
    };

    self.convert = function () {
        var a = {};

        for (var i = 0; i < self.commands.length; i++) {
            a[self.commands[i]] = null;
        }

        for (var item in a) {
            a[item] = function () {
                // Parse event
                var method  = self.extract(arguments.callee.caller.toString(), 'turtle\\.', '\\(');
                var args    = Array.prototype.slice.call(arguments);
                var command = new Object(null);
                command[method] = args;
                
                // To-Do: Set buffer threshold (# of commands) and stream output
                self.buffer.push(command);
            };
        }

        return a;
    };
};

module.exports = Turtle;
