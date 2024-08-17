const fetch                   = require("node-fetch");
const merchantConfig          = require("../config");

const DigestGenerator         = require("../authentification/DigestGenerator");
const SigntureGenerator       = require("../authentification/HttpSignatureToken");
const Constants               = require("../utils/constants");
const UniqueTokenGenerator    = require("../utils/generateUniqueToken");
const { payerCardCollection } = require("../config/inmemodb");

require('dotenv').config();

const authenticateClient =  (dataObj = {}) =>{

    /**
     * host	apitest.cybersource.com
     * signature	keyid="08c94330-f618-42a3-b09d-e1e43be5efda", algorithm="HmacSHA256", headers="host v-c-date request-target digest v-c-merchant-id", signature="6YKX1M1OgDqXV9hAIivyLftViJhaV/8YQYu4os5Q0S4="
     * digest	SHA-256=1wk5Hls1qcbZtjYDldGyl3B2i92v4rOqXyx6twRboEs=
     * v-c-merchant-id	testrest
     * v-c-date	Fri, 02 Aug 2024 12:12:40 GMT
     * Content-Type	application/json */

	return new Promise( (resolve, reject) =>{

    if(dataObj.length > 0){
      payerCardCollection.insert(dataObj);
    }

    const configObj = merchantConfig();
    const requestTarget = `${dataObj._links.capture.href}`;

    const data = {
			"clientReferenceInformation": dataObj.clientReferenceInformation? dataObj.clientReferenceInformation: {},
			"orderInformation": {
				amountDetails:{ ...dataObj.orderInformation.amountDetails, "totalAmount": dataObj.orderInformation.amountDetails.authorizedAmount} 
		  }
    }

    const sendDate = new Date(Date.now()).toUTCString();
		const captureUrl = `https://api.cybersource.com${dataObj._links.capture.href}`;

		//*
    fetch(captureUrl, {
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
    })
		.then(async function (response) { 
      resolve(await response.json());
    })
		.catch(function (error) {
      reject(error);
    });

		//*/
		//console.log("DATA:", data);
		//resolve(true);
  })
}

const processSetupService = (dataObj = {}) => {
  
  return new Promise( (resolve, reject) =>{
    let code = null;

    if(dataObj.length > 0){
      code = `ADP_CB-${Date.now()}-${UniqueTokenGenerator.generateUniqueToken(8).toLocaleUpperCase()}`;
      payerCardCollection.insert({...dataObj, code});
    }

    const configObj = merchantConfig();
    const requestTarget = `/risk/v1/authentication-setups`;
    const urlPath = "https://apitest.cybersource.com/risk/v1/authentication-setups"

    const data = {
      "clientReferenceInformation": {
        "code": (code !== null)? code : `ADP_CB-${Date.now()}-${UniqueTokenGenerator.generateUniqueToken(8).toLocaleUpperCase()}`,
        /*
        "partner": {
          "developerId": "7891234",
          "solutionId": "89012345"
        }
        */
      },
      "paymentInformation": {
        "card": {
          "type": "001",
          "number": `${dataObj.number}`,
          //"securityCode": `${dataObj.cvv}`,
          "expirationMonth": `${dataObj.expirationMonth}`,
          "expirationYear": `${dataObj.expirationYear}`
        }
      }
    }

    const sendDate = new Date(Date.now()).toUTCString();
    //*
      fetch(urlPath, {
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
      })
      .then(async function (response) { 
        resolve(await response.json());
      })
      .catch(function (error) {
        reject(error);
      });

  // */
  //console.log("DATA:", data);
  //resolve(true);
  })
}

const checkEnrollmentService = (dataObj = {}) => {
  return new Promise( (resolve, reject) =>{

    /*
    if(!dataObj.cardNumber || (typeof dataObj.cardNumber !== 'string' ) || (dataObj.cardNumber === "")){
      throw new Error("invalid params for check enrollment");
    }
    */

    //const code = payerCardCollection.findOne({number: dataObj.cardNumber})

    const configObj = merchantConfig();

    //PATH To rettrieve or verify status status: /risk/v1/authentication-results
    
    const requestTarget = `/risk/v1/authentications`;
    const urlPath = "https://apitest.cybersource.com/risk/v1/authentications";


    const data = {
      ...dataObj,
      "orderInformation": {
        "amountDetails": {
          "currency":   `${dataObj.billTo.currency}`,
          "totalAmount": `${dataObj.billTo.totalAmount}`
        },
        "billTo":{
          "firstName":    dataObj.billTo.firstName,
          "lastName":     dataObj.billTo.lastName,
          "address1":     dataObj.billTo.address1,
          "country":      dataObj.billTo.country,
          "phoneNumber":  dataObj.billTo.phoneNumber,
          "email":        dataObj.billTo.email,
        }
      },  
      "paymentInformation": {
        "card": {
          ///"type": "001",
          "number": `${dataObj.billTo.number}`,
          //"securityCode": `${dataObj.cvv}`,
          "expirationMonth": `${dataObj.billTo.expirationMonth}`,
          "expirationYear": `${dataObj.billTo.expirationYear}`
        }
      }
    }

    //*
    const sendDate = new Date(Date.now()).toUTCString();
      
      fetch(urlPath, {
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
      })
      .then(async function (response) { 
        resolve(await response.json());
      })
      .catch(function (error) {
        reject(error);
      });

   //*/
  //console.log("DATA:", data);
  //resolve(true);
  })
}

module.exports = { authenticateClient,  processSetupService, checkEnrollmentService }