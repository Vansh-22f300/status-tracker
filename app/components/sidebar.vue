<template>
  <div class="sidebar">
    <div class="sidebar-top">
      <div class="sidebar-title">
        DEV
        <span class="sidebar-title-team">Team</span>
      </div>
      <div class="sidebar-subtitle">AVAILABILITY • {{profile?.teamName}}</div>
    </div>
    <div class="sidebar-member">
      <span class="profile-pic">{{
        getInitials(profile?.name || user?.displayName || "User")
      }}</span>
      <div class="sidebar-member-info">
        <span class="sidebar-member-name">{{
          profile?.name || user?.displayName || "User"
        }}</span>
        <span class="user-role">{{profile?.role}} • {{profile?.teamName}}</span>
      </div>
    </div>
    <div class="navigation">
      <span class="navigation-title">Navigation</span><br />
      <NuxtLink to="/" class="navigation-tile">
        <span class="navigation-icon">◷</span>Today</NuxtLink
      >
      <NuxtLink to="/team" class="navigation-tile"  v-if="profile.role=='Manager'">
        <span class="navigation-icon">◷</span>Manage Team</NuxtLink
      >

    </div>
    

    <div class="sidebar-bottom">
      <div class="sidebar-bottom-title">Checked in today</div>

      <div class="sidebar-bottom-list">
        <div class="sidebar-bottom-item" v-for="user in users" :key="user.id">
          <span class="profile-pic">{{ getInitials(user.name) }}</span>
          <div class="sidebar-bottom-item-info">
            <span class="sidebar-bottom-name">{{ user.name }}</span>
            <span class="sidebar-bottom-time">{{ user.time }}</span>
          </div>

          <span
            class="sidebar-bottom-status"
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
import { collection ,query, where} from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
// const { teamData } = useData();
const users = ref([]);
const { profile, user } = useUser();

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
  // return status === "wfh" ? "WFH" : "Office";
}

function isToday(timestamp) {
  const today = new Date().toDateString();
  return new Date(timestamp).toDateString() === today;
}

function fetchUsers() {
  console.log(status.value?.teamId);
  console.log(profile.value?.teamId)
  stopUsersListener = onSnapshot(
  query(
    collection(db, "status"),
    where("teamId", "==", profile.value?.teamId) 
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
  });
}

import { watch } from "vue"  

onMounted(() => {
  if (profile.value?.teamId) {
    fetchUsers()  
  } 
  else {
    const stop = watch(() => profile.value?.teamId, (teamId) => {
      if (teamId) {
        fetchUsers()
        stop() 
      }
    })
  }
})
onUnmounted(() => {
  if (typeof stopUsersListener === "function") {
    stopUsersListener();
  }
});
</script>

<style scoped>
.sidebar {
  width: 220px;
  background-color: #1a1918;
  padding: 30px;
  height: 100%;
}
.sidebar-title {
  color: #f7f4ef;
  font-size: 31px;
  font-weight: bold;
  margin-bottom: 5px;
}
.sidebar-title-team {
  font-style: italic;
  color: #a09a90;
}
.sidebar-top {
  /* margin-left: 40px; */
  margin-bottom: 40px;
  color: #b6b5b5;
}
.sidebar-subtitle {
  color: #80786d;
  font-size: 11px;
  margin-bottom: 40px;
  letter-spacing: 1.5px;
}
.sidebar-member {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 36px;
  gap: 12px;
  min-height: 40px;
  display: flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
}
.sidebar-member-info {
  display: flex;
  flex-direction: column;
}
.sidebar-member-name {
  color: #f7f4ef;
  font-size: 14px;
}
.user-role {
  color: #80786d;
  font-size: 11px;
}
.profile-pic {
  width: 30px;
  height: 30px;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  /* margin-right: 10px; */
}
.navigation {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.navigation a {
  color: #c4c4c4;
  text-decoration: none;
  margin-bottom: 2px;
  border-radius: 5px;
  font-size: 14px;
  align-items: center;
  padding: 12px 15px;
}

.navigation a:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #c9c3b8;
}
.router-link-exact-active {
  background: rgba(255, 255, 255, 0.08);
  color: #f0ece6;
  /* padding:15px; */
}

.navigation-tile {
  display: flex;
  align-items: center;
  gap: 10px;
}
.navigation-title {
  color: #5e564a;

  /* color: #5e564a; */
  font-size: 10px;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}
.sidebar-bottom {
  margin-top: 30px;
}

.sidebar-bottom-title {
  /* color: #3d3830; */
  color: #5e564a;
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
  border-bottom: 1px solid #3d3830;

  /* background-color:rgb(203, 203, 11); */
}

.sidebar-bottom-item-info {
  display: flex;
  flex-direction: column;
  margin-right: auto;
}

.sidebar-bottom-status {
  margin-left: 12px;
  border-radius: 22px;
  padding: 3px 8px;
  font-size: 10px;
}
.sidebar-bottom-status.tag-wfh {
  background: rgba(60, 100, 200, 0.2);
  color: #7aabf7;
}
.sidebar-bottom-status.tag-office {
  background: rgba(30, 107, 64, 0.25);
  color: #4fca78;
}
.sidebar-bottom-status.tag-leave {
  background: rgba(107, 30, 30, 0.25);
  color: rgb(202, 79, 79);
}
.sidebar-bottom-name {
  color: #f7f4ef;
  font-size: 14px;
}
.sidebar-bottom-time {
  color: #767474;
  font-size: 12px;
}
.sidebar-empty {
  color: #767474;
  font-size: 12px;
  padding: 8px;
}
</style>
