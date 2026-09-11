import type { Metadata } from "next";
import StudyList from "@/components/StudyList";
import { loadStudyPosts } from "@/lib/study";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "공부 블로그",
  description: "개인 공부, 사이드 프로젝트, 그 밖의 기록",
};

export default async function StudyPage() {
  const posts = await loadStudyPosts();

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-[24px] sm:text-[30px] font-bold tracking-tight text-text-primary">
          공부 블로그
        </h1>
        <p className="mt-1 text-text-tertiary text-xs sm:text-sm">
          개인 공부, 사이드 프로젝트, 그 밖의 기록
        </p>
      </div>
      <StudyList posts={posts} />
    </>
  );
}
