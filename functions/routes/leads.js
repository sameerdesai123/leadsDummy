// Imports
const express = require('express');
const router = express.Router();
var sha1 = require('sha1');
const {checkRead, checkUpdate, checkWrite, verifyToken, ensureMobile,ensureAccAndStatus, ensureToken, login, getDoc, addDoc, getAllDocs, getAssociatedLeads, scheduleAlerts } = require('../models/db-functions');
require('dotenv').config();
// Middleware
router.use(express.json(process.env.LEADS));

// Middleware Functions 
const setCollectionName = async (req, res, next) => {
    console.log("Setting Collection Name");
    res.collection = 'leads';
    return next();
}

// take document id from request body
const setDocumentName = async (req, res, next) => {
    console.log("setting document name");
    res.document = res.decrypt.document;
    return next();
}

// take document id from request body
const setDocumentNameFromBody = async(req, res, next) => {
    console.log("setting Document name");
    res.document = req.body.document;
    if (typeof res.document  === 'undefined'){
        res.json({ success: false, message: "User document id not passed"});
    }
    return next();
}

// Format and structure data before inserting
const setDocData = async (req, res, next) => {
    console.log("Setting body of Document");
    res.docBody = req.body;
    res.scheduler = {}
    if(typeof res.docBody.Account_Executive === 'undefined'){
        res.json({success:false, message: "Assigned_To property missing"})
        res.end();
    }
    res.docBody.Received_Date =  new Date(Date.now()) // new Date(res.docBody.Received_Date);
    res.scheduler.Alert_Date = alert_date(res.docBody.Received_Date, res.docBody.Status);
    res.docBody.Target_Date = new Date(res.scheduler.Alert_Date);
    res.scheduler.user = res.docBody.Account_Executive; // Get the user name
    console.log("Lead Body : -------------------------\n", res.docBody, "\n-----------------------------");
    return next();
}

const alert_date = (Received_Date, Status) => {
    if(Status === 'Discovery'){
        Received_Date.setHours( Received_Date.getHours() + 12 );
        return new Date(Received_Date.setDate(Received_Date.getDate() + 5 ))
    }else if(Status === 'Demo'){
        Received_Date.setHours( Received_Date.getHours() + 12 );
        return new Date(Received_Date.setDate(Received_Date.getDate() + 10 ))
    }else if(Status === 'Proposal'){
        Received_Date.setHours( Received_Date.getHours() + 12 );
        return new Date(Received_Date.setDate(Received_Date.getDate() +  10))
    }else if(Status ===  'SubmissionToSales'){
        Received_Date.setHours( Received_Date.getHours() + 12 );
        return new Date(Received_Date.setDate(Received_Date.getDate() + 15 ))
    }else if(Status ===  'Confirmed'){
        Received_Date.setHours( Received_Date.getHours() + 12 );
        return new Date(Received_Date.setDate(Received_Date.getDate() + 5 ))
    }else{ // For testing
       // Received_Date.setDate(Received_Date.getDate() - 2 )
        Received_Date.setMinutes( Received_Date.getMinutes() + 2 );
        console.log("Alert Date : ",  Received_Date);
        return Received_Date
    }
}

//Routes

router.get('/my-leads', ensureToken, verifyToken, setCollectionName, setDocumentName, getAssociatedLeads, (req, res, next) => {
    console.log("Response : ", res.sendObj);
    res.collection = '';
    res.document ='';
    res.decrypt = '';
    res.json(res.sendObj);    
});

router.get('/all-leads', ensureToken, verifyToken, checkRead, setCollectionName, getAllDocs, (req, res, next) => {
    console.log("Response : ", res.sendObj);
    res.collection = '';
    res.document ='';
    res.decrypt = '';
    res.json(res.sendObj);   
})

router.post('/create', ensureToken, ensureAccAndStatus, verifyToken, checkWrite, setCollectionName, setDocData, addDoc, scheduleAlerts, (req, res, next) => {
    console.log("Response : ", res.sendObj);
    res.collection = '';
    res.document ='';
    res.decrypt = '';
    res.json(res.sendObj);    
});

router.get('/one', ensureToken, verifyToken, checkRead, setCollectionName, setDocumentNameFromBody, getDoc, (req, res, next) => {
    console.log("Response : ", res.sendObj);
    res.collection = '';
    res.document ='';
    res.decrypt = '';
    res.json(res.sendObj);    
});

module.exports = router;
