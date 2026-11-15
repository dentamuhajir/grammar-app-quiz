import { useEffect, useState } from "react";
import type { Tense } from "../grammar/types";

type ExplorerSubject = "I" | "You" | "He" | "She" | "We" | "They";
type ExplorerTime = "present" | "past" | "future";
type ExplorerAspect =
  | "simple"
  | "continuous"
  | "perfect"
  | "perfectContinuous";

interface PersonMeta {
  id: string;
  be: string;
  pastBe: string;
  have: string;
  simple: string;
}

const PERSONS: Record<ExplorerSubject, PersonMeta> = {
  I: {
    id: "Saya",
    be: "am",
    pastBe: "was",
    have: "have",
    simple: "study",
  },
  You: {
    id: "Kamu",
    be: "are",
    pastBe: "were",
    have: "have",
    simple: "study",
  },
  He: {
    id: "Dia (laki-laki)",
    be: "is",
    pastBe: "was",
    have: "has",
    simple: "studies",
  },
  She: {
    id: "Dia (perempuan)",
    be: "is",
    pastBe: "was",
    have: "has",
    simple: "studies",
  },
  We: {
    id: "Kami/kita",
    be: "are",
    pastBe: "were",
    have: "have",
    simple: "study",
  },
  They: {
    id: "Mereka",
    be: "are",
    pastBe: "were",
    have: "have",
    simple: "study",
  },
};

const TIMES: Record<ExplorerTime, string> = {
  present: "Present",
  past: "Past",
  future: "Future",
};

const ASPECTS: Record<ExplorerAspect, string> = {
  simple: "Simple",
  continuous: "Continuous",
  perfect: "Perfect",
  perfectContinuous: "Perfect Continuous",
};

interface AspectDetail {
  tail: string;
  formula: string;
  meaning: string;
  explain: string;
}

const DETAILS: Record<ExplorerTime, Record<ExplorerAspect, AspectDetail>> = {
  present: {
    simple: {
      tail: "English every day.",
      formula: "Subject + V1 (s/es untuk he/she/it) + object",
      meaning: "belajar bahasa Inggris setiap hari.",
      explain:
        "Kebiasaan atau rutinitas. Waktu patokan: sekarang (kebiasaan umum yang berulang).",
    },
    continuous: {
      tail: "English right now.",
      formula: "Subject + am/is/are + V-ing + object",
      meaning: "sedang belajar bahasa Inggris sekarang.",
      explain:
        "Aktivitas sedang berlangsung saat ini. Waktu patokan: tepat sekarang.",
    },
    perfect: {
      tail: "English today.",
      formula: "Subject + have/has + V3 + object",
      meaning: "sudah belajar bahasa Inggris hari ini.",
      explain:
        "Aktivitas sudah dilakukan pada periode yang masih terkait dengan sekarang. Tidak berarti proses belajar selesai selamanya.",
    },
    perfectContinuous: {
      tail: "English for two hours.",
      formula: "Subject + have/has + been + V-ing + object",
      meaning: "sudah belajar bahasa Inggris selama dua jam.",
      explain:
        "Menekankan durasi hingga sekarang; aktivitas mungkin masih berlangsung atau baru saja berhenti.",
    },
  },
  past: {
    simple: {
      tail: "English yesterday.",
      formula: "Subject + V2 + object",
      meaning: "belajar bahasa Inggris kemarin.",
      explain: "Kejadian pada waktu lampau yang sudah selesai/lewat.",
    },
    continuous: {
      tail: "English at 8 PM yesterday.",
      formula: "Subject + was/were + V-ing + object",
      meaning: "sedang belajar bahasa Inggris pada jam 8 malam kemarin.",
      explain:
        "Aktivitas sedang berlangsung pada titik waktu tertentu di masa lalu.",
    },
    perfect: {
      tail: "English before the class started.",
      formula: "Subject + had + V3 + object",
      meaning: "sudah belajar bahasa Inggris sebelum kelas dimulai.",
      explain:
        "Belajar terjadi lebih dulu; 'kelas dimulai' menjadi waktu patokan (anchor) di masa lalu.",
    },
    perfectContinuous: {
      tail: "English for two hours when the class started.",
      formula: "Subject + had + been + V-ing + object",
      meaning:
        "sudah belajar bahasa Inggris selama dua jam ketika kelas dimulai.",
      explain:
        "Durasi belajar (2 jam) dihitung sampai titik ketika kelas dimulai (patokan masa lalu).",
    },
  },
  future: {
    simple: {
      tail: "English tomorrow.",
      formula: "Subject + will + V1 + object",
      meaning: "akan belajar bahasa Inggris besok.",
      explain: "Aktivitas yang diperkirakan atau direncanakan pada masa depan.",
    },
    continuous: {
      tail: "English at 8 PM tomorrow.",
      formula: "Subject + will + be + V-ing + object",
      meaning: "akan sedang belajar bahasa Inggris pada jam 8 malam besok.",
      explain:
        "Aktivitas diperkirakan sedang berlangsung pada titik waktu tertentu besok.",
    },
    perfect: {
      tail: "English by 8 PM tomorrow.",
      formula: "Subject + will + have + V3 + object",
      meaning:
        "akan sudah belajar bahasa Inggris paling lambat jam 8 malam besok.",
      explain:
        "Belajar akan sudah dilakukan sebelum/pada batas waktu besok jam 8; tidak berarti seluruh proses belajar bahasa Inggris tuntas selamanya.",
    },
    perfectContinuous: {
      tail: "English for two hours by 8 PM tomorrow.",
      formula: "Subject + will + have + been + V-ing + object",
      meaning:
        "akan sudah belajar bahasa Inggris selama dua jam pada jam 8 malam besok.",
      explain:
        "Menekankan akumulasi durasi dua jam sampai waktu patokan besok jam 8 malam.",
    },
  },
};

