// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEjDlOhyqzZltDzQdgq7WpTNt3ZfFp-yE",
  authDomain: "investingnotesapp.firebaseapp.com",
  projectId: "investingnotesapp",
  storageBucket: "investingnotesapp.firebasestorage.app",
  messagingSenderId: "119431826827",
  appId: "1:119431826827:web:f1a4f35c60ea467c99738e",
  measurementId: "G-3WZ6Z8S53K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);