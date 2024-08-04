// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGLhsne7NghP6ZqgqtXL4M3AU2gqT0txg",
  authDomain: "pantry-manager-2d83d.firebaseapp.com",
  projectId: "pantry-manager-2d83d",
  storageBucket: "pantry-manager-2d83d.appspot.com",
  messagingSenderId: "57920703218",
  appId: "1:57920703218:web:45c1a121c64baee5419e6b",
  measurementId: "G-5QVX78G4VN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export const auth = getAuth(app);
export { firestore };

