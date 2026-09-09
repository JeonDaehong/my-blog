"use client";

import { useEffect, useRef, useState } from "react";

const ICON_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14"';

const COPY_ICON = `<svg ${ICON_ATTRS}><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"/></svg>`;
const CHECK_ICON = `<svg ${ICON_ATTRS} class="text-green-400"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>`;

const COPY_BUTTON_CLASS =
  "code-copy-button absolute top-2 right-2 z-10 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-400 hover:text-gray-200 transition-all opacity-0 group-hover:opacity-100";

/**
 * 서버에서 렌더한 본문 HTML을 그대로 삽입하고, 상호작용만 클라이언트에서 붙인다.
 * 이렇게 하면 react-markdown과 highlight.js가 클라이언트 번들에 들어가지 않는다.
 */
export default function PostBody({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // 코드 블록마다 복사 버튼을 붙인다.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];

    root.querySelectorAll<HTMLElement>(".code-block-wrapper").forEach((wrapper) => {
      const button = document.createElement("button");
      button.className = COPY_BUTTON_CLASS;
      button.type = "button";
      button.setAttribute("aria-label", "Copy code");
      button.innerHTML = COPY_ICON;

      let timer: ReturnType<typeof setTimeout> | undefined;
      const onClick = () => {
        const code = wrapper.querySelector("pre code")?.textContent ?? "";
        navigator.clipboard.writeText(code).then(() => {
          button.innerHTML = CHECK_ICON;
          clearTimeout(timer);
          timer = setTimeout(() => {
            button.innerHTML = COPY_ICON;
          }, 2000);
        });
      };

      button.addEventListener("click", onClick);
      wrapper.insertBefore(button, wrapper.firstChild);

      cleanups.push(() => {
        clearTimeout(timer);
        button.removeEventListener("click", onClick);
        button.remove();
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [html]);

  // 이미지 클릭 → 라이트박스 (이벤트 위임)
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "IMG") {
        setLightbox((target as HTMLImageElement).src);
      }
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [html]);

  return (
    <>
      <div
        ref={containerRef}
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
