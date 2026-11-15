"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GoArrowUpRight, GoGitMerge, GoGitPullRequest, GoGitPullRequestClosed, GoRepo } from "react-icons/go";
import { HiXMark } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";
import {
  CONTRIBUTIONS,
  PROJECTS,
  REVIEWS,
  REVIEWS_AS_OF,
  prUrl,
  type Contribution,
  type ProjectKey,
  type ReviewStatus,
} from "@/lib/oss";

/*
  화면 구성은 익숙한 패턴을 빌려 왔다.
  - 프로젝트 카드 : GitHub 프로필의 고정 저장소 카드. 누르면 아래 두 목록이 그 프로젝트로 좁혀진다.
  - 기여 목록     : Linear · Stripe 체인지로그처럼 왼쪽에 월, 오른쪽에 항목.
  - 리뷰 목록     : GitHub PR 목록. 테두리 상자 + 상단 상태 필터 + 상태 아이콘.
*/

const REVIEW_PAGE = 12;

const STATUS: Record<ReviewStatus, { ko: string; en: string; color: string; Icon: typeof GoGitMerge }> = {
  merged: { ko: "머지", en: "Merged", color: "var(--pr-merged)", Icon: GoGitMerge },
  open: { ko: "열림", en: "Open", color: "var(--pr-open)", Icon: GoGitPullRequest },
  closed: { ko: "닫힘", en: "Closed", color: "var(--pr-closed)", Icon: GoGitPullRequestClosed },
};

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(date: string, isKo: boolean) {
  const [yy, mm] = date.split(".");
  return isKo ? `20${yy}.${mm}` : `${MONTHS_EN[Number(mm) - 1]} 20${yy}`;
}

/** 요약문 속 `코드` 를 code 태그로 바꾼다 */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="px-1 py-px rounded bg-bg-tertiary border border-border-color text-[0.88em] font-mono">
            {part}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function ProjectMark({ project, size = "sm" }: { project: ProjectKey; size?: "sm" | "lg" }) {
  const p = PROJECTS[project];
  if (size === "sm") {
    return <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />;
  }
  return (
    <span
      className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
      style={{ background: p.color, color: p.text }}
    >
      <GoRepo size={17} />
    </span>
  );
}

function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[19px] font-bold text-text-primary tracking-tight">{title}</h2>
      {desc && <p className="mt-1 text-[13.5px] text-text-tertiary">{desc}</p>}
    </div>
  );
}

function ContributionCard({ c, isKo }: { c: Contribution; isKo: boolean }) {
  const p = PROJECTS[c.project];
  return (
    <a
      href={prUrl(c.project, c.pr, c.anchor)}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-border-color bg-bg-primary px-4 sm:px-5 py-3.5 transition-colors hover:border-border-light hover:bg-bg-secondary"
    >
      <div className="flex items-center gap-2 text-[12.5px]">
        <ProjectMark project={c.project} />
        <span className="font-semibold text-text-secondary">{p.name}</span>
        <span className="hidden sm:inline text-text-tertiary">·</span>
        <span className="hidden sm:inline text-text-tertiary truncate">{c.tags.join(" · ")}</span>
        <span className="ml-auto flex items-center gap-2 shrink-0">
          {c.impact && (
            <span
              className="px-2 py-0.5 rounded-md text-[12px] font-bold tabular-nums"
              style={{ color: "var(--impact)", background: "var(--impact-bg)" }}
            >
              {isKo ? c.impact.ko : c.impact.en}
            </span>
          )}
          <span className="inline-flex items-center gap-0.5 font-mono text-text-tertiary group-hover:text-accent transition-colors">
            #{c.pr}
            <GoArrowUpRight size={13} />
          </span>
        </span>
      </div>
      <p className="mt-1.5 text-[15px] leading-[1.6] text-text-primary group-hover:text-text-primary">
        <Inline text={isKo ? c.ko : c.en} />
      </p>
      <p className="sm:hidden mt-1.5 text-[12px] text-text-tertiary">{c.tags.join(" · ")}</p>
    </a>
  );
}

