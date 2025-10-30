"use client";
import { useState } from "react";
import { getDb } from "@/firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useLocale } from "@/app/providers/LocaleProvider";

type DailyData = {
  date: string;
  sleepHours: number;
  weight: number;
  activityMinutes: number;
  mealsBreakfast: string;
  mealsLunch: string;
  mealsDinner: string;
  mealsSnacks: string;
  mood: string;
  stressLevel: "low" | "medium" | "high";
  periodStatus: boolean;
  mentalHealth?: {
    anxietyLevel?: number; // 0-10
    energyLevel?: number; // 0-10
    focusLevel?: number; // 0-10
    irritability?: "low" | "medium" | "high";
    notes?: string;
  };
};

export default function DailyForm({ onSaved }: { onSaved?: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const { lang } = useLocale();
  const [form, setForm] = useState<DailyData>({
    date: today,
    sleepHours: 7,
    weight: 70,
    activityMinutes: 30,
    mealsBreakfast: "",
    mealsLunch: "",
    mealsDinner: "",
    mealsSnacks: "",
    mood: "🙂",
    stressLevel: "medium",
    periodStatus: false,
    mentalHealth: { anxietyLevel: 3, energyLevel: 6, focusLevel: 6, irritability: "medium", notes: "" },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const db = getDb();
      const ref = doc(db, `users/ahmedbano/dailyLogs/${form.date}`);
      await setDoc(ref, {
        ...form,
        // retain backward-compat summary string
        meals: `Breakfast: ${form.mealsBreakfast}\nLunch: ${form.mealsLunch}\nDinner: ${form.mealsDinner}\nSnacks: ${form.mealsSnacks}`,
        aiSummary: "",
        aiAdvice: "",
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: form.date, data: form, lang }),
      });
      if (!res.ok) throw new Error("AI analysis failed");
      setMessage("Saved and analyzed successfully.");
      onSaved?.();
    } catch (err: any) {
      setMessage(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-pink-700 mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-pink-700 mb-1">Sleep (hrs)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={form.sleepHours}
            onChange={(e) => setForm({ ...form, sleepHours: Number(e.target.value) })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-pink-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-pink-700 mb-1">Activity (min)</label>
          <input
            type="number"
            min={0}
            value={form.activityMinutes}
            onChange={(e) => setForm({ ...form, activityMinutes: Number(e.target.value) })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-pink-700 mb-1">Meals</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Breakfast"
            value={form.mealsBreakfast}
            onChange={(e)=>setForm({ ...form, mealsBreakfast: e.target.value })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2"
          />
          <input
            placeholder="Lunch"
            value={form.mealsLunch}
            onChange={(e)=>setForm({ ...form, mealsLunch: e.target.value })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2"
          />
          <input
            placeholder="Dinner"
            value={form.mealsDinner}
            onChange={(e)=>setForm({ ...form, mealsDinner: e.target.value })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2"
          />
          <input
            placeholder="Snacks"
            value={form.mealsSnacks}
            onChange={(e)=>setForm({ ...form, mealsSnacks: e.target.value })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-pink-700 mb-1">Mood</label>
          <select
            value={form.mood}
            onChange={(e) => setForm({ ...form, mood: e.target.value })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2"
          >
            <option>😊</option>
            <option>🙂</option>
            <option>😐</option>
            <option>😕</option>
            <option>😔</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-pink-700 mb-1">Stress</label>
          <select
            value={form.stressLevel}
            onChange={(e) => setForm({ ...form, stressLevel: e.target.value as any })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <label className="text-sm text-pink-700">Period On?</label>
          <input
            type="checkbox"
            checked={form.periodStatus}
            onChange={(e) => setForm({ ...form, periodStatus: e.target.checked })}
            className="h-5 w-5 accent-pink-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-pink-700 mb-1">Anxiety (0-10)</label>
          <input type="number" min={0} max={10} value={form.mentalHealth?.anxietyLevel ?? 0}
            onChange={(e)=> setForm({ ...form, mentalHealth: { ...(form.mentalHealth||{}), anxietyLevel: Number(e.target.value) } })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-pink-700 mb-1">Energy (0-10)</label>
          <input type="number" min={0} max={10} value={form.mentalHealth?.energyLevel ?? 0}
            onChange={(e)=> setForm({ ...form, mentalHealth: { ...(form.mentalHealth||{}), energyLevel: Number(e.target.value) } })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-pink-700 mb-1">Focus (0-10)</label>
          <input type="number" min={0} max={10} value={form.mentalHealth?.focusLevel ?? 0}
            onChange={(e)=> setForm({ ...form, mentalHealth: { ...(form.mentalHealth||{}), focusLevel: Number(e.target.value) } })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-pink-700 mb-1">Irritability</label>
          <select value={form.mentalHealth?.irritability ?? "medium"}
            onChange={(e)=> setForm({ ...form, mentalHealth: { ...(form.mentalHealth||{}), irritability: e.target.value as any } })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm text-pink-700 mb-1">Mental Health Notes</label>
          <textarea value={form.mentalHealth?.notes ?? ""}
            onChange={(e)=> setForm({ ...form, mentalHealth: { ...(form.mentalHealth||{}), notes: e.target.value } })}
            className="w-full rounded-xl border border-pink-200 px-3 py-2 min-h-[80px]" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl py-2 transition disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save & Analyze"}
      </button>
      {message && <p className="text-sm text-pink-700">{message}</p>}
    </form>
  );
}


