import fetch from "node-fetch";

export async function analyzeHealthData(data) {
  const prompt = `\n  Analyze the following PCOS-related health data and give a short summary and advice as JSON with keys \'summary\' and \'advice\':\n  ${JSON.stringify(data)}\n  `;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}


