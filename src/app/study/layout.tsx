import TopBar, { STUDY_SCOPE } from "@/components/TopBar";
import SiteFooter from "@/components/SiteFooter";
import { loadStudyCategories } from "@/lib/study";

export const revalidate = 60;

export default async function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await loadStudyCategories();

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      {/* 헤더·푸터는 기술 블로그와 같은 것을 쓰고, 경로와 이름만 갈아끼운다 */}
      <div className="min-h-screen flex flex-col">
        <TopBar
          scope={STUDY_SCOPE}
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            nameEn: c.nameEn,
            slug: c.slug,
            _count: { posts: c.count },
            children: c.children,
          }))}
        />
        <main
          id="main-content"
          className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
        >
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
