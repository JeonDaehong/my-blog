/**
 * remark-slides 가 만든 .slide-deck 에 넘기기 동작을 붙인다. 붙인 것을 떼는 함수를 돌려준다.
 * 가로 스크롤(scroll-snap) 위에서 동작하므로 버튼이 없어도 터치 스와이프는 된다.
 */
export function wireSlideDecks(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  root.querySelectorAll<HTMLElement>(".slide-deck").forEach((deck) => {
    const track = deck.querySelector<HTMLElement>(".slide-track");
    const counter = deck.querySelector<HTMLElement>(".slide-counter");
    const prev = deck.querySelector<HTMLButtonElement>(".slide-prev");
    const next = deck.querySelector<HTMLButtonElement>(".slide-next");
    if (!track) return;
    const total = track.children.length;

    const current = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    const go = (index: number) => {
      const target = Math.min(total - 1, Math.max(0, index));
      track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
    };
    const update = () => {
      const i = current();
      if (counter) counter.textContent = `${i + 1} / ${total}`;
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= total - 1;
    };

    const onPrev = () => go(current() - 1);
    const onNext = () => go(current() + 1);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); onPrev(); }
      if (event.key === "ArrowRight") { event.preventDefault(); onNext(); }
    };
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);
    deck.addEventListener("keydown", onKey);
    track.addEventListener("scroll", onScroll, { passive: true });
    update();

    cleanups.push(() => {
      cancelAnimationFrame(frame);
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      deck.removeEventListener("keydown", onKey);
      track.removeEventListener("scroll", onScroll);
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
