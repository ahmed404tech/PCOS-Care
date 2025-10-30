"use client";
import { useEffect, useState } from "react";
import { getDb } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "pcos_app_session";

export default function OnboardingPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    age: 26,
    heightCm: 165,
    weightKg: 70,
    diagnosisDate: "",
    symptoms: {
      irregularCycles: false,
      hirsutism: false,
      acne: false,
      hairLoss: false,
      weightGain: false,
      insulinResistance: false,
    },
    cycleLengthDays: 30,
    medications: "",
    supplements: "",
    comorbidities: "",
    goals: "weight, cycle regularity, energy",
    labs: {
      fastingInsulin: "",
      hba1c: "",
      tsh: "",
      vitaminD: "",
    },
  });

  useEffect(() => {
    const session = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    setAuthorized(session === "authenticated");
    (async () => {
      if (!session) return;
      const db = getDb();
      const snap = await getDoc(doc(db, `users/ahmedbano/profile`));
      if (snap.exists()) router.replace("/dashboard");
    })();
  }, [router]);

  async function submit() {
    setLoading(true);
    try {
      const db = getDb();
      await setDoc(doc(db, `users/ahmedbano/profile`), { ...form, createdAt: new Date().toISOString() }, { merge: true });
      router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#fafafa] p-3 sm:p-4">
      <div className="w-full max-w-2xl widget p-5 sm:p-6">
        <h1 className="text-2xl font-semibold text-pink-700 mb-4">Tell us about your PCOS profile</h1>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-pink-700 mb-1">Name</label>
            <input className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-pink-700 mb-1">Age</label>
            <input type="number" className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.age} onChange={(e)=>setForm({...form,age:Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm text-pink-700 mb-1">Height (cm)</label>
            <input type="number" className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.heightCm} onChange={(e)=>setForm({...form,heightCm:Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm text-pink-700 mb-1">Weight (kg)</label>
            <input type="number" className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.weightKg} onChange={(e)=>setForm({...form,weightKg:Number(e.target.value)})} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-pink-700 mb-1">Diagnosis Date</label>
            <input type="date" className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.diagnosisDate} onChange={(e)=>setForm({...form,diagnosisDate:e.target.value})} />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-sm text-pink-700 mb-1">Symptoms</label>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {Object.keys(form.symptoms).map((k)=> (
              <label key={k} className="flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-xl px-3 py-2">
                <input type="checkbox" checked={form.symptoms[k]} onChange={(e)=>setForm({...form, symptoms:{...form.symptoms, [k]: e.target.checked}})} />
                <span className="capitalize">{k.replace(/([A-Z])/g,' $1')}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-pink-700 mb-1">Cycle Length (days)</label>
            <input type="number" className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.cycleLengthDays} onChange={(e)=>setForm({...form,cycleLengthDays:Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm text-pink-700 mb-1">Medications</label>
            <input className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.medications} onChange={(e)=>setForm({...form,medications:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-pink-700 mb-1">Supplements</label>
            <input className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.supplements} onChange={(e)=>setForm({...form,supplements:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-pink-700 mb-1">Comorbidities</label>
            <input className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.comorbidities} onChange={(e)=>setForm({...form,comorbidities:e.target.value})} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-pink-700 mb-1">Goals</label>
            <input className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.goals} onChange={(e)=>setForm({...form,goals:e.target.value})} />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-sm text-pink-700 mb-1">Labs</label>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Fasting Insulin" className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.labs.fastingInsulin} onChange={(e)=>setForm({...form,labs:{...form.labs, fastingInsulin:e.target.value}})} />
            <input placeholder="HbA1c" className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.labs.hba1c} onChange={(e)=>setForm({...form,labs:{...form.labs, hba1c:e.target.value}})} />
            <input placeholder="TSH" className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.labs.tsh} onChange={(e)=>setForm({...form,labs:{...form.labs, tsh:e.target.value}})} />
            <input placeholder="Vitamin D" className="w-full rounded-xl border border-pink-200 px-3 py-2" value={form.labs.vitaminD} onChange={(e)=>setForm({...form,labs:{...form.labs, vitaminD:e.target.value}})} />
          </div>
        </div>

        <button onClick={submit} disabled={loading} className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white rounded-2xl py-3">
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}


