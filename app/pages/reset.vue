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
          {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
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
  layout: 'auth'
});

import { ref } from 'vue';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';

const resetEmail = ref('');
const error = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const handleResetPassword = async () => {
  if (!resetEmail.value) {
    error.value = 'Please enter your email address';
    successMessage.value = '';
    return;
  }

  if (isLoading.value) return;
  isLoading.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    await sendPasswordResetEmail(auth, resetEmail.value);
    successMessage.value = 'Reset password email sent.';
  } catch (err) {
    error.value = err.message;
    // console.log("Reset error", err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.reset-page {
  min-height: 100vh;
  display: grid;
  align-items: center;
  justify-items: center;
  padding: var(--space-5);
}

.reset-card {
  width: min(420px, 100%);
  padding: 32px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  text-align: center;
}

.reset-card h1 {
  font-size: 30px;
  color: var(--color-text);
}

.reset-card p {
  color: var(--color-text-muted);
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
  font-weight: 700;
  color: var(--color-text);
}

.form-fields input {
  padding: 12px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-strong);
}

.send-btn {
  width: 60%;
  border-radius: var(--radius-sm);
  padding: 12px;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  align-self: center;
  margin-bottom: 12px;
  transition: background-color var(--transition-base);
}

.send-btn:hover {
  background: var(--color-primary-strong);
}

.send-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-text {
  margin-top: 12px;
  color: #b00020;
}

.success-text {
  margin-top: 12px;
  color: var(--color-primary-strong);
  font-weight: 600;
}

.back-link {
  color: var(--color-text);
  text-decoration: none;
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .reset-page {
    padding: 20px;
  }
  .reset-card {
    width: 100%;
    padding: 24px;
    border-radius: 12px;
  }
  .reset-card h1 {
    margin-bottom: 8px;
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

  .send-btn {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    margin-bottom: 10px;
  }

  .error-text,
  .success-text {
    font-size: 12px;
    margin-top: 10px;
  }

  .back-link {
    font-size: 13px;
  }
}
</style>