export default function OssContent() {
  const { locale } = useI18n();
  const isKo = locale === "ko";
  const [project, setProject] = useState<ProjectKey | null>(null);
  const [status, setStatus] = useState<ReviewStatus | null>(null);
  const [showAll, setShowAll] = useState(false);

  const allReviews = useMemo(
    () => REVIEWS.flatMap((g) => g.items.map((r) => ({ ...r, project: g.project }))),
    [],
  );

  // 프로젝트 카드 : 활동이 많은 순서
  const projects = useMemo(() => {
    const keys = Object.keys(PROJECTS) as ProjectKey[];
    return keys
      .map((k) => ({
        key: k,
        contrib: CONTRIBUTIONS.filter((c) => c.project === k).length,
        review: allReviews.filter((r) => r.project === k).length,
      }))
      .filter((p) => p.contrib + p.review > 0)
      .sort((a, b) => b.contrib + b.review - (a.contrib + a.review));
  }, [allReviews]);

  const contributions = CONTRIBUTIONS.filter((c) => !project || c.project === project);
  const months = useMemo(() => {
    const out: { date: string; items: Contribution[] }[] = [];
    for (const c of contributions) {
      const last = out[out.length - 1];
      if (last && last.date === c.date) last.items.push(c);
      else out.push({ date: c.date, items: [c] });
    }
    return out;
  }, [contributions]);

  const reviewsInProject = allReviews.filter((r) => !project || r.project === project);
  const reviews = reviewsInProject.filter((r) => !status || r.status === status);
  const visibleReviews = showAll ? reviews : reviews.slice(0, REVIEW_PAGE);
  const countOf = (s: ReviewStatus) => reviewsInProject.filter((r) => r.status === s).length;

  const stats = [
    { value: CONTRIBUTIONS.length, label: isKo ? "기여한 PR" : "PRs contributed" },
    { value: allReviews.length, label: isKo ? "리뷰한 PR" : "PRs reviewed" },
    { value: allReviews.filter((r) => r.status === "merged").length, label: isKo ? "리뷰 후 머지" : "Reviewed & merged" },
    { value: projects.length, label: isKo ? "프로젝트" : "Projects" },
  ];

  function pickProject(k: ProjectKey) {
    setProject((cur) => (cur === k ? null : k));
    setStatus(null);
    setShowAll(false);
  }

  return (
    <div className="max-w-3xl mx-auto break-keep">
      {/* 머리말 */}
      <header>
        <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-accent">Open Source</p>
        <h1 className="mt-2 text-[30px] sm:text-[36px] font-bold text-text-primary tracking-tight leading-tight">
          {isKo ? "오픈소스 기여 기록" : "Open source work"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          {isKo ? (
            <>
              Apache Iceberg, Paimon, Gravitino 같은 데이터 인프라 프로젝트에 보낸 PR 과, 다른 기여자의 PR 에 남긴 리뷰를 모았습니다.
              기여 과정을 길게 풀어 쓴 글은{" "}
              <Link href="/category/opensource" className="text-accent font-medium hover:underline underline-offset-2">
                오픈소스기여
              </Link>{" "}
              카테고리에 있습니다.
            </>
          ) : (
            <>
              PRs I sent to data infrastructure projects such as Apache Iceberg, Paimon and Gravitino, and reviews I left on other
              contributors&apos; PRs. Longer write-ups live in the{" "}
              <Link href="/category/opensource" className="text-accent font-medium hover:underline underline-offset-2">
                Open Source
              </Link>{" "}
              category.
            </>
          )}
        </p>
      </header>

      {/* 숫자 */}
      <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 rounded-2xl border border-border-color bg-bg-secondary overflow-hidden">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-5 py-4 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""} ${
              i === 2 ? "sm:border-l" : ""
            } border-border-color`}
          >
            <dd className="text-[28px] font-bold text-text-primary tabular-nums leading-none">{s.value}</dd>
            <dt className="mt-2 text-[12.5px] text-text-tertiary">{s.label}</dt>
          </div>
        ))}
      </dl>

      {/* 프로젝트 */}
      <section className="mt-14">
        <SectionHead
          title={isKo ? "프로젝트" : "Projects"}
          desc={isKo ? "카드를 누르면 아래 목록이 그 프로젝트로 좁혀집니다." : "Pick a card to narrow the lists below."}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.map((p) => {
            const active = project === p.key;
            return (
              <button
                key={p.key}
                onClick={() => pickProject(p.key)}
                aria-pressed={active}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                  active
                    ? "border-accent bg-accent-muted ring-1 ring-accent"
                    : "border-border-color bg-bg-primary hover:border-border-light hover:bg-bg-secondary"
                }`}
              >
                <ProjectMark project={p.key} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-text-primary">{PROJECTS[p.key].name}</span>
                  <span className="hidden sm:block text-[12px] font-mono text-text-tertiary truncate">{PROJECTS[p.key].repo}</span>
                </span>
                <span className="shrink-0 text-right text-[12px] leading-[1.5] text-text-tertiary tabular-nums">
                  <span className="block">
                    {isKo ? "기여" : "PRs"} <b className="text-text-primary font-semibold">{p.contrib}</b>
                  </span>
                  <span className="block">
                    {isKo ? "리뷰" : "Reviews"} <b className="text-text-primary font-semibold">{p.review}</b>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {project && (
          <button
            onClick={() => setProject(null)}
            className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bg-tertiary text-[12.5px] text-text-secondary hover:text-text-primary"
          >
            {PROJECTS[project].name} {isKo ? "만 보는 중" : "only"}
            <HiXMark size={14} />
          </button>
        )}
      </section>

      {/* 기여 : 체인지로그 */}
      <section id="contributions" className="mt-14 scroll-mt-20">
        <SectionHead
          title={isKo ? "기여한 PR" : "Contributions"}
          desc={isKo ? `${contributions.length}건 · 최신순` : `${contributions.length} PRs · newest first`}
        />
        <ol className="space-y-8">
          {months.map((m) => (
            <li key={m.date} className="sm:grid sm:grid-cols-[104px_1fr] sm:gap-6">
              <div className="mb-3 sm:mb-0 sm:pt-4">
                <div className="sm:sticky sm:top-24 flex sm:block items-baseline gap-2">
                  <div className="text-[14px] font-semibold text-text-primary tabular-nums">{monthLabel(m.date, isKo)}</div>
                  <div className="text-[12px] text-text-tertiary">{isKo ? `${m.items.length}건` : `${m.items.length} PRs`}</div>
                </div>
              </div>
              <div className="space-y-2.5">
                {m.items.map((c) => (
                  <ContributionCard key={`${c.project}-${c.pr}`} c={c} isKo={isKo} />
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 리뷰 : GitHub PR 목록 */}
      <section id="reviews" className="mt-16 scroll-mt-20">
        <SectionHead
          title={isKo ? "리뷰한 PR" : "Reviews"}
          desc={
            isKo
              ? `다른 기여자의 PR 에 남긴 리뷰입니다. 상태는 ${REVIEWS_AS_OF} 기준입니다.`
              : `Reviews I left on other contributors' PRs. Status as of ${REVIEWS_AS_OF}.`
          }
        />

        <div className="rounded-xl border border-border-color overflow-hidden">
          {/* 상단 바 : 상태 필터 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 bg-bg-secondary border-b border-border-color">
            <button
              onClick={() => {
                setStatus(null);
                setShowAll(false);
              }}
              className={`text-[13.5px] transition-colors ${
                status === null ? "font-semibold text-text-primary" : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              {isKo ? "전체" : "All"} <span className="tabular-nums">{reviewsInProject.length}</span>
            </button>
            {(Object.keys(STATUS) as ReviewStatus[]).map((s) => {
              const { Icon, color } = STATUS[s];
              const active = status === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(active ? null : s);
                    setShowAll(false);
                  }}
                  className={`inline-flex items-center gap-1.5 text-[13.5px] transition-colors ${
                    active ? "font-semibold text-text-primary" : "text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  <Icon size={15} style={{ color }} />
                  <span className="tabular-nums">{countOf(s)}</span> {STATUS[s][locale]}
                </button>
              );
            })}
          </div>

          {/* 목록 */}
          {visibleReviews.length === 0 ? (
            <p className="px-4 py-10 text-center text-[14px] text-text-tertiary">
              {isKo ? "이 프로젝트에서 리뷰한 PR 은 없습니다." : "No reviews in this project."}
            </p>
          ) : (
            <ul className="divide-y divide-border-color">
              {visibleReviews.map((r) => {
                const { Icon, color } = STATUS[r.status];
                return (
                  <li key={`${r.project}-${r.pr}`}>
                    <a
                      href={prUrl(r.project, r.pr)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-bg-hover"
                    >
                      <Icon size={16} className="mt-[3px] shrink-0" style={{ color }} aria-label={STATUS[r.status][locale]} />
                      <span className="min-w-0 flex-1">
                        <span className="text-[14.5px] font-medium leading-snug text-text-primary group-hover:text-accent transition-colors">
                          {isKo ? r.ko : r.en}
                        </span>
                        {r.coauthor && (
                          <span className="ml-2 align-[1px] px-1.5 py-px rounded-full border border-accent text-accent text-[11px] font-semibold whitespace-nowrap">
                            {isKo ? "공동 작성" : "Co-author"}
                          </span>
                        )}
                        <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[12.5px] text-text-tertiary">
                          {!project && (
                            <>
                              <ProjectMark project={r.project} />
                              <span>{PROJECTS[r.project].name}</span>
                              <span>·</span>
                            </>
                          )}
                          <span className="font-mono">#{r.pr}</span>
                          <span>·</span>
                          <span>@{r.author}</span>
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          {reviews.length > REVIEW_PAGE && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full px-4 py-3 border-t border-border-color bg-bg-secondary text-[13.5px] font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {showAll
                ? isKo
                  ? "접기"
                  : "Show less"
                : isKo
                  ? `${reviews.length - REVIEW_PAGE}개 더 보기`
                  : `Show ${reviews.length - REVIEW_PAGE} more`}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
