/**
 * /oss 페이지 데이터. 직접 기여한 PR 과, 리뷰를 남긴 다른 사람의 PR 을 손으로 관리한다.
 *
 * 새 기여는 CONTRIBUTIONS 맨 위에, 리뷰는 해당 프로젝트 목록에 추가한다.
 * 리뷰 상태(머지·열림·닫힘)는 바뀌므로 바꿀 때 REVIEWS_AS_OF 도 같이 고친다.
 */

export type ProjectKey = "paimon-rust" | "iceberg-rust" | "iceberg" | "gravitino" | "spring-kafka";

export const PROJECTS: Record<ProjectKey, { name: string; repo: string; color: string; text: string; ink: string }> = {
  "paimon-rust": { name: "Paimon-Rust", repo: "apache/paimon-rust", color: "#FFD700", text: "#1a1a1a", ink: "#b8930a" },
  "iceberg-rust": { name: "Iceberg-Rust", repo: "apache/iceberg-rust", color: "#00BFFF", text: "#ffffff", ink: "#0a93c4" },
  iceberg: { name: "Iceberg", repo: "apache/iceberg", color: "#00BFFF", text: "#ffffff", ink: "#0a93c4" },
  gravitino: { name: "Gravitino", repo: "apache/gravitino", color: "#FF4500", text: "#ffffff", ink: "#e5470f" },
  "spring-kafka": { name: "Spring Kafka", repo: "spring-projects/spring-kafka", color: "#6DB33F", text: "#ffffff", ink: "#4f9a2a" },
};

export type Contribution = {
  project: ProjectKey;
  pr: number;
  /** PR 본문이 아니라 특정 댓글을 가리켜야 할 때만 쓴다 */
  anchor?: string;
  /** YY.MM */
  date: string;
  tags: string[];
  /** 카드 제목. 짧게 */
  title: { ko: string; en: string };
  ko: string;
  en: string;
  /** 측정한 개선 수치. 목록에서 강조해 보여준다 */
  impact?: { ko: string; en: string };
};

