const functions = require('firebase-functions');
const express = require('express');
mustacheExpress = require('mustache-express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const Users = require('./routes/users');
const Leads = require('./routes/leads');
const Jobs = require('./routes/jobs');
const Admin = require('./routes/admin/admin');
const path = require('path');
const cookieParser = require('cookie-parser');

require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', mustacheExpress(path.join(__dirname , '/views') + '/partials', '.html'));  // register file extension mustache
app.set('view engine', 'html');                 // register file extension for partials
app.set('views', path.join(__dirname , '/views'));

app.use('/api/users', Users);
app.use('/api/leads', Leads);
app.use('/api/jobs', Jobs);


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
            res.send("<h1>Failed</h1><br/>")
        }else{
            res.send("<h1>Welcome to Leads Dummy, " + data + "</h1><br/>")
        }
    });
})

app.get('/admin-logout', async (req, res, next) => {
    res.clearCookie('token');
    res.render('admin-portal-main', {msg: "Logged Out"})
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
            res.render('admin-portal-main', { success: true, token: token , msg: "You are logged in as Admin"});
        }catch(err){
            console.log(err);
            res.render('admin-portal-main', {success:false, msg: "Failed to generate Token"})
        }
    }else{
        res.render( 'admin-portal-main', {success:false, msg: "Wrong Credentials Or Admin already logged in"})
    }
});

app.get('/admin', (req, res) => {
    res.render('admin-portal-main', { msg: "Hello"});    
});

app.get('**', (req, res) => {
    res.send("Endpoint doesn't exist");
})

exports.app = functions.https.onRequest(app);