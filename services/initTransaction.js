const fetch                  = require("node-fetch");

const merchantConfig         = require("../config");

//const SigntureGenerator     = require("../authentification/SignatureParameterGenerator");
const DigestGenerator         = require("../authentification/DigestGenerator");
const SigntureGenerator       = require("../authentification/HttpSignatureToken");
const UniqueTokenGenerator    = require("../utils/generateUniqueToken");
const Constants               = require("../utils/constants")

require('dotenv').config();

const authorizeTransaction =  (dataObj = {}) =>{

    /**
     * host	apitest.cybersource.com
     * signature	keyid="08c94330-f618-42a3-b09d-e1e43be5efda", algorithm="HmacSHA256", headers="host v-c-date request-target digest v-c-merchant-id", signature="6YKX1M1OgDqXV9hAIivyLftViJhaV/8YQYu4os5Q0S4="
     * digest	SHA-256=1wk5Hls1qcbZtjYDldGyl3B2i92v4rOqXyx6twRboEs=
     * v-c-merchant-id	testrest
     * v-c-date	Fri, 02 Aug 2024 12:12:40 GMT
     * Content-Type	application/json */

	return new Promise( (resolve, reject) =>{
        const configObj = merchantConfig();
        const requestTarget = "/pts/v2/payments";

        const data = {
          "processingInformation":{
            "authorizationOptions":{
              "partialAuthIndicator": true
            }
          },
          "clientReferenceInformation": {
            "code": `ADP_CB-${Date.now()}-${UniqueTokenGenerator.generateUniqueToken(8).toLocaleUpperCase()}`
          },
          "paymentInformation": {
            "card": {
              "number": `${dataObj.number}`,
              //"securityCode": `${dataObj.cvv}`,
              "expirationMonth": `${dataObj.expirationMonth}`,
              "expirationYear": `${dataObj.expirationYear}`
            }
          },
          "orderInformation": {

            "amountDetails": {
              "totalAmount": `${dataObj.totalAmount}`,
              "currency": `${dataObj.currency}`,
            },

            "billTo": {
              "firstName": `${dataObj.firstName}`,
              "lastName": `${dataObj.lastName}`,
              "address1": `${dataObj.address1}`,
              "locality": `${dataObj.locality}`,
              "administrativeArea": `${dataObj.administrativeArea}`,
              "postalCode": `${dataObj.postalCode}`,
              "country": `${dataObj.country}`,
              "email": `${dataObj.email}`,
              "phoneNumber": `${dataObj.phoneNumber}`
            }
          }
        }

        const sendDate = new Date(Date.now()).toUTCString();

        fetch('https://api.cybersource.com/pts/v2/payments', {
          method: 'post',
          body: JSON.stringify(data),
          headers: {
            "host": `${configObj.runEnvironment}`,
            "v-c-date": sendDate,
            "signature": SigntureGenerator.getHeaders(configObj, requestTarget, JSON.stringify(data), sendDate, console),
            "digest": `${Constants.SIGNATURE_ALGORITHAM}${DigestGenerator.generateDigest(JSON.stringify(data))}`,
            "v-c-merchant-id": configObj.merchantID,
            "Content-Type": 'application/json'
          }
        }).then(async function (response) { 
          resolve(await response.json());
        }).catch(function (error) {
            reject(error);
        });

      //const response = await response.json();
    })
}

module.exports = authorizeTransaction;