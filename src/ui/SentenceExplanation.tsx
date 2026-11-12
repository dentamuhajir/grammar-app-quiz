import { sentenceGuide } from "../grammar/explanations";
import type { Question } from "../grammar/types";

export function SentenceExplanation({ question, solved }: { question: Question; solved: boolean }) {
  const guide = sentenceGuide(question);
  return <>
    <details className="sentence-help">
      <summary>Lihat pola &amp; bantuan</summary>
      <p className="sentence-formula">{guide.formula}</p>
      <p className="sentence-glossary">V1 = bentuk dasar · V2 = bentuk lampau · V3 = past participle · V-ing = bentuk -ing</p>
      {!solved && guide.notes.map(note => <p className="note" key={note}>{note}</p>)}
    </details>
    {solved && <section className="sentence-explanation" aria-label="Penjelasan jawaban">
      <h3>Mengapa bentuknya begitu?</h3>
      <ul>{guide.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
      <details className="sentence-help">
        <summary>Lihat bagian kalimat acuan</summary>
        <div className="sentence-table-wrap">
          <table className="sentence-table">
            <thead><tr><th scope="col">Bagian kalimat</th><th scope="col">Fungsi</th></tr></thead>
            <tbody>{guide.parts.map((part, i) => <tr key={i}><td lang="en">{part.text}</td><td>{part.role}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
      {guide.notes.map(note => <p className="note" key={note}>{note}</p>)}
    </section>}
  </>;
}
