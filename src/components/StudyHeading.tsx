"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

/**
 * 공부 블로그 페이지 머리말. 제목과 부제가 언어에 따라 바뀌어야 하는데 페이지 자체는
 * 서버 컴포넌트라 로케일을 모른다. 그래서 한국어·영어를 둘 다 받아 여기서 고른다.
 */
export default function StudyHeading({
  title,
  titleEn,
  subtitle,
  subtitleEn,
  parent,
  count,
}: {
  title: string;
  titleEn?: string | null;
  subtitle?: string;
  subtitleEn?: string;
  parent?: { name: string; nameEn?: string | null; slug: string } | null;
  /** 글 수를 함께 보여줄 때 */
  count?: number;
}) {
  const { locale, t } = useI18n();
  const pick = (ko: string, en?: string | null) => (locale === "en" && en ? en : ko);

  return (
    <div className="mb-5 sm:mb-7">
      {parent && (
        <Link
          href={`/study/category/${parent.slug}`}
          className="text-[13px] text-text-tertiary hover:text-accent transition-colors"
        >
          {pick(parent.name, parent.nameEn)}
        </Link>
      )}
      <h1 className="text-[24px] sm:text-[30px] font-bold tracking-tight text-text-primary">
        {pick(title, titleEn)}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-text-tertiary text-xs sm:text-sm">
          {pick(subtitle, subtitleEn)}
        </p>
      ) : count !== undefined ? (
        <p className="mt-1 text-text-tertiary text-xs sm:text-sm">
          {t("postsInCategory", { count })}
        </p>
      ) : null}
    </div>
  );
}
