<template>
  <div class="section">
    <p class="label">Your status today</p>
    <div class="list">
      <div
        class="card ui-card"
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
        class="card ui-card"
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
        class="card ui-card"
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
    <div class="submit ui-card" v-if="selectedstatus">
      <div class="submit-info">
        <div>
          {{ message() }}— will notify {{ profile?.teamName || "your team" }}
        </div>
        <div class="submit-time">
          <span class="submit-time-label">Posting at</span>
          <label class="time-pill">
            <svg
              class="time-icon"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 7v5l3 3"></path>
            </svg>
            <input
              id="status-time"
              ref="timeInput"
              v-model="time"
              type="time"
              class="time-input"
              :disabled="isPosting"
              aria-label="Change posting time"
            />
          </label>
        </div>
        <div class="time-helper">
          Use the clock to change the posting time before you notify the team.
        </div>
        <div class="cooldown-text" v-if="cooldownRemainingMs > 0">
          You can send another update in {{ cooldownLabel }}
        </div>
      </div>

      <button
        type="button"
        class="notify-btn ui-btn ui-btn-primary"
        @click="notified"
        :disabled="isPosting || cooldownRemainingMs > 0"
        :class="{ disabled: isPosting || cooldownRemainingMs > 0 }"
      >
        {{
          isPosting
            ? "Notifying..."
            : cooldownRemainingMs > 0
              ? `Wait ${cooldownLabel}`
              : "Notify Group ->"
        }}
      </button>
    </div>

    <!-- shown only when this is a genuine change but not the first notify today -->
    <Teleport to="body">
      <div class="modal" v-if="showRepeatConfirm">
        <div class="modal-content">
          <div class="modal-title">Send another update?</div>
          <div class="modal-sub">
            You already notified the team today — send this update anyway?
          </div>
          <div class="modal-action">
            <button
              class="modal-confirm"
              :disabled="isPosting"
              @click="doNotify"
            >
              {{ isPosting ? "Sending..." : "Send" }}
            </button>
            <button
              class="modal-cancel"
              :disabled="isPosting"
              @click="showRepeatConfirm = false"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch, computed } from "vue";
