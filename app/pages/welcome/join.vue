<template>
  <div class="welcome-page">
    <div class="welcome-grid">
      <div class="back-btn" @click="navigateTo('/welcome')">← Back</div>
      <h2 class="field-label">Join a Team</h2>
      <p class="field-sub">Enter your team's join code:</p>
      <input
        type="text"
        class="field-input"
        v-model="joinCode"
        placeholder="Enter join code"
      />
      <p v-if="error" class="error">{{ error }}</p>
      <button @click="handleJoinTeam" class="join-btn" :disabled="isLoading">
        {{ isLoading ? "Joining..." : "Join Team" }}
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "welcome",
});
import { ref, onMounted } from "vue";
import { db } from "../../../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  setDoc,
  doc,
  increment,
} from "firebase/firestore";

import {useToast} from "vue-toastification";
const toast = useToast();
const { user, profile } = useUser();

const teamName = ref("");
const error = ref("");
const isLoading = ref(false);
const joinCode = ref("");
onMounted(() => {
  if (profile.value?.teamId) {
    navigateTo("/");
  }
});
async function handleJoinTeam() {
  error.value = "";
  if (!joinCode.value.trim()) {
    error.value = "Enter Join Code";
    return;
  }
  isLoading.value = true;

  try {
    const q = query(
      collection(db, "teams"),
      where("joinCode", "==", joinCode.value.trim()),
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // error.value = "Invalid Join Code";
      toast.error("Invalid Join Code");
      isLoading.value = false;
      return;
    }
    const teamId = snapshot.docs[0].id;
    const teamName = snapshot.docs[0].data().name;
    await updateDoc(doc(db, "profiles", user.value.uid), {
      role: "Member",
      updatedAt: Date.now(),
      teamId: teamId,
      teamName: teamName,
    });

    await updateDoc(doc(db, "teams", teamId), {
      count: increment(1),
    });
    profile.value = {
      ...profile.value,
      role: "Member",
      teamId: teamId,
      teamName: teamName,
    };
    toast.success(`Joined team ${teamName} successfully ✅`);
    navigateTo("/");
  } catch (err) {
    console.error("fail to join team", err);
    error.value = err.message;
    toast.error("Failed to join team. Please try again.")
  } finally {
    isLoading.value = false;
  }
}

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
.back-btn {
  cursor: pointer;
  color: grey;
  font-weight: 600;
}
.back-btn:hover {
  font-weight: 700;
  color: rgb(93, 93, 93);
  text-decoration: underline;
}

.field-input{
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #b9aa96;
    background: #ffffff;
    font-size: 14px;
    box-sizing: border-box;
    margin-bottom: 16px;

}
.field-label{
  font-size:18px;
  font-weight:700;
  color: #1a1918;
}
.field-sub{
  font-size:14px;
  color:#868585
}
.join-btn{
  width:100%;
  border-radius:12px;
  padding:12px;
  background-color:#019323;
  font-size:16px;
  color:white;
  border:none;
  cursor:pointer;
}

.join-btn:hover{
  opacity:0.80;
}

.join-btn:disabled{
  opacity:0.40;
  cursor:not-allowed;
}

.error{
  color: #b00020;
  font-size: 14px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .welcome-page {
    padding:20px;
  }
  .welcome-grid {
    width:100%;
    max-width:100%;
    padding:20px;
    border-radius:15px;
  }
  .back-btn {
    font-size:14px;
    margin-bottom:15px;
  }
  .field-label {
    font-size:16px;
    margin-bottom:12px;
  }
  .field-input {
    padding:10px;
    font-size:14px;
    margin-bottom:12px;
  }
  .join-btn {
    padding:10px;
    font-size:14px;
  }
  .error {
    font-size:12px;
  }
}
</style>
