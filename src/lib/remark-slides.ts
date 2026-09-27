import { visit } from "unist-util-visit";
import type { Root, Code } from "mdast";
import type { Element, ElementContent } from "hast";

/**
 * ```slides 코드 블록을 슬라이드 뷰어로 바꾼다.
 *
 * ```slides
 * pdf: https://res.cloudinary.com/<cloud>/image/upload/v123/blog/talk.pdf
 * pages: 30
 * title: 발표 자료 제목        (선택)
 * skip: 26, 27                (선택, 보여주지 않을 쪽)
 * ```
 *
 * PDF 는 링크하지 않는다. Cloudinary 가 쪽마다 이미지를 만들어 주므로(pg_N) 그 이미지만 넘겨 가며 보여준다.
 * 넘기기·쪽수 표시 같은 동작은 클라이언트의 wireSlideDecks 가 붙인다.
 */
export default function remarkSlides() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "slides" || !parent || typeof index !== "number") return;
      const deck = buildDeck(parseConfig(node.value));
      if (!deck) return;
      parent.children[index] = {
        type: "slides",
        position: node.position,   // 편집기 미리보기의 줄 번호 표식이 이 블록에도 붙도록
        data: { hName: deck.tagName, hProperties: deck.properties, hChildren: deck.children },
      } as never;
    });
  };
}

function parseConfig(value: string): Record<string, string> {
  const config: Record<string, string> = {};
  for (const line of value.split("\n")) {
    const at = line.indexOf(":");
    if (at > 0) config[line.slice(0, at).trim().toLowerCase()] = line.slice(at + 1).trim();
  }
  return config;
}

function pageUrl(pdf: string, page: number): string {
  return pdf.replace("/upload/", `/upload/pg_${page},w_1600,f_auto,q_auto/`);
}

function el(tagName: string, properties: Element["properties"], children: ElementContent[] = []): Element {
  return { type: "element", tagName, properties, children };
}

function buildDeck(config: Record<string, string>): Element | null {
  const pdf = config.pdf;
  const pages = Number(config.pages);
  if (!pdf || !pdf.includes("/upload/") || !Number.isInteger(pages) || pages < 1) return null;

  const skip = new Set((config.skip ?? "").split(/[\s,]+/).filter(Boolean).map(Number));
  const shown = Array.from({ length: pages }, (_, i) => i + 1).filter((page) => !skip.has(page));
  const title = config.title ?? "";

  const slides = shown.map((page, i) =>
    el("div", { className: ["slide"], role: "group", ariaRoleDescription: "slide", ariaLabel: `${i + 1} / ${shown.length}` }, [
      el("img", {
        src: pageUrl(pdf, page),
        alt: title ? `${title} ${i + 1}쪽` : `${i + 1}쪽`,
        loading: i < 2 ? "eager" : "lazy",
        decoding: "async",
        width: 1600,
        height: 900,
      }),
    ])
  );

  // 첫 화면 상태(1쪽 : 이전 버튼 꺼짐)는 HTML 에 미리 적어 둔다. 이후는 스크롤할 때 클라이언트가 고친다.
  const button = (className: string, label: string, symbol: string, disabled: boolean) =>
    el("button", { type: "button", className: ["slide-nav", className], ariaLabel: label, disabled }, [{ type: "text", value: symbol }]);

  return el(
    "figure",
    { className: ["slide-deck"], tabIndex: 0, ariaRoleDescription: "carousel", ariaLabel: title || "슬라이드" },
    [
      el("div", { className: ["slide-track"] }, slides),
      el("figcaption", { className: ["slide-controls"] }, [
        button("slide-prev", "이전 슬라이드", "‹", true),
        el("span", { className: ["slide-counter"], ariaLive: "polite" }, [{ type: "text", value: `1 / ${shown.length}` }]),
        button("slide-next", "다음 슬라이드", "›", shown.length <= 1),
        ...(title ? [el("span", { className: ["slide-title"] }, [{ type: "text", value: title }])] : []),
      ]),
    ]
  );
}
