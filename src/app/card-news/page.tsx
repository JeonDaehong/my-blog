"use client";

import Link from "next/link";
import { useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiXMark,
  HiOutlineChevronDown,
} from "react-icons/hi2";

/* ─────────────────────────────────────────────
   데이터 구조: 대카테고리 > 소카테고리 > 카드들
   ───────────────────────────────────────────── */

type Card = {
  title: string;
  subtitle: string;
  body: string;
  accent: string;
  icon: string;
};

type SubCategory = {
  name: string;
  icon: string;
  accent: string;
  cards: Card[];
};

type BigCategory = {
  name: string;
  icon: string;
  description: string;
  subCategories: SubCategory[];
};

const CARD_NEWS_DATA: BigCategory[] = [
  {
    name: "빅데이터",
    icon: "📡",
    description: "대규모 데이터 처리 기술과 프레임워크",
    subCategories: [
      {
        name: "Apache Spark",
        icon: "⚡",
        accent: "#e87040",
        cards: [
          {
            title: "Apache Spark란?",
            subtitle: "대규모 데이터 처리를 위한 통합 분석 엔진",
            body: "Apache Spark는 대규모 데이터 처리를 위한 오픈소스 분산 컴퓨팅 시스템입니다. 인메모리 처리를 통해 MapReduce보다 최대 100배 빠른 성능을 제공합니다.",
            accent: "#e87040",
            icon: "⚡",
          },
          {
            title: "Spark의 핵심 구조",
            subtitle: "Driver → Cluster Manager → Executors",
            body: "Driver Program이 SparkContext를 생성하고, Cluster Manager(YARN, Mesos, K8s)가 리소스를 할당하며, Executor가 실제 Task를 병렬 실행합니다.",
            accent: "#3b82f6",
            icon: "🏗️",
          },
          {
            title: "RDD vs DataFrame vs Dataset",
            subtitle: "Spark의 3가지 추상화 레벨",
            body: "RDD: 저수준 API, 타입 안전성 보장\nDataFrame: SQL 최적화(Catalyst), 스키마 기반\nDataset: DataFrame + 타입 안전성 (Scala/Java)\n\n대부분의 경우 DataFrame을 권장합니다.",
            accent: "#8b5cf6",
            icon: "📊",
          },
          {
            title: "Lazy Evaluation",
            subtitle: "Transformation은 즉시 실행되지 않는다",
            body: "Spark는 Transformation(map, filter, join 등)을 즉시 실행하지 않고 DAG(Directed Acyclic Graph)로 쌓아둡니다. Action(collect, count, save 등)이 호출될 때 최적화된 실행 계획을 세워 한 번에 처리합니다.",
            accent: "#10b981",
            icon: "🦥",
          },
          {
            title: "Shuffle의 이해",
            subtitle: "성능 병목의 핵심 원인",
            body: "Shuffle은 데이터가 파티션 간에 재분배되는 과정입니다. groupByKey, join, repartition 등에서 발생하며, 네트워크 I/O와 디스크 I/O를 수반하므로 최소화해야 합니다.\n\n💡 reduceByKey를 groupByKey 대신 사용하세요!",
            accent: "#f59e0b",
            icon: "🔀",
          },
          {
            title: "Spark 생태계",
            subtitle: "배치부터 ML까지 올인원",
            body: "Spark SQL: 구조화된 데이터 처리\nSpark Streaming: 실시간 스트리밍\nMLlib: 머신러닝 라이브러리\nGraphX: 그래프 처리\nStructured Streaming: 정확한 이벤트 처리",
            accent: "#ec4899",
            icon: "🧩",
          },
          {
            title: "실무 튜닝 팁",
            subtitle: "이것만 기억하세요",
            body: "1. 파티션 수 조절 (spark.sql.shuffle.partitions)\n2. 브로드캐스트 조인 활용 (작은 테이블)\n3. 캐싱 전략 (persist vs cache)\n4. 데이터 Skew 해결 (Salting 기법)\n5. Spark UI로 병목 구간 분석",
            accent: "#e87040",
            icon: "🔧",
          },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────
   모달 컴포넌트
   ───────────────────────────────────────────── */

function CardModal({
  cards,
  onClose,
}: {
  cards: Card[];
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const card = cards[current];

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(cards.length - 1, c + 1));

  // 키보드 네비게이션
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
        {/* 닫기 */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/50 hover:text-white transition-colors"
        >
          <HiXMark size={24} />
        </button>

        {/* 카드 본체 */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: `${card.accent}33` }}
        >
          <div className="h-1" style={{ background: card.accent }} />

          <div
            className="p-6 sm:p-8 bg-[#111]"
            style={{ background: `${card.accent}08` }}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-3xl sm:text-4xl">{card.icon}</span>
              <span
                className="text-[12px] font-mono tabular-nums"
                style={{ color: card.accent }}
              >
                {current + 1} / {cards.length}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold mb-1.5 text-[#f5f5f5]">
              {card.title}
            </h3>
            <p
              className="text-sm font-medium mb-5"
              style={{ color: card.accent }}
            >
              {card.subtitle}
            </p>

            <div className="text-[13px] sm:text-[14px] leading-relaxed text-[#a0a0a0] whitespace-pre-line min-h-[100px]">
              {card.body}
            </div>
          </div>

          {/* 네비게이션 */}
          <div
            className="flex items-center justify-between px-6 sm:px-8 py-3.5 border-t bg-[#0d0d0d]"
            style={{ borderColor: `${card.accent}20` }}
          >
            <button
              onClick={prev}
              disabled={current === 0}
              className="flex items-center gap-1 text-sm text-[#666] hover:text-[#f5f5f5] transition-colors disabled:opacity-30"
            >
              <HiOutlineChevronLeft size={16} /> 이전
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
                    background: i === current ? card.accent : "#333",
                  }}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={current === cards.length - 1}
              className="flex items-center gap-1 text-sm text-[#666] hover:text-[#f5f5f5] transition-colors disabled:opacity-30"
            >
              다음 <HiOutlineChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   메인 페이지 (드릴다운 방식)
   ───────────────────────────────────────────── */

export default function CardNewsPage() {
  const [modalCards, setModalCards] = useState<Card[] | null>(null);
  const [expandedBigCat, setExpandedBigCat] = useState<string | null>(null);
  const [expandedSubCat, setExpandedSubCat] = useState<string | null>(null);

  const toggleBigCat = (name: string) => {
    if (expandedBigCat === name) {
      setExpandedBigCat(null);
      setExpandedSubCat(null);
    } else {
      setExpandedBigCat(name);
      setExpandedSubCat(null);
    }
  };

  const toggleSubCat = (name: string) => {
    setExpandedSubCat(expandedSubCat === name ? null : name);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#666] hover:text-[#e87040] mb-8 transition-colors"
        >
          <HiOutlineArrowLeft size={14} /> 홈으로
        </Link>

        <h1 className="text-2xl font-bold tracking-tight mb-2">카드뉴스</h1>
        <p className="text-[#666] text-sm mb-10">핵심만 담은 비주얼 콘텐츠</p>

        {/* 대카테고리 목록 */}
        <div className="space-y-3">
          {CARD_NEWS_DATA.map((bigCat) => {
            const isBigOpen = expandedBigCat === bigCat.name;
            const totalCards = bigCat.subCategories.reduce(
              (sum, sc) => sum + sc.cards.length,
              0
            );

            return (
              <div key={bigCat.name}>
                {/* 대카테고리 버튼 */}
                <button
                  onClick={() => toggleBigCat(bigCat.name)}
                  className={`w-full text-left rounded-xl border transition-all duration-200 px-5 py-4 group ${
                    isBigOpen
                      ? "border-[#e87040]/30 bg-[#e87040]/5"
                      : "border-[#2a2a2a] bg-[#141414] hover:border-[#333] hover:bg-[#1a1a1a]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{bigCat.icon}</span>
                      <div>
                        <h2 className="text-[15px] font-bold text-[#f5f5f5]">
                          {bigCat.name}
                        </h2>
                        <p className="text-[12px] text-[#666] mt-0.5">
                          {bigCat.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#555] font-mono">
                        {bigCat.subCategories.length}개 주제 · {totalCards}장
                      </span>
                      <HiOutlineChevronDown
                        size={16}
                        className={`text-[#555] transition-transform duration-200 ${
                          isBigOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* 소카테고리 목록 (펼쳐질 때) */}
                {isBigOpen && (
                  <div className="mt-2 ml-4 sm:ml-8 space-y-2 animate-in">
                    {bigCat.subCategories.map((subCat) => {
                      const isSubOpen = expandedSubCat === subCat.name;

                      return (
                        <div key={subCat.name}>
                          {/* 소카테고리 버튼 */}
                          <button
                            onClick={() => toggleSubCat(subCat.name)}
                            className={`w-full text-left rounded-lg border transition-all duration-200 px-4 py-3 ${
                              isSubOpen
                                ? "bg-[#1a1a1a] border-[#333]"
                                : "border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#181818]"
                            }`}
                            style={
                              isSubOpen
                                ? { borderColor: `${subCat.accent}40` }
                                : undefined
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="text-lg">{subCat.icon}</span>
                                <span
                                  className="text-[14px] font-semibold"
                                  style={{ color: subCat.accent }}
                                >
                                  {subCat.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-[11px] text-[#555] font-mono">
                                  {subCat.cards.length}장
                                </span>
                                <HiOutlineChevronDown
                                  size={14}
                                  className={`text-[#555] transition-transform duration-200 ${
                                    isSubOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </div>
                            </div>
                          </button>

                          {/* 대표 썸네일 1개 (소카테고리 펼쳐질 때) */}
                          {isSubOpen && (
                            <div className="mt-2 ml-4 sm:ml-6 animate-in">
                              <button
                                onClick={() => setModalCards(subCat.cards)}
                                className="group text-left w-full max-w-sm rounded-xl border overflow-hidden hover:shadow-lg hover:shadow-black/30 transition-all duration-200"
                                style={{
                                  borderColor: `${subCat.accent}25`,
                                }}
                              >
                                <div
                                  className="h-1"
                                  style={{ background: subCat.accent }}
                                />
                                <div
                                  className="px-4 py-4"
                                  style={{
                                    background: `${subCat.accent}0a`,
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="text-2xl mt-0.5">
                                      {subCat.cards[0].icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[13px] font-semibold text-[#e0e0e0] leading-snug group-hover:text-white transition-colors">
                                        {subCat.cards[0].title}
                                      </p>
                                      <p
                                        className="text-[11px] mt-1 line-clamp-1"
                                        style={{
                                          color: `${subCat.accent}aa`,
                                        }}
                                      >
                                        {subCat.cards[0].subtitle}
                                      </p>
                                      <p className="text-[11px] text-[#555] mt-2">
                                        클릭하여 {subCat.cards.length}장의
                                        카드뉴스 보기
                                      </p>
                                    </div>
                                    <HiOutlineChevronRight
                                      size={16}
                                      className="text-[#444] group-hover:text-[#888] mt-1 transition-colors shrink-0"
                                    />
                                  </div>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 모달 */}
      {modalCards && (
        <CardModal cards={modalCards} onClose={() => setModalCards(null)} />
      )}
    </div>
  );
}
