// 편집창과 미리보기의 스크롤을 마크다운 블록 단위로 맞춘다.
// 편집창의 줄 위치와 미리보기의 블록 위치를 짝지은 앵커를 만들고, 그 사이는 선형 보간한다.

type Anchor = [editorY: number, previewY: number];

// 줄바꿈까지 반영한 편집창 각 줄의 y 좌표. 같은 폭·글꼴의 보이지 않는 복제본에 줄마다 div를 깔아 잰다.
function editorLineTops(ed: HTMLTextAreaElement): number[] {
  const cs = getComputedStyle(ed);
  const mirror = document.createElement("div");
  Object.assign(mirror.style, {
    position: "absolute", visibility: "hidden", top: "0", left: "-9999px",
    boxSizing: "border-box", width: `${ed.clientWidth}px`, padding: cs.padding, border: "0",
    fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, tabSize: cs.tabSize,
    whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: cs.wordBreak,
  });
  for (const line of ed.value.split("\n")) {
    const row = document.createElement("div");
    row.textContent = line || "​";
    mirror.appendChild(row);
  }
  document.body.appendChild(mirror);
  const tops = Array.from(mirror.children, (row) => (row as HTMLElement).offsetTop);
  mirror.remove();
  return tops;
}

export function buildAnchors(ed: HTMLTextAreaElement, pv: HTMLElement): Anchor[] {
  const tops = editorLineTops(ed);
  const origin = pv.getBoundingClientRect().top + pv.clientTop - pv.scrollTop;
  const anchors: Anchor[] = [[0, 0]];
  pv.querySelectorAll<HTMLElement>(".md-line-marker").forEach((marker) => {
    const block = marker.nextElementSibling;
    const top = tops[Number(marker.dataset.line) - 1];
    if (block && top !== undefined) anchors.push([top, block.getBoundingClientRect().top - origin]);
  });
  anchors.push([ed.scrollHeight, pv.scrollHeight]);
  // 양쪽 모두 아래로만 진행하는 앵커만 남겨야 보간이 뒤집히지 않는다.
  const kept: Anchor[] = [];
  for (const a of anchors) {
    const last = kept[kept.length - 1];
    if (!last || (a[0] >= last[0] && a[1] >= last[1])) kept.push(a);
  }
  return kept;
}

function interpolate(anchors: Anchor[], y: number): number {
  for (let i = 1; i < anchors.length; i++) {
    const [x0, y0] = anchors[i - 1], [x1, y1] = anchors[i];
    if (y <= x1) return x1 === x0 ? y0 : y0 + ((y - x0) / (x1 - x0)) * (y1 - y0);
  }
  return anchors[anchors.length - 1][1];
}

// 기준선은 스크롤 비율만큼 화면 위에서 아래로 내려간다. 맨 위에선 위끼리, 맨 아래에선 끝끼리 맞는다.
export function syncPreviewScroll(ed: HTMLTextAreaElement, pv: HTMLElement, anchors: Anchor[]) {
  const max = ed.scrollHeight - ed.clientHeight;
  const frac = max > 0 ? ed.scrollTop / max : 0;
  const probe = ed.scrollTop + ed.clientHeight * frac;
  pv.scrollTop = interpolate(anchors, probe) - pv.clientHeight * frac;
}
