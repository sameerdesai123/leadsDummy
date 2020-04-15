var admin = require('./db-connect');

var db = admin.firestore();

var increment = admin.firestore.FieldValue.increment(1)
var decrement = admin.firestore.FieldValue.increment(-1)

var updateStage = async (req, res, next) => {
    try {
        var prevStage = res.prevStage;
        var newStage = res.newStage;
        var stageCountRef = db.collection('master').doc('StageCount');
    stageCountRef.update({ [prevStage] : decrement });
    stageCountRef.update({ [newStage] : increment });
    return next();
    }
    catch(err){
        console.log(err);
        res.send("Failed to increment Master");
        return res.end();
    }
}


var addStage = async (req, res, next) => {
    try {
        var stage = res.stage;
        var stageCountRef = db.collection('master').doc('StageCount');
        stageCountRef.update({ [stage] : increment })
        return next();
    }
    catch(err){
        console.log(err);
        res.send("Failed to increment Master");
        return res.end();
    }
}


var delStage = async (req, res, next) => {
    try {
        var stage = res.stage;
        var stageCountRef = db.collection('master').doc('StageCount');
        stageCountRef.update({ [stage] : decrement });
        return next();
    }
    catch(err){
        console.log(err);
        res.send("Failed to increment Master");
        return res.end();
    }
}


var addRegion = async (req, res, next) => {
    try {
        var region = res.region;
        var regionCountRef = db.collection('master').doc('Region');
        regionCountRef.update({ [region] : increment });
        return next();
    }
    catch(err){
        console.log(err);
        res.send("Failed to increment Master");
       return res.end();
    }
}

var addService = async (req, res, next) => {
    try {
        var service = res.service;
        var serviceCountRef = db.collection('master').doc('Services');
        serviceCountRef.update({ [service] : increment });
        return next();
    }
    catch(err){
        console.log(err);
        res.send("Failed to increment Master");
        return res.end();
    }
}

var delRegion = async (req, res, next) => {
    try {
        var region = res.region;
        var regionCountRef = db.collection('master').doc('Region');
        regionCountRef.update({ [region] : decrement })
        return next();
    }
    catch(err){
        console.log(err);
        res.send("Failed to decrement Master");
        return res.end();
    }
}


module.exports = {
    updateStage,
    addStage,
    delStage,
    addRegion,
    delRegion,
    addService
}