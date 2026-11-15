/**
 * /oss 페이지 데이터. 직접 기여한 PR 과, 리뷰를 남긴 다른 사람의 PR 을 손으로 관리한다.
 *
 * 새 기여는 CONTRIBUTIONS 맨 위에, 리뷰는 해당 프로젝트 목록에 추가한다.
 * 리뷰 상태(머지·열림·닫힘)는 바뀌므로 바꿀 때 REVIEWS_AS_OF 도 같이 고친다.
 */

export type ProjectKey = "paimon-rust" | "iceberg-rust" | "iceberg" | "gravitino" | "spring-kafka";

export const PROJECTS: Record<ProjectKey, { name: string; repo: string; color: string; text: string }> = {
  "paimon-rust": { name: "Paimon-Rust", repo: "apache/paimon-rust", color: "#FFD700", text: "#1a1a1a" },
  "iceberg-rust": { name: "Iceberg-Rust", repo: "apache/iceberg-rust", color: "#00BFFF", text: "#ffffff" },
  iceberg: { name: "Iceberg", repo: "apache/iceberg", color: "#00BFFF", text: "#ffffff" },
  gravitino: { name: "Gravitino", repo: "apache/gravitino", color: "#FF4500", text: "#ffffff" },
  "spring-kafka": { name: "Spring Kafka", repo: "spring-projects/spring-kafka", color: "#6DB33F", text: "#ffffff" },
};

export type Contribution = {
  project: ProjectKey;
  pr: number;
  /** PR 본문이 아니라 특정 댓글을 가리켜야 할 때만 쓴다 */
  anchor?: string;
  /** YY.MM */
  date: string;
  tags: string[];
  ko: string;
  en: string;
  /** 측정한 개선 수치. 목록에서 강조해 보여준다 */
  impact?: { ko: string; en: string };
};

