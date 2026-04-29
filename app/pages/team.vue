<template>
  <div class="team-page">
    <div class="section">
      <div class="header-label">Your Team</div>
      <div class="team-card">
        <div class="card-left">
          <div class="team-name">{{ teamsData?.name }}</div>
          <div class="team-sub">Share this code with team members to join:</div>
          <div class="code-row">
            <div class="join-code">{{ teamsData?.joinCode }}</div>
            <div class="copy-btn" @click="copyCode">
              {{ copied ? "Copied!" : "Copy" }}
            </div>
          </div>
        </div>

        <div class="card-right">
          <div class="team-length">{{ members?.length }}</div>
          <div class="team-length-label">Members</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="header">
        <div class="header-label">Team Members</div>
        <div class="header-count">{{ members.length }}</div>
      </div>

      <div class="members-list">
        <div class="member-item" v-for="m in members" :key="m.id">
          <div class="profile-pic">{{ getInitials(m?.name) }}</div>
          <div class="member-info">
            <div class="member-name">{{ m?.name }}</div>
            <div class="member-email">{{ m?.email }}</div>
          </div>

          <div
            class="member-role"
            :class="{
              member: m?.role?.toLowerCase() === 'member',
              manager: m?.role?.toLowerCase() === 'manager',
            }"
          >
            {{ m?.role }}
          </div>
          <div
            class="status-text"
            :class="{
              'no-checkin': !m.status,
              [`tag-${m.status}`]: !!m.status,
            }"
          >
            {{ m.status ? formatStatus(m.status) : "No Check-in" }}
          </div>

          <div class="status">
            <select
              class="select-status"
              :value="m.status || ''"
              @change="handleStatusChange(m, $event.target.value)"
            >
              <option value="" disabled>Select</option>
              <option value="wfo">🏢 Office</option>
              <option value="wfh">🏠 WFH</option>
              <option value="leave">🏝️ Leave</option>
            </select>
          </div>

          <div class="remove">
            <button class="you" v-if="m.id == user.uid">You</button>
            <button
              class="remove-btn"
              v-if="m.id !== user.uid"
              @click="handleRemove(m)"
            >
              ❌
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- confirm status modal -->
    <div class="modal" v-if="statusConfirm">
      <div class="modal-content">
        <div class="modal-title">Change status?</div>
        <div class="modal-sub">
          Change {{ statusConfirm.member.name }}'s status to
          {{ formatStatus(statusConfirm.newStatus) }}?
        </div>
        <div class="modal-action">
          <button class="modal-confirm" @click="confirmStatusChange">
            Confirm
          </button>
          <button class="modal-cancel" @click="statusConfirm = null">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Remove confirm modal -->
    <div class="modal" v-if="removeMember">
      <div class="modal-content">
        <div class="modal-title">Remove {{ removeMember.name }}?</div>
        <div class="modal-sub">
          They will lose access to this team and need a new code to rejoin.
        </div>
        <div class="modal-action">
          <button class="modal-confirm" @click="confirmRemove">Confirm</button>
          <button class="modal-cancel" @click="removeMember = null">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../../firebase/config";
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
  onSnapshot,
} from "firebase/firestore";

definePageMeta({ middleware: ["auth", "manager"] });
import {useToast} from "vue-toastification";
const toast = useToast();
const { user, profile } = useUser();
const { getInitials } = useInitials();

const teamsData = ref(null);
const members = ref([]);
const copied = ref(false);
const statusConfirm = ref(null);
const removeMember = ref(null);

const statusMap     = ref({})     

let stopStatusListener  = null
let stopMembersListener = null
let stopTeamListener    = null

