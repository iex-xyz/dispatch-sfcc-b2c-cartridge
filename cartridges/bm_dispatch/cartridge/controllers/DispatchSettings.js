'use strict';

const responseHelper = require('~/cartridge/scripts/helpers/responseHelper');


/**
 * DispatchSettings-Start : This endpoint is called by BM to render UI
 * @name DispatchSettings-Start
 * @param {renders} - html
 */
function start() {
    responseHelper.render('dispatchSettings');
}

start.public = true;
exports.Start = start;