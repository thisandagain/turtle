/**
 * Unit test suite.
 *
 * @package logo
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var fs      = require('fs'),
    async   = require('async'),
    test    = require('tap').test,
    logo    = require('../lib/index.js');

// Pipe stream through stdout
fs.createReadStream(__dirname + '/test.txt').pipe(logo.stream).pipe(process.stdout);