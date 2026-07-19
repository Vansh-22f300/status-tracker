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
            <button
              type="button"
              class="copy-btn ui-btn ui-btn-secondary"
              @click="copyCode"
            >
              {{ copied ? "Copied!" : "Copy" }}
            </button>
          </div>
        </div>

        <div class="card-right">
          <div class="team-length">{{ members?.length }}</div>
          <div class="team-length-label">Members</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="header-label">Notification Webhook</div>
      <div class="webhook-card">
        <input
          type="url"
          class="webhook-input"
          v-model="webhookInput"
          @input="onWebhookInput"
          placeholder="https://chat.googleapis.com/v1/spaces/..."
        />
        <button
          type="button"
          class="ui-btn ui-btn-primary"
          :disabled="webhookSaving"
          @click="saveWebhook"
        >
          {{ webhookSaving ? "Saving..." : "Save" }}
        </button>
      </div>
      <div class="webhook-hint">
        Check-ins and status changes for this team are sent to this Google Chat
        webhook.
      </div>
    </div>

    <div class="section">
      <div class="header">
        <div class="header-label">Team Members</div>
        <div class="header-count">{{ members.length }}</div>
      </div>

      <div class="members-list">
        <div class="member-item" v-for="m in members" :key="m.id">
          <div class="member-main">
            <div class="profile-pic ui-avatar">{{ getInitials(m?.name) }}</div>
            <div class="member-info">
              <div class="member-name">
                {{ m?.name }}
                <span v-if="m.id === user?.uid" class="self-label">You</span>
              </div>
              <div class="member-email">{{ m?.email }}</div>
            </div>
          </div>

          <div class="member-meta">
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
              class="status-text ui-chip"
              :class="{
                'no-checkin': !m.status,
                [`tag-${m.status}`]: !!m.status,
              }"
            >
              {{ m.status ? formatStatus(m.status) : "No Check-in" }}
            </div>
          </div>

          <div class="member-actions">
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
              <span
                v-if="m.id == user?.uid"
                class="self-indicator"
                title="Your account"
                >-</span
              >
              <button
                class="remove-btn"
                v-if="m.id !== user?.uid"
                @click="handleRemove(m)"
                aria-label="Remove member"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
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
import { ref, onMounted, watch } from "vue";
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
import { useToast } from "vue-toastification";
const toast = useToast();
const { user, profile } = useUser();
const { getInitials } = useInitials();

const teamsData = ref(null);
const members = ref([]);
const copied = ref(false);
const statusConfirm = ref(null);
const removeMember = ref(null);

const statusMap = ref({});

const webhookInput = ref("");
const webhookDirty = ref(false);
const webhookSaving = ref(false);

watch(teamsData, (val) => {
  if (val && !webhookDirty.value) {
    webhookInput.value = val.webhookUrl || "";
  }
});

function onWebhookInput() {
  webhookDirty.value = true;
}

async function saveWebhook() {
  if (!profile.value?.teamId) return;
  webhookSaving.value = true;
  try {
    await updateDoc(doc(db, "teams", profile.value.teamId), {
      webhookUrl: webhookInput.value.trim(),
    });
    webhookDirty.value = false;
    toast.success("Webhook updated");
  } catch (err) {
    console.error("Failed to update webhook", err);
    toast.error("Failed to update webhook");
  } finally {
    webhookSaving.value = false;
  }
}

let stopStatusListener = null;
let stopMembersListener = null;
let stopTeamListener = null;

async function fetchData() {
  const teamId = profile.value.teamId;
  const today = todayKey();

  stopTeamListener = onSnapshot(doc(db, "teams", teamId), (snap) => {
    teamsData.value = snap.data();
  });

  stopStatusListener = onSnapshot(
    query(collection(db, "status"), where("teamId", "==", teamId)),
    (snapshot) => {
      const map = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        const date = new Date(data.timestamp).toLocaleDateString("en-CA");
        if (date === today) map[data.uid] = data.status;
      });
      statusMap.value = map;

      if (members.value.length) {
        members.value = members.value.map((m) => ({
          ...m,
          status: map[m.id] || null,
        }));
      }
    },
  );

  stopMembersListener = onSnapshot(
    query(collection(db, "profiles"), where("teamId", "==", teamId)),
    (snapshot) => {
      members.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        status: statusMap.value[d.id] || null,
      }));
    },
  );
}

