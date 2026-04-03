"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BlogError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-4xl font-black text-accent mb-3">오류</p>
      <h1 className="text-lg font-bold text-text-primary mb-2">페이지를 불러올 수 없습니다</h1>
      <p className="text-text-tertiary text-sm mb-6 max-w-xs">
        {error.message || "잠시 후 다시 시도해 주세요."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-orange-400 transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/posts"
          className="px-4 py-2 rounded-lg border border-border-color text-sm text-text-secondary hover:bg-bg-hover transition-colors"
        >
          글 목록으로
        </Link>
      </div>
    </div>
  );
}
