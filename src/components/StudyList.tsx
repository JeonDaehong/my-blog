"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { HiOutlineEye } from "react-icons/hi2";
import type { PostSummary } from "@/lib/types";

/**
 * 당근 기술 블로그식 목록. 카드 격자 대신 한 줄에 한 글씩 놓고,
 * 왼쪽에 글, 오른쪽에 작은 썸네일을 둔다. 구분은 테두리가 아니라 가로선이다.
 */
export default function StudyList({ posts }: { posts: PostSummary[] }) {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (posts.length === 0) return;
    const paths = posts.map((post) => `/study/${post.slug}`).join(",");
    fetch(`/api/views?paths=${encodeURIComponent(paths)}`)
      .then((r) => r.json())
      .then((countMap: Record<string, number>) => {
        const result: Record<string, number> = {};
        for (const post of posts) {
          const path = `/study/${post.slug}`;
          if (countMap[path] !== undefined) result[post.slug] = countMap[path];
        }
        setViewCounts(result);
      })
      .catch(() => {});
  }, [posts]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-text-tertiary text-sm">아직 올린 글이 없다</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-color">
      {posts.map((post) => (
        <article key={post.id}>
          <Link href={`/study/${post.slug}`} className="group flex gap-4 sm:gap-6 py-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5 text-[12px]">
                {post.category && (
                  <span className="font-medium text-accent">{post.category.name}</span>
                )}
                <span className="text-text-tertiary">
                  {format(new Date(post.createdAt), "yyyy.MM.dd")}
                </span>
                {viewCounts[post.slug] !== undefined && (
                  <span className="inline-flex items-center gap-1 text-text-tertiary tabular-nums">
                    <HiOutlineEye size={12} />
                    {viewCounts[post.slug].toLocaleString()}
                  </span>
                )}
              </div>

              <h2 className="text-[16px] sm:text-[18px] font-bold text-text-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="mt-1.5 text-[13px] sm:text-[14px] text-text-tertiary leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>

            {post.coverImage && (
              <div className="shrink-0 self-start w-[88px] sm:w-[120px]">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-bg-tertiary">
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </Link>
        </article>
      ))}
    </div>
  );
}
