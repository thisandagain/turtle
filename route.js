/**
 * Application router.
 *
 * @package turtle
 * @author Andrew Sliwinski
 */

/**
 * Dependencies
 */
var fs          = require('fs'),
    filed       = require('filed'),
    handlebars  = require('handlebars');

/**
 * Compile template
 */
var source      = fs.readFileSync(__dirname + '/static/index.html').toString();
var template    = handlebars.compile(source);

/**
 * Static file server.
 *
 * @param {Object} Request
 * @param {Object} Response
 *
 * @return {void}
 */
function static (req, res) {
    filed(__dirname + '/static' + req.url).pipe(res);
}

/**
 * Export
 */
module.exports = function (router, data) {
    // Init router
    var route = router();

    // Root
    var root = template(data);
    route.get('/', function (req, res) {
        res.writeHead(200);
        res.end(root);
    });

    // Static
    route.get('/css/*', static);
    route.get('/images/*', static);
    route.get('/js/*', static);

    // Export
    return route;
}