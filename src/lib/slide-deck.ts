/**
 * remark-slides 가 만든 .slide-deck 에 넘기기 동작을 붙인다. 붙인 것을 떼는 함수를 돌려준다.
 *
 * 본문 HTML 은 첫 렌더 뒤에 통째로 다시 들어가는 일이 있어(요소가 새로 생긴다), 덱 요소에 직접 붙이지 않고
 * 본문 루트에 위임한다. 이벤트가 생긴 순간 그 덱을 찾아 처리하므로 내용이 몇 번 바뀌어도 동작한다.
 * 가로 스크롤(scroll-snap) 위에서 동작하므로 스크립트가 없어도 터치 스와이프는 된다.
 */
export function wireSlideDecks(root: HTMLElement): () => void {
  const parts = (deck: Element) => ({
    track: deck.querySelector<HTMLElement>(".slide-track"),
    counter: deck.querySelector<HTMLElement>(".slide-counter"),
    prev: deck.querySelector<HTMLButtonElement>(".slide-prev"),
    next: deck.querySelector<HTMLButtonElement>(".slide-next"),
  });

  const current = (track: HTMLElement) => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));

  const update = (deck: Element) => {
    const { track, counter, prev, next } = parts(deck);
    if (!track) return;
    const total = track.children.length;
    const i = current(track);
    if (counter) counter.textContent = `${i + 1} / ${total}`;
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i >= total - 1;
  };

  const go = (deck: Element, step: number) => {
    const { track } = parts(deck);
    if (!track) return;
    const target = Math.min(track.children.length - 1, Math.max(0, current(track) + step));
    track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
  };

  const onClick = (event: MouseEvent) => {
    const button = (event.target as Element).closest?.(".slide-prev, .slide-next");
    const deck = button?.closest(".slide-deck");
    if (!button || !deck) return;
    go(deck, button.classList.contains("slide-prev") ? -1 : 1);
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const deck = (event.target as Element).closest?.(".slide-deck");
    if (!deck) return;
    event.preventDefault();
    go(deck, event.key === "ArrowLeft" ? -1 : 1);
  };

  // scroll 은 거품이 일지 않으므로 캡처 단계에서 받는다.
  let frame = 0;
  const onScroll = (event: Event) => {
    const track = event.target as Element;
    if (!track.classList?.contains("slide-track")) return;
    const deck = track.closest(".slide-deck");
    if (!deck) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => update(deck));
  };

  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKey);
  root.addEventListener("scroll", onScroll, { capture: true, passive: true });

  return () => {
    cancelAnimationFrame(frame);
    root.removeEventListener("click", onClick);
    root.removeEventListener("keydown", onKey);
    root.removeEventListener("scroll", onScroll, { capture: true });
  };
}
