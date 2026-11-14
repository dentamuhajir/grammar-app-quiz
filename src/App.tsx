import { useState } from "react";
import { PRACTICE_LABELS } from "./grammar/labels";
import { ArticlePractice } from "./ui/ArticlePractice";
import { BottomSheet } from "./ui/BottomSheet";
import { QAPractice } from "./ui/QAPractice";
import { BasicsPractice } from "./ui/BasicsPractice";
import { SentencePractice } from "./ui/SentencePractice";
import { StoryChallengePractice } from "./ui/StoryChallengePractice";
import { InstallPrompt } from "./ui/InstallPrompt";

type PracticeMode = keyof typeof PRACTICE_LABELS;
type ExtraPracticeMode = "articles" | "story" | "qa";

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
  if (mode === "articles") {
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
        <rect x="4" y="4" width="20" height="20" rx="4" fill="#fde48c" />
        <path d="M8.5 9.5H19.5" />
        <path d="M8.5 14H19.5" />
        <path d="M8.5 18.5H14.5" />
        <circle cx="19" cy="18.5" r="2.2" fill="#5ad494" />
      </svg>
    );
  }
  if (mode === "story") {
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
        <rect x="4" y="3.5" width="20" height="21" rx="4" fill="#c084fc" />
        <rect x="7.5" y="7" width="13" height="14" rx="2" fill="#ffffff" />
        <path d="M10.5 11L12 12.5L15 9.5" stroke="#16a34a" strokeWidth="2.2" />
        <path d="M10.5 16H17.5" />
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

const EXTRA_MODES: Array<{
  mode: ExtraPracticeMode;
  description: string;
}> = [
  {
    mode: "articles",
    description:
      "Bedah tenses, passive, modal, dan cari kesalahan grammar di dalam artikel nyata.",
  },
  {
    mode: "story",
    description:
      "Rangkai cerita bebas sesuai topik & checklist misi grammar dengan bedah paragraf warna-warni.",
  },
  {
    mode: "qa",
    description:
      "Latihan merespons pertanyaan percakapan (Yes/No & WH-Questions).",
  },
];

export default function App() {
  const [practice, setPractice] = useState<PracticeMode>("sentences");
  const [extraMode, setExtraMode] = useState<ExtraPracticeMode>("articles");
  const [extraOpen, setExtraOpen] = useState(false);

  const isExtraActive =
    practice === "articles" || practice === "story" || practice === "qa";

  function handleExtraNavClick() {
    if (isExtraActive) {
      setExtraOpen(true);
    } else {
      setPractice(extraMode);
    }
  }

  function selectExtraMode(mode: ExtraPracticeMode) {
    setExtraMode(mode);
    setPractice(mode);
    setExtraOpen(false);
  }

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
      ) : practice === "articles" ? (
        <ArticlePractice />
      ) : practice === "story" ? (
        <StoryChallengePractice />
      ) : (
        <QAPractice />
      )}

      <InstallPrompt />

      <nav className="bottom-nav" aria-label="Mode latihan">
        <div className="bottom-nav-inner">
          {(["sentences", "basics"] as const).map((mode) => (
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
          <button
            type="button"
            className="bottom-nav-item"
            aria-pressed={isExtraActive}
            aria-haspopup="dialog"
            onClick={handleExtraNavClick}
          >
            <ModeIcon mode={extraMode} />
            <span className="bottom-nav-label-switch">
              {PRACTICE_LABELS[extraMode]} ▾
            </span>
          </button>
        </div>
      </nav>

      <BottomSheet
        open={extraOpen}
        onClose={() => setExtraOpen(false)}
        title="Pilih Mode Latihan"
      >
        <div className="extra-mode-list">
          {EXTRA_MODES.map((item) => {
            const active = practice === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                className={`extra-mode-card ${active ? "active" : ""}`}
                onClick={() => selectExtraMode(item.mode)}
              >
                <span className="extra-mode-icon">
                  <ModeIcon mode={item.mode} />
                </span>
                <span className="extra-mode-info">
                  <strong>{PRACTICE_LABELS[item.mode]}</strong>
                  <span>{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
