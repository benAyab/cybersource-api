var SignatureParameterGenerator     = require('./SignatureParameterGenerator');

exports.getHeaders = function (merchantConfig, requestTarget, jsonData, sendDate, logger) {
    var signatureHeader = "";
    var signatureValue = "";
    var requestType = merchantConfig.requestType.toLowerCase();

    try {
        const Constants = require("../utils/constants");
        /* KeyId is the key obtained from EBC */
        signatureHeader += "keyid=\"" + merchantConfig.merchantKeyId + "\"";

        /* Algorithm should be always HmacSHA256 for http signature */
        signatureHeader += ", algorithm=\"" + Constants.HmacSHA256 + "\"";

        /* Headers - list is choosen based on HTTP method. Digest is not required for GET Method */
        if (requestType === Constants.GET || requestType === Constants.DELETE) {
            var headersForGetMethod = "host v-c-date request-target" + " " + Constants.V_C_MERCHANTID;
            signatureHeader += ", headers=\"" + headersForGetMethod + "\"";
        }
        else if (requestType === Constants.POST || requestType === Constants.PUT) {
            var headersForPostPutMethod = "host v-c-date request-target digest " + Constants.V_C_MERCHANTID;
            signatureHeader += ", headers=\"" + headersForPostPutMethod + "\"";
        }
        // for patch call, added on 26-10-18
        else if (requestType === Constants.PATCH) {
            var headersForPatchMethod = "host v-c-date request-target digest " + Constants.V_C_MERCHANTID;
            signatureHeader += ", headers=\"" + headersForPatchMethod + "\"";
        }
        else {
            logger.error(Constants.INVALID_REQUEST_TYPE_METHOD);
        }

        /* Get Value for paramter 'Signature' to be passed to Signature Header */
        signatureValue = SignatureParameterGenerator.getSignatureParameter(merchantConfig, requestTarget, jsonData, sendDate, logger);
        signatureHeader += ", signature=\"" + signatureValue + "\"";
        logger.info("signatureHeader : " + signatureHeader);
        return signatureHeader;
    } catch (err) {
        logger.error(err.stack);
    }

};
