<template>
  <div class="yesterday-section">
    <div class="header">
      <div class="label">Yesterday's Overview</div>
    </div>
    <div class="grid" v-if="users.length">
      <div class="grid-item" v-for="user in users" :key="user.id">
        <div class="profile-pic ui-avatar">{{ getInitials(user.name) }}</div>
        <div class="grid-info">
          <div class="grid-name">{{ user.name }}</div>
          <div class="grid-status">{{ user.status }}</div>
        </div>
      </div>
    </div>
    <div class="empty-title" v-else>No check-in recorded for yesterday.</div>
  </div>
</template>

<script setup>
// const { teamData } = useData();
const { getInitials } = useInitials();
import { ref, onMounted } from 'vue';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
const users = ref([]);
const { profile, user } = useUser();

function formatStatus(status) {
  if (status === 'wfh') return '🏠 WFH';
  else if (status === 'wfo') return '🏢 Office';
  return '🏝️ Leave';
}

function yesterday(timestamp) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(timestamp).toDateString() === yesterday.toDateString();
}

function fetchUsers() {
  const querySnapshot = onSnapshot(
    query(
      collection(db, 'status'),
      where('teamId', '==', profile.value.teamId)
    ),
    (snapshot) => {
      users.value = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((user) => yesterday(user.timestamp))
        .map((user) => ({
          ...user,
          status: formatStatus(user.status)
        }));
    }
  );
}

import { watch } from 'vue';

onMounted(() => {
  if (profile.value?.teamId) {
    fetchUsers();
  } else {
    const stop = watch(
      () => profile.value?.teamId,
      (teamId) => {
        if (teamId) {
          fetchUsers();
          stop();
        }
      }
    );
  }
});
</script>
<style scoped>
.yesterday-section {
  margin: var(--space-7);
  padding: var(--space-5);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}
.label {
  font-size: 11px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-5);
  font-weight: 600;
}
.grid-item {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin: 5px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  padding: 8px;
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);
}
.grid-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
.profile-pic {
  flex-shrink: 0;
}
.grid-info {
  display: flex;
  flex-direction: column;
}
.grid-name {
  font-size: 15px;
  font-weight: 600;
}
.grid-status {
  padding: 5px 0px;
  border-radius: 5px;
  font-size: 11px;
  color: var(--color-text-muted);
}
.empty-title {
  font-size: 16px;
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 768px) {
  .yesterday-section {
    margin: var(--space-4);
    padding: var(--space-3);
  }
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid-item {
    gap: 10px;
  }
  .grid-name {
    font-size: 13px;
  }
}
</style>
