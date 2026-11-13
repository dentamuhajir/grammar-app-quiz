import { useEffect, useMemo, useRef, useState } from "react";

interface WordToken {
  word: string;
  space: string;
  start: number;
  end: number;
}

function tokenizeSentence(text: string): WordToken[] {
  const tokens: WordToken[] = [];
  const regex = /(\S+)(\s*)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const word = match[1];
    const space = match[2];
    const start = match.index;
    const end = start + word.length;
    tokens.push({ word, space, start, end });
  }
  return tokens;
}

function pickEnglishVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  const enVoices = voices.filter((v) => /^en(-|_|$)/i.test(v.lang));
  if (enVoices.length === 0) return null;

  const preferred =
    enVoices.find(
      (v) =>
        /en[-_]US/i.test(v.lang) &&
        /(Google|Natural|Samantha|Aria|Jenny|Guy|Siri)/i.test(v.name),
    ) ??
    enVoices.find((v) => /en[-_]US/i.test(v.lang) && v.localService) ??
    enVoices.find((v) => /en[-_]US/i.test(v.lang)) ??
    enVoices.find((v) => /en[-_]GB/i.test(v.lang)) ??
    enVoices[0];

  return preferred ?? null;
}

function SpeakerWaveIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`speech-btn-icon ${active ? "speaking" : ""}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Speaker cone */}
      <path
        d="M11 5L6 9H3C2.45 9 2 9.45 2 10V14C2 14.55 2.45 15 3 15H6L11 19V5Z"
        fill="#fde047"
        stroke="#141414"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      {/* Sound waves */}
      <path
        className="wave-inner"
        d="M15.2 8.8C16.3 9.9 16.3 14.1 15.2 15.2"
        stroke="#141414"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        className="wave-outer"
        d="M18.5 5.8C21.2 8.5 21.2 15.5 18.5 18.2"
        stroke="#141414"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SlowTurtleIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`speech-btn-icon ${active ? "speaking" : ""}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Turtle head & legs */}
      <circle
        cx="20"
        cy="13.5"
        r="2.3"
        fill="#86efac"
        stroke="#141414"
        strokeWidth="1.9"
      />
      <path
        d="M6 16.5L4.8 19M15 16.5L16.2 19"
        stroke="#141414"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Turtle shell */}
      <path
        d="M3.5 15.5C3.5 10.2 7 7 11.2 7C15.4 7 18 10.2 18 15.5H3.5Z"
        fill="#4ade80"
        stroke="#141414"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Shell pattern */}
      <path
        d="M7.5 15.5L9.2 11.2H13.2L14.8 15.5"
        fill="#fde047"
        stroke="#141414"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SpokenSentence({ text }: { text: string }) {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const tokens = useMemo(() => tokenizeSentence(text), [text]);
  const [activeMode, setActiveMode] = useState<"normal" | "slow" | null>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  function clearFallbackTimers() {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }

  useEffect(() => {
    if (!supported) return;
    // Trigger initial voice list loading in browsers like Chrome
    window.speechSynthesis.getVoices();
    const onVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener?.("voiceschanged", onVoicesChanged);
    return () => {
      clearFallbackTimers();
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener?.(
        "voiceschanged",
        onVoicesChanged,
      );
    };
  }, [supported, text]);

  function speak(mode: "normal" | "slow") {
    if (!supported) return;
    const synth = window.speechSynthesis;

    clearFallbackTimers();
    synth.cancel();

    // Clicking the same active button stops playback
    if (activeMode === mode) {
      setActiveMode(null);
      setActiveWordIndex(null);
      return;
    }

    const rate = mode === "slow" ? 0.62 : 0.94;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.pitch = 1;

    const voice = pickEnglishVoice(synth.getVoices());
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    let hasNativeBoundary = false;

    utterance.onstart = () => {
      setActiveMode(mode);
      setActiveWordIndex(0);

      // Fallback word progression for mobile voices that don't emit onboundary
      let elapsedMs = 0;
      const msPerChar = mode === "slow" ? 95 : 62;
      tokens.forEach((tok, idx) => {
        const timerId = window.setTimeout(() => {
          if (!hasNativeBoundary) {
            setActiveWordIndex(idx);
          }
        }, elapsedMs);
        timersRef.current.push(timerId);
        elapsedMs += Math.max(tok.word.length, 3) * msPerChar + (mode === "slow" ? 130 : 75);
      });
    };

    utterance.onboundary = (event) => {
      if (typeof event.charIndex !== "number") return;
      hasNativeBoundary = true;
      clearFallbackTimers();
      const idx = tokens.findIndex(
        (t) => event.charIndex >= t.start && event.charIndex <= t.end + 1,
      );
      if (idx !== -1) {
        setActiveWordIndex(idx);
      }
    };

    const finish = () => {
      clearFallbackTimers();
      setActiveMode(null);
      setActiveWordIndex(null);
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    setActiveMode(mode);
    setActiveWordIndex(0);
    synth.speak(utterance);
  }

  return (
    <div className="spoken-sentence-block">
      <span className="feedback-answer" lang="en">
        {tokens.map((tok, idx) => (
          <span key={idx}>
            <span
              className={`spoken-word ${
                activeWordIndex === idx ? "spoken-word-active" : ""
              }`}
            >
              {tok.word}
            </span>
            {tok.space}
          </span>
        ))}
      </span>

      {supported && (
        <div className="speech-controls" role="group" aria-label="Dengarkan pengucapan">
          <button
            type="button"
            className={`speech-pill speech-pill-normal ${
              activeMode === "normal" ? "active" : ""
            }`}
            onClick={() => speak("normal")}
            aria-pressed={activeMode === "normal"}
            title="Dengarkan pengucapan normal"
          >
            <SpeakerWaveIcon active={activeMode === "normal"} />
            <span>{activeMode === "normal" ? "Berbicara…" : "Ucapkan"}</span>
          </button>

          <button
            type="button"
            className={`speech-pill speech-pill-slow ${
              activeMode === "slow" ? "active" : ""
            }`}
            onClick={() => speak("slow")}
            aria-pressed={activeMode === "slow"}
            title="Dengarkan pengucapan lambat"
          >
            <SlowTurtleIcon active={activeMode === "slow"} />
            <span>{activeMode === "slow" ? "Lambat…" : "Lambat"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

