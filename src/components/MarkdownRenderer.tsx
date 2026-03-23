"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark-dimmed.css";
import { Components } from "react-markdown";

function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const components: Components = {
    h1: ({ children }) => {
      const text = String(children);
      return <h1 id={headingId(text)}>{children}</h1>;
    },
    h2: ({ children }) => {
      const text = String(children);
      return <h2 id={headingId(text)}>{children}</h2>;
    },
    h3: ({ children }) => {
      const text = String(children);
      return <h3 id={headingId(text)}>{children}</h3>;
    },
    img: ({ src, alt }) => (
      <img
        src={src}
        alt={alt || ""}
        className="cursor-zoom-in"
        onClick={() => src && setLightbox(src)}
      />
    ),
    pre: ({ children }) => {
      return <div className="code-block-wrapper">{children}</div>;
    },
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const isBlock = Boolean(match);
      if (isBlock) {
        return (
          <>
            <div className="code-lang-label">{match![1]}</div>
            <pre>
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <>
      <div className="prose max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out"
          onClick={closeLightbox}
        >
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
