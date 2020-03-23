// Imports
const db = require('../models/db-connect');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
var sha1 = require('sha1');

require('dotenv').config();

// Middleware
router.use(express.json());
const collection = 'leads';

// Functions 
var ensureToken = (req,res,next) => {
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

router.get('/all', ensureToken, (req, res, next) => {
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
                allDocs.push({document: doc.id, data: doc.data()});
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

router.post('/create', ensureToken, ensureMobile, (req, res, next) => {
    jwt.verify(res.token, process.env.SECRET_KEY, (err, data) => {
        if(err){
            res.json({ success: false, message: "User not permitted"});
        }
        var create = data.create;
        if(!create){
            res.json({ success: false, message: "Permission Denied"});
        }
        var body = req.body;
        db.collection(collection).doc(sha1(req.body.mobile)).set(body)    
        .then( () => {
            console.log(sha1(req.body.mobile));
            res.json({ success:true, data: sha1(req.body.mobile)});
            return;
        })
        .catch(err => {
            console.log("Failed to create document"+err);
            res.json({ success: false, message: "Internal Server Error, Check for mobile number duplication"+err});
            return;
        })
    })
});

module.exports = router;
