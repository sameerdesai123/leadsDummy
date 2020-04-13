const express = require('express');
const router = express.Router();
require('dotenv').config()

const {checkRead, verifyToken, ensureToken, getDoc, getAllDocs } = require('../models/db-functions');

var setCollec = (req, res, next) => {
    res.collection  = 'master';
    next();
}

router.get('/', ensureToken, verifyToken, checkRead, setCollec, getAllDocs, (req, res, next) => {
    try{
        res.json(res.sendObj);
    }catch(err){
        res.json({ success: false, message: "Data Retrival Failed"})
    }
});

module.exports = router;