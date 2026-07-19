import { getAdminDb } from "../utils/firebaseAdmin";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, status, time, teamId } = body;

  if (!teamId) {
    throw createError({ statusCode: 400, message: 'teamId is required' });
  }

  const teamSnap = await getAdminDb().collection('teams').doc(teamId).get();
  if (!teamSnap.exists) {
    throw createError({ statusCode: 404, message: 'Team not found' });
  }

  const webhookUrl = teamSnap.data()?.webhookUrl;
  if (!webhookUrl) {
    throw createError({ statusCode: 500, message: 'Webhook URL not configured for this team' });
  }

  const message = {
    text: `${name}\n ${status} checked in at ${time}`,
  };

  await $fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  return { ok: true };
});