function handleStatusChange(member, newStatus) {
  if (!newStatus) return;
  statusConfirm.value = { member, newStatus };
}

async function confirmStatusChange() {
  const { member, newStatus } = statusConfirm.value;
  const statusRef = doc(db, "status", `${member.id}_${todayKey()}`);

  try {
    await setDoc(statusRef, {
      uid: member.id,
      name: member.name,
      email: member.email,
      status: newStatus,
      teamId: profile.value.teamId,
      timestamp: Date.now(),
    });

    member.status = newStatus;
    await handlewebhook();
    toast.success(`${member.name}'s status updated`);
  } catch (err) {
    const errMessage =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to notify the team.";
    console.error("Failed to update status", err);
    toast.error(errMessage);
  } finally {
    statusConfirm.value = null;
  }
}

function handleRemove(member) {
  if (member.id === user?.uid) {
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
  toast.success(`${member.name} removed from team `);
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
function formatStatusflow(status) {
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
        teamId: profile.value.teamId,
      },
    });
  } catch (err) {
    const errMessage =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Webhook notification failed.";
    console.error("webhook failed", err);
    throw new Error(errMessage);
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
  padding: var(--space-7);
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
  color: var(--color-text-muted);
  font-size: 11px;
  letter-spacing: 1.2px;
  margin: 0;
  text-transform: uppercase;
  margin-right: 20px;
  font-weight: 600;
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

.team-card {
  background: linear-gradient(145deg, #ffffff 0%, #f7fbff 100%);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 28px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 20px;
  box-shadow: var(--shadow-sm);
}
.card-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}
.team-name {
  font-size: 32px;
  font-weight: 800;
  color: var(--color-text);
  font-family: var(--font-display);
  margin-bottom: 8px;
  line-height: 1.05;
}
.team-sub {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 18px;
}
.code-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.join-code {
  flex: 1 1 auto;
  min-width: 0;
  background-color: var(--color-primary-soft);
  font-size: 22px;
  font-weight: bold;
  padding: 12px 18px;
  border-radius: 12px;
  color: var(--color-primary-strong);
  border: 1px dashed rgba(24, 125, 83, 0.4);
  letter-spacing: 4px;
}
.copy-btn {
  flex: 0 0 auto;
  min-width: 86px;
  padding-inline: 14px;
  font-size: 12px;
  font-weight: 700;
  background: var(--color-surface-soft);
  border-color: var(--color-border-strong);
  transition: none !important;
}
.copy-btn:hover {
  background: #e7eef6;
  border-color: var(--color-border-strong);
  transform: none !important;
}
.copy-btn:focus-visible {
  transform: none;
}

.card-right {
  min-width: 156px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  text-align: center;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.team-length {
  font-size: 50px;
  font-weight: 800;
  color: var(--color-text);
  font-family: var(--font-display);
  line-height: 1;
}

.team-length-label {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 8px;
}

.webhook-card {
  display: flex;
  gap: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}
.webhook-input {
  flex: 1;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-strong);
  font-size: 13px;
}
.webhook-hint {
  font-size: 12px;
  color: var(--color-text-muted);
}

.members-list {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}
.member-item {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-base);
}

.member-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.member-info {
  min-width: 0;
}

.member-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 0 0 auto;
}

.member-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 0 0 auto;
}
.member-item:hover {
  background: var(--color-bg-elevated);
}
.profile-pic {
  width: 34px;
  height: 34px;
  font-size: 12px;
}

.member-info {
  flex: 1;
}
.member-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.self-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary-strong);
  background: var(--color-primary-soft);
  border: 1px solid rgba(24, 125, 83, 0.2);
  border-radius: 999px;
  padding: 2px 8px;
}

.member-email {
  font-size: 12px;
  color: var(--color-text-muted);
}

