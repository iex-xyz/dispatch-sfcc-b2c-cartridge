var ISML = require('dw/template/ISML');

var responseHelper = {};

/**
 * Render Template
 * @param {string} templateName - Template Name
 * @param {Object} data - pdict data
 */
function render(templateName, data) {
  if (typeof data !== 'object') {
    data = {}; // eslint-disable-line no-param-reassign
  }

  try {
    ISML.renderTemplate(templateName, data);
  } catch (e) {
    throw new Error([e.javaMessage, e.stack].join('\n\r'), e.fileName, e.lineNumber);
  }
}

/**
 * Render JSON from Objects
 * @param {Object} responseResult - Response Result
 * @param {Object} responseData - Response Data
 */
function renderJson(responseResult, responseData) {
  var data = {};

  if (!empty(responseData)) {
    data.transactionid = responseData.transactionid || null;
    data.l_longmessage0 = responseData.l_longmessage0 || null;
    data.ack = responseData.ack || null;
  }

  if (!empty(responseResult)) {
    data = responseResult;
  }

  if (!empty(responseData) && responseData.details) {
    data.details = responseData.details;
  }

    // eslint-disable-next-line no-undef
  response.setContentType('application/json');
    // eslint-disable-next-line no-undef
  response.writer.print(JSON.stringify(data, null, 2));
}

responseHelper.render = render;
responseHelper.renderJson = renderJson;

module.exports = responseHelper;
