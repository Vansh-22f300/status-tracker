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
          {{ isLoading ? "Creating account..." : "Sign Up" }}
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
  layout: "auth",
});
import { ref } from "vue";
import { auth, db } from "../../firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
const { profile } = useUser();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const isLoading = ref(false);
import {
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";

const provider = new GoogleAuthProvider();

const handleSignup = async () => {
  if (isLoading.value) return;

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    const emailTrimmed = email.value.trim();

    const userCreds = await createUserWithEmailAndPassword(
      auth,
      emailTrimmed,
      password.value,
    );

    const user = userCreds.user;

    await updateProfile(user, {
      displayName: name.value,
    });

    await setDoc(doc(db, "profiles", user.uid), {
      name: name.value,
      email: user.email,
      role: null,
      teamId: null,
      teamName: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    profile.value = {
      name: name.value,
      email: user.email,
      role: null,
      teamId: null,
      teamName: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    navigateTo("/welcome");
  } catch (err) {
    console.error("signup failed", err);

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
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.signup-card {
  width: 420px;
  padding: 32px;
  border-radius: 16px;
  background: #fff8ef;
  border: 1px solid rgba(145, 96, 42, 0.18);
  box-shadow: 0 24px 45px rgba(81, 55, 27, 0.16);
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
  color: #444444;
  margin-bottom: -8px;
}

.form-fields input {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #b9aa96;
  background: #ffffff;
}

.form-fields input::placeholder {
  color: #6b6b6b;
}

.signup-btn {
  width: 60%;
  align-self: center;
  border-radius: 10px;
  padding: 15px;
  background: #019323;
  color: #ffffff;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

.signup-btn:hover {
  background: #019323;
  opacity: 0.7;
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
  color: #3c3c3c;
  text-decoration: none;
  font-weight: 600;
  text-align: center;
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .signup-page {
    padding: 20px;
  }
  .signup-card {
    width: 100%;
    padding: 24px;
    border-radius: 12px;
  }
  .header {
    margin-bottom: 16px;
  }
  .form-fields {
    gap: 12px;
    margin-top: 16px;
  }
  .field-label {
    font-size: 13px;
    margin-bottom: -6px;
  }
  .form-fields input {
    padding: 10px 12px;
    font-size: 14px;
  }
  .signup-btn {
    width: 100%;
    padding: 12px;
    font-size: 14px;
  }
  .error-text {
    font-size: 12px;
    margin-top: 10px;
  }

  .login-link {
    font-size: 13px;
    margin-top: 10px;
  }
}
</style>
