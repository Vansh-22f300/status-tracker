<template>
  <div class="topbar">
    <div class="hamburger" @click="toggleSidebar">
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    </div>
    <div class="topbar-left">
      <span
        >Welcome,
        <span class="name"
          >{{ mounted ? profile?.name || user?.displayName : '' }}
        </span> </span
      ><br />

      <span class="topbar-left-date">{{ currentDate }}</span>
    </div>

    <div class="topbar-right">
      <button type="button" class="logout" @click="handleLogout">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
const { profile, user } = useUser();
const { toggleSidebar } = useSidebar();
const mounted = ref(false);
async function handleLogout() {
  try {
    await signOut(auth);
    navigateTo('/login');
    // console.log("User Logout successful");
  } catch (err) {
    console.error('Logout fail', err);
  }
}

const currentDate = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: 'numeric',
  year: 'numeric',
  month: 'long'
});
onMounted(() => {
  mounted.value = true;
});
</script>

<style scoped>
.topbar {
  max-width: 100%;
  min-height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface);
  backdrop-filter: blur(8px);
  padding: 14px 30px;
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}
.topbar-left {
  color: var(--color-text);
  margin-left: 12px;

  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.topbar-left-date {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 500;
}
.logout {
  background-color: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
  border-radius: 999px;
  padding: 8px 14px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}
.logout:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.name {
  color: #fbbf24;
  font-weight: 700;
}
.hamburger {
  display: none;
}

@media (max-width: 768px) {
  .topbar {
    padding: 0 16px;
    height: 60px;
    min-height: 60px;
  }
  .hamburger {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    gap: 5px;
  }
  .line {
    width: 25px;
    height: 2px;
    background-color: var(--color-text);
    gap: 5px;
  }
  .topbar-left {
    font-size: 14px;
    margin-left: 10%;
    margin-right: auto;
  }
  .topbar-left-date {
    font-size: 11px;
  }
}
</style>
