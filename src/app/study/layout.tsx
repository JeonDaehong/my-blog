import StudyHeader from "@/components/StudyHeader";
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
    <div className="min-h-screen flex flex-col">
      <StudyHeader categories={categories} />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>
      <SiteFooter innerClassName="max-w-3xl mx-auto px-4 sm:px-6" />
    </div>
  );
}
