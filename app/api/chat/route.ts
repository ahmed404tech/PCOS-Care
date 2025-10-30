import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, profile, lang } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

    const system = `You are a careful, supportive health assistant helping a woman with PCOS.
Use evidence-based guidance and be empathetic. If emergencies arise, suggest contacting a doctor.
Patient profile: ${JSON.stringify(profile || {})}
Language: ${lang === 'ar' ? 'Arabic' : 'English'}.
Respond ONLY in the specified language.`;

    const content = [
      { parts: [{ text: system }] },
      ...messages.map((m: any) => ({ parts: [{ text: `${m.role === "user" ? "User" : "Assistant"}: ${m.content}` }] })),
    ];

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: content, generationConfig: { temperature: 0.4 } }),
    });
    const result = await res.json();
    const text: string = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json({ reply: text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}


