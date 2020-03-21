 var fetchAllDocs = (db, collection) => {
    var data = [];
    const query = new Promise((resolve, reject) => {
        db.collection(collection).get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    data.push(doc.data());
                });
                console.log({ data });
                resolve({ data });
                return;
            })
            .catch(err => {
                console.log(err);
                reject(err);
                return;
            });
    })
        .catch(err => {
            console.log(err);
        });
    return query;
}

var fetchOneDoc = (db, collection, document) => {
    const query = new Promise((resolve, reject) => {
        db.collection(collection).doc(document).get()
            .then(doc => {
                if(!doc.exists){
                    console.log("Document does not exist");
                    reject(new Error("Document does not exist"));
                    return;
                }
                else{
                    data = [];
                    data.push(doc.data());
                    console.log(doc.data());
                    resolve({ data });
                    return;
                }
            })
            .catch(err => {
                console.log(err);
                reject(err);
                return;
            });
    })
        .catch(err => {
            console.log(err);
        });
    return query;
}

var setDoc = (db, collection, document, info, isMerge) => {
    const query = new Promise((resolve, reject) => {
        var setNewDoc = db.collection(collection).doc(document).set(info, {merge: isMerge});
        resolve(true);
        return;
    })
        .catch(err => {
            console.log(err);
        });
    return query;
}

var updateDoc = (db, collection, document, info) => {
    const query = new Promise((resolve, reject) => {
        var updateDoc = db.collection(collection).doc(document).update(info);
        resolve(true);
        return;
    })
        .catch(err => {
            console.log(err);
        });
    return query;
}

var newDoc = (db, collection, document, info) => {
    const query = new Promise((resolve, reject) => {
        if(!document) {
            var addDoc = db.collection(collection).add(info)
            .then(ref => {
                console.log(ref.id);
                resolve(ref.id);
                return;
            });
        }
        else {
            db.collection(collection).doc(document).set(info);
            console.log(document);
            resolve(document);
            return;
        }
        var newDoc = db.collection(collection).doc(document);
        var setOptions = setNewDoc.set(info, {merge: isMerge});
        resolve(true);
        return;
    })
        .catch(err => {
            console.log(err);
        });
    return query;
}

module.exports = { fetchAllDocs, fetchOneDoc, setDoc, updateDoc, newDoc };