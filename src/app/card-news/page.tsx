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

/* ─────────────────────────────────────────────
   데이터 구조: 대카테고리 > 소카테고리 > 카드들
   ───────────────────────────────────────────── */

type Card = {
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  accent: string;
  icon: string;
};

type SubCategory = {
  name: string;
  nameEn?: string;
  icon: string;
  accent: string;
  cards: Card[];
};

type BigCategory = {
  name: string;
  nameEn?: string;
  icon: string;
  subCategories: SubCategory[];
};

const CARD_NEWS_DATA: BigCategory[] = [
  {
    name: "빅데이터",
    nameEn: "Big Data",
    icon: "📡",
    subCategories: [
      {
        name: "Apache Spark",
        nameEn: "Apache Spark",
        icon: "⚡",
        accent: "#e87040",
        cards: [
          {
            title: "Apache Spark란?",
            titleEn: "What is Apache Spark?",
            body: "Apache Spark는 대규모 데이터 처리를 위한 오픈소스 분산 컴퓨팅 시스템입니다. 인메모리 처리를 통해 MapReduce보다 최대 100배 빠른 성능을 제공합니다.",
            bodyEn: "Apache Spark is an open-source distributed computing system for large-scale data processing. Through in-memory processing, it provides up to 100x faster performance than MapReduce.",
            accent: "#e87040",
            icon: "⚡",
          },
          {
            title: "Spark의 핵심 구조",
            titleEn: "Core Architecture of Spark",
            body: "Driver Program이 SparkContext를 생성하고, Cluster Manager(YARN, Mesos, K8s)가 리소스를 할당하며, Executor가 실제 Task를 병렬 실행합니다.",
            bodyEn: "The Driver Program creates SparkContext, the Cluster Manager (YARN, Mesos, K8s) allocates resources, and Executors run actual Tasks in parallel.",
            accent: "#3b82f6",
            icon: "🏗️",
          },
          {
            title: "RDD vs DataFrame vs Dataset",
            titleEn: "RDD vs DataFrame vs Dataset",
            body: "RDD: 저수준 API, 타입 안전성 보장\nDataFrame: SQL 최적화(Catalyst), 스키마 기반\nDataset: DataFrame + 타입 안전성 (Scala/Java)\n\n대부분의 경우 DataFrame을 권장합니다.",
            bodyEn: "RDD: Low-level API, type safety guaranteed\nDataFrame: SQL optimization (Catalyst), schema-based\nDataset: DataFrame + type safety (Scala/Java)\n\nDataFrame is recommended for most use cases.",
            accent: "#8b5cf6",
            icon: "📊",
          },
          {
            title: "Lazy Evaluation",
            titleEn: "Lazy Evaluation",
            body: "Spark는 Transformation(map, filter, join 등)을 즉시 실행하지 않고 DAG(Directed Acyclic Graph)로 쌓아둡니다. Action(collect, count, save 등)이 호출될 때 최적화된 실행 계획을 세워 한 번에 처리합니다.",
            bodyEn: "Spark doesn't execute Transformations (map, filter, join, etc.) immediately but stacks them as a DAG (Directed Acyclic Graph). When an Action (collect, count, save, etc.) is called, it creates an optimized execution plan and processes everything at once.",
            accent: "#10b981",
            icon: "🦥",
          },
          {
            title: "Shuffle의 이해",
            titleEn: "Understanding Shuffle",
            body: "Shuffle은 데이터가 파티션 간에 재분배되는 과정입니다. groupByKey, join, repartition 등에서 발생하며, 네트워크 I/O와 디스크 I/O를 수반하므로 최소화해야 합니다.\n\n💡 reduceByKey를 groupByKey 대신 사용하세요!",
            bodyEn: "Shuffle is the process of redistributing data across partitions. It occurs in groupByKey, join, repartition, etc., and should be minimized as it involves network and disk I/O.\n\n💡 Use reduceByKey instead of groupByKey!",
            accent: "#f59e0b",
            icon: "🔀",
          },
          {
            title: "Spark 생태계",
            titleEn: "Spark Ecosystem",
            body: "Spark SQL: 구조화된 데이터 처리\nSpark Streaming: 실시간 스트리밍\nMLlib: 머신러닝 라이브러리\nGraphX: 그래프 처리\nStructured Streaming: 정확한 이벤트 처리",
            bodyEn: "Spark SQL: Structured data processing\nSpark Streaming: Real-time streaming\nMLlib: Machine learning library\nGraphX: Graph processing\nStructured Streaming: Exact event processing",
            accent: "#ec4899",
            icon: "🧩",
          },
          {
            title: "실무 튜닝 팁",
            titleEn: "Production Tuning Tips",
            body: "1. 파티션 수 조절 (spark.sql.shuffle.partitions)\n2. 브로드캐스트 조인 활용 (작은 테이블)\n3. 캐싱 전략 (persist vs cache)\n4. 데이터 Skew 해결 (Salting 기법)\n5. Spark UI로 병목 구간 분석",
            bodyEn: "1. Adjust partition count (spark.sql.shuffle.partitions)\n2. Use broadcast joins (for small tables)\n3. Caching strategy (persist vs cache)\n4. Resolve data skew (Salting technique)\n5. Analyze bottlenecks with Spark UI",
            accent: "#e87040",
            icon: "🔧",
          },
        ],
      },
    ],
  },
];

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
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
      <div className="relative w-full max-w-xl animate-in">
        <button
          onClick={onClose}
          aria-label={t.close}
          className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
        >
          <HiXMark size={24} />
        </button>

        <div
          className="rounded-2xl border overflow-hidden flex flex-col max-h-[85vh] bg-bg-secondary"
          style={{ borderColor: `${card.accent}33` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* 진행 바 — 몇 장 중 몇 번째인지 한눈에 */}
          <div className="h-1 shrink-0 bg-bg-tertiary">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, background: card.accent }}
            />
          </div>

          <div
            ref={bodyRef}
            className="flex-1 overflow-y-auto px-6 sm:px-9 pt-6 sm:pt-8 pb-7 sm:pb-9"
            style={{ background: `${card.accent}08` }}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-3xl sm:text-4xl leading-none">{card.icon}</span>
              <span className="text-[12px] font-semibold tabular-nums text-text-tertiary">
                {current + 1} / {cards.length}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-text-primary leading-snug tracking-tight">
              {title}
            </h3>

            <div className="text-[15px] sm:text-[16px] leading-[1.85] sm:leading-[1.9] text-text-secondary whitespace-pre-line break-words">
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
  const [lang, setLang] = useState<"ko" | "en">("en");
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
