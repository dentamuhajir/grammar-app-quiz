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
import { WRITING_PACKS } from "../grammar/writingPacks";
import { useWritingAttempt } from "./useWritingAttempt";
import { SwipeGuide } from "./SwipeGuide";

type WritingLink = { onWrite: (lessonId: string) => void };

const TOPIC_GROUPS: { label: string; topics: BasicsTopic[] }[] = [
  { label: "Kata benda & penentu", topics: ["articles", "plurals", "pronouns", "determiners", "quantifiers"] },
  { label: "Kata kerja & bentuknya", topics: ["gerunds", "modals", "habits", "causatives"] },
  { label: "Kata sifat, keterangan & preposisi", topics: ["adjectives", "comparatives", "prepositions"] },
  { label: "Kalimat & klausa", topics: ["questions", "relatives", "conjunctions", "conditionals", "reportedSpeech", "nounClauses", "participles", "inversion"] },
  { label: "Ungkapan", topics: ["collocations", "phrasalVerbs"] },
];

function BasicsSession({ filter, onWrite }: { filter: BasicsFilter } & WritingLink) {
  const [deck, setDeck] = useState<BasicsQuestion[]>(() => createDeck(filter));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<
    "empty" | "correct" | "incorrect" | "revealed" | null
  >(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [topicGuideOpen, setTopicGuideOpen] = useState(false);
  const [hasIncorrectAttempt, setHasIncorrectAttempt] = useState(false);
  const question = deck[index];
  const topicGuide = BASICS_TOPIC_GUIDES[question.topic];
  const finished = status === "correct" || status === "revealed";
  const attempt = useWritingAttempt();

  function record(outcome: "correct" | "incorrect" | "revealed") {
    if (question.skillId) {
      attempt.record({ lessonId: question.id, activity: "basics" }, outcome);
    }
    setStatus(outcome);
    if (outcome === "incorrect") setHasIncorrectAttempt(true);
  }

  function openHint() {
    if (!hasIncorrectAttempt && !finished) return;
    attempt.hint();
    setHintOpen(true);
  }

  function openMaterial() {
    attempt.hint();
    setTopicGuideOpen(true);
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
    setHasIncorrectAttempt(false);
  }

  function change(value: string) {
    setInput(value);
    setStatus(null);
  }

  const { swipeHandlers, cardStyle, cardClass, swipeDirection, swipeProgress, swipeBlocked } = useSwipeCard({
    animated: true,
    questionKey: question.id,
    canSkip: !input.trim() || finished,
    onSwipeLeft: next,
    onSwipeRight: openMaterial,
  });

  return (
    <>
      <div className="swipe-card-surface" {...swipeHandlers}>
        <main
          className={`card basics-card ${cardClass}`}
          style={cardStyle}
        >
          <div className="tags">
            <button
              type="button"
              className="tag tag-tense tag-clickable"
              onClick={openMaterial}
              title="Klik untuk melihat penjelasan & contoh topik ini"
            >
              {BASICS_LABELS[question.topic]}{" "}
              <span className="tag-info-icon" aria-hidden="true">
                ⓘ
              </span>
            </button>
            {(hasIncorrectAttempt || finished) && <button
              type="button"
              className="tag tag-hint-btn"
              onClick={openHint}
              title="Lihat petunjuk soal ini"
            >
              💡 Hint
            </button>}
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
            className="basics-answer-form"
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
            <div className="sentence-answer-block">
              <label className="sentence-answer-label" htmlFor="basics-answer">Jawaban Anda</label>
              <div className={`qa-composer basics-composer ${status === "correct" ? "is-correct" : status === "incorrect" ? "is-incorrect" : ""}`}>
                <input
                  id="basics-answer"
                  value={input}
                  readOnly={finished}
                  aria-label="Jawaban"
                  onChange={(event) => change(event.target.value)}
                  placeholder="Ketik kata atau frasa…"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-describedby="basics-question"
                  aria-invalid={status === "incorrect"}
                />
                {!finished && <div className="qa-composer-tools">
                  <button className="btn btn-primary qa-send" type="submit">
                    Periksa jawaban <span aria-hidden="true">↗</span>
                  </button>
                </div>}
              </div>
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
                  <p className="hint">{question.skillId ? question.hint : mistakeHint(question, input)}</p>
                  {!question.skillId && <p className="basics-explanation">{question.explanation}</p>}
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
                  {question.skillId && <button type="button" className="btn btn-primary"
                    onClick={() => onWrite(question.id)}>Pakai dalam kalimat</button>}
                </div>
              )}
            </div>
            {!finished && hasIncorrectAttempt && <button type="button" className="inline-popup-link"
              onClick={() => record("revealed")}>Lihat contoh jawaban</button>}
            {finished && <div className="actions basics-actions">
              <button className="btn btn-primary" type="submit">
                Soal berikutnya →
              </button>
            </div>}
          </form>
        </main>
        <SwipeGuide direction={swipeDirection} progress={swipeProgress} blocked={swipeBlocked} />
      </div>

      <BottomSheet
        open={hintOpen}
        closeButtonOnly
        onClose={() => setHintOpen(false)}
        title="Hint & Aturan Soal"
      >
        <div className="sheet-content-stack">
          <div className="tags">
            <span className="tag tag-tense">{BASICS_LABELS[question.topic]}</span>
            <span className="tag">{question.rule}</span>
          </div>
          <p className="note">💡 {question.hint}</p>
          {!finished && <button type="button" className="inline-popup-link" onClick={() => {
            record("revealed");
            setHintOpen(false);
          }}>Lihat contoh jawaban</button>}
          {finished && (
            <p className="basics-explanation">{question.explanation}</p>
          )}
        </div>
      </BottomSheet>

      <BottomSheet
        open={topicGuideOpen}
        closeButtonOnly
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
    filter === "all" ? "Campuran · semua topik" : filter in BASICS_LABELS
      ? BASICS_LABELS[filter as BasicsTopic] : WRITING_PACKS.find(pack => pack.skill === filter)?.label;

  return (
    <>
      <button
        type="button"
        className="filter-pill-bar"
        onClick={() => setFiltersOpen(true)}
      >
        <span className="filter-toggle-text">
          <span className="filter-toggle-label">Topik Grammar Practice</span>
          <span className="filter-toggle-summary">{summary}</span>
        </span>
        <span className="filter-pill-action">⚙ Pilih Topik</span>
      </button>
      <BasicsSession key={filter} filter={filter} onWrite={onWrite} />

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Pilih Topik Grammar Practice"
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
        </div>
        {TOPIC_GROUPS.map(group => <section key={group.label} className="topic-group">
          <h3 className="topic-group-heading">{group.label}</h3>
          <div className="topic-grid">
          {group.topics.map((topic) => (
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
        </section>)}
      </BottomSheet>
    </>
  );
}
