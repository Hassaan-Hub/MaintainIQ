import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDTGvL19AnOktVXHWoArmaeKWHQYVYwNDo",
  authDomain: "hackathon-5ba12.firebaseapp.com",
  projectId: "hackathon-5ba12",
  storageBucket: "hackathon-5ba12.firebasestorage.app",
  messagingSenderId: "16157655575",
  appId: "1:16157655575:web:3451eb4ece63a99cf15252",
  measurementId: "G-SV9D1DEZ4R"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)





const sName = document.getElementById('sName');
const sEmail = document.getElementById('sEmail');
const sPassword = document.getElementById('sPassword');
const sProfession = document.getElementById('sProfession');
const sSignupBtn = document.getElementById('sSignupBtn');


