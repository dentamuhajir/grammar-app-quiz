import { useState } from "react";
import { packForLesson, type WritingResult } from "../grammar/writingPacks";
import type { ReviewSlot } from "../grammar/writingReview";
import { SentencePlayback } from "./SentencePlayback";
import { VoiceInputBar } from "./VoiceInputBar";
import { useWritingAttempt } from "./useWritingAttempt";
import { useAutoResizeTextarea } from "./useAutoResizeTextarea";

export interface WritingSession {
  lessonId: string;
  from: "basics" | "sentences";
  review?: ReviewSlot;
}

export function SkillWriting({ session, onExit }: { session: WritingSession; onExit: () => void }) {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<WritingResult | null>(null);
  const [hint, setHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hasIncorrectAttempt, setHasIncorrectAttempt] = useState(false);
  const answerRef = useAutoResizeTextarea(input);
  const attempt = useWritingAttempt();
  const pack = packForLesson(session.lessonId);
  const start = pack.lessons.findIndex(lesson => lesson.id === session.lessonId);
  const lesson = pack.lessons[(start + step) % pack.lessons.length];
  const slot: ReviewSlot = { lessonId: lesson.id, activity: "sentence" };
  const solved = revealed || result?.status === "correct";
  const series = !session.review && session.from === "sentences";
  const hasNext = series && step + 1 < pack.lessons.length;
  const back = session.from === "basics" ? "Kembali ke Grammar Practice" : "Kembali ke Sentence Practice";

  function edit(value: string) {
    setInput(value);
    setResult(null);
  }

  function submit() {
    if (solved) {
      if (!hasNext) return onExit();
      setStep(step + 1);
      edit("");
      setHint(false);
      setRevealed(false);
      setHasIncorrectAttempt(false);
      attempt.reset();
      return;
    }
    const checked = lesson.check(input);
    setResult(checked);
    if (checked.status === "retry") setHasIncorrectAttempt(true);
    if (checked.status !== "empty") {
      attempt.record(slot, checked.status === "correct" ? "correct" : "incorrect", session.review);
    }
  }

  function reveal() {
    attempt.record(slot, "revealed", session.review);
    setRevealed(true);
    setHint(false);
  }

  return <main className="card basics-card writing-practice" aria-label={`Sentence Practice · ${pack.label}`}>
    <div className="tags"><span className="tag tag-tense">{pack.label}</span>
      {series && <span className="tag">{step + 1} / {pack.lessons.length}</span>}
      {session.review && <span className="tag">Latihan ulang</span>}
    </div>
    <p className="basics-prompt">{lesson.situation}</p>
    <p className="basics-cue">{pack.instruction}.</p>
    <form className="writing-answer-form" onSubmit={event => { event.preventDefault(); submit(); }}>
      <div className="sentence-answer-block">
        <label className="sentence-answer-label" htmlFor="writing-answer">Jawaban Anda</label>
        <div className={`qa-composer sentence-composer ${result?.status === "correct" ? "is-correct" : result?.status === "retry" ? "is-incorrect" : ""}`}>
          <textarea ref={answerRef} id="writing-answer" rows={pack.multiline ? 3 : 2}
            aria-label="Kalimat Anda" value={input} onChange={e => edit(e.target.value)}
            readOnly={solved} autoComplete="off" autoCapitalize="off" spellCheck={false}
            aria-invalid={result?.status === "retry"}
            aria-describedby={result ? "writing-feedback" : undefined}
            placeholder={pack.multiline ? "Tulis dua kalimat dalam bahasa Inggris…" : "Tulis kalimat dalam bahasa Inggris…"}
            onKeyDown={event => {
              if (!pack.multiline && event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit();
              }
            }} />
          {!solved && <div className="qa-composer-tools">
            <VoiceInputBar compact value={input} multiline={pack.multiline} onChange={edit} />
            <button className="btn btn-primary qa-send" type="submit">
              Periksa jawaban <span aria-hidden="true">↗</span>
            </button>
          </div>}
        </div>
      </div>
      <div id="writing-feedback" aria-live="polite">
        {result?.status === "correct" || revealed ? <div className="feedback basics-feedback">
          <strong>{revealed ? "Contoh jawaban" : "Tepat!"}</strong>
          <SentencePlayback text={revealed ? lesson.reference : input.trim()} />
          <p>{result?.status === "correct" ? result.message : lesson.explanation}</p>
        </div> : result?.status === "retry" ? <div className="feedback feedback-bad basics-feedback">
          <strong>Belum tepat, coba lagi.</strong><p className="hint">{result.message}</p>
        </div> : result ? <p className="hint hint-plain">{result.message}</p> : null}
      </div>
      {!solved && hasIncorrectAttempt && <div className="learning-help-actions">
        <button className="inline-popup-link" type="button"
          aria-expanded={hint} onClick={() => { attempt.hint(); setHint(value => !value); }}>Petunjuk</button>
        <button className="inline-popup-link" type="button" onClick={reveal}>Lihat contoh jawaban</button>
      </div>}
      {hint && hasIncorrectAttempt && !solved && <div className="note writing-hint">
        <p><strong>Kata panduan</strong> · {lesson.cues}</p>
        <p>{lesson.hint}</p>
      </div>}
      {solved && <div className="actions">
        <button className="btn btn-primary" type="submit">{hasNext ? "Situasi berikutnya" : back}</button>
      </div>}
    </form>
    {(!solved || hasNext) && <button type="button" className="inline-popup-link" onClick={onExit}>{back}</button>}
  </main>;
}
