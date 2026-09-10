/**
 * Tech Study Cards 데이터. 페이지와 사이드바 미리보기가 함께 쓰기 때문에
 * "use client" 없는 별도 모듈로 둔다. 서버에서 import하면 클라이언트
 * 번들에는 실리지 않는다.
 */

export type Card = {
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  accent: string;
  icon: string;
};

export type SubCategory = {
  name: string;
  nameEn?: string;
  icon: string;
  accent: string;
  cards: Card[];
};

export type BigCategory = {
  name: string;
  nameEn?: string;
  icon: string;
  subCategories: SubCategory[];
};

export const CARD_NEWS_DATA: BigCategory[] = [
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

export type CardNewsPreview = {
  id: string;
  title: string;
  titleEn: string | null;
  topic: string;
  topicEn: string | null;
  icon: string;
  accent: string;
  /** 해당 카드가 바로 열리는 딥링크 */
  href: string;
};

/**
 * 소주제 이름과 카드 번호로 카드 한 장을 가리키는 링크.
 * /card-news 가 이 쿼리를 읽어 해당 위치로 이동한 뒤 팝업까지 띄운다.
 */
export function cardHref(topic: string, index: number): string {
  return `/card-news?topic=${encodeURIComponent(topic)}&card=${index}`;
}

/** 링크로 들어왔을 때 topic 이름이 가리키는 대/소 카테고리를 되찾는다. */
export function findTopic(
  topic: string
): { bigCat: BigCategory; subCat: SubCategory } | null {
  for (const bigCat of CARD_NEWS_DATA) {
    for (const subCat of bigCat.subCategories) {
      if (subCat.name === topic) return { bigCat, subCat };
    }
  }
  return null;
}

/**
 * 카드에는 작성일이 없다. 데이터에 적힌 순서를 최신순으로 보고 앞에서부터
 * 잘라 쓴다. 날짜가 생기면 여기만 바꾸면 된다.
 *
 * 목록에는 카테고리나 대주제가 아니라 실제로 읽을 카드(최하위 항목)만 담는다.
 */
export function getRecentCards(limit = 3): CardNewsPreview[] {
  const cards: CardNewsPreview[] = [];
  for (const bigCat of CARD_NEWS_DATA) {
    for (const subCat of bigCat.subCategories) {
      subCat.cards.forEach((card, index) => {
        cards.push({
          id: `${subCat.name}-${card.title}`,
          title: card.title,
          titleEn: card.titleEn ?? null,
          topic: subCat.name,
          topicEn: subCat.nameEn ?? null,
          icon: card.icon,
          accent: card.accent,
          href: cardHref(subCat.name, index),
        });
      });
    }
  }
  return cards.slice(0, limit);
}
