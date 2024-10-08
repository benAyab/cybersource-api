'use strict';

const Constants = require('../utils/constants');
var HttpSingToken = require('../http/HTTPSigToken');
var JWTSigToken = require('../jwt/JWTSigToken');
//var OAuthToken = require('../oauth/OAuthToken');
//var ApiException = require('../util/ApiException');

/**
 * This function calls for the generation of Signature message depending on the authentication type.
 * 
 */
exports.getToken = function(merchantConfig, logger){

    var authenticationType = merchantConfig.getAuthenticationType().toLowerCase();
    var httpSigToken;
    var jwtSingToken;
    var oauthToken;

    if(authenticationType === Constants.HTTP) {
        httpSigToken = HttpSingToken.getToken(merchantConfig, logger);
        return httpSigToken;
    }
    else if(authenticationType === Constants.JWT) {
        jwtSingToken = JWTSigToken.getToken(merchantConfig, logger);
        return jwtSingToken;
    }
    else if(authenticationType === Constants.OAUTH) {
        oauthToken = OAuthToken.getToken(merchantConfig, logger);
        return oauthToken;
    }
    else{
        ApiException.ApiException(Constants.AUTH_ERROR, logger);
    }
}