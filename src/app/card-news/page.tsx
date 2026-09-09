"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiXMark,
  HiOutlineGlobeAlt,
  HiOutlineSun,
  HiOutlineMoon,
} from "react-icons/hi2";
import { useTheme } from "@/components/ThemeProvider";
import { useI18n } from "@/lib/i18n";
import {
  CARD_NEWS_DATA,
  type Card,
  type SubCategory,
  type BigCategory,
} from "@/lib/card-news";

/* ─────────────────────────────────────────────
   데이터 구조: 대카테고리 > 소카테고리 > 카드들
   ───────────────────────────────────────────── */


/* ─────────────────────────────────────────────
   텍스트 번역
   ───────────────────────────────────────────── */

const TEXT = {
  ko: {
    home: "홈으로",
    back: "뒤로",
    title: "카드뉴스",
    prev: "이전",
    next: "다음",
    viewAll: "모두 보기",
    topics: "개 주제",
    cards: "장",
    close: "닫기",
    hint: "← → 로 이동 · ESC 로 닫기",
  },
  en: {
    home: "Home",
    back: "Back",
    title: "Card News",
    prev: "Prev",
    next: "Next",
    viewAll: "View all",
    topics: " topics",
    cards: " cards",
    close: "Close",
    hint: "← → to navigate · ESC to close",
  },
};

/* ─────────────────────────────────────────────
   모달 컴포넌트
   ───────────────────────────────────────────── */

