import { useRef, useState, type MouseEvent, type TouchEvent } from "react";

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, button, a, label, .sheet-backdrop",
    ),
  );
}

interface SwipeCardHandlers {
  onSwipeLeft: () => void;
  onSwipeRight?: () => void;
}

export function useSwipeCard({ onSwipeLeft, onSwipeRight }: SwipeCardHandlers) {
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);

  function start(x: number, y: number, target: EventTarget | null) {
    if (isInteractiveTarget(target)) {
      startPos.current = null;
      return;
    }
    startPos.current = { x, y };
  }

  function move(x: number, y: number) {
    if (!startPos.current) return;
    const dx = x - startPos.current.x;
    const dy = y - startPos.current.y;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) {
      setDragX(Math.max(dx, -110));
    } else if (dx > 0 && onSwipeRight) {
      setDragX(Math.min(dx, 110));
    }
  }

  function end(x: number, y: number) {
    if (!startPos.current) return;
    const dx = x - startPos.current.x;
    const dy = y - startPos.current.y;
    startPos.current = null;
    setDragX(0);

    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) {
        setAnimating(true);
        onSwipeLeft();
        window.setTimeout(() => setAnimating(false), 240);
      } else if (dx > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
  }

  function onTouchStart(e: TouchEvent<HTMLElement>) {
    const t = e.touches[0];
    start(t.clientX, t.clientY, e.target);
  }

  function onTouchMove(e: TouchEvent<HTMLElement>) {
    const t = e.touches[0];
    move(t.clientX, t.clientY);
  }

  function onTouchEnd(e: TouchEvent<HTMLElement>) {
    const t = e.changedTouches[0];
    end(t.clientX, t.clientY);
  }

  function onMouseDown(e: MouseEvent<HTMLElement>) {
    if (e.button !== 0) return;
    start(e.clientX, e.clientY, e.target);
  }

  function onMouseMove(e: MouseEvent<HTMLElement>) {
    if (!startPos.current) return;
    move(e.clientX, e.clientY);
  }

  function onMouseUp(e: MouseEvent<HTMLElement>) {
    end(e.clientX, e.clientY);
  }

  function onMouseLeave() {
    if (!startPos.current) return;
    startPos.current = null;
    setDragX(0);
  }

  const cardStyle =
    dragX !== 0
      ? {
          transform: `translateX(${dragX * 0.45}px) rotate(${dragX * 0.02}deg)`,
          transition: "none",
        }
      : undefined;

  const cardClass = animating ? "card-slide-in" : "";

  return {
    swipeHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    },
    cardStyle,
    cardClass,
  };
}
