// Imports
const express = require('express');
const router = express.Router();
var sha1 = require('sha1');
const {checkRead, checkUpdate, checkWrite, verifyToken, ensureMobile, ensureToken, login, getDoc, addDoc, getAllDocs } = require('../models/db-functions');

// Middleware
router.use(express.json());

// Middleware Functions 
const setCollectionName = async (req, res, next) => {
    console.log("Setting Collection Name");
    res.collection = 'users';
    return next();
}

const setDocumentName = async (req, res, next) => {
    console.log("setting document name");
    res.document = res.decrypt.document;
    return next();
}

const setDocumentNameFromBody = async(req, res, next) => {
    console.log("setting Document name");
    res.document = req.body.document;
    if (typeof res.document  === 'undefined'){
        res.json({ success: false, message: "User document id not passed"});
    }
    return next();
}

const newDocName = async(req, res, next) => {
    console.log("Generating new document name");
    res.document = sha1(req.body.mobile);
    return next();
}

const setDocData = async (req, res, next) => {
    console.log("Setting body of Document");
    res.docBody = req.body;
    return next();
}

//Routes

router.post('/login',setCollectionName, ensureMobile, login, async (req,res, next) => {
    console.log("Response : ", res.sendObj);
    res.collection = '';
    res.json(res.sendObj);
});

router.get('/details', ensureToken, verifyToken, setCollectionName, setDocumentName, getDoc, (req, res, next) => {
    console.log("Response : ", res.sendObj);
    res.collection = '';
    res.document ='';
    res.decrypt = '';
    res.json(res.sendObj);    
});

router.get('/all', ensureToken, verifyToken, checkRead, setCollectionName, getAllDocs, (req, res, next) => {
    console.log("Response : ", res.sendObj);
    res.collection = '';
    res.document ='';
    res.decrypt = '';
    res.json(res.sendObj);   
})

router.post('/create', ensureToken, ensureMobile, verifyToken, checkWrite, setCollectionName, newDocName, setDocData, addDoc, (req, res, next) => {
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
