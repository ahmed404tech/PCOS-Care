"use client";
import { useEffect, useMemo, useState } from "react";
import DailyForm from "@/app/components/DailyForm";
import { getDb } from "@/firebase/config";
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query } from "firebase/firestore";
import dynamic from "next/dynamic";
import Link from "next/link";
import MotivationTicker from "@/app/components/MotivationTicker";
import Chat from "@/app/components/Chat";
import { renderMarkdown } from "@/app/lib/md";
import { useLocale } from "@/app/providers/LocaleProvider";

const STORAGE_KEY = "pcos_app_session";
const Charts = dynamic(() => import("@/app/components/DashboardCharts"), { ssr: false });
const MoodCalendar = dynamic(() => import("@/app/components/MoodCalendar"), { ssr: false });

type DailyLog = {
  sleepHours: number;
  weight: number;
  activityMinutes: number;
  meals?: string;
  mealsBreakfast?: string;
  mealsLunch?: string;
  mealsDinner?: string;
  mood: string;
  stressLevel: string;
  periodStatus: boolean;
  aiSummary?: string;
  aiAdvice?: string;
};

export default function DashboardPage() {
  const { lang } = useLocale();
  const [authorized, setAuthorized] = useState(false);
  const [todaySummary, setTodaySummary] = useState<string>("");
  const [todayAdvice, setTodayAdvice] = useState<string>("");
  const [logs, setLogs] = useState<Array<{ id: string; data: DailyLog }>>([]);
  const todayId = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function extractDisplayText(input: any, key?: "summary" | "advice"): string {
    if (!input) return "";
    // If it's an object already
    if (typeof input === "object") {
      if (key && input[key]) return String(input[key]);
      if (input.summary || input.advice) return String(input.summary || input.advice || "");
      try { return JSON.stringify(input); } catch { return String(input); }
    }
    const text = String(input).trim();
    // Try to parse JSON
    if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"))) {
      try {
        const parsed = JSON.parse(text);
        if (key && parsed?.[key]) return String(parsed[key]);
        if (parsed?.summary || parsed?.advice) return String(parsed.summary || parsed.advice || "");
      } catch {}
    }
    // Strip code fences if JSON is fenced
    const fenced = text.replace(/^```[a-zA-Z]*\n?([\s\S]*?)```$/m, "$1").trim();
    if (fenced !== text) {
      try {
        const parsed = JSON.parse(fenced);
        if (key && parsed?.[key]) return String(parsed[key]);
        if (parsed?.summary || parsed?.advice) return String(parsed.summary || parsed.advice || "");
      } catch {}
    }
    return text;
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem(STORAGE_KEY);
      setAuthorized(session === "authenticated");
    }
  }, []);

  useEffect(() => {
    if (!authorized) return;
    const db = getDb();
    const docRef = doc(db, `users/ahmedbano/dailyLogs/${todayId}`);
    const unsub = onSnapshot(docRef, (snap) => {
      setTodaySummary(snap.get("aiSummary") || "");
      setTodayAdvice(snap.get("aiAdvice") || "");
    });
    (async () => {
      const q = query(collection(db, `users/ahmedbano/dailyLogs`), orderBy("date", "asc"));
      const qs = await getDocs(q);
      const items: Array<{ id: string; data: DailyLog }> = [];
      qs.forEach((d) => items.push({ id: d.id, data: d.data() as any }));
      setLogs(items);
    })();
    return () => unsub();
  }, [authorized, todayId]);

  async function refreshAI() {
    await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: todayId, lang }),
      cache: "no-store" as any,
    });
    // onSnapshot will update the UI when Firestore writes complete
  }

  // auto refresh AI when language changes to ensure localized text
  useEffect(() => {
    if (!authorized) return;
    refreshAI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-violet-50 p-4">
        <div className="bg-white/80 border border-pink-100 rounded-2xl p-8 text-center">
          <p className="text-pink-700 mb-4">You are not logged in.</p>
          <Link href="/login" className="text-pink-600 underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-violet-50">
      <header className="flex items-center justify-between px-4 md:px-8 py-4">
        <h1 className="text-xl md:text-2xl font-semibold text-pink-700">PCOS Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { localStorage.removeItem(STORAGE_KEY); location.href = "/login"; }}
            className="px-3 py-2 text-sm bg-pink-100 text-pink-700 rounded-xl hover:bg-pink-200"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="px-3 sm:px-4 md:px-8 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="md:col-span-3"><MotivationTicker /></div>
        {/* Primary Today AI hero widget at top, full width */}
        <section className="md:col-span-2 lg:col-span-3 widget p-4 sm:p-6">
          <h2 className="text-pink-700 font-semibold mb-4 title-xl">Today AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 bg-pink-50/80 rounded-2xl border border-pink-100 shadow-sm">
              <div className="prose prose-pink max-w-none text-base sm:text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(extractDisplayText(todaySummary, "summary") || "No summary yet.") }} />
            </div>
            <div className="p-4 sm:p-5 bg-violet-50/80 rounded-2xl border border-violet-100 shadow-sm">
              <div className="prose max-w-none text-base sm:text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(extractDisplayText(todayAdvice, "advice") || "No advice yet.") }} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex justify-end">
            <button onClick={refreshAI} className="px-4 sm:px-5 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl py-2.5 sm:py-3 transition shadow">
              Refresh AI Advice
            </button>
          </div>
        </section>
        <section className="md:col-span-2 widget p-4 sm:p-5">
          <h2 className="text-pink-700 font-medium mb-3">Daily Entry</h2>
          <DailyForm onSaved={async () => { await refreshAI(); }} />
        </section>

        

        <section className="md:col-span-2 widget p-4 sm:p-5">
          <h2 className="text-pink-700 font-medium mb-3">Trends</h2>
          <Charts logs={logs} />
        </section>

        <section className="widget p-4 sm:p-5">
          <h2 className="text-pink-700 font-medium mb-3">Period & Mood</h2>
          <MoodCalendar />
        </section>

        

        <section className="md:col-span-3 widget p-4 sm:p-5">
          <h2 className="text-pink-700 font-medium mb-3">Daily Log</h2>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-pink-700">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Sleep</th>
                  <th className="text-left p-2">Weight</th>
                  <th className="text-left p-2">Activity</th>
                  <th className="text-left p-2">Mood</th>
                  <th className="text-left p-2">Stress</th>
                  <th className="text-left p-2">Period</th>
                  <th className="text-left p-2">Meals (B/L/D)</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-pink-100">
                    <td className="p-2">{l.id}</td>
                    <td className="p-2">{l.data.sleepHours}</td>
                    <td className="p-2">{l.data.weight}</td>
                    <td className="p-2">{l.data.activityMinutes}</td>
                    <td className="p-2">{l.data.mood}</td>
                    <td className="p-2 capitalize">{l.data.stressLevel}</td>
                    <td className="p-2">{l.data.periodStatus ? "On" : "Off"}</td>
                    <td className="p-2 truncate max-w-[220px]" title={`B:${l.data.mealsBreakfast||"-"} L:${l.data.mealsLunch||"-"} D:${l.data.mealsDinner||"-"}`}>
                      {`B:${(l.data.mealsBreakfast||"-").slice(0,12)} L:${(l.data.mealsLunch||"-").slice(0,12)} D:${(l.data.mealsDinner||"-").slice(0,12)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}


