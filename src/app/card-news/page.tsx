"use client";

import Link from "next/link";
import { useState } from "react";
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";

const SPARK_CARDS = [
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
];

export default function CardNewsPage() {
  const [current, setCurrent] = useState(0);
  const card = SPARK_CARDS[current];

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : c));
  const next = () => setCurrent((c) => (c < SPARK_CARDS.length - 1 ? c + 1 : c));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#666] hover:text-[#e87040] mb-8 transition-colors"
        >
          <HiOutlineArrowLeft size={14} /> 홈으로
        </Link>

        <h1 className="text-2xl font-bold tracking-tight mb-2">카드뉴스</h1>
        <p className="text-[#666] text-sm mb-10">핵심만 담은 비주얼 콘텐츠</p>

        {/* Card News: Spark */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="text-orange-500">⚡</span> Apache Spark 핵심 정리
          </h2>

          {/* Card */}
          <div
            className="relative rounded-2xl border overflow-hidden transition-all duration-300"
            style={{ borderColor: `${card.accent}33` }}
          >
            {/* Top accent bar */}
            <div className="h-1" style={{ background: card.accent }} />

            <div className="p-8 sm:p-10" style={{ background: `${card.accent}08` }}>
              {/* Page indicator */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl">{card.icon}</span>
                <span className="text-[12px] font-mono tabular-nums" style={{ color: card.accent }}>
                  {current + 1} / {SPARK_CARDS.length}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-[#f5f5f5]">
                {card.title}
              </h3>
              <p className="text-sm font-medium mb-6" style={{ color: card.accent }}>
                {card.subtitle}
              </p>

              {/* Body */}
              <div className="text-[14px] leading-relaxed text-[#a0a0a0] whitespace-pre-line min-h-[120px]">
                {card.body}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-8 py-4 border-t" style={{ borderColor: `${card.accent}20` }}>
              <button
                onClick={prev}
                disabled={current === 0}
                className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#f5f5f5] transition-colors disabled:opacity-30 disabled:hover:text-[#666]"
              >
                <HiOutlineChevronLeft size={16} /> 이전
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {SPARK_CARDS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="transition-all duration-200"
                    style={{
                      width: i === current ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: i === current ? card.accent : "#333",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={next}
                disabled={current === SPARK_CARDS.length - 1}
                className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#f5f5f5] transition-colors disabled:opacity-30 disabled:hover:text-[#666]"
              >
                다음 <HiOutlineChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
