<template>
  <div class="yesterday-section">
    <div class="header">
      <div class="label">Yesterday's Overview</div>
    </div>
    <div class="grid" v-if="users.length">
      <div class="grid-item" v-for="user in users" :key="user.id">
        <div class="profile-pic">{{ getInitials(user.name) }}</div>
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
import { ref, onMounted } from "vue";
import { db } from "../../firebase/config";
import { collection, getDocs,query,where } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
const users = ref([]);
const { profile, user } = useUser();

function formatStatus(status) {
  if (status === "wfh") return "🏠 WFH";
  else if (status === "wfo") return "🏢 Office";
  return "🏝️ Leave";
}

function yesterday(timestamp) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(timestamp).toDateString() === yesterday.toDateString();
}

function fetchUsers() {
  const querySnapshot = onSnapshot(
    query(
      collection(db, "status"),
      where("teamId", "==", profile.value.teamId)
    ),
    (snapshot) => {
      users.value = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      .filter((user) => yesterday(user.timestamp))
      .map((user) => ({
        ...user,
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
</script>
<style scoped>
.yesterday-section {
  margin: 35px;
  padding: 15px;
  background-color: #fdfcfa;
  border-radius: 10px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* background-color:pink; */
}
.label {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: grey;
  margin-bottom: 20px;
}
.grid-item {
  display: flex;
  align-items: center;
  gap: 20px;
  /* margin-top:20px; */
  margin: 5px;
  border-radius: 8px;
  border: 1px solid #e8e4dc;
  padding: 5px;
  /* gap:10px; */
}
.profile-pic {
  width: 30px;
  height: 30px;
  background-color: #e8e4dc;
  color: grey;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 11px;
}
.grid-info {
  display: flex;
  flex-direction: column;
}
.grid-name {
  font-size: 15px;
  font-weight: 500;
}
.grid-status {
  padding: 5px 0px;
  border-radius: 5px;
  font-size: 11px;
  color: #afaca7;
}
.empty-title {
  font-size: 16px;
  color: grey;
  text-align: center;
}
</style>
