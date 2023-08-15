'use strict';

async function AdyenStart() {
    const checkout = await AdyenCheckout({
        locale: 'en_US',
        environment: 'test',
        clientKey: 'test_TDIHA7PQ5FC5TDCSMFUZOOW2TE6WPDGG',
        onChange: (state, component) => {
            // state.data;
            // state.isValid;
            console.log('onChange event called');
        }
    });

    const customCard = checkout.create('securedfields', {
        // Optional configuration
        type: 'card',
        brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
        styles: {
            error: {
                color: 'red'
            },
            validated: {
                color: 'green'
            },
            placeholder: {
                color: '#d8d8d8'
            }
        },
        // Only for Web Components before 4.0.0.
        // For Web Components 4.0.0 and above, configure aria-label attributes in translation files
        ariaLabels: {
            lang: 'en-GB',
            encryptedCardNumber: {
                label: 'Credit or debit card number field',
                iframeTitle: 'Iframe for secured card number',
                error: 'Message that gets read out when the field is in the error state'
            }
        },
        // Events
        onChange: function () {
            console.log('onChange2 event called');
        },
        onValid: function () {
            console.log('onValid event called');
        },
        onLoad: function () {},
        onConfigSuccess: function () {},
        onFieldValid: function () {},
        onBrand: function () {},
        onError: function () {},
        onFocus: function () {},
        onBinValue: function (bin) {},
        onChange: (state, component) => {
            // state.data;
            // state.isValid;
            console.log('onChange INNER event called');

            if (state.isValid) {
                console.log('state valid');
                console.log(state.data);
            }
        }
    }).mount('#customCard-container');
}

var ready = (callback) => {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
};

ready(() => {
    AdyenStart();
});
