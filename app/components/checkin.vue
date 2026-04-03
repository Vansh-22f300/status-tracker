<template>
  <div class="checkin">
    <div class="header">
      <div class="header-label">Today's check-ins</div>
      <div class="header-count">{{users.length }} </div>
    </div>
    <div class="feed">
      <div class="feed-item" v-for="user in users" :key="user.name">
        <div class="profile-pic">{{ getInitials(user.name) }}</div>
        <div class="feed-item-info">
          <div class="feed-item-name">{{ user.name }}</div>
          <div class="feed-item-msg">{{ user.msg }}</div>
        </div>
        <div class="feed-item-right">
          <div class="checkin-time" v-if="selec">{{ user.time }}</div>
          <div
            class="status-badge"
            :class="`tag-${user.status.toLowerCase()}`">
            {{ user.statusCode }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from "vue";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
// const { teamData } = useData();
const users = ref([]);
const { getInitials } = useInitials();

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "numeric",
  });
}

function formatStatus(status) {
  if(status==="wfh") return "🏠 WFH";
  else if(status==="wfo") return "🏢 Office";
  return "🏝️ Leave";
}
function formatMessage(status) {
  if(status==="wfh") return "Available Work from Home";
  else if(status==="wfo") return" Available at Office";
  return "On Leave";
}

function isToday(timestamp) {
  const today = new Date().toDateString();
  return new Date(timestamp).toDateString() === today;
}

function fetchUsers() {
  const querySnapshot = onSnapshot(collection(db, "users"),(snapshot)=>{
    users.value=snapshot.docs
    .map(doc=>({
      id:doc.id,
      ...doc.data()
    }))
    .filter(user=>isToday(user.timestamp))
    .map(user=>({
      ...user,
      time:formatTime(user.timestamp),
      msg:formatMessage(user.status),
      statusCode:formatStatus(user.status),
    }))
  });
}

onMounted(() => {
  fetchUsers();
});


// const { teamData } = useData();
</script>

<style scoped>
.checkin {
  padding: 35px;
}
.header {
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  margin-bottom: 20px;
}

.header-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
  color: #9c968c;
  margin-right: 20px;
}
.header-count {
  letter-spacing: 1px;
  font-size: 11px;
  color: #9c968c;
  background-color: rgb(231, 229, 225);
  padding: 5px 10px;
  border-radius: 20px;
}
.feed {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.feed-item {
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  background-color: #fdfcfa;
  padding: 15px;
  border-radius: 12px 12px 5px 5px;
  border: 1px solid rgb(220, 220, 220);

}
.feed-item:hover{
  /* background-color:red; */
    transform: translateY(5px);
  transition: transform 0.2s ease;
}

.profile-pic {
  width: 30px;
  height: 30px;
  color: #5a5450;
  background-color: #e8e4dc;
  font-size: 11px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}
.feed-item-info {
  display: flex;
  flex: 1;
  flex-direction: column;
}
.feed-item-name {
  font-size: 15px;
  font-weight: 400;
  /* font-weight: bold; */
  color: #1a1918;
}

.feed-item-msg {
  color: #868584;
  margin-top: 1px;
  font-size: 13px;
}
.feed-item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}
.status-badge {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 11px;
}
.status-badge.tag-wfh {
  background-color: #e8eef9;
  color:#1a3b7a;
}
.status-badge.tag-wfo {
  background-color: #e8f4ed;
  color:#1a6b40;
}
.status-badge.tag-leave {
  background-color: #fbeaea;
  color: #7a1a1a;
}

.checkin-time {
  color: #868584;
  font-size: 11px;
}
</style>
