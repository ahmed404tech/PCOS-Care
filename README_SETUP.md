# PCOS Personal App – Setup Guide

This is a private web app for a single patient (ahmedbano) to track PCOS-related daily metrics, view AI insights, and receive reminders.

## 1) Install dependencies

```bash
npm install
# required libs
npm install firebase recharts
```

If you deploy Firebase Functions (optional for email reminders):

```bash
npm install -g firebase-tools
cd firebase/functions
npm init -y
npm install firebase-admin firebase-functions node-fetch@2
```

## 2) Environment variables

Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=AIzaSyB6JqeZ9ptr3uc-XPxIrypceWzjIF4ie7k
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_SENDER_ID=your_sender_id
SENDGRID_API_KEY=your_sendgrid_key
```

Notes:
- The app uses client Firestore. Use the NEXT_PUBLIC_ variants as above.
- For Cloud Functions, also set GEMINI_API_KEY and SENDGRID_API_KEY as function env vars via Firebase console or `firebase functions:config:set` if preferred.

## 3) Start the app locally

```bash
npm run dev
```
Open `http://localhost:3000` and you will be redirected to login.

- Username: `ahmedbano`
- Password: `imissyou`

## 4) How to use

- Fill the Daily Entry form (sleep, weight, activity, meals, mood, stress, period toggle).
- Click Save & Analyze to save to Firestore under `/users/ahmedbano/dailyLogs/{YYYY-MM-DD}` and trigger AI.
- The Today AI card shows a short summary and advice.
- The Trends section shows charts for weight, sleep, activity.
- Period & Mood displays a calendar; click a day to toggle period; hover shows mood.
- Daily Log lists past entries.
- Click Refresh AI Advice to regenerate for today.

## 5) Test AI analysis

- Enter data and click Save & Analyze. The server route `/api/analyze` calls Gemini 2.5 Flash and stores:
  - `aiSummary: string`
  - `aiAdvice: string`

Check Firestore document at `/users/ahmedbano/dailyLogs/{YYYY-MM-DD}`.

## 6) Email reminders (Firebase Functions + SendGrid)

Reminders in Firestore (`/reminders/{id}`):

```json
{
  "type": "water" | "exercise" | "medicine" | "cycle",
  "time": "08:00",
  "message": "Remember to drink enough water today!"
}
```

Settings (`/settings/{id}`):

```json
{
  "email": "you@example.com",
  "notificationEnabled": true
}
```

A scheduled Cloud Function sends a daily email at 08:00 UTC that aggregates all reminders.

### Deploy Firebase Functions

1) Initialize Firebase in this project (once):
```bash
firebase login
firebase init functions
```
If you already have `firebase/functions/src/index.ts` created by this app, keep it and configure TypeScript if prompted.

2) Set env in Functions (optional, or use console):
```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
```
(or set runtime env variables via the Firebase Console). Ensure `GEMINI_API_KEY` is set in Functions env as well.

3) Deploy:

```bash
firebase deploy --only functions
```

## 7) Seed default reminders (optional)

Use the API route or Firestore console to create example reminders:

```bash
curl -X POST http://localhost:3000/api/reminder \
  -H "Content-Type: application/json" \
  -d '{"type":"water","time":"08:00","message":"Remember to drink enough water today!"}'
```

## 8) Notes

- This is a private single-patient app with simple localStorage auth; no Firebase Auth is used.
- Keep your `.env.local` safe; do not commit.
- If charts do not render, ensure `recharts` is installed.
- If Firestore access fails, verify the Firebase project ID and web app credentials.

## 9) Troubleshooting

- Missing Gemini key: add `GEMINI_API_KEY` to `.env.local` and restart dev server.
- Firestore permission errors: in development, set Firestore Security Rules appropriately for testing.
- SendGrid 401: verify `SENDGRID_API_KEY` in Functions runtime env.
