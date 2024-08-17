'use strict'

const path              = require("path");
const bodyParser        = require("body-parser");
const express           = require("express");
var app                 = express();
require("dotenv").config();

//front config
//##############################################################################
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static('public'));
//##############################################################################

app.use(bodyParser.json());
app.disable('x-powered-by');

const { capture_payment } = require("./services/capture-payment");
const authorizePayment = require("./services/initTransaction");
const { authenticateClient,  processSetupService, checkEnrollmentService } = require("./services/authenticateClient");
const { getIframeSize } = require("./utils/decodeAndGetIframeSize");
//const { object } = require("joi");


app.post("/api/v1/adp-cb/initauthorization", async function(req, res){
    //var odin = users.findOne({ name:'Odin' });
    try {
        if( !req.body || 
            !req.body.lastName  || 
            !req.body.firstName ||
            !req.body.address1  ||
            !req.body.locality  ||
            //!req.body.administrativeArea ||
            //!req.body.postalCode ||
            !req.body.country    ||
            !req.body.email      ||
            !req.body.phoneNumber ||
            !req.body.currency   ||
            !req.body.number     ||
            !req.body.expirationMonth ||
            !req.body.expirationYear ||
            !req.body.totalAmount 
        ){
            return res.status(400).json({error: "invalid params"})
        }else{
            const { body } = req;
            const response = await authorizePayment(body);

            console.log(response);

            if((typeof response === "object") && (response.status === "AUTHORIZED")){
                const captureRes = await capture_payment(response);

                return res.status(200).json({data: {message: "succes", data: captureRes}}); 
            }else{
                return res.status(403) .json({error: "erreur lors de la transaction"}); 
            }
        }
    } catch (error) {
     console.log(error.message);
     return res.status(400).json({error: error.message})   
    }
});

app.post("/api/v1/adp-cb/setup-service", async function(req, res){
    try {
        //const { body } = req;
        //console.log(body);

        if( !req.body || 
            !req.body.lastName  || 
            !req.body.firstName ||
            !req.body.address1  ||
            //!req.body.locality  ||
            //!req.body.administrativeArea ||
            //!req.body.postalCode ||
            !req.body.country    ||
            !req.body.email      ||
            !req.body.phoneNumber ||
            !req.body.currency   ||
            !req.body.number     ||
            !req.body.expirationMonth ||
            !req.body.expirationYear ||
            !req.body.totalAmount 
        ){
            return res.status(400).json({error: "invalid params"})
        }else{
            const { body } = req;

            const response = await processSetupService(body);

            //console.log(body);

            return res.status(200).json({ message: "succes", data: response });

            /*
            if((typeof response === "object") && (response.status === "AUTHORIZED")){
                const captureRes = await capture_payment(response);

                return res.status(200).json({data: {message: "succes", data: captureRes}}); 
            }else{
                return res.status(403) .json({error: "erreur lors de la transaction"}); 
            }
            */
        }
    } catch (error) {
     console.log(error.message);
     return res.status(400).json({error: error.message})   
    }
});


app.post("/api/v1/adp-cb/check-enrollment", async(req, res) =>{
    try {
        const { body } = req;
        const response = await checkEnrollmentService(body);

        //if challenge is required by issuer bank, parse data and return 
        if(response.status && (response.status === "PENDING_AUTHENTICATION") && response.consumerAuthenticationInformation.pareq ){
            let decodedPareq  = Buffer.from(response.consumerAuthenticationInformation.pareq, "base64").toString("utf8");
            decodedPareq = JSON.parse(decodedPareq);
            const challengeWindowSize = getIframeSize(decodedPareq.challengeWindowSize);

            const data = {
                status: response.status,
                challenge: true,
                challengeWindowSize,
                "clientReferenceInformation": response.clientReferenceInformation,
                "consumerAuthenticationInformation": {
                    "token": response.consumerAuthenticationInformation.token,
                    "acsUrl": response.consumerAuthenticationInformation.acsUrl,
                    "stepUpUrl": response.consumerAuthenticationInformation.stepUpUrl,
                    "acsTransactionId": response.consumerAuthenticationInformation.acsTransactionId
                }
            }

            return res.status(200).json({ message: "succes", data});
        }

        return res.status(200).json({ message: "succes", data: response });
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "internal server error", detail: "an error occured"})
    }
})

app.get('/', (req, res) => {
    res.render('home', req.query);
});

const PORT = process.env.API_PORT;

app.listen(PORT, () =>{
    console.log("app listen on port: ", PORT)
})
