import { useState } from "react";
import {
  checkQA,
  INTENT_LABELS,
  QA_POOL,
  qaDeck,
  QA_TENSE_LABELS,
  type Intent,
  type QAFilter,
  type QAResult,
  type QATense,
} from "../grammar/qa/engine";
import { BottomSheet } from "./BottomSheet";
import { SuccessBadge } from "./FeedbackIcons";
import { SpokenSentence } from "./SpokenSentence";
import { useSwipeCard } from "./useSwipeCard";

const INTENTS = Object.keys(INTENT_LABELS) as Intent[];
const TENSES = Object.keys(QA_TENSE_LABELS) as QATense[];

function intentOptionLabel(intent: Intent): string {
  if (intent === "yesNo") return "Yes / No";
  if (intent === "howLong") return `How long · ${INTENT_LABELS[intent]}`;
  if (intent === "howOften") return `How often · ${INTENT_LABELS[intent]}`;
  return `${intent[0].toUpperCase() + intent.slice(1)} · ${INTENT_LABELS[intent]}`;
}

function qaSummary(filter: QAFilter): string {
  const t =
    filter.tense === "all"
      ? "Semua struktur"
      : QA_TENSE_LABELS[filter.tense];
  const i =
    filter.intent === "all"
      ? "Semua jenis tanya"
      : intentOptionLabel(filter.intent);
  return `${t} · ${i}`;
}

function QASession({ filter }: { filter: QAFilter }) {
  const [deck, setDeck] = useState(() => qaDeck(filter));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<QAResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);
  const q = deck[index];
  const finished = result?.status === "correct" || revealed;

  function next() {
    if (index + 1 < deck.length) setIndex(index + 1);
    else {
      setDeck(qaDeck(filter, q.id));
      setIndex(0);
    }
    setInput("");
    setResult(null);
    setRevealed(false);
    setExampleOpen(false);
  }

  const { swipeHandlers, cardStyle, cardClass } = useSwipeCard({
    onSwipeLeft: next,
    onSwipeRight: () => setExampleOpen(true),
  });

  return (
    <>
      <main
        className={`card qa-card ${cardClass}`}
        style={cardStyle}
        {...swipeHandlers}
      >
        <div className="tags">
          <span className="tag tag-tense">{QA_TENSE_LABELS[q.tense]}</span>
          <span className="tag tag-form">{intentOptionLabel(q.intent)}</span>
        </div>

        <div className="qa-dialogue">
          <span className="qa-speaker">Teman bertanya kepadamu:</span>
          <h2 className="basics-prompt">{q.question}</h2>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (finished) next();
            else setResult(checkQA(q, input));
          }}
        >
          <p className="qa-instruction">{q.cue}</p>
          <div className="answer-input">
            <input
              id="qa-answer"
              value={input}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Jawabanmu"
              placeholder={
                q.intent === "yesNo"
                  ? "Yes, … / No, …"
                  : "Tulis kalimat lengkap…"
              }
              onChange={(event) => {
                setInput(event.target.value);
                setResult(null);
              }}
              className={
                result?.status === "correct"
                  ? "ok"
                  : result?.status === "incorrect"
                    ? "bad"
                    : ""
              }
              aria-invalid={result?.status === "incorrect"}
            />
          </div>
          <div aria-live="polite" aria-atomic="true">
            {result && (
              <div
                className={`feedback basics-feedback ${
                  result.status === "correct"
                    ? "feedback-ok"
                    : result.status === "incorrect"
                      ? "feedback-bad"
                      : "qa-feedback-partial"
                }`}
              >
                {result.status === "correct" ? (
                  <>
                    <span className="feedback-title">
                      <SuccessBadge />
                      <span>Benar!</span>
                    </span>
                    <SpokenSentence text={input.trim() || q.sample} />
                  </>
                ) : (
                  <strong>
                    {result.status === "incorrect"
                      ? "Perlu diperbaiki"
                      : result.status === "empty"
                        ? "Jawaban masih kosong"
                        : "Belum terverifikasi sepenuhnya"}
                  </strong>
                )}
                {result.status !== "empty" && (
                  <div className="qa-checks">
                    <span>
                      Pola utama:{" "}
                      {result.grammar === "pass"
                        ? "✓ sesuai"
                        : result.grammar === "fail"
                          ? "✕ perlu diperbaiki"
                          : "? belum terverifikasi"}
                    </span>
                    <span>
                      Respons:{" "}
                      {result.response === "pass"
                        ? "✓ sesuai"
                        : result.response === "fail"
                          ? "✕ perlu diperbaiki"
                          : "? belum terverifikasi"}
                    </span>
                  </div>
                )}
                <p className="basics-explanation">{result.message}</p>
              </div>
            )}
            {revealed && result?.status !== "correct" && (
              <div className="feedback feedback-reveal basics-feedback">
                <strong>Contoh jawaban &amp; penjelasan</strong>
                <SpokenSentence text={q.sample} />
                <p className="basics-explanation">{q.explanation}</p>
              </div>
            )}
          </div>
          <div className="actions basics-actions">
            <button type="submit" className="btn btn-primary">
              {finished ? "Pertanyaan berikutnya →" : "Periksa jawaban"}
            </button>
            {!finished && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setRevealed(true)}
              >
                Lihat jawaban
              </button>
            )}
          </div>
        </form>
        <p className="swipe-hint">
          ← Geser kiri: soal baru · Geser kanan: contoh →
        </p>
      </main>

      <BottomSheet
        open={exampleOpen}
        onClose={() => setExampleOpen(false)}
        title="Contoh Jawaban & Aturan"
      >
        <div className="sheet-content-stack">
          <div className="tags">
            <span className="tag tag-tense">{QA_TENSE_LABELS[q.tense]}</span>
            <span className="tag tag-form">{intentOptionLabel(q.intent)}</span>
          </div>
          <p className="qa-instruction" style={{ margin: 0 }}>
            <strong>Pertanyaan:</strong> {q.question}
          </p>
          <div className="feedback feedback-reveal">
            <strong>Contoh jawaban yang diterima</strong>
            <SpokenSentence text={q.sample} />
            <p className="basics-explanation">{q.explanation}</p>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

