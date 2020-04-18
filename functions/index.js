const functions = require('firebase-functions');
const express = require('express');
mustacheExpress = require('mustache-express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const compression = require('compression');
const Users = require('./routes/users');
const Leads = require('./routes/leads');
const dashboard = require('./routes/dashboard');
const Admin = require('./routes/admin/admin');
const path = require('path');
const cookieParser = require('cookie-parser');
const {checkRead, verifyToken, getDoc, getAllDocs } = require('./models/db-functions');

var setCollec = (req, res, next) => {
    res.collection  = 'master';
    next();
}

require('dotenv').config();

app.use(express.json());
app.use(compression());
app.use(cors());
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', mustacheExpress(path.join(__dirname , '/views') + '/partials', '.html'));  // register file extension mustache
app.set('view engine', 'html');                 // register file extension for partials
app.set('views', path.join(__dirname , '/views'));

app.use('/api/users', Users);
app.use('/api/leads', Leads);
app.use('/dashboard', dashboard);


var ensureToken = (req,res,next) => {
    var bearerHeader = req.headers['authorization'];
     if(typeof bearerHeader !== 'undefined' || typeof req.cookies.token !== 'undefined'){
        if(typeof req.cookies.token !== 'undefined'){
            bearerHeader = "authorization " + req.cookies.token;
        }
        res.token = bearerHeader.split(' ')[1];
        console.log(" Token : ", res.token);
        return next();
     }else{
         return res.sendStatus('403').json({ success: false, message: "Authorization Error"});
     }
} 

app.get('/home', ensureToken, (req, res, next) => {
    jwt.verify(res.token, process.env.SECRET_KEY, (err, data) => {
        if(err){
            console.log(err);
            res.render('admin-login', {msg: "Wrong Credentials, try again"});
        }else{
            res.render('home', {msg: "Welcome"})
        }
    });
});

app.get('/admin-dashboard', ensureToken, setCollec, getAllDocs, (req, res, next) => {
    try{
        res.render('dashboard', { success: true, message: JSON.stringify(res.sendObj)});
    }catch(err){
        res.render('dashboard', { success: false, message: "Data Retrival Failed"})
    }
});

app.get('/admin-logout', async (req, res, next) => {
    res.clearCookie('token');
    res.render('admin-login', {msg: "Logged Out"})
})

app.post('/admin-login', async (req, res) => {
    var id;  // FOR DEV PURPOSE ONLY
    if(typeof req.body.id !== 'undefined'){
        id = req.body.id;
    }
    if(req.body.username === process.env.ADMIN_USER && req.body.password === process.env.ADMIN_PASSWORD) 
    {
        let d = {
            document: process.env.ADMIN,
            read: true,
            write: true,
            create: true,
            update: true
        }
        if( typeof id !== 'undefined'){
            d.id = id;
        }
        console.log(d);
        try
        {
           var token = await jwt.sign(d, process.env.SECRET_KEY, { expiresIn: '60 m'});
           res.cookie('token', token);
           //res.render('home', { success: true, token: token , msg: "You are logged in as Admin"});
            res.redirect('/admin-dashboard');
        }catch(err){
            console.log(err);
            res.render('admin-login', {success:false, msg: "Failed to generate Token"})
        }
    }else{
        res.render( 'admin-login', {success:false, msg: "Wrong Credentials Or Admin already logged in"})
    }
});

app.get('/admin', (req, res) => {
    res.render('admin-login', { msg: ""});    
});

app.get('**', (req, res) => {
    res.send("Endpoint doesn't exist");
})


// Trigger Declarations 
const master = require('./models/db-master');

exports.createLead = functions.firestore
    .document('users/{userId}')
    .onCreate((snap, context) => {
      const newValue = snap.data();
      var stage = newValue.Status;
      var region = newValue.Region;
      var service = newValue.Services;
      // Get probability and send that too
      master.newLead(stage, region, service);
});

exports.updateLead = functions.firestore
    .document('users/{userId}')
    .onUpdate((change, context) => {
      const newValue = change.after.data();
      const previousValue = change.before.data();
      // Only updating stages
      master.updateLead(newValue, previousValue);
});


// Exporting Nodejs app

exports.app = functions.https.onRequest(app);
