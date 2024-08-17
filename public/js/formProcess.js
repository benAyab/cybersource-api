var cardForm = document.getElementById("cardForm");
var contrySelect = document.getElementById("contrySelect");

let testUrl =  "https://centinelapistag.cardinalcommerce.com";
let prodUrl =  "https://centinelapi.cardinalcommerce.com";

var carNumber = null;
var setupResponse = null;

cardForm.addEventListener("submit", function(evt){
    evt.preventDefault();
    sendData();
});


function sendData(){
    var setupServiceUrl = "/api/v1/adp-cb/setup-service";

    var formData = new FormData(cardForm);

    let data = {};
    for (const [key, value] of formData) {
        if(key == "expireDate"){
            let date = value.split("-");
            data["expirationYear"] = date[0]
            data["expirationMonth"] = date[1]
        }else{
            data[`${key}`] = `${value}`
        }
    }

    //console.log(data);
     sendRequestToServer("POST", setupServiceUrl, data, handleSetupServiceResponse);
}

function sendCheckRequest(){
    var checkEnrollUrl = "/api/v1/adp-cb/check-enrollment";

    var formData = new FormData(cardForm);

    var data = { 
        "deviceInformation": {
            "httpAcceptBrowserValue": "application/json",
            "httpAcceptContent": "application/json",
            "httpBrowserLanguage": navigator.language,
            "httpBrowserJavaEnabled": false,
            "httpBrowserJavaScriptEnabled": true,
            "httpBrowserColorDepth": screen.colorDepth,
            "httpBrowserScreenHeight": screen.height,
            "httpBrowserScreenWidth": screen.width,
            "httpBrowserTimeDifference": "",
            "userAgentBrowserValue": navigator.userAgent
        },
        "consumerAuthenticationInformation": {
            "referenceId": setupResponse.consumerAuthenticationInformation.referenceId
        },
        "clientReferenceInformation": {
            "code": setupResponse.clientReferenceInformation.code
        },
    };

    data.billTo = {};

    for (const [key, value] of formData) {
        if(key == "expireDate"){
            let date = value.split("-");
            data.billTo.expirationYear = date[0]
            data.billTo.expirationMonth = date[1]
        }else{
            data.billTo[`${key}`] = `${value}`
        }
    }

    //console.log("DATA: ", data);
    sendRequestToServer("POST", checkEnrollUrl, data, handleCheckEnroll);
}

/* Handlers
 *
 * 
 */
function onBodyLoaded(){
    contrySelect.innerHTML = null;
    const keys = Object.keys(country);
    for(let c of keys){
        //console.log(`${c}: ${country[c]}`);
        var opt = document.createElement("option");
        opt.value = `${c}`
        opt.text = `${country[c]}`;

        contrySelect.add(opt);
    }
}

function handleSetupServiceResponse(xhr){

    var cardinalCollectionForm = document.querySelector('#cardinal_collection_form');

    if(cardinalCollectionForm){

        if(xhr.response && xhr.response.data && xhr.response.data.status === "COMPLETED"){
            setupResponse = xhr.response.data;

            cardinalCollectionForm.action = setupResponse.consumerAuthenticationInformation.deviceDataCollectionUrl;
            document.getElementById("cardinal_collection_form_input").value = setupResponse.consumerAuthenticationInformation.accessToken;

            //console.log(setupResponse);
            cardinalCollectionForm.submit();
            
        }else{
            console.log(xhr.response);
            alert("réponse invalide")
        }  
    } 
}

function handleCheckEnroll(xhr){
    var stepUpForm = document.querySelector('#step-up-form');

    if(xhr.response && xhr.response.data && xhr.response.data.status === "PENDING_AUTHENTICATION"){
        setupResponse = xhr.response.data;

        stepUpForm.action = setupResponse.consumerAuthenticationInformation.stepUpUrl;
        document.getElementById("stepUpInput").value = setupResponse.consumerAuthenticationInformation.token;

        var step_up_iframe = document.getElementById("step_up_iframe");
        step_up_iframe.style.width = setupResponse.challengeWindowSize.width;
        step_up_iframe.style.height = setupResponse.challengeWindowSize.height

        console.log(setupResponse);
        stepUpForm.submit();
        
    }else{
        console.log(xhr.response);
        alert("réponse invalide")
    }
}

function submitStepUpForm(){
   
}

