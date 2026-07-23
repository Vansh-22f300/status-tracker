<template>
  <div class="signup-page">
    <div class="signup-card">
      <div class="header">
        <h1>Join Status Tracker</h1>
        <p>Create an account to get started.</p>
      </div>
      <form class="form-fields" @submit.prevent="handleSignup">
        <label for="form-name" class="field-label">Name</label>
        <input
          id="form-name"
          v-model="name"
          type="text"
          placeholder="Full Name"
          required
        />
        <label for="form-email" class="field-label">Email</label>
        <input
          id="form-email"
          v-model="email"
          type="email"
          placeholder="Email"
          required
        />
        <label for="form-pass" class="field-label">Password</label>
        <input
          id="form-pass"
          v-model="password"
          type="password"
          placeholder="Password"
          required
        />
        <label for="form-confirm-pass" class="field-label"
          >Confirm Password</label
        >
        <input
          id="form-confirm-pass"
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          required
        />
        <button type="submit" class="signup-btn" :disabled="isLoading">
          {{ isLoading ? 'Creating account...' : 'Sign Up' }}
        </button>
      </form>

      <p v-if="error" class="error-text">{{ error }}</p>
      <NuxtLink to="/login" class="login-link">
        Already have an account? Log in
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth'
});
import { ref } from 'vue';
import { auth, db } from '../../firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const isLoading = ref(false);
import {
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

const handleSignup = async () => {
  if (isLoading.value) return;

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    const emailTrimmed = email.value.trim();

    const userCreds = await createUserWithEmailAndPassword(
      auth,
      emailTrimmed,
      password.value
    );

    const user = userCreds.user;

    await updateProfile(user, {
      displayName: name.value
    });

    await setDoc(doc(db, 'profiles', user.uid), {
      name: name.value,
      email: user.email,
      role: null,
      teamId: null,
      teamName: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // console.log("User + Profile created successfully", user);

    navigateTo('/welcome');
  } catch (err) {
    console.log('signup failed', err);

    if (err.code === "auth/email-already-in-use") {
      const { fetchSignInMethodsForEmail } = await import("firebase/auth");
      const methods = await fetchSignInMethodsForEmail(
        auth,
        email.value.trim(),
      );

      if (methods.includes("google.com")) {
        error.value =
          "This email is already linked with Google Sign-In. Please use the Google button to login.";
      } else {
        error.value =
          "An account with this email already exists. Try logging in instead.";
      }
      return;
    }
    if(err.code==="auth/password-does-not-meet-requirements"){
      error.value = "Password must contain at least 6 characters, a lower case character, a upper case character, and a special character.";
      return;
    }

    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  display: grid;
  align-items: center;
  justify-items: center;
  padding: var(--space-5);
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 30px;
  color: var(--color-text);
}

.header p {
  color: var(--color-text-muted);
}

.signup-card {
  width: min(420px, 100%);
  padding: 32px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.field-label {
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: -8px;
}

.form-fields input {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text);
}

.form-fields input::placeholder {
  color: var(--color-text-soft);
}

.signup-btn {
  width: 60%;
  align-self: center;
  border-radius: var(--radius-sm);
  padding: 15px;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.signup-btn:hover {
  background: var(--color-primary-strong);
}

.signup-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-text {
  margin-top: 12px;
  color: #b00020;
}

.login-link {
  display: block;
  margin-top: 14px;
  color: var(--color-text);
  text-decoration: none;
  font-weight: 600;
  text-align: center;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
