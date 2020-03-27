db = require('./db-connect');
jwt = require('jsonwebtoken');
require('dotenv').config();


// Verify Token and return data as res.decrpyt
var verifyToken = async(req, res, next) => {
    jwt.verify(res.token, process.env.SECRET_KEY, (err, data) => {
        if(err){
            res.json({ success: false, message: "User not permitted"});
        }
        else{   
            res.decrypt = data;
        }
        return next();
    })
}

// Check Permissions

var checkRead = async(req, res, next) => {
    var read = res.decrypt.read;
    console.log(read);
    if(!read){
            res.json({ success: false, message: "Permission Denied"});
    }
    return next();
}

var checkWrite = async(req, res, next) => {
    var write = res.decrypt.create;
    console.log(write);
    if(!write){
            res.json({ success: false, message: "Permission Denied"});
    }
    return next();
}

var checkUpdate = async(req, res, next) => {
    var update = res.decrypt.update;
    console.log(update);
    if(!update){
            res.json({ success: false, message: "Permission Denied"});
    }
    return next();
}
// Ensure Mobile
var ensureMobile = async (req,res,next) => {
    console.log("Ensuring Mobile");
    if(typeof req.body.mobile === 'undefined'){
        return res.sendStatus('403').json({ success : false, message: " Include Mobile Number"})
    }else{
        return next();
    }
}

// Ensure Token
var ensureToken = async (req,res,next) => {
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

// Add fcm token 
var addFCMToken = async (data, collection) => {
    console.log("Adding FCM token");
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

// Login Method
var login = async (req, res, next) => {
    var mobile = req.body.mobile;
    var fcm = req.body.fcm_token;
    var data = []
    var name, role;
    let collection = res.collection;
    console.log(typeof mobile, ": ", mobile);
    console.log("Trying To Login");
    
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
            }, fcm: fcm, document: data[0]}, collection);
        })
        .then(data => {
            res.sendObj = data;
            return next();
        })
        .catch(err => {
            console.log(err);
            res.sendObj = { success: false, message: "Internal Server Error"};
            return next;
        });
}


// Protected
var getDoc = async (req, res, next) => {
    let collection = res.collection;
    let document = res.document;
    console.log("Trying to get document");
    db.collection(collection).doc(document).get()
        .then(doc => {
            if(!doc.exists){
                console.log("Document does not exist");
                res.sendObj = { success: false, message: "User not found"};
            }
            else{
                console.log(doc.data());
                res.sendObj = { success:true, data: doc.data()};
            }
            return next();
        })
        .catch(err => {
            console.log("Failed to get document", err);
            res.sendObj = { success: false, message: "Internal Server Error"+err};
            return next();
        });
}

var addDoc = async (req, res, next) => {
    let collection = res.collection;
    let document = res.document;
    let body = res.docBody;
    console.log("Collection , Document, Body, ", collection, document, body);
    db.collection(collection).doc(document).set(body)    
        .then( () => {
            console.log(document);
            res.sendObj = { success:true, data: document};
            return next();
        })
        .catch(err => {
            console.log("Failed to create document"+err);
            res.sendObj = { success: false, message: "Internal Server Error, Check for mobile number duplication"+err};
            return next();
        })
}

var getAllDocs = async(req, res, next) => {
    var allDocs = [];
    let collection = res.collection;
    db.collection(collection).get()
        .then(querySnapshot => {
            console.log("get() method resolved ");
            querySnapshot.forEach(doc => {
                allDocs.push({id: doc.id, data: doc.data()});
            });
            res.sendObj = { success:true, data: allDocs};
            return next();
        })
        .catch(err => {
            console.log("Failed to get document", err);
            res.sendObj = { success: false, message: "Internal Server Error"+err};
            return next();
        })
}

module.exports = {
    checkRead,
    checkUpdate,
    checkWrite,
    verifyToken,
    ensureMobile,
    ensureToken,
    login,
    getDoc,
    addDoc,
    getAllDocs
}