const { user, profile } = useUser();
const COOLDOWN_MS = 1 * 60 * 1000;
const selectedstatus = ref(null);
const time = ref(getCurrentTimeValue());
const timeInput = ref(null);
const isPosting = ref(false);
const cooldownRemainingMs = ref(0);
const alreadyNotified = ref(null); // last-notified status for today, if any
const showRepeatConfirm = ref(false);
import { useToast } from "vue-toastification";
const toast = useToast();
let cooldownInterval = null;
import { db } from "../../firebase/config";
import { getDoc, setDoc, doc } from "firebase/firestore";
const message = () => {
  if (selectedstatus.value === "wfo") return " Available Office";
  else if (selectedstatus.value === "wfh") return " Available WFH";
  else if (selectedstatus.value === "leave") return "On Leave";
};
const cooldownLabel = computed(() => {
  const totalSeconds = Math.ceil(cooldownRemainingMs.value / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
});

const formattedTime = computed(() => formatTimeForDisplay(time.value));

function getCurrentTimeValue() {
  return new Date().toTimeString().slice(0, 5);
}

function formatTimeForDisplay(value) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return "";

  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildTimestampFromTime(value) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return Date.now();

  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setSeconds(0, 0);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

function startCooldown(ms = 0) {
  const duration = Math.max(0, Number(ms) || 0);
  cooldownRemainingMs.value = duration;

  if (cooldownInterval) clearInterval(cooldownInterval);
  if (!duration) return;

  cooldownInterval = setInterval(() => {
    cooldownRemainingMs.value = Math.max(0, cooldownRemainingMs.value - 1000);
    if (cooldownRemainingMs.value <= 0 && cooldownInterval) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
    }
  }, 1000);
}
function todayKey() {
  return new Date().toLocaleDateString("en-CA");
}
async function loadTodayStatus() {
  if (!user.value) return;
  try {
    const snap = await getDoc(
      doc(db, "status", `${user.value.uid}_${todayKey()}`),
    );
    if (snap.exists()) {
      const data = snap.data();
      alreadyNotified.value = {
        // Prefer the explicit webhook-tracking field; keep fallback for old docs.
        status: data.notifiedStatus ?? data.status ?? null,
      };

      // If a notify happened recently, restore cooldown on page refresh/reopen.
      const lastNotifiedAt = Number(data.lastNotifiedAt || 0);
      if (lastNotifiedAt) {
        const remaining = COOLDOWN_MS - (Date.now() - lastNotifiedAt);
        startCooldown(remaining);
      } else {
        startCooldown(0);
      }
    } else {
      alreadyNotified.value = null;
      startCooldown(0);
    }
  } catch (err) {
    console.error("Failed to load today's status", err);
  }
}
watch(
  user,
  (u) => {
    if (u) loadTodayStatus();
  },
  { immediate: true },
);
function selectstatus(status) {
  if (selectedstatus.value === status) return;
  time.value = getCurrentTimeValue();
  selectedstatus.value = null;
  nextTick(() => {
    selectedstatus.value = status; // set after DOM clears
    nextTick(() => {
      timeInput.value?.focus();
    });
  });
}
async function submitStatus() {
  if (!selectedstatus.value) return;

  if (!user.value || !user.value.email) {
    return;
  }

  try {
    const docId = `${user.value.uid}_${todayKey()}`;

    await setDoc(
      doc(db, "status", docId),
      {
        uid: user.value.uid,
        name: profile.value?.name || user.value?.displayName || "Unknown User",
        email: user.value.email,
        status: selectedstatus.value,
        teamId: profile.value?.teamId || null,
        timestamp: buildTimestampFromTime(time.value),
      },
      { merge: true },
    );
  } catch (err) {
    console.error("Error:", err);
  }
}

async function handlewebhook() {
  const statusValue = {
    wfo: "In Office",
    wfh: "Work From Home",
    leave: "On Leave",
  };
  try {
    await $fetch("/api/notify", {
      method: "POST",
      body: {
        status: statusValue[selectedstatus.value],
        name: profile.value?.name || user.value?.displayName || "Unknown User",
        time: formattedTime.value || time.value,
        teamId: profile.value?.teamId,
        uid: user.value.uid,
        dateKey: todayKey(),
      },
    });
    console.log("sent to google chat space");
  } catch (err) {
    const retryAfterMs =
      err?.data?.retryAfterMs ||
      err?.data?.data?.retryAfterMs ||
      err?.response?._data?.retryAfterMs ||
      err?.response?._data?.data?.retryAfterMs ||
      (err?.status === 429 || err?.response?.status === 429 ? COOLDOWN_MS : 0);
    const errMessage =
      err?.data?.message ||
      err?.data?.data?.message ||
      err?.response?._data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Webhook notification failed.";
    console.error("webhook failed", err);
    const wrapped = new Error(errMessage);
    wrapped.retryAfterMs = retryAfterMs;
    throw wrapped;
  }
}

async function notified() {
  if (!selectedstatus.value) {
    toast.warning("Please select a status first.");
    return;
  }
  if (isPosting.value) return;
  if (cooldownRemainingMs.value > 0) {
    toast.info(`Please wait ${cooldownLabel.value} before sending again.`);
    return;
  }

  // same value already notified today -> no-op, don't even hit the server
  if (alreadyNotified.value?.status === selectedstatus.value) {
    toast.info(
      `You already notified the team you're ${message().trim()} today.`,
    );
    return;
  }

  // genuine change, but not the first notify today -> confirm first
  if (alreadyNotified.value) {
    showRepeatConfirm.value = true;
    return;
  }

  await doNotify();
}

