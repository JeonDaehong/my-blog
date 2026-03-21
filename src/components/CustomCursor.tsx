"use client";

import { useEffect, useRef, useState } from "react";

interface TrailDot {
  x: number;
  y: number;
  opacity: number;
}

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const trailRef = useRef<TrailDot[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    // Hide on touch devices
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      trailRef.current.push({ x: e.clientX, y: e.clientY, opacity: 1 });
      if (trailRef.current.length > 25) {
        trailRef.current.shift();
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.closest("a, button, [role='button'], input, textarea, select, label[for]") !== null ||
        window.getComputedStyle(target).cursor === "pointer";
      setIsHovering(isClickable);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    // Canvas animation for trail
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener("resize", resize);

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fade trail dots
        trailRef.current = trailRef.current
          .map((dot) => ({ ...dot, opacity: dot.opacity - 0.04 }))
          .filter((dot) => dot.opacity > 0);

        // Draw trail
        trailRef.current.forEach((dot, i) => {
          const size = (dot.opacity * 4) + 1;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 112, 64, ${dot.opacity * 0.6})`;
          ctx.fill();
        });

        animRef.current = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseover", handleMouseOver);
        document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
        document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animRef.current);
      };
    }
  }, []);

  if (!visible) return <canvas ref={canvasRef} className="fixed inset-0 z-[9999] pointer-events-none" />;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[9999] pointer-events-none"
      />
      {/* Main cursor dot */}
      <div
        className="fixed z-[9999] pointer-events-none transition-transform duration-100"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-50%, -50%) scale(${isHovering ? 2.2 : 1})`,
        }}
      >
        <div
          className="rounded-full transition-all duration-200"
          style={{
            width: isHovering ? 14 : 8,
            height: isHovering ? 14 : 8,
            background: isHovering
              ? "rgba(232, 112, 64, 0.3)"
              : "rgba(232, 112, 64, 0.9)",
            border: isHovering ? "2px solid rgba(232, 112, 64, 0.8)" : "none",
            boxShadow: "0 0 12px rgba(232, 112, 64, 0.4)",
          }}
        />
      </div>
    </>
  );
}
