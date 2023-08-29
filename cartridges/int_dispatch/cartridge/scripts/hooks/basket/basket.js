'use strict';

const LineItemCtnr = require('dw/order/LineItemCtnr');
const Status = require('dw/system/Status');

/* API Includes */

exports.afterPATCH = function (basket, basketInput) {    
    try {        
        basket.setChannelType(LineItemCtnr.CHANNEL_TYPE_MARKETPLACE);
    } catch (e) {
        return new Status(Status.ERROR, 'ERROR', e.toString() + ' in ' + e.fileName + ':' + e.lineNumber);
    }

    return new Status(Status.OK);
};

exports.afterPOST = function (basket) {
    try {        
        basket.setChannelType(LineItemCtnr.CHANNEL_TYPE_MARKETPLACE);
    } catch (e) {
        return new Status(Status.ERROR, 'ERROR', e.toString() + ' in ' + e.fileName + ':' + e.lineNumber);
    }

    return new Status(Status.OK);
};
