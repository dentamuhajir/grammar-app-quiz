import { useEffect, useState } from "react";

/**
 * Lightweight dependency-free confetti burst. Renders a fixed number of
 * colored pieces with randomized trajectories, then unmounts itself.
 */
const COLORS = ["#4f46e5", "#0ea5e9", "#16a34a", "#f59e0b", "#ec4899", "#8b5cf6"];

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
  drift: number;
}

export function Confetti({ fire }: { fire: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (fire === 0) return;
    const next: Piece[] = Array.from({ length: 80 }, (_, i) => ({
      id: fire * 1000 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 1.1 + Math.random() * 0.9,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 160,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 2200);
    return () => clearTimeout(t);
  }, [fire]);

  if (!pieces.length) return null;

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              // custom props consumed by the CSS keyframes
              ["--rot" as string]: `${p.rotate}deg`,
              ["--drift" as string]: `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
