import { useState } from "react";
import { BASICS_LABELS } from "../grammar/labels";
import {
  BASICS_TOPIC_GUIDES,
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
import { SpokenSentence } from "./SpokenSentence";
import { useSwipeCard } from "./useSwipeCard";
import { FOR_SINCE } from "../grammar/forSince";
import { useForSinceAttempt } from "./useForSinceAttempt";

type WritingLink = { onWrite: (lessonId: string) => void };

function BasicsSession({ filter, onWrite }: { filter: BasicsFilter } & WritingLink) {
  const [deck, setDeck] = useState<BasicsQuestion[]>(() => createDeck(filter));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<
    "empty" | "correct" | "incorrect" | "revealed" | null
  >(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [topicGuideOpen, setTopicGuideOpen] = useState(false);
  const question = deck[index];
  const topicGuide = BASICS_TOPIC_GUIDES[question.topic];
  const finished = status === "correct" || status === "revealed";
  const attempt = useForSinceAttempt();

  function record(outcome: "correct" | "incorrect" | "revealed") {
    if (question.skillId === FOR_SINCE) {
      attempt.record({ lessonId: question.id, activity: "basics" }, outcome);
    }
    setStatus(outcome);
  }

  function openHint() {
    attempt.hint();
    setHintOpen(true);
  }

  function next() {
    attempt.reset();
    if (index + 1 < deck.length) setIndex(index + 1);
    else {
      setDeck(createDeck(filter, question.id));
      setIndex(0);
    }
    setInput("");
    setStatus(null);
    setHintOpen(false);
    setTopicGuideOpen(false);
  }

  function change(value: string) {
    setInput(value);
    setStatus(null);
  }

  const { swipeHandlers, cardStyle, cardClass } = useSwipeCard({
    onSwipeLeft: next,
    onSwipeRight: openHint,
  });

  return (
    <>
      <main
        className={`card basics-card ${cardClass}`}
        style={cardStyle}
        {...swipeHandlers}
      >
        <div className="tags">
          <button
            type="button"
            className="tag tag-tense tag-clickable"
            onClick={() => { attempt.hint(); setTopicGuideOpen(true); }}
            title="Klik untuk melihat penjelasan & contoh topik ini"
          >
            {BASICS_LABELS[question.topic]}{" "}
            <span className="tag-info-icon" aria-hidden="true">
              ⓘ
            </span>
          </button>
          <button
            type="button"
            className="tag tag-hint-btn"
            onClick={openHint}
            title="Lihat petunjuk soal ini"
          >
            💡 Hint
          </button>
        </div>

        {question.context && (
          <p className="basics-context">{question.context}</p>
        )}
        <p className="basics-prompt" id="basics-question">
          {question.prompt}
        </p>
        {question.cue && (
          <p className="basics-cue">
            {question.cue.includes("/") ? "Pilihan:" : "Kata dasar:"}{" "}
            <strong>{question.cue}</strong>
          </p>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (finished) next();
            else {
              const result = checkBasicsAnswer(question, input);
              if (result === "empty") setStatus(result);
              else record(result);
            }
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
                <p className="hint">{question.skillId === FOR_SINCE ? question.hint : mistakeHint(question, input)}</p>
                {question.skillId !== FOR_SINCE && <p className="basics-explanation">{question.explanation}</p>}
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
                <SpokenSentence text={completedSentence(question)} />
                {question.answer === NO_WORD && (
                  <span>Tanpa kata tambahan (ketik -).</span>
                )}
                <p className="basics-explanation">{question.explanation}</p>
                {question.skillId === FOR_SINCE && <button type="button" className="btn btn-primary"
                  onClick={() => onWrite(question.id)}>Pakai dalam kalimat</button>}
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
                onClick={() => record("revealed")}
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
        title="Hint & Aturan Soal"
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

      <BottomSheet
        open={topicGuideOpen}
        onClose={() => setTopicGuideOpen(false)}
        title={`Panduan: ${BASICS_LABELS[question.topic]}`}
      >
        <div className="sheet-content-stack topic-guide-stack">
          <p className="note">{topicGuide.summary}</p>

          <div className="topic-guide-section">
            <h4 className="topic-guide-heading">Aturan & Pola Penggunaan</h4>
            <div className="topic-guide-rules">
              {topicGuide.rules.map((rule) => (
                <div key={rule.label} className="topic-guide-rule-card">
                  <strong>{rule.label}</strong>
                  <p>{rule.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="topic-guide-section">
            <h4 className="topic-guide-heading">Contoh Kalimat</h4>
            <ul className="topic-guide-examples">
              {topicGuide.examples.map((ex) => (
                <li key={ex} className="topic-guide-example-item">
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

export function BasicsPractice({ onWrite }: WritingLink) {
  const [filter, setFilter] = useState<BasicsFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const summary =
    filter === "all" ? "Campuran · semua topik" : filter === FOR_SINCE ? "For / since" : BASICS_LABELS[filter];

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

      <BasicsSession key={filter} filter={filter} onWrite={onWrite} />

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
          <button type="button" className={`topic-pill ${filter === FOR_SINCE ? "active" : ""}`}
            onClick={() => { setFilter(FOR_SINCE); setFiltersOpen(false); }}>For / since · 6 soal</button>
        </div>
      </BottomSheet>
    </>
  );
}
