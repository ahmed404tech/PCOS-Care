"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type LocaleCtx = {
  lang: "en" | "ar";
  toggle: () => void;
  t: (key: string) => string;
};

const Ctx = createContext<LocaleCtx | null>(null);
const STORAGE_KEY = "pcos_lang";

const dict: Record<string, { en: string; ar: string }> = {
  Dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  Blog: { en: "Blog", ar: "مدونة" },
  "Daily Entry": { en: "Daily Entry", ar: "إدخال يومي" },
  "Today AI": { en: "Today AI", ar: "ذكاء اليوم" },
  Trends: { en: "Trends", ar: "الرسوم" },
  "Period & Mood": { en: "Period & Mood", ar: "الدورة والمزاج" },
  "Daily Log": { en: "Daily Log", ar: "سجل يومي" },
  "Refresh AI Advice": { en: "Refresh AI Advice", ar: "تحديث نصائح الذكاء" },
};

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as any) : null;
    if (saved === "ar" || saved === "en") setLang(saved);
  }, []);
  function toggle() {
    setLang((l) => {
      const next = l === "en" ? "ar" : "en";
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }
  const t = (key: string) => (dict[key]?.[lang] ?? key);
  const value = useMemo(() => ({ lang, toggle, t }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}


