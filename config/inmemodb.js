const loki = require("lokijs");

const db = new loki('adpcbpayments.db');

// Add a collection to the database
const payerCardCollection = db.addCollection('payerCardInfosCollections');

exports.payerCardCollection = payerCardCollection;