export const CONTRIBUTIONS: Contribution[] = [
  { project: "paimon-rust", pr: 1370, impact: { ko: "읽기 −52%", en: "Read −52%" }, date: "26.11", tags: ["Performance", "Core"],
    ko: "불필요한 sort-merge 를 건너뛰어 aggregation 테이블 읽기를 최적화했습니다. 읽기 시간 약 52% 단축.",
    en: "Optimized aggregation table reads by bypassing unnecessary sort-merge operations, reducing read time by ~52%." },
  { project: "paimon-rust", pr: 1338, impact: { ko: "할당 −19.6%", en: "Allocs −19.6%" }, date: "26.11", tags: ["Performance", "Core"],
    ko: "병합에서 이긴 셀을 참조로 유지해 키당 할당을 약 19.6%, 읽기 시간을 약 13% 줄였습니다.",
    en: "Kept winning cells by reference, reducing allocations per merged key by ~19.6% and read time by ~13%." },
  { project: "iceberg-rust", pr: 3435, date: "26.11", tags: ["Bug Fix", "Core"],
    ko: "positional delete 로딩이 실패하면 재시도와 동시 로딩이 멈추던 문제를 고쳤습니다.",
    en: "Fixed positional delete loading failures that caused retries and concurrent loads to hang." },
  { project: "paimon-rust", pr: 1164, impact: { ko: "실행 −62%", en: "Exec −62%" }, date: "26.11", tags: ["Performance", "Core"],
    ko: "단일 run 읽기를 최적화했습니다. 실행 시간 약 62% 단축.",
    en: "Optimized single-run reads, reducing execution time by ~62%." },
  { project: "iceberg-rust", pr: 3454, impact: { ko: "읽기 최대 +48%", en: "Read up to +48%" }, date: "26.10", tags: ["Performance", "Core"],
    ko: "삭제 범위(deleted ranges)로 delete row selection 을 최적화했습니다. 읽기 성능 최대 48% 개선.",
    en: "Optimized delete row selection using deleted ranges, improving read performance by up to 48%." },
  { project: "paimon-rust", pr: 1190, date: "26.10", tags: ["Bug Fix", "Core"],
    ko: "FLOAT/DOUBLE 비교 결과가 Java 구현과 어긋나던 문제를 고쳤습니다.",
    en: "Fixed FLOAT/DOUBLE comparison inconsistencies with Java." },
  { project: "paimon-rust", pr: 1193, date: "26.10", tags: ["Performance", "Core"],
    ko: "타입이 정해진 컬럼을 캐시해 sort-merge 성능을 개선했습니다.",
    en: "Cached typed columns to improve sort-merge performance." },
  { project: "paimon-rust", pr: 1162, date: "26.10", tags: ["Performance", "Core"],
    ko: "버퍼와 merge row 를 재사용해 할당을 줄였습니다.",
    en: "Reused buffers and merge rows to reduce allocations." },
  { project: "paimon-rust", pr: 1148, date: "26.10", tags: ["Performance", "Core"],
    ko: "Roaring Bitmap 의 run 을 이용해 deletion vector 범위 생성을 최적화했습니다.",
    en: "Optimized deletion-vector range generation using Roaring Bitmap runs." },
  { project: "iceberg-rust", pr: 3358, date: "26.10", tags: ["Bug Fix", "Core"],
    ko: "FLOAT/DOUBLE 파티션 값 포맷을 iceberg-java 와 맞췄습니다.",
    en: "Aligned FLOAT/DOUBLE partition formatting with iceberg-java." },
  { project: "iceberg", pr: 18027, date: "26.09", tags: ["Performance", "Core"],
    ko: "범위 기반 순회로 벡터화 position delete 검사를 최적화했습니다.",
    en: "Optimized vectorized position-delete checks using range-based traversal." },
  { project: "iceberg", pr: 18207, date: "26.09", tags: ["Improvement", "Core"],
    ko: "position delete 최적화를 Spark 3.5, 4.0, 4.1 에 백포트했습니다.",
    en: "Backported position-delete optimizations to Spark 3.5, 4.0 and 4.1." },
  { project: "iceberg", pr: 13851, date: "25.09", tags: ["Docs"],
    ko: "Row-level Deletes 문서의 Markdown 서식을 고쳤습니다.",
    en: "Fixed Markdown formatting in Row-level Deletes documentation." },
  { project: "gravitino", pr: 8376, date: "25.09", tags: ["Bug Fix"],
    ko: "OAuth2 토큰 검증에서 빠져 있던 상위 클래스 검사를 추가했습니다.",
    en: "Fixed missing superclass validation in OAuth2 token validation." },
  { project: "gravitino", pr: 8296, date: "25.08", tags: ["Bug Fix", "Test"],
    ko: "메타데이터 서비스 테스트의 잘못된 필드 할당을 고쳤습니다.",
    en: "Fixed incorrect field assignments in metadata service tests." },
  { project: "iceberg", pr: 13853, date: "25.08", tags: ["Docs"],
    ko: "Flink Table Maintenance 작업을 문서로 정리했습니다.",
    en: "Documented Flink table maintenance operations." },
  { project: "gravitino", pr: 8255, date: "25.08", tags: ["Bug Fix", "Test"],
    ko: "역할 이외의 변경을 건너뛰던 그룹 업데이트를 고쳤습니다.",
    en: "Fixed group updates that skipped non-role changes." },
  { project: "gravitino", pr: 8238, date: "25.08", tags: ["Bug Fix", "Test"],
    ko: "`EntityCombinedFileset` 의 null 처리를 고쳤습니다.",
    en: "Fixed null handling in `EntityCombinedFileset`." },
  { project: "gravitino", pr: 8144, date: "25.08", tags: ["Bug Fix", "Test"],
    ko: "`managed` 속성을 null 에 안전하게 처리하도록 고쳤습니다.",
    en: "Fixed null-safe handling of the `managed` property." },
  { project: "gravitino", pr: 8098, date: "25.08", tags: ["Improvement"],
    ko: "파티션 작업에 요청 검증을 추가했습니다.",
    en: "Added request validation for partition operations." },
  { project: "iceberg", pr: 13021, anchor: "issuecomment-2903837698", date: "25.05", tags: ["Improvement", "Core"],
    ko: "Flink catalog 테스트를 JUnit 4 에서 JUnit 5 로 옮겼습니다.",
    en: "Migrated Flink catalog tests from JUnit 4 to JUnit 5." },
  { project: "iceberg", pr: 13165, date: "25.05", tags: ["Improvement", "Core"],
    ko: "JUnit 5 이전 작업을 Flink 1.19, 1.20 모듈에 백포트했습니다.",
    en: "Backported the JUnit 5 migration to Flink 1.19 and 1.20." },
  { project: "spring-kafka", pr: 3543, date: "24.10", tags: ["Improvement", "Docs"],
    ko: "Kafka retry topic 테스트와 문서를 업데이트했습니다.",
    en: "Updated Kafka retry topic tests and documentation." },
];

