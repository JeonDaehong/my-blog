"use client";

import { useI18n } from "@/lib/i18n";

/** 검색 결과 머리말. 질의어와 건수 문구가 언어에 따라 갈린다. */
export default function StudySearchHeading({
  query,
  count,
}: {
  query: string | null;
  count: number;
}) {
  const { t } = useI18n();

  return (
    <div className="mb-5 sm:mb-7">
      <h1 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-text-primary truncate">
        {query ? `‘${query}’` : t("searchTitle")}
      </h1>
      <p className="mt-1 text-text-tertiary text-xs sm:text-sm">
        {!query
          ? t("searchPrompt")
          : count === 0
            ? t("noSearchResults")
            : t("searchResultCount", { count })}
      </p>
    </div>
  );
}
