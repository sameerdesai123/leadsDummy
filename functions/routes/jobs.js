// Imports
const db = require('../models/db-connect');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
var sha1 = require('sha1');

require('dotenv').config();

// Middleware
router.use(express.json());
const collection = 'jobs         ';

// Functions 
var ensureToken = (req,res,next) => {
    console.log("Ensuring Token");
    var bearerHeader = req.headers['authorization'];
     if(typeof bearerHeader !== 'undefined'){
         res.token = bearerHeader.split(' ')[1];
         console.log(" Token : ", res.token);
         return next();
     }else{
         return res.sendStatus('403').json({ success: false, message: "Authorization Error"});
     }
} 

var ensureMobile = (req,res,next) => {
    if(typeof req.body.mobile === 'undefined'){
        return res.sendStatus('403').json({ success : false, message: " Include Mobile Number"})
    }else{
        return next();
    }
}

//Routes

router.get('/details', ensureToken, (req, res, next) => {
    jwt.verify(res.token, process.env.SECRET_KEY, (err, data) => {
        if(err){
            res.json({ success: false, message: "User not permitted"});
        }
        else{   
        let document = req.body.document;
        console.log(document);
        db.collection(collection).doc(document).get()
        .then(doc => {
            if(!doc.exists){
                console.log("Document does not exist");
                res.json({ success: false, message: "User not found"});
            }
            else{
                console.log(doc.data());
                res.json({ success:true, data: doc.data()});
            }
            return;
        })
        .catch(err => {
            console.log("Failed to get document", err);
            res.json({ success: false, message: "Internal Server Error"+err});
            return;
        });
        }
    })
});

router.get('/all', ensureToken, async (req, res, next) => {
    var allDocs = [];
    jwt.verify(res.token, process.env.SECRET_KEY, (err, data) => {
        if(err){
            res.json({ success: false, message: "User not permitted"});
        }
        var read = data.read;
        console.log(read);
        if(!read){
            res.json({ success: false, message: "Permission Denied"});
        }
        db.collection(collection).get()
        .then(querySnapshot => {
            console.log("get() method resolved ");
            querySnapshot.forEach(doc => {
                let data = doc.data();
                // data.user = getUserData(data);
                // data.lead = getLeadData(data);
                allDocs.push({document: doc.id, data: data});
            });
            console.log();
            res.json({ success:true, data: allDocs});
            return;
        })
        .catch(err => {
            console.log("Failed to get document", err);
            res.json({ success: false, message: "Internal Server Error"+err});
            return;
        })
    })
})                                

async function getUserData(document){
    let data = {}
    console.log(document);
    return db.collection('users').doc(document).get()
        .then(doc => {
            if(!doc.exists){
                console.log("Document does not exist");
            }
            else{
                console.log(doc.data());
                data = { success: true, data: doc.data()};
            }
            return data;
        })
        .catch(err => {
            console.log(err);
            data = { success: false, msg: "Failed to retrive User info"};
        })
}

async function getLeadData(document){
    let data = {}
    console.log(document);
    return db.collection('leads').doc(document).get()
        .then(doc => {
            if(!doc.exists){
                console.log("Document does not exist");
            }
            else{
                console.log(doc.data());
                data = { success: true, data: doc.data()};
            }
            return data;
        })
        .catch(err => {
            console.log(err);
            data = { success: false, msg: "Failed to retrive Lead info"};
        })
}

router.post('/create', ensureToken, (req, res, next) => {
    jwt.verify(res.token, process.env.SECRET_KEY, (err, data) => {
        console.log("Token Verifying");
        
        if(err){
            res.json({ success: false, message: "User not permitted"});
        }
        console.log("Verified");
        
        var create = data.create;
        if(!create){
            res.json({ success: false, message: "Permission Denied"});
        }
        var leads = req.body.lead;
        var job = req.body.job;
        job.user = data.document;
        job.alert_date = new Date(job.alert_date);
        job.created_date = new Date(job.created_date);
        job.followup_date = new Date(job.followup_date);
        db.collection('leads').doc(sha1(leads.mobile)).set(leads)    
        .then( () => {
            job.lead = sha1(leads.mobile)
            console.log(sha1(leads.mobile));
            return createJob(job);
        })
        .then((response) => {
            console.log(response);
            res.json(response);
            return;
        })
        .catch(err => {
            console.log("Failed to create document"+err);
            res.json({ success: false, message: "Internal Server Error, Check for mobile number duplication"+err});
            return;
        })
    })
});

async function createJob(job){
    var res = {};
    return db.collection('jobs').add(job)
            .then((doc) => {
                console.log("Job Created : ", doc.id);
                res = {success: true, id: doc.id}
                return res;
            })
            .catch((err) => {
            console.log("Failed to create Job : "+err);
            res = { success: false, msg: "Failed to create a Job"}
                return res;
            })
}

module.exports = router;
