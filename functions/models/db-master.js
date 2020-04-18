var admin = require('./db-connect');

var db = admin.firestore();

var increment = admin.firestore.FieldValue.increment(1)
var decrement = admin.firestore.FieldValue.increment(-1)

var newLead = (stage, region, service) => {
    try{
    var stageCountRef = db.collection('master').doc('StageCount');
        stageCountRef.update({ [stage] : increment })
    var regionCountRef = db.collection('master').doc('Region');
        regionCountRef.update({ [region] : increment });
    var serviceCountRef = db.collection('master').doc('Services');
        serviceCountRef.update({ [service] : increment });
        console.log("onCreate Trigger Success");
        return true;
    }catch(err) {
        console.log("Failure onCreate Trigger : ", err);
        return false;
    }
}

var updateLead = (newValue, prevValue) => {
    try {
        var prevStage = prevValue.stage;
        var newStage = newValue.stage;
        var stageCountRef = db.collection('master').doc('StageCount');
    stageCountRef.update({ [prevStage] : decrement });
    stageCountRef.update({ [newStage] : increment });
    return true;    
    } catch (err) {
        console.log("Failed on updateLead Trigger : ", err);
        return false;
    }

}



module.exports = {
    newLead,
    updateLead
}