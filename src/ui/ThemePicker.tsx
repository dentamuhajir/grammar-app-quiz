import { useEffect, useRef, useState } from "react";
import { applyTheme, loadTheme, saveTheme, THEME_STORAGE_KEY, type ThemePreference } from "./theme";

const OPTIONS: Array<{value: ThemePreference; label: string; icon: string}> = [
  {value: "system", label: "Ikuti perangkat", icon: "◐"},
  {value: "light", label: "Terang", icon: "☀"},
  {value: "dark", label: "Gelap", icon: "☾"},
];

export function ThemePicker() {
  const [preference, setPreference] = useState(loadTheme);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    applyTheme(preference);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const refresh = () => applyTheme(preference);
    media.addEventListener("change", refresh);
    return () => media.removeEventListener("change", refresh);
  }, [preference]);

  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) setPreference(loadTheme());
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return <div className="theme-picker" ref={rootRef}>
    <button type="button" ref={buttonRef} className="theme-toggle" aria-label="Tema tampilan"
      aria-expanded={open} aria-controls="theme-options" onClick={() => setOpen(value => !value)}
      title="Tema tampilan">
      <span aria-hidden="true">{OPTIONS.find(option => option.value === preference)!.icon}</span>
    </button>
    {open && <div className="theme-options" id="theme-options" role="group" aria-label="Pilihan tema">
      {OPTIONS.map(option => <button key={option.value} type="button"
        aria-pressed={preference === option.value} onClick={() => {
          applyTheme(option.value);
          saveTheme(option.value);
          setPreference(option.value);
          setOpen(false);
          buttonRef.current?.focus();
        }}>
        <span aria-hidden="true">{option.icon}</span>{option.label}
        {preference === option.value && <span className="theme-selected" aria-hidden="true">✓</span>}
      </button>)}
    </div>}
  </div>;
}
