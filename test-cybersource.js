const cybersourceRestApi = require('cybersource-rest-client');

async function test() {
    console.log("Starting test...");
    const merchantId = 'test_bac_hn_astronomical';
    const runEnvironment = "apitest.cybersource.com";
    
    const configObj = {
      authenticationType: 'http_signature',
      runEnvironment: runEnvironment,
      merchantID: merchantId,
      merchantKeyId: 'e67f78f4-276b-4aa7-b6a6-addc45707e58',
      merchantsecretKey: 'r6H5G+0jTQMSpnkhCBVoKFuCrL1prOM7sCHB29uhpHw=',
      keyAlias: merchantId,
      keyPass: merchantId,
      keyFileName: merchantId,
      keysDirectory: 'keys',
      logConfiguration: { enableLog: false }
    };

    try {
        const apiClient = new cybersourceRestApi.ApiClient();
        const instance = new cybersourceRestApi.MicroformIntegrationApi(configObj, apiClient);
        
        const requestObj = new cybersourceRestApi.GenerateCaptureContextRequest();
        requestObj.clientVersion = "v2.0";
        requestObj.targetOrigins = ["https://casablancaweb.vercel.app"];
        requestObj.allowedCardNetworks = ["VISA", "MASTERCARD", "AMEX"];

        instance.generateCaptureContext(requestObj, function (error, data, response) {
            if (error) {
                console.error("SDK Error:");
                if (response && response.text) {
                    console.error(response.text);
                } else {
                    console.error(error);
                }
            } else if (data) {
                console.log("Success! JWT generated.");
                console.log(data.keyId ? "Has KeyId" : "No KeyId");
            }
        });
    } catch (e) {
        console.error("Catch Exception:", e);
    }
}
test();
