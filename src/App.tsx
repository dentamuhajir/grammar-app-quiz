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
        width="26"
        height="26"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        {/* Pencil body */}
        <path
          d="M18.5 4.5L23.5 9.5L10.5 22.5L4.5 23.5L5.5 17.5L18.5 4.5Z"
          fill="#f97316"
          stroke="#141414"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Pencil tip wood */}
        <path
          d="M5.5 17.5L10.5 22.5L4.5 23.5L5.5 17.5Z"
          fill="#fde68a"
          stroke="#141414"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Pencil top cap */}
        <path
          d="M16 7L21 12"
          stroke="#141414"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Bottom baseline */}
        <path
          d="M11 24H23"
          stroke="#141414"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (mode === "basics") {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#141414"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" fill="#c084fc" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" fill="#5ad494" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" fill="#fde047" />
        <rect
          x="13.5"
          y="13.5"
          width="7.5"
          height="7.5"
          rx="1.8"
          fill="#fb85c6"
        />
      </svg>
    );
  }
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 28 28"
      fill="none"
      stroke="#141414"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Back speech bubble */}
      <path
        d="M12 11h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1v3l-3.5-3H14a2 2 0 0 1-2-2v-9Z"
        fill="#5ad494"
      />
      {/* Front speech bubble */}
      <path
        d="M5 5h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        fill="#fde48c"
      />
      <circle cx="8" cy="11" r="1.15" fill="#141414" stroke="none" />
      <circle cx="11" cy="11" r="1.15" fill="#141414" stroke="none" />
      <circle cx="14" cy="11" r="1.15" fill="#141414" stroke="none" />
    </svg>
  );
}

export default function App() {
  const [practice, setPractice] = useState<PracticeMode>("sentences");
  return (
    <div className="page">
      <header className="header">
        <h1 className="brand">
          Grammar{" "}
          <span className="brand-accent">
            Dr<span className="brand-i">i</span>ll
          </span>
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
