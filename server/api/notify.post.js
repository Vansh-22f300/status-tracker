export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, status, time } = body;

  const webhookUrl = process.env.GCHAT_WEBHOOK_URL;
  if (!webhookUrl) {
    throw createError({ statusCode: 500, message: "Webhook URL not configured" });
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