'use strict';


var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');

var dispatchServiceMgr = require('*/cartridge/scripts/services/dispatchServiceMgr');
var dispatchHelper = require('*/cartridge/scripts/helpers/dispatchHelper');
var responseUtil = require('*/cartridge/scripts/util/Response');
var OrderMgr = require('dw/order/OrderMgr');

/**
 * settings : fetching parameters set by the merchant
 * @name Dispatch-Settings
 * @param {string} - userID
 * @param {string} - password
 * @param {renders} - json
 */
function settings() {
    
    var dispatchAPIKey = request.httpParameterMap.dispatchAPIKey;

    if (!dispatchHelper.isDispatchEnabled()) {
        responseUtil.renderJSON({ errorMessage: 'Dispatch Cartridge Disabled' });
        return;
    }

    if(!dispatchAPIKey) {
        responseUtil.renderJSON({ errorMessage: 'Dispatch API Key missing' });
        return;
    }    

    if (!dispatchHelper.authenticateWithDispatchAPIKey(dispatchAPIKey.value)) {
        responseUtil.renderJSON({ errorMessage: 'Dispatch API Key incorrect' });
        return;
    }
    
    responseUtil.renderJSON({
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
}

/**
 * testConnection : This endpoint is called to test SCAPI Admin credentials set in Dispatch settings
 * @name Dispatch-TestConnection
 * @param {renders} - json
 */
function testConnection() {
    if (!dispatchHelper.isDispatchEnabled()) {
        responseUtil.renderJSON({ errorMessage: 'Dispatch Cartridge Disabled' });
        return;
    }

    var connectivityStatus = dispatchServiceMgr.callCheckSCAPIConnection(
                                                  dispatchHelper.getOrganizationID(),
                                                  dispatchHelper.getClientID(),
                                                  dispatchHelper.getPassword());

    responseUtil.renderJSON({ status: 'Connectivity: ' + connectivityStatus });
}



/**
 * adyenCheckoutPaymentMethods : returns supported adyen checkout methods
 * @name Dispatch-AdyenCheckoutPaymentMethods
 * @param {renders} - json
 */
function adyenCheckoutPaymentMethods() {

    responseUtil.renderJSON(dispatchHelper.getAdyenPaymentMethods());
}

/**
 * orderDetails : track order by order number. 
 * @name Dispatch-OrderDetails
 * @returns {render} - template account/orderhistory/orderdetails or error/generalerror on error
 */
function orderDetails() {

    let trackOrderNumber = request.httpParameterMap.trackOrderNumber;
    let trackOrderEmail = request.httpParameterMap.trackOrderEmail;
    let validRequest = true;
    var orders;

    if(trackOrderNumber && trackOrderEmail) {
        orders = OrderMgr.searchOrders('orderNo={0} AND status!={1}', 'creationDate desc', trackOrderNumber.value,
                dw.order.Order.ORDER_STATUS_REPLACED);
    }
    else {
        validRequest = false;
    }

    if (empty(orders)) {
        // Display Error

        app.getView({                    
            ErrorText: 'Order Not found',            
        }).render('error/generalerror');
        
        return;
    }

    var foundOrder = orders.next();

    // check email address 
    if(foundOrder.customerEmail.toUpperCase() !== trackOrderEmail.value.toUpperCase()) {

        app.getView({                    
            ErrorText: 'Order Not found',            
        }).render('error/generalerror');
    }
    else {

        app.getView({
            Order: foundOrder
        }).render('account/orderhistory/orderdetails');
    }    
}

/**
 * Web exposed methods
 */
/** Track and render order detail
 * @see module:controllers/Dispatch~orderDetails */
exports.OrderDetail = guard.ensure(['get', 'https'], orderDetails);
/** Returns Dispatch Settings in json format
 *  @see module:controllers/Dispatch~settings */
exports.Settings = guard.ensure(['post', 'https'], settings);
/** Test SCAPI Admin credentials
 *  @see module:controllers/Dispatch~testConnection */
exports.TestConnection = guard.ensure(['get', 'https'], testConnection);
/** Returns Adyen checkout methods
 * @see module:controllers/Dispatch~adyenCheckoutPaymentMethods */
exports.AdyenCheckoutPaymentMethods = guard.ensure(['get', 'https'], adyenCheckoutPaymentMethods);
