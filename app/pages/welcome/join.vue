<template>
  <div class="welcome-page">
    <div class="welcome-grid">
      <div class="back-btn" @click="navigateTo('/welcome')">← Back</div>
      <h2 class="field-label">Join a Team</h2>
      <p class="field-sub">Enter your team's join code:</p>
      <input
        type="text"
        class="field-input"
        v-model="joinCode"
        placeholder="Enter join code"
      />
      <p v-if="error" class="error">{{ error }}</p>
      <button @click="handleJoinTeam" class="join-btn" :disabled="isLoading">
        {{ isLoading ? 'Joining...' : 'Join Team' }}
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'welcome'
});
import { ref, onMounted } from 'vue';
import { db } from '../../../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  setDoc,
  doc,
  increment
} from 'firebase/firestore';

import { useToast } from 'vue-toastification';
const toast = useToast();
const { user, profile } = useUser();

const teamName = ref('');
const error = ref('');
const isLoading = ref(false);
const joinCode = ref('');
onMounted(() => {
  if (profile.value?.teamId) {
    navigateTo('/');
  }
});
async function handleJoinTeam() {
  error.value = '';
  if (!joinCode.value.trim()) {
    error.value = 'Enter Join Code';
    return;
  }
  isLoading.value = true;

  try {
    const q = query(
      collection(db, 'teams'),
      where('joinCode', '==', joinCode.value.trim())
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // error.value = "Invalid Join Code";
      toast.error('Invalid Join Code');
      isLoading.value = false;
      return;
    }
    const teamId = snapshot.docs[0].id;
    const teamName = snapshot.docs[0].data().name;
    await updateDoc(doc(db, 'profiles', user.value.uid), {
      role: 'Member',
      updatedAt: Date.now(),
      teamId: teamId,
      teamName: teamName
    });

    await updateDoc(doc(db, 'teams', teamId), {
      count: increment(1)
    });
    profile.value = {
      ...profile.value,
      role: 'Member',
      teamId: teamId,
      teamName: teamName
    };
    toast.success(`Joined team ${teamName} successfully`);
    navigateTo('/');
  } catch (err) {
    // console.error("fail to join team", err);
    error.value = err.message;
    toast.error('Failed to join team. Please try again.');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  display: grid;
  align-items: center;
  justify-items: center;
  padding: var(--space-5);
}
.welcome-grid {
  width: min(520px, 100%);
  margin: 0 auto;
  padding: 40px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.back-btn {
  cursor: pointer;
  color: var(--color-text-muted);
  font-weight: 600;
  margin-bottom: var(--space-3);
}
.back-btn:hover {
  font-weight: 700;
  color: var(--color-text);
  text-decoration: underline;
}

.field-input {
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-strong);
  background: #ffffff;
  font-size: 14px;
  box-sizing: border-box;
  margin-bottom: 16px;
}
.field-label {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}
.field-sub {
  font-size: 14px;
  color: var(--color-text-muted);
}
.join-btn {
  width: 100%;
  border-radius: var(--radius-sm);
  padding: 12px;
  background-color: var(--color-primary);
  font-size: 16px;
  font-weight: 600;
  color: white;
  border: none;
  cursor: pointer;
  transition:
    background-color var(--transition-base),
    transform var(--transition-base);
}

.join-btn:hover {
  background-color: var(--color-primary-strong);
  transform: translateY(-1px);
}

.join-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.error {
  color: #b00020;
  font-size: 14px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .welcome-page {
    padding: 20px;
  }
  .welcome-grid {
    width: 100%;
    max-width: 100%;
    padding: 20px;
    border-radius: 15px;
  }
  .back-btn {
    font-size: 14px;
    margin-bottom: 15px;
  }
  .field-label {
    font-size: 16px;
    margin-bottom: 12px;
  }
  .field-input {
    padding: 10px;
    font-size: 14px;
    margin-bottom: 12px;
  }
  .join-btn {
    padding: 10px;
    font-size: 14px;
  }
  .error {
    font-size: 12px;
  }
}
</style>
