const cybersourceRestApi = require('cybersource-rest-client');

module.exports = async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { transientToken } = req.body;

    if (!transientToken) {
      return res.status(400).json({ error: "Transient token is required" });
    }

    const merchantId = process.env.CYBERSOURCE_MERCHANT_ID || 'testrest';
    const runEnvironment = "apitest.cybersource.com";
    
    const configObj = {
      authenticationType: 'http_signature',
      runEnvironment: runEnvironment,
      merchantID: merchantId,
      merchantKeyId: process.env.CYBERSOURCE_KEY_ID || '08c94330-f618-42a3-b09d-e1e43be5efda',
      merchantsecretKey: process.env.CYBERSOURCE_SHARED_SECRET || process.env.CYBERSOURCE_SECRET_KEY || 'yBJxy6LjM2TmcPGu+GaJrHtkke25fPpUX+UY6/L/1tE=',
      keyAlias: merchantId,
      keyPass: merchantId,
      keyFileName: merchantId,
      keysDirectory: 'keys',
      logConfiguration: { enableLog: false }
    };

    const apiClient = new cybersourceRestApi.ApiClient();
    const configObject = new cybersourceRestApi.Configuration();
    apiClient.requestOptions = {
        headers: {
            'v-c-merchant-id': merchantId
        }
    };

    const instance = new cybersourceRestApi.PaymentsApi(configObj, apiClient);
    const clientReferenceInformation = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientReferenceInformation.code = "test_payment_microform_" + Date.now();

    const processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    processingInformation.commerceIndicator = "internet";


    let request = new cybersourceRestApi.CreatePaymentRequest();
    request.clientReferenceInformation = {
       code: "TicketPurchase-" + Math.floor(Math.random() * 10000)
    };
    request.processingInformation = {
       capture: false,
       commerceIndicator: "internet",
       actionList: ["CONSUMER_AUTHENTICATION"],
       paymentSolution: "012" // For Sandbox, simulating a successful auth
    };
    request.paymentInformation = {
       token: {
           id: transientToken
       }
    };
    request.orderInformation = {
       amountDetails: {
           totalAmount: "15.00", // $15
           currency: "USD"
       }
    };
    
    // Billing Information
    const billTo = {};
    billTo.firstName = "John";
    billTo.lastName = "Doe";
    billTo.address1 = "1 Market St";
    billTo.locality = "San Francisco";
    billTo.administrativeArea = "CA";
    billTo.postalCode = "94105";
    billTo.country = "US";
    billTo.email = "test@cybersource.com";
    billTo.phoneNumber = "4158880000";
    orderInformation.billTo = billTo;
    
    const requestObj = new cybersourceRestApi.CreatePaymentRequest();
    requestObj.clientReferenceInformation = clientReferenceInformation;
    requestObj.processingInformation = processingInformation;
    requestObj.paymentInformation = paymentInformation;
    requestObj.tokenInformation = tokenInformation;
    requestObj.orderInformation = orderInformation;

    instance.createPayment(requestObj, function (error, data, response) {
      if (error) {
        console.error("CyberSource API Error:", error);
        res.status(500).json({ error: "Payment failed", details: error });
      } else {
        res.status(200).json(data);
      }
    });

  } catch (error) {
    console.error("Processing error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
}