.member-role.member {
  font-size: 12px;
  padding: 8px 10px;
  background-color: var(--color-primary-soft);
  color: var(--color-primary-strong);
  border-radius: 999px;
}
.member-role.manager {
  font-size: 12px;
  padding: 8px 10px;
  background-color: var(--color-wfh-bg);
  color: var(--color-wfh-text);
  border-radius: 999px;
}
.status {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-text {
  min-width: 120px;
  font-size: 13px;
  text-align: center;
  justify-content: center;
}

.status-text.tag-wfh {
  background-color: var(--color-wfh-bg);
  color: var(--color-wfh-text);
}
.status-text.tag-wfo {
  background-color: var(--color-wfo-bg);
  color: var(--color-wfo-text);
}
.status-text.tag-leave {
  background-color: var(--color-leave-bg);
  color: var(--color-leave-text);
}
.status-text.no-checkin {
  background-color: var(--color-none-bg);
  color: var(--color-none-text);
}
.select-status {
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-strong);
  background-color: var(--color-surface);
  cursor: pointer;
}
.select-status:focus-visible {
  outline-color: rgba(30, 155, 102, 0.24);
}
.remove {
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.self-indicator {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-text-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-weight: 700;
  cursor: default;
}
.remove-btn {
  background: var(--color-danger-soft);
  border: 1px solid rgba(200, 61, 54, 0.25);
  color: var(--color-danger);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
  cursor: pointer;
  transition: all var(--transition-base);
}
.remove-btn span {
  font-size: 24px;
  transform: translateY(-1px);
}
.remove-btn:hover {
  background: #f8dddb;
}
.modal {
  position: fixed;
  display: flex;
  inset: 0;
  align-items: center;
  justify-content: center;
  z-index: 100;
  background: rgba(14, 24, 39, 0.35);
  backdrop-filter: blur(3px);
}
.modal-content {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 24px;
  border: 1px solid var(--color-border);
  text-align: center;
  box-shadow: var(--shadow-md);
  max-width: 480px;
}
.modal-title {
  font-size: 30px;
  font-weight: 700;
  color: var(--color-text);
  font-family: var(--font-display);
  margin-bottom: 8px;
}
.modal-sub {
  font-size: 16px;
  color: var(--color-text-muted);
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
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.modal-confirm:hover {
  background-color: var(--color-primary-strong);
}
.modal-cancel {
  padding: 8px 16px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
}
.modal-cancel:hover {
  background-color: var(--color-surface-soft);
}

@media (max-width: 768px) {
  .team-page {
    padding: 16px;
    gap: 20px;
  }

  .team-card {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .code-row {
    flex-direction: column;
    align-items: stretch;
  }

  .join-code {
    width: 100%;
    font-size: 15px;
    letter-spacing: 2px;
  }

  .copy-btn {
    width: fit-content;
    align-self: flex-start;
    min-width: 0;
    padding: 8px 12px;
    font-size: 11px;
  }

  .team-name {
    font-size: 22px;
  }

  .card-right {
    width: 100%;
    align-items: center;
    gap: 8px;
    padding: 14px;
  }

  .team-length {
    font-size: 28px;
  }

  .webhook-card {
    flex-direction: column;
    padding: 14px;
  }

  .webhook-input,
  .webhook-card .ui-btn {
    width: 100%;
  }

  .member-item {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "main main"
      "meta actions";
    align-items: start;
    gap: 10px 12px;
    padding: 12px 14px;
  }

  .member-main,
  .member-meta,
  .member-actions {
    width: 100%;
  }

  .member-main {
    grid-area: main;
  }
  .member-meta {
    grid-area: meta;
  }
  .member-actions {
    grid-area: actions;
  }

  .member-main,
  .member-meta,
  .member-actions {
    justify-content: space-between;
  }

  .member-meta {
    flex-wrap: wrap;
  }

  .member-main {
    padding-bottom: 4px;
    border-bottom: 1px solid var(--color-border);
  }

  .member-role,
  .status-text {
    flex: 1 1 0;
    text-align: center;
  }

  .status {
    flex: 1 1 auto;
  }

  .select-status {
    width: 100%;
    min-width: 130px;
  }

  .remove {
    width: auto;
  }

  .modal-content {
    margin: 16px;
    padding: 20px;
  }

  .modal-title {
    font-size: 22px;
  }

  .modal-sub {
    font-size: 14px;
  }
}
</style>
