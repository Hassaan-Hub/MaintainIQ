import { loginFunction } from "./confige/firebase.js";


const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", () => {
    loginFunction(email.value, password.value)
})