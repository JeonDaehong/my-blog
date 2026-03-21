"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiOutlineBookOpen,
  HiOutlineNewspaper,
  HiOutlineHeart,
  HiArrowRight,
  HiArrowUpRight,
} from "react-icons/hi2";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import CustomCursor from "@/components/CustomCursor";

const LINKS = {
  blog: "/posts",
  cardNews: "/card-news",
  github: "https://github.com/JeonDaehong",
  linkedin: "https://linkedin.com/in/daehong-jeon",
  sponsor: "https://buymeacoffee.com/daehong",
};

const TEXT = {
  ko: {
    title: "대홍의 데이터 기록",
    desc: "하루에 한 걸음씩 꾸준히 성장하는 엔지니어",
    blog: "블로그 읽기",
    cardNews: "카드뉴스 읽기",
    sponsor: "후원하기",
    navBlog: "블로그",
    navCardNews: "카드뉴스",
  },
  en: {
    title: "Daehong's Data Log",
    desc: "An engineer who grows one step at a time, every single day.",
    blog: "Read Blog",
    cardNews: "Read Card News",
    sponsor: "Sponsor",
    navBlog: "Blog",
    navCardNews: "Card News",
  },
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<"ko" | "en">("en");
  const [displayText, setDisplayText] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [views, setViews] = useState<{ total: number; today: number } | null>(null);
  const t = TEXT[lang];

  useEffect(() => {
    setMounted(true);
    // 조회수 기록 & 가져오기
    fetch("/api/views", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/" }) }).catch(() => {});
    fetch("/api/views").then(r => r.json()).then(setViews).catch(() => {});
  }, []);

  useEffect(() => {
    setDisplayText("");
    setTypingDone(false);
    let i = 0;
    const target = TEXT[lang].title;
    const timer = setInterval(() => {
      i++;
      setDisplayText(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(timer);
        setTypingDone(true);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [lang, mounted]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden cursor-none">
      <CustomCursor />
      {/* Gradient blob */}
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(234,88,12,0.35) 0%, rgba(251,191,36,0.15) 40%, transparent 70%)" }}
      />
      <div
        className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)" }}
      />

      {/* Nav */}
      <nav className="relative z-10 max-w-6xl mx-auto px-4 sm:px-10 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/images/img.jpg" alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-white/20" />
            <span className="font-bold text-sm tracking-tight hidden sm:inline">Daehong</span>
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-2">
            <Link href={LINKS.blog} className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white/60 hover:text-white transition-colors whitespace-nowrap">{t.navBlog}</Link>
            <Link href={LINKS.cardNews} className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white/60 hover:text-white transition-colors whitespace-nowrap">{t.navCardNews}</Link>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white/60 hover:text-white transition-colors hidden sm:block">GitHub</a>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="p-2 text-white/60 hover:text-white transition-colors sm:hidden">
              <FaGithub size={16} />
            </a>
            <button
              onClick={() => setLang(lang === "ko" ? "en" : "ko")}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
            >
              <HiOutlineGlobeAlt size={16} />
              {lang === "ko" ? "EN" : "KR"}
            </button>
            <a href={LINKS.sponsor} target="_blank" rel="noopener noreferrer" className="ml-0.5 sm:ml-1 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-white/20 hover:bg-white hover:text-black transition-all whitespace-nowrap">{t.sponsor}</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-12 sm:pt-20 lg:pt-28 pb-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-16">
          {/* Left: text */}
          <div
            className={`flex-1 transition-all duration-1000 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-6" style={{ fontFamily: "var(--font-korean), sans-serif" }}>
              {displayText}
              <span className={`inline-block w-[3px] sm:w-[5px] h-[0.75em] bg-orange-500 ml-1 align-baseline rounded-sm ${typingDone ? "animate-pulse" : ""}`} />
            </h1>
            <p className="text-white/45 text-sm sm:text-base max-w-sm leading-relaxed mb-8">
              {t.desc}
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href={LINKS.blog}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 text-white font-semibold text-sm hover:bg-orange-400 transition-colors"
              >
                <HiOutlineBookOpen size={18} />
                {t.blog}
                <HiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={LINKS.cardNews}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/80 font-medium text-sm hover:bg-white/10 transition-colors"
              >
                <HiOutlineNewspaper size={18} />
                {t.cardNews}
                <HiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: lang === "ko" ? "데이터 엔지니어" : "Data Engineer", color: "bg-blue-500", tooltip: "Hadoop · Spark · Airflow · Kafka · Kubernetes · Iceberg" },
                { label: lang === "ko" ? "백엔드 엔지니어" : "Backend Engineer", color: "bg-violet-500", tooltip: "Java · Python · Spring" },
                { label: lang === "ko" ? "오픈소스 컨트리뷰터" : "OSS Contributor", color: "bg-emerald-500", tooltip: "Spring Kafka · Apache Iceberg · Gravitino" },
              ].map((c) => (
                <span key={c.label} className="relative group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/[0.08] text-xs text-white/50 cursor-default">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.color}`} />
                  {c.label}
                  {c.tooltip && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[11px] text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {c.tooltip}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Right: photo */}
          <div
            className={`flex-shrink-0 w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none lg:w-[360px] xl:w-[420px] mx-auto lg:mx-0 transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-orange-500/5">
              <img
                src="/images/main_1.jpeg"
                alt="전대홍 - 오픈소스 컨퍼런스 발표"
                className="w-full aspect-[3/4] object-cover object-[center_65%]"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors">
              <FaGithub size={16} />
              <span className="text-xs">GitHub</span>
              <HiArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors">
              <FaLinkedin size={16} />
              <span className="text-xs">LinkedIn</span>
              <HiArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            {views && (
              <>
                <span className="flex items-center gap-1.5 text-xs text-white/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                  Total
                  <span className="text-white/70 font-semibold tabular-nums">{views.total.toLocaleString()}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                  Today
                  <span className="text-white/70 font-semibold tabular-nums">{views.today.toLocaleString()}</span>
                </span>
              </>
            )}
            <p className="text-[11px] text-white/15">© 2026 Daehong</p>
          </div>
        </div>
      </div>
    </div>
  );
}
