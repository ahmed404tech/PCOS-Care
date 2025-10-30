"use client";
import { useEffect, useMemo, useState } from "react";
import { getDb } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Cell = {
  date: string; // YYYY-MM-DD
  mood?: string;
  period?: boolean;
};

export default function MoodCalendar() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);

  const monthStart = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const title = useMemo(() => monthStart.toLocaleString("default", { month: "long", year: "numeric" }), [monthStart]);

  useEffect(() => {
    const d = new Date(monthStart);
    const month = d.getMonth();
    const arr: Cell[] = [];
    while (d.getMonth() === month) {
      arr.push({ date: d.toISOString().slice(0, 10) });
      d.setDate(d.getDate() + 1);
    }
    setCells(arr);
    // fetch moods/period for this month
    (async () => {
      const db = getDb();
      const updates = await Promise.all(
        arr.map(async (c) => {
          const snap = await getDoc(doc(db, `users/ahmedbano/dailyLogs/${c.date}`));
          return { date: c.date, mood: snap.get("mood"), period: snap.get("periodStatus") } as Cell;
        })
      );
      setCells(updates);
    })();
  }, [monthStart]);

  async function togglePeriod(date: string) {
    const db = getDb();
    const ref = doc(db, `users/ahmedbano/dailyLogs/${date}`);
    const snap = await getDoc(ref);
    const current = !!snap.get("periodStatus");
    await setDoc(ref, { date, periodStatus: !current }, { merge: true });
    setCells((prev) => prev.map((c) => c.date === date ? { ...c, period: !current } : c));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setMonthOffset((m) => m - 1)} className="px-2 py-1 text-xs rounded-lg bg-pink-100 text-pink-700">Prev</button>
        <div className="text-pink-700 font-medium">{title}</div>
        <button onClick={() => setMonthOffset((m) => m + 1)} className="px-2 py-1 text-xs rounded-lg bg-pink-100 text-pink-700">Next</button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((c) => (
          <button
            key={c.date}
            onClick={() => togglePeriod(c.date)}
            className={`aspect-square rounded-xl border text-xs flex flex-col items-center justify-center ${c.period ? "bg-rose-100 border-rose-200" : "bg-white border-pink-100"}`}
            title={`Mood: ${c.mood || "-"}`}
          >
            <span className="text-pink-700">{c.date.split("-")[2]}</span>
            <span className="text-lg">{c.mood || ""}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


