// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsgeJq_fqf8Lr3zyG3kRrjWoOF09BpHo8",
  authDomain: "dot-science.firebaseapp.com",
  projectId: "dot-science",
  storageBucket: "dot-science.firebasestorage.app",
  messagingSenderId: "684792917868",
  appId: "1:684792917868:web:ad795fe6b68e9417074d49",
  measurementId: "G-TE8SD7WDGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;