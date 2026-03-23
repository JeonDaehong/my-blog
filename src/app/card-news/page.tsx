"use client";

import Link from "next/link";
import { useState } from "react";
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
  },
  en: {
    home: "Home",
    back: "Back",
    title: "Card News",
    prev: "Prev",
    next: "Next",
    viewAll: "View all",
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
  const card = cards[current];
  const t = TEXT[lang];

  const title = lang === "en" && card.titleEn ? card.titleEn : card.title;
  const body = lang === "en" && card.bodyEn ? card.bodyEn : card.body;

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(cards.length - 1, c + 1));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative w-full max-w-lg animate-in">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/50 hover:text-white transition-colors"
        >
          <HiXMark size={24} />
        </button>

        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: `${card.accent}33` }}
        >
          <div className="h-1" style={{ background: card.accent }} />

          <div
            className="p-6 sm:p-8 bg-bg-secondary"
            style={{ background: `${card.accent}08` }}
          >
            <div className="flex items-center mb-5">
              <span className="text-3xl sm:text-4xl">{card.icon}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold mb-4 text-text-primary">
              {title}
            </h3>

            <div className="text-[13px] sm:text-[14px] leading-relaxed text-text-secondary whitespace-pre-line min-h-[100px]">
              {body}
            </div>
          </div>

          <div
            className="flex items-center justify-between px-6 sm:px-8 py-3.5 border-t bg-bg-primary"
            style={{ borderColor: `${card.accent}20` }}
          >
            <button
              onClick={prev}
              disabled={current === 0}
              className="flex items-center gap-1 text-sm text-text-tertiary hover:text-text-primary transition-colors disabled:opacity-30"
            >
              <HiOutlineChevronLeft size={16} /> {t.prev}
            </button>

            <div className="flex items-center gap-1.5">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
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
              className="flex items-center gap-1 text-sm text-text-tertiary hover:text-text-primary transition-colors disabled:opacity-30"
            >
              {t.next} <HiOutlineChevronRight size={16} />
            </button>
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
            {CARD_NEWS_DATA.map((bigCat) => (
              <button
                key={bigCat.name}
                onClick={() =>
                  setView({ step: "subCategories", bigCat })
                }
                className="w-full text-left rounded-xl border border-border-color bg-bg-secondary hover:border-border-light hover:bg-bg-tertiary transition-all duration-200 px-5 py-5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{bigCat.icon}</span>
                    <h2 className="text-base font-bold text-text-primary">
                      {getName(bigCat)}
                    </h2>
                  </div>
                  <HiOutlineChevronRight
                    size={16}
                    className="text-text-tertiary group-hover:text-text-secondary transition-colors"
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: 소카테고리 목록 ── */}
        {view.step === "subCategories" && (
          <div className="space-y-3 animate-in">
            {view.bigCat.subCategories.map((subCat) => (
              <button
                key={subCat.name}
                onClick={() =>
                  setView({
                    step: "thumbnail",
                    bigCat: view.bigCat,
                    subCat,
                  })
                }
                className="w-full text-left rounded-xl border border-border-color bg-bg-secondary hover:border-border-light hover:bg-bg-tertiary transition-all duration-200 px-5 py-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{subCat.icon}</span>
                    <span
                      className="text-[15px] font-semibold"
                      style={{ color: subCat.accent }}
                    >
                      {getName(subCat)}
                    </span>
                  </div>
                  <HiOutlineChevronRight
                    size={16}
                    className="text-text-tertiary group-hover:text-text-secondary transition-colors"
                  />
                </div>
              </button>
            ))}
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
