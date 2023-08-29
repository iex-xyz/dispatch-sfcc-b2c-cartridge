'use strict';

exports.getDispatchAPIKey = function () {
    return require('dw/system/Site').current.getCustomPreferenceValue('DispatchAPIKey');
};

exports.getDispatchAccountID = function () {
    return require('dw/system/Site').current.getCustomPreferenceValue('DispatchAccountID');
};

exports.isDispatchEnabled = function () {
    return require('dw/system/Site').current.getCustomPreferenceValue('DispatchEnabled');
};

exports.getPMClientKey = function () {
    return require('dw/system/Site').current.getCustomPreferenceValue('DispatchPMClientKey');
};

exports.getPreferredPM = function () {
    return require('dw/system/Site').current.getCustomPreferenceValue('DispatchPreferredPM');
};

exports.getSelectedCatalogID = function () {
    return require('dw/system/Site').current.getCustomPreferenceValue('DispatchCatalogID');
};

exports.getOrganizationID = function () {

    return require('dw/svc/LocalServiceRegistry').createService('dispatch.http.scapi', { }).getConfiguration().getCredential().user;    
};

exports.getSiteID = function () {
    return require('dw/system/Site').current.getCustomPreferenceValue('DispatchSiteID');
};

exports.getClientID = function () {

    return require('dw/svc/LocalServiceRegistry').createService('dispatch.http.slasauth', { }).getConfiguration().getCredential().user;
};

exports.getPassword = function () {
    return require('dw/svc/LocalServiceRegistry').createService('dispatch.http.slasauth', { }).getConfiguration().getCredential().password;
};

exports.getBaseURL = function () {
    return require('dw/svc/LocalServiceRegistry').createService('dispatch.http.scapi', { }).getURL();
};

exports.getSettingsURL = function() {
    return require('dw/system/Site').current.getCustomPreferenceValue('DispatchSettingsURL');    
}

exports.saveDispatchSettings = function (args) {
    var Transaction = require('dw/system/Transaction');
    var Site = require('dw/system/Site');
    var dispatchLogHelper = require('~/cartridge/scripts/helpers/dispatchLogHelper');

    try {
        Transaction.wrap(function () {
            
            Site.getCurrent().setCustomPreferenceValue('DispatchAPIKey', args.dispatchAPIKey);
            Site.getCurrent().setCustomPreferenceValue('DispatchAccountID', args.dispatchAccountID);
            Site.getCurrent().setCustomPreferenceValue('DispatchSiteID', args.siteID);        
            Site.getCurrent().setCustomPreferenceValue('DispatchSettingsURL', args.settingsURL);                        
            Site.getCurrent().setCustomPreferenceValue('DispatchCatalogID', args.catalogID);
            Site.getCurrent().setCustomPreferenceValue('DispatchPreferredPM', args.preferredPM);
            Site.getCurrent().setCustomPreferenceValue('DispatchPMClientKey', args.pmPublishableKey);                   
            
        });

        return true;
    } catch (e) {

        dispatchLogHelper.log('Dispatch: '+e.toString());        
        return false;
    }
};

exports.authenticateWithDispatchAPIKey = function (dispatchAPIKey) {

    var Site = require('dw/system/Site');
    var setDispatchAPIKey = Site.getCurrent().getCustomPreferenceValue('DispatchAPIKey');
    var returnVal = false;

    if(setDispatchAPIKey) {
        if(setDispatchAPIKey === dispatchAPIKey){
            returnVal = true;
        }
    }

    return returnVal;
};

exports.getAdyenPaymentMethods = function() {
    var AdyenHelper = require('*/cartridge/scripts/util/adyenHelper');
    var AdyenConfigs = require('*/cartridge/scripts/util/adyenConfigs');
    var constants = require('*/cartridge/adyenConstants/constants');
    var dispatchLogHelper = require('~/cartridge/scripts/helpers/dispatchLogHelper');

    try{

        var paymentMethodsRequest = {
            merchantAccount: AdyenConfigs.getAdyenMerchantAccount()
          };

        if (request.getLocale()) {
            paymentMethodsRequest.shopperLocale = request.getLocale();
        }        

        var platformVersion = AdyenHelper.getApplicationInfo().externalPlatform.version;
        var service = platformVersion === 'SFRA' ? constants.SERVICE.CHECKOUTPAYMENTMETHODS : constants.SERVICE.CHECKOUTPAYMENTMETHODS.concat('SG');

        return AdyenHelper.executeCall(service, paymentMethodsRequest);
    } catch (e) {
        dispatchLogHelper.log('Dispatch: '+e.toString());
        //AdyenLogs.fatal_log("Adyen: ".concat(e.toString(), " in ").concat(e.fileName, ":").concat(e.lineNumber));        
        return [];
      }
};

exports.syncSettingsWithDispatch = function(dispatchAPIKey, dispatchAccountID, settingsUR ) {

    var dispatchServiceMgr = require('*/cartridge/scripts/services/dispatchServiceMgr');    
    return dispatchServiceMgr.callDispatchSyncService(dispatchAPIKey, dispatchAccountID, settingsUR); 
}

exports.testDispatchCredentials = function(dispatchAPIKey, dispatchAccountID, settingsUR ) {

    var dispatchServiceMgr = require('*/cartridge/scripts/services/dispatchServiceMgr');    
    return dispatchServiceMgr.callDispatchTestService(dispatchAPIKey, dispatchAccountID, settingsUR); 
}

exports.testShopperLogin = function(verifier, challenge, settingsURL) {

    var dispatchServiceMgr = require('*/cartridge/scripts/services/dispatchServiceMgr');    

    let redirectURI = settingsURL.substring(0, settingsURL.indexOf('Dispatch-Settings')).concat('SLASCallback-RetrieveCode');
    let requestParams = 'redirect_uri='+redirectURI+
                        '&response_type=code'+
                        '&client_id='+this.getClientID()+
                        '&hint=guest'+
                        '&code_challenge='+challenge;

    return dispatchServiceMgr.callSCAPIPublicGuestAuth(requestParams, this.getOrganizationID());    
}

