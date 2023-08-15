'use strict';

var dispatchServiceMgr = require('*/cartridge/scripts/services/dispatchServiceMgr');
var dispatchHelper = require('*/cartridge/scripts/helpers/dispatchHelper');

exports.getOrganizationID = function () {
    var organizationID = dispatchHelper.getOrganizationID();

    return organizationID === null ? '' : organizationID;
};

exports.getSiteID = function () {
    var siteID = dispatchHelper.getSiteID();

    return siteID === null ? '' : siteID;
};

exports.getDispatchAPIKey = function () {
    var dispatchAPIKey = dispatchHelper.getDispatchAPIKey();

    return dispatchAPIKey === null ? '' : dispatchAPIKey;
};

exports.getDispatchAccountID = function () {

    var dispatchAccountID = dispatchHelper.getDispatchAccountID();

    return dispatchAccountID === null ? '' : dispatchAccountID;

};

exports.getSettingsUserID = function () {
    var settingsUserID = dispatchHelper.getSettingsUserID();

    return settingsUserID === null ? '' : settingsUserID;
};

exports.getSettingsPassword = function () {
    var settingsPassword = dispatchHelper.getSettingsPassword();

    return settingsPassword === null ? '' : settingsPassword;
};

exports.getPMClientKey = function () {
    var pmClientKey = dispatchHelper.getPMClientKey();

    return pmClientKey === null ? '' : pmClientKey;
};

exports.getSettingsURL = function () {

    var settingsURL = dispatchHelper.getSettingsURL();

    return settingsURL === null ? '' : settingsURL;
}


exports.getActivePaymentMethods = function () {
    var preferredPM = dispatchHelper.getPreferredPM();

    var result = [
        {
            id: 'None',
            name: 'None',
            isactive: preferredPM === 'None'
        },
        {
            id: 'Stripe',
            name: 'Stripe',
            isactive: preferredPM === 'Stripe'
        },
        {
            id: 'Adyen',
            name: 'Adyen',
            isactive: preferredPM === 'Adyen'
        }
    ];

    return result;
};

exports.getCatalogs = function () {
    var selectedCatalogID = dispatchHelper.getSelectedCatalogID();
    var organizationID = dispatchHelper.getOrganizationID();
    var clientID = dispatchHelper.getClientID();
    var password = dispatchHelper.getPassword();

    var result = [];
    var jsonResponse;
    var i;

    jsonResponse = dispatchServiceMgr.callGetCatalogsService(organizationID, clientID, password);


    for (i = 0; i < jsonResponse.data.length; i++) {
        result.push({
            id: jsonResponse.data[i].id,
            name: jsonResponse.data[i].name.default,
            isactive: selectedCatalogID === jsonResponse.data[i].id
        });
    }

    return result;
};
