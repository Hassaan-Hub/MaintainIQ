import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
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




function signupFunction(name, email, password, profession) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        password: password,
        profession: profession
      })
        .then(() => {
          console.log("Record have save in Database");
        })
        .catch(() => {
          console.log("Record have error in Database");
        })

      // window.location.href = "/login.html"
      console.log(user, "--> signup successfully");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
    });
}



function loginFunction(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      window.location.href = "/newfile.html"
      console.log(user, "--> login successfully");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
    });
}


function toGetLoggedInUser() {
  onAuthStateChanged(auth, (user) => {
    console.log("--> kya user mila??");
    
    if (user) {
      const uid = user.uid;
      console.log(uid, "--> user uid");
      console.log(window.location, '--> window location');
      
      if(window.location.pathname !== "/newfile.html") {
        window.location = "/newfile.html"
      }

    } else {
      console.log('--> user is not login ');
      
      window.location = "/login.html"
    }
  });
}


async function getSingleUserDetails(uniqueId) {

  const docRef = doc(db, "users", uniqueId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }
}


async function getAllDetails() {
  const q = query(collection(db, "users"));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
  });
}


export {
  signupFunction,
  loginFunction,
  getSingleUserDetails,
  getAllDetails,
  toGetLoggedInUser,
}