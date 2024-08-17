var crypto = require('crypto');
const Constants = require('../utils/constants');
var DigestGenerator = require('./DigestGenerator');

/* This function returns value for paramter Signature which is then passed to Signature header
         * paramter 'Signature' is calucated based on below key values and then signed with 
         * SECRET KEY -
         * host: Sandbox (apitest.cybersource.com) or Production (api.cybersource.com) hostname
         * date: 'HTTP-date' format as defined by RFC7231.
         * request-target: Should be in format of httpMethod: path
                             Example: 'post /pts/v2/payments'
         * Digest: Only needed for POST calls.
                    digestString = BASE64( HMAC-SHA256 ( Payload ));
                    Digest: “SHA-256=“ + digestString;
         * v-c-merchant-id: set value to Cybersource Merchant ID
                             This ID can be found on EBC portal*/
exports.getSignatureParameter = function (merchantConfig, requestTarget, jsonData, sendDate, logger) {

    var signatureString = Constants.HOST + ': ' + merchantConfig.runEnvironment;

    signatureString += '\n' + Constants.DATE + ': ' + sendDate;
    signatureString += '\nrequest-target: ';

    var requestType = merchantConfig.requestType.toLowerCase();

    if (requestType === Constants.GET) {
        var targetUrlForGet = Constants.GET + ' '
            + requestTarget;
        signatureString += targetUrlForGet + '\n';
    }
    else if (requestType === Constants.DELETE) {
        var targetUrlForDelete = Constants.DELETE + ' '
            + requestTarget;
        signatureString += targetUrlForDelete + '\n';
    }
    else if (requestType === Constants.POST
        || requestType === Constants.PUT
        || requestType === Constants.PATCH) {
        // Digest for PUT, POST, and PATCH calls
        var digest = DigestGenerator.generateDigest(jsonData, logger);

        if (requestType === Constants.POST) {

            var targetUrlForPost = Constants.POST + ' '
                + requestTarget;
            signatureString += targetUrlForPost + '\n';
        }
        else if (requestType === Constants.PUT) {
            var targetUrlForPut = Constants.PUT + ' '
                + requestTarget;
            signatureString += targetUrlForPut + '\n';
        }
        else if (requestType === Constants.PATCH) {
            var targetUrlForPatch = Constants.PATCH + ' '
                + requestTarget;
            signatureString += targetUrlForPatch + '\n';
        }

        signatureString += Constants.DIGEST + ': '
            + Constants.SIGNATURE_ALGORITHAM + digest + '\n';
    }
    
    signatureString += Constants.V_C_MERCHANTID + ': ' + merchantConfig.merchantID;
       
    var data = Buffer.from(signatureString,'utf8');
    /*  Decoding scecret key */
    const key = Buffer.from(merchantConfig.merchantsecretKey, "base64");

    var base64EncodedSignature = crypto.createHmac('sha256', key)
        .update(data)
        .digest('base64');
    return base64EncodedSignature;
};
