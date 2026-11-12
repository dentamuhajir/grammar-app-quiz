import { useState } from "react";
import { PRACTICE_LABELS } from "./grammar/labels";
import { QAPractice } from "./ui/QAPractice";
import { BasicsPractice } from "./ui/BasicsPractice";
import { SentencePractice } from "./ui/SentencePractice";
import { InstallPrompt } from "./ui/InstallPrompt";

type PracticeMode = keyof typeof PRACTICE_LABELS;

function ModeIcon({ mode }: { mode: PracticeMode }) {
  if (mode === "sentences") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    );
  }
  if (mode === "basics") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function App() {
  const [practice, setPractice] = useState<PracticeMode>("sentences");
  return (
    <div className="page">
      <header className="header">
        <h1 className="brand">
          Grammar <span className="brand-accent">Drill</span>
        </h1>
      </header>

      {practice === "sentences" ? (
        <SentencePractice />
      ) : practice === "basics" ? (
        <BasicsPractice />
      ) : (
        <QAPractice />
      )}

      <InstallPrompt />

      <nav className="bottom-nav" aria-label="Mode latihan">
        <div className="bottom-nav-inner">
          {(Object.keys(PRACTICE_LABELS) as PracticeMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className="bottom-nav-item"
              aria-pressed={practice === mode}
              onClick={() => setPractice(mode)}
            >
              <ModeIcon mode={mode} />
              <span>{PRACTICE_LABELS[mode]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
