import { useState } from "react";
import { packForLesson, type WritingResult } from "../grammar/writingPacks";
import type { ReviewSlot } from "../grammar/writingReview";
import { SpokenSentence } from "./SpokenSentence";
import { VoiceInputBar } from "./VoiceInputBar";
import { useWritingAttempt } from "./useWritingAttempt";

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
  const attempt = useWritingAttempt();
  const pack = packForLesson(session.lessonId);
  const start = pack.lessons.findIndex(lesson => lesson.id === session.lessonId);
  const lesson = pack.lessons[(start + step) % pack.lessons.length];
  const slot: ReviewSlot = { lessonId: lesson.id, activity: "sentence" };
  const solved = revealed || result?.status === "correct";
  const series = !session.review && session.from === "sentences";
  const hasNext = series && step + 1 < pack.lessons.length;
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
    const checked = lesson.check(input);
    setResult(checked);
    if (checked.status !== "empty") {
      attempt.record(slot, checked.status === "correct" ? "correct" : "incorrect", session.review);
    }
  }

  return <main className="card basics-card" aria-label={`Sentence Practice · ${pack.label}`}>
    <div className="tags"><span className="tag tag-tense">{pack.label}</span>
      {series && <span className="tag">{step + 1} / {pack.lessons.length}</span>}
      {session.review && <span className="tag">Latihan ulang</span>}
    </div>
    <p className="basics-prompt">{lesson.situation}</p>
    <p className="basics-cue">{pack.instruction} dan kata panduan <strong>{lesson.cues}</strong>.</p>
    <form onSubmit={event => { event.preventDefault(); submit(); }}>
      <div className="answer-input">
        <input aria-label="Kalimat Anda" value={input} onChange={e => edit(e.target.value)} readOnly={solved}
          placeholder="Tulis kalimat dalam bahasa Inggris…" autoComplete="off" spellCheck={false} />
        <VoiceInputBar value={input} disabled={solved} onChange={edit} />
      </div>
      <div aria-live="polite">
        {result?.status === "correct" || revealed ? <div className="feedback basics-feedback">
          <strong>{revealed ? "Contoh jawaban" : "Tepat!"}</strong>
          <SpokenSentence text={revealed ? lesson.reference : input.trim()} />
          <p>{result?.status === "correct" ? result.message : lesson.explanation}</p>
        </div> : result ? <p className="hint">{result.message}</p> : hint && <p className="hint">{lesson.hint}</p>}
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
