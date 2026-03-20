"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiOutlineBookOpen,
  HiOutlineNewspaper,
  HiOutlineHeart,
} from "react-icons/hi2";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const LINKS = {
  blog: "/posts",
  cardNews: "/card-news",
  github: "https://github.com/JeonDaehong",
  linkedin: "https://linkedin.com/in/daehong-jeon", // ← 나중에 변경
  sponsor: "https://buymeacoffee.com/daehong", // ← 나중에 변경
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cards = [
    {
      title: "블로그",
      titleEn: "Blog",
      desc: "개발, 기술, 일상을 기록합니다",
      icon: HiOutlineBookOpen,
      href: LINKS.blog,
      color: "from-orange-500/20 to-amber-500/10",
      iconColor: "text-orange-400",
      external: false,
    },
    {
      title: "카드뉴스",
      titleEn: "Card News",
      desc: "핵심만 담은 비주얼 콘텐츠",
      icon: HiOutlineNewspaper,
      href: LINKS.cardNews,
      color: "from-blue-500/20 to-cyan-500/10",
      iconColor: "text-blue-400",
      external: false,
    },
    {
      title: "GitHub",
      titleEn: "GitHub",
      desc: "오픈소스 프로젝트와 코드",
      icon: FaGithub,
      href: LINKS.github,
      color: "from-gray-500/20 to-gray-400/10",
      iconColor: "text-gray-300",
      external: true,
    },
    {
      title: "LinkedIn",
      titleEn: "LinkedIn",
      desc: "커리어와 네트워킹",
      icon: FaLinkedin,
      href: LINKS.linkedin,
      color: "from-blue-600/20 to-blue-400/10",
      iconColor: "text-blue-400",
      external: true,
    },
    {
      title: "후원하기",
      titleEn: "Sponsor",
      desc: "커피 한 잔의 응원",
      icon: HiOutlineHeart,
      href: LINKS.sponsor,
      color: "from-pink-500/20 to-rose-400/10",
      iconColor: "text-pink-400",
      external: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)" }} />
      </div>

      <main className="flex-1 flex flex-col items-center px-5 sm:px-6 pt-16 sm:pt-24 pb-12 relative">
        {/* ── Hero Section ── */}
        <section
          className={`w-full max-w-4xl flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16 sm:mb-20 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className="w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden border-2 border-[#2a2a2a] shadow-2xl shadow-orange-500/10">
              <img
                src="/images/main_1.jpeg"
                alt="전대홍 - 오픈소스 컨퍼런스 발표"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 opacity-20 blur-xl" />
          </div>

          {/* Hero Text */}
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Open Source Contributor
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
              전대홍
              <span className="block text-lg sm:text-xl font-normal text-[#888] mt-1">
                Daehong Jeon
              </span>
            </h1>
            <p className="text-[#a0a0a0] text-base sm:text-lg leading-relaxed max-w-lg mb-5">
              백엔드 엔지니어 · 데이터 엔지니어
              <br />
              <span className="text-[#777]">
                Spring Kafka · Apache Iceberg · Apache Gravitino Contributor
              </span>
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              <a
                href={LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-[#ccc] hover:border-[#444] hover:text-white transition-all"
              >
                <FaGithub size={16} />
                GitHub
              </a>
              <a
                href={LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-[#ccc] hover:border-[#444] hover:text-white transition-all"
              >
                <FaLinkedin size={16} />
                LinkedIn
              </a>
            </div>
          </div>
        </section>

        {/* ── Open Source Contributions Section ── */}
        <section
          className={`w-full max-w-4xl mb-16 sm:mb-20 transition-all duration-700 delay-150 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-green-400"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Open Source Contributions
            </h2>
          </div>

          <div className="rounded-2xl border border-[#2a2a2a] bg-[#111] overflow-hidden shadow-xl shadow-black/20">
            {/* Fake browser header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="ml-3 text-xs text-[#555]">
                Contribution Library
              </span>
            </div>
            {/* Screenshot */}
            <img
              src="/images/main_2.png"
              alt="오픈소스 Contribution 활동 목록"
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* ── Navigation Cards ── */}
        <section
          className={`w-full max-w-4xl transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-orange-400"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Explore</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {cards.map((card, i) => {
              const Wrapper = card.external ? "a" : Link;
              const props = card.external
                ? {
                    href: card.href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }
                : { href: card.href };

              return (
                <Wrapper
                  key={card.title}
                  {...(props as any)}
                  className={`group relative overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 hover:border-[#444] hover:bg-[#1a1a1a] transition-all duration-300 ${
                    i === 0 ? "col-span-2 sm:col-span-2" : ""
                  }`}
                >
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="relative">
                    <card.icon
                      className={`${card.iconColor} mb-3 transition-transform duration-300 group-hover:scale-110`}
                      size={24}
                    />
                    <h3 className="text-[15px] font-semibold mb-1">
                      {card.title}
                    </h3>
                    <p className="text-[12px] text-[#666] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute top-4 right-4 text-[#333] group-hover:text-[#666] transition-colors">
                    {card.external ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className={`text-center py-8 text-[12px] text-[#444] transition-all duration-700 delay-500 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        © 2026 Daehong. All rights reserved.
      </footer>
    </div>
  );
}
