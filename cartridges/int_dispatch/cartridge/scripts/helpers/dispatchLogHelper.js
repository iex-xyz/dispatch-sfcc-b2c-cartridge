'use strict';

var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');

/**
 * log : For Logging error message if Error Logging is enabled in SitePreference
 * @param {string} errorMessage  Error Message that should go to log
 */
function log(errorMessage) {

    try {
        var Log = Logger.getLogger("dispatch", 'root');

        Log.error(errorMessage);
    } catch (e) {
        Logger.error('Exception while getting custom logger for Dispatch Cartridge {0}', e.message);
    }
}

module.exports = {
    log: log
};
