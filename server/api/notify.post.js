import { getAdminDb } from "../utils/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const COOLDOWN_MS = 2 * 60 * 1000; // min gap between any two sends for the same person/day
const MAX_NOTIFICATIONS_PER_DAY = 3;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, status, time, teamId, uid, dateKey } = body;

  if (!teamId) {
    throw createError({ statusCode: 400, message: 'teamId is required' });
  }
  if (!uid || !dateKey) {
    throw createError({ statusCode: 400, message: 'uid and dateKey are required' });
  }

  const teamSnap = await getAdminDb().collection('teams').doc(teamId).get();
  if (!teamSnap.exists) {
    throw createError({ statusCode: 404, message: 'Team not found' });
  }
  const webhookUrl = teamSnap.data()?.webhookUrl;
  if (!webhookUrl) {
    throw createError({ statusCode: 500, message: 'Webhook URL not configured for this team' });
  }

  const statusRef = getAdminDb().collection('status').doc(`${uid}_${dateKey}`);
  const statusSnap = await statusRef.get();
  const statusData = statusSnap.exists ? statusSnap.data() : {};

  // Same value already notified today -> no-op, don't spend cooldown/cap budget
  if (statusData.notifiedStatus && statusData.notifiedStatus === status) {
    return { ok: true, skipped: true, reason: 'duplicate-status' };
  }

  // Minimum gap between sends
  if (
    statusData.lastNotifiedAt &&
    Date.now() - statusData.lastNotifiedAt < COOLDOWN_MS
  ) {
    throw createError({
      statusCode: 429,
      message: 'Please wait a bit before sending another notification.'
    });
  }

  // Daily cap
  if ((statusData.notifyCount || 0) >= MAX_NOTIFICATIONS_PER_DAY) {
    throw createError({
      statusCode: 429,
      message: 'Daily notification limit reached for today.'
    });
  }

  const message = {
    text: `${name}\n ${status} checked in at ${time}`,
  };

  await $fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  await statusRef.set(
    {
      notifiedStatus: status,
      lastNotifiedAt: Date.now(),
      notifyCount: FieldValue.increment(1)
    },
    { merge: true }
  );

  return { ok: true };
});
