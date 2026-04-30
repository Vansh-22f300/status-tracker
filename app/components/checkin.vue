<template>
  <div class="checkin">
    <div class="header">
      <div class="header-label">Today's check-ins</div>
      <div class="header-count">{{users.length }} </div>
    </div>
    <div class="feed" v-if="users.length">
      <div class="feed-item" v-for="user in users" :key="user.name">
        <div class="profile-pic ui-avatar">{{ getInitials(user.name) }}</div>
        <div class="feed-item-info">
          <div class="feed-item-name">{{ user.name }}</div>
          <div class="feed-item-msg">{{ user.msg }}</div>
        </div>
        <div class="feed-item-right">
          <div class="checkin-time" >{{ user.time }}</div>
          <div
            class="status-badge ui-chip"
            :class="`tag-${user.status.toLowerCase()}`">
            {{ user.statusCode }}
          </div>
        </div>
      </div>
    </div>
        <div class="empty-title" v-else>No check-in recorded for Today.</div>

  </div>
</template>

<script setup>

import { ref, onMounted } from "vue";
import { db } from "../../firebase/config";
import { collection, getDocs,query,where } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
const users = ref([]);
const { profile, user } = useUser();

const { getInitials } = useInitials();

function formatTime(timestamp,status) {
    if (status === "leave") return;

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
  const querySnapshot = onSnapshot(
    query(
      collection(db, "status"),
      where("teamId", "==", profile.value.teamId)
    ),
    (snapshot) => {
      users.value = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
    .filter(user=>isToday(user.timestamp))
    .sort((a, b) => b.timestamp - a.timestamp)  
    .map(user=>({
      ...user,
      time:formatTime(user.timestamp,user.status),
      msg:formatMessage(user.status),
      statusCode:formatStatus(user.status),
    }))
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


// const { teamData } = useData();
</script>

<style scoped>
.checkin {
  padding: var(--space-7);
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-5);
}

.header-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-right: var(--space-5);
}

.header-count {
  font-size: 11px;
  color: var(--color-text-muted);
  background-color: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  padding: 5px 10px;
  border-radius: 999px;
  font-weight: 700;
}
.feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.feed-item {
  display: flex;
  align-items: center;
  background-color: var(--color-surface);
  padding: 15px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-base), box-shadow var(--transition-base);

}
.feed-item:hover{
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.profile-pic {
  margin-right: 10px;
}
.feed-item-info {
  display: flex;
  flex: 1;
  flex-direction: column;
}
.feed-item-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.feed-item-msg {
  color: var(--color-text-muted);
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
  font-size: 11px;
}
.status-badge.tag-wfh {
  background-color: var(--color-wfh-bg);
  color: var(--color-wfh-text);
}
.status-badge.tag-wfo {
  background-color: var(--color-wfo-bg);
  color: var(--color-wfo-text);
}
.status-badge.tag-leave {
  background-color: var(--color-leave-bg);
  color: var(--color-leave-text);
}

.checkin-time {
  color: var(--color-text-muted);
  font-size: 11px;
}

.empty-title{
  font-size: 16px;
  color: var(--color-text-muted);
  text-align: center;
}
@media(max-width:768px){
  .checkin {
    padding: var(--space-5) var(--space-4);
  }

  .feed-item {
    padding: 12px;
  }

  .feed-item-name {
    font-size: 13px;
  }

  .feed-item-msg {
    font-size: 12px;
  }

  .profile-pic {
    width: 26px;
    height: 26px;
    font-size: 10px;
    margin-right: 8px;
  }

  .status-badge {
    font-size: 10px;
    padding: 4px 8px;
  }

  .checkin-time {
    font-size: 10px;
  }
}
</style>
