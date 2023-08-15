'use strict';

var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var slasAuthService = 'dispatch.http.slasauth';
var scapiService = 'dispatch.http.scapi';
var dispatchService = 'dispatch.http.service';
var dispatchTestService = 'dispatch.http.testservice';
var dispatchLogHelper = require('~/cartridge/scripts/helpers/dispatchLogHelper');
var dispatchHelper = require('~/cartridge/scripts/helpers/dispatchHelper');


function callService(serviceName, method, requestParams){

    var serviceResult;
    var jsonResponse;

    var service = LocalServiceRegistry.createService(serviceName, {

        createRequest: function (svc, params) {            
            svc.setRequestMethod(method);
            svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');

            return params;
        },
        filterLogMessage: function (msg) {
            return msg.replace('headers', '');
        },
        parseResponse: function (svc, httpClient) {
            return httpClient.text;
        }

    });

    try {
        serviceResult = service.call(requestParams);        

        if (serviceResult.status === 'OK') {
            jsonResponse = JSON.parse(serviceResult.object);
        }
        else {
            jsonResponse = JSON.parse(serviceResult.errorMessage);
        }
        
    } catch (e) {

        dispatchLogHelper.log('Dispatch: '+e.toString());

        jsonResponse = {
            statusCode: 403,
            message: e.message
            };
    }

    return jsonResponse;
};

/**
 * callGetCatalogService : return all Catalogs
 * @param {string} accessToken of authenticated SCAPI Admin User
 * @param {string} organizationID associated with the instance
 * @returns {string} Catalogs array
 */
function callGetCatalogService(accessToken, organizationID) {
    var serviceResult;
    var service = LocalServiceRegistry.createService(scapiService, {

        createRequest: function (svc, params) {
            svc.setURL(svc.getURL() + '/product/catalogs/v1/organizations/' +
                  organizationID + '/catalogs');
            svc.setRequestMethod('GET');
            svc.addHeader('Authorization', 'Bearer ' + accessToken);

            return params;
        },
        filterLogMessage: function (msg) {
            return msg.replace('headers', '');
        },
        parseResponse: function (svc, httpClient) {
            return httpClient.text;
        }
    });

    try {
        serviceResult = service.call();

        if (serviceResult.status === 'OK') {
            return JSON.parse(serviceResult.object);
        }
    } catch (e) {
        dispatchLogHelper.log('Dispatch: '+e.toString());
        return '';
    }

    return '';
}

/**
 * callAuthorizeSLASAdminService : authenticates and return access token
 * @param {string} organizationID associated with the instance
 * @param {string} clientID SCAPI admin userID
 * @param {string} password SCAPI admin password
 * @returns {string} access token
 */
function callAuthorizeSLASAdminService(organizationID, clientID, password) {
    var serviceResult;
    var jsonResponse;
    var realmAndInstance = organizationID.substring(organizationID.length - 8);

    var service = LocalServiceRegistry.createService(slasAuthService, {
        createRequest: function (svc, params) {
            svc.setURL(svc.getURL());
            svc.setRequestMethod('POST');
            svc.addHeader('Authorization', 'Basic ' +
                    Encoding.toBase64(new Bytes(svc.getConfiguration().getCredential().user + ':' + svc.getConfiguration().getCredential().password)));
            svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');

            return params;
        },
        filterLogMessage: function (msg) {
            return msg.replace('headers', '');
        },
        parseResponse: function (svc, httpClient) {
            return httpClient.text;
        }
    });

    try {
        serviceResult = service.call('grant_type=client_credentials&scope=SALESFORCE_COMMERCE_API:' +
        realmAndInstance + ' sfcc.catalogs sfcc.shopper-products sfcc.products sfcc.products.rw');

        if (serviceResult.status === 'OK') {
            jsonResponse = JSON.parse(serviceResult.object);
        
            return jsonResponse.access_token;
        }
    } catch (e) {

        dispatchLogHelper.log('Dispatch: '+e.toString());
        return '';
    }

    return '';
}

exports.callGetCatalogsService = function (organizationID, clientID, password) {
    var accessToken = callAuthorizeSLASAdminService(organizationID, null, null);

    return callGetCatalogService(accessToken, organizationID);
};

exports.callCheckSCAPIConnection = function (organizationID, clientID, password) {
    return callAuthorizeSLASAdminService(organizationID, null, null) !== '';
};

exports.callDispatchTestService = function (dispatchAPIKey, dispatchAccountID, url) {

    var requestBody = 'accessToken='+dispatchAPIKey+'&dispatchAccountID='+dispatchAccountID+"&settingsUrl="+url;
    var serviceResult = callService(dispatchTestService, 'POST', requestBody);

    return serviceResult;
}

exports.callDispatchSyncService = function (dispatchAPIKey, dispatchAccountID, url) {

    var requestBody = 'accessToken='+dispatchAPIKey+'&dispatchAccountID='+dispatchAccountID+"&settingsUrl="+url;
    var serviceResult = callService(dispatchService, 'POST', requestBody);

    return serviceResult;
};

exports.callSCAPIPublicGuestAuth = function(requestParams, organizationID) {

    var serviceResult;
    var jsonResponse;

    var service = LocalServiceRegistry.createService(scapiService, {

        createRequest: function (svc, params) {
            
            let urltest = svc.getURL() + '/shopper/auth/v1/organizations/' +
                         organizationID + '/oauth2/authorize?'.concat(requestParams);

            

            svc.setURL(urltest);
            svc.setRequestMethod('GET');
            svc.setAuthentication('NONE');
            svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');
        },
        filterLogMessage: function (msg) {
            return msg.replace('headers', '');            
        },
        parseResponse: function (svc, httpClient) {
            return httpClient.text;
        }

    });

    try {
        serviceResult = service.call();        

        if (serviceResult.status === 'OK') {
            jsonResponse = JSON.parse(serviceResult.object);
        }
        else {
            jsonResponse = JSON.parse(serviceResult.errorMessage);
        }
        
    } catch (e) {

        dispatchLogHelper.log('Dispatch: '+e.toString());

        jsonResponse = {
            statusCode: 403,
            message: e.message
            };
    }

    return jsonResponse;
};

