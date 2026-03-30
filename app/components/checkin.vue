<template>
  <div class="checkin">
    <div class="header">
      <div class="header-label">Today's check-ins</div>
      <div class="header-count">4 of 7</div>
    </div>
    <div class="feed">
      <div class="feed-item" v-for="user in teamData" :key="user.name">
        <div class="profile-pic">{{ getInitials(user.name) }}</div>
        <div class="feed-item-info">
          <div class="feed-item-name">{{ user.name }}</div>
          <div class="feed-item-msg">{{ user.msg }}</div>
        </div>
        <div class="feed-item-right">
          <div class="checkin-time">{{ user.time }}</div>
          <div
            class="status-badge"
            :class="`tag-${user.statusCode.toLowerCase()}`"
          >
            {{ user.status }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>


const { teamData } = useData();

const { getInitials } = useInitials();



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

.profile-pic {
  width: 30px;
  height: 30px;
  color: #1a1918;
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
}
.status-badge.tag-wfo {
  background-color: #e8f4ed;
}

.checkin-time {
  color: #868584;
  font-size: 11px;
}
</style>
