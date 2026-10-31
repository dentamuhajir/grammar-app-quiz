import { useCallback, useEffect, useRef, useState } from "react";
import { checkAnswer, type CheckResult } from "./grammar/check";
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
import { Confetti } from "./ui/Confetti";
import { DiffView } from "./ui/DiffView";

/** The chips shown as the puzzle prompt. */
function PromptChips({ q }: { q: Question }) {
  if (q.mode === "passive") {
    // Show the active sentence without the trailing time signal, then the time
    // as its own chip so the learner clearly sees it belongs in the answer.
    const activeCore =
      q.timeSignal && q.activePrompt?.endsWith(q.timeSignal)
        ? q.activePrompt.slice(0, -q.timeSignal.length).trim()
        : q.activePrompt;
    return (
      <div className="prompt">
        <span className="prompt-label">Rewrite this in the passive voice:</span>
        <span className="chip chip-active">{activeCore}</span>
        {q.timeSignal && <span className="chip chip-time">{q.timeSignal}</span>}
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

const PRAISE = [
  "Correct!",
  "Nice!",
  "Spot on!",
  "Perfect!",
  "You nailed it!",
  "Excellent!",
];

export default function App() {
  const [filter, setFilter] = useState<QuizFilter>(DEFAULT_FILTER);
  const [question, setQuestion] = useState<Question>(() =>
    generateQuestion(DEFAULT_FILTER),
  );
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [praise, setPraise] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const next = useCallback((f: QuizFilter) => {
    setQuestion(generateQuestion(f));
    setInput("");
    setResult(null);
    setRevealed(false);
    setPraise("");
    // focus the input for fast keyboard flow
    requestAnimationFrame(() => inputRef.current?.focus());
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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function updateFilter(patch: Partial<QuizFilter>) {
    const merged = { ...filter, ...patch };
    setFilter(merged);
    next(merged);
  }

  return (
    <div className="page">
      <Confetti fire={confetti} />

      <header className="header">
        <h1>Grammar App Quiz</h1>
        <p className="subtitle">
          Build the sentence, type it, and check your answer.
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

        <div className="answer-input">
          <input
            ref={inputRef}
            type="text"
            value={input}
            placeholder="Type the full sentence here…"
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
              if (result && !result.correct) setResult(null);
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
          </div>
        )}

        {result && !result.correct && !result.empty && (
          <div className="feedback feedback-bad" role="status">
            <DiffView diff={result.diff} />
            <p className="hint">💡 {result.hint}</p>
          </div>
        )}

        {result?.empty && (
          <p className="hint hint-plain">Type your sentence, then check it.</p>
        )}

        {revealed && !result?.correct && (
          <div className="feedback feedback-reveal">
            <span className="feedback-answer">{question.answer}</span>
          </div>
        )}

        {(revealed || result?.correct) && question.note && (
          <p className="note">💡 {question.note}</p>
        )}

        <div className="actions">
          <button className="btn btn-primary" onClick={check}>
            {result?.correct ? "Next question →" : "Check answer"}
          </button>
          {!result?.correct && (
            <button
              className="btn btn-ghost"
              onClick={() => setRevealed((r) => !r)}
            >
              {revealed ? "Hide answer" : "Reveal answer"}
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => next(filter)}>
            Skip / shuffle
          </button>
        </div>

        <p className="hotkeys">
          <kbd>Enter</kbd> check / next
        </p>
      </main>

      <footer className="footer">
        All 12 tenses · verbal, nominal &amp; passive · {`+ / − / ? / WH`}
      </footer>
    </div>
  );
}
