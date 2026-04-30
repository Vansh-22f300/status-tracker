<template>
  <div class="sidebar">
    <div class="close-btn" @click="sidebarClose">✕</div>
    <div class="sidebar-top">
      <div class="sidebar-title">
        DEV
        <span class="sidebar-title-team">Team</span>
      </div>
      <div class="sidebar-subtitle">AVAILABILITY • {{mounted ? profile?.teamName :"" }}</div>
    </div>
    <div class="sidebar-member">
      <span class="profile-pic ui-avatar">{{
        getInitials(profile?.name || user?.displayName || "User")
      }}</span>
      <div class="sidebar-member-info">
        <span class="sidebar-member-name">{{
         mounted ? profile?.name || user?.displayName :""
        }}</span>
        <span class="user-role"
          >{{ mounted ? profile?.role : "" }} • {{ mounted ? profile?.teamName : "" }}</span
        >
      </div>
    </div>
    <div class="navigation">
      <span class="navigation-title">Navigation</span><br />
      <NuxtLink to="/" class="navigation-tile" @click="sidebarClose()">
        <span class="navigation-icon">◈</span>Today</NuxtLink
      >
      <NuxtLink
        to="/team"
        class="navigation-tile"
        v-if="mounted && profile?.role == 'Manager'"
        @click="sidebarClose()"
      >
        <span class="navigation-icon">⚙</span>Manage Team</NuxtLink
      >
    </div>

    <div class="sidebar-bottom">
      <div class="sidebar-bottom-title">Checked in today</div>

      <div class="sidebar-bottom-list">
        <div class="sidebar-bottom-item" v-for="user in users" :key="user.id">
          <span class="profile-pic ui-avatar">{{ getInitials(user.name) }}</span>
          <div class="sidebar-bottom-item-info">
            <span class="sidebar-bottom-name">{{ user.name }}</span>
            <span class="sidebar-bottom-time">{{ user.time }}</span>
          </div>

          <span
            class="sidebar-bottom-status ui-chip"
            :class="`tag-${user.status.toLowerCase()}`"
            >{{ user.status }}</span
          >
        </div>
        <div v-if="!users.length" class="sidebar-empty">
          No one checked in yet.
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { db } from "../../firebase/config";
import { collection, query, where } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
// const { teamData } = useData();
const users = ref([]);
const { profile, user } = useUser();
const { sidebarClose } = useSidebar();
const mounted=ref(false);
const { getInitials } = useInitials();
let stopUsersListener = null;

function formatTime(timestamp, status) {
  if (status === "leave") return;
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "numeric",
  });
}

function formatStatus(status) {
  if (status === "wfh") return "WFH";
  else if (status === "wfo") return "Office";
  return "Leave";
}

function isToday(timestamp) {
  const today = new Date().toDateString();
  return new Date(timestamp).toDateString() === today;
}

function fetchUsers() {
  stopUsersListener = onSnapshot(
    query(
      collection(db, "status"),
      where("teamId", "==", profile.value?.teamId),
    ),
    (snapshot) => {
      users.value = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => isToday(user.timestamp))
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((user) => ({
          ...user,
          time: formatTime(user.timestamp, user.status),
          status: formatStatus(user.status),
        }));
    },
  );
}

import { watch } from "vue";

onMounted(() => {
   mounted.value = true;
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
      },
    );
  }
});
onUnmounted(() => {
  if (typeof stopUsersListener === "function") {
    stopUsersListener();
  }
});
</script>

