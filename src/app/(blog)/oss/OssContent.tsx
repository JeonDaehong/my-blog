"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GoGitMerge, GoGitPullRequest, GoGitPullRequestClosed, GoRepo, GoStack } from "react-icons/go";
import { HiArrowRight } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";
import {
  CONTRIBUTIONS,
  PROJECTS,
  REVIEWS,
  REVIEWS_AS_OF,
  prUrl,
  type Contribution,
  type ProjectKey,
  type Review,
  type ReviewStatus,
} from "@/lib/oss";

/*
  구성은 카탈로그형 페이지(예 : MonkeyLearn 모듈 목록)를 따른다.
  - 맨 위 가운데 : 제목, 한 줄 숫자, 프로젝트 원형 버튼 줄 (누르면 그 프로젝트만)
  - 아래 왼쪽     : 분류 알약 목록 (기여 유형 / 리뷰 상태)
  - 아래 오른쪽   : 흰 카드 3열 격자 + "더 보기"
*/

const PAGE = 9;

type ContribType = "Performance" | "Bug Fix" | "Improvement" | "Docs";
const CONTRIB_TYPES: { key: ContribType; ko: string; en: string }[] = [
  { key: "Performance", ko: "성능 개선", en: "Performance" },
  { key: "Bug Fix", ko: "버그 수정", en: "Bug fixes" },
  { key: "Improvement", ko: "개선", en: "Improvements" },
  { key: "Docs", ko: "문서", en: "Docs" },
];

const STATUS: Record<ReviewStatus, { ko: string; en: string; color: string; Icon: typeof GoGitMerge }> = {
  merged: { ko: "머지", en: "Merged", color: "var(--pr-merged)", Icon: GoGitMerge },
  open: { ko: "열림", en: "Open", color: "var(--pr-open)", Icon: GoGitPullRequest },
  closed: { ko: "닫힘", en: "Closed", color: "var(--pr-closed)", Icon: GoGitPullRequestClosed },
};

type View = { kind: "contrib"; type: ContribType | null } | { kind: "review"; status: ReviewStatus | null };
type ReviewItem = Review & { project: ProjectKey };

const typeOf = (c: Contribution) => c.tags[0] as ContribType;
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dateLabel = (d: string, isKo: boolean) => {
  const [yy, mm] = d.split(".");
  return isKo ? `20${yy}.${mm}` : `${MONTHS_EN[Number(mm) - 1]} 20${yy}`;
};

