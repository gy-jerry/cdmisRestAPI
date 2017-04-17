var config = require('../config'),
    socketioCtrl = require('../controllers/socketio_controller');

module.exports = function (io, webEntry) {
    // Initializes and retrieves the given Namespace
    var ioDefault = io.of('/' + webEntry.domainName + '/' + (webEntry.routeIO || 'default')); 
    ioDefault.on('connection', function (socket) {
    	
        socketioCtrl.login(ioDefault, socket); 
    });
};