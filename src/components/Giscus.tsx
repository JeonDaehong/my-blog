"use client";

import GiscusWidget from "@giscus/react";
import { useTheme } from "@/components/ThemeProvider";

export default function Giscus() {
  const { theme } = useTheme();

  return (
    <div className="mt-8 sm:mt-14 pt-6 sm:pt-10 border-t border-border-color">
      <h3 className="text-lg font-bold text-text-primary mb-6">Comments</h3>
      <GiscusWidget
        repo="JeonDaehong/my-blog"
        repoId="R_kgDORrZBGg"
        category="General"
        categoryId="DIC_kwDORrZBGs4C43Ri"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === "light" ? "light" : "dark"}
        lang="ko"
        loading="lazy"
      />
    </div>
  );
}
