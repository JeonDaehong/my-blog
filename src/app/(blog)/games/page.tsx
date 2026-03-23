"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useI18n } from "@/lib/i18n";

const GRID = 20;
const CELL = 16;
const SPEED = 120;

type Pos = { x: number; y: number };
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";

function randomFood(snake: Pos[]): Pos {
  let pos: Pos;
  do {
    pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

function SnakeGame({ isKo }: { isKo: boolean }) {
  const [snake, setSnake] = useState<Pos[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Pos>({ x: 15, y: 10 });
  const [dir, setDir] = useState<Dir>("RIGHT");
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const dirRef = useRef<Dir>("RIGHT");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("snake-best");
    if (saved) setBest(Number(saved));
  }, []);

  const reset = useCallback(() => {
    const initial = [{ x: 10, y: 10 }];
    setSnake(initial);
    setFood(randomFood(initial));
    setDir("RIGHT");
    dirRef.current = "RIGHT";
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }, []);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
        w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
      };
      const newDir = map[e.key];
      if (!newDir) return;
      e.preventDefault();
      const opposites: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
      if (opposites[newDir] !== dirRef.current) {
        dirRef.current = newDir;
        setDir(newDir);
      }
      if (!running && !gameOver) reset();
    },
    [running, gameOver, reset]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        const d = dirRef.current;
        if (d === "UP") head.y--;
        if (d === "DOWN") head.y++;
        if (d === "LEFT") head.x--;
        if (d === "RIGHT") head.x++;

        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || prev.some((s) => s.x === head.x && s.y === head.y)) {
          setRunning(false);
          setGameOver(true);
          setScore((s) => {
            if (s > best) {
              setBest(s);
              localStorage.setItem("snake-best", String(s));
            }
            return s;
          });
          return prev;
        }

        const newSnake = [head, ...prev];
        setFood((f) => {
          if (head.x === f.x && head.y === f.y) {
            setScore((s) => s + 1);
            const next = randomFood(newSnake);
            setTimeout(() => setFood(next), 0);
            return f;
          }
          newSnake.pop();
          return f;
        });
        return newSnake;
      });
    }, SPEED);
    return () => clearInterval(interval);
  }, [running, best]);

  // Draw
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const size = GRID * CELL;
    ctx.clearRect(0, 0, size, size);

    // Grid
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg-secondary").trim() || "#141414";
    ctx.fillRect(0, 0, size, size);

    // Food
    ctx.fillStyle = "#e87040";
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "#e87040" : "#f0905a";
      ctx.beginPath();
      ctx.roundRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 3);
      ctx.fill();
    });
  }, [snake, food]);

  const size = GRID * CELL;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-3" style={{ maxWidth: size }}>
        <span className="text-[13px] text-text-secondary font-mono">
          Score: <span className="text-accent font-bold">{score}</span>
        </span>
        <span className="text-[12px] text-text-tertiary font-mono">
          Best: {best}
        </span>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-border-color">
        <canvas ref={canvasRef} width={size} height={size} />
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            {gameOver ? (
              <>
                <p className="text-accent font-bold text-lg mb-1">Game Over</p>
                <p className="text-text-tertiary text-[13px] mb-4">Score: {score}</p>
              </>
            ) : (
              <p className="text-text-secondary text-[13px] mb-4">
                {isKo ? "화살표 키 또는 WASD" : "Arrow keys or WASD"}
              </p>
            )}
            <button
              onClick={reset}
              className="px-5 py-2 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors"
            >
              {gameOver ? (isKo ? "다시하기" : "Retry") : (isKo ? "시작" : "Start")}
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mt-4 grid grid-cols-3 gap-1.5 sm:hidden" style={{ width: 140 }}>
        <div />
        <button onClick={() => { dirRef.current = "UP"; setDir("UP"); if (!running && !gameOver) reset(); }}
          className="h-10 rounded-md bg-bg-secondary border border-border-color text-text-secondary text-lg flex items-center justify-center active:bg-bg-hover">↑</button>
        <div />
        <button onClick={() => { dirRef.current = "LEFT"; setDir("LEFT"); if (!running && !gameOver) reset(); }}
          className="h-10 rounded-md bg-bg-secondary border border-border-color text-text-secondary text-lg flex items-center justify-center active:bg-bg-hover">←</button>
        <button onClick={() => { dirRef.current = "DOWN"; setDir("DOWN"); if (!running && !gameOver) reset(); }}
          className="h-10 rounded-md bg-bg-secondary border border-border-color text-text-secondary text-lg flex items-center justify-center active:bg-bg-hover">↓</button>
        <button onClick={() => { dirRef.current = "RIGHT"; setDir("RIGHT"); if (!running && !gameOver) reset(); }}
          className="h-10 rounded-md bg-bg-secondary border border-border-color text-text-secondary text-lg flex items-center justify-center active:bg-bg-hover">→</button>
      </div>
    </div>
  );
}

export default function GamesPage() {
  const { locale } = useI18n();
  const isKo = locale === "ko";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        {isKo ? "웹게임" : "Games"}
      </h1>
      <p className="text-sm text-text-tertiary mb-8">
        {isKo ? "잠깐 쉬어가세요 🎮" : "Take a break 🎮"}
      </p>

      <div className="p-4 sm:p-6 rounded-xl border border-border-color bg-bg-secondary">
        <h2 className="text-base font-bold text-text-primary mb-1">🐍 Snake</h2>
        <p className="text-[12px] text-text-tertiary mb-4">
          {isKo ? "뱀을 조종해서 먹이를 먹으세요!" : "Control the snake to eat food!"}
        </p>
        <SnakeGame isKo={isKo} />
      </div>
    </div>
  );
}
