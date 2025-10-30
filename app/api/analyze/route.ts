import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/firebase/config";
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const date: string = body?.date || new Date().toISOString().slice(0, 10);
    const lang: string | undefined = body?.lang;
    const db = getDb();
    const ref = doc(db, `users/ahmedbano/dailyLogs/${date}`);
    const snap = await getDoc(ref);
    const data = body?.data || snap.data();

    // Build recent trend summary (last 14 days)
    const q = query(collection(db, `users/ahmedbano/dailyLogs`), orderBy("date", "asc"));
    const qs = await getDocs(q);
    const all = qs.docs.map((d)=> ({ id: d.id, ...(d.data() as any) }));
    const last14 = all.slice(-14);
    const last7 = all.slice(-7);
    function avg(arr: number[]) { return arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : 0; }
    const trend = {
      count14: last14.length,
      avgSleep7: avg(last7.map((x:any)=> Number(x.sleepHours||0))).toFixed(1),
      avgActivity7: avg(last7.map((x:any)=> Number(x.activityMinutes||0))).toFixed(0),
      avgWeight7: avg(last7.map((x:any)=> Number(x.weight||0))).toFixed(1),
      weightDelta: (last7.length>=2) ? (Number(last7[last7.length-1].weight||0) - Number(last7[0].weight||0)).toFixed(1) : "0",
      periodDays14: last14.filter((x:any)=> !!x.periodStatus).length,
      moodSamples7: last7.map((x:any)=> x.mood).filter(Boolean),
      stressDistribution7: {
        low: last7.filter((x:any)=> x.stressLevel==="low").length,
        medium: last7.filter((x:any)=> x.stressLevel==="medium").length,
        high: last7.filter((x:any)=> x.stressLevel==="high").length,
      },
    };

    const prompt = `You are a supportive PCOS health assistant. Analyze the following data and return MARKDOWN sections:
    ## Summary\n- one short paragraph (2 sentences max)
 one short paragraph (2 sentences max)
    ## Advice\n- 4 concise, personalized bullet points
    ## Metabolic & Lifestyle\n- short bullet points reflecting insulin resistance, weight trends, sleep, activity
    ## Cycle & Symptoms\n- highlight period pattern, symptoms from profile
    ## Mental Health\n- 2 bullet points reflecting stress, anxiety, focus, energy, with coping tips
    Be empathetic, evidence-aligned, and actionable. Avoid medical diagnosis; recommend consulting a clinician when relevant.
    Language: ${lang === 'ar' ? 'Arabic' : 'English'}. Respond ONLY in the specified language.
    Data: ${JSON.stringify({
      sleepHours: data?.sleepHours,
      weight: data?.weight,
      activityMinutes: data?.activityMinutes,
      meals: data?.meals,
      mealsBreakfast: data?.mealsBreakfast,
      mealsLunch: data?.mealsLunch,
      mealsDinner: data?.mealsDinner,
      mealsSnacks: data?.mealsSnacks,
      mood: data?.mood,
      stressLevel: data?.stressLevel,
      periodStatus: data?.periodStatus,
      mentalHealth: data?.mentalHealth,
      profile: (await (async ()=>{ try { return (await getDoc(doc(db, `users/ahmedbano/profile`))).data() } catch { return null } })()),
      date,
      trend,
    })}`;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 },
      }),
    });
    const result = await res.json();
    const text: string = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let cleaned = String(text).trim();
    // strip code fences if present
    if (/^```/.test(cleaned)) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/,'').replace(/```$/,'').trim();
    }
    let summary = ""; let advice = "";
    // try JSON with keys
    try {
      const maybe = JSON.parse(cleaned);
      if (maybe && (maybe.summary || maybe.advice)) {
        summary = maybe.summary || "";
        advice = maybe.advice || "";
      }
    } catch {}
    // try markdown sections
    if (!summary && /##\s*Summary/i.test(cleaned)) {
      const s = cleaned.match(/##\s*Summary[\r\n]+([\s\S]*?)(?=##\s*Advice|$)/i);
      summary = s?.[1]?.trim() || summary;
    }
    if (!advice && /##\s*Advice/i.test(cleaned)) {
      const a = cleaned.match(/##\s*Advice[\r\n]+([\s\S]*)/i);
      advice = a?.[1]?.trim() || advice;
    }
    // final fallback: split by Advice:
    if (!summary && !advice) {
      const parts = cleaned.split(/Advice\s*:?/i);
      summary = parts[0]?.trim() || "";
      advice = parts[1]?.trim() || "";
    }

    await setDoc(ref, { aiSummary: summary, aiAdvice: advice, date }, { merge: true });
    return NextResponse.json({ ok: true, summary, advice });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}


