"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 경로 변경 감지 → 로딩 종료
  useEffect(() => {
    setLoading(false);
    setProgress(100);
    const t = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  // 내부 링크 클릭 감지 → 로딩 시작
  const handleClick = useCallback(
    (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // 외부 링크, 해시 링크, 새 탭 등은 무시
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        anchor.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey
      )
        return;

      // 현재 경로와 같으면 무시
      const url = new URL(href, window.location.origin);
      if (url.pathname === pathname && url.search === window.location.search)
        return;

      setLoading(true);
      setProgress(30);
    },
    [pathname]
  );

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [handleClick]);

  // 진행률 애니메이션
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + (90 - p) * 0.1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [loading]);

  if (progress === 0) return null;

  return (
    <>
      {/* 상단 프로그레스 바 */}
      <div className="fixed top-0 left-0 right-0 z-[9998] h-[2px]">
        <div
          className="h-full bg-accent transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            opacity: progress >= 100 ? 0 : 1,
            boxShadow: "0 0 8px var(--accent)",
          }}
        />
      </div>

      {/* 로딩 오버레이 (약한 투명도) */}
      {loading && (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
              <div
                className="absolute inset-1.5 rounded-full border-2 border-transparent border-t-accent/50 animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "0.8s",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
