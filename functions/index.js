const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.updateStatus = functions.https.onRequest(async (req, res) => {
  try {
    const { name, status, time } = req.body;

    await db.collection("users").add({
      name,
      status,
      time,
      timestamp: Date.now(),
    });

    res.send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});