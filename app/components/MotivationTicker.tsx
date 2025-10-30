"use client";
import { useEffect, useState } from "react";
import { useLocale } from "@/app/providers/LocaleProvider";

export default function MotivationTicker() {
  const { lang } = useLocale();
  const [message, setMessage] = useState<string>("");

  async function fetchMessage() {
    try {
      const res = await fetch(`/api/motivation?lang=${lang}`, { cache: "no-store" });
      const json = await res.json();
      setMessage(json.message || message || (lang === "en" ? "You’ve got this—small steps add up." : "أنتِ قادرة—خطوات صغيرة تصنع فرقًا."));
    } catch {
      setMessage(message || (lang === "en" ? "You’ve got this—small steps add up." : "أنتِ قادرة—خطوات صغيرة تصنع فرقًا."));
    }
  }

  useEffect(() => {
    fetchMessage();
    const intervalMs = 2 * 60 * 1000; // every 2 minutes (can adjust to 5 * 60 * 1000)
    const id = setInterval(fetchMessage, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-900">
      {message || (lang === "en" ? "Loading motivation..." : "جاري جلب رسالة تحفيزية...")}
    </div>
  );
}