/** 프로젝트 색을 옅게 깐 원 안에 아이콘 */
function IconBubble({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="relative flex items-center justify-center w-10 h-10 rounded-full shrink-0" style={{ color }}>
      <span className="absolute inset-0 rounded-full opacity-[0.13]" style={{ background: color }} />
      <span className="relative">{children}</span>
    </span>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-all ${
        active
          ? "bg-accent text-white shadow-[0_2px_8px_rgba(232,112,64,0.35)]"
          : "bg-bg-primary text-text-secondary border border-border-color hover:text-text-primary hover:border-border-light"
      }`}
    >
      {children}
    </button>
  );
}

const CARD =
  "group flex flex-col h-full rounded-2xl bg-bg-primary border border-border-color p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(16,24,40,0.18)] hover:border-border-light";

function ContributionCard({ c, isKo }: { c: Contribution; isKo: boolean }) {
  const p = PROJECTS[c.project];
  const desc = (isKo ? c.ko : c.en).replace(/`/g, "");
  return (
    <a href={prUrl(c.project, c.pr, c.anchor)} target="_blank" rel="noopener noreferrer" className={CARD}>
      <div className="flex items-start justify-between">
        <IconBubble color={p.ink}>
          <GoGitMerge size={18} />
        </IconBubble>
        {c.impact && (
          <span
            className="px-2.5 py-1 rounded-full text-[12px] font-bold tabular-nums"
            style={{ color: "var(--impact)", background: "var(--impact-bg)" }}
          >
            {isKo ? c.impact.ko : c.impact.en}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-[15px] font-semibold leading-snug text-text-primary line-clamp-2">
        {isKo ? c.title.ko : c.title.en}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-text-tertiary line-clamp-3">{desc}</p>
      <div className="mt-auto pt-4 flex items-center gap-2 text-[12px] text-text-tertiary">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
        <span className="truncate">{p.name}</span>
        <span>·</span>
        <span className="shrink-0 tabular-nums">{dateLabel(c.date, isKo)}</span>
        <span className="ml-auto shrink-0 font-mono group-hover:text-accent transition-colors">#{c.pr}</span>
      </div>
    </a>
  );
}

function ReviewCard({ r, isKo }: { r: ReviewItem; isKo: boolean }) {
  const p = PROJECTS[r.project];
  const s = STATUS[r.status];
  return (
    <a href={prUrl(r.project, r.pr)} target="_blank" rel="noopener noreferrer" className={CARD}>
      <div className="flex items-start justify-between">
        <IconBubble color={s.color}>
          <s.Icon size={18} />
        </IconBubble>
        <span className="text-[12px] font-medium" style={{ color: s.color }}>
          {isKo ? s.ko : s.en}
        </span>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold leading-snug text-text-primary line-clamp-3">{isKo ? r.ko : r.en}</h3>
      <p className="mt-1.5 text-[13px] text-text-tertiary">
        <span className="font-mono">#{r.pr}</span> · @{r.author}
      </p>
      <div className="mt-auto pt-4 flex items-center gap-2 text-[12px] text-text-tertiary">
        <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
        <span className="truncate">{p.name}</span>
        {r.coauthor && (
          <span className="ml-auto shrink-0 px-2 py-0.5 rounded-full bg-accent-muted text-accent text-[11.5px] font-semibold">
            {isKo ? "공동 작성" : "Co-author"}
          </span>
        )}
      </div>
    </a>
  );
}

export default function OssContent() {
  const { locale } = useI18n();
  const isKo = locale === "ko";
  const [project, setProject] = useState<ProjectKey | null>(null);
  const [view, setView] = useState<View>({ kind: "contrib", type: null });
  const [limit, setLimit] = useState(PAGE);

  const allReviews: ReviewItem[] = useMemo(
    () => REVIEWS.flatMap((g) => g.items.map((r) => ({ ...r, project: g.project }))),
    [],
  );

  const projects = useMemo(
    () =>
      (Object.keys(PROJECTS) as ProjectKey[])
        .map((k) => ({
          key: k,
          total:
            CONTRIBUTIONS.filter((c) => c.project === k).length + allReviews.filter((r) => r.project === k).length,
        }))
        .filter((p) => p.total > 0)
        .sort((a, b) => b.total - a.total),
    [allReviews],
  );

  const inProject = <T extends { project: ProjectKey }>(xs: T[]) => xs.filter((x) => !project || x.project === project);
  const contribs = inProject(CONTRIBUTIONS);
  const reviews = inProject(allReviews);

  const items =
    view.kind === "contrib"
      ? contribs.filter((c) => !view.type || typeOf(c) === view.type)
      : reviews.filter((r) => !view.status || r.status === view.status);

  function go(next: View) {
    setView(next);
    setLimit(PAGE);
  }
  function pickProject(k: ProjectKey | null) {
    setProject(k);
    setLimit(PAGE);
  }

  // 오른쪽 제목 : 기여한 PR · "Paimon-Rust · 성능 개선"
  const filterLabel = [
    project ? PROJECTS[project].name : null,
    view.kind === "contrib" && view.type
      ? CONTRIB_TYPES.find((t) => t.key === view.type)![isKo ? "ko" : "en"]
      : null,
    view.kind === "review" && view.status ? STATUS[view.status][isKo ? "ko" : "en"] : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const heading = view.kind === "contrib" ? (isKo ? "기여한 PR" : "Contributions") : isKo ? "리뷰한 PR" : "Reviews";

  return (
    <div className="break-keep">
      {/* 머리말 */}
      <header className="text-center pt-4">
        <p className="text-[12px] font-semibold tracking-[0.16em] uppercase text-accent">Open Source</p>
        <h1 className="mt-3 text-[30px] sm:text-[38px] font-bold tracking-tight text-text-primary">
          {isKo ? "오픈소스 기여 기록" : "Open source work"}
        </h1>
        <p className="mt-3 mx-auto max-w-xl text-[15px] leading-relaxed text-text-secondary">
          {isKo
            ? "데이터 인프라 프로젝트에 보낸 PR 과, 다른 기여자의 PR 에 남긴 리뷰를 모았습니다."
            : "PRs I sent to data infrastructure projects, and reviews I left on other contributors' PRs."}
        </p>
        <p className="mt-4 text-[13px] text-text-tertiary tabular-nums">
          {isKo ? "기여" : "PRs"} <b className="text-text-primary">{CONTRIBUTIONS.length}</b>
          <span className="mx-2.5 text-border-light">|</span>
          {isKo ? "리뷰" : "Reviews"} <b className="text-text-primary">{allReviews.length}</b>
          <span className="mx-2.5 text-border-light">|</span>
          {isKo ? "프로젝트" : "Projects"} <b className="text-text-primary">{projects.length}</b>
        </p>

        {/* 프로젝트 원형 버튼 */}
        <div className="mt-9 flex flex-wrap justify-center gap-x-5 gap-y-4 sm:gap-x-7">
          {[{ key: null as ProjectKey | null, total: CONTRIBUTIONS.length + allReviews.length }, ...projects].map((p) => {
            const active = project === p.key;
            const meta = p.key ? PROJECTS[p.key] : null;
            return (
              <button key={p.key ?? "all"} onClick={() => pickProject(p.key)} aria-pressed={active} className="group w-[72px] sm:w-20">
                <span
                  className={`mx-auto flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-bg-primary border transition-all ${
                    active
                      ? "border-accent ring-4 ring-accent-muted"
                      : "border-border-color shadow-[0_4px_14px_-6px_rgba(16,24,40,0.18)] group-hover:-translate-y-0.5"
                  }`}
                  style={{ color: meta ? meta.ink : "var(--text-secondary)" }}
                >
                  {meta ? <GoRepo size={24} /> : <GoStack size={24} />}
                </span>
                <span
                  className={`mt-2 block text-[12px] leading-tight ${
                    active ? "text-accent font-semibold" : "text-text-secondary"
                  }`}
                >
                  {meta ? meta.name : isKo ? "전체" : "All"}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <hr className="mt-12 mb-10 border-border-color" />

      <div className="lg:grid lg:grid-cols-[190px_1fr] lg:gap-10">
        {/* 왼쪽 분류 */}
        <aside className="mb-8 lg:mb-0">
          <h2 className="hidden lg:block text-[17px] font-semibold text-text-primary mb-5">{isKo ? "분류" : "Browse"}</h2>

          <div className="space-y-5">
            <div>
              <p className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-wider text-text-tertiary">
                {isKo ? "기여한 PR" : "Contributions"}
              </p>
              <div className="flex lg:flex-col lg:items-start gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
                <Pill active={view.kind === "contrib" && !view.type} onClick={() => go({ kind: "contrib", type: null })}>
                  {isKo ? "전체" : "All"} <span className="opacity-60 tabular-nums">{contribs.length}</span>
                </Pill>
                {CONTRIB_TYPES.map((t) => {
                  const n = contribs.filter((c) => typeOf(c) === t.key).length;
                  // 0건이라도 지금 고른 분류는 남겨 둔다. 숨기면 걸린 필터를 풀 방법이 안 보인다.
                  if (n === 0 && !(view.kind === "contrib" && view.type === t.key)) return null;
                  return (
                    <Pill
                      key={t.key}
                      active={view.kind === "contrib" && view.type === t.key}
                      onClick={() => go({ kind: "contrib", type: t.key })}
                    >
                      {isKo ? t.ko : t.en} <span className="opacity-60 tabular-nums">{n}</span>
                    </Pill>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-wider text-text-tertiary">
                {isKo ? "리뷰한 PR" : "Reviews"}
              </p>
              <div className="flex lg:flex-col lg:items-start gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
                <Pill active={view.kind === "review" && !view.status} onClick={() => go({ kind: "review", status: null })}>
                  {isKo ? "전체" : "All"} <span className="opacity-60 tabular-nums">{reviews.length}</span>
                </Pill>
                {(Object.keys(STATUS) as ReviewStatus[]).map((s) => {
                  const n = reviews.filter((r) => r.status === s).length;
                  if (n === 0 && !(view.kind === "review" && view.status === s)) return null;
                  return (
                    <Pill
                      key={s}
                      active={view.kind === "review" && view.status === s}
                      onClick={() => go({ kind: "review", status: s })}
                    >
                      {STATUS[s][isKo ? "ko" : "en"]} <span className="opacity-60 tabular-nums">{n}</span>
                    </Pill>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="hidden lg:block mt-8 pt-6 border-t border-border-color">
            <p className="text-[14px] font-semibold text-text-primary">
              {isKo ? "기여 과정이 궁금하다면" : "Want the full story?"}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-text-tertiary">
              {isKo ? "이슈를 고르고 PR 이 머지되기까지를 글로 정리했습니다." : "How each PR went from issue to merge, written up."}
            </p>
            <Link
              href="/category/opensource"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:gap-2.5 transition-all"
            >
              {isKo ? "오픈소스기여 글 보기" : "Read the posts"} <HiArrowRight size={14} />
            </Link>
          </div>
        </aside>

        {/* 오른쪽 카드 */}
        <section>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-6">
            <h2 className="text-[20px] sm:text-[22px] font-semibold text-text-primary">
              {heading}
              {filterLabel && <span className="text-accent"> “{filterLabel}”</span>}
            </h2>
            <span className="text-[13px] text-text-tertiary tabular-nums">
              {isKo ? `${items.length}건` : `${items.length}`}
            </span>
            {view.kind === "review" && (
              <span className="basis-full text-[12.5px] text-text-tertiary">
                {isKo ? `상태는 ${REVIEWS_AS_OF} 기준입니다.` : `Status as of ${REVIEWS_AS_OF}.`}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-light py-16 text-center text-[14px] text-text-tertiary">
              {isKo ? "이 조건에 해당하는 PR 이 없습니다." : "Nothing here yet."}
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.slice(0, limit).map((it) => (
                <li key={`${it.project}-${it.pr}`}>
                  {view.kind === "contrib" ? (
                    <ContributionCard c={it as Contribution} isKo={isKo} />
                  ) : (
                    <ReviewCard r={it as ReviewItem} isKo={isKo} />
                  )}
                </li>
              ))}
            </ul>
          )}

          {items.length > limit && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setLimit((l) => l + PAGE)}
                className="px-6 py-2.5 rounded-full border border-accent text-accent text-[14px] font-semibold hover:bg-accent hover:text-white transition-colors"
              >
                {isKo
                  ? `${Math.min(PAGE, items.length - limit)}개 더 보기`
                  : `Show ${Math.min(PAGE, items.length - limit)} more`}
              </button>
            </div>
          )}

          <div className="lg:hidden mt-10 pt-6 border-t border-border-color text-center">
            <Link href="/category/opensource" className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent">
              {isKo ? "기여 과정을 풀어 쓴 글 보기" : "Read the full write-ups"} <HiArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
