<template>
  <div class="welcome-page">
    <div class="welcome-grid">
      <div class="back-btn" @click="navigateTo('/welcome')">← Back</div>
      <p class="field-label">Name your Team</p>
      <input
        type="text"
        v-model="teamName"
        placeholder="Enter your Team Name"
        class="field-input"
      />
      <p v-if="error" class="error">{{ error }}</p>

      <button
        @click="handleCreateTeam"
        class="create-btn"
        :disabled="isLoading"
      >
        {{ isLoading ? "Creating..." : "Create Team" }}
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
} from "firebase/firestore";
import {useToast} from "vue-toastification";
const toast = useToast();
const { user, profile } = useUser();

const teamName = ref("");
const error = ref("");
const isLoading = ref(false);
function generateTeamCode() {
  const numbers = Math.floor(100000 + Math.random() * 900000);
  return `${numbers}`;
}
async function handleCreateTeam() {
  error.value = "";
  if (!teamName.value.trim()) {
    error.value = "Enter a team name first";
    return;
  }

  isLoading.value = true;

  try {
    const teamRef = doc(collection(db, "teams"));
    const existingTeamQuery = query(
      collection(db, "teams"),
      where("name", "==", teamName.value.trim())
    );
    const existingTeamSnapshot = await getDocs(existingTeamQuery);
    if (!existingTeamSnapshot.empty) {
      console.log("Team already exist");
      error.value = "Team name already exists, try another name.";
      return;
    }
    // console.log("Creating Team...");
    const code = generateTeamCode();
    await setDoc(teamRef, {
      name: teamName.value.trim(),
      count: 1,
      managerId: user.value.uid,
      joinCode: code,
      createdAt: Date.now(),
    });

    await updateDoc(doc(db, "profiles", user.value.uid), {
      role: "Manager",
      teamId: teamRef.id,
      teamName: teamName.value.trim(),
      updatedAt: Date.now(),
    });

    profile.value = {
      ...profile.value,
      role: "Manager",
      teamId: teamRef.id,
      teamName: teamName.value.trim(),
    };
    console.log("Team Created");
    toast.success(`Team ${teamName.value.trim()} created successfully ✅`);
    navigateTo("/");
  } catch (err) {
    console.error("Failed to create Team", err);
    error.value = err?.message || "Failed to create team.";
  } finally {
    isLoading.value = false;
  }
}
onMounted(() => {
  if (profile.value?.teamId) {
    navigateTo("/");
  }
});
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
  font-size:16px;
  font-weight:700;
  color: #1a1918;
  margin-bottom:16px;
}
.create-btn{
  width:100%;
  border-radius:12px;
  padding:12px;
  background-color:#019323;
  font-size:16px;
  color:white;
  border:none;
  cursor:pointer;
}

.create-btn:hover{
  opacity:0.80;
}

.create-btn:disabled{
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
  .create-btn {
    padding:10px;
    font-size:14px;
  }
  .error {
     font-size:12px;
  }
}
</style>
