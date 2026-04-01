<template>
    <div class="login-page">
        <div class="login-card">
            <h1>Status Tracker</h1>
            <p>Sign in to continue.</p>
            <button :disabled="loading" @click="signInWithGoogle">
                {{ loading ? 'Signing in...' : 'Continue with Google' }}
            </button>
            <p v-if="error" class="error">{{ error }}</p>
        </div>
        <div></div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { auth } from '../../firebase/config'

const router = useRouter()
const loading = ref(false)
const error = ref('')

onMounted(() => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            router.push('/')
        }
    })
})

const signInWithGoogle = async () => {
    loading.value = true
    error.value = ''

    try {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
        router.push('/')
    } 
    catch (err) {
        error.value = err?.message || 'Unable to sign in. Please try again.'
    }
     finally {
        loading.value = false
    }
}
signOut(auth).then(() => {
  // Sign-out successful.
}).catch((error) => {
  // An error happened.
});
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    display: grid;
    align-items:center;
    justify-items:center;
    left:50%;
    /* place-items: center; */
    background: linear-gradient(135deg, #f6f4e9 0%, #e9f1e5 100%);
}

.login-card {
    width: min(420px, 92vw);
    padding: 2rem;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
    text-align: center;
}

h1 {
    margin: 0;
}

p {
    color: #4f4f4f;
}

button {
    width: 100%;
    border: none;
    border-radius: 10px;
    padding: 0.85rem 1rem;
    background: #235b37;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
}

button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.error {
    margin-top: 0.75rem;
    color: #b00020;
}
</style>