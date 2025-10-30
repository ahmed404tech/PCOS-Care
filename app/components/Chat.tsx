"use client";
import { useEffect, useRef, useState } from "react";
import { getDb } from "@/firebase/config";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useLocale } from "@/app/providers/LocaleProvider";
import { renderMarkdown } from "@/app/lib/md";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat({ hideHeader = false }: { hideHeader?: boolean }) {
  const { lang } = useLocale();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typingContent, setTypingContent] = useState<string>("");
  const endRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const db = getDb();
    (async () => {
      const snap = await getDoc(doc(db, `users/ahmedbano/profile`));
      setProfile(snap.data() || {});
    })();
    const q = query(collection(db, `users/ahmedbano/chatMessages`), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (qs) => {
      const arr: Msg[] = [];
      qs.forEach((d) => arr.push({ role: (d.data() as any).role, content: (d.data() as any).content }));
      if (arr.length === 0) {
        arr.push({ role: "assistant", content: lang === "en" ? "Hi! How can I support your PCOS journey today?" : "مرحبًا! كيف أستطيع دعم رحلتك مع تكيس المبايض اليوم؟" });
      }
      setMessages(arr);
    });
    return () => unsub();
  }, []);

  async function send() {
    if (!input.trim()) return;
    const db = getDb();
    await addDoc(collection(db, `users/ahmedbano/chatMessages`), {
      role: "user",
      content: input,
      lang,
      createdAt: serverTimestamp(),
    });
    setInput("");
    setLoading(true);
    try {
      const context: Msg[] = [...messages, { role: "user", content: input }];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: context.slice(-10), profile, lang }),
      });
      const json = await res.json();
      const full = String(json.reply || "");
      // typing animation (local only)
      let i = 0;
      setTypingContent("");
      const interval = setInterval(() => {
        i += Math.max(1, Math.floor(full.length / 100));
        setTypingContent(full.slice(0, i));
        if (i >= full.length) clearInterval(interval);
      }, 16);
      // persist assistant message when complete
      const finalize = async () => {
        await addDoc(collection(db, `users/ahmedbano/chatMessages`), {
          role: "assistant",
          content: full,
          lang,
          createdAt: serverTimestamp(),
        });
        setTypingContent("");
      };
      setTimeout(finalize, Math.max(300, Math.min(4000, full.length * 16)));
    } finally {
      setLoading(false);
    }
  }

  async function clearAll() {
    const db = getDb();
    const qs = await getDocs(collection(db, `users/ahmedbano/chatMessages`));
    await Promise.all(qs.docs.map((d) => deleteDoc(d.ref)));
    setTypingContent("");
  }

  return (
    <div className="flex flex-col h-full bg-white/80 border border-pink-100 rounded-2xl shadow">
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="text-pink-700 font-medium">{lang === "en" ? "AI Chat" : "دردشة الذكاء"}</div>
          <button onClick={clearAll} className="text-sm text-rose-700 hover:underline">{lang === "en" ? "Clear chat" : "مسح المحادثة"}</button>
        </div>
      )}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((m, i) => (
          m.role === "user" ? (
            <div key={i} className="max-w-[80%] ml-auto bg-pink-500 text-white p-3 rounded-2xl shadow">
              {m.content}
            </div>
          ) : (
            <div key={i} className="max-w-[80%] bg-white border border-pink-100 p-3 rounded-2xl shadow">
              <div className="prose prose-pink max-w-none text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
            </div>
          )
        ))}
        {typingContent && (
          <div className="max-w-[80%] bg-white border border-pink-100 p-3 rounded-2xl shadow">
            <div className="prose prose-pink max-w-none text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(typingContent) }} />
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-pink-100 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl border border-pink-200 px-3 py-2"
          placeholder={lang === "en" ? "Type your message..." : "اكتب رسالتك..."}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
        />
        <button onClick={send} disabled={loading} className="px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-xl">
          {loading ? (lang === "en" ? "Sending" : "جارٍ الإرسال") : (lang === "en" ? "Send" : "إرسال")}
        </button>
      </div>
    </div>
  );
}


