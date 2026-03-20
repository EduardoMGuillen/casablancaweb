const cybersourceRestApi = require('cybersource-rest-client');

export default function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const merchantId = process.env.CYBERSOURCE_MERCHANT_ID || 'testrest'; // Replace with valid test MID or use env var
    const runEnvironment = "apitest.cybersource.com"; // CyberSource Sandbox environment
    
    // Setup config data
    const configObj = {
      authenticationType: 'http_signature',
      runEnvironment: runEnvironment,
      merchantID: merchantId,
      merchantKeyId: process.env.CYBERSOURCE_KEY_ID || '08c94330-f618-42a3-b09d-e1e43be5efda',
      merchantsecretKey: process.env.CYBERSOURCE_SECRET_KEY || 'yBJxy6LjM2TmcPGu+GaJrHtkke25fPpUX+UY6/L/1tE=',
      keyAlias: merchantId,
      keyPass: merchantId,
      keyFileName: merchantId,
      keysDirectory: 'keys'
    };

    const apiClient = new cybersourceRestApi.ApiClient();
    const configObject = new cybersourceRestApi.Configuration();
    apiClient.requestOptions = {
      headers: {
        'v-c-merchant-id': merchantId
      }
    };

    const instance = new cybersourceRestApi.MicroformIntegrationApi(configObj, apiClient);
    
    // We send a request to generate the capture context
    const requestObj = new cybersourceRestApi.GenerateCaptureContextRequest();
    requestObj.clientVersion = "v2.0";
    requestObj.targetOrigins = ["https://astronomical-sps.vercel.app", "http://localhost:3000", "http://localhost:5000"];
    requestObj.allowedCardNetworks = ["VISA", "MASTERCARD", "AMEX"];

    instance.generateCaptureContext(requestObj, function (error, data, response) {
      if (error) {
        console.error("Error generating capture context", error);
        res.status(500).json({ error: "Failed to generate capture context", details: error });
      } else {
        res.status(200).json(data); // data is the JWT string or an object containing it
      }
    });
  } catch (error) {
    console.error("Catch error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
}
