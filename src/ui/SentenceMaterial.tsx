import { SUBJECTS } from "../grammar/data/subjects";
import { effectiveTense, sentenceGuide } from "../grammar/explanations";
import { changeExplorerQuestion, EXPLORER_VERBS, initialExplorerQuestion } from "../grammar/explorer";
import { isContinuous, MODE_LABELS, TENSE_LABELS } from "../grammar/labels";
import type { Question } from "../grammar/types";

export function SentenceMaterial({question, solved, attempted, hint, onExplore}: {
  question: Question;
  solved: boolean;
  attempted: boolean;
  hint?: string;
  onExplore: (question: Question) => void;
}) {
  const tense = effectiveTense(question);
  const example = solved ? question : changeExplorerQuestion(initialExplorerQuestion(), {
    mode: question.mode, tense, form: question.form,
    subject: SUBJECTS.find(subject => subject.text === (question.subject.text === "Emma" ? "Daniel" : "Emma"))!,
    verb: EXPLORER_VERBS.find(verb => verb.base === (question.verb?.base === "write" ? "eat" : "write"))!,
    complement: isContinuous(tense)
      ? {text: "careful", kind: "adjective", behavioral: true}
      : {text: "ready", kind: "adjective"},
  });
  const guide = sentenceGuide(example);
  return <div className="sheet-content-stack">
    <div className="tags">
      <span className="tag tag-tense">{TENSE_LABELS[tense]}</span>
      <span className="tag">{MODE_LABELS[question.mode]}</span>
    </div>
    <p>{guide.reasons[0]}</p>
    <p className="sentence-formula">{guide.formula}</p>
    <section aria-label="Contoh materi">
      <h3>{solved ? "Contoh kalimat" : "Contoh lain"}</h3>
      <p lang="en">{example.answer}</p>
    </section>
    {attempted && hint && <section aria-label="Petunjuk jawaban">
      <h3>Petunjuk untuk jawaban Anda</h3><p className="note">{hint}</p>
    </section>}
    <button type="button" className="btn btn-ghost"
      onClick={() => onExplore(solved || attempted ? question : example)}>
      Pelajari lebih lanjut di Tenses Explorer
    </button>
  </div>;
}