function sendRequestToServer(method, url, payload = "", cb, asyncSend = true){
    
    var xhttp = new XMLHttpRequest();
    xhttp.timeout = 10000; //10 seconds de timeout
    xhttp.responseType = "json"

    xhttp.onreadystatechange = function() {

        if (this.readyState === 4) {

            var headers = this.getAllResponseHeaders()
            .split('\r\n')
            .reduce((result, current) => {
                let [name, value] = current.split(': ');
                result[name] = value;
                return result;
            }, {});

            //console.log("Headers: ", headers);

            if(this.status === 200){
                cb(this);  
            }else{
                alert("Server response: "+this.status + " "+ this.statusText);
            }
        }
    }

    xhttp.ontimeout = function(){
        carNumber = null;
        alert("connexion timeout occur")
    }

    /*
    xhttp.onload = function() {
        if (xhttp.status != 200) { // analyze HTTP status of the response
            alert(`Error ${xhttp.status}: ${xhttp.statusText}`); // e.g. 404: Not Found
          } else { // show the result
            alert(`Done, got ${xhttp.response.length} bytes`); // response is the server response
        }
    }
    */

    // Send a request
    xhttp.open(method, url, asyncSend);

    xhttp.setRequestHeader("Content-type", "application/json");
    
    xhttp.send(JSON.stringify(payload));
}

window.addEventListener("message", function(event) {
    if (!event.origin || (event.origin !== testUrl)) {
        console.log("Error occured");
        return;
    }

    var dd = JSON.parse(event.data);

    if(dd.MessageType && dd.MessageType === "profile.completed" && dd.Status === true ){
        sendCheckRequest();
    }

}, false);

