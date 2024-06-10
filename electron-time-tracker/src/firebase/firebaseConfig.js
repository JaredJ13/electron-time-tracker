// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyB2pC88XRDG4qppHXmqVqPPf0ojfaBwTug',
    authDomain: 'electron-time-tracker.firebaseapp.com',
    projectId: 'electron-time-tracker',
    storageBucket: 'electron-time-tracker.appspot.com',
    messagingSenderId: '878396100860',
    appId: '1:878396100860:web:8e28486eadeac3ccb1c779',
    measurementId: 'G-VB9PNSV4L5',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };