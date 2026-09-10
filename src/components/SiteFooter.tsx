"use client";

import { useEffect, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiArrowUpRight } from "react-icons/hi2";

const GITHUB = "https://github.com/JeonDaehong";
const LINKEDIN = "https://linkedin.com/in/daehong-jeon";

type Views = { total: number; today: number };

/**
 * 랜딩에만 있던 하단 바. 블로그·카드 페이지에서도 같은 걸 쓰도록 컴포넌트로 뺐다.
 * 방문 수는 페이지마다 값이 같으므로 여기서 직접 받아온다.
 */
export default function SiteFooter({
  className = "",
  innerClassName = "max-w-5xl mx-auto px-4 sm:px-6",
}: {
  className?: string;
  innerClassName?: string;
}) {
  const [views, setViews] = useState<Views | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/views")
      .then((r) => r.json())
      .then((data: Views) => {
        if (!cancelled) setViews(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className={`border-t border-border-color ${className}`}>
      <div
        className={`${innerClassName} py-6 flex flex-col sm:flex-row items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-6">
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <FaGithub size={16} />
            <span className="text-xs">GitHub</span>
            <HiArrowUpRight
              size={10}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </a>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <FaLinkedin size={16} />
            <span className="text-xs">LinkedIn</span>
            <HiArrowUpRight
              size={10}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
        <div className="flex items-center gap-4">
          {views && (
            <>
              <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                Total
                <span className="text-text-secondary font-semibold tabular-nums">
                  {views.total.toLocaleString()}
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                Today
                <span className="text-text-secondary font-semibold tabular-nums">
                  {views.today.toLocaleString()}
                </span>
              </span>
            </>
          )}
          <p className="text-[11px] text-text-tertiary opacity-40">© 2026 Daehong</p>
        </div>
      </div>
    </footer>
  );
}
