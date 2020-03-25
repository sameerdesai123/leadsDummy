// Imports
const db = require('../models/db-connect');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
var sha1 = require('sha1');

require('dotenv').config();

// Middleware
router.use(express.json());
const collection = 'users';

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

var addFCMToken = async (data) => {
    return db.collection(collection).doc(data.document).update({FCM : data.fcm})
    .then(() => {
        res = data.res
        return res;
    })
    .catch((err) => {
    console.log("Failed to update FCM : "+err);
    res = { success: false, msg: "Updating fcm token failed"}
        return res;
    });
}

router.post('/login',ensureMobile, async (req,res, next) => {
    var mobile = req.body.mobile;
    var fcm = req.body.fcm_token;
    var data = []
    var name, role;
    console.log(typeof mobile, ": ", mobile);
    db.collection(collection).where('mobile', '==', mobile).get()
        .then(querySnapshot => {
            console.log("Found User");
            querySnapshot.forEach(doc => {
                console.log("doc id : ", doc.id);
                data.push(doc.id);
                data.push(doc.data().read);
                data.push(doc.data().create);
                data.push(doc.data().update);
                name = doc.data().Name;
                role = doc.data().Role;
            });
            console.log({ document: data[0], read: data[1], create: data[2], update: data[3]});
            var token = jwt.sign({ document: data[0], read: data[1], create: data[2], update: data[3] }, process.env.SECRET_KEY, { expiresIn: '180 s' });
            return addFCMToken({ res : {
                success: true,
                token,
                name,
                role
            }, fcm: fcm, document: data[0]});
        })
        .then(data => {
            res.json(data);
            return;
        })
        .catch(err => {
            console.log(err);
            res.json({ success: false, message: "Internal Server Error"})
            return;
        });
});

router.get('/details', ensureToken, (req, res, next) => {
    jwt.verify(res.token, process.env.SECRET_KEY, (err, data) => {
        if(err){
            res.json({ success: false, message: "User not permitted"});
        }
        else{   
        let document = data.document;
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
                allDocs.push({id: doc.id, data: doc.data()});
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

router.get('/one', ensureToken, (req, res, next) => {
    jwt.verify(res.token, process.env.SECRET_KEY, (err, data) => {
        if(err){
            console.log("data : ", data);
            res.json({ success: false, message: "User not permitted"});
        }
        var read = data.read;
        let document = req.body.document;
        if(typeof document === 'undefined'){
            read = false;
        }
        console.log(read);
        if(!read){
            res.json({ success: false, message: "Permission Denied"});
        }
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
        })
    })
});

module.exports = router;
