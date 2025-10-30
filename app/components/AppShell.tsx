"use client";
import Link from "next/link";
import { useLocale } from "@/app/providers/LocaleProvider";
import { useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { lang, toggle, t } = useLocale();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fafafa] text-gray-800">
      <nav className="sticky top-0 z-20 backdrop-blur">
        <div className="md:max-w-6xl max-w-none mx-auto safe-pad py-3">
          <div className="widget px-3 sm:px-4 py-2">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="text-pink-700 font-semibold">PCOS Care</Link>
              {/* Desktop nav */}
              <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
                <Link href="/dashboard" className="text-sm text-pink-700 px-3 py-1 rounded-full hover:bg-pink-50">{t("Dashboard")}</Link>
                <Link href="/chat" className="text-sm text-pink-700 px-3 py-1 rounded-full hover:bg-pink-50">AI Chat</Link>
                <Link href="/blog" className="text-sm text-pink-700 px-3 py-1 rounded-full hover:bg-pink-50">{t("Blog")}</Link>
                <button onClick={toggle} className="text-sm bg-pink-500 text-white px-3 py-1 rounded-full hover:bg-pink-600">{lang === "en" ? "AR" : "EN"}</button>
              </div>
              {/* Mobile burger */}
              <button aria-label="Menu" onClick={() => setOpen((o)=>!o)} className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl hover:bg-pink-50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {open ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <>
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            {/* Mobile panel */}
            {open && (
              <div className="sm:hidden mt-2 pt-2 border-t" style={{ borderColor: "var(--hairline)" }}>
                <div className="flex flex-col gap-1">
                  <Link onClick={()=>setOpen(false)} href="/dashboard" className="px-2 py-2 rounded-xl hover:bg-pink-50 text-pink-700">{t("Dashboard")}</Link>
                  <Link onClick={()=>setOpen(false)} href="/chat" className="px-2 py-2 rounded-xl hover:bg-pink-50 text-pink-700">AI Chat</Link>
                  <Link onClick={()=>setOpen(false)} href="/blog" className="px-2 py-2 rounded-xl hover:bg-pink-50 text-pink-700">{t("Blog")}</Link>
                  <button onClick={()=>{ toggle(); setOpen(false); }} className="mt-1 self-start bg-pink-500 text-white px-3 py-1.5 rounded-full hover:bg-pink-600">
                    {lang === "en" ? "AR" : "EN"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="md:max-w-6xl max-w-none mx-auto safe-pad py-4">
        {children}
      </div>
    </div>
  );
}