<style scoped>
.sidebar {
  width: 270px;
  background: linear-gradient(180deg, #121b28 0%, #172235 100%);
  padding: 30px;
  height: 100%;
  border-right: 1px solid var(--color-sidebar-border);
}
.sidebar-title {
  color: var(--color-sidebar-text);
  font-size: 32px;
  font-weight: 800;
  font-family: var(--font-display);
  margin-bottom: 5px;
}
.sidebar-title-team {
  font-style: italic;
  color: var(--color-sidebar-muted);
}
.sidebar-top {
  margin-bottom: 40px;
  color: var(--color-sidebar-muted);
}
.sidebar-subtitle {
  color: var(--color-sidebar-muted);
  font-size: 11px;
  margin-bottom: 40px;
  letter-spacing: 1.5px;
}
.sidebar-member {
  background-color: var(--color-sidebar-surface);
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 36px;
  gap: 12px;
  min-height: 40px;
  display: flex;
  align-items: center;
  border: 1px solid var(--color-sidebar-border);
}
.sidebar-member-info {
  display: flex;
  flex-direction: column;
}
.sidebar-member-name {
  color: var(--color-sidebar-text);
  font-size: 14px;
}
.user-role {
  color: var(--color-sidebar-muted);
  font-size: 11px;
}
.profile-pic {
  background-color: var(--color-primary-soft);
  color: var(--color-primary-strong);
}
.navigation {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.navigation a {
  color: #d4e0ee;
  text-decoration: none;
  margin-bottom: 2px;
  border-radius: 10px;
  font-size: 14px;
  align-items: center;
  padding: 12px 15px;
  transition: all var(--transition-base);
}

.navigation a:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-sidebar-text);
}
.router-link-exact-active {
  background: rgba(30, 155, 102, 0.2);
  color: #e9fff5;
}

.navigation-tile {
  display: flex;
  align-items: center;
  gap: 10px;
}
.navigation-title {
  color: var(--color-sidebar-muted);
  font-size: 10px;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}
.sidebar-bottom {
  margin-top: 30px;
}

.sidebar-bottom-title {
  color: var(--color-sidebar-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 10px;
  margin-bottom: 15px;
}
.sidebar-bottom-list {
  display: flex;
  flex-direction: column;
}
.sidebar-bottom-item {
  display: flex;
  justify-items: center;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-bottom: 1px solid var(--color-sidebar-border);
}

.sidebar-bottom-item-info {
  display: flex;
  flex-direction: column;
  margin-right: auto;
}

.sidebar-bottom-status {
  margin-left: 12px;
  font-size: 10px;
}
.sidebar-bottom-status.tag-wfh {
  background: rgba(60, 100, 200, 0.26);
  color: #93b8ff;
}
.sidebar-bottom-status.tag-office {
  background: rgba(30, 107, 64, 0.28);
  color: #78e5a1;
}
.sidebar-bottom-status.tag-leave {
  background: rgba(157, 53, 53, 0.25);
  color: #f09c9c;
}
.sidebar-bottom-name {
  color: var(--color-sidebar-text);
  font-size: 14px;
}
.sidebar-bottom-time {
  color: var(--color-sidebar-muted);
  font-size: 12px;
}
.sidebar-empty {
  color: var(--color-sidebar-muted);
  font-size: 12px;
  padding: 8px;
}
.close-btn {
  display: none;
}
@media (max-width: 768px) {
 

  .close-btn {
    position: absolute;
    display: flex;
    top: 16px;
    right: 16px;
    background-color: rgba(255, 255, 255, 0.12);
    cursor: pointer;
    color: var(--color-sidebar-text);
    font-weight:700;
    border: none;
    padding: 4px 8px;
    border-radius: 50%;
  }
  .sidebar{
    position:relative;
    width:80vw;
    max-width:270px;
        height: 100vh;
  }
   .sidebar-top {
    margin-top: 40px;
  }
  .sidebar-bottom-name{
    font-size: 13px;
  }
  .sidebar-bottom-time{
    font-size: 11px;
  }
  .navigation a{
    padding:10px 12px;
    font-size:13px;
  }
   .navigation-title{
    font-size:9px;
  }
  .sidebar-member-name{
    font-size:13px;
  }
 
  .user-role{
    font-size:10px;
  }
  

  .profile-pic{
    height:28px;
    width:28px;
    font-size:10px;
  }
}
</style>
