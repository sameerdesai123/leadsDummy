var admin = require("firebase-admin");

var serviceAccount = require('./.firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://leadsdummy.firebaseio.com"
});

module.exports = admin;