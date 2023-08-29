'use strict';

/* adyen_ocapi is an extension to assist Paying with Adyen PSP via OCAPI. It is designed and tested to work with Adyen */

const Status = require('dw/system/Status');
var adyenCheckout = require('*/cartridge/scripts/adyenCheckout');
var constants = require('*/cartridge/adyenConstants/constants');
var Transaction = require('dw/system/Transaction');
var OrderMgr = require('dw/order/OrderMgr');
var Order = require('dw/order/Order');
var dispatchLogHelper = require('~/cartridge/scripts/helpers/dispatchLogHelper');

/* Script Modules */

exports.authorizeCreditCard = function (order, paymentInstrument, cvc) {                    //  eslint-disable-line
    try {
        const amount = paymentInstrument.paymentTransaction.amount;

        if (!amount.available) {
            throw new Error('paymentInstrument.amount not available');
        }

        if (order.totalGrossPrice.value > amount.value) {
            throw new Error('paymentInstrument.amount less than the total order');
        }

        var result;
        Transaction.wrap(function () {
            result = adyenCheckout.createPaymentRequest({
                Order: order,
                PaymentInstrument: paymentInstrument
            });
        });


        if (result.error) {
            order.custom.Dispatch_paymentErrorMessage = result.args.adyenErrorMessage;
            return new Status(Status.ERROR, result.args.adyenErrorMessage);        
        }
        else if(result.resultCode === constants.RESULTCODES.REFUSED) {
         
            order.custom.Dispatch_paymentErrorMessage = result.adyenErrorMessage;
            return new Status(Status.ERROR, result.adyenErrorMessage);        
        }
        else {
            
            Transaction.begin();
            
            OrderMgr.placeOrder(order);
            order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
            order.setExportStatus(Order.EXPORT_STATUS_READY);  
            order.custom.Dispatch_paymentErrorMessage = null;             

            Transaction.commit();
        }        
    } catch (e) {
        var m = e.message;
        if (e.callResult) {
            var o = JSON.parse(e.callResult.errorMessage);
            m = o.error.message;
        }
        
        dispatchLogHelper.log('Error: {0}', e.message);        

        order.custom.Dispatch_paymentErrorMessage = m;
        return new Status(Status.ERROR, m);
    }

    return new Status(Status.OK);
};
