'use strict';

require('colors');

global.info = console.info;
global.success = function () {
    info((' √ ' + Array.prototype.join.call(arguments, ' ')).green);
};
global.error = function () {
    info((' X ' + Array.prototype.join.call(arguments, ' ')).red);
};
global.warn = function () {
    info((' >> ' + Array.prototype.join.call(arguments, ' ')).yellow);
};
global.log = function () {
    info(' >> '.gray + Array.prototype.join.call(arguments, ' '));
};