async function doNotify() {
  isPosting.value = true;
  try {
    // webhook first: if this throws (e.g. cooldown), we bail out before
    // touching Firestore, so the stored status never gets ahead of what
    // the team was actually told.
    await handlewebhook();
    await submitStatus();
    alreadyNotified.value = { status: selectedstatus.value };
    toast.success("Status posted successfully!");
  } catch (err) {
    if (err?.retryAfterMs) {
      startCooldown(err.retryAfterMs);
    }
    toast.error(err?.message || "Something went wrong. Please try again.");
    console.error(err);
  } finally {
    isPosting.value = false;
    showRepeatConfirm.value = false;
  }
}

onMounted(() => {
  time.value = getCurrentTimeValue();
});

onUnmounted(() => {
  clearInterval(cooldownInterval);
});
</script>

<style scoped>
.section {
  padding: var(--space-7);
}
.label {
  color: var(--color-text-muted);
  font-size: 11px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: var(--space-4);
  font-weight: 600;
}
.list {
  display: flex;
  gap: var(--space-5);
}
.card {
  flex: 1;
  padding: 28px;
  cursor: pointer;
  /* touch-action: manipulation;  */
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    background-color var(--transition-base);
}
/* .card:hover {
  border-color: rgba(22, 35, 52, 0.18);
  background-color: var(--color-bg-elevated);
  box-shadow: var(--shadow-md);
} */
.card-icon {
  width: 45px;
  font-size: 32px;
  margin-bottom: var(--space-5);
}
.card-name {
  font-size: 24px;
  font-weight: 700;
  font-family: var(--font-display);
  color: var(--color-text);
}
.card-status {
  color: var(--color-text-muted);
}

.submit {
  padding: var(--space-5);
  margin-top: var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.submit-info {
  margin-right: auto;
  font-weight: 600;
}
.submit-time {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}
.submit-time-label {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 500;
}
.time-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}
.time-pill:hover {
  border-color: var(--color-border-strong);
}
.time-pill:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(26, 107, 64, 0.12);
}
.time-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.time-input {
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  padding: 0;
  outline: none;
  cursor: pointer;
}
.time-input::-webkit-calendar-picker-indicator {
  filter: opacity(0.6);
  cursor: pointer;
  margin-left: 2px;
}
.time-helper {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 500;
  margin-top: 6px;
}
.cooldown-text {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
}
.notify-btn {
  min-width: 160px;
}
.notify-btn:hover {
  opacity: 1;
}
.notify-btn.disabled {
  transform: none;
}
.selected_office {
  border-color: rgba(26, 107, 64, 0.4);
  background-color: var(--color-wfo-bg);
}

.selected_home {
  border-color: rgba(26, 59, 122, 0.35);
  background-color: var(--color-wfh-bg);
}
.selected_leave {
  border-color: rgba(122, 26, 26, 0.35);
  background-color: var(--color-leave-bg);
}
.modal {
  position: fixed;
  display: flex;
  inset: 0;
  min-height: 100dvh;
  padding: 16px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  z-index: 100;
  background: rgba(14, 24, 39, 0.35);
  backdrop-filter: blur(3px);
}
.modal-content {
  margin: auto;
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
  color: var(--color-primary-contrast);
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
  .section {
    padding: var(--space-5) var(--space-4);
  }
  .list {
    flex-direction: column;
  }

  .card {
    padding: var(--space-5);
    text-align: center;
    transition: none;
  }
  .card-icon {
    margin-bottom: 10px;
    margin-left: auto;
    margin-right: auto;
  }

  .card-name {
    font-size: 18px;
  }

  .card-status {
    font-size: 13px;
  }
  .submit {
    flex-direction: column;
    gap: var(--space-3);
    text-align: center;
  }
  .submit-info {
    margin: 0 auto;
    text-align: center;
  }
  .submit-time {
    justify-content: center;
  }
  .time-helper {
    text-align: center;
  }
  .notify-btn {
    width: 100%;
    font-size: 14px;
    text-align: center;
  }
  .notify-btn:hover {
    opacity: 0.7;
  }
  .notify-btn.disabled {
    opacity: 0.4;
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
