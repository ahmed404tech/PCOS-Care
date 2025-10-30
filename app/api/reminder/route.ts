import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/firebase/config";
import { addDoc, collection, getDocs } from "firebase/firestore";

export async function GET() {
  const db = getDb();
  const qs = await getDocs(collection(db, "reminders"));
  const items: any[] = [];
  qs.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();
    const ref = await addDoc(collection(db, "reminders"), body);
    return NextResponse.json({ id: ref.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}


