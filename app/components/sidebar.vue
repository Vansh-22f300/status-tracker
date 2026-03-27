<template>
  <div class="sidebar">
    <div class="sidebar-top">
      <span class="sidebar-title">MAP 
        <span class="sidebar-title-team">Team</span>
      </span><br />
      <span class="sidebar-subtitle">AVAILABILITY . TEAM C</span>
    </div>
    <div class="sidebar-member">
      <span class="profile-pic">AB</span>
      <div class="sidebar-member-info">
      <span class="sidebar-member-name">You(Dev)</span>
      <span class="user-role">Member . Team C</span>
      </div>
    </div>
    <div class="navigation">
      <span class="navigation-title">Navigation</span><br />
      <NuxtLink to="/" class="navigation-tile">
        <span class="navigation-icon">◷</span>
        Today</NuxtLink
      >
      <NuxtLink to="/team" class="navigation-tile"
        ><span class="navigation-icon">◷</span>Team view</NuxtLink
      >
      <NuxtLink to="/history" class="navigation-tile"
        ><span class="navigation-icon">◷</span>History</NuxtLink
      >
      <NuxtLink to="/settings" class="navigation-tile"
        ><span class="navigation-icon">◷</span>Settings</NuxtLink
      >
    </div>

    <div class="sidebar-bottom">
      <div class="sidebar-bottom-title">Checked in today</div>

      <div class="sidebar-bottom-list">

        <div class="sidebar-bottom-item">
          <span class="profile-pic">AB</span>
          <div class="sidebar-bottom-item-info">
            <span class="sidebar-bottom-name">AB XZ</span>
            <span class="sidebar-bottom-time">9:00 AM</span>
          </div>

          <span class="sidebar-bottom-status">WFO</span>
        </div>

        <div class="sidebar-bottom-item">
          <span class="profile-pic">CD</span>
          <div class="sidebar-bottom-item-info">
            <span class="sidebar-bottom-name">AB XZ</span>
            <span class="sidebar-bottom-time">9:00 AM</span>
          </div>
          <span class="sidebar-bottom-status">WFO</span>
        </div>
        <div class="sidebar-bottom-item">
          <span class="profile-pic">EF</span>
          <div class="sidebar-bottom-item-info">
            <span class="sidebar-bottom-name">AB XZ</span>
            <span class="sidebar-bottom-time">9:00 AM</span>
          </div>
          <span class="sidebar-bottom-status">WFO</span>
        </div>

        <div class="sidebar-bottom-item">
          <span class="profile-pic">EF</span>
          <div class="sidebar-bottom-item-info">
            <span class="sidebar-bottom-name">AB XZ</span>
            <span class="sidebar-bottom-time">9:00 AM</span>
          </div>
          <span class="sidebar-bottom-status">WFO</span>
        </div>
        <div class="sidebar-bottom-item">
          <span class="profile-pic">EF</span>
          <div class="sidebar-bottom-item-info">
            <span class="sidebar-bottom-name">AB XZ</span>
            <span class="sidebar-bottom-time">9:00 AM</span>
          </div>
          <span class="sidebar-bottom-status">WFO</span>
        </div><div class="sidebar-bottom-item">
          <span class="profile-pic">EF</span>
          <div class="sidebar-bottom-item-info">
            <span class="sidebar-bottom-name">AB XZ</span>
            <span class="sidebar-bottom-time">9:00 AM</span>
          </div>
          <span class="sidebar-bottom-status">WFO</span>
        </div>
        <div class="sidebar-bottom-item">
          <span class="profile-pic">EF</span>
          <div class="sidebar-bottom-item-info">
            <span class="sidebar-bottom-name">AB XZ</span>
            <span class="sidebar-bottom-time">9:00 AM</span>
          </div>
          <span class="sidebar-bottom-status">WFO</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.sidebar {
  width: 220px;
  background-color: #1a1918;
  padding: 30px;
}
.sidebar-title {
  color: #f7f4ef;
  font-size: 21px;
  font-weight: bold;
  margin-bottom: 5px;
}
.sidebar-title-team{
  font-style:italic;
  color:#b6b6b6;
}
.sidebar-top {
  /* margin-left: 40px; */
  margin-bottom: 40px;
  color: #b6b5b5;
}
.sidebar-subtitle{
  color: #b6b5b5;
  font-size: 12px;
}
.sidebar-member {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor:pointer;
  
}
.sidebar-member-info{
    display: flex;
    flex-direction: column;
  
}
.sidebar-member-name{
    color: #f7f4ef;
    font-size: 14px;
}
.user-role{
  color:#424242;
  font-size:11px;
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
  margin-right: 10px;
}
.navigation {
  display: flex;
  flex-direction: column;
  cursor:pointer;
}
.navigation a {
  height: 15px;
  color: #b6b5b5;
  text-decoration: none;
  margin-bottom: 2px;
  border-radius: 5px;
  font-size: 16px;
  align-items: center;
  padding: 10px;
}
.navigation a:hover {
   color: #fefefe;
  background-color:rgba(255, 255, 255, 0.05);
}
.navigation a:active{
  /* color: rgba(255, 255, 255, 0.05); */
  color:white;
  background-color: #4caf50;
}

.navigation-tile {
  display: flex;
  align-items: center;
  gap: 10px;
}
.navigation-title {
  color: #b6b5b5;
  font-size: 14px;
  margin-bottom: 10px;
}
.sidebar-bottom {
  margin-top: 30px;
}

.sidebar-bottom-title {
  color: #767474;
  font-size: 12px;
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
    border-bottom: 1px solid #d2cbcb8c;

  /* background-color:rgb(203, 203, 11); */

}

.sidebar-bottom-item-info {
  display: flex;
  flex-direction: column;
  margin-right:auto;
}

.sidebar-bottom-status {
  margin-left: 12px;
    background-color: #e8f5e9;
    border: 1px solid #4caf50;
    color: #4caf50;
    border-radius: 15px;
    padding: 5px 10px;
    font-size: 12px;
}
.sidebar-bottom-name {
  color: #f7f4ef;
  font-size: 14px;
}
.sidebar-bottom-time {
  color: #767474;
  font-size: 12px;
}

</style>
