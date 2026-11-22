import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type TouchEvent } from "react";

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest(
    "input, textarea, select, button, a, label, summary, [contenteditable=true], .sheet-backdrop, .qa-composer",
  ));
}

interface SwipeCardHandlers {
  onSwipeLeft: () => void;
  onSwipeRight?: () => void;
  animated?: boolean;
  canSkip?: boolean;
  questionKey?: string;
}

type Phase = "idle" | "dragging" | "leaving" | "entering" | "opening";

export function useSwipeCard({ onSwipeLeft, onSwipeRight, animated = false, canSkip = true, questionKey = "" }: SwipeCardHandlers) {
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const busy = useRef(false);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const callbacks = useRef({onSwipeLeft, onSwipeRight, canSkip, questionKey});
  callbacks.current = {onSwipeLeft, onSwipeRight, canSkip, questionKey};
  const [dragX, setDragX] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const threshold = animated ? 76 : 65;
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function later(callback: () => void, delay: number) {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }

  function reset() {
    startPos.current = null;
    setDragX(0);
    setDirection(null);
    setPhase("idle");
    busy.current = false;
  }

  function start(x: number, y: number, target: EventTarget | null) {
    if (busy.current || isInteractiveTarget(target)) {
      startPos.current = null;
      return;
    }
    startPos.current = {x, y};
  }

  function move(x: number, y: number) {
    if (!startPos.current) return;
    const dx = x - startPos.current.x;
    const dy = y - startPos.current.y;
    if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
      reset();
      return;
    }
    if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx > 0 && !onSwipeRight) return;
    setDirection(dx < 0 ? "left" : "right");
    setDragX(Math.max(-155, Math.min(155, dx)));
    setPhase("dragging");
  }

  function end(x: number, y: number) {
    if (!startPos.current) return;
    const dx = x - startPos.current.x;
    const dy = y - startPos.current.y;
    startPos.current = null;
    const left = dx < 0;
    if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy) * 1.4
        || left && !callbacks.current.canSkip || !left && !callbacks.current.onSwipeRight) {
      reset();
      return;
    }
    busy.current = true;
    setDragX(0);
    setDirection(left ? "left" : "right");
    if (reducedMotion()) {
      if (left) callbacks.current.onSwipeLeft();
      else callbacks.current.onSwipeRight?.();
      reset();
      return;
    }
    if (!animated) {
      if (left) {
        callbacks.current.onSwipeLeft();
        setPhase("entering");
        later(reset, 240);
      } else {
        callbacks.current.onSwipeRight?.();
        reset();
      }
      return;
    }
    setPhase(left ? "leaving" : "opening");
    later(() => {
      if (callbacks.current.questionKey !== questionKey) return reset();
      if (left) {
        if (!callbacks.current.canSkip) return reset();
        callbacks.current.onSwipeLeft();
        setPhase("entering");
        setDirection(null);
        later(reset, 360);
      } else {
        callbacks.current.onSwipeRight?.();
        reset();
      }
    }, 180);
  }

  function onTouchStart(e: TouchEvent<HTMLElement>) {
    start(e.touches[0].clientX, e.touches[0].clientY, e.target);
  }
  function onTouchMove(e: TouchEvent<HTMLElement>) {
    move(e.touches[0].clientX, e.touches[0].clientY);
  }
  function onTouchEnd(e: TouchEvent<HTMLElement>) {
    end(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  }
  function onMouseDown(e: MouseEvent<HTMLElement>) {
    if (e.button === 0) start(e.clientX, e.clientY, e.target);
  }
  function onMouseMove(e: MouseEvent<HTMLElement>) {
    move(e.clientX, e.clientY);
  }
  function onMouseUp(e: MouseEvent<HTMLElement>) {
    end(e.clientX, e.clientY);
  }
  function onMouseLeave() {
    if (startPos.current) reset();
  }

  const blocked = direction === "left" && !canSkip;
  const progress = phase === "dragging" ? Math.min(Math.abs(dragX) / threshold, 1) : 1;
  const cardStyle: CSSProperties | undefined = phase === "dragging" && !reducedMotion() ? {
    transform: `translateX(${dragX * (blocked ? 0.12 : 0.55)}px) rotate(${dragX * (blocked ? 0 : 0.018)}deg) scale(${1 - progress * 0.018})`,
    transition: "none",
  } : undefined;
  const classes: Record<Phase, string> = {
    idle: "", dragging: "", leaving: "swipe-card-leaving",
    entering: animated ? "swipe-card-entering" : "card-slide-in", opening: "swipe-card-opening",
  };

  return {
    swipeHandlers: {
      onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: reset,
      onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
    },
    cardStyle,
    cardClass: classes[phase],
    swipeDirection: direction,
    swipeProgress: progress,
    swipeBlocked: blocked,
  };
}
