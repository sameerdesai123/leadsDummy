const functions = require('firebase-functions');
const express = require('express');
mustacheExpress = require('mustache-express');
const cors = require('cors');
const app = express();
const Users = require('./routes/users');
const Leads = require('./routes/leads');
const Jobs = require('./routes/jobs');
const Admin = require('./routes/admin/admin');
const path = require('path');

require('dotenv').config();

app.use(express.json());
app.use(cors());

app.engine('html', mustacheExpress(path.join(__dirname , '/views') + '/partials', '.html'));  // register file extension mustache
app.set('view engine', 'html');                 // register file extension for partials
app.set('views', path.join(__dirname , '/views'));

app.use('/api/users', Users);
app.use('/api/leads', Leads);
app.use('/api/jobs', Jobs);

app.get('/admin', (req, res) => {
    res.render('admin-portal-main', { msg: Admin.test});    
});

app.get('**', (req, res) => {
    res.send("Endpoint doesn't exist");
})

exports.app = functions.https.onRequest(app);