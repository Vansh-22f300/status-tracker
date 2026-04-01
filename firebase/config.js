// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9Qicz10qFlBx89w5GJSHEbfQ5rXzPv0s",
  authDomain: "status-tracker-map-c.firebaseapp.com",
  projectId: "status-tracker-map-c",
  storageBucket: "status-tracker-map-c.firebasestorage.app",
  messagingSenderId: "901971458757",
  appId: "1:901971458757:web:fd41b09dc56bf9ccdc0eac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);