import { auth, db, storage } from './firebaseConfig'
import { collection, query, where, getDocs, getDoc, setDoc, addDoc, updateDoc, doc, limit, orderBy, deleteDoc } from "firebase/firestore";




// Groups
export async function writeNewGroup(uid, name, createdDate) {
    const docRef = await addDoc(collection(db, 'groups'), {
        uid: uid,
        name: name,
        createdDate: createdDate,
        active: true
    })
    return docRef.id;
}

// export async function editProduct(name, price, measurement, description, docID) {
//     let updateRef = await updateDoc(doc(db, `products/${docID}`), {
//         name: name,
//         price: price,
//         measurement: measurement,
//         description: description
//     });

//     return updateRef;
// }

export async function readAllGroups(uid) {
    const q = query(collection(db, "groups"), where("uid", "==", uid), orderBy("name"))
    const querySnapshot = await getDocs(q)
    let groups = [];
    querySnapshot.forEach((doc) => {
        let groupData = doc.data()
        groupData['docID'] = doc.id
        groups.push(groupData)
    });
    return groups;
}

// export async function deactivateProduct(docID) {
//     let deactivateRef = await updateDoc(doc(db, `products/${docID}`), {
//         dateDeactivated: new Date()
//     });

//     return deactivateRef;
// }



// Times
export async function writeNewTime(uid, groupDocID, startTime) {
    const startYear = startTime.getFullYear();
    const startMonth = startTime.getMonth() + 1;
    const startDay = startTime.getDate();

    const docRef = await addDoc(collection(db, 'tasks'), {
        startTime: startTime,
        endTime: null,
        groupDocID: groupDocID,
        uid: uid,
        startYear: startYear,
        startMonth: startMonth,
        startDay: startDay,
        endDay: null,
        endMonth: null,
        endYear: null,
        description: ''
    })
    return docRef.id;
}

export async function editTime(description, timeRange, docID) {
    const startYear = timeRange.startTime.getFullYear();
    const startMonth = timeRange.startTime.getMonth() + 1;
    const startDay = timeRange.startTime.getDate();
    let endYear = null;
    let endMonth = null;
    let endDay = null;

    if (timeRange.endTime) {
        endYear = timeRange.endTime.getFullYear();
        endMonth = timeRange.endTime.getMonth() + 1;
        endDay = timeRange.endTime.getDate();
    }

    let updateRef = await updateDoc(doc(db, `tasks/${docID}`), {
        description: description,
        startTime: timeRange.startTime,
        startDay: startDay,
        startMonth: startMonth,
        startYear: startYear,
        endTime: timeRange.endTime,
        endDay: endDay,
        endMonth: endMonth,
        endYear: endYear
    });

    return updateRef;
}

export async function endTime(endTime, docID) {
    const endYear = endTime.getFullYear();
    const endMonth = endTime.getMonth() + 1;
    const endDay = endTime.getDate();

    let updateRef = await updateDoc(doc(db, `tasks/${docID}`), {
        endTime: endTime,
        endDay: endDay,
        endMonth: endMonth,
        endYear: endYear
    });

    return updateRef;
}

export async function readAllTimes(uid, currentDay) {
    const startYear = currentDay.getFullYear();
    const startMonth = currentDay.getMonth() + 1;
    const startDay = currentDay.getDate();

    const q = query(collection(db, "tasks"), where("uid", "==", uid), where("startYear", "==", startYear), where("startMonth", "==", startMonth), where("startDay", "==", startDay), orderBy("startTime"));
    const querySnapshot = await getDocs(q)
    let times = [];
    querySnapshot.forEach((doc) => {
        let timeData = doc.data()
        timeData['docID'] = doc.id
        timeData['startTime'] = doc.data().startTime ? doc.data().startTime.toDate() : null;
        timeData['endTime'] = doc.data().endTime ? doc.data().endTime.toDate() : null;
        times.push(timeData)
    });
    return times;
}

export async function deleteTime(docID) {
    let deactivateRef = await deleteDoc(doc(db, `tasks/${docID}`));

    return deactivateRef;
}