import { auth, db, storage } from './firebaseConfig'
import { collection, query, where, getDocs, getDoc, setDoc, addDoc, updateDoc, doc, limit, orderBy } from "firebase/firestore";




// Groups
// export async function writeNewProduct(name, price, measurement, description, org) {
//     const docRef = await addDoc(collection(db, 'products'), {
//         name: name,
//         price: price,
//         measurement: measurement,
//         description: description,
//         dateAdded: new Date(),
//         dateDeactivated: null,
//         org: org
//     })
//     return docRef.id;
// }

// export async function editProduct(name, price, measurement, description, docID) {
//     let updateRef = await updateDoc(doc(db, `products/${docID}`), {
//         name: name,
//         price: price,
//         measurement: measurement,
//         description: description
//     });

//     return updateRef;
// }

// export async function readAllProducts(org) {
//     const q = query(collection(db, "products"), where("dateDeactivated", "==", null), where("org", "==", org), orderBy("name"))
//     const querySnapshot = await getDocs(q)
//     let products = [];
//     querySnapshot.forEach((doc) => {
//         let productData = doc.data()
//         productData['docID'] = doc.id
//         products.push(productData)
//     });
//     return products;
// }

// export async function deactivateProduct(docID) {
//     let deactivateRef = await updateDoc(doc(db, `products/${docID}`), {
//         dateDeactivated: new Date()
//     });

//     return deactivateRef;
// }



// Times
export async function writeNewTime(uid, groupID, startTime) {
    const startYear = startTime.getFullYear();
    const startMonth = startTime.getMonth() + 1;
    const startDay = startTime.getDate();

    const docRef = await addDoc(collection(db, 'tasks'), {
        startTime: startTime,
        endTime: null,
        groupID: groupID,
        uid: uid,
        startYear: startYear,
        startMonth: startMonth,
        startDay: startDay
    })
    return docRef.id;
}

export async function editProduct(name, price, measurement, description, docID) {
    let updateRef = await updateDoc(doc(db, `products/${docID}`), {
        name: name,
        price: price,
        measurement: measurement,
        description: description
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

export async function deactivateProduct(docID) {
    let deactivateRef = await updateDoc(doc(db, `products/${docID}`), {
        dateDeactivated: new Date()
    });

    return deactivateRef;
}