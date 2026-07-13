import { auth } from '/js/firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { showToast } from '/js/utils.js';

window.addEventListener('pageshow', (e) => {
  if (e.persisted) sessionStorage.removeItem('_redirect_ts');
});

function safeRedirect(url) {
  const now = Date.now();
  const last = parseInt(sessionStorage.getItem('_redirect_ts') || '0', 10);
  if (now - last < 2000) {
    console.error('[login] Redirect loop blocked — last redirect', Math.round(now - last), 'ms ago. Target:', url);
    return;
  }
  sessionStorage.setItem('_redirect_ts', String(now));
  window.location.replace(url);
}

auth.authStateReady().then(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    unsub();
    if (user) {
      console.log('[login] Already signed in as', user.email, '— redirecting to dashboard');
      safeRedirect('/dashboard.html');
    }
  });
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
    console.log('[login] Sign-in successful — redirecting to dashboard');
    safeRedirect('/dashboard.html');
  } catch (err) {
    console.error('[login] Sign-in error:', err.code, err.message);
    let msg = 'Login failed. Check your credentials.';
    if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
    if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
    if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
    showToast(msg, 'error');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});