export type ReviewStatus = "merged" | "open" | "closed";

export type Review = {
  pr: number;
  status: ReviewStatus;
  author: string;
  ko: string;
  en: string;
  /** 리뷰만 한 게 아니라 공동 작성자로 들어간 PR */
  coauthor?: boolean;
};

/** 리뷰 상태를 확인한 날짜 */
export const REVIEWS_AS_OF = "2026-11-15";

export const REVIEWS: { project: ProjectKey; label: string; items: Review[] }[] = [
  {
    project: "iceberg-rust",
    label: "Iceberg-Rust",
    items: [
      { pr: 3438, status: "merged", author: "ewoodbury", ko: "하위 필드가 없을 때도 struct 존재 여부 유지", en: "Preserve struct presence when it has no child fields" },
      { pr: 3437, status: "merged", author: "zhangfengcdt", ko: "ID 없는 파일의 중첩 struct 를 null 로 읽기", en: "Read nested structs in files without field IDs as null" },
      { pr: 3483, status: "merged", author: "anoopj", ko: "승격된 파티션 값·bounds 확장으로 잘못된 pruning 방지", en: "Widen promoted partition values and bounds to avoid wrong pruning" },
      { pr: 3516, status: "merged", author: "anoopj", ko: "파티션 승격 전에 삭제된 엔트리 건너뛰기 (perf)", en: "Skip deleted entries before partition promotion (perf)" },
      { pr: 3386, status: "merged", author: "anoopj", ko: "FLBA decimal page-index 테스트", en: "Tests for FLBA decimal page index" },
      { pr: 3502, status: "merged", author: "ump45nose", ko: "NaN row group bounds 를 might-match 로 처리", en: "Treat NaN row group bounds as might-match" },
      { pr: 3476, status: "merged", author: "spicysharkco", ko: "float JSON 을 Java 처럼 읽기", en: "Read float JSON the same way as Java" },
      { pr: 3432, status: "merged", author: "jopdorp", ko: "원본 컬럼이 지워진 정수 파티션 값 포맷", en: "Format integer partition values whose source column was dropped" },
      { pr: 3253, status: "merged", author: "jopdorp", ko: "스냅샷 작업의 삭제 파일 보고, 매니페스트 재작성", en: "Report deleted files in snapshot operations and rewrite manifests" },
      { pr: 3420, status: "merged", author: "xanderbailey", ko: "원본 컬럼이 지워진 파티션 이름 검사 생략", en: "Skip partition name checks when the source column was dropped" },
      { pr: 3424, status: "merged", author: "anuragmantri", ko: "FileScanTask 에 컬럼 통계 유지 옵션", en: "Option to keep column stats in FileScanTask" },
      { pr: 3377, status: "merged", author: "YuangGao", ko: "REST freshness-aware 테이블 로딩", en: "Freshness-aware table loading for REST" },
      { pr: 3243, status: "merged", author: "advancedxy", ko: "decimal·binary truncate 리터럴 수정", en: "Fix decimal and binary truncate literals" },
      { pr: 3145, status: "merged", author: "linhongyu510", ko: "DV delete task 검증", en: "Validate DV delete tasks" },
      { pr: 3697, status: "open", author: "c-thiel", coauthor: true, ko: "eq delete 대기자 깨우기", en: "Wake equality-delete waiters" },
      { pr: 3624, status: "open", author: "darshpatel1052", ko: "Parquet leaf index 로 프로젝션", en: "Project by Parquet leaf index" },
      { pr: 3587, status: "open", author: "alexanderbianchi", ko: "delete 파일 디코딩을 CPU 런타임에서", en: "Decode delete files on the CPU runtime" },
      { pr: 3566, status: "open", author: "ewoodbury", ko: "매니페스트 파티션 필드를 ID 로 매칭", en: "Match manifest partition fields by ID" },
      { pr: 3564, status: "open", author: "CTTY", ko: "MergingSnapshotProducer·ManifestFilter", en: "MergingSnapshotProducer and ManifestFilter" },
      { pr: 3540, status: "open", author: "comphead", ko: "승격 컬럼 필터링 시 매칭 행 유지", en: "Keep matching rows when filtering promoted columns" },
      { pr: 3537, status: "open", author: "sankarreddy-atlan", ko: "truncate 된 row group 통계로 파일 경계", en: "File boundaries from truncated row group stats" },
      { pr: 3508, status: "open", author: "mattfaltyn", ko: "파일에 없는 nullable 컬럼의 비교 필터링", en: "Comparison filtering on nullable columns missing from the file" },
      { pr: 3507, status: "open", author: "rich7420", ko: "비교 불가한 page index bounds 페이지 유지", en: "Keep pages whose page index bounds are not comparable" },
      { pr: 3485, status: "open", author: "ump45nose", ko: "date→timestamp 승격 컬럼 프로젝션", en: "Project date→timestamp promoted columns" },
      { pr: 3479, status: "open", author: "lyne7-sc", ko: "이름이 바뀐 컬럼의 필드 정체성 유지", en: "Keep field identity for renamed columns" },
      { pr: 3441, status: "open", author: "dhruvarya-db", ko: "파티션 스펙 변경 액션", en: "Update partition spec action" },
      { pr: 3357, status: "open", author: "cappyzawa", ko: "안 쓰는 page index 미리 읽기 생략", en: "Skip prefetching unused page indexes" },
      { pr: 3306, status: "open", author: "LuciferYang", ko: "중첩 required 필드 IS NULL 바인딩", en: "Bind IS NULL on nested required fields" },
      { pr: 3302, status: "open", author: "mbutrovich", ko: "파일에 없는 컬럼 필터를 파티션 값·initial-default 로 평가", en: "Evaluate filters on missing columns with partition values and initial-default" },
      { pr: 2961, status: "open", author: "brgr-s", ko: "eq delete 를 해시 키셋으로 RowFilter 안에서 적용", en: "Apply equality deletes inside RowFilter with a hashed key set" },
      { pr: 2921, status: "open", author: "1fanwang", ko: "puffin LZ4 footer 압축", en: "LZ4 footer compression for Puffin" },
      { pr: 2906, status: "open", author: "LuciferYang", ko: "중첩 leaf 컬럼 조건", en: "Predicates on nested leaf columns" },
      { pr: 3087, status: "closed", author: "JanKaul", ko: "delete 적용 e2e 테스트", en: "End-to-end tests for applying deletes" },
      { pr: 3232, status: "closed", author: "laskoviymishka", ko: "DV blob 직렬화", en: "DV blob serialization" },
      { pr: 3291, status: "closed", author: "unikdahal", ko: "파일 단위 position delete 인덱스 로더", en: "Per-file position delete index loader" },
      { pr: 3329, status: "closed", author: "unikdahal", ko: "정렬 position delete writer", en: "Sorted position delete writer" },
      { pr: 3345, status: "closed", author: "unikdahal", ko: "delete 파일 크기 지연 확인", en: "Lazily check delete file sizes" },
    ],
  },
  {
    project: "paimon-rust",
    label: "Paimon-Rust",
    items: [
      { pr: 1329, status: "merged", author: "suxiaogang223", ko: "딕셔너리 인코딩 예산 소진 전 flush", en: "Flush before the dictionary encoding budget runs out" },
      { pr: 1319, status: "merged", author: "PDGGK", ko: "UPDATE 로 버킷 키가 바뀌면 행 이동", en: "Move rows when UPDATE changes the bucket key" },
      { pr: 1214, status: "merged", author: "QuakeWang", ko: "DataFusion replace_tag", en: "DataFusion replace_tag" },
      { pr: 1210, status: "merged", author: "JingsongLi", ko: "Arrow row ID 입력으로 삭제", en: "Delete by Arrow row ID input" },
      { pr: 1188, status: "merged", author: "JingsongLi", ko: "버킷별 append writer 설정 유지", en: "Keep per-bucket append writer settings" },
      { pr: 1176, status: "merged", author: "QuakeWang", ko: "non-DE append 테이블 full-text prefilter", en: "Full-text prefilter for non-DE append tables" },
      { pr: 1144, status: "merged", author: "JingsongLi", ko: "upsert 용 Arrow 레이아웃 정규화", en: "Normalize Arrow layout for upserts" },
      { pr: 1139, status: "merged", author: "reswqa", ko: "partial-update 삭제 상태 보존", en: "Preserve delete state in partial-update" },
      { pr: 1390, status: "open", author: "suxiaogang223", ko: "소비된 merge batch 회수", en: "Reclaim consumed merge batches" },
      { pr: 1267, status: "closed", author: "QuakeWang", ko: "local-cache 확장 제외", en: "Exclude local-cache extension" },
    ],
  },
  {
    project: "iceberg",
    label: "Iceberg (Java)",
    items: [
      { pr: 18626, status: "merged", author: "kinolaev", ko: "추가된 데이터 파일은 동시 DV 검증 생략", en: "Skip concurrent DV validation for added data files" },
      { pr: 18478, status: "merged", author: "jiwen624", ko: "timestamp_ns 파티션 IN/NOT IN 오류", en: "Fix IN/NOT IN on timestamp_ns partitions" },
      { pr: 18846, status: "open", author: "jiwen624", ko: "CoW 와 eq delete 경합 시 삭제 행 부활", en: "Deleted rows resurrected when CoW races with equality deletes" },
      { pr: 18673, status: "open", author: "rajendrag", ko: "메타데이터 삭제에서 null 파티션 보존", en: "Preserve null partitions in metadata deletes" },
      { pr: 18631, status: "open", author: "mikepapadim", ko: "delete 파일 복사 시 equality field ID 보존", en: "Keep equality field IDs when copying delete files" },
      { pr: 18622, status: "open", author: "Neuw84", ko: "UUID bounds unsigned 정렬", en: "Unsigned ordering for UUID bounds" },
      { pr: 18617, status: "open", author: "autoCAT6", ko: "메타데이터 삭제의 NULL 의미 보존", en: "Preserve NULL semantics in metadata deletes" },
      { pr: 18603, status: "open", author: "sezruby", ko: "UPDATE delete 충돌 범위 축소", en: "Narrow the delete conflict scope for UPDATE" },
      { pr: 18495, status: "open", author: "ebyhr", ko: "1.11.x 백포트 : DV 공유 Puffin 보존", en: "1.11.x backport: preserve Puffin files shared by DVs" },
      { pr: 18343, status: "open", author: "grantatspothero", ko: "delete file index 병렬 로딩", en: "Load the delete file index in parallel" },
      { pr: 18268, status: "open", author: "zhang-arvin", ko: "고아 merged DV Puffin 삭제", en: "Delete orphaned merged DV Puffin files" },
      { pr: 18224, status: "open", author: "hemanthboyina", ko: "동시에 추가된 DV 감지", en: "Detect concurrently added DVs" },
    ],
  },
];

export function prUrl(project: ProjectKey, pr: number, anchor?: string) {
  return `https://github.com/${PROJECTS[project].repo}/pull/${pr}${anchor ? `#${anchor}` : ""}`;
}
