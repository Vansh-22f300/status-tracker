<template>
    <div class="login-page">
        <div class="login-card">
            <h1>Status Tracker</h1>
            <p>Sign in to continue.</p>
            <button type="submit" class="google-btn" @click="handleGoogleLogin" >
                Continue with Google
            </button>
            <form class="form-fields" @submit.prevent="handleEmailLogin">
                <input id="form-email" v-model="email" type="email" placeholder="Email" required />
                <input id="form-pass" v-model="password" type="password" placeholder="Password" required />
                <button type="button" class="reset-pass">Reset Password</button>
                <button type="submit" class="login-btn">Login</button>
            </form>
            <p v-if="error" class="error-text">{{ error }}</p>
            <NuxtLink to="/signup" class="signup-link">
                Don't have an account yet?
            </NuxtLink>
        </div>
        <div></div>
    </div>
</template>
<script setup>
definePageMeta({
  layout: 'auth',
})
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { useRouter } from 'vue-router'
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";


const email = ref('')
const password = ref('')
const error = ref('')

const handleEmailLogin = async () => {
    error.value = ''
    try {
        const userCreds = await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
        navigateTo('/')
        console.log("login succesfull", userCreds.user)
        
    } catch (err) {
        error.value = err.message
        console.error("login failed", err)
    } 
}
const handleGoogleLogin= async()=>{
   try {
        const provider = new GoogleAuthProvider();
        const googleCreds = await signInWithPopup(auth, provider)
        navigateTo('/')
        console.log("Google login succesfull", googleCreds.user)
        
    } catch (err) {
        error.value = err.message
        console.error("login failed", err)
    } 

}
</script>
<style scoped>
.login-page {
    min-height: 100vh;
    display: grid;
    align-items:center;
    justify-items:center;
    left:50%;
    background: linear-gradient(135deg, #f6f4e9 0%, #e9f1e5 100%);
}

.login-card {
    width: 420px;
    padding: 32px;
    border-radius: 16px;
    /* background: #ffffff; */
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
    text-align: center;
}


.login-btn {
    /* width: 100%; */
    border-radius: 10px;
    padding: 15px;
    background: #019323;
    color: #4f4f4f;
    font-size: 16px;
    cursor: pointer;
}
.google-btn {
    border-radius: 10px;
    padding: 15px;
    background: #c59889;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
    border: 1px solid #e8e4dc;
    cursor:pointer;
}
.form-fields{
    /* background-color:pink; */
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
}

.error-text {
    margin-top: 12px;
    color: #b00020;
}

.success-text {
    margin-top: 12px;
    color: #1c8434;
}
</style>