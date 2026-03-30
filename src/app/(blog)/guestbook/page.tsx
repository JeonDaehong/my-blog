"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/components/ThemeProvider";
import GiscusWidget from "@giscus/react";

const EMOJIS = ["👋", "😊", "🔥", "💜", "🚀", "⭐", "🎉"];

type Entry = {
  id: string;
  nickname: string;
  message: string;
  emoji: string;
  createdAt: string;
};

export default function GuestbookPage() {
  const { locale } = useI18n();
  const { theme } = useTheme();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState("👋");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const isKo = locale === "ko";

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, message, emoji }),
      });
      if (res.ok) {
        const entry = await res.json();
        setEntries((prev) => [entry, ...prev]);
        setMessage("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return isKo ? "방금 전" : "just now";
    if (mins < 60) return isKo ? `${mins}분 전` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return isKo ? `${hours}시간 전` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return isKo ? `${days}일 전` : `${days}d ago`;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        {isKo ? "방명록" : "Guestbook"}
      </h1>
      <p className="text-sm text-text-tertiary mb-8">
        {isKo ? "한마디 남겨주세요!" : "Leave a message!"}
      </p>

      {/* Giscus — GitHub 로그인 방명록 */}
      <div className="mb-12">
        <h2 className="text-[13px] font-semibold text-text-tertiary uppercase tracking-widest mb-4">
          {isKo ? "GitHub 계정으로 남기기" : "Sign in with GitHub"}
        </h2>
        <GiscusWidget
          repo="JeonDaehong/my-blog"
          repoId="R_kgDORrZBGg"
          category="General"
          categoryId="DIC_kwDORrZBGs4C43Ri"
          mapping="specific"
          term="guestbook"
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={theme === "light" ? "light" : "dark"}
          lang={locale}
          loading="lazy"
        />
      </div>

      {/* 간단 메시지 */}
      <div>
        <h2 className="text-[13px] font-semibold text-text-tertiary uppercase tracking-widest mb-4">
          {isKo ? "간단히 남기기" : "Quick message"}
        </h2>

        <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-xl border border-border-color bg-bg-secondary space-y-3">
          <div className="flex gap-2 sm:gap-3 items-center">
            <input
              type="text"
              placeholder={isKo ? "닉네임" : "Nickname"}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="w-24 sm:w-32 shrink-0 px-2 sm:px-3 py-2 rounded-lg border border-border-color bg-bg-primary text-text-primary text-[13px] focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-text-tertiary"
            />
            <div className="flex items-center gap-0.5 sm:gap-1">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-sm sm:text-base flex items-center justify-center transition-colors ${
                    emoji === e ? "bg-accent-muted ring-1 ring-accent" : "hover:bg-bg-hover"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={isKo ? "메시지를 남겨주세요..." : "Leave a message..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              className="flex-1 px-3 py-2 rounded-lg border border-border-color bg-bg-primary text-text-primary text-[13px] focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-text-tertiary"
            />
            <button
              type="submit"
              disabled={submitting || !nickname.trim() || !message.trim()}
              className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-40"
            >
              {isKo ? "등록" : "Post"}
            </button>
          </div>
        </form>

        {loading ? (
          <p className="text-center text-text-tertiary text-sm py-12">{isKo ? "불러오는 중..." : "Loading..."}</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-text-tertiary text-sm py-12">{isKo ? "아직 메시지가 없어요. 첫 번째로 남겨주세요!" : "No messages yet. Be the first!"}</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="flex gap-3 p-4 rounded-xl border border-border-color bg-bg-secondary">
                <span className="text-2xl flex-shrink-0 mt-0.5">{entry.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-text-primary">{entry.nickname}</span>
                    <span className="text-[11px] text-text-tertiary">{timeAgo(entry.createdAt)}</span>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed break-words">{entry.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