/*
document.getElementById("demo").innerHTML =
"navigator.cookieEnabled is " + navigator.platform;
*/
const country = {
    "AF": "Afghanistan",
    "AX": "Aland Islands",
    "AL": "Albania",
    "DZ": "Algeria",
    "AS": "American Samoa",
    "AD": "Andorra",
    "AO": "Angola",
    "AI": "Anguilla",
    "AQ": "Antarctica",
    "AG": "Antigua And Barbuda",
    "AR": "Argentina",
    "AM": "Armenia",
    "AW": "Aruba",
    "AU": "Australia",
    "AT": "Austria",
    "AZ": "Azerbaijan",
    "BS": "Bahamas",
    "BH": "Bahrain",
    "BD": "Bangladesh",
    "BB": "Barbados",
    "BY": "Belarus",
    "BE": "Belgium",
    "BZ": "Belize",
    "BJ": "Benin",
    "BM": "Bermuda",
    "BT": "Bhutan",
    "BO": "Bolivia",
    "BA": "Bosnia And Herzegovina",
    "BW": "Botswana",
    "BV": "Bouvet Island",
    "BR": "Brazil",
    "IO": "British Indian Ocean Territory",
    "BN": "Brunei Darussalam",
    "BG": "Bulgaria",
    "BF": "Burkina Faso",
    "BI": "Burundi",
    "KH": "Cambodia",
    "CM": "Cameroon",
    "CA": "Canada",
    "CV": "Cape Verde",
    "KY": "Cayman Islands",
    "CF": "Central African Republic",
    "TD": "Chad",
    "CL": "Chile",
    "CN": "China",
    "CX": "Christmas Island",
    "CC": "Cocos (Keeling) Islands",
    "CO": "Colombia",
    "KM": "Comoros",
    "CG": "Congo",
    "CD": "Congo, Democratic Republic",
    "CK": "Cook Islands",
    "CR": "Costa Rica",
    "CI": "Cote D\"Ivoire",
    "HR": "Croatia",
    "CU": "Cuba",
    "CY": "Cyprus",
    "CZ": "Czech Republic",
    "DK": "Denmark",
    "DJ": "Djibouti",
    "DM": "Dominica",
    "DO": "Dominican Republic",
    "EC": "Ecuador",
    "EG": "Egypt",
    "SV": "El Salvador",
    "GQ": "Equatorial Guinea",
    "ER": "Eritrea",
    "EE": "Estonia",
    "ET": "Ethiopia",
    "FK": "Falkland Islands (Malvinas)",
    "FO": "Faroe Islands",
    "FJ": "Fiji",
    "FI": "Finland",
    "FR": "France",
    "GF": "French Guiana",
    "PF": "French Polynesia",
    "TF": "French Southern Territories",
    "GA": "Gabon",
    "GM": "Gambia",
    "GE": "Georgia",
    "DE": "Germany",
    "GH": "Ghana",
    "GI": "Gibraltar",
    "GR": "Greece",
    "GL": "Greenland",
    "GD": "Grenada",
    "GP": "Guadeloupe",
    "GU": "Guam",
    "GT": "Guatemala",
    "GG": "Guernsey",
    "GN": "Guinea",
    "GW": "Guinea-Bissau",
    "GY": "Guyana",
    "HT": "Haiti",
    "HM": "Heard Island & Mcdonald Islands",
    "VA": "Holy See (Vatican City State)",
    "HN": "Honduras",
    "HK": "Hong Kong",
    "HU": "Hungary",
    "IS": "Iceland",
    "IN": "India",
    "ID": "Indonesia",
    "IR": "Iran, Islamic Republic Of",
    "IQ": "Iraq",
    "IE": "Ireland",
    "IM": "Isle Of Man",
    "IL": "Israel",
    "IT": "Italy",
    "JM": "Jamaica",
    "JP": "Japan",
    "JE": "Jersey",
    "JO": "Jordan",
    "KZ": "Kazakhstan",
    "KE": "Kenya",
    "KI": "Kiribati",
    "KR": "Korea",
    "KP": "North Korea",
    "KW": "Kuwait",
    "KG": "Kyrgyzstan",
    "LA": "Lao People\"s Democratic Republic",
    "LV": "Latvia",
    "LB": "Lebanon",
    "LS": "Lesotho",
    "LR": "Liberia",
    "LY": "Libyan Arab Jamahiriya",
    "LI": "Liechtenstein",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "MO": "Macao",
    "MK": "Macedonia",
    "MG": "Madagascar",
    "MW": "Malawi",
    "MY": "Malaysia",
    "MV": "Maldives",
    "ML": "Mali",
    "MT": "Malta",
    "MH": "Marshall Islands",
    "MQ": "Martinique",
    "MR": "Mauritania",
    "MU": "Mauritius",
    "YT": "Mayotte",
    "MX": "Mexico",
    "FM": "Micronesia, Federated States Of",
    "MD": "Moldova",
    "MC": "Monaco",
    "MN": "Mongolia",
    "ME": "Montenegro",
    "MS": "Montserrat",
    "MA": "Morocco",
    "MZ": "Mozambique",
    "MM": "Myanmar",
    "NA": "Namibia",
    "NR": "Nauru",
    "NP": "Nepal",
    "NL": "Netherlands",
    "AN": "Netherlands Antilles",
    "NC": "New Caledonia",
    "NZ": "New Zealand",
    "NI": "Nicaragua",
    "NE": "Niger",
    "NG": "Nigeria",
    "NU": "Niue",
    "NF": "Norfolk Island",
    "MP": "Northern Mariana Islands",
    "NO": "Norway",
    "OM": "Oman",
    "PK": "Pakistan",
    "PW": "Palau",
    "PS": "Palestinian Territory, Occupied",
    "PA": "Panama",
    "PG": "Papua New Guinea",
    "PY": "Paraguay",
    "PE": "Peru",
    "PH": "Philippines",
    "PN": "Pitcairn",
    "PL": "Poland",
    "PT": "Portugal",
    "PR": "Puerto Rico",
    "QA": "Qatar",
    "RE": "Reunion",
    "RO": "Romania",
    "RU": "Russian Federation",
    "RW": "Rwanda",
    "BL": "Saint Barthelemy",
    "SH": "Saint Helena",
    "KN": "Saint Kitts And Nevis",
    "LC": "Saint Lucia",
    "MF": "Saint Martin",
    "PM": "Saint Pierre And Miquelon",
    "VC": "Saint Vincent And Grenadines",
    "WS": "Samoa",
    "SM": "San Marino",
    "ST": "Sao Tome And Principe",
    "SA": "Saudi Arabia",
    "SN": "Senegal",
    "RS": "Serbia",
    "SC": "Seychelles",
    "SL": "Sierra Leone",
    "SG": "Singapore",
    "SK": "Slovakia",
    "SI": "Slovenia",
    "SB": "Solomon Islands",
    "SO": "Somalia",
    "ZA": "South Africa",
    "GS": "South Georgia And Sandwich Isl.",
    "ES": "Spain",
    "LK": "Sri Lanka",
    "SD": "Sudan",
    "SR": "Suriname",
    "SJ": "Svalbard And Jan Mayen",
    "SZ": "Swaziland",
    "SE": "Sweden",
    "CH": "Switzerland",
    "SY": "Syrian Arab Republic",
    "TW": "Taiwan",
    "TJ": "Tajikistan",
    "TZ": "Tanzania",
    "TH": "Thailand",
    "TL": "Timor-Leste",
    "TG": "Togo",
    "TK": "Tokelau",
    "TO": "Tonga",
    "TT": "Trinidad And Tobago",
    "TN": "Tunisia",
    "TR": "Turkey",
    "TM": "Turkmenistan",
    "TC": "Turks And Caicos Islands",
    "TV": "Tuvalu",
    "UG": "Uganda",
    "UA": "Ukraine",
    "AE": "United Arab Emirates",
    "GB": "United Kingdom",
    "US": "United States",
    "UM": "United States Outlying Islands",
    "UY": "Uruguay",
    "UZ": "Uzbekistan",
    "VU": "Vanuatu",
    "VE": "Venezuela",
    "VN": "Vietnam",
    "VG": "Virgin Islands, British",
    "VI": "Virgin Islands, U.S.",
    "WF": "Wallis And Futuna",
    "EH": "Western Sahara",
    "YE": "Yemen",
    "ZM": "Zambia",
    "ZW": "Zimbabwe"
}