function parseTense(tense?: Tense): {
  time: ExplorerTime;
  aspect: ExplorerAspect;
} {
  if (!tense) return { time: "present", aspect: "simple" };
  const time: ExplorerTime = tense.startsWith("past")
    ? "past"
    : tense.startsWith("future")
      ? "future"
      : "present";
  const rest = tense.replace(/^(present|past|future)/, "");
  const aspect: ExplorerAspect =
    rest === "Continuous"
      ? "continuous"
      : rest === "Perfect"
        ? "perfect"
        : rest === "PerfectContinuous"
          ? "perfectContinuous"
          : "simple";
  return { time, aspect };
}

function normalizeSubject(raw?: string): ExplorerSubject {
  if (!raw) return "I";
  const lower = raw.trim().toLowerCase();
  if (lower === "i") return "I";
  if (lower === "you") return "You";
  if (lower === "he") return "He";
  if (lower === "she") return "She";
  if (lower === "we") return "We";
  if (lower === "they") return "They";
  return "She";
}

function buildExplorerSentence(
  s: ExplorerSubject,
  t: ExplorerTime,
  a: ExplorerAspect,
): string {
  const p = PERSONS[s];
  const end = DETAILS[t][a].tail;
  const verbMap: Record<ExplorerTime, Record<ExplorerAspect, string>> = {
    present: {
      simple: p.simple,
      continuous: `${p.be} studying`,
      perfect: `${p.have} studied`,
      perfectContinuous: `${p.have} been studying`,
    },
    past: {
      simple: "studied",
      continuous: `${p.pastBe} studying`,
      perfect: "had studied",
      perfectContinuous: "had been studying",
    },
    future: {
      simple: "will study",
      continuous: "will be studying",
      perfect: "will have studied",
      perfectContinuous: "will have been studying",
    },
  };
  return `${s} ${verbMap[t][a]} ${end}`;
}

