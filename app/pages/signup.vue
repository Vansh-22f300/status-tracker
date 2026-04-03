<template>
  <div class="Signup-page">
    <div class="signup-card">
      <div class="header">
      <h1>Join Status Tracker</h1>
      <p>Create an account to get started.</p>
      </div>
      <form class="form-fields" @submit.prevent="handleSignup">
        <label>Name:<input id="form-name" v-model="name" type="text" placeholder="Full Name" required />
        </label>
        <label>Email:
          <input id="form-email" v-model="email" type="email" placeholder="Email" required />
        </label>

       <label>Password:
          <input id="form-pass" v-model="password" type="password" placeholder="Password" required />
        </label> 
              <button type="submit" class="signup-btn">Sign Up</button>

      </form>

      <p class="error-text">{{ error }}</p>
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
import { auth } from "../../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";

const name = ref("");
const email = ref("");
const password = ref("");
const error = ref("");

const handleSignup = async () => {
  error.value = "";
  try {
    const userCreds = await createUserWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value,
    );
    navigateTo("/");
    console.log("signup succesfull", userCreds.user);
  } catch (err) {
    error.value = err.message;
    console.error("signup failed", err);
  }
};
</script>

<style scoped>
.Signup-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.header{
  text-align: center;
  margin-bottom: 20px;
}
.signup-card {
  background-color: white;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 350px;
  /* text-align: center; */
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.signup-btn {
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.signup-btn:hover {
  background-color: #30a936;
}

.error-text {
  color: red;
  margin-top: 1rem;
}

.login-link {
  margin-top: 10px;
  color: #555;
  cursor: pointer;
}

.login-link:hover {
  color: rgb(81, 73, 58);
}
</style>