export function QAPractice() {
  const [filter, setFilter] = useState<QAFilter>({
    tense: "all",
    intent: "all",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableIntents = INTENTS.filter((intent) =>
    QA_POOL.some(
      (q) =>
        (filter.tense === "all" || q.tense === filter.tense) &&
        q.intent === intent,
    ),
  );

  function updateTense(tense: QAFilter["tense"]) {
    const stillValid =
      filter.intent === "all" ||
      QA_POOL.some(
        (q) =>
          (tense === "all" || q.tense === tense) && q.intent === filter.intent,
      );
    setFilter({ tense, intent: stillValid ? filter.intent : "all" });
  }

  return (
    <>
      <button
        type="button"
        className="filter-pill-bar"
        onClick={() => setFiltersOpen(true)}
      >
        <span className="filter-toggle-text">
          <span className="filter-toggle-label">Filter Question &amp; Answer</span>
          <span className="filter-toggle-summary">{qaSummary(filter)}</span>
        </span>
        <span className="filter-pill-action">⚙ Ubah</span>
      </button>

      <QASession key={`${filter.tense}-${filter.intent}`} filter={filter} />

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter Question & Answer"
      >
        <div className="sheet-form">
          <label htmlFor="qa-tense-filter">
            <span>Tense / Struktur</span>
            <select
              id="qa-tense-filter"
              value={filter.tense}
              onChange={(event) =>
                updateTense(event.target.value as QAFilter["tense"])
              }
            >
              <option value="all">Semua tense &amp; struktur</option>
              {TENSES.map((value) => (
                <option value={value} key={value}>
                  {QA_TENSE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="qa-kind-filter">
            <span>Jenis Pertanyaan</span>
            <select
              id="qa-kind-filter"
              value={filter.intent}
              onChange={(event) =>
                setFilter({
                  ...filter,
                  intent: event.target.value as QAFilter["intent"],
                })
              }
            >
              <option value="all">Semua jenis</option>
              {availableIntents.map((value) => (
                <option value={value} key={value}>
                  {intentOptionLabel(value)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFiltersOpen(false)}
          >
            Terapkan Filter
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
