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
import { BottomSheet } from "./BottomSheet";
import { useSwipeCard } from "./useSwipeCard";
import { Confetti } from "../ui/Confetti";
import { DiffView } from "../ui/DiffView";
import { BookIcon, SuccessBadge } from "./FeedbackIcons";
import { SpokenSentence } from "./SpokenSentence";

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

function filterSummary(f: QuizFilter): string {
  const parts = [
    f.tense === "all" ? "Semua tense" : TENSE_LABELS[f.tense],
    f.mode === "all"
      ? "Semua jenis"
      : MODE_LABELS[f.mode].replace(/\s*\(.*\)/, ""),
    f.form === "all"
      ? "Semua bentuk"
      : FORM_LABELS[f.form].replace(/\s*\(.*\)/, ""),
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const next = useCallback((f: QuizFilter) => {
    setQuestion(generateQuestion(f));
    setInput("");
    setResult(null);
    setRevealed(false);
    setPraise("");
    setGuideOpen(false);
  }, []);

  const solved = revealed || result?.correct === true;

  const check = useCallback(() => {
    if (solved) {
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
  }, [filter, input, next, question, solved]);

  function updateFilter(patch: Partial<QuizFilter>) {
    const merged = { ...filter, ...patch };
    setFilter(merged);
    next(merged);
  }

  const { swipeHandlers, cardStyle, cardClass } = useSwipeCard({
    onSwipeLeft: () => next(filter),
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
          <span className="tag tag-tense">{TENSE_LABELS[question.tense]}</span>
          <span className="tag tag-mode">
            {MODE_LABELS[question.mode].replace(/\s*\(.*\)/, "")}
          </span>
          <span className="tag tag-form">
            {FORM_LABELS[question.form].replace(/\s*\(.*\)/, "")}
          </span>
          {question.rare && (
            <span className="tag tag-rare">⚠ jarang digunakan</span>
          )}
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
        </div>

        {result?.correct && (
          <div className="feedback feedback-ok" role="status">
            <span className="feedback-title">
              <SuccessBadge />
              <span>{praise}</span>
            </span>
            <SpokenSentence text={question.answer} />
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
            <SpokenSentence text={question.answer} />
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

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter Sentence Practice"
      >
        <div className="sheet-form">
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
            <span>Jenis Kalimat</span>
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
            <span>Bentuk Kalimat</span>
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

          <label className="rare-toggle">
            <input
              type="checkbox"
              checked={filter.includeRare}
              onChange={(e) => updateFilter({ includeRare: e.target.checked })}
            />
            <span>Sertakan bentuk langka &amp; kata kerja keadaan</span>
          </label>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFiltersOpen(false)}
          >
            Terapkan Filter
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title={solved ? "Rumus & Penjelasan Jawaban" : "Rumus & Pola Kalimat"}
      >
        <SentenceExplanation
          key={question.answer}
          question={question}
          solved={solved}
        />
      </BottomSheet>
    </>
  );
}