async function fetchData() {
  const teamId = profile.value.teamId
  const today  = todayKey()

  stopTeamListener = onSnapshot(doc(db, "teams", teamId), (snap) => {
    teamsData.value = snap.data()
  })

  stopStatusListener = onSnapshot(
    query(collection(db, "status"), where("teamId", "==", teamId)),
    (snapshot) => {
      const map = {}
      snapshot.docs.forEach(d => {
        const data = d.data()
        const date = new Date(data.timestamp).toLocaleDateString("en-CA")
        if (date === today) map[data.uid] = data.status
      })
      statusMap.value = map

      if (members.value.length) {
        members.value = members.value.map(m => ({
          ...m,
          status: map[m.id] || null
        }))
      }
    }
  )

  stopMembersListener = onSnapshot(
    query(collection(db, "profiles"), where("teamId", "==", teamId)),
    (snapshot) => {
      members.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        status: statusMap.value[d.id] || null
      }))
    }
  )
}


function handleStatusChange(member, newStatus) {
  if (!newStatus) return;
  statusConfirm.value = { member, newStatus };
}

async function confirmStatusChange() {
  const { member, newStatus } = statusConfirm.value;
  const statusRef = doc(db, "status", `${member.id}_${todayKey()}`);
  await setDoc(statusRef, {
    uid: member.id,
    name: member.name,
    email: member.email,
    status: newStatus,
    teamId: profile.value.teamId,
    timestamp: Date.now(),
  });
  console.log("Status updated");
  member.status = newStatus;
  handlewebhook();
  toast.success(`${member.name}'s status updated ✅`)

  statusConfirm.value = null;
}

function handleRemove(member) {
  if (member.id === user.uid) {
    console.log("cannot be removed");
    return;
  }
  removeMember.value = member;
}

async function confirmRemove() {
  const member = removeMember.value;
  const statusRef = doc(db, "status", `${member.id}_${todayKey()}`);

  await updateDoc(doc(db, "profiles", member.id), {
    teamId: null,
    teamName: null,
    role: null,
  });

  await updateDoc(doc(db, "teams", profile.value.teamId), {
    count: increment(-1),
  });

  const statusSnap = await getDoc(statusRef);
  if (statusSnap.exists()) {
    await updateDoc(statusRef, {
      teamId: null,
    });
  }

  members.value = members.value.filter((m) => m.id !== member.id);
  toast.success(`${member.name} removed from team ✅`);
  removeMember.value = null;
}

