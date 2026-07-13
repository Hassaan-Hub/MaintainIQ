import { auth } from '/js/firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { showToast } from '/js/utils.js';

onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = '/dashboard.html';
});

const form = document.getElementById('loginForm');
const btn = document.getElementById('loginBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    await signInWithEmailAndPassword(auth, email, password);
    showToast('Login successful!', 'success');
    setTimeout(() => { window.location.href = '/dashboard.html'; }, 800);
  } catch (err) {
    console.error(err);
    let msg = 'Login failed. Check your credentials.';
    if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
    if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
    if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
    showToast(msg, 'error');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});