export function TensesExplorer({
  initialTense,
  initialSubject,
}: {
  initialTense?: Tense;
  initialSubject?: string;
}) {
  const parsed = parseTense(initialTense);
  const [subject, setSubject] = useState<ExplorerSubject>(() =>
    normalizeSubject(initialSubject),
  );
  const [time, setTime] = useState<ExplorerTime>(parsed.time);
  const [aspect, setAspect] = useState<ExplorerAspect>(parsed.aspect);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const next = parseTense(initialTense);
    setTime(next.time);
    setAspect(next.aspect);
  }, [initialTense]);

  useEffect(() => {
    if (initialSubject) {
      setSubject(normalizeSubject(initialSubject));
    }
  }, [initialSubject]);

  const detail = DETAILS[time][aspect];
  const currentSentence = buildExplorerSentence(subject, time, aspect);
  const anchors: Record<ExplorerTime, number> = {
    past: 180,
    present: 380,
    future: 580,
  };
  const anchor = anchors[time];

  let barX = anchor - 28;
  let barW = 56;
  if (aspect === "continuous") {
    barX = anchor - 78;
    barW = 156;
  } else if (aspect === "perfect") {
    barX = anchor - 135;
    barW = 125;
  } else if (aspect === "perfectContinuous") {
    barX = anchor - 185;
    barW = 175;
  }

  const aspectCaption =
    aspect === "simple"
      ? "Fakta / kebiasaan / kejadian"
      : aspect === "continuous"
        ? "Sedang berlangsung"
        : aspect === "perfect"
          ? "Sudah terjadi sebelum/sampai patokan"
          : "Durasi hingga waktu patokan";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(currentSentence);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  }

  return (
    <div className="tenses-explorer">
      <p className="tenses-explorer-intro">
        Satu aktivitas konstan: <strong>study English</strong>. Ubah subjek,
        waktu, dan aspek untuk membandingkan pola 12 tenses secara visual.
      </p>

      {/* 1. Controls */}
      <div className="tenses-explorer-controls">
        <div className="tenses-control-group">
          <span className="tenses-control-label">1. Pilih Subjek</span>
          <div className="tenses-pill-row">
            {(Object.keys(PERSONS) as ExplorerSubject[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`tenses-option-pill ${subject === s ? "active" : ""}`}
                aria-pressed={subject === s}
                onClick={() => setSubject(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="tenses-control-split">
          <div className="tenses-control-group">
            <span className="tenses-control-label">2. Pilih Waktu</span>
            <div className="tenses-pill-row">
              {(Object.entries(TIMES) as [ExplorerTime, string][]).map(
                ([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    className={`tenses-option-pill ${time === k ? "active" : ""}`}
                    aria-pressed={time === k}
                    onClick={() => setTime(k)}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="tenses-control-group">
            <span className="tenses-control-label">3. Pilih Aspek</span>
            <div className="tenses-pill-row">
              {(Object.entries(ASPECTS) as [ExplorerAspect, string][]).map(
                ([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    className={`tenses-option-pill ${aspect === k ? "active" : ""}`}
                    aria-pressed={aspect === k}
                    onClick={() => setAspect(k)}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Sentence & Formula Card */}
      <div className="tenses-sentence-card" aria-live="polite">
        <div className="tenses-sentence-header">
          <span className="tag tag-tense">
            {TIMES[time]} {ASPECTS[aspect]}
          </span>
          <button
            type="button"
            className="tenses-copy-btn"
            onClick={handleCopy}
          >
            {copied ? "✓ Tersalin!" : "Salin kalimat"}
          </button>
        </div>

        <p className="tenses-main-sentence" lang="en">
          {currentSentence}
        </p>
        <p className="tenses-translation">
          {PERSONS[subject].id} {detail.meaning}
        </p>

        <div className="tenses-info-grid">
          <div className="tenses-info-box">
            <strong>POLA GRAMMAR</strong>
            <p>{detail.formula}</p>
          </div>
          <div className="tenses-info-box">
            <strong>KONTEKS &amp; ANCHOR TIME</strong>
            <p>{detail.explain}</p>
          </div>
        </div>
      </div>

      {/* 3. SVG Timeline Visualization */}
      <div className="tenses-timeline-card">
        <span className="tenses-control-label">Visualisasi Waktu</span>
        <svg
          className="tenses-timeline-svg"
          viewBox="0 0 760 170"
          role="img"
          aria-label="Garis waktu aktivitas belajar bahasa Inggris"
        >
          <line
            x1="42"
            y1="88"
            x2="715"
            y2="88"
            stroke="#64748b"
            strokeWidth="3.5"
          />
          <path d="M715 88 l-12 -8 v16 z" fill="#64748b" />
          <rect
            x={barX}
            y="72"
            width={barW}
            height="32"
            rx="9"
            fill="#0d9488"
            stroke="#141414"
            strokeWidth="2.5"
          />
          <line
            x1={anchor}
            y1="34"
            x2={anchor}
            y2="122"
            stroke="#e59a34"
            strokeWidth="3.5"
            strokeDasharray="6 5"
          />
          <text
            x={anchor}
            y="24"
            textAnchor="middle"
            fontSize="15"
            fontWeight="800"
            fill="#b45309"
          >
            Anchor time
          </text>
          <text
            x="380"
            y="152"
            textAnchor="middle"
            fontSize="15"
            fontWeight="700"
            fill="#334155"
          >
            {TIMES[time]} · {aspectCaption}
          </text>
          <text x="45" y="114" fontSize="13" fontWeight="700" fill="#64748b">
            Lebih awal
          </text>
          <text
            x="715"
            y="114"
            textAnchor="end"
            fontSize="13"
            fontWeight="700"
            fill="#64748b"
          >
            Lebih akhir
          </text>
        </svg>

        <div className="tenses-legend">
          <span>
            <i
              className="tenses-legend-dot"
              style={{ background: "#0d9488" }}
            />
            Aktivitas belajar
          </span>
          <span>
            <i
              className="tenses-legend-dot"
              style={{ background: "#e59a34" }}
            />
            Waktu patokan (Anchor time)
          </span>
        </div>
        <p className="tenses-timeline-note">
          Diagram bersifat konseptual. Untuk Simple, batang menggambarkan
          kejadian atau kebiasaan umum pada titik waktu tersebut.
        </p>
      </div>

      {/* 4. 12-Tenses Comparison Table/List */}
      <div className="tenses-comparison-card">
        <span className="tenses-control-label">
          Perbandingan 12 Tenses (Klik baris untuk memilih)
        </span>
        <div className="tenses-comparison-list">
          {(Object.entries(TIMES) as [ExplorerTime, string][]).map(
            ([tKey, tLabel]) =>
              (Object.entries(ASPECTS) as [ExplorerAspect, string][]).map(
                ([aKey, aLabel]) => {
                  const selected = time === tKey && aspect === aKey;
                  return (
                    <button
                      key={`${tKey}-${aKey}`}
                      type="button"
                      className={`tenses-comparison-row ${selected ? "selected" : ""}`}
                      onClick={() => {
                        setTime(tKey);
                        setAspect(aKey);
                      }}
                    >
                      <span className="tenses-comp-badge">
                        {tLabel} {aLabel}
                      </span>
                      <span className="tenses-comp-sentence" lang="en">
                        {buildExplorerSentence(subject, tKey, aKey)}
                      </span>
                    </button>
                  );
                },
              ),
          )}
        </div>
      </div>
    </div>
  );
}
