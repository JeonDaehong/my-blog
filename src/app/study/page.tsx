import type { Metadata } from "next";
import StudyList from "@/components/StudyList";
import StudyHeading from "@/components/StudyHeading";
import StudyPagination from "@/components/StudyPagination";
import { loadStudyPage } from "@/lib/study";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "공부 블로그 · Study Blog",
  description:
    "개인 공부와 사이드 프로젝트, 그리고 개발하며 배운 것들을 기록하는 블로그입니다. 나중에 다시 찾아볼 수 있도록 배운 내용을 정리하고 있습니다.",
};

export default async function StudyPage() {
  const { posts, pagination } = await loadStudyPage(1);

  return (
    <>
      <StudyHeading
        title="공부 블로그"
        titleEn="Study Blog"
        subtitle={"개인 공부와 사이드 프로젝트, 그리고 개발하며 배운 것들을 기록하는 블로그입니다.\n나중에 다시 찾아볼 수 있도록 배운 내용을 정리하고 있습니다."}
        subtitleEn={"A blog where I record personal study, side projects, and what I learn while building things.\nI write down what I learn so I can find it again later."}
      />
      <StudyList posts={posts} />
      <StudyPagination pagination={pagination} />
    </>
  );
}
