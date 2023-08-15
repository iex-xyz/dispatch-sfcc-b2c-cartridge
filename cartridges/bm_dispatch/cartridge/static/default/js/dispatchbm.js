/* eslint-env es6 */
/* eslint-disable no-console */
/* eslint-disable no-plusplus */

'use strict';

function generateCodeVerifier() {
  return generateRandomString(96);
}

function generateRandomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function generateCodeChallenge(code_verifier) {
  return CryptoJS.SHA256(code_verifier);
}

function base64URL(string) {
  return string.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function resetResultInnerHtml(){

  document.getElementById('td-settings-sync-result').innerHTML = "";
}

var ready = (callback) => {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
};

ready(() => {
  if (document.querySelector('button.dispatch-settings-sync-submit')) {
        // eslint-disable-next-line no-unused-vars
    document.querySelector('button.dispatch-settings-sync-submit').addEventListener('click', (e) => {
      e.preventDefault();

      var dispatchSettingsForm = document.getElementById('dispatch-settings-form');
      var isDispatchSettingsFormValid = dispatchSettingsForm.checkValidity();
      document.getElementById('actionType').value = 'SYNCSETTINGS';
      resetResultInnerHtml();

      if (!isDispatchSettingsFormValid) {
        dispatchSettingsForm.reportValidity();
        return;
      }

      var httpRequest = new XMLHttpRequest();
      var formData = document.getElementById('dispatch-settings-form').serialize();

      httpRequest.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          var response = JSON.parse(this.responseText);
          var result = document.getElementById('td-settings-sync-result');
          //result.style.color = response.error ? '#ff0000' : '';
          //result.innerHTML = response.message;
          let color = response.error ? '#ff0000' : '';
          result.innerHTML = '<strong id="settings-sync-result" style="color: '+color+'">'+response.message+'</strong><br>';
        }
      };

      httpRequest.open('POST', document.getElementById('dispatch-settings-form').action, true);
      httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      httpRequest.send(formData);
    });
  }

  if(document.querySelector('button.dispatch-test-settings-submit')){

      document.querySelector('button.dispatch-test-settings-submit').addEventListener('click', (e) => {
        e.preventDefault();

      var dispatchSettingsForm = document.getElementById('dispatch-settings-form');
      var isDispatchSettingsFormValid = dispatchSettingsForm.checkValidity();   
      resetResultInnerHtml();

      if (!isDispatchSettingsFormValid) {
        dispatchSettingsForm.reportValidity();
        return;
      }

      var verifier = base64URL(generateCodeVerifier());
      var challenge = base64URL(generateCodeChallenge(verifier));

      document.getElementById('verifier').value = verifier;
      document.getElementById('challenge').value = challenge;
      document.getElementById('actionType').value = 'TESTSETTINGS';      

      var httpRequest = new XMLHttpRequest();
      var formData = document.getElementById('dispatch-settings-form').serialize();
      
      httpRequest.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          var response = JSON.parse(this.responseText);
          var result = document.getElementById('td-settings-sync-result');
          
          for(let i=0; i<response.message.length; i++){
            
            let color = response.message[i].error? '#ff0000' : '';
            result.innerHTML += '<strong id="settings-sync-result" style="color: '+color+'">'+response.message[i].message+'</strong><br>';

            //if(response.message[i].error === true){
            //  result.innerHTML += '<strong id="settings-sync-result" style="color: '+color+'">'+response.message[i].message+'</strong><br>';
            //}
            //else {
            //  result.innerHTML += '<strong id="settings-sync-result">'+response.message[i].message+'</strong><br>';                      
            //}                                    
          }

          //result.style.color = response.error ? '#ff0000' : '';
          //result.innerHTML = response.message;
          //result.innerHTML += '<strong id="settings-sync-result">'+response.message+'</strong><br>';
          //result.innerHTML += '<strong id="settings-sync-result">'+response.message+'</strong><br>';
        }
      };

      httpRequest.open('POST', document.getElementById('dispatch-settings-form').action, true);
      httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      httpRequest.send(formData);

    });
  }
});
