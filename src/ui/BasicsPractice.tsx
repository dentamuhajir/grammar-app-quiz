import { useState } from "react";
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
import { BottomSheet } from "./BottomSheet";
import { SuccessBadge } from "./FeedbackIcons";
import { useSwipeCard } from "./useSwipeCard";

function BasicsSession({ filter }: { filter: BasicsFilter }) {
  const [deck, setDeck] = useState<BasicsQuestion[]>(() => createDeck(filter));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<
    "empty" | "correct" | "incorrect" | "revealed" | null
  >(null);
  const [hintOpen, setHintOpen] = useState(false);
  const question = deck[index];
  const finished = status === "correct" || status === "revealed";

  function next() {
    if (index + 1 < deck.length) setIndex(index + 1);
    else {
      setDeck(createDeck(filter, question.id));
      setIndex(0);
    }
    setInput("");
    setStatus(null);
    setHintOpen(false);
  }

  function change(value: string) {
    setInput(value);
    setStatus(null);
  }

  const { swipeHandlers, cardStyle, cardClass } = useSwipeCard({
    onSwipeLeft: next,
    onSwipeRight: () => setHintOpen(true),
  });

  return (
    <>
      <main
        className={`card basics-card ${cardClass}`}
        style={cardStyle}
        {...swipeHandlers}
      >
        <div className="tags">
          <span className="tag tag-tense">{BASICS_LABELS[question.topic]}</span>
        </div>

        {question.context && (
          <p className="basics-context">{question.context}</p>
        )}
        <p className="basics-prompt" id="basics-question">
          {question.prompt}
        </p>
        {question.cue && (
          <p className="basics-cue">
            Kata dasar: <strong>{question.cue}</strong>
          </p>
        )}

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
                status === "correct"
                  ? "ok"
                  : status === "incorrect"
                    ? "bad"
                    : ""
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
                {status === "correct" ? (
                  <span className="feedback-title">
                    <SuccessBadge />
                    <span>Benar!</span>
                  </span>
                ) : (
                  <strong>Jawaban dan penjelasan</strong>
                )}
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
                onClick={() => setStatus("revealed")}
              >
                Lihat jawaban
              </button>
            )}
          </div>
        </form>
        <p className="swipe-hint">
          ← Geser kiri: soal baru · Geser kanan: hint →
        </p>
      </main>

      <BottomSheet
        open={hintOpen}
        onClose={() => setHintOpen(false)}
        title="Hint & Aturan Grammar"
      >
        <div className="sheet-content-stack">
          <div className="tags">
            <span className="tag tag-tense">{BASICS_LABELS[question.topic]}</span>
            <span className="tag">{question.rule}</span>
          </div>
          <p className="note">💡 {question.hint}</p>
          {finished && (
            <p className="basics-explanation">{question.explanation}</p>
          )}
        </div>
      </BottomSheet>
    </>
  );
}

export function BasicsPractice() {
  const [filter, setFilter] = useState<BasicsFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const summary =
    filter === "all" ? "Campuran · semua topik" : BASICS_LABELS[filter];

  return (
    <>
      <button
        type="button"
        className="filter-pill-bar"
        onClick={() => setFiltersOpen(true)}
      >
        <span className="filter-toggle-text">
          <span className="filter-toggle-label">Topik Grammar Basics</span>
          <span className="filter-toggle-summary">{summary}</span>
        </span>
        <span className="filter-pill-action">⚙ Pilih Topik</span>
      </button>

      <BasicsSession key={filter} filter={filter} />

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Pilih Topik Grammar Basics"
      >
        <div className="topic-grid">
          <button
            type="button"
            className={`topic-pill ${filter === "all" ? "active" : ""}`}
            onClick={() => {
              setFilter("all");
              setFiltersOpen(false);
            }}
          >
            Campuran · semua topik
          </button>
          {(Object.keys(BASICS_LABELS) as BasicsTopic[]).map((topic) => (
            <button
              type="button"
              key={topic}
              className={`topic-pill ${filter === topic ? "active" : ""}`}
              onClick={() => {
                setFilter(topic);
                setFiltersOpen(false);
              }}
            >
              {BASICS_LABELS[topic]}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
