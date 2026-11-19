import { useEffect, useRef, useState } from "react";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
  length: number;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function joinTranscript(base: string, spoken: string): string {
  const b = base.trim();
  const s = spoken.trim();
  if (!b) return s;
  if (!s) return b;
  return `${b} ${s}`;
}

export interface VoiceInputBarProps {
  compact?: boolean;
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  multiline?: boolean;
}

export function VoiceInputBar({
  compact = false,
  value,
  onChange,
  disabled = false,
  multiline = false,
}: VoiceInputBarProps) {
  const [supported] = useState<boolean>(() =>
    Boolean(getSpeechRecognitionCtor()),
  );
  const [listening, setListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wantListeningRef = useRef(false);
  const baseTextRef = useRef("");
  const finalSessionRef = useRef("");
  const latestValueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  latestValueRef.current = value;
  onChangeRef.current = onChange;

  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (disabled && listening) {
      stopListening();
    }
  }, [disabled, listening]);

  function startListening() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setErrorMsg("Browser ini belum mendukung fitur input suara.");
      return;
    }

    setErrorMsg(null);
    baseTextRef.current = latestValueRef.current.trim();
    finalSessionRef.current = "";
    wantListeningRef.current = true;

    try {
      const rec = new Ctor();
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event: SpeechRecognitionEventLike) => {
        let finalChunk = "";
        let interimChunk = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0]?.transcript ?? "";
          if (res.isFinal) {
            finalChunk += `${transcript} `;
          } else {
            interimChunk += transcript;
          }
        }

        finalSessionRef.current = finalChunk.trim();
        const currentSpoken = joinTranscript(
          finalSessionRef.current,
          interimChunk,
        );
        const nextText = joinTranscript(baseTextRef.current, currentSpoken);
        latestValueRef.current = nextText;
        onChangeRef.current(nextText);
      };

      rec.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (event.error === "no-speech") {
          // User is pausing/thinking — keep text intact and allow seamless resume
          return;
        }
        wantListeningRef.current = false;
        setListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setErrorMsg(
            "Izin mikrofon ditolak. Aktifkan izin mikrofon di browser atau ketik manual.",
          );
        } else if (event.error === "network") {
          setErrorMsg(
            "Fitur suara membutuhkan jaringan atau paket suara offline di perangkat ini.",
          );
        } else {
          setErrorMsg("Mikrofon berhenti. Anda tetap bisa mengedit teks atau bicara lagi.");
        }
      };

      rec.onend = () => {
        // Commit whatever was spoken so far as the new base text so pauses never lose words
        baseTextRef.current = latestValueRef.current.trim();
        finalSessionRef.current = "";

        if (wantListeningRef.current) {
          // Auto-restart if user paused to think while mic is still toggled ON
          try {
            rec.start();
            return;
          } catch {
            // Fall through if browser blocks immediate restart
          }
        }
        wantListeningRef.current = false;
        setListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      wantListeningRef.current = false;
      setListening(false);
      setErrorMsg("Gagal memulai mikrofon. Silakan coba lagi atau ketik manual.");
    }
  }

  function stopListening() {
    wantListeningRef.current = false;
    setListening(false);
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  }

  function toggleListening() {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function handleRepeatFromScratch() {
    stopListening();
    setErrorMsg(null);
    baseTextRef.current = "";
    finalSessionRef.current = "";
    latestValueRef.current = "";
    onChange("");
  }

  function handleAppendPeriod() {
    const trimmed = value.trim();
    if (!trimmed) return;
    const withPeriod = /[.!?]$/.test(trimmed) ? `${trimmed} ` : `${trimmed}. `;
    baseTextRef.current = withPeriod.trim();
    finalSessionRef.current = "";
    latestValueRef.current = withPeriod;
    onChange(withPeriod);
  }

  if (!supported) return null;

  const hasText = value.trim().length > 0;

  return (
    <div className="voice-input-bar">
      <div className="voice-input-controls">
        <button
          type="button"
          disabled={disabled}
          className={`voice-mic-btn ${listening ? "listening" : ""}`}
          onClick={toggleListening}
          aria-pressed={listening}
          title={
            listening
              ? "Berhenti merekam suara"
              : hasText
                ? "Sambung bicara (tanpa menghapus teks yang sudah ada)"
                : "Jawab dengan suara (Bahasa Inggris)"
          }
        >
          <span className="voice-mic-dot" aria-hidden="true">
            {listening ? "⏹" : "🎙️"}
          </span>
          <span>
            {compact ? (listening ? "Berhenti" : hasText ? "Sambung suara" : "Dikte") : listening
              ? "Mendengarkan… (Klik untuk selesai)"
              : hasText
                ? "Sambung Suara"
                : "Jawab pakai Suara"}
          </span>
        </button>

        {multiline && hasText && !disabled && (
          <button
            type="button"
            className="voice-aux-btn"
            onClick={handleAppendPeriod}
            title="Tambahkan titik di akhir kalimat"
          >
            + Titik (.)
          </button>
        )}

        {hasText && !disabled && (
          <button
            type="button"
            className="voice-aux-btn"
            onClick={handleRepeatFromScratch}
            title="Hapus semua dan ulangi dari awal"
          >
            ↺ Ulangi
          </button>
        )}
      </div>

      {listening && (
        <p className="voice-status-hint">
          Ucapkan dalam bahasa Inggris. Jika jeda mikir, teks tidak akan hilang—Anda juga bebas mengedit teks dengan keyboard.
        </p>
      )}

      {errorMsg && <p className="voice-error-hint">{errorMsg}</p>}
    </div>
  );
}
