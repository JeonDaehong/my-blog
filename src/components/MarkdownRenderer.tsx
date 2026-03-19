"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Components } from "react-markdown";

function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, "")
    .replace(/\s+/g, "-");
}

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
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
