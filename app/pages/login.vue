<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Status Tracker</h1>
      <p>Sign in to continue.</p>
      <button
        type="button"
        class="gsi-material-button"
        :disabled="isLoading"
        @click="handleGoogleLogin"
      >
        <div class="gsi-material-button-state"></div>
        <div class="gsi-material-button-content-wrapper">
          <div class="gsi-material-button-icon">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              style="display: block"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              ></path>
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              ></path>
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              ></path>
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              ></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          </div>
          <span class="gsi-material-button-contents">Sign in with Google</span>
          <span style="display: none">Sign in with Google</span>
        </div>
      </button>
      <form class="form-fields" @submit.prevent="handleEmailLogin">
        <label for="form-email" class="field-label">Email</label>
        <input
          id="form-email"
          v-model="email"
          type="email"
          placeholder="Enter your email..."
          required
        />
        <label for="form-pass" class="field-label">Password</label>
        <input
          id="form-pass"
          v-model="password"
          type="password"
          placeholder="Enter your Password..."
          required
        />
        <div class="reset-row">
          <NuxtLink to="/reset" class="reset-pass">Reset Password</NuxtLink>
        </div>
        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? "Logging in..." : "Login" }}
        </button>
      </form>

      <p v-if="error" class="error-text">{{ error }}</p>
      <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
      <NuxtLink to="/signup" class="signup-link">
        Don't have an account yet? Create one
      </NuxtLink>
    </div>
    <div></div>
  </div>
</template>
<script setup>
definePageMeta({
  middleware: ["auth"],
  layout: "auth",
});
import { ref } from "vue";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const email = ref("");
const password = ref("");
const error = ref("");
const successMessage = ref("");
const isLoading = ref(false);

const handleEmailLogin = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  error.value = "";
  successMessage.value = "";
  try {
    const userCreds = await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value,
    );
    successMessage.value = "Login Successful...";
  } catch (err) {
    successMessage.value = "";
    error.value = err.message;
    console.error("login failed", err);
  } finally {
    isLoading.value = false;
  }
};
const handleGoogleLogin = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  error.value = "";
  successMessage.value = "";
  try {
    const provider = new GoogleAuthProvider();
    const googleCreds = await signInWithPopup(auth, provider);
    successMessage.value = "Login Successful...";
  } catch (err) {
    successMessage.value = "";
    error.value = err.message;
    console.error("login failed", err);
  } finally {
    isLoading.value = false;
  }
};
</script>
<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  align-items: center;
  justify-items: center;
  left: 50%;
}

.login-card {
  width: 420px;
  padding: 32px;
  border-radius: 16px;
  background: #fff8ef;
  border: 1px solid rgba(145, 96, 42, 0.18);
  box-shadow: 0 24px 45px rgba(81, 55, 27, 0.16);
  text-align: center;
}

.login-btn {
  width: 60%;
  border-radius: 10px;
  padding: 15px;
  background: #019323;
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  border: none;
  align-self: center;
}
.login-btn:hover {
  background: #019323;
  opacity: 0.8;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.gsi-material-button {
  width: 60%;
  margin: 20px auto 0;
  border: none;
  border-radius: 20px;
  background: transparent;
  cursor: pointer;
  padding: 0;
  position: relative;
  overflow: hidden;
}
.gsi-material-button:hover {
  transform: translateY(1px);
}
.gsi-material-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.gsi-material-button .gsi-material-button-state {
  transition: opacity 0.2s ease;
  background-color: #303030;
  opacity: 0;
  position: absolute;
  inset: 0;
}

.gsi-material-button .gsi-material-button-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #ffffff;
  border: 1px solid #747775;
  border-radius: 20px;
  height: 44px;
  padding: 0 14px;
  box-sizing: border-box;
  box-shadow:
    0 1px 2px rgba(60, 64, 67, 0.3),
    0 1px 3px rgba(60, 64, 67, 0.15);
}

.gsi-material-button .gsi-material-button-icon {
  height: 20px;
  width: 20px;
  margin-right: 12px;
  min-width: 20px;
}

.gsi-material-button .gsi-material-button-contents {
  color: #1f1f1f;
  font-family: "Roboto", "Segoe UI", sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.25px;
}

.gsi-material-button:hover .gsi-material-button-state {
  opacity: 0.04;
}

.gsi-material-button:active .gsi-material-button-state {
  opacity: 0.1;
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
}

.form-fields input::placeholder {
  color: #000000;
  /* opacity: 1; */
}

.reset-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.reset-pass {
  width: auto;
  padding: 0;
  border: none;
  background: transparent;
  color: #4f4f4f;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
}
.reset-pass:hover {
  color: #000000;
  text-decoration: underline;
}

.signup-link {
  display: inline-block;
  margin-top: 14px;
  color: #3c3c3c;
  text-decoration: none;
  font-weight: 600;
}

.signup-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.error-text {
  margin-top: 12px;
  color: #b00020;
}

.success-text {
  margin-top: 12px;
  color: #1c8434;
  font-weight: 600;
}

@media (max-width: 768px) {
  .login-page {
    padding:20px;
  }
  
  .login-card {
    width:100%;
    padding:24px;
    border-radius:12px;
  }
  
  .gsi-material-button {
    width: 100%;
  }
  .gsi-material-button .gsi-material-button-content-wrapper {
    padding:0 12px;
    height:40px;    
  }
  .gsi-material-button .gsi-material-button-icon {
    height:18px;
    width:18px;
    margin-right:10px;
    min-width:18px;
  }
  .form-fields {
    gap: 12px;
    margin-top:16px;
  }
  
  .field-label {
    font-size:13px;
    margin-bottom:-6px;
  }
  
  .form-fields input {
    padding:10px 12px;
    font-size:14px;
  }
  
  .reset-pass {
    font-size:12px;
  }
  
  .login-btn {
    width:100%;
    padding:12px;
    font-size: 14px;
  }
  
  .signup-link {
    font-size: 13px;
    margin-top:10px;
  }
  
  .error-text,
  .success-text {
    font-size:12px;
  }

}


</style>
