var admin = require("firebase-admin");

// var serviceAccount = require('./.firebase-adminsdk.json');

admin.initializeApp(functions.config().firebase);

let db = admin.firestore();

module.exports = db;