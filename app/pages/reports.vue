<template>
  <div class="reports-page">
    <div class="header">
      <div class="header-label">Personal Reports</div>
      <div class="header-subtitle">Your check-in history</div>
    </div>

    <div class="preset-row">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        class="preset-btn"
        :class="{ active: selectedPreset === preset.id }"
        @click="selectedPreset = preset.id"
      >
        {{ preset.label }}
      </button>
    </div>

    <div class="summary-grid">
      <div class="summary-card ui-card">
        <div class="summary-title">Total</div>
        <div class="summary-value">{{ filteredRecords.length }}</div>
      </div>
      <div class="summary-card ui-card summary-card-wfo">
        <div class="summary-title">Office</div>
        <div class="summary-value">{{ summaryCounts.wfo }}</div>
      </div>
      <div class="summary-card ui-card summary-card-wfh">
        <div class="summary-title">WFH</div>
        <div class="summary-value">{{ summaryCounts.wfh }}</div>
      </div>
      <div class="summary-card ui-card summary-card-leave">
        <div class="summary-title">Leave</div>
        <div class="summary-value">{{ summaryCounts.leave }}</div>
      </div>
    </div>

    <div class="history ui-card">
      <div class="section-title">History</div>

      <div v-if="loading" class="state">Loading history...</div>
      <div v-else-if="errorMessage" class="state error">{{ errorMessage }}</div>
      <div v-else-if="!filteredRecords.length" class="state">
        No history found for this period.
      </div>

      <div v-else class="history-list">
        <div
          class="history-item"
          v-for="record in filteredRecords"
          :key="record.id"
        >
          <div class="record-left">
            <div class="ui-avatar">
              {{ getInitials(record.name || fallbackName) }}
            </div>
            <div class="record-info">
              <div class="record-name">{{ record.name || fallbackName }}</div>
              <div class="record-date">{{ formatDate(record.timestamp) }}</div>
            </div>
          </div>

          <div class="ui-chip" :class="`tag-${record.status}`">
            {{ formatStatus(record.status) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

definePageMeta({
  middleware: ['auth'],
  layout: 'default'
});

const { user } = useUser();
const { getInitials } = useInitials();

const presets = [
{ id: 'this_week', label: 'This Week' },
{ id: 'last_week', label: 'Last Week' },
{ id: 'this_month', label: 'This Month' },
{ id: 'last_month', label: 'Last Month' }
];

const selectedPreset = ref('this_week');
const allRecords = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const fallbackName = computed(
  () => user.value?.displayName || user.value?.email || 'You'
);

function startOfIsoWeek(date) {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0
  );
  const day = start.getDay();
  const shiftToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + shiftToMonday);
  return start;
}
function getPresetRange(presetId) {
  const now = new Date()
  if (presetId === 'this_week') {
    const start = startOfIsoWeek(now)

    const end = new Date(start)
    end.setDate(end.getDate() + 4)
    end.setHours(23, 59, 59, 999)

    return {
      start: start.getTime(),
      end: end.getTime()
    }
  }

  if (presetId === 'last_week') {
    const start = startOfIsoWeek(now)
    start.setDate(start.getDate() - 7)

    const end = new Date(start)
    end.setDate(end.getDate() + 4)
    end.setHours(23, 59, 59, 999)

    return {
      start: start.getTime(),
      end: end.getTime()
    }
  }

  if (presetId === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)

    const end = new Date()
    end.setHours(23, 59, 59, 999)

    return {
      start: start.getTime(),
      end: end.getTime()
    }
  }

  if (presetId === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    end.setHours(23, 59, 59, 999)

    return {
      start: start.getTime(),
      end: end.getTime()
    }
  }

  return {
    start: 0,
    end: Date.now()
  }
}

const filteredRecords = computed(() => {
  const { start, end } = getPresetRange(selectedPreset.value);
  return allRecords.value
    .filter((item) => item.timestamp >= start && item.timestamp <= end)
    .sort((a, b) => b.timestamp - a.timestamp);
});

const summaryCounts = computed(() => {
  const totals = { wfo: 0, wfh: 0, leave: 0 };
  filteredRecords.value.forEach((record) => {
    if (record.status === 'wfo') totals.wfo += 1;
    else if (record.status === 'wfh') totals.wfh += 1;
    else if (record.status === 'leave') totals.leave += 1;
  });
  return totals;
});

function formatStatus(status) {
  if (status === 'wfo') return 'Office';
  if (status === 'wfh') return 'WFH';
  return 'Leave';
}

function formatDate(timestamp) {
  const dt = new Date(timestamp);
  return dt.toLocaleString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

async function fetchHistoryByUser(uid) {
  loading.value = true;
  errorMessage.value = '';
  try {
    const snapshot = await getDocs(
      query(collection(db, 'status'), where('uid', '==', uid))
    );

    allRecords.value = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((item) => Number.isFinite(item.timestamp));
  } catch (err) {
    allRecords.value = [];
    errorMessage.value = 'Unable to load history right now.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

watch(
  () => user.value?.uid,
  (uid) => {
    if (!uid) return;
    fetchHistoryByUser(uid);
  },
  { immediate: true }
);
</script>

<style scoped>
.reports-page {
  padding: var(--space-7);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.header-label {
  color: var(--color-text-muted);
  font-size: 11px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  font-weight: 600;
}

.header-subtitle {
  font-size: 22px;
  font-family: var(--font-display);
  font-weight: 700;
}

.preset-row {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.preset-btn {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color var(--transition-base),
    background-color var(--transition-base),
    color var(--transition-base);
}

.preset-btn.active {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
  color: var(--color-accent-strong);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
}

.summary-card {
  padding: var(--space-4);
}

.summary-card-wfo {
  background: var(--color-wfo-bg);
  border-color: rgba(26, 107, 64, 0.24);
  color: var(--color-wfo-text);
}

.summary-card-wfh {
  background: var(--color-wfh-bg);
  border-color: rgba(26, 59, 122, 0.24);
  color: var(--color-wfh-text);
}

.summary-card-leave {
  background: var(--color-leave-bg);
  border-color: rgba(122, 26, 26, 0.24);
  color: var(--color-leave-text);
}

.summary-card-wfo .summary-title,
.summary-card-wfh .summary-title,
.summary-card-leave .summary-title {
  color: currentColor;
  opacity: 0.9;
}

.summary-title {
  color: var(--color-text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--space-1);
  font-weight: 600;
}

.summary-value {
  font-size: 26px;
  font-weight: 800;
  font-family: var(--font-display);
}

.history {
  padding: var(--space-5);
}

.section-title {
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
  font-weight: 600;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 4px;
  border-bottom: 1px solid var(--color-border);
}

.record-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-info {
  display: flex;
  flex-direction: column;
}

.record-name {
  font-size: 14px;
  font-weight: 600;
}

.record-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.state {
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-6) var(--space-4);
}

.state.error {
  color: var(--color-danger);
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .reports-page {
    padding: var(--space-5) var(--space-4);
  }

  .header-subtitle {
    font-size: 18px;
  }

  .history {
    padding: var(--space-4);
  }

  .history-item {
    gap: var(--space-3);
  }
}
</style>
