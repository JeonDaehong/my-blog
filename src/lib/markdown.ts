import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Element, Root } from "hast";
import type { RenderedMarkdown, TocItem } from "@/lib/types";

/**
 * 제목 텍스트 → 앵커 id.
 * 목차와 본문 제목이 같은 규칙을 써야 클릭 시 스크롤이 맞는다.
 */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, "")
    .replace(/\s+/g, "-");
}

function getReadingTime(content: string): number {
  const words = content.replace(/[#*`~\[\]()!>|-]/g, "").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function isWrapped(parent: unknown): boolean {
  const el = parent as Element | undefined;
  const className = el?.properties?.className;
  return Array.isArray(className) && className.includes("code-block-wrapper");
}

/**
 * 클라이언트 MarkdownRenderer가 하던 일을 서버에서 그대로 재현한다.
 * 제목 id 부여, 외부 링크 새 탭, 이미지 확대 커서, 코드 블록 래핑.
 */
function enhance(toc: TocItem[]) {
  return (tree: Root) => {
    const seen = new Map<string, number>();

    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName === "h1" || node.tagName === "h2" || node.tagName === "h3") {
        const text = toString(node).trim();
        if (!text) return;
        const base = headingId(text);
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        // 첫 번째는 기존 id를 그대로 유지해 외부 앵커 링크가 깨지지 않게 한다.
        const id = count === 0 ? base : `${base}-${count + 1}`;
        node.properties = { ...node.properties, id };
        toc.push({ id, text, level: Number(node.tagName.slice(1)) });
        return;
      }

      if (node.tagName === "a") {
        const href = String(node.properties?.href ?? "");
        if (href.startsWith("http")) {
          node.properties = { ...node.properties, target: "_blank", rel: "noopener noreferrer" };
        }
        return;
      }

      if (node.tagName === "img") {
        node.properties = { ...node.properties, className: ["cursor-zoom-in"] };
        return;
      }

      if (node.tagName === "pre" && parent && typeof index === "number" && !isWrapped(parent)) {
        const code = node.children.find(
          (child): child is Element => child.type === "element" && child.tagName === "code"
        );
        const classNames = (code?.properties?.className as string[] | undefined) ?? [];
        const language = classNames
          .find((name) => name.startsWith("language-"))
          ?.slice("language-".length);

        const children: Element[] = [];
        if (language) {
          children.push({
            type: "element",
            tagName: "div",
            properties: { className: ["code-lang-label"] },
            children: [{ type: "text", value: language }],
          });
        }
        children.push(node);

        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["code-block-wrapper", "group", "relative"] },
          children,
        };
      }
    });
  };
}

export async function renderMarkdown(content: string): Promise<RenderedMarkdown> {
  const toc: TocItem[] = [];

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight, { detect: false, ignoreMissing: true })
    .use(() => enhance(toc))
    .use(rehypeStringify)
    .process(content);

  return { html: String(file), toc, readingTime: getReadingTime(content) };
}
