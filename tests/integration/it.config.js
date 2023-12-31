'use strict';

var getConfig = require('@tridnguyen/config');

var opts = Object.assign({}, getConfig({
    baseUrl: 'https://' + global.baseUrl + '/on/demandware.store/Sites-RefArch-Site/default',
    suite: '*',
    reporter: 'spec',
    timeout: 60000,
    locale: 'x_default',
    clientId: 'xxxxx',
    settingsUserID: 'admin',
    settingsPassword: 'default12'
}, './config.json'));

module.exports = opts;
