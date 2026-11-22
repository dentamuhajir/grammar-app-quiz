import { useCallback, useRef, useState } from "react";
import { checkAnswer, type CheckResult } from "../grammar/check";
import {
  DEFAULT_MULTI_FILTER,
  displayCap,
  createQuestionCycle,
  type MultiQuizFilter,
} from "../grammar/generator";
import {
  FORM_LABELS,
  MODE_LABELS,
  TENSE_LABELS,
  TENSE_ORDER,
} from "../grammar/labels";
import { implicitContextCue } from "../grammar/explanations";
import type { Question } from "../grammar/types";
import { SentenceFilters } from "./SentenceFilters";
import { SentenceExplanation } from "./SentenceExplanation";
import { BottomSheet } from "./BottomSheet";
import { useSwipeCard } from "./useSwipeCard";
import { Confetti } from "../ui/Confetti";
import { DiffView } from "../ui/DiffView";
import { BookIcon, SuccessBadge } from "./FeedbackIcons";
import { SentencePlayback } from "./SentencePlayback";
import { VoiceInputBar } from "./VoiceInputBar";
import { loadPracticeMode, savePracticeMode, PRACTICE_MODE_LABELS, type SentencePracticeMode } from "../grammar/practiceMode";
import { sentenceTranslation, checkTranslationAnswer } from "../grammar/translation";
import { PracticeModePicker } from "./PracticeModePicker";

