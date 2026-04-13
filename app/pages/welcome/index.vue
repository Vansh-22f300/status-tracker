<template>
  <div class="welcome-page">
    <div class="welcome-grid">
      <div class="header">
        <h1>Welcome, {{ profile?.name || user?.displayName || "abcd" }} 🤝</h1>
        <p>Let's get you set up.</p>
      </div>

      <div class="list">
        <!-- create team -->
        <div class="card" @click="navigateTo('/welcome/create')">
          <div class="card-icon">➕</div>
          <div class="card-title">Create a Team</div>
          <div class="card-subtitle">I am the team owner</div>
        </div>
        <!-- join team -->
        <div class="card" @click="navigateTo('/welcome/join')">
          <div class="card-icon">👥</div>
          <div class="card-title">Join a Team</div>
          <div class="card-subtitle">Enter Join code to join Team</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "welcome",
});
import { ref, onMounted } from "vue";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";

const { getInitials } = useInitials();

const { user, profile } = useUser();

const teamName = ref("");
const error = ref("");
// const isLoading=ref(false);
const avlTeams = ref([]);

onMounted(() => {
  if (profile.value?.teamId) {
    navigateTo("/");
  }
});

// async function handleJoin()
// {
//     isLoading.value=true;
//     try{
//         const snapshot=await getDocs(collection(db,"teams"))
//         avlTeams.value=snapshot.docs.map(t=>({
//             id:t.id,
//             name:t.data().name,
//         }))
//     }
//     catch(err){
//         error.value=err.message;
//         console.error("Fail to Fetch teams",err);
//     }
//     finally{
//         isLoading.value=false;
//     }

// }
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  display: grid;
  align-items: center;
  justify-items: center;
}
.welcome-grid {
  width: 500px;
  margin: 0 auto;
  padding: 40px;
  background: #fff8ef;
  border: 1px solid rgb(253, 180, 180);
  border-radius: 20px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}
.header {
  text-align: center;
  margin-bottom: 40px;
}
.header h1 {
  font-size: 32px;
  margin-bottom: 8px;
}
.header p {
  font-size: 16px;
  color: #5c5750;
}
.list {
  display: flex;
  gap: 20px;
}
.card {
  background-color: #fdfcfa;
  border: 1px solid #eeeeed;
  text-align: center;
  border-radius: 25px;
  flex: 1;
  padding: 30px;
  cursor: pointer;
}
.card:hover {
  border-color: #019323;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
}
.card-icon {
  font-size: 32px;
  margin-bottom: 20px;
}
.card-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
.card-subtitle {
  color: #868584;
  font-size: 14px;
}
</style>
