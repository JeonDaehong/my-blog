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
      descEn: "Dev, tech, and life stories",
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
      descEn: "Visual content with key insights",
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
      descEn: "Open source projects & code",
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
      descEn: "Career & networking",
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
      descEn: "Buy me a coffee",
      icon: HiOutlineHeart,
      href: LINKS.sponsor,
      color: "from-pink-500/20 to-rose-400/10",
      iconColor: "text-pink-400",
      external: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col">
      {/* Background subtle gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-orange-500/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative">
        {/* Avatar / Logo */}
        <div className={`mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-white font-bold text-3xl">D</span>
          </div>
        </div>

        {/* Title */}
        <div className={`text-center mb-12 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Daehong
          </h1>
          <p className="text-[#a0a0a0] text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            개발자, 기록하는 사람
          </p>
          <p className="text-[#666] text-sm mt-1">
            Developer & Writer
          </p>
        </div>

        {/* Cards grid */}
        <div className={`w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {cards.map((card, i) => {
            const Wrapper = card.external ? "a" : Link;
            const props = card.external
              ? { href: card.href, target: "_blank", rel: "noopener noreferrer" }
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
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative">
                  <card.icon className={`${card.iconColor} mb-3 transition-transform duration-300 group-hover:scale-110`} size={24} />
                  <h2 className="text-[15px] font-semibold mb-1">{card.title}</h2>
                  <p className="text-[12px] text-[#666] leading-relaxed">{card.desc}</p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute top-4 right-4 text-[#333] group-hover:text-[#666] transition-colors">
                  {card.external ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </Wrapper>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className={`text-center py-6 text-[12px] text-[#444] transition-all duration-700 delay-300 ${mounted ? "opacity-100" : "opacity-0"}`}>
        © 2026 Daehong. All rights reserved.
      </footer>
    </div>
  );
}