export const CONTRIBUTIONS: Contribution[] = [
  { project: "iceberg-rust", pr: 3433, date: "26.11", tags: ["Improvement", "Core"],
    title: { ko: "delete 파일 크기를 필요할 때 확인", en: "Resolve delete file sizes lazily" },
    ko: "크기를 모르는 delete 파일은 실제로 읽을 때 한 번만 크기를 확인하도록 바꿔, 동시 로딩에서도 중복 요청 없이 처리되게 했습니다.",
    en: "Resolved unknown delete-file sizes lazily, once per file even under concurrent loads, instead of up front." },
  { project: "paimon-rust", pr: 1420, impact: { ko: "읽기 −52%", en: "Read −52%" }, date: "26.11", tags: ["Performance", "Core"],
    title: { ko: "Partial-update 병합 행을 입력에서 바로 모으기", en: "Gather merged partial-update rows from inputs" },
    ko: "키마다 한 줄짜리 batch 를 만들지 않고 각 컬럼을 입력 행에서 바로 모아, partial-update 테이블 읽기 시간을 약 52% 줄였습니다.",
    en: "Gathered merged partial-update rows straight from their input rows instead of building a one-row batch per key, reducing read time by ~52%." },
  { project: "paimon-rust", pr: 1419, impact: { ko: "쓰기 −11~13%", en: "Write −11–13%" }, date: "26.11", tags: ["Performance", "Core"],
    title: { ko: "키 통계를 컬럼 단위로 계산", en: "Column-wise key stats bounds" },
    ko: "PK 데이터 파일의 키 통계(min/max)를 행마다 Datum 으로 비교하던 방식에서 컬럼 단위 스캔으로 바꿔, 쓰기 시간을 약 11~13% 줄였습니다.",
    en: "Found primary-key stats bounds with a typed scan per column instead of comparing a Datum per row, reducing write time by ~11–13%." },
  { project: "paimon-rust", pr: 1377, impact: { ko: "읽기 −54%", en: "Read −54%" }, date: "26.11", tags: ["Performance", "Core"],
    title: { ko: "Partial-update 읽기에서 sort-merge 생략", en: "Skip sort-merge for partial-update reads" },
    ko: "불필요한 sort-merge 를 건너뛰어 partial-update 테이블 읽기를 최적화했습니다. 읽기 시간 약 54% 단축.",
    en: "Optimized partial-update table reads by bypassing unnecessary sort-merge operations, reducing read time by ~54%." },
  { project: "paimon-rust", pr: 1395, impact: { ko: "쓰기 3.4배", en: "Write 3.4×" }, date: "26.11", tags: ["Performance", "Core"],
    title: { ko: "쓰기에서 한 줄짜리 batch 제거", en: "Drop one-row batches in writes" },
    ko: "aggregation · partial-update 쓰기에서 불필요한 한 줄짜리 batch 생성을 없애 쓰기 성능을 약 3.4배 높였습니다.",
    en: "Eliminated unnecessary one-row batch creation during aggregation and partial-update writes, improving write performance by ~3.4x." },
  { project: "paimon-rust", pr: 1145, date: "26.11", tags: ["Bug Fix", "Core"],
    title: { ko: "부정 조건의 NULL 처리를 Java 와 일치", en: "Java-consistent NULL handling in NOT" },
    ko: "부정(NOT) 조건의 NULL 처리를 Java 의미와 맞춰, 행이 잘못 선택되거나 삭제되던 문제를 막았습니다.",
    en: "Fixed NULL handling in negated predicates to match Java semantics, preventing incorrect row selection and deletion." },
  { project: "paimon-rust", pr: 1370, impact: { ko: "읽기 −52%", en: "Read −52%" }, date: "26.11", tags: ["Performance", "Core"],
    title: { ko: "Aggregation 읽기에서 sort-merge 생략", en: "Skip sort-merge for aggregation reads" },
    ko: "불필요한 sort-merge 를 건너뛰어 aggregation 테이블 읽기를 최적화했습니다. 읽기 시간 약 52% 단축.",
    en: "Optimized aggregation table reads by bypassing unnecessary sort-merge operations, reducing read time by ~52%." },
  { project: "paimon-rust", pr: 1338, impact: { ko: "할당 −19.6%", en: "Allocs −19.6%" }, date: "26.11", tags: ["Performance", "Core"],
    title: { ko: "병합 승자 셀을 참조로 유지", en: "Keep winning cells by reference" },
    ko: "병합에서 이긴 셀을 참조로 유지해 키당 할당을 약 19.6%, 읽기 시간을 약 13% 줄였습니다.",
    en: "Kept winning cells by reference, reducing allocations per merged key by ~19.6% and read time by ~13%." },
  { project: "iceberg-rust", pr: 3435, date: "26.11", tags: ["Bug Fix", "Core"],
    title: { ko: "positional delete 로딩 멈춤 수정", en: "Fix hanging positional delete loads" },
    ko: "positional delete 로딩이 실패하면 재시도와 동시 로딩이 멈추던 문제를 고쳤습니다.",
    en: "Fixed positional delete loading failures that caused retries and concurrent loads to hang." },
  { project: "paimon-rust", pr: 1164, impact: { ko: "실행 −62%", en: "Exec −62%" }, date: "26.11", tags: ["Performance", "Core"],
    title: { ko: "단일 run 읽기 최적화", en: "Faster single-run reads" },
    ko: "단일 run 읽기를 최적화했습니다. 실행 시간 약 62% 단축.",
    en: "Optimized single-run reads, reducing execution time by ~62%." },
  { project: "iceberg-rust", pr: 3454, impact: { ko: "읽기 최대 +48%", en: "Read up to +48%" }, date: "26.10", tags: ["Performance", "Core"],
    title: { ko: "삭제 범위로 row selection 만들기", en: "Row selection from deleted ranges" },
    ko: "삭제 범위(deleted ranges)로 delete row selection 을 최적화했습니다. 읽기 성능 최대 48% 개선.",
    en: "Optimized delete row selection using deleted ranges, improving read performance by up to 48%." },
  { project: "paimon-rust", pr: 1190, date: "26.10", tags: ["Bug Fix", "Core"],
    title: { ko: "FLOAT/DOUBLE 비교를 Java 와 일치", en: "Java-consistent FLOAT/DOUBLE comparison" },
    ko: "FLOAT/DOUBLE 비교 결과가 Java 구현과 어긋나던 문제를 고쳤습니다.",
    en: "Fixed FLOAT/DOUBLE comparison inconsistencies with Java." },
  { project: "paimon-rust", pr: 1193, date: "26.10", tags: ["Performance", "Core"],
    title: { ko: "타입 컬럼 캐시로 sort-merge 개선", en: "Cache typed columns in sort-merge" },
    ko: "타입이 정해진 컬럼을 캐시해 sort-merge 성능을 개선했습니다.",
    en: "Cached typed columns to improve sort-merge performance." },
  { project: "paimon-rust", pr: 1162, date: "26.10", tags: ["Performance", "Core"],
    title: { ko: "버퍼와 merge row 재사용", en: "Reuse buffers and merge rows" },
    ko: "버퍼와 merge row 를 재사용해 할당을 줄였습니다.",
    en: "Reused buffers and merge rows to reduce allocations." },
  { project: "paimon-rust", pr: 1148, date: "26.10", tags: ["Performance", "Core"],
    title: { ko: "Roaring run 으로 DV 범위 생성", en: "DV ranges from Roaring runs" },
    ko: "Roaring Bitmap 의 run 을 이용해 deletion vector 범위 생성을 최적화했습니다.",
    en: "Optimized deletion-vector range generation using Roaring Bitmap runs." },
  { project: "iceberg-rust", pr: 3358, date: "26.10", tags: ["Bug Fix", "Core"],
    title: { ko: "FLOAT/DOUBLE 파티션 포맷 정렬", en: "Align FLOAT/DOUBLE partition format" },
    ko: "FLOAT/DOUBLE 파티션 값 포맷을 iceberg-java 와 맞췄습니다.",
    en: "Aligned FLOAT/DOUBLE partition formatting with iceberg-java." },
  { project: "iceberg", pr: 18027, date: "26.09", tags: ["Performance", "Core"],
    title: { ko: "범위 순회로 position delete 검사", en: "Range-based position delete checks" },
    ko: "범위 기반 순회로 벡터화 position delete 검사를 최적화했습니다.",
    en: "Optimized vectorized position-delete checks using range-based traversal." },
  { project: "iceberg", pr: 18207, date: "26.09", tags: ["Improvement", "Core"],
    title: { ko: "Spark 3.5 · 4.0 · 4.1 백포트", en: "Backport to Spark 3.5, 4.0, 4.1" },
    ko: "position delete 최적화를 Spark 3.5, 4.0, 4.1 에 백포트했습니다.",
    en: "Backported position-delete optimizations to Spark 3.5, 4.0 and 4.1." },
  { project: "iceberg", pr: 13851, date: "25.09", tags: ["Docs"],
    title: { ko: "Row-level Deletes 문서 서식 수정", en: "Fix Row-level Deletes doc format" },
    ko: "Row-level Deletes 문서의 Markdown 서식을 고쳤습니다.",
    en: "Fixed Markdown formatting in Row-level Deletes documentation." },
  { project: "gravitino", pr: 8376, date: "25.09", tags: ["Bug Fix"],
    title: { ko: "OAuth2 상위 클래스 검증 추가", en: "OAuth2 superclass validation" },
    ko: "OAuth2 토큰 검증에서 빠져 있던 상위 클래스 검사를 추가했습니다.",
    en: "Fixed missing superclass validation in OAuth2 token validation." },
  { project: "gravitino", pr: 8296, date: "25.08", tags: ["Bug Fix", "Test"],
    title: { ko: "테스트 필드 할당 수정", en: "Fix test field assignments" },
    ko: "메타데이터 서비스 테스트의 잘못된 필드 할당을 고쳤습니다.",
    en: "Fixed incorrect field assignments in metadata service tests." },
  { project: "iceberg", pr: 13853, date: "25.08", tags: ["Docs"],
    title: { ko: "Flink Table Maintenance 문서", en: "Flink Table Maintenance docs" },
    ko: "Flink Table Maintenance 작업을 문서로 정리했습니다.",
    en: "Documented Flink table maintenance operations." },
  { project: "gravitino", pr: 8255, date: "25.08", tags: ["Bug Fix", "Test"],
    title: { ko: "그룹 업데이트 누락 수정", en: "Fix skipped group updates" },
    ko: "역할 이외의 변경을 건너뛰던 그룹 업데이트를 고쳤습니다.",
    en: "Fixed group updates that skipped non-role changes." },
  { project: "gravitino", pr: 8238, date: "25.08", tags: ["Bug Fix", "Test"],
    title: { ko: "EntityCombinedFileset null 처리", en: "Null handling in EntityCombinedFileset" },
    ko: "`EntityCombinedFileset` 의 null 처리를 고쳤습니다.",
    en: "Fixed null handling in `EntityCombinedFileset`." },
  { project: "gravitino", pr: 8144, date: "25.08", tags: ["Bug Fix", "Test"],
    title: { ko: "managed 속성 null-safe 처리", en: "Null-safe managed property" },
    ko: "`managed` 속성을 null 에 안전하게 처리하도록 고쳤습니다.",
    en: "Fixed null-safe handling of the `managed` property." },
  { project: "gravitino", pr: 8098, date: "25.08", tags: ["Improvement"],
    title: { ko: "파티션 요청 검증 추가", en: "Partition request validation" },
    ko: "파티션 작업에 요청 검증을 추가했습니다.",
    en: "Added request validation for partition operations." },
  { project: "iceberg", pr: 13021, anchor: "issuecomment-2903837698", date: "25.05", tags: ["Improvement", "Core"],
    title: { ko: "Flink 테스트 JUnit 5 이전", en: "Migrate Flink tests to JUnit 5" },
    ko: "Flink catalog 테스트를 JUnit 4 에서 JUnit 5 로 옮겼습니다.",
    en: "Migrated Flink catalog tests from JUnit 4 to JUnit 5." },
  { project: "iceberg", pr: 13165, date: "25.05", tags: ["Improvement", "Core"],
    title: { ko: "JUnit 5 이전 Flink 1.19 · 1.20 백포트", en: "Backport JUnit 5 migration to Flink 1.19, 1.20" },
    ko: "JUnit 5 이전 작업을 Flink 1.19, 1.20 모듈에 백포트했습니다.",
    en: "Backported the JUnit 5 migration to Flink 1.19 and 1.20." },
  { project: "spring-kafka", pr: 3543, date: "24.10", tags: ["Improvement", "Docs"],
    title: { ko: "Retry topic 테스트와 문서 개선", en: "Retry topic tests and docs" },
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
export const REVIEWS_AS_OF = "2026-11-19";

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
      { pr: 3697, status: "merged", author: "c-thiel", coauthor: true, ko: "eq delete 대기자 깨우기", en: "Wake equality-delete waiters" },
      { pr: 3507, status: "merged", author: "rich7420", ko: "비교 불가한 page index bounds 페이지 유지", en: "Keep pages whose page index bounds are not comparable" },
      { pr: 3704, status: "open", author: "CTTY", ko: "FileScanTask 에 split offsets 전달", en: "Carry split offsets on FileScanTask" },
      { pr: 3698, status: "open", author: "iceberg-kitten", ko: "경로 기반 position delete 의 파티션 검증", en: "Validate partitions of path-based position deletes" },
      { pr: 3670, status: "open", author: "CTTY", ko: "매니페스트 병렬 파싱 (perf)", en: "Parse manifests concurrently (perf)" },
      { pr: 3624, status: "open", author: "darshpatel1052", ko: "Parquet leaf index 로 프로젝션", en: "Project by Parquet leaf index" },
      { pr: 3587, status: "open", author: "alexanderbianchi", ko: "delete 파일 디코딩을 CPU 런타임에서", en: "Decode delete files on the CPU runtime" },
      { pr: 3566, status: "open", author: "ewoodbury", ko: "매니페스트 파티션 필드를 ID 로 매칭", en: "Match manifest partition fields by ID" },
      { pr: 3564, status: "open", author: "CTTY", ko: "MergingSnapshotProducer·ManifestFilter", en: "MergingSnapshotProducer and ManifestFilter" },
      { pr: 3540, status: "open", author: "comphead", ko: "승격 컬럼 필터링 시 매칭 행 유지", en: "Keep matching rows when filtering promoted columns" },
      { pr: 3537, status: "open", author: "sankarreddy-atlan", ko: "truncate 된 row group 통계로 파일 경계", en: "File boundaries from truncated row group stats" },
      { pr: 3508, status: "open", author: "mattfaltyn", ko: "파일에 없는 nullable 컬럼의 비교 필터링", en: "Comparison filtering on nullable columns missing from the file" },
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
      { pr: 1434, status: "merged", author: "dragonknightk", ko: "partial-update 에서 혼자 온 UPDATE_BEFORE 를 철회로 처리", en: "Treat a lone UPDATE_BEFORE as a retraction in partial-update" },
      { pr: 1417, status: "merged", author: "QuakeWang", ko: "재시도된 스냅샷 게시 뒤 파일 보존", en: "Preserve files after a replayed snapshot publication" },
      { pr: 1267, status: "closed", author: "QuakeWang", ko: "local-cache 확장 제외", en: "Exclude local-cache extension" },
      { pr: 1390, status: "closed", author: "suxiaogang223", ko: "소비된 merge batch 회수", en: "Reclaim consumed merge batches" },
    ],
  },
  {
    project: "iceberg",
    label: "Iceberg (Java)",
    items: [
      { pr: 18626, status: "merged", author: "kinolaev", ko: "추가된 데이터 파일은 동시 DV 검증 생략", en: "Skip concurrent DV validation for added data files" },
      { pr: 18478, status: "merged", author: "jiwen624", ko: "timestamp_ns 파티션 IN/NOT IN 오류", en: "Fix IN/NOT IN on timestamp_ns partitions" },
      { pr: 18997, status: "open", author: "regadas", ko: "ManifestReader 에 addedFiles·deletedFiles 추가", en: "Add addedFiles and deletedFiles to ManifestReader" },
      { pr: 18993, status: "open", author: "fmorillo7694", ko: "v4 테이블에서 새 equality delete 거부", en: "Reject new equality deletes in v4 tables" },
      { pr: 18981, status: "open", author: "iceberg-kitten", ko: "delete 파일 제거 시 append 로 분류하지 않기", en: "Avoid append classification when removing delete files" },
      { pr: 18846, status: "open", author: "jiwen624", ko: "CoW 와 eq delete 경합 시 삭제 행 부활", en: "Deleted rows resurrected when CoW races with equality deletes" },
      { pr: 18673, status: "open", author: "rajendrag", ko: "메타데이터 삭제에서 null 파티션 보존", en: "Preserve null partitions in metadata deletes" },
      { pr: 18631, status: "open", author: "mikepapadim", ko: "delete 파일 복사 시 equality field ID 보존", en: "Keep equality field IDs when copying delete files" },
      { pr: 18622, status: "open", author: "Neuw84", ko: "UUID bounds unsigned 정렬", en: "Unsigned ordering for UUID bounds" },
      { pr: 18617, status: "open", author: "autoCAT6", ko: "메타데이터 삭제의 NULL 의미 보존", en: "Preserve NULL semantics in metadata deletes" },
      { pr: 18603, status: "open", author: "sezruby", ko: "UPDATE delete 충돌 범위 축소", en: "Narrow the delete conflict scope for UPDATE" },
      { pr: 18495, status: "open", author: "ebyhr", ko: "1.11.x 백포트 : DV 공유 Puffin 보존", en: "1.11.x backport: preserve Puffin files shared by DVs" },
      { pr: 18268, status: "open", author: "zhang-arvin", ko: "고아 merged DV Puffin 삭제", en: "Delete orphaned merged DV Puffin files" },
      { pr: 18224, status: "open", author: "hemanthboyina", ko: "동시에 추가된 DV 감지", en: "Detect concurrently added DVs" },
      { pr: 18343, status: "closed", author: "grantatspothero", ko: "delete file index 병렬 로딩", en: "Load the delete file index in parallel" },
    ],
  },
];

export function prUrl(project: ProjectKey, pr: number, anchor?: string) {
  return `https://github.com/${PROJECTS[project].repo}/pull/${pr}${anchor ? `#${anchor}` : ""}`;
}
