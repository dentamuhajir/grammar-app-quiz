import { useCallback, useState } from "react";
import { checkAnswer, type CheckResult } from "../grammar/check";
import {
  DEFAULT_FILTER,
  displayCap,
  generateQuestion,
  type QuizFilter,
} from "../grammar/generator";
import {
  FORM_LABELS,
  MODE_LABELS,
  TENSE_LABELS,
  TENSE_ORDER,
} from "../grammar/labels";
import type { Mode, Question, SentenceForm } from "../grammar/types";
import { SentenceExplanation } from "./SentenceExplanation";
import { Confetti } from "../ui/Confetti";
import { DiffView } from "../ui/DiffView";

/** The chips shown as the puzzle prompt. */
function PromptChips({ q }: { q: Question }) {
  if (q.mode === "passive") {
    // Active sentence (without time) + the time signal as its own chip, so the
    // learner sees it belongs in the answer and decides where it goes.
    return (
      <div className="prompt">
        <span className="prompt-label">Ubah kalimat ini menjadi passive voice:</span>
        <span className="chip chip-active">{q.activePrompt}</span>
        {q.timeSignal && <span className="chip chip-time">{q.timeSignal}</span>}
      </div>
    );
  }

  const subject = displayCap(q.subject.text);
  const rawCue =
    q.mode === "nominal" ? q.complement?.text ?? "" : q.verb?.base ?? "";
  const replacesComp =
    q.mode === "nominal" && ["What", "Where", "How"].includes(q.whWord ?? "");
  const cue = replacesComp ? `${rawCue} → ?` : rawCue;
  const object = q.mode === "verbal" ? q.verb?.object : undefined;
  const replacesObject =
    q.whWord === "What" ||
    (q.whWord === "How" && ["fast", "well", "hard"].includes(object ?? ""));

  return (
    <div className="prompt">
      {q.whWord && <span className="chip chip-wh">{q.whWord}</span>}
      <span className="chip chip-subject">{subject}</span>
      <span className="plus">+</span>
      <span className="chip chip-cue">{cue}</span>
      {object && (
        <>
          <span className="plus">+</span>
          <span className="chip chip-object">
            {replacesObject ? "?" : object}
          </span>
        </>
      )}
      {q.timeSignal && <span className="chip chip-time">{q.timeSignal}</span>}
    </div>
  );
}

const PRAISE = ["Benar!", "Tepat!", "Jawabanmu sesuai!"];

/** Short readable summary of the active filter, for the collapsed mobile bar. */
function filterSummary(f: QuizFilter): string {
  const parts = [
    f.tense === "all" ? "Semua tense" : TENSE_LABELS[f.tense],
    f.mode === "all" ? "Semua jenis" : MODE_LABELS[f.mode].replace(/\s*\(.*\)/, ""),
    f.form === "all" ? "Semua bentuk" : FORM_LABELS[f.form].replace(/\s*\(.*\)/, ""),
  ];
  return parts.join(" · ");
}