/** The chips shown as the puzzle prompt. */
function PromptChips({ q }: { q: Question }) {
  if (q.mode === "passive") {
    return (
      <div className="prompt">
        <span className="prompt-label">
          Ubah kalimat ini menjadi passive voice:
        </span>
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
    (q.whWord === "How" && ["fast", "well", "hard", "smoothly"].includes(object ?? ""));

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

function filterSummary(f: MultiQuizFilter): string {
  const parts = [
    f.tenses.length === TENSE_ORDER.length ? "Semua tense"
      : f.tenses.length === 1 ? TENSE_LABELS[f.tenses[0]] : `${f.tenses.length} tense`,
    f.modes.length === 3 ? "Semua jenis"
      : f.modes.length === 1 ? MODE_LABELS[f.modes[0]].replace(/\s*\(.*\)/, "") : `${f.modes.length} jenis`,
    f.forms.length === 4 ? "Semua bentuk"
      : f.forms.length === 1 ? FORM_LABELS[f.forms[0]].replace(/\s*\(.*\)/, "") : `${f.forms.length} bentuk`,
  ];
  return parts.join(" · ");
}

export function SentencePractice({ onExplore }: { onExplore: (question: Question) => void }) {
  const [filter, setFilter] = useState<MultiQuizFilter>(DEFAULT_MULTI_FILTER);
  const cycle = useRef<ReturnType<typeof createQuestionCycle> | null>(null);
  if (!cycle.current) cycle.current = createQuestionCycle(DEFAULT_MULTI_FILTER);
  const [question, setQuestion] = useState<Question>(() =>
    cycle.current!(),
  );
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [praise, setPraise] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [practiceMode, setPracticeMode] = useState(loadPracticeMode);
  const [modeOpen, setModeOpen] = useState(false);
  const [showWordHint, setShowWordHint] = useState(false);
  const translation = practiceMode === "translate" ? sentenceTranslation(question) : null;

  const next = useCallback(() => {
    setQuestion(cycle.current!());
    setInput("");
    setResult(null);
    setRevealed(false);
    setPraise("");
    setGuideOpen(false);
    setShowWordHint(false);
  }, []);

  const solved = revealed || result?.correct === true;
  const showBadges = practiceMode === "arrange" || solved;

  const check = useCallback(() => {
    if (solved) {
      next();
      return;
    }
    const r = practiceMode === "translate" ? checkTranslationAnswer(question, input) : checkAnswer(question, input);
    if (r.empty) {
      setResult(r);
      return;
    }
    setResult(r);
    if (r.correct) {
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      setConfetti((c) => c + 1);
    }
  }, [input, next, practiceMode, question, solved]);

  function selectPracticeMode(mode: SentencePracticeMode) {
    setPracticeMode(mode);
    savePracticeMode(mode);
    setShowWordHint(false);
  }

  function applyFilter(selected: MultiQuizFilter, mode: SentencePracticeMode) {
    cycle.current = createQuestionCycle(selected);
    setFilter(selected);
    selectPracticeMode(mode);
    next();
    setFiltersOpen(false);
  }

  const { swipeHandlers, cardStyle, cardClass } = useSwipeCard({
    onSwipeLeft: next,
    onSwipeRight: () => setGuideOpen(true),
  });

  return (
    <>
      <Confetti fire={confetti} />

      <button
        type="button"
        className="filter-pill-bar"
        onClick={() => setFiltersOpen(true)}
      >
        <span className="filter-toggle-text">
          <span className="filter-toggle-label">Filter Latihan</span>
          <span className="filter-toggle-summary">{filterSummary(filter)}</span>
        </span>
        <span className="filter-pill-action">⚙ Ubah</span>
      </button>

      <main
        className={`card ${cardClass}`}
        style={cardStyle}
        {...swipeHandlers}
      >
        <div className="tags">
          {showBadges && (
            <button
              type="button"
              className="tag tag-tense tag-clickable"
              onClick={() => onExplore(question)}
              title="Klik untuk membuka Tenses Explorer & Visualisasi Waktu"
            >
              {TENSE_LABELS[question.tense]}{" "}
              <span className="tag-info-icon" aria-hidden="true">
                ⓘ
              </span>
            </button>
          )}
          {showBadges && (
            <span className="tag tag-mode">
              {MODE_LABELS[question.mode].replace(/\s*\(.*\)/, "")}
            </span>
          )}
          {showBadges && (
            <span className="tag tag-form">
              {FORM_LABELS[question.form].replace(/\s*\(.*\)/, "")}
            </span>
          )}
          {showBadges && question.rare && (
            <span className="tag tag-rare">⚠ jarang digunakan</span>
          )}
          <button
            type="button"
            className="tag tag-implicit-toggle"
            aria-haspopup="dialog"
            aria-expanded={modeOpen}
            onClick={() => setModeOpen(true)}
          >
            Mode · {PRACTICE_MODE_LABELS[practiceMode]} ▾
          </button>
        </div>

        {practiceMode === "context" && (
          <p className="implicit-context-box">
            🧭 <strong>{implicitContextCue(question)}</strong>
          </p>
        )}

        {practiceMode === "translate" ? <section className="translation-prompt" aria-label="Terjemahkan ke bahasa Inggris">
          <p className="basics-prompt" lang="id">
            {translation?.text ?? "Terjemahan soal ini belum tersedia. Buka petunjuk kata untuk melanjutkan latihan."}
          </p>
          <p className="note">{translation?.context ?? implicitContextCue(question)}</p>
          <button type="button" className="btn btn-ghost" aria-expanded={showWordHint}
            onClick={() => setShowWordHint(value => !value)}>
            {showWordHint ? "Sembunyikan petunjuk kata" : "Petunjuk kata"}
          </button>
          {showWordHint && <PromptChips q={question} />}
        </section> : <PromptChips q={question} />}

        <div className="answer-input">
          <input
            type="text"
            value={input}
            id="sentence-answer"
            aria-label="Jawabanmu"
            placeholder="Tulis atau ucapkan kalimat lengkap dalam bahasa Inggris…"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className={
              result && !result.empty ? (result.correct ? "ok" : "bad") : ""
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
          <VoiceInputBar
            value={input}
            disabled={solved}
            onChange={(nextVal) => {
              setInput(nextVal);
              if (result) setResult(null);
              setPraise("");
            }}
          />
        </div>

        {result?.correct && (
          <div className="feedback feedback-ok" role="status">
            <span className="feedback-title">
              <SuccessBadge />
              <span>{praise}</span>
            </span>
            <SentencePlayback text={practiceMode === "translate" ? input.trim() : question.answer} question={question} />
            {result.alternativeOrder && (
              <p className="basics-explanation">
                Letak keterangan waktu di awal kalimat juga diterima. Di atas
                adalah susunan acuan.
              </p>
            )}
            <button
              type="button"
              className="inline-popup-link"
              onClick={() => setGuideOpen(true)}
            >
              <BookIcon />
              <span>Lihat analisis &amp; bagian kalimat →</span>
            </button>
          </div>
        )}

        {result && !result.correct && !result.empty && (
          <div className="feedback feedback-bad" role="status">
            <DiffView diff={result.diff} />
            <p className="hint">💡 {result.hint}</p>
          </div>
        )}

        {result?.empty && (
          <p className="hint hint-plain">
            Tulis kalimatmu terlebih dahulu, lalu periksa jawabannya.
          </p>
        )}

        {revealed && !result?.correct && (
          <div className="feedback feedback-reveal">
            <SentencePlayback text={question.answer} question={question} />
            <button
              type="button"
              className="inline-popup-link"
              onClick={() => setGuideOpen(true)}
            >
              <BookIcon />
              <span>Lihat mengapa bentuknya begitu →</span>
            </button>
          </div>
        )}

        <div className="actions">
          <button className="btn btn-primary" onClick={check}>
            {solved ? "Soal berikutnya →" : "Periksa jawaban"}
          </button>
          {!solved && (
            <button
              className="btn btn-ghost"
              onClick={() => setRevealed(true)}
            >
              Lihat jawaban
            </button>
          )}
        </div>

        <p className="swipe-hint">
          ← Geser kiri: soal baru · Geser kanan: rumus →
        </p>
      </main>

      {filtersOpen && <SentenceFilters
        filter={filter}
        practiceMode={practiceMode}
        onClose={() => setFiltersOpen(false)}
        onApply={applyFilter}
      />}

      <BottomSheet open={modeOpen} closeButtonOnly onClose={() => setModeOpen(false)} title="Mode latihan">
        <PracticeModePicker value={practiceMode} onChange={mode => {
          selectPracticeMode(mode);
          setModeOpen(false);
        }} />
      </BottomSheet>

      <BottomSheet
        open={guideOpen}
        closeButtonOnly
        onClose={() => setGuideOpen(false)}
        title={solved ? "Rumus & Penjelasan Jawaban" : "Rumus & Pola Kalimat"}
      >
        <SentenceExplanation
          key={question.answer}
          question={question}
          solved={solved}
          onExplore={() => { setGuideOpen(false); onExplore(question); }}
        />
      </BottomSheet>

    </>
  );
}
