const functions = require('firebase-functions');
const express = require('express');
mustacheExpress = require('mustache-express');
const cors = require('cors');
const app = express();
const Users = require('./routes/users');
const path = require('path');
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.engine('html', mustacheExpress());          // register file extension mustache
app.set('view engine', 'html');                 // register file extension for partials
app.set('views', path.join(__dirname , '/views'));

app.use('/api/users', Users);

app.get('/', (req, res) => {
    res.render('admin-portal-main');    
});

app.get('**', (req, res) => {
    res.send("Endpoint does't exist");
})

exports.app = functions.https.onRequest(app);