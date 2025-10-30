"use client";
import { useEffect, useState } from "react";
import { getDb } from "@/firebase/config";
import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";

type Treatment = { id?: string; name: string; dose?: string; time: string; notes?: string };

export default function TreatmentSchedule() {
  const [items, setItems] = useState<Treatment[]>([]);
  const [form, setForm] = useState<Treatment>({ name: "Metformin", dose: "500mg", time: "08:00", notes: "with meal" });

  async function load() {
    const db = getDb();
    const qs = await getDocs(collection(db, `users/ahmedbano/treatments`));
    const arr: Treatment[] = [];
    qs.forEach((d)=> arr.push({ id: d.id, ...(d.data() as any) }));
    setItems(arr);
  }
  useEffect(()=>{ load(); },[]);

  async function add() {
    const db = getDb();
    await addDoc(collection(db, `users/ahmedbano/treatments`), form);
    setForm({ name: "", dose: "", time: "08:00", notes: "" });
    await load();
  }
  async function remove(id?: string) {
    if (!id) return;
    const db = getDb();
    await deleteDoc(doc(db, `users/ahmedbano/treatments/${id}`));
    await load();
  }

  return (
    <div className="bg-white/80 border border-pink-100 rounded-2xl p-4">
      <h2 className="text-pink-700 font-medium mb-3">Treatments</h2>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <input placeholder="Name" className="rounded-xl border border-pink-200 px-3 py-2" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
        <input placeholder="Dose" className="rounded-xl border border-pink-200 px-3 py-2" value={form.dose} onChange={(e)=>setForm({...form,dose:e.target.value})} />
        <input type="time" className="rounded-xl border border-pink-200 px-3 py-2" value={form.time} onChange={(e)=>setForm({...form,time:e.target.value})} />
        <input placeholder="Notes" className="rounded-xl border border-pink-200 px-3 py-2" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} />
      </div>
      <button onClick={add} className="mb-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-4 py-2">Add</button>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-pink-700">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Dose</th>
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((t)=> (
              <tr key={t.id} className="border-t border-pink-100">
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.dose}</td>
                <td className="p-2">{t.time}</td>
                <td className="p-2">{t.notes}</td>
                <td className="p-2 text-right"><button onClick={()=>remove(t.id)} className="text-rose-600">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


