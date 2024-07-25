"use strict";

const Status = require("dw/system/Status");
var adyenCheckout = require("*/cartridge/scripts/adyenCheckout");
var PaymentMgr = require("dw/order/PaymentMgr");
var AdyenAuthorize = require("*/cartridge/scripts/hooks/payment/processor/middlewares/authorize");

/**
 * This SCAPI hook fires when a PaymentInstrument is added to an Order
 * This code imports core business logic directly from /cartridge/scripts/hooks/payment/processor/middlewares/authorize
 * All Dispatch orders contain a shopperReference value prefixed with dispatch
 */
exports.authorizeCreditCard = function (order, paymentInstrument, cvc) {
    var order = AdyenAuthorize(
      order,
      paymentInstrument,
      PaymentMgr.getPaymentMethod(
        paymentInstrument.getPaymentMethod()
      ).getPaymentProcessor()
    );
    if (order.error) {
     // this helps Dispatch know when payments are rejected by Adyen so the UI/UX can reflect payment status
      throw new Error("Error - payment through Dispatch rejected by PSP.");
    }
    return new Status(Status.OK);
};
