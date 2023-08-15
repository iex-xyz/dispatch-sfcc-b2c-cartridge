var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Test Dispatch cartridge endpoints', function () {
    this.timeout(30000);

    var cookieJar = request.jar();
    var bodyAsJson;

    it('Dispatch-Settings', function () {
        var myRequest = {
            url: config.baseUrl + '/Dispatch-Settings',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            form: {
                userID: config.settingsUserID,
                password: config.settingsPassword
            }
        };

        return request(myRequest)
        .then(function (response) {
            assert.equal(response.statusCode, 200);

            bodyAsJson = JSON.parse(response.body);
            assert.equal(('errorMessage' in bodyAsJson), false);
        });
    });

    it('Dispatch-TestConnection', function () {
        var myRequest = {
            url: config.baseUrl + '/Dispatch-TestConnection',
            method: 'GET',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        return request(myRequest)
        .then(function (response) {
            assert.equal(response.statusCode, 200);
            bodyAsJson = JSON.parse(response.body);
            assert.equal(bodyAsJson.status, 'Connectivity: true');
        });
    });
});
