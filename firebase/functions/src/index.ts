// import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
// import fetch from "node-fetch";

// admin.initializeApp();
// const db = admin.firestore();

// export const scheduledDailyReminders = functions.pubsub
//   .schedule("0 8 * * *")
//   .timeZone("Etc/UTC")
//   .onRun(async () => {
//     const settingsSnap = await db.collection("settings").get();
//     const settings = settingsSnap.docs[0]?.data() || {};
//     if (!settings.notificationEnabled || !settings.email) return null;

//     const remindersSnap = await db.collection("reminders").get();
//     const items = remindersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
//     const messages = items.map((r) => r.message).join("\n");

//     const sgKey = process.env.SENDGRID_API_KEY;
//     if (!sgKey) return null;

//     await fetch("https://api.sendgrid.com/v3/mail/send", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${sgKey}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         personalizations: [{ to: [{ email: settings.email }], subject: "PCOS Daily Reminders" }],
//         from: { email: "no-reply@pcos-app.local" },
//         content: [{ type: "text/plain", value: messages || "Stay well today!" }],
//       }),
//     });
//     return null;
//   });

// export const analyzeAndSave = functions.https.onCall(async (data) => {
//   const { date } = data || {};
//   const ref = db.doc(`users/ahmedbano/dailyLogs/${date}`);
//   const snap = await ref.get();
//   const payload = snap.data();
//   const apiKey = process.env.GEMINI_API_KEY;
//   if (!apiKey) throw new functions.https.HttpsError("failed-precondition", "Missing GEMINI_API_KEY");
//   const prompt = `Analyze the following health data for a female with PCOS and provide a JSON with keys summary and advice (short): ${JSON.stringify(payload)}`;
//   const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
//   });
//   const result = await res.json();
//   const text: string = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
//   let summary = ""; let advice = "";
//   try { const p = JSON.parse(text); summary = p.summary || ""; advice = p.advice || ""; } catch {}
//   await ref.set({ aiSummary: summary, aiAdvice: advice, date }, { merge: true });
//   return { summary, advice };
// });


