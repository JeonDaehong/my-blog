"use client";

import { useEffect, useRef, useCallback } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animRef = useRef<number>(0);
  const hovering = useRef(false);
  const visible = useRef(false);

  const setup = useCallback(() => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      // dot은 즉시 따라감
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      if (!visible.current) {
        visible.current = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
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
        dot.style.transform = `translate(-50%, -50%) scale(${isClickable ? 0.5 : 1})`;
        ring.style.transform = `translate(-50%, -50%) scale(${isClickable ? 1.5 : 1})`;
        ring.style.borderColor = isClickable
          ? "rgba(232, 112, 64, 0.5)"
          : "rgba(232, 112, 64, 0.2)";
      }
    };

    const handleMouseLeave = () => {
      visible.current = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      visible.current = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    // ring은 lerp로 부드럽게 따라옴
    const animate = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;
      ring.style.left = `${ringPos.current.x}px`;
      ring.style.top = `${ringPos.current.y}px`;
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  useEffect(() => {
    return setup();
  }, [setup]);

  return (
    <>
      {/* 외곽 링 — lerp로 부드럽게 따라옴 */}
      <div
        ref={ringRef}
        className="custom-cursor-el fixed z-[9999] pointer-events-none rounded-full"
        style={{
          width: 32,
          height: 32,
          border: "1.5px solid rgba(232, 112, 64, 0.2)",
          transform: "translate(-50%, -50%) scale(1)",
          transition: "transform 0.2s ease-out, border-color 0.2s, opacity 0.15s",
          left: -100,
          top: -100,
          opacity: 0,
        }}
      />
      {/* 중심 dot — 즉시 따라감 */}
      <div
        ref={dotRef}
        className="custom-cursor-el fixed z-[9999] pointer-events-none rounded-full"
        style={{
          width: 6,
          height: 6,
          background: "rgba(232, 112, 64, 0.9)",
          boxShadow: "0 0 8px rgba(232, 112, 64, 0.4)",
          transform: "translate(-50%, -50%) scale(1)",
          transition: "transform 0.15s ease-out, opacity 0.15s",
          left: -100,
          top: -100,
          opacity: 0,
        }}
      />
    </>
  );
}
