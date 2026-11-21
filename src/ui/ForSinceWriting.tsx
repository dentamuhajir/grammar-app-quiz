import { useState } from "react";
import { FOR_SINCE_LESSONS, checkForSinceWriting, referenceSentence, timeExplanation, timeHint } from "../grammar/forSince";
import type { ReviewSlot } from "../grammar/forSinceReview";
import { SpokenSentence } from "./SpokenSentence";
import { VoiceInputBar } from "./VoiceInputBar";
import { useForSinceAttempt } from "./useForSinceAttempt";

export interface WritingSession {
  lessonId: string;
  from: "basics" | "sentences";
  review?: ReviewSlot;
}

export function ForSinceWriting({ session, onExit }: { session: WritingSession; onExit: () => void }) {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof checkForSinceWriting> | null>(null);
  const [hint, setHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const attempt = useForSinceAttempt();
  const start = FOR_SINCE_LESSONS.findIndex(lesson => lesson.id === session.lessonId);
  const lesson = FOR_SINCE_LESSONS[(start + step) % FOR_SINCE_LESSONS.length];
  const slot: ReviewSlot = { lessonId: lesson.id, activity: "sentence" };
  const solved = revealed || result?.status === "correct";
  const series = !session.review && session.from === "sentences";
  const hasNext = series && step + 1 < FOR_SINCE_LESSONS.length;
  const back = session.from === "basics" ? "Kembali ke Grammar Basics" : "Kembali ke Sentence Practice";

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
      attempt.reset();
      return;
    }
    const checked = checkForSinceWriting(lesson, input);
    setResult(checked);
    if (checked.status !== "empty") {
      attempt.record(slot, checked.status === "correct" ? "correct" : "incorrect", session.review);
    }
  }

  return <main className="card basics-card" aria-label="Sentence Practice · For / since">
    <div className="tags"><span className="tag tag-tense">For / since</span>
      {series && <span className="tag">{step + 1} / {FOR_SINCE_LESSONS.length}</span>}
      {session.review && <span className="tag">Latihan ulang</span>}
    </div>
    <p className="basics-prompt">{lesson.situation}</p>
    <p className="basics-cue">Tulis satu kalimat dengan <strong>for</strong> atau <strong>since</strong> dan kata panduan <strong>{lesson.cues}</strong>.</p>
    <form onSubmit={event => { event.preventDefault(); submit(); }}>
      <div className="answer-input">
        <input aria-label="Kalimat Anda" value={input} onChange={e => edit(e.target.value)} readOnly={solved}
          placeholder="Tulis kalimat dalam bahasa Inggris…" autoComplete="off" spellCheck={false} />
        <VoiceInputBar value={input} disabled={solved} onChange={edit} />
      </div>
      <div aria-live="polite">
        {result?.status === "correct" || revealed ? <div className="feedback basics-feedback">
          <strong>{revealed ? "Contoh jawaban" : "Tepat!"}</strong>
          <SpokenSentence text={revealed ? referenceSentence(lesson) : input.trim()} />
          <p>{timeExplanation(lesson.preposition, lesson.time)}</p>
        </div> : result ? <p className="hint">{result.message}</p> : hint && <p className="hint">{timeHint(lesson.time)}</p>}
      </div>
      <div className="actions">
        <button className="btn btn-primary" type="submit">{solved ? hasNext ? "Situasi berikutnya" : back : "Periksa jawaban"}</button>
        {!solved && <>
          <button className="btn btn-ghost" type="button" onClick={() => { attempt.hint(); setHint(true); setResult(null); }}>Petunjuk</button>
          <button className="btn btn-ghost" type="button" onClick={() => { attempt.record(slot, "revealed", session.review); setRevealed(true); }}>Lihat jawaban</button>
        </>}
      </div>
    </form>
    {(!solved || hasNext) && <button type="button" className="inline-popup-link" onClick={onExit}>{back}</button>}
  </main>;
}
