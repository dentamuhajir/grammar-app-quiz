import { useEffect, useRef, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  closeButtonOnly?: boolean;
  title: string;
  children: ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  closeButtonOnly = false,
  title,
  children,
}: BottomSheetProps) {
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!open || closeButtonOnly) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, closeButtonOnly]);

  if (!open) return null;

  return (
    <div
      className="sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (!closeButtonOnly && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="sheet-panel"
        onTouchStart={closeButtonOnly ? undefined : (e) => {
          startY.current = e.touches[0].clientY;
        }}
        onTouchEnd={closeButtonOnly ? undefined : (e) => {
          if (startY.current === null) return;
          const deltaY = e.changedTouches[0].clientY - startY.current;
          startY.current = null;
          if (deltaY > 70) onClose();
        }}
      >
        {!closeButtonOnly && (
          <div className="sheet-handle-wrap" aria-hidden="true">
            <span className="sheet-handle" />
          </div>
        )}
        <div className="sheet-header">
          <h2 className="sheet-title">{title}</h2>
          <button
            type="button"
            className="sheet-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
