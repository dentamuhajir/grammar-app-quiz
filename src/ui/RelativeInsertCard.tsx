import { useState } from "react";
import { checkBasicsAnswer, completedSentence, type BasicsQuestion } from "../grammar/basics/engine";
import { phoneExample, RELATIVE_INSERTS_LABEL } from "../grammar/basics/relativeInserts";
import { SpokenSentence } from "./SpokenSentence";

function MarkedSentence({ text }: { text: string }) {
  const [before, insert, after] = text.split(",");
  return <p className="insert-sentence" lang="en">{before}{after !== undefined &&
    <>,<mark>{insert}</mark>,{after}</>}</p>;
}

export function RelativeInsertCard({ question, reading, progress, next }: {
  question: BasicsQuestion;
  reading: NonNullable<BasicsQuestion["reading"]>;
  progress?: { step: number; total: number };
  next: () => void;
}) {
  const [example, setExample] = useState(progress?.step === 1);
  const [expanded, setExpanded] = useState(false);
  const [choice, setChoice] = useState("");
  const correct = checkBasicsAnswer(question, choice) === "correct";
  return <main className="insert-lesson">
    <div className="insert-heading">
      <h2>{RELATIVE_INSERTS_LABEL}</h2>
      {progress && !example && <small>Soal {progress.step}/{progress.total}</small>}
    </div>
    {example ? <>
      <section className="insert-paper">
        <h3>{expanded ? "Kalimat dengan sisipan" : "Mulai dari kalimat inti"}</h3>
        <div aria-live="polite">
          <MarkedSentence text={expanded ? phoneExample : "My phone works again."} />
          <p className="insert-meaning">{expanded
            ? "Ponselku, yang diperbaiki Ayah, berfungsi lagi."
            : "Ponselku berfungsi lagi."}</p>
        </div>
        <button type="button" className="insert-link" aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}>{expanded ? "Lihat kalimat inti" : "Tambahkan sisipan →"}</button>
      </section>
      <p className="insert-tip">{expanded
        ? "Repaired by Dad memberi tahu siapa yang memperbaiki ponselku. Yang berfungsi lagi tetap ponselku."
        : "My phone adalah subjeknya. Works again berarti ‘berfungsi lagi’. Coba tambahkan siapa yang memperbaikinya."}</p>
      <button type="button" className="btn btn-primary insert-next" onClick={() => setExample(false)}>
        {choice ? "Kembali ke soal" : "Coba latihan"}
      </button>
    </> : <>
      <section className="insert-paper">
        <MarkedSentence text={reading.sentence} />
        <fieldset className="insert-choices">
          <legend>{question.context}</legend>
          {reading.choices.map(option => <button key={option} type="button" lang="en" disabled={correct}
            aria-pressed={choice === option}
            className={choice === option ? correct ? "is-correct" : "is-incorrect" : ""}
            onClick={() => setChoice(option)}>{option}</button>)}
        </fieldset>
      </section>
      <div aria-live="polite">
        {choice && <div className="insert-tip">
          <strong>{correct ? "Benar." : "Coba lagi."}</strong> {correct ? question.explanation : question.hint}
        </div>}
      </div>
      {correct && <>
        <details className="insert-audio"><summary>Dengarkan kalimat</summary>
          <SpokenSentence text={completedSentence(question)} />
        </details>
        <button type="button" className="btn btn-primary insert-next" onClick={next}>
          {progress && progress.step === progress.total ? "Ulangi latihan" : "Soal berikutnya →"}
        </button>
      </>}
      <div className="insert-tools">
        <button className="insert-link" type="button" onClick={() => { setExpanded(false); setExample(true); }}>Lihat contoh</button>
        {!correct && <button className="insert-link" type="button" onClick={next}>Lewati soal</button>}
      </div>
    </>}
  </main>;
}
