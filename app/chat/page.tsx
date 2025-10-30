"use client";
import Chat from "@/app/components/Chat";
import Link from "next/link";
import { getDb } from "@/firebase/config";
import { collection, deleteDoc, getDocs } from "firebase/firestore";
import { useLocale } from "@/app/providers/LocaleProvider";

export default function ChatPage() {
  const { lang } = useLocale();

  async function clearAll() {
    const db = getDb();
    const qs = await getDocs(collection(db, `users/ahmedbano/chatMessages`));
    await Promise.all(qs.docs.map((d) => deleteDoc(d.ref)));
  }

  return (
    <div className="fixed inset-0 z-30 bg-gradient-to-b from-white to-[#fafafa]">
      {/* Top bar */}
      <div className="safe-pad py-3">
        <div className="widget px-3 sm:px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="inline-flex items-center justify-center w-9 h-9 rounded-xl hover:bg-pink-50" aria-label="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <div className="text-pink-700 font-semibold">Ahmed Ai</div>
          </div>
          <button onClick={clearAll} className="text-sm text-rose-700 hover:underline">
            {lang === "en" ? "Delete chat" : "حذف المحادثة"}
          </button>
        </div>
      </div>
      {/* Chat area */}
      <div className="safe-pad pb-6">
        <div className="h-[calc(100vh-96px)]">
          <Chat hideHeader />
        </div>
      </div>
    </div>
  );
}


