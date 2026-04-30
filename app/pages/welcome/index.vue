<template>
  <div class="welcome-page">
    <div class="welcome-grid">
      <div class="header">
        <h1 v-if="isLoaded">
          Welcome, {{ profile?.name || user?.displayName }}
        </h1>
        <h1 v-else>Loading...</h1>
        <p>Let's get you set up.</p>
      </div>

      <div class="list">
        <!-- create team -->
        <div class="card" @click="navigateTo('/welcome/create')">
          <div class="card-icon">➕</div>
          <div class="card-title">Create a Team</div>
          <div class="card-subtitle">I am the team owner</div>
        </div>
        <!-- join team -->
        <div class="card" @click="navigateTo('/welcome/join')">
          <div class="card-icon">🤝</div>
          <div class="card-title">Join a Team</div>
          <div class="card-subtitle">Enter Join code to join Team</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'welcome'
});
import { ref, onMounted } from 'vue';
import { db } from '../../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const { getInitials } = useInitials();

const { user, profile, isLoaded } = useUser();

const error = ref('');

onMounted(() => {
  if (profile.value?.teamId) {
    navigateTo('/');
  }
});
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
  width: min(560px, 100%);
  margin: 0 auto;
  padding: 40px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.header {
  text-align: center;
  margin-bottom: 40px;
}
.header h1 {
  font-size: 34px;
  margin-bottom: 8px;
  color: var(--color-text);
}
.header p {
  font-size: 16px;
  color: var(--color-text-muted);
}
.list {
  display: flex;
  gap: 20px;
}
.card {
  background-color: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  text-align: center;
  border-radius: var(--radius-md);
  flex: 1;
  padding: 30px;
  cursor: pointer;
  transition:
    transform var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}
.card:hover {
  border-color: rgba(24, 125, 83, 0.35);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}
.card-icon {
  font-size: 32px;
  margin-bottom: 20px;
}
.card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--color-text);
}
.card-subtitle {
  color: var(--color-text-muted);
  font-size: 14px;
}

@media (max-width: 768px) {
  .welcome-page {
    padding: 20px;
  }
  .welcome-grid {
    width: 100%;
    padding: 25px;
    border-radius: 15px;
  }
  .header {
    margin-bottom: 25px;
  }
  .header h1 {
    font-size: 24px;
    margin-bottom: 8px;
  }
  .header p {
    font-size: 14px;
  }
  .list {
    flex-direction: column;

    gap: 15px;
  }
  .card {
    padding: 20px;
    border-radius: 15px;
  }
  .card-icon {
    font-size: 28px;
    margin-bottom: 15px;
  }
  .card-title {
    font-size: 18px;
    margin-bottom: 8px;
  }
  .card-subtitle {
    font-size: 12px;
  }
}
</style>
