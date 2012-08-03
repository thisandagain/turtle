/**
 * Turtle graphics in javascript.
 *
 * @package turtle
 * @authors Joshua Bell <http://www.calormen.com/logo/>
 *          Andrew Sliwinski <andrew@diy.org>
 */

function CanvasTurtle(canvas_ctx, turtle_ctx, isUser, width, height) {
    width   = Number(width);
    height  = Number(height);

    function deg2rad (d) { return d / 180 * Math.PI; }
    function rad2deg (r) { return r * 180 / Math.PI; }

    var self = this;
    function moveto (x, y) {

        function _go (x1, y1, x2, y2) {
            if (self.down) {
                canvas_ctx.beginPath();
                canvas_ctx.moveTo(x1, y1);
                canvas_ctx.lineTo(x2, y2);
                canvas_ctx.stroke();
            }
        }

        while (true) {
            _go(self.x, self.y, x, y);
            self.x = x;
            self.y = y;
            return;
        }
    }

    this.move = function (distance) {
        var x, y, point, saved_x, saved_y, EPSILON = 1e-3;
        point = Math.abs(distance) < EPSILON;

        if (point) {
            saved_x = this.x;
            saved_y = this.y;
            distance = EPSILON;
        }

        x = this.x + distance * Math.cos(this.r);
        y = this.y - distance * Math.sin(this.r);
        moveto(x, y);

        if (point) {
            this.x = saved_x;
            this.y = saved_y;
        }
    };

    this.turn = function (angle) {
        this.r -= deg2rad(angle);
    };

    this.penup = function () { this.down = false; };
    this.pendown = function () { this.down = true; };

    this.setpenmode = function (penmode) {
        this.penmode = penmode;
        canvas_ctx.globalCompositeOperation =
            (this.penmode === 'erase') ? 'destination-out' :
            (this.penmode === 'reverse') ? 'xor' : 'source-over';
    };
    this.getpenmode = function () { return this.penmode; };

    this.setturtlemode = function (turtlemode) { this.turtlemode = turtlemode; };
    this.getturtlemode = function () { return this.turtlemode; };

    this.ispendown = function () { return this.down; };

    var STANDARD_COLORS = {
        0: "black", 1: "blue", 2: "lime", 3: "cyan",
        4: "red", 5: "magenta", 6: "yellow", 7: "white",
        8: "brown", 9: "tan", 10: "green", 11: "aquamarine",
        12: "salmon", 13: "purple", 14: "orange", 15: "gray"
    };

    this.setcolor = function (color) {
        if (isUser) {
            if (STANDARD_COLORS[color] !== undefined) {
                this.color = STANDARD_COLORS[color];
            } else {
                this.color = color;
            }
            canvas_ctx.strokeStyle = this.color;
            canvas_ctx.fillStyle = this.color;
        }
    };
    this.getcolor = function () { return this.color; };

    this.setwidth = function (width) {
        this.width = width;
        canvas_ctx.lineWidth = this.width;
    };
    this.getwidth = function () { return this.width; };

    this.setfontsize = function (size) {
        this.fontsize = size;
        canvas_ctx.font = this.fontsize + 'px sans-serif';
    };
    this.getfontsize = function () { return this.fontsize; };

    this.setposition = function (x, y) {
        x = (x === undefined) ? this.x : x + (width / 2);
        y = (y === undefined) ? this.y : -y + (height / 2);

        moveto(x, y);
    };

    this.towards = function (x, y) {
        x = x + (width / 2);
        y = -y + (height / 2);

        return 90 - rad2deg(Math.atan2(this.y - y, x - this.x));
    };

    this.setheading = function (angle) {
        this.r = deg2rad(90 - angle);
    };

    this.clearscreen = function () {
        this.home();
        this.clear();
    };

    this.clear = function () {
        if (isUser) {
            canvas_ctx.clearRect(0, 0, width, height);
        }
    };

    this.home = function () {
        moveto(width / 2, height / 2);
        this.r = deg2rad(90);
    };

    this.showturtle = function () {
        this.visible = true;
    };

    this.hideturtle = function () {
        this.visible = false;
    };

    this.isturtlevisible = function () {
        return this.visible;
    };

    this.getheading = function () {
        return 90 - rad2deg(this.r);
    };

    this.getxy = function () {
        return [this.x - (width / 2), -this.y + (height / 2)];
    };

    this.drawtext = function (text) {
        canvas_ctx.save();
        canvas_ctx.translate(this.x, this.y)
        canvas_ctx.rotate(-this.r);
        canvas_ctx.fillText(text, 0, 0);
        canvas_ctx.restore();
    };

    this.arc = function (angle, radius) {
        var self = this;
        if (this.turtlemode == 'wrap') {
            [self.x, self.x + width, this.x - width].forEach(function (x) {
                [self.y, self.y + height, this.y - height].forEach(function (y) {
                    canvas_ctx.beginPath();
                    canvas_ctx.arc(x, y, radius, -self.r, -self.r + deg2rad(angle), false);
                    canvas_ctx.stroke();
                });
            });
        } else {
            canvas_ctx.beginPath();
            canvas_ctx.arc(this.x, this.y, radius, -this.r, -this.r + deg2rad(angle), false);
            canvas_ctx.stroke();
        }
    };

    this.begin = function () {
        // Purge turtle context for user
        if (isUser) {
            turtle_ctx.clearRect(0, 0, width, height);
        }

        // Cleanup
        canvas_ctx.fillText = canvas_ctx.fillText || function fillText(string, x, y) { };
    };

    this.end = function () {
        if (this.visible) {
            var d   = 6;
            var m   = 1.9;
            var ctx = (isUser) ? turtle_ctx : canvas_ctx;
            var restore = ctx.fillStyle;

            ctx.fillStyle = (isUser) ? '#36c7fb' : '#ddd';
            ctx.beginPath();
            ctx.arc(this.x, this.y, d, 0, 2 * Math.PI, false);
            ctx.moveTo(this.x + Math.cos(this.r) * (d * m), this.y - Math.sin(this.r) * (d * m));
            ctx.lineTo(this.x + Math.cos(this.r - Math.PI * 2 / 3) * d, this.y - Math.sin(this.r - Math.PI * 2 / 3) * d);
            ctx.lineTo(this.x + Math.cos(this.r + Math.PI * 2 / 3) * d, this.y - Math.sin(this.r + Math.PI * 2 / 3) * d);
            ctx.lineTo(this.x + Math.cos(this.r) * (d * m), this.y - Math.sin(this.r) * (d * m));
            ctx.fill();
            ctx.fillStyle = restore;
        }
    };

    // ------------------------
    // ------------------------

    canvas_ctx.lineCap      = 'round';
    canvas_ctx.fillStyle    = (isUser) ? '#36c7fb' : '#ddd';
    canvas_ctx.strokeStyle  = (isUser) ? '#000000' : '#ddd';
    this.color              = (isUser) ? '#000000' : '#ddd';

    this.setwidth(1);
    this.setpenmode('paint');
    this.setfontsize(14);
    this.setturtlemode('wrap');
    this.showturtle(true);
    this.pendown(true);

    this.x = width / 2;
    this.y = height / 2;
    this.r = Math.PI / 2;

    this.begin();
    this.end();
}