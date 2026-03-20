"use client";

import GiscusWidget from "@giscus/react";

export default function Giscus() {
  return (
    <div className="mt-12 pt-8 border-t border-border-color">
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
