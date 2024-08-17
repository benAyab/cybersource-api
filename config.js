'use strict';

require("dotenv").config();
/*
*   Merchant configuration properties are taken from Configuration module

    $request_host = "apitest.cybersource.com";
    $request_hosts = "rtstest.ic3.com";
    $merchant_id = "4444400008";
    $merchant_key_id = "7636dcf6-01cb-4f7b-8f8e-0556173a5b50"; // 0bd01f08-db32-4041-8a47-a9f40598453e
    $merchant_secret_key = "6cCdr2CfW4b8kEEPl48WQ0uIQRe4vLkDYOwNnPuOcAY="; //
*/

// common parameters
const AuthenticationType        = process.env.CYBERSOURCE_AuthenticationType
const RunEnvironment            = process.env.CYBERSOURCE_RunEnvironment
const MerchantId                = process.env.CYBERSOURCE_MerchantId //authorizedAmount: | 4444400008

// http_signature parameters
const MerchantKeyId             = "7636dcf6-01cb-4f7b-8f8e-0556173a5b50";  // process.env.CYBERSOURCE_merchantKeyId
const MerchantSecretKey         = "6cCdr2CfW4b8kEEPl48WQ0uIQRe4vLkDYOwNnPuOcAY="; // process.env.CYBERSOURCE_merchantsecretKey 

// jwt parameters
const KeysDirectory             = process.env.CYBERSOURCE_KeysDirectory
const KeyFileName               = process.env.CYBERSOURCE_KeyFileName
const KeyAlias                  = process.env.CYBERSOURCE_KeyAlias
const KeyPass                   = process.env.CYBERSOURCE_KeyPass

//meta key parameters
const UseMetaKey = false;
const PortfolioID = '';

// logging parameters
const EnableLog = true;
const LogFileName = 'cybs';
const LogDirectory = 'log';
const LogfileMaxSize = '5242880'; //10 MB In Bytes
const EnableMasking = true;

/*
PEM Key file path for decoding JWE Response Enter the folder path where the .pem file is located.
It is optional property, require adding only during JWE decryption.
*/
const PemFileDirectory = 'Resource/NetworkTokenCert.pem';

// Constructor for Configuration
function Configuration() {

    var configObj = {
        'authenticationType': AuthenticationType,
        'runEnvironment': RunEnvironment,

        'requestType': process.env.CYBERSOURCE_RequestType,

        'merchantID': MerchantId,
        'merchantKeyId': MerchantKeyId,
        'merchantsecretKey': MerchantSecretKey,


        'keyAlias': KeyAlias,
        'keyPass': KeyPass,
        'keyFileName': KeyFileName,
        'keysDirectory': KeysDirectory,

        'useMetaKey': UseMetaKey,
        'portfolioID': PortfolioID,
        'pemFileDirectory': PemFileDirectory,

        'logConfiguration': {
            'enableLog': EnableLog,
            'logFileName': LogFileName,
            'logDirectory': LogDirectory,
            'logFileMaxSize': LogfileMaxSize,
            'loggingLevel': 'debug',
            'enableMasking': EnableMasking
        }
    };
    
    return configObj;
}

module.exports = Configuration;
