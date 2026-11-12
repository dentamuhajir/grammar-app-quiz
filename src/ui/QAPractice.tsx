import { useEffect, useRef, useState } from "react";
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

const INTENTS = Object.keys(INTENT_LABELS) as Intent[];
const TENSES = Object.keys(QA_TENSE_LABELS) as QATense[];

function intentOptionLabel(intent: Intent): string {
  if (intent === "yesNo") return "Yes / No";
  if (intent === "howLong") return `How long · ${INTENT_LABELS[intent]}`;
  if (intent === "howOften") return `How often · ${INTENT_LABELS[intent]}`;
  return `${intent[0].toUpperCase() + intent.slice(1)} · ${INTENT_LABELS[intent]}`;
}

function QASession({ filter }: { filter: QAFilter }) {
  const [deck, setDeck] = useState(() => qaDeck(filter));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<QAResult | null>(null);
  const [showExample, setShowExample] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const q = deck[index];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function next() {
    if (index + 1 < deck.length) setIndex(index + 1);
    else {
      setDeck(qaDeck(filter, q.id));
      setIndex(0);
    }
    setInput("");
    setResult(null);
    setShowExample(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <main className="card qa-card">
      <div className="tags">
        <span className="tag tag-tense">{QA_TENSE_LABELS[q.tense]}</span>
        <span className="tag tag-form">{intentOptionLabel(q.intent)}</span>
      </div>
      <p className="basics-progress">
        Soal {index + 1} / {deck.length}
      </p>
      <div className="qa-dialogue">
        <span className="qa-speaker">Teman bertanya kepadamu:</span>
        <h2 className="basics-prompt">{q.question}</h2>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (result?.status === "correct") next();
          else setResult(checkQA(q, input));
        }}
      >
        <p className="qa-instruction">{q.cue}</p>
        <div className="answer-input">
          <input
            id="qa-answer"
            ref={inputRef}
            value={input}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Jawabanmu"
            placeholder={
              q.intent === "yesNo" ? "Yes, … / No, …" : "Tulis kalimat lengkap…"
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
              <strong>
                {result.status === "correct"
                  ? "Benar!"
                  : result.status === "incorrect"
                    ? "Perlu diperbaiki"
                    : result.status === "empty"
                      ? "Jawaban masih kosong"
                      : "Belum terverifikasi sepenuhnya"}
              </strong>
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
        </div>
        {showExample && (
          <div className="feedback feedback-reveal basics-feedback">
            <strong>Contoh jawaban</strong>
            <span className="feedback-answer">{q.sample}</span>
            <p className="basics-explanation">{q.explanation}</p>
          </div>
        )}
        <div className="actions basics-actions">
          <button type="submit" className="btn btn-primary">
            {result?.status === "correct"
              ? "Pertanyaan berikutnya →"
              : "Periksa jawaban"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowExample(!showExample)}
          >
            {showExample ? "Sembunyikan contoh" : "Lihat contoh & aturan"}
          </button>
          {result?.status !== "correct" && (
            <button type="button" className="btn btn-ghost" onClick={next}>
              Lewati
            </button>
          )}
        </div>
      </form>
      <p className="hotkeys">
        <kbd>Enter</kbd> periksa / berikutnya
      </p>
    </main>
  );
}

export function QAPractice() {
  const [filter, setFilter] = useState<QAFilter>({ tense: "all", intent: "all" });
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
      <section className="filters qa-filters" aria-label="Filter Question and Answer">
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
          <span>Jenis pertanyaan</span>
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
      </section>
      <QASession key={`${filter.tense}-${filter.intent}`} filter={filter} />
      <footer className="footer">
        Present · Past · Perfect · Future · Modal · Nominal · WH &amp; Yes/No
      </footer>
    </>
  );
}
