'use strict';

var server = require('server');

var URLUtils = require('dw/web/URLUtils');
var dispatchServiceMgr = require('*/cartridge/scripts/services/dispatchServiceMgr');
var dispatchHelper = require('*/cartridge/scripts/helpers/dispatchHelper');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var Resource = require('dw/web/Resource');

/**
 * Dispatch-Settings : This endpoint is called to return settings from Dispatch Custom Site Preference and it's password protected
 * @name Dispatch-Settings
 * @function
 * @memberof Dispatch
 * @param {formfield} - userID
 * @param {formfield} - password
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post('Settings', function (req, res, next) {
    
    var dispatchAPIKey = req.form.dispatchAPIKey;

    if (!dispatchHelper.isDispatchEnabled()) {
        res.json({ errorMessage: 'Dispatch Cartridge Disabled' });
        return next();
    }

    if(!dispatchAPIKey) {

        res.json({ errorMessage: 'Dispatch API Key missing' });
        return next();
    }    

    if (!dispatchHelper.authenticateWithDispatchAPIKey(dispatchAPIKey)) {
        res.json({ errorMessage: 'Dispatch API Key incorrect' });
        return next();
    }
    

    res.json({
        pmClientKey: dispatchHelper.getPMClientKey(),
        preferredPM: dispatchHelper.getPreferredPM(),
        selectedCatalogID: dispatchHelper.getSelectedCatalogID(),
        organizationID: dispatchHelper.getOrganizationID(),
        siteID: dispatchHelper.getSiteID(),
        clientID: dispatchHelper.getClientID(),
        password: dispatchHelper.getPassword(),
        baseURL: dispatchHelper.getBaseURL(),
        dispatchAPIKey: dispatchHelper.getDispatchAPIKey(), 
        dispatchAccountID: dispatchHelper.getDispatchAccountID()
    });

    return next();
});

/**
 * Dispatch-TestConnection : This endpoint is called to set SCAPI credentials set in Dispatch Custom Preference
 * @name Dispatch-TestConnection
 * @function
 * @memberof Dispatch
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.get('TestConnection', function (req, res, next) {
    if (!dispatchHelper.isDispatchEnabled()) {
        res.json({ errorMessage: 'Dispatch Cartridge Disabled' });
        return next();
    }

    var connectivityStatus = dispatchServiceMgr.callCheckSCAPIConnection(
                                                  dispatchHelper.getOrganizationID(),
                                                  dispatchHelper.getClientID(),
                                                  dispatchHelper.getPassword());

    res.json({ status: 'Connectivity: ' + connectivityStatus });

    return next();
});

server.get('Adyen', function (req, res, next) {
    res.render('adyenClientTest');

    next();
});

/**
 * @TODO
 */
/*
server.get('ApplePay', function (req, res, next) {
    res.render('applePayClientTest');

    next();
});
*/

server.get('AdyenCheckoutPaymentMethods', function (req, res, next){

    res.json(dispatchHelper.getAdyenPaymentMethods());
    next();
});

server.get('OrderDetail', consentTracking.consent, server.middleware.https, function (req, res, next) {

    var OrderMgr = require('dw/order/OrderMgr');
    var OrderModel = require('*/cartridge/models/order');
    var Locale = require('dw/util/Locale');
    var order;
    var validRequest = true;
    var target = req.querystring.rurl || 1;
    var actionUrl = URLUtils.url('Account-Login', 'rurl', target);
    var profileForm = server.forms.getForm('profile');
    profileForm.clear();

    if(req.querystring.trackOrderNumber 
        && req.querystring.trackOrderEmail) {
        order = OrderMgr.getOrder(req.querystring.trackOrderNumber);
    } else {
        validRequest = false;
    }

    if(!order) {

        res.render('/error', {
            message: Resource.msg('error.confirmation.error', 'confirmation', null)
        });

        return next();
    } else {
        
        var config = {
            numberOfLineItems: '*'
        };

        var currentLocale = Locale.getLocale(req.locale.id);

        var orderModel = new OrderModel(
            order,
            { config: config, countryCode: currentLocale.country, containerView: 'order' }
        ); 

        // check email address
        if(req.querystring.trackOrderEmail.toLowerCase()
            !== orderModel.orderEmail.toLowerCase()) {
            validRequest = false;
        }

        if(validRequest) {

            var exitLinkText;
            var exitLinkUrl;

            exitLinkText = !req.currentCustomer.profile
                ? Resource.msg('link.continue.shop', 'order', null)
                : Resource.msg('link.orderdetails.myaccount', 'account', null);

            exitLinkUrl = !req.currentCustomer.profile
                ? URLUtils.url('Home-Show')
                : URLUtils.https('Account-Show');


            res.render('account/orderDetails', {
                order: orderModel,
                exitLinkText: exitLinkText,
                exitLinkUrl: exitLinkUrl
            });
        } 
        else {

            res.render('/error', {
                message: Resource.msg('error.confirmation.error', 'confirmation', null)
            });

            return next();
        }             
    }

    next();
});

/**
 * @TODO
 */
/*
server.get('StripeCheckoutPaymentMethods', function (req, res, next) {

    res.json({status: 'TODO'});
    next();
});
*/

module.exports = server.exports();

