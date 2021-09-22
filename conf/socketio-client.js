var ioclient = require('socket.io-client');
var $conf = require('../conf/conf');
var socket = ioclient.connect('ws://' + $conf.configuration.weburl, {reconnect: true});
socket.on('connect', function () {
    console.log('Connected!');
});
module.exports = {
    sendMessage : function (msg) {
        // Add a connect listener
        socket.emit('arduino', msg);
    }
};