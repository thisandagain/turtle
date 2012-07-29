/**
 * Drawing logic.
 *
 * @package turtle
 * @author Andrew Sliwinski <andrew@diy.org>
 */
(function () {
    Draw = function (tag) {
        this.dir    = -90;
        this.x      = 0;
        this.y      = 0;
        
        this.tag    = document.getElementById(tag) || tag;
        
        this.canvas = this.tag.getContext("2d");
        this.strokeStyle = this.canvas.strokeStyle = "#000";
        this.lineWidth = this.canvas.lineWidth = 1;
        this.fillStyle = this.canvas.fillStyle = "";

        this.ox     = 0;
        this.oy     = 0;
        
        this.pen    = true;
        
        this.canvas.beginPath();
    };

    Draw.prototype = {

        /**
         * General methods
         */
        forward: function (r) {
            var a = this.toRad(this.dir);

            this.x += r * Math.cos(a);
            this.y += r * Math.sin(a);
            
            if (this.pen)
                this.canvas.lineTo(this.x, this.y);
            else
                this.canvas.moveTo(this.x, this.y);
            
            return this;
        },
        
        back: function (r) {
            this.turn(-180);
            this.go(r);
            this.turn(180);
            
            return this;
        },

        left: function (deg) {
            this.turn(-deg);

            return this;
        },

        right: function (deg) {
            this.turn(deg);

            return this;
        },

        draw: function (b) {
            (b) ? this.pendown() : this.penup();

            return this;
        },

        /**
         * Utility methods
         */
        turn: function(deg) {
            this.dir += deg;
            this.dir = this.dir % 360;
            
            return this;
        },
        
        set: function() {
            this.homes.push({ x: this.x, y: this.y, angle: this.dir });
            return this;
        },
        
        angle: function(a) {
            this.dir = a - 90;
            return this;
        },
        
        home: function() {
            var last = this.homes.pop();
            this.dir = last.angle;

            return this.goto(this.x, this.y);
        },
        
        stroke: function() {
            this.canvas.stroke();

            return this;
        },
        
        begin: function() {
            this.canvas.beginPath();

            return this;
        },

        render: function() {
            if (this.fillStyle)
                this.fill();
            if (this.lineWidth)
                this.stroke();

            return this.begin();
        },
        
        penup: function() {
            this.pen = false;
            
            return this;
        },
        
        pendown: function() {
            this.pen = true;
            
            return this;
        },
        
        goto: function(x, y) {
            this.x = x;
            this.y = y;

            if (!this.pen)
                this.canvas.moveTo(x, y);
            else
                this.canvas.lineTo(x, y);
            
            return this;
        },
        
        jump: function(x, y) {
            this.canvas.beginPath();
            
            var p = this.pen;
            this.pen = true;
            this.goto(x, y);
            this.pen = p;

            return this;
        },
        
        polar: function(r, angle) {
            var a = this.toRad(angle + this.dir);
            
            this.x = this.ox + r * Math.cos(a);
            this.y = this.oy + r * Math.sin(a);

            if (this.pen)
                this.canvas.lineTo(this.x, this.y);
            else
                this.canvas.moveTo(this.x, this.y);

            return this;
        },
        
        origin: function() {
            this.ox = this.x;
            this.oy = this.y;
            
            return this;
        },
        
        rad: Math.PI / 180.0,
        
        toRad: function(d) {
            return d * this.rad;
        },
        
        pensize: function(size) {
            this.lineWidth = this.canvas.lineWidth = size;

            return this;
        },
        
        penstyle: function(str) {
            this.canvas.strokeStyle = this.strokeStyle = str;
            
            return this;
        }

    };
})();