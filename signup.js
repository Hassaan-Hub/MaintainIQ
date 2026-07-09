import {
  signupFunction,
  getSingleUserDetails,
  getAllDetails,
  toGetLoggedInUser
}
  from "./confige/firebase.js";


toGetLoggedInUser()


const name = document.getElementById('name');
const email = document.getElementById('email');
const password = document.getElementById('password');
const profession = document.getElementById('profession');
const signupBtn = document.getElementById('signupBtn');
const getData = document.getElementById("getData");
const getAllData = document.getElementById("getAllData");


signupBtn.addEventListener("click", () => {
  signupFunction(name.value, email.value, password.value, profession.value)
})


getData.addEventListener("click", () => {
  getSingleUserDetails('0MB19dHuGCMGuTH7R6kfzvX4q5T2')
})

getAllData.addEventListener("click", () => {
  getAllDetails()
})