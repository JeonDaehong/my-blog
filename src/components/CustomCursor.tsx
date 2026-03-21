"use client";

import { useEffect, useRef, useCallback } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mousePos = useRef({ x: -100, y: -100 });
  const trailPos = useRef({ x: -100, y: -100 });
  const hovering = useRef(false);

  const setup = useCallback(() => {
    // 터치 기기 무시
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const dot = dotRef.current;
    const canvas = canvasRef.current;
    if (!dot || !canvas) return;

    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.closest(
          "a, button, [role='button'], input, textarea, select, label[for]"
        ) !== null ||
        window.getComputedStyle(target).cursor === "pointer";
      if (hovering.current !== isClickable) {
        hovering.current = isClickable;
        dot.style.width = isClickable ? "14px" : "8px";
        dot.style.height = isClickable ? "14px" : "8px";
        dot.style.background = isClickable
          ? "rgba(232, 112, 64, 0.3)"
          : "rgba(232, 112, 64, 0.9)";
        dot.style.border = isClickable
          ? "2px solid rgba(232, 112, 64, 0.8)"
          : "none";
        dot.style.transform = `scale(${isClickable ? 2.2 : 1})`;
      }
    };

    const handleMouseLeave = () => {
      dot.style.opacity = "0";
    };
    const handleMouseEnter = () => {
      dot.style.opacity = "1";
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("resize", resize, { passive: true });

    // 부드러운 추적 + 트레일을 하나의 rAF 루프로
    const lerp = 0.35;

    const animate = () => {
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      // 커서 dot 위치 (lerp로 부드럽게)
      trailPos.current.x += (mx - trailPos.current.x) * lerp;
      trailPos.current.y += (my - trailPos.current.y) * lerp;

      dot.style.left = `${trailPos.current.x}px`;
      dot.style.top = `${trailPos.current.y}px`;

      // 트레일 — 간단한 원 하나만 (잔상 대신 부드러운 추적)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 마우스 실제 위치와 트레일 위치 사이에 연결선
      const dx = mx - trailPos.current.x;
      const dy = my - trailPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 2) {
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(trailPos.current.x, trailPos.current.y);
        ctx.strokeStyle = `rgba(232, 112, 64, ${Math.min(dist * 0.008, 0.3)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
      document.documentElement.removeEventListener(
        "mouseenter",
        handleMouseEnter
      );
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  useEffect(() => {
    return setup();
  }, [setup]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[9999] pointer-events-none"
      />
      <div
        ref={dotRef}
        className="fixed z-[9999] pointer-events-none rounded-full"
        style={{
          width: 8,
          height: 8,
          background: "rgba(232, 112, 64, 0.9)",
          boxShadow: "0 0 12px rgba(232, 112, 64, 0.4)",
          transform: "scale(1)",
          transition: "width 0.2s, height 0.2s, background 0.2s, border 0.2s, transform 0.2s, opacity 0.15s",
          marginLeft: -4,
          marginTop: -4,
          left: -100,
          top: -100,
        }}
      />
    </>
  );
}
