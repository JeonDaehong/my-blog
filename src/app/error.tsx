"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary p-6">
      <div className="text-center max-w-sm">
        <p className="text-5xl font-black text-accent mb-4">오류</p>
        <h1 className="text-xl font-bold mb-2">문제가 발생했습니다</h1>
        <p className="text-text-tertiary text-sm mb-6">
          {error.message || "알 수 없는 오류입니다. 잠시 후 다시 시도해 주세요."}
        </p>
        <button
          onClick={reset}
          className="px-5 py-2 rounded-full bg-accent text-white text-sm font-medium hover:bg-orange-400 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
