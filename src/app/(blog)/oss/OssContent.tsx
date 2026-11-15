"use client";

import { useState } from "react";
import Link from "next/link";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";
import {
  CONTRIBUTIONS,
  PROJECTS,
  REVIEWS,
  REVIEWS_AS_OF,
  prUrl,
  type ProjectKey,
  type ReviewStatus,
} from "@/lib/oss";

type Filter = "all" | ReviewStatus;

const STATUS = {
  merged: { ko: "머지", en: "Merged", cls: "bg-[#8957e5]/15 text-[#8957e5]" },
  open: { ko: "열림", en: "Open", cls: "bg-[#2da44e]/15 text-[#2da44e]" },
  closed: { ko: "닫힘", en: "Closed", cls: "bg-text-tertiary/15 text-text-tertiary" },
} as const;

/** 요약문 속 `코드` 를 code 태그로 바꾼다 */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="px-1 py-0.5 rounded bg-bg-tertiary text-[0.92em]">{part}</code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function ProjectChip({ project }: { project: ProjectKey }) {
  const p = PROJECTS[project];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-md text-[11.5px] font-bold uppercase tracking-wide whitespace-nowrap"
      style={{ background: p.color, color: p.text }}
    >
      {p.name}
    </span>
  );
}

export default function OssContent() {
  const { locale } = useI18n();
  const isKo = locale === "ko";
  const [filter, setFilter] = useState<Filter>("all");

  const allReviews = REVIEWS.flatMap((g) => g.items);
  const count = (s: ReviewStatus) => allReviews.filter((r) => r.status === s).length;
  const projectCount = new Set([...CONTRIBUTIONS.map((c) => c.project), ...REVIEWS.map((g) => g.project)]).size;

  const stats = [
    { label: isKo ? "기여한 PR" : "Contributed PRs", value: CONTRIBUTIONS.length },
    { label: isKo ? "리뷰한 PR" : "Reviewed PRs", value: allReviews.length },
    { label: isKo ? "그중 머지" : "Of which merged", value: count("merged") },
    { label: isKo ? "프로젝트" : "Projects", value: projectCount },
  ];

  const filters: { key: Filter; label: string; n: number }[] = [
    { key: "all", label: isKo ? "전체" : "All", n: allReviews.length },
    { key: "merged", label: STATUS.merged[locale], n: count("merged") },
    { key: "open", label: STATUS.open[locale], n: count("open") },
    { key: "closed", label: STATUS.closed[locale], n: count("closed") },
  ];

  return (
    <div className="max-w-3xl mx-auto break-keep">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">OSS</h1>
      <p className="text-sm text-text-tertiary leading-relaxed">
        {isKo ? (
          <>
            오픈소스 프로젝트에 직접 기여한 PR 과, 다른 기여자의 PR 에 리뷰를 남긴 기록입니다.
            <br />
            기여 과정을 풀어 쓴 글은{" "}
            <Link href="/category/opensource" className="text-accent hover:underline">오픈소스기여</Link> 카테고리에 있습니다.
          </>
        ) : (
          <>
            PRs I contributed to open source projects, and PRs from other contributors that I reviewed.
            <br />
            Longer write-ups live in the{" "}
            <Link href="/category/opensource" className="text-accent hover:underline">Open Source</Link> category.
          </>
        )}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border-color bg-bg-secondary px-4 py-3">
            <div className="text-2xl font-bold text-text-primary tabular-nums">{s.value}</div>
            <div className="text-[12px] text-text-tertiary mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 직접 기여 */}
      <section id="contributions" className="mt-12 scroll-mt-20">
        <h2 className="text-lg font-bold text-text-primary mb-1">{isKo ? "직접 기여한 PR" : "Contributions"}</h2>
        <p className="text-[13px] text-text-tertiary mb-4">{isKo ? "최신순" : "Newest first"}</p>
        <ul className="divide-y divide-border-color border-y border-border-color">
          {CONTRIBUTIONS.map((c) => (
            <li key={`${c.project}-${c.pr}`} className="py-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <ProjectChip project={c.project} />
                {c.tags.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded-md border border-border-color text-[11.5px] text-text-secondary whitespace-nowrap">
                    {t}
                  </span>
                ))}
                <span className="ml-auto text-[12px] text-text-tertiary tabular-nums">{c.date}</span>
              </div>
              <p className="mt-2 text-[14.5px] text-text-primary leading-relaxed">
                <Inline text={isKo ? c.ko : c.en} />
              </p>
              <a
                href={prUrl(c.project, c.pr, c.anchor)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-[12.5px] text-accent hover:underline"
              >
                {PROJECTS[c.project].repo}#{c.pr} <HiArrowTopRightOnSquare size={12} />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 리뷰 */}
      <section id="reviews" className="mt-14 scroll-mt-20">
        <h2 className="text-lg font-bold text-text-primary mb-1">{isKo ? "리뷰한 PR" : "Reviews"}</h2>
        <p className="text-[13px] text-text-tertiary mb-4">
          {isKo
            ? `다른 기여자의 PR 에 리뷰를 남긴 기록입니다. 상태는 ${REVIEWS_AS_OF} 기준입니다.`
            : `PRs from other contributors that I reviewed. Status as of ${REVIEWS_AS_OF}.`}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                filter === f.key
                  ? "bg-accent-muted text-accent"
                  : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
              }`}
            >
              {f.label} <span className="tabular-nums opacity-70">{f.n}</span>
            </button>
          ))}
        </div>

        {REVIEWS.map((g) => {
          const items = g.items.filter((r) => filter === "all" || r.status === filter);
          if (items.length === 0) return null;
          return (
            <div key={g.project} className="mb-10">
              <div className="flex items-center gap-2 mb-2">
                <ProjectChip project={g.project} />
                <span className="text-[13px] text-text-tertiary">
                  {g.label} · {items.length}
                </span>
              </div>
              <ul className="divide-y divide-border-color border-y border-border-color">
                {items.map((r) => (
                  <li key={r.pr} className="py-2.5 flex items-start gap-3">
                    <span className={`shrink-0 mt-0.5 w-11 text-center py-0.5 rounded-md text-[11.5px] font-semibold ${STATUS[r.status].cls}`}>
                      {STATUS[r.status][locale]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] text-text-primary leading-snug">
                        {isKo ? r.ko : r.en}
                        {r.coauthor && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-accent-muted text-accent text-[11px] font-semibold whitespace-nowrap">
                            {isKo ? "공동 작성" : "Co-author"}
                          </span>
                        )}
                      </p>
                      <div className="mt-0.5 text-[12px] text-text-tertiary">
                        <a href={prUrl(g.project, r.pr)} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                          #{r.pr}
                        </a>
                        {" · "}
                        <a href={`https://github.com/${r.author}`} target="_blank" rel="noopener noreferrer" className="hover:text-text-primary">
                          @{r.author}
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
