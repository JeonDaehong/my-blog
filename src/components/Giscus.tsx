"use client";

import { useCallback } from "react";
import GiscusWidget from "@giscus/react";

export default function Giscus() {
  const handleMouseEnter = useCallback(() => {
    document.querySelectorAll<HTMLElement>(".custom-cursor-el").forEach((el) => {
      el.style.opacity = "0";
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    document.querySelectorAll<HTMLElement>(".custom-cursor-el").forEach((el) => {
      el.style.opacity = "1";
    });
  }, []);

  return (
    <div
      className="giscus-wrapper mt-8 sm:mt-14 pt-6 sm:pt-10 border-t border-border-color"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
        theme="dark"
        lang="ko"
        loading="lazy"
      />
    </div>
  );
}
