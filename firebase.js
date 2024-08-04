// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB62xNP7COMP03Taiwbm5MiEWdEpVAWUmc",
  authDomain: "pantrytracker-78347.firebaseapp.com",
  projectId: "pantrytracker-78347",
  storageBucket: "pantrytracker-78347.appspot.com",
  messagingSenderId: "588658501298",
  appId: "1:588658501298:web:11038ed1966c9e83aecbab",
  measurementId: "G-N5189D5B0L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export const auth = getAuth(app);
export { firestore };
