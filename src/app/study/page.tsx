import type { Metadata } from "next";
import StudyList from "@/components/StudyList";
import StudyHeading from "@/components/StudyHeading";
import StudyPagination from "@/components/StudyPagination";
import { loadStudyPage } from "@/lib/study";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "공부 블로그 · Study Blog",
  description: "개인 공부, 사이드 프로젝트, 그 밖의 기록",
};

export default async function StudyPage() {
  const { posts, pagination } = await loadStudyPage(1);

  return (
    <>
      <StudyHeading
        title="공부 블로그"
        titleEn="Study Blog"
        subtitle="개인 공부, 사이드 프로젝트, 그 밖의 기록"
        subtitleEn="Personal study, side projects, and everything else"
      />
      <StudyList posts={posts} />
      <StudyPagination pagination={pagination} />
    </>
  );
}
