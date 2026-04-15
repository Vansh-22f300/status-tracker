<template>
  <div class="team-page">
    <div class="section">
      <div class="header-label">Your Team</div>
      <div class="team-card">
        <div class="card-left">
          <div class="team-name">{{ teamsData?.name }}</div>
          <div class="team-sub">Share this code with team members to join:</div>
          <div class="code-row">
          <div class="join-code">{{ teamsData?.joinCode}}</div>
          <div class="copy-btn" @click="copyCode">
            {{ copied ? "Copied!" : "Copy" }}
          </div>
          </div>
        </div>

        <div class="card-right">
          <div class="team-length">{{ members?.length}}</div>
          <div class="team-length-label">Members</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="header">
        <div class="header-label">Team Members</div>
        <div class="header-count">{{members.length }} </div>
      </div>

      <div class="members-list">
        <div class="member-item" v-for="m in members" :key="m.id">
          <div class="profile-pic">{{ getInitials(m?.name) }}</div>
          <div class="member-info">
            <div class="member-name">{{ m?.name }}</div>
            <div class="member-email">{{ m?.email }}</div>
          </div>

          <div class="member-role">{{ m?.role }}</div>

          <div class="status">
            <div class="status-text" :class="{'no-checkin':!m.status}">
              {{m.status? formatStatus(m.status): "No Check-in"}}
            </div>

          </div>
          <!-- <div class="member-role">{{ m?.role }}</div>
          <div class="member-role">{{ m?.role }}</div>
          <div class="member-role">{{ m?.role }}</div> -->

        </div>



      </div>
    
    </div>



  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { db } from "../../firebase/config"
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
} from "firebase/firestore"

definePageMeta({ middleware: ["auth"] })

const { user, profile } = useUser()
const { getInitials }   = useInitials()

const teamsData = ref(null)
const members = ref([])
const copied=ref(false)

async function fetchData() {
  const teamId = profile.value.teamId

  const teamSnap = await getDoc(doc(db, "teams", teamId))
  teamsData.value = teamSnap.data()

  const memberSnap = await getDocs(query(collection(db, "profiles"), where("teamId", "==", teamId)))

  members.value = memberSnap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    status: null
  }))
  console.log(members)
}
function formatStatus(status) {
  if(status==="wfh") return "🏠 WFH";
  else if(status==="wfo") return "🏢 Office";
  return "🏝️ Leave";
}
function copyCode() {
  navigator.clipboard.writeText(teamsData.value.joinCode)
  copied.value = true
}
onMounted(fetchData)
</script>

<style scoped>
.team-page {
  padding: 30px;
  display:flex;
  flex-direction:column;
  gap:32px;
  /* background-color:red; */
}
.section{
  display:flex;
  flex-direction:column;
  gap:16px;
}
.header{
  display:flex;
  align-items:center;
}
.header-label{
  color:grey;
  font-size:11px;
  letter-spacing:1px;
  margin:0; 
  text-transform:uppercase;
  margin-right:20px;
}
.header-count {
  font-size: 11px;
  color: grey;
  background-color: rgb(231, 229, 225);
  padding: 5px 10px;
  border-radius: 20px;
}

.team-card {
  background-color: #fdfcfa;
  border-radius: 14px;
  border: 1px solid rgb(220, 220, 220);
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.team-name{
  font-size:32px;
  font-weight:bold;
  color:#1a1918;
  margin-bottom:5px;
}
.team-sub{
  font-size:12px;
  color:grey;
  margin-bottom:16px;

}
.code-row{
  display:flex;
  align-items:center;
  gap:12px;

}

.join-code{
    background-color: #e8f4ed;
  font-size:22px;
  font-weight:bold;
  padding:10px 16px;
  border-radius:12px;
  color:green;
  letter-spacing:3px;
}
.copy-btn{
  background-color:black;
  color:white;
  padding:8px 16px;
  font-size:12px;
  border-radius:8px;
  cursor:pointer;
}
.copy-btn:hover{
  opacity:0.8;
}

.card-right{
  text-align:center;
}

.team-length{
  font-size:42px;
  font-weight:bold;
    color:#1a1918;

  /* color:rgb(46, 40, 40); */
}

.team-length-label{
  font-size:12px;
  color:grey;
  margin-top:4px;
}

.members-list{
  display:flex;
  flex-direction:column;
  background-color:#fdfcfa;
  border-radius:14px;
  border:1px solid rgb(220,220,220);
}
.member-item{
  display:flex;
  flex:1;
  align-items:center;
  gap:12px;
  padding:14px 20px;
  border-bottom:1px solid rgb(220,220,220);
}
.profile-pic{
  width:34px;
  height:34px;
  border-radius:50%;
  background-color: #e8e4dc;
  color:#5a5450;
  display:flex;
  font-size:12px;
  font-weight:500;
  align-items:center;
  justify-content:center;
}

.member-info{
  flex:1;
}
.member-name{
  font-size:14px;
  font-weight:500;
  color:#1a1918;
}

.member-email{
  font-size:12px;
  color:#868584;
}

.member-role{
  font-size:12px;
  padding:8px 10px;
  background-color: #d8e3dd;
  color: #2e8b57;
  border-radius: 12px;

}
</style>
