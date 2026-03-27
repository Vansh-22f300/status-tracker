<template>
  <div class="topbar">
    <div class="topbar-left">
      <span>Good Morning</span><br />

      <span class="topbar-left-date">{{ currentDate}}</span>
    </div>

    <div class="topbar-right">
      <span class="live">Live {{ liveCount }} Members</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const liveCount = ref(7);

const currentDate=new Date().toLocaleDateString(
  'en-IN',
  { weekday: 'long', day: 'numeric', year: 'numeric', month: 'long' }
);


</script>

<style scoped>
.topbar {
  /* width: 100%; */
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fdfcfa;
  /* background-color:blue; */
  padding: 0 30px;
  border-bottom:1px solid rgb(207, 205, 205);
}
.topbar-left {
  color: #1a1918;
  margin-left: 12px;

  font-size: 20px;
  font-weight: bold;
  letter-spacing:0.3px;
}
.topbar-left-date {
  color: #868584;
  font-size: 12px;
  font-weight: normal;
}
.live {
  background-color: #e8f5e9;
  color: #4caf50;
  border-radius: 15px;
    padding: 5px 10px;
    border: 1px solid #4caf50;
    font-size:12px;
}
</style>
