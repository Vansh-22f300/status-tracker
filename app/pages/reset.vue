<template>
  <div class="reset-page">
    <div class="reset-card">
      <h1>Reset Password</h1>
      <p>Enter your account email to receive a reset link.</p>
      <form class="form-fields" @submit.prevent="handleResetPassword">
        <label for="reset-email" class="field-label">Email</label>
        <input
          id="reset-email"
          v-model="resetEmail"
          type="email"
          placeholder="Enter your email..."
          required
        />
        <button type="submit" class="send-btn" :disabled="isLoading">
          {{ isLoading ? "Sending..." : "Send Reset Link" }}
        </button>
      </form>
      <p v-if="error" class="error-text">{{ error }}</p>
      <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
      <NuxtLink to="/login" class="back-link">Back to Login</NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "auth",
});

import { ref } from "vue";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";

const resetEmail = ref("");
const error = ref("");
const successMessage = ref("");
const isLoading = ref(false);

const handleResetPassword=async ()=> {
  if (!resetEmail.value) {
    error.value = "Please enter your email address";
    successMessage.value = "";
    return;
  }
  
  if (isLoading.value) return;
  isLoading.value = true;
  error.value ="";
  successMessage.value ="";

  try {
    await sendPasswordResetEmail(auth, resetEmail.value);
    successMessage.value = "Reset password email sent.";
    
  } catch (err) {
    error.value = err.message;
    console.log("Reset error", err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.reset-page {
  min-height:100vh;
  display:grid;
  align-items:center;
  justify-items:center;
}

.reset-card {
  width:420px;
  padding:32px;
  border-radius:15px;
  background: #fff8ef;
  border:1px solid rgba(145, 96, 42, 0.18);
  text-align:center;
}
.form-fields {
  display:flex;
  flex-direction:column;
  gap:15px;
  margin-top:20px;
}

.field-label {
  text-align:left;
  font-size:14px;
  font-weight:700;
  color: #444444;
}

.form-fields input {
  padding: 12px 12px;
  border-radius: 10px;
  border:1px solid #b9aa96;
}

.send-btn {
  width: 60%;
  border-radius:10px;
  padding:12px;
  background: #019323;
  color: #ffffff;
  font-size:16px;
  cursor:pointer;
  border:none;
  align-self: center;
  margin-bottom:12px;
}

.send-btn:hover {
  opacity:0.8;
}

.send-btn:disabled {
  opacity:0.7;
  cursor:not-allowed;
}

.error-text {
  margin-top:12px;
  color: #b00020;
}

.success-text {
  margin-top:12px;
  color: #1c8434;
  font-weight:600;
}

.back-link {
  color: #3c3c3c;
  text-decoration:none;
  font-weight:600;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
