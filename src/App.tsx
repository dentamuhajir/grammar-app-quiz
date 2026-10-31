import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_FILTER,
  displayCap,
  generateQuestion,
  type QuizFilter,
} from "./grammar/generator";
import {
  FORM_LABELS,
  MODE_LABELS,
  TENSE_LABELS,
  TENSE_ORDER,
} from "./grammar/labels";
import type { Mode, Question, SentenceForm } from "./grammar/types";

/** The chips shown as the puzzle prompt. */
function PromptChips({ q }: { q: Question }) {
  if (q.mode === "passive") {
    // Show the full active sentence; the learner rewrites it as passive.
    return (
      <div className="prompt">
        <span className="prompt-label">Make it passive:</span>
        <span className="chip chip-active">{q.activePrompt}</span>
      </div>
    );
  }

  const subject = displayCap(q.subject.text);
  const cue =
    q.mode === "nominal" ? q.complement?.text ?? "" : q.verb?.base ?? "";
  const object = q.mode === "verbal" ? q.verb?.object : undefined;

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
            {q.whWord === "What" ? "?" : object}
          </span>
        </>
      )}
      {q.timeSignal && <span className="chip chip-time">{q.timeSignal}</span>}
    </div>
  );
}

export default function App() {
  const [filter, setFilter] = useState<QuizFilter>(DEFAULT_FILTER);
  const [question, setQuestion] = useState<Question>(() =>
    generateQuestion(DEFAULT_FILTER),
  );
  const [revealed, setRevealed] = useState(false);

  const next = useCallback((f: QuizFilter) => {
    setQuestion(generateQuestion(f));
    setRevealed(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setRevealed((r) => !r);
      } else if (e.key.toLowerCase() === "n") {
        next(filter);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filter, next]);

  function updateFilter(patch: Partial<QuizFilter>) {
    const merged = { ...filter, ...patch };
    setFilter(merged);
    next(merged);
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Grammar App Quiz</h1>
        <p className="subtitle">
          Form the sentence in your head, then reveal the answer.
        </p>
      </header>

      <section className="filters" aria-label="Filters">
        <label>
          <span>Tense</span>
          <select
            value={filter.tense}
            onChange={(e) =>
              updateFilter({ tense: e.target.value as QuizFilter["tense"] })
            }
          >
            <option value="all">All tenses</option>
            {TENSE_ORDER.map((t) => (
              <option key={t} value={t}>
                {TENSE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Type</span>
          <select
            value={filter.mode}
            onChange={(e) =>
              updateFilter({ mode: e.target.value as QuizFilter["mode"] })
            }
          >
            <option value="all">All types</option>
            {(["verbal", "nominal", "passive"] as Mode[]).map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Form</span>
          <select
            value={filter.form}
            onChange={(e) =>
              updateFilter({ form: e.target.value as QuizFilter["form"] })
            }
          >
            <option value="all">All forms</option>
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
      </section>

      <label className="rare-toggle">
        <input
          type="checkbox"
          checked={filter.includeRare}
          onChange={(e) => updateFilter({ includeRare: e.target.checked })}
        />
        <span>Include rare forms &amp; stative-verb traps</span>
      </label>

      <main className="card">
        <div className="tags">
          <span className="tag tag-tense">{TENSE_LABELS[question.tense]}</span>
          <span className="tag tag-mode">{MODE_LABELS[question.mode]}</span>
          <span className="tag tag-form">{FORM_LABELS[question.form]}</span>
          {question.rare && <span className="tag tag-rare">⚠ rarely used</span>}
        </div>

        <PromptChips q={question} />

        <div className={`answer ${revealed ? "shown" : "hidden"}`}>
          {revealed ? (
            <p className="answer-text">{question.answer}</p>
          ) : (
            <p className="answer-placeholder">Answer hidden</p>
          )}
        </div>

        {revealed && question.note && (
          <p className="note">💡 {question.note}</p>
        )}

        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => setRevealed((r) => !r)}
          >
            {revealed ? "Hide answer" : "Show hint / answer"}
          </button>
          <button className="btn btn-ghost" onClick={() => next(filter)}>
            Shuffle (new question)
          </button>
        </div>

        <p className="hotkeys">
          <kbd>Space</kbd> reveal · <kbd>N</kbd> new question
        </p>
      </main>

      <footer className="footer">
        All 12 tenses · verbal, nominal &amp; passive · {`+ / − / ? / WH`}
      </footer>
    </div>
  );
}
