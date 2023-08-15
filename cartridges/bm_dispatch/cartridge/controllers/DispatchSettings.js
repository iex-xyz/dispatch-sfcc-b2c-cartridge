'use strict';

var dispatchBMHelper = require('~/cartridge/scripts/helpers/dispatchBmHelper');
var dispatchHelper = require('*/cartridge/scripts/helpers/dispatchHelper');
const responseHelper = require('~/cartridge/scripts/helpers/responseHelper');


/**
 * DispatchSettings-Start : This endpoint is called by BM to render UI
 * @name DispatchSettings-Start
 * @param {renders} - html
 */
function start() {

    responseHelper.render('dispatchSettings');
}

/**
 * DispatchSettings-HandleSettings : This endpoint is called to save BM Settings
 * @name DispatchSettings-HandleSettings
 * @param {formfield} - dispatch_catalog
 * @param {formfield} - dispatch_preferredpaymentmethod
 * @param {formfield} - dispatch_client_key
 * @param {renders} - json
 */

function handleSettings() {

    if (!dispatchHelper.isDispatchEnabled()) {
        responseHelper.renderJson({
            statusCode: 500,
            error: true,
            message: 'Dispatch Cartridge Disabled'
        });

        return next();
    }

    var actionType  = request.httpParameterMap.actionType;

    if(actionType.value === 'SYNCSETTINGS') {

        var status = dispatchHelper.saveDispatchSettings({
            dispatchAPIKey: request.httpParameterMap.dispatch_api_key,
            dispatchAccountID: request.httpParameterMap.dispatch_account_id,            
            siteID: request.httpParameterMap.dispatch_siteID,
            settingsURL: request.httpParameterMap.dispatch_settingsURL,
            catalogID: request.httpParameterMap.dispatch_catalog,
            preferredPM: request.httpParameterMap.dispatch_preferredpaymentmethod,
            pmPublishableKey: request.httpParameterMap.dispatch_client_key
        });
        
        var syncStatus = dispatchHelper.syncSettingsWithDispatch(
            request.httpParameterMap.dispatch_api_key, 
            request.httpParameterMap.dispatch_account_id, 
            request.httpParameterMap.dispatch_settingsURL
            );        
    
        if (status && syncStatus.statusCode === 200) {        
    
            responseHelper.renderJson({
                statusCode: 200,
                message: 'Settings Saved'
            });
        } else {
            responseHelper.renderJson({
                statusCode: syncStatus.statusCode,
                error: true,
                message: syncStatus.message
            });
        }

    } else {

        // Call Dispatch Test-Connection 

        var testResult = [];
        var testStatus = dispatchHelper.testDispatchCredentials(request.httpParameterMap.dispatch_api_key, 
                                                                request.httpParameterMap.dispatch_account_id, 
                                                                request.httpParameterMap.dispatch_settingsURL);        
                                                                
        if(testStatus.success === true) {

            testResult.push({
                message: 'Dispatch Settings Test: Success'
            });
        }
        else {

            testResult.push({
                message: 'Dispatch Settings Test: Fail ('+testStatus.msg[0] +')',
                error: true
            });
        }

        // Test Shopper API  - good to go.

        let verifier = request.httpParameterMap.verifier;
        let challenge = request.httpParameterMap.challenge;

        let loginResponse = dispatchHelper.testShopperLogin(verifier, 
                                        challenge, 
                                        request.httpParameterMap.dispatch_settingsURL.value);

        if(loginResponse.error) {

            testResult.push({
                error: true,
                message: 'Dispatch SLAS Shopper Login Test: Fail ( '+loginResponse.message+')'
            });
        }
        else {
         
            testResult.push({            
                message: 'Dispatch SLAS Shopper Login Test: Success'
            });
        }
        

        responseHelper.renderJson({
            statusCode: 200,
            message: testResult
        });
    
    }
}

start.public = true;
handleSettings.public = true;

exports.Start = start;
exports.HandleSettings = handleSettings;