function todayKey() {
  return new Date().toLocaleDateString("en-CA");
}
function formatStatus(status) {
  if (status === "wfh") return "🏠 WFH";
  else if (status === "wfo") return "🏢 Office";
  return "🏝️ Leave";
}
function formatStatusflow(status){
  if (status === "wfh") return "Work From Home";
  else if (status === "wfo") return "In Office";
  return "On Leave";
}
function copyCode() {
  navigator.clipboard.writeText(teamsData.value.joinCode);
  copied.value = true;
}
async function handlewebhook() {
  try {
    await $fetch("/api/update", {
      method: "POST",
      body: {
        status: formatStatusflow(statusConfirm.value.newStatus),
        name: statusConfirm.value.member.name,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });
    console.log("sent to google chat space");
  } catch (err) {
    console.log("webhook failed", err);
  }
}
onMounted(fetchData);

onUnmounted(() => {
  if (typeof stopStatusListener === "function") stopStatusListener();
  if (typeof stopMembersListener === "function") stopMembersListener();
  if (typeof stopTeamListener === "function") stopTeamListener();
});
</script>

<style scoped>
.team-page {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.header {
  display: flex;
  align-items: center;
}
.header-label {
  color: grey;
  font-size: 11px;
  letter-spacing: 1px;
  margin: 0;
  text-transform: uppercase;
  margin-right: 20px;
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
.team-name {
  font-size: 32px;
  font-weight: bold;
  color: #1a1918;
  margin-bottom: 5px;
}
.team-sub {
  font-size: 12px;
  color: grey;
  margin-bottom: 16px;
}
.code-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.join-code {
  background-color: #e8f4ed;
  font-size: 22px;
  font-weight: bold;
  padding: 10px 16px;
  border-radius: 12px;
  color: green;
  letter-spacing: 3px;
}
.copy-btn {
  background-color: black;
  color: white;
  padding: 8px 16px;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
}
.copy-btn:hover {
  opacity: 0.8;
}

.card-right {
  text-align: center;
}

.team-length {
  font-size: 42px;
  font-weight: bold;
  color: #1a1918;

}

.team-length-label {
  font-size: 12px;
  color: grey;
}

.members-list {
  display: flex;
  flex-direction: column;
  background-color: #fdfcfa;
  border-radius: 14px;
  border: 1px solid rgb(220, 220, 220);
}
.member-item {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid rgb(220, 220, 220);
}
.profile-pic {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: #e8e4dc;
  color: #5a5450;
  display: flex;
  font-size: 12px;
  font-weight: 500;
  align-items: center;
  justify-content: center;
}

.member-info {
  flex: 1;
}
.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1918;
}

.member-email {
  font-size: 12px;
  color: #868584;
}

.member-role.member {
  font-size: 12px;
  padding: 8px 10px;
  background-color: #e8f5e9;
  color: #2e8b57;
  border-radius: 12px;
}
.member-role.manager {
  font-size: 12px;
  padding: 8px 10px;
  background-color: #abc4f0;
  color: #1a3b7a;
  border-radius: 12px;
}
.status {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-text {
  min-width: 120px;
  font-size: 13px;
  border-radius: 12px;
  text-align: center;
  padding: 5px;
}

.status-text.tag-wfh {
  background-color: #e8eef9;
  color: #1a3b7a;
}
.status-text.tag-wfo {
  background-color: #e8f4ed;
  color: #1a6b40;
}
.status-text.tag-leave {
  background-color: #fbeaea;
  color: #7a1a1a;
}
.status-text.no-checkin {
  background-color: #ffebcc;
  color: #ff6c86;
}
.select-status {
  padding: 6px 10px;
  border-radius: 12px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
}
.you {
  background: none;
  border: none;
  cursor: default;
  font-size: 13px;
}
.remove-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}
.remove-btn:hover {
  transform: translateY(2px);
}
.modal {
  position:fixed;
  display:flex;
  inset:0;
  align-items:center;
  justify-content:center;
  z-index:100;
  background:rgba(240, 239, 239, 0.5);
}
.modal-content {
  background-color: rgb(255, 245, 245);
  border-radius:16px;
  padding:24px;
  border:1px solid rgb(206, 200, 200);
  text-align:center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
.modal-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1918;
  margin-bottom: 8px;
}
.modal-sub {
  font-size: 16px;
  color: #868584;
  font-weight: 500;
  margin-bottom: 24px;
}
.modal-action {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.modal-confirm {
  padding: 8px 16px;
  background-color: #00c147;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.modal-confirm:hover {
  background-color: #019323;
  transform: translateY(2px);
}
.modal-cancel {
  padding: 8px 16px;
  background-color: rgb(255, 255, 255);
  border: 1px solid #878787;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.modal-cancel:hover {
  background-color: #cbc9c5;
  transform: translateY(2px);
}

@media (max-width: 768px) {
  .team-page {
    padding: 16px;
    gap: 20px;
  }

  .team-card {
    align-items: flex-start;
    gap: 16px;
  }

  .team-name {
    font-size: 22px;
  }

  .join-code {
    font-size: 16px;
    letter-spacing: 2px;
  }

  .card-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .team-length {
    font-size: 28px;
  }

  .member-item {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
  }
/* 
  .profile-pic {
    order: 1;
  }

  .member-info {
    order: 2;
  }

  .remove {
    order: 6;
    margin-left: auto;
  }

  .member-role {
    order: 3;
  }

  .status-text {
    order: 4;
    min-width: auto;
    flex: 1;
  }

  .status {
    order:5;
  } */
  .member-email {
    display:none;
  }
  .modal-content {
    margin:16px;
    padding:20px;
  }

  .modal-title {
    font-size:22px;
  }

  .modal-sub {
    font-size:14px;
  }
}
</style>
