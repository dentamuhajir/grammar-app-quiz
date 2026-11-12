import { useEffect, useRef, useState } from "react";
import { BASICS_LABELS } from "../grammar/labels";
import {
  checkBasicsAnswer,
  completedSentence,
  createDeck,
  mistakeHint,
  NO_WORD,
  type BasicsFilter,
  type BasicsQuestion,
  type BasicsTopic,
} from "../grammar/basics/engine";

function BasicsSession({ filter }: { filter: BasicsFilter }) {
  const [deck, setDeck] = useState<BasicsQuestion[]>(() => createDeck(filter));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<
    "empty" | "correct" | "incorrect" | "revealed" | null
  >(null);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const question = deck[index];
  const finished = status === "correct" || status === "revealed";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function next() {
    if (index + 1 < deck.length) setIndex(index + 1);
    else {
      setDeck(createDeck(filter, question.id));
      setIndex(0);
    }
    setInput("");
    setStatus(null);
    setShowHint(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function change(value: string) {
    setInput(value);
    setStatus(null);
  }

  return (
    <main className="card basics-card">
      <div className="tags">
        <span className="tag tag-tense">{BASICS_LABELS[question.topic]}</span>
        {(showHint || finished) && <span className="tag">{question.rule}</span>}
      </div>
      <p className="basics-progress">
        Soal {index + 1} / {deck.length}
      </p>
      {question.context && <p className="basics-context">{question.context}</p>}
      <p className="basics-prompt" id="basics-question">
        {question.prompt}
      </p>
      {question.cue && (
        <p className="basics-cue">
          Kata dasar: <strong>{question.cue}</strong>
        </p>
      )}
      {showHint && !finished && <p className="note">💡 {question.hint}</p>}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (finished) next();
          else setStatus(checkBasicsAnswer(question, input));
        }}
      >
        <div className="answer-input">
          <input
            id="basics-answer"
            ref={inputRef}
            value={input}
            readOnly={finished}
            aria-label="Jawaban"
            onChange={(event) => change(event.target.value)}
            placeholder="Ketik jawaban…"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-describedby="basics-question"
            aria-invalid={status === "incorrect"}
            className={
              status === "correct" ? "ok" : status === "incorrect" ? "bad" : ""
            }
          />
        </div>
        <div aria-live="polite" aria-atomic="true">
          {status === "empty" && (
            <p className="hint hint-plain basics-feedback">
              Ketik jawaban terlebih dahulu.
            </p>
          )}
          {status === "incorrect" && (
            <div className="feedback feedback-bad basics-feedback">
              <strong>Belum tepat — coba lagi.</strong>
              <p className="hint">{mistakeHint(question, input)}</p>
              <p className="basics-explanation">{question.explanation}</p>
            </div>
          )}
          {finished && (
            <div
              className={`feedback basics-feedback ${
                status === "correct" ? "feedback-ok" : "feedback-reveal"
              }`}
            >
              <strong>
                {status === "correct" ? "Benar!" : "Jawaban dan penjelasan"}
              </strong>
              <span className="feedback-answer">
                {completedSentence(question)}
              </span>
              {question.answer === NO_WORD && (
                <span>Tanpa kata tambahan (ketik -).</span>
              )}
              <p className="basics-explanation">{question.explanation}</p>
            </div>
          )}
        </div>
        <div className="actions basics-actions">
          <button className="btn btn-primary" type="submit">
            {finished ? "Soal berikutnya →" : "Periksa jawaban"}
          </button>
          {!finished && (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setShowHint((h) => !h)}
            >
              {showHint ? "Sembunyikan hint" : "Hint"}
            </button>
          )}
          {!finished && (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setStatus("revealed")}
            >
              Lihat jawaban
            </button>
          )}
          {!finished && (
            <button className="btn btn-ghost" type="button" onClick={next}>
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

export function BasicsPractice() {
  const [filter, setFilter] = useState<BasicsFilter>("all");
  return (
    <>
      <section className="filters basics-filters" aria-label="Topik latihan">
        <label htmlFor="basics-topic">
          <span>Topik</span>
          <select
            id="basics-topic"
            value={filter}
            onChange={(event) => setFilter(event.target.value as BasicsFilter)}
          >
            <option value="all">Campuran · semua topik</option>
            {(Object.keys(BASICS_LABELS) as BasicsTopic[]).map((topic) => (
              <option value={topic} key={topic}>
                {BASICS_LABELS[topic]}
              </option>
            ))}
          </select>
        </label>
      </section>
      <BasicsSession key={filter} filter={filter} />
      <footer className="footer">
        Articles · Prepositions · Plurals · Gerund &amp; Infinitive · Relative
        Pronouns · Modals · Conjunctions
      </footer>
    </>
  );
}