export function SentencePractice() {
  const [filter, setFilter] = useState<QuizFilter>(DEFAULT_FILTER);
  const [question, setQuestion] = useState<Question>(() =>
    generateQuestion(DEFAULT_FILTER),
  );
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [praise, setPraise] = useState("");
  // Mobile-only: collapse the filters so the question card stays the focus.
  const [filtersOpen, setFiltersOpen] = useState(false);

  const next = useCallback((f: QuizFilter) => {
    setQuestion(generateQuestion(f));
    setInput("");
    setResult(null);
    setRevealed(false);
    setPraise("");
  }, []);

  const check = useCallback(() => {
    // If already answered correctly, Enter advances to the next question.
    if (result?.correct) {
      next(filter);
      return;
    }
    const r = checkAnswer(question, input);
    if (r.empty) {
      setResult(r);
      return;
    }
    setResult(r);
    if (r.correct) {
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      setConfetti((c) => c + 1);
    }
  }, [filter, input, next, question, result]);

  function updateFilter(patch: Partial<QuizFilter>) {
    const merged = { ...filter, ...patch };
    setFilter(merged);
    next(merged);
  }

  return (
    <>
      <Confetti fire={confetti} />



      <section className={`filter-panel ${filtersOpen ? "open" : ""}`}>
        {/* Collapsed summary bar — only shown on mobile */}
        <button
          type="button"
          className="filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="filter-body"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <span className="filter-toggle-text">
            <span className="filter-toggle-label">Filter</span>
            <span className="filter-toggle-summary">{filterSummary(filter)}</span>
          </span>
          <span className="filter-toggle-chevron" aria-hidden="true">
            {filtersOpen ? "✕" : "Edit"}
          </span>
        </button>

        <div className="filter-body" id="filter-body">
          <div className="filters" aria-label="Filters">
            <label>
              <span>Tense</span>
              <select
                value={filter.tense}
                onChange={(e) =>
                  updateFilter({ tense: e.target.value as QuizFilter["tense"] })
                }
              >
                <option value="all">Semua tense</option>
                {TENSE_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {TENSE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Jenis</span>
              <select
                value={filter.mode}
                onChange={(e) =>
                  updateFilter({ mode: e.target.value as QuizFilter["mode"] })
                }
              >
                <option value="all">Semua jenis</option>
                {(["verbal", "nominal", "passive"] as Mode[]).map((m) => (
                  <option key={m} value={m}>
                    {MODE_LABELS[m]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Bentuk</span>
              <select
                value={filter.form}
                onChange={(e) =>
                  updateFilter({ form: e.target.value as QuizFilter["form"] })
                }
              >
                <option value="all">Semua bentuk</option>
                {(
                  [
                    "positive",
                    "negative",
                    "yesNoQuestion",
                    "whQuestion",
                  ] as SentenceForm[]
                ).map((f) => (
                  <option key={f} value={f}>
                    {FORM_LABELS[f]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="rare-toggle">
            <input
              type="checkbox"
              checked={filter.includeRare}
              onChange={(e) => updateFilter({ includeRare: e.target.checked })}
            />
            <span>Sertakan bentuk langka &amp; latihan kata kerja keadaan</span>
          </label>
        </div>
      </section>

      <main className="card">
        <div className="tags">
          <span className="tag tag-tense">{TENSE_LABELS[question.tense]}</span>
          <span className="tag tag-mode">{MODE_LABELS[question.mode]}</span>
          <span className="tag tag-form">{FORM_LABELS[question.form]}</span>
          {question.rare && <span className="tag tag-rare">⚠ jarang digunakan</span>}
        </div>

        <PromptChips q={question} />

        <div className="answer-input">
          <input
            type="text"
            value={input}
            id="sentence-answer"
            aria-label="Jawabanmu"
            placeholder="Tulis kalimat lengkap dalam bahasa Inggris…"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className={
              result && !result.empty
                ? result.correct
                  ? "ok"
                  : "bad"
                : ""
            }
            onChange={(e) => {
              setInput(e.target.value);
              if (result) setResult(null);
              setPraise("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                check();
              }
            }}
          />
        </div>

        {result?.correct && (
          <div className="feedback feedback-ok" role="status">
            <span className="feedback-title">🎉 {praise}</span>
            <span className="feedback-answer">{question.answer}</span>
            {result.alternativeOrder && <p className="basics-explanation">Letak keterangan waktu di awal kalimat juga diterima. Di atas adalah susunan acuan.</p>}
          </div>
        )}

        {result && !result.correct && !result.empty && (
          <div className="feedback feedback-bad" role="status">
            <DiffView diff={result.diff} />
            <p className="hint">💡 {result.hint}</p>
          </div>
        )}

        {result?.empty && (
          <p className="hint hint-plain">Tulis kalimatmu terlebih dahulu, lalu periksa jawabannya.</p>
        )}

        {revealed && !result?.correct && (
          <div className="feedback feedback-reveal">
            <span className="feedback-answer">{question.answer}</span>
          </div>
        )}

        <SentenceExplanation key={question.answer} question={question} solved={revealed || result?.correct === true} />

        <div className="actions">
          <button className="btn btn-primary" onClick={check}>
            {result?.correct ? "Soal berikutnya →" : "Periksa jawaban"}
          </button>
          {!result?.correct && (
            <button
              className="btn btn-ghost"
              onClick={() => setRevealed((r) => !r)}
            >
              {revealed ? "Sembunyikan jawaban" : "Lihat jawaban"}
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => next(filter)}>
            Kalimat baru
          </button>
        </div>

        <p className="hotkeys">
          <kbd>Enter</kbd> periksa / berikutnya
        </p>
      </main>

      <footer className="footer">
        12 tense · verbal, nominal &amp; passive · {`+ / − / ? / WH`}
      </footer>
    </>
  );
}
