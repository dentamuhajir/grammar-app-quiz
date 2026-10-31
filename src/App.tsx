import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_FILTER,
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

/** Build the "prompt" (the puzzle) the learner tries to form in their head. */
function promptParts(q: Question): { subject: string; cue: string } {
  if (q.mode === "nominal") {
    return { subject: q.subject.text, cue: q.complement?.text ?? "" };
  }
  // verbal + passive both revolve around a verb's base form
  return { subject: q.subject.text, cue: q.verb?.base ?? "" };
}

export default function App() {
  const [filter, setFilter] = useState<QuizFilter>(DEFAULT_FILTER);
  const [question, setQuestion] = useState<Question>(() =>
    generateQuestion(DEFAULT_FILTER),
  );
  const [revealed, setRevealed] = useState(false);

  const next = useCallback(
    (f: QuizFilter) => {
      setQuestion(generateQuestion(f));
      setRevealed(false);
    },
    [],
  );

  // Keyboard: Space/Enter reveals, "n" gets a new question.
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

  const { subject, cue } = useMemo(() => promptParts(question), [question]);

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

      <main className="card">
        <div className="tags">
          <span className="tag tag-tense">{TENSE_LABELS[question.tense]}</span>
          <span className="tag tag-mode">{MODE_LABELS[question.mode]}</span>
          <span className="tag tag-form">{FORM_LABELS[question.form]}</span>
        </div>

        <div className="prompt">
          <span className="chip chip-subject">{subject}</span>
          <span className="plus">+</span>
          <span className="chip chip-cue">{cue}</span>
          {question.whWord && (
            <>
              <span className="plus">·</span>
              <span className="chip chip-wh">{question.whWord}</span>
            </>
          )}
        </div>

        <div className={`answer ${revealed ? "shown" : "hidden"}`}>
          {revealed ? (
            <p className="answer-text">{question.answer}</p>
          ) : (
            <p className="answer-placeholder">Answer hidden</p>
          )}
        </div>

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
        Covers all 12 tenses · verbal, nominal &amp; passive · {`+ / − / ? / WH`}
      </footer>
    </div>
  );
}