function CardModal({
  cards,
  lang,
  onClose,
}: {
  cards: Card[];
  lang: "ko" | "en";
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const card = cards[current];
  const t = TEXT[lang];

  const title = lang === "en" && card.titleEn ? card.titleEn : card.title;
  const body = lang === "en" && card.bodyEn ? card.bodyEn : card.body;

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(
    () => setCurrent((c) => Math.min(cards.length - 1, c + 1)),
    [cards.length]
  );

  // 이전에는 tabIndex만 있고 포커스를 주지 않아 방향키가 먹지 않았다.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // 카드를 넘기면 본문을 항상 처음부터 읽게 한다.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [current]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "Escape") onClose();
  };

  // 모바일 스와이프
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta < 0) next();
    else prev();
  }

  const progress = ((current + 1) / cards.length) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative w-full max-w-3xl animate-in">
        <div
          className="relative rounded-2xl border overflow-hidden flex flex-col h-[82vh] sm:h-[620px] sm:max-h-[86vh] bg-bg-secondary"
          style={{ borderColor: `${card.accent}33` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            onClick={onClose}
            aria-label={t.close}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-bg-primary/70 backdrop-blur-sm text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <HiXMark size={20} />
          </button>

          {/* 진행 바 — 몇 장 중 몇 번째인지 한눈에 */}
          <div className="h-1 shrink-0 bg-bg-tertiary">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, background: card.accent }}
            />
          </div>

          <div
            ref={bodyRef}
            className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 pt-7 sm:pt-10 pb-8 sm:pb-12"
            style={{ background: `${card.accent}08` }}
          >
            <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6 pr-9">
              <span className="text-4xl sm:text-5xl leading-none">{card.icon}</span>
              <span className="text-[12px] font-semibold tabular-nums text-text-tertiary">
                {current + 1} / {cards.length}
              </span>
            </div>

            <h3 className="text-[22px] sm:text-[28px] font-bold mb-4 sm:mb-6 text-text-primary leading-snug tracking-tight">
              {title}
            </h3>

            <div className="text-[15px] sm:text-[17px] leading-[1.85] sm:leading-[1.9] text-text-secondary whitespace-pre-line break-words">
              {body}
            </div>
          </div>

          <div
            className="shrink-0 border-t bg-bg-primary"
            style={{ borderColor: `${card.accent}20` }}
          >
            <div className="flex items-center justify-between px-3 sm:px-5 py-3">
              <button
                onClick={prev}
                disabled={current === 0}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[13px] sm:text-sm text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <HiOutlineChevronLeft size={16} /> {t.prev}
              </button>

              <div className="flex items-center gap-1.5">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`${i + 1}`}
                    className="transition-all duration-200"
                    style={{
                      width: i === current ? 18 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: i === current ? card.accent : "var(--border-light)",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={next}
                disabled={current === cards.length - 1}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[13px] sm:text-sm text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                {t.next} <HiOutlineChevronRight size={16} />
              </button>
            </div>

            <p className="hidden sm:block pb-2.5 text-center text-[11px] text-text-tertiary">
              {t.hint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   뷰 타입: 페이지 전환 방식 드릴다운
   ───────────────────────────────────────────── */

type View =
  | { step: "bigCategories" }
  | { step: "subCategories"; bigCat: BigCategory }
  | { step: "thumbnail"; bigCat: BigCategory; subCat: SubCategory };

export default function CardNewsPage() {
  const [view, setView] = useState<View>({ step: "bigCategories" });
  const [modalCards, setModalCards] = useState<Card[] | null>(null);
  // 언어는 헤더 토글과 같은 값을 쓰도록 전역 컨텍스트에서 받는다.
  const { locale: lang, setLocale: setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const t = TEXT[lang];

  const getName = (item: { name: string; nameEn?: string }) =>
    lang === "en" && item.nameEn ? item.nameEn : item.name;

  const goBack = () => {
    if (view.step === "thumbnail") {
      setView({ step: "subCategories", bigCat: view.bigCat });
    } else if (view.step === "subCategories") {
      setView({ step: "bigCategories" });
    }
  };

  const breadcrumb =
    view.step === "subCategories"
      ? getName(view.bigCat)
      : view.step === "thumbnail"
        ? `${getName(view.bigCat)} / ${getName(view.subCat)}`
        : null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {view.step === "bigCategories" ? (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[13px] text-text-tertiary hover:text-accent transition-colors"
              >
                <HiOutlineArrowLeft size={14} /> {t.home}
              </Link>
            ) : (
              <button
                onClick={goBack}
                className="inline-flex items-center gap-1.5 text-[13px] text-text-tertiary hover:text-accent transition-colors"
              >
                <HiOutlineArrowLeft size={14} /> {t.back}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="flex items-center p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              {theme === "dark" ? <HiOutlineSun size={16} /> : <HiOutlineMoon size={16} />}
            </button>
            <button
              onClick={() => setLang(lang === "ko" ? "en" : "ko")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <HiOutlineGlobeAlt size={14} />
              {lang === "ko" ? "EN" : "KO"}
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-1">{t.title}</h1>
        {breadcrumb && (
          <p className="text-accent text-sm mb-10 font-medium">
            {breadcrumb}
          </p>
        )}
        {!breadcrumb && <div className="mb-10" />}

        {/* ── Step 1: 대카테고리 목록 ── */}
        {view.step === "bigCategories" && (
          <div className="space-y-3 animate-in">
            {CARD_NEWS_DATA.map((bigCat) => {
              const cardCount = bigCat.subCategories.reduce(
                (sum, sub) => sum + sub.cards.length,
                0
              );
              return (
                <button
                  key={bigCat.name}
                  onClick={() => setView({ step: "subCategories", bigCat })}
                  className="w-full text-left rounded-xl border border-border-color bg-bg-secondary hover:border-border-light hover:bg-bg-hover transition-all duration-200 px-4 sm:px-5 py-4 sm:py-5 group"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <span className="shrink-0 w-11 h-11 rounded-xl bg-bg-tertiary border border-border-color flex items-center justify-center text-2xl">
                      {bigCat.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-muted text-accent">
                          {bigCat.subCategories.length}
                          {t.topics}
                        </span>
                        <span className="text-[11px] text-text-tertiary">
                          {cardCount}
                          {t.cards}
                        </span>
                      </div>
                      <h2 className="text-[15px] sm:text-[17px] font-bold text-text-primary group-hover:text-accent transition-colors">
                        {getName(bigCat)}
                      </h2>
                      <p className="text-[12px] sm:text-[13px] text-text-tertiary leading-relaxed mt-1 line-clamp-2">
                        {bigCat.subCategories.map(getName).join(" · ")}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {bigCat.subCategories.slice(0, 4).map((sub) => (
                          <span
                            key={sub.name}
                            className="text-[11px] text-text-tertiary bg-bg-tertiary border border-border-color rounded px-1.5 py-0.5"
                          >
                            #{getName(sub)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <HiOutlineChevronRight
                      size={16}
                      className="shrink-0 self-center text-text-tertiary group-hover:text-accent transition-colors"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Step 2: 소카테고리 목록 ── */}
        {view.step === "subCategories" && (
          <div className="space-y-3 animate-in">
            {view.bigCat.subCategories.map((subCat) => {
              const first = subCat.cards[0];
              const summary =
                lang === "en" && first?.bodyEn ? first.bodyEn : first?.body ?? "";
              return (
                <button
                  key={subCat.name}
                  onClick={() =>
                    setView({ step: "thumbnail", bigCat: view.bigCat, subCat })
                  }
                  className="w-full text-left rounded-xl border border-border-color bg-bg-secondary hover:border-border-light hover:bg-bg-hover transition-all duration-200 px-4 sm:px-5 py-4 sm:py-5 group"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <span
                      className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-2xl border"
                      style={{
                        background: `${subCat.accent}14`,
                        borderColor: `${subCat.accent}33`,
                      }}
                    >
                      {subCat.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: `${subCat.accent}1f`, color: subCat.accent }}
                        >
                          {getName(view.bigCat)}
                        </span>
                        <span className="text-[11px] text-text-tertiary">
                          {subCat.cards.length}
                          {t.cards}
                        </span>
                      </div>
                      <h2 className="text-[15px] sm:text-[17px] font-bold text-text-primary group-hover:text-accent transition-colors">
                        {getName(subCat)}
                      </h2>
                      <p className="text-[12px] sm:text-[13px] text-text-tertiary leading-relaxed mt-1 line-clamp-2 whitespace-pre-line">
                        {summary}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {subCat.cards.slice(0, 3).map((card) => (
                          <span
                            key={card.title}
                            className="text-[11px] text-text-tertiary bg-bg-tertiary border border-border-color rounded px-1.5 py-0.5 max-w-[150px] sm:max-w-none truncate"
                          >
                            #{lang === "en" && card.titleEn ? card.titleEn : card.title}
                          </span>
                        ))}
                      </div>
                    </div>
                    <HiOutlineChevronRight
                      size={16}
                      className="shrink-0 self-center text-text-tertiary group-hover:text-accent transition-colors"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Step 3: 대표 썸네일 카드 1개 ── */}
        {view.step === "thumbnail" && (
          <div className="animate-in">
            {(() => {
              const firstCard = view.subCat.cards[0];
              const cardTitle = lang === "en" && firstCard.titleEn ? firstCard.titleEn : firstCard.title;
              const cardBody = lang === "en" && firstCard.bodyEn ? firstCard.bodyEn : firstCard.body;
              return (
                <button
                  onClick={() => setModalCards(view.subCat.cards)}
                  className="group text-left w-full max-w-md rounded-2xl border overflow-hidden hover:shadow-xl hover:shadow-black/30 transition-all duration-200"
                  style={{ borderColor: `${view.subCat.accent}30` }}
                >
                  <div
                    className="h-1.5"
                    style={{ background: view.subCat.accent }}
                  />
                  <div
                    className="px-6 py-6"
                    style={{ background: `${view.subCat.accent}08` }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{firstCard.icon}</span>
                      <p className="text-[15px] font-bold text-text-primary group-hover:text-accent transition-colors">
                        {cardTitle}
                      </p>
                    </div>

                    <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-3 mb-4">
                      {cardBody}
                    </p>

                    <div className="flex items-center justify-end">
                      <span
                        className="inline-flex items-center gap-1 text-[12px] font-medium group-hover:gap-2 transition-all"
                        style={{ color: view.subCat.accent }}
                      >
                        {t.viewAll} <HiOutlineChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })()}
          </div>
        )}
      </div>

      {/* 모달 */}
      {modalCards && (
        <CardModal cards={modalCards} lang={lang} onClose={() => setModalCards(null)} />
      )}
    </div>
  );
}
