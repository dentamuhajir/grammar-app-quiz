import { useCallback, useRef, useState, type ReactNode } from "react";
import { checkAnswer, type CheckResult } from "../grammar/check";
import {
  DEFAULT_MULTI_FILTER,
  BEGINNER_FILTER,
  displayCap,
  createQuestionCycle,
  quizCombinations,
  type MultiQuizFilter,
} from "../grammar/generator";
import {
  FORM_LABELS,
  MODE_LABELS,
  TENSE_LABELS,
  TENSE_ORDER,
} from "../grammar/labels";
import { implicitContextCue, sentenceGuide } from "../grammar/explanations";
import type { ClauseCues, Question } from "../grammar/types";
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
import { useAutoResizeTextarea } from "./useAutoResizeTextarea";
import { SwipeGuide } from "./SwipeGuide";
import { SentenceMaterial } from "./SentenceMaterial";

/** The chips shown as the puzzle prompt. */
function PromptChips({ q }: { q: Question }) {
  if (q.mode === "passive") {
    return (
      <div className="prompt">
        <span className="prompt-label">
          {q.whWord
            ? "Buat pertanyaan passive voice dengan kata tanya berikut:"
            : "Ubah kalimat ini menjadi passive voice:"}
        </span>
        {q.whWord && <span className="chip chip-wh">{q.whWord}</span>}
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

function RelativePrompt({ q, relative }: { q: Question; relative: NonNullable<Question["relativeClause"]> }) {
  const mainCues: ClauseCues = {
    wh: q.whWord, subject: relative.antecedent,
    verb: q.mode === "nominal" ? "be" : q.verb!.base,
    complement: q.mode === "passive" ? `by ${q.subject.text}` : q.complement?.text ?? q.verb?.object,
    time: q.timeSignal,
  };
  const rows = [
    { label: "Kalimat utama", detail: [TENSE_LABELS[q.tense], MODE_LABELS[q.mode].split(" (")[0], FORM_LABELS[q.form].split(" (")[0]].join(" · "), cues: mainCues },
    { label: "Sisipan", detail: TENSE_LABELS[relative.tense], cues: relative.cues },
  ];
  return <ClausePrompt rows={rows} instruction={<>Rangkai satu kalimat. Apit informasi tambahan tentang <strong lang="en">{relative.antecedent}</strong> dengan dua koma.</>} />;
}

function ClauseChips({ cues }: { cues: ClauseCues }) {
  const chips = [
    { text: cues.wh, role: "wh" },
    { text: cues.subject, role: "subject" },
    { text: cues.verb, role: "cue", plus: Boolean(cues.subject) },
    { text: cues.complement, role: "object", plus: true },
    { text: cues.time, role: "time" },
  ];
  return <ul lang="en">{chips.filter(chip => chip.text).map(chip => <li key={chip.role}>
    {chip.plus && <span className="plus" aria-hidden="true">+</span>}
    <span className={`chip chip-${chip.role}`}>{chip.text}</span>
  </li>)}</ul>;
}

function ClausePrompt({ rows, instruction }: { rows: { label: string; detail: string; cues: ClauseCues }[]; instruction: ReactNode }) {
  return <section aria-label="Bahan kalimat" className="relative-prompt">
    <p>{instruction}</p>
    {rows.map(row => <section key={row.label} aria-label={row.label}>
      <header><strong>{row.label}</strong><small>{row.detail}</small></header>
      <ClauseChips cues={row.cues} />
    </section>)}
  </section>;
}

function filterSummary(f: MultiQuizFilter): string {
  if (f.focus === "reasonClause") return `Sebab dan alasan · ${f.tenses.map(tense => TENSE_LABELS[tense]).join(" / ")}`;
  const parts = [
    f.tenses.length === TENSE_ORDER.length ? "Semua tense"
      : f.tenses.length === 1 ? TENSE_LABELS[f.tenses[0]] : `${f.tenses.length} tense`,
    f.modes.length === 3 ? "Semua jenis"
      : f.modes.length === 1 ? MODE_LABELS[f.modes[0]].replace(/\s*\(.*\)/, "") : `${f.modes.length} jenis`,
    f.forms.length === 4 ? "Semua bentuk"
      : f.forms.length === 1 ? FORM_LABELS[f.forms[0]].replace(/\s*\(.*\)/, "") : `${f.forms.length} bentuk`,
  ];
  if (f.focus) parts.unshift("Relative clause");
  return parts.join(" · ");
}

export function SentencePractice({ onExplore }: { onExplore: (question: Question) => void }) {
  const [filter, setFilter] = useState<MultiQuizFilter>(BEGINNER_FILTER);
  const generalFilter = useRef(BEGINNER_FILTER);
  const cycle = useRef<ReturnType<typeof createQuestionCycle> | null>(null);
  if (!cycle.current) cycle.current = createQuestionCycle(BEGINNER_FILTER);
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
  const [materialOpen, setMaterialOpen] = useState(false);
  const [practiceMode, setPracticeMode] = useState(loadPracticeMode);
  const [modeOpen, setModeOpen] = useState(false);
  const [showWordHint, setShowWordHint] = useState(false);
  const [hasIncorrectAttempt, setHasIncorrectAttempt] = useState(false);
  const answerRef = useAutoResizeTextarea(input);
  const relative = question.relativeClause;
  const reason = question.reasonClause;
  const focusLabel = relative ? "Relative clause" : reason ? "Sebab dan alasan" : undefined;
  const translation = practiceMode === "translate" ? sentenceTranslation(question) : null;
  const relativeFeedback = relative && <p className="basics-explanation">
    <strong lang="en">{relative.pronoun}</strong> merujuk pada <strong lang="en">{relative.antecedent}</strong>, {relative.pronoun === "who" ? "orang" : "benda"} yang dijelaskan dalam sisipan.
  </p>;
  const acceptedClause = result?.correct && relative?.alternatives.find(clause => result.normalizedAnswer.includes(clause.toLowerCase()));
  const fronted = result?.correct && reason && result.normalizedAnswer.startsWith("because ");
  const reviewed = fronted ? { ...question, answer: reason.frontedAnswer } : acceptedClause && relative ? { ...question, answer: question.answer.replace(relative.clause, acceptedClause),
    relativeClause: { ...relative, clause: acceptedClause } } : question;

  const next = useCallback(() => {
    setQuestion(cycle.current!());
    setInput("");
    setResult(null);
    setRevealed(false);
    setPraise("");
    setGuideOpen(false);
    setMaterialOpen(false);
    setShowWordHint(false);
    setHasIncorrectAttempt(false);
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
    if (!r.correct) setHasIncorrectAttempt(true);
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

  function applyFilter(selected: MultiQuizFilter, mode: SentencePracticeMode, general?: MultiQuizFilter) {
    const activeFilter = mode === "arrange" ? selected : { ...selected, focus: undefined };
    cycle.current = createQuestionCycle(activeFilter);
    if (activeFilter.focus !== "reasonClause") generalFilter.current = activeFilter;
    else if (general && quizCombinations(general).length) generalFilter.current = general;
    setFilter(activeFilter);
    selectPracticeMode(mode);
    next();
    setFiltersOpen(false);
  }

  const { swipeHandlers, cardStyle, cardClass, swipeDirection, swipeProgress, swipeBlocked } = useSwipeCard({
    animated: true,
    questionKey: question.answer,
    canSkip: !input.trim() || solved,
    onSwipeLeft: next,
    onSwipeRight: () => setMaterialOpen(true),
  });

  return (
    <>
      <Confetti fire={confetti} />

      <div className="qa-mode-switch" role="group" aria-label="Pilihan latihan">
        <button type="button" className="btn btn-ghost" onClick={() => applyFilter(BEGINNER_FILTER, practiceMode)}>Mulai dari dasar</button>
        <button type="button" className="btn btn-ghost" onClick={() => applyFilter(DEFAULT_MULTI_FILTER, practiceMode)}>Latihan campuran</button>
      </div>

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

      <div className="swipe-card-surface" {...swipeHandlers}>
        <main
          className={`card ${cardClass}`}
          style={cardStyle}
        >
          <div className="tags">
            {focusLabel && <span className="tag tag-tense">{focusLabel}</span>}
            {showBadges && !focusLabel && (
              <button
                type="button"
                className="tag tag-tense tag-clickable"
                onClick={() => setMaterialOpen(true)}
                title="Buka materi tense dan pola kalimat"
              >
                {TENSE_LABELS[question.tense]}{" "}
                <span className="tag-info-icon" aria-hidden="true">
                  ⓘ
                </span>
              </button>
            )}
            {showBadges && !focusLabel && (
              <span className="tag tag-mode">
                {MODE_LABELS[question.mode].replace(/\s*\(.*\)/, "")}
              </span>
            )}
            {showBadges && !focusLabel && (
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

          {reason ? <ClausePrompt instruction={<>Hubungkan kejadian dan alasannya dengan <strong lang="en">because</strong>.</>} rows={[
            { label: "Kejadian", detail: TENSE_LABELS[question.tense], cues: { subject: question.subject.text, verb: question.verb!.base, complement: question.verb!.object } },
            { label: "Alasan", detail: TENSE_LABELS[question.tense], cues: reason.cues },
          ]} /> : relative ? <RelativePrompt q={question} relative={relative} /> : practiceMode === "translate" ? <section className="translation-prompt" aria-label="Terjemahkan ke bahasa Inggris">
            <p className="basics-prompt" lang="id">
              {translation?.text ?? "Terjemahan soal ini belum tersedia. Buka petunjuk kata untuk melanjutkan latihan."}
            </p>
            <p className="note">{translation?.context ?? implicitContextCue(question)}</p>
            <p className="note">Gunakan {question.mode === "nominal" ? "be" : question.verb?.base} sesuai konteks kalimat.</p>
            {!solved && hasIncorrectAttempt && <button type="button" className="btn btn-ghost" aria-expanded={showWordHint}
              onClick={() => setShowWordHint(value => !value)}>
              {showWordHint ? "Sembunyikan petunjuk kata" : "Petunjuk kata"}
            </button>}
            {showWordHint && <>
              <PromptChips q={question} />
            </>}
          </section> : <PromptChips q={question} />}

          <div className="sentence-answer-block">
            <label className="sentence-answer-label" htmlFor="sentence-answer">Jawaban Anda</label>
            <form className={`qa-composer sentence-composer ${result && !result.empty ? result.correct ? "is-correct" : "is-incorrect" : ""}`}
              onSubmit={event => { event.preventDefault(); check(); }}>
              <textarea
                ref={answerRef}
                rows={2}
                value={input}
                id="sentence-answer"
                aria-label="Jawabanmu"
                placeholder="Tulis kalimat dalam bahasa Inggris…"
                readOnly={solved}
                aria-invalid={Boolean(result && !result.correct && !result.empty)}
                aria-describedby={result?.empty ? "sentence-empty-error" : undefined}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                onChange={(e) => {
                  setInput(e.target.value);
                  if (result) setResult(null);
                  setPraise("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    check();
                  }
                }}
              />
              {!solved && <div className="qa-composer-tools">
                <VoiceInputBar
                compact
                value={input}
                disabled={solved}
                onChange={(nextVal) => {
                  setInput(nextVal);
                  if (result) setResult(null);
                  setPraise("");
                }}
                />
                <button type="submit" className="btn btn-primary qa-send">
                  Periksa jawaban <span aria-hidden="true">↗</span>
                </button>
              </div>}
            </form>
          </div>

          {!solved && hasIncorrectAttempt && !focusLabel && practiceMode !== "translate" && <details key={question.answer} className="sentence-start-hint">
            <summary>Petunjuk</summary>
            <p className="sentence-formula">{sentenceGuide(question).formula}</p>
          </details>}

          {result?.correct && (
            <div className="feedback feedback-ok" role="status">
              <span className="feedback-title">
                <SuccessBadge />
                <span>{praise}</span>
              </span>
              <SentencePlayback text={practiceMode === "translate" ? input.trim() : reviewed.answer} question={reviewed} />
              {relativeFeedback}
              {reason && <p className="basics-explanation"><strong lang="en">Because {reason.clause}</strong> menjelaskan mengapa kejadian itu terjadi.
                {fronted && !input.includes(",") && " Saat alasan ditulis di awal, tambahkan koma sebelum klausa utama."}</p>}
              {relative && input.split(",").length < 3 && <p className="basics-explanation">
                Susunan katanya tepat. Saat menulis, apit sisipan dengan dua koma seperti pada contoh di atas.
              </p>}
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
            <p id="sentence-empty-error" className="hint hint-plain" role="status">
              Tulis kalimatmu terlebih dahulu, lalu periksa jawabannya.
            </p>
          )}

          {revealed && !result?.correct && (
            <div className="feedback feedback-reveal">
              <strong>Contoh jawaban</strong>
              <SentencePlayback text={question.answer} question={question} />
              {relativeFeedback}
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

          {!solved && hasIncorrectAttempt && <button type="button" className="inline-popup-link"
            onClick={() => setRevealed(true)}>Lihat contoh jawaban</button>}
          {solved && <div className="actions">
            <button type="button" className="btn btn-primary" onClick={next}>Soal berikutnya →</button>
          </div>}

        </main>
        <SwipeGuide direction={swipeDirection} progress={swipeProgress} blocked={swipeBlocked} />
      </div>

      {filtersOpen && <SentenceFilters
        filter={filter}
        generalFilter={generalFilter.current}
        practiceMode={practiceMode}
        onClose={() => setFiltersOpen(false)}
        onApply={applyFilter}
      />}

      <BottomSheet open={modeOpen} closeButtonOnly onClose={() => setModeOpen(false)} title="Mode latihan">
        <PracticeModePicker value={practiceMode} onChange={mode => {
          if (filter.focus && mode !== "arrange") applyFilter(filter.focus === "reasonClause" ? generalFilter.current : filter, mode);
          else selectPracticeMode(mode);
          setModeOpen(false);
        }} />
      </BottomSheet>

      <BottomSheet
        open={materialOpen}
        closeButtonOnly
        onClose={() => setMaterialOpen(false)}
        title="Materi kalimat"
      >
        <SentenceMaterial question={reviewed} solved={solved} attempted={hasIncorrectAttempt}
          hint={result && !result.correct && !result.empty ? result.hint : undefined}
          onExplore={selected => { setMaterialOpen(false); onExplore(selected); }} />
      </BottomSheet>

      <BottomSheet
        open={guideOpen}
        closeButtonOnly
        onClose={() => setGuideOpen(false)}
        title={solved ? "Rumus & Penjelasan Jawaban" : "Rumus & Pola Kalimat"}
      >
        <SentenceExplanation
          key={question.answer}
          question={reviewed}
          solved={solved}
          onExplore={() => { setGuideOpen(false); onExplore(question); }}
        />
      </BottomSheet>

    </>
  );
}
