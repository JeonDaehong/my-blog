"use client";

import { useState, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark-dimmed.css";
import { Components } from "react-markdown";
import { HiOutlineClipboard, HiOutlineCheck } from "react-icons/hi2";

function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, "")
    .replace(/\s+/g, "-");
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-400 hover:text-gray-200 transition-all opacity-0 group-hover:opacity-100"
      aria-label="Copy code"
    >
      {copied ? <HiOutlineCheck size={14} className="text-green-400" /> : <HiOutlineClipboard size={14} />}
    </button>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as any).props.children);
  }
  return "";
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
    a: ({ href, children }) => {
      const isExternal = href?.startsWith("http");
      return (
        <a
          href={href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
    img: ({ src, alt }) => {
      const url = typeof src === "string" ? src : "";
      return (
        <img
          src={url}
          alt={alt || ""}
          className="cursor-zoom-in"
          onClick={() => url && setLightbox(url)}
        />
      );
    },
    pre: ({ children }) => {
      const codeText = extractText(children);
      return (
        <div className="code-block-wrapper group relative">
          <CopyButton code={codeText} />
          {children}
        </div>
      );
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
