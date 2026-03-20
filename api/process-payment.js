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
    const instance = new cybersourceRestApi.PaymentsApi(configObj, apiClient);

    let request = new cybersourceRestApi.CreatePaymentRequest();
    
    request.clientReferenceInformation = {
       code: "TicketPurchase-" + Math.floor(Math.random() * 100000)
    };
    
    request.processingInformation = {
       capture: false, // Auth only
       commerceIndicator: "internet",
       actionList: ["CONSUMER_AUTHENTICATION"],
       paymentSolution: "012"
    };

    request.tokenInformation = {
       transientTokenJwt: transientToken
    };

    request.orderInformation = {
       amountDetails: {
           totalAmount: "15.00",
           currency: "USD"
       },
       billTo: {
           firstName: "John",
           lastName: "Doe",
           address1: "1 Market St",
           locality: "San Francisco",
           administrativeArea: "CA",
           postalCode: "94105",
           country: "US",
           email: "test@cybersource.com",
           phoneNumber: "4158880000"
       }
    };

    instance.createPayment(request, function (error, data, response) {
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
