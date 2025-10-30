import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/firebase/config";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "en";
    const db = getDb();
    const profileSnap = await getDoc(doc(db, `users/ahmedbano/profile`));
    const profile = profileSnap.data() || {};
    const qs = await getDocs(query(collection(db, `users/ahmedbano/dailyLogs`), orderBy("date", "asc")));
    const all = qs.docs.map((d)=> ({ id: d.id, ...(d.data() as any) }));
    const latest = all[all.length - 1] || {};

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

    const prompt = `Write one short, uplifting motivational line for a woman with PCOS based on the info below. Be warm, encouraging, and specific but under 18 words. Avoid medical claims.
Language: ${lang === 'ar' ? 'Arabic' : 'English'}. Respond ONLY in the specified language.
Profile: ${JSON.stringify(profile)}
Latest: ${JSON.stringify(latest)}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } }),
    });
    const result = await res.json();
    const text: string = result?.candidates?.[0]?.content?.parts?.[0]?.text || "You’ve got this—small steps add up.";
    return NextResponse.json({ message: text }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}


