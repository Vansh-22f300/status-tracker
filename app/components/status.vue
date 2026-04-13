<template>
  <div class="section">
    <p class="label">Your status today</p>
    <div class="list">
      <div
        class="card"
        :class="{
          selected_office: selectedstatus == 'wfo',
        }"
        @click="selectstatus('wfo')"
      >
        <div class="card-icon">🏢</div>
        <div class="card-name">In Office</div>
        <div class="card-status">Available at Office</div>
      </div>
      <div
        class="card"
        :class="{
          selected_home: selectedstatus == 'wfh',
        }"
        @click="selectstatus('wfh')"
      >
        <div class="card-icon">🏠</div>
        <div class="card-name">Work From Home</div>
        <div class="card-status">Remote Today</div>
      </div>
      <div
        class="card"
        :class="{
          selected_leave: selectedstatus == 'leave',
        }"
        @click="selectstatus('leave')"
      >
        <div class="card-icon">🏝️</div>
        <div class="card-name">On Leave</div>
        <div class="card-status">Leave</div>
      </div>
    </div>
    <div class="submit" v-if="selectedstatus">
      <div class="submit-info">
        <div>{{ message() }}— will notify MAP Team C</div>
        <div class="submit-time" v-if="selectedstatus !== 'leave'">
          Posting as You {{ time }}
        </div>
      </div>

      <div class="notify-btn" @click="notified">Notify Group ➡️</div>
    </div>
  </div>

  <!-- test -->
</template>

<script setup>
import { ref } from "vue";
// const { teamData } = useData();
const {user ,profile} = useUser();
const selectedstatus = ref(null);
const time = ref("");

let interval = null;
import { db } from "../../firebase/config";
import { collection, addDoc, query, where, getDoc, updateDoc, setDoc, doc } from "firebase/firestore";
const message = () => {
  if (selectedstatus.value === "wfo") return " Available Office";
  else if (selectedstatus.value === "wfh") return " Available WFH";
  else if (selectedstatus.value === "leave") return "On Leave";
};
function selectstatus(status) {
  selectedstatus.value = status;
}
async function submitStatus() {
  if (!selectedstatus.value) return;

  if (!user.value || !user.value.email) {
    console.log("data not ready");
    return;
  }

  try {
    const today = new Date().toLocaleDateString("en-CA");
    console.log(today);
    const docId = `${user.value.uid}_${today}`;
    console.log(docId);
    // const existing = await getDoc(doc(db,"status",docId));

    // if (existing.exists()) {
    //   alert("Already checked in today ");
    //   return;
    // }
    await setDoc(doc(db, "status", docId), {
      uid: user.value.uid,
      name: profile.value?.name || user.value?.displayName || "Unknown User",
      email: user.value.email,
      status: selectedstatus.value,
      teamId: profile.value?.teamId || null,
      timestamp: Date.now(),
    }, { merge: true });

    console.log("Saved or Updated ");
  } catch (err) {
    console.error("Error:", err);
  }
}

async function handlewebhook(){
  const statusValue={
    wfo:"In Office",
    wfh:"Work From Home",
    leave:"On Leave"
  }
  try{
    await $fetch("/api/notify", {
      method:"POST",
      body:{
        status:statusValue[selectedstatus.value],
        name: profile.value?.name || user.value?.displayName || "Unknown User",
        time: time.value,
      }
    });
    console.log("sent to google chat space")
  }
  catch(err){
    console.log("webhook failed",err);
  }

}

function notified() {
  submitStatus();
  handlewebhook();
  // console.log(user.value);
  console.log("Posted", selectedstatus.value);
  console.log(time);
}

const updateTime = () => {
  time.value = new Date().toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "numeric",
  });
};

onMounted(() => {
  updateTime();
  interval = setInterval(updateTime, 60000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
.section {
  /* margin-top:30px; */
  padding: 30px;
}
.label {
  color: #868584;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.list {
  /* background-color:pink; */
  display: flex;
  gap: 20px;
  /* border-radius:10px; */
}
.card {
  /* margin:20px; x */
  background-color: #fdfcfa;
  border-radius: 15px;
  flex: 1;
  /* width:430px; */
  /* height:200px; */
  padding: 30px;
  cursor: pointer;
}
.card:hover {
  /* box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px; */
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
}
.card-icon {
  width: 45px;
  font-size: 32px;
  margin-bottom: 20px;
}
.card-name {
  font-size: 24px;
  font-weight: bold;
}
.card-status {
  color: #868584;
}

.submit {
  padding: 20px;
  background-color: #fdfcfa;
  margin-top: 20px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
}
.submit-info {
  margin-right: auto;
}
.submit-time {
  color: #868584;
  font-size: 12px;
}
.notify-btn {
  padding: 10px 15px;
  background-color: black;
  color: white;
  cursor: pointer;
  border-radius: 8px;
}
.notify-btn:hover {
  background-color: rgb(46, 46, 46);
  color: white;
  transform: translateY(2px);
}
.selected_office {
  border: 1px solid green;
  background-color: #d0eddc;
}

.selected_home {
  border: 1px solid blue;
  background-color: #d0dfed;
}
.selected_leave {
  border: 1px solid red;
  background-color: #f9d0d0;
}
/*  

    768- mobile
    1024 tab
*/
</style>
