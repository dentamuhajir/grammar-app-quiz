import { useState } from "react";
import { SUBJECTS } from "../grammar/data/subjects";
import { sentenceGuide } from "../grammar/explanations";
import {
  changeExplorerQuestion, EXPLORER_COMPLEMENTS, EXPLORER_VERBS,
  explorerRestriction, initialExplorerQuestion,
} from "../grammar/explorer";
import { FORM_LABELS, TENSE_LABELS, TENSE_ORDER, isContinuous, isPerfect } from "../grammar/labels";
import type { Mode, Question, SentenceForm, Tense } from "../grammar/types";
import { SentencePlayback } from "./SentencePlayback";

const TIMES = ["present", "past", "future"] as const;
const ASPECTS = [
  { suffix: "Simple", label: "Simple" },
  { suffix: "Continuous", label: "Continuous" },
  { suffix: "Perfect", label: "Perfect" },
  { suffix: "PerfectContinuous", label: "Perfect Continuous" },
];

export function TensesExplorer({ source, onBack }: { source?: Question; onBack: () => void }) {
  const [question, setQuestion] = useState(() => initialExplorerQuestion(source));
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const guide = sentenceGuide(question);
  const time = TIMES.find(value => question.tense.startsWith(value))!;
  const aspect = question.tense.slice(time.length);
  const anchor = time === "past" ? 170 : time === "present" ? 330 : 490;
  const barWidth = aspect === "Simple" ? 44 : aspect === "PerfectContinuous" ? 140 : 110;
  const barX = aspect === "Simple" ? anchor - 22
    : aspect === "Continuous" ? anchor - 55 : anchor - barWidth - 8;
  const verb = question.verb;
  const verbs = EXPLORER_VERBS.some(item => item.base === verb?.base)
    ? EXPLORER_VERBS : [...EXPLORER_VERBS, verb!];
  const complements = EXPLORER_COMPLEMENTS.some(item => item.text === question.complement?.text)
    ? EXPLORER_COMPLEMENTS : [...EXPLORER_COMPLEMENTS, ...(question.complement ? [question.complement] : [])];
  const subjects = SUBJECTS.some(item => item.text === question.subject.text)
    ? SUBJECTS : [...SUBJECTS, question.subject];
  const activeVerbForm = question.mode === "passive" ? "V3"
    : isContinuous(question.tense) ? "V-ing"
    : isPerfect(question.tense) ? "V3"
    : question.form === "positive" && question.tense === "pastSimple" ? "V2"
    : question.form === "positive" && question.tense === "presentSimple"
      && question.subject.person === 3 && question.subject.number === "singular" ? "s/es" : "V1";

  function update(patch: Partial<Question>) {
    setQuestion(current => changeExplorerQuestion(current, patch));
    setCopied(false);
    setCopyFailed(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(question.answer);
      setCopied(true);
    } catch {
      setCopyFailed(true);
    }
  }

  return <main className="card explorer-page" aria-label="Tenses Explorer">
    <div className="tenses-sentence-header">
      <h2>Tenses Explorer</h2>
      <button type="button" className="btn btn-ghost" onClick={onBack}>
        {source ? "Kembali ke soal" : "Kembali"}
      </button>
    </div>
    {source && source.tense !== initialExplorerQuestion(source).tense && <p className="note">
      Soal asal berlabel {TENSE_LABELS[source.tense]}. Explorer membuka pola yang digunakan kalimatnya,
      yaitu {TENSE_LABELS[initialExplorerQuestion(source).tense]}.
    </p>}
    <div className="tenses-explorer">
      <div className="tenses-explorer-controls">
        <div className="tenses-pill-row" role="group" aria-label="Jenis kalimat">
          {(["verbal", "nominal", ...(source?.mode === "passive" ? ["passive"] : [])] as Mode[]).map(mode =>
            <button type="button" key={mode} className={`tenses-option-pill ${question.mode === mode ? "active" : ""}`}
              aria-pressed={question.mode === mode} onClick={() => update({mode})}>
              {mode === "verbal" ? "Verbal" : mode === "nominal" ? "Nominal" : "Passive"}
            </button>)}
        </div>
        <div className="tenses-control-split">
          <label className="tenses-control-group">
            <span className="tenses-control-label">Subjek</span>
            <select value={question.subject.text}
              onChange={event => update({subject: subjects.find(subject => subject.text === event.target.value)!})}>
              {subjects.map(subject => <option key={subject.text} value={subject.text}>{subject.text}</option>)}
            </select>
          </label>
          {question.mode === "nominal" ? <label className="tenses-control-group">
            <span className="tenses-control-label">Pelengkap</span>
            <select value={question.complement?.text} onChange={event => update({
              complement: complements.find(comp => comp.text === event.target.value)!,
            })}>
              {complements.map(comp => <option key={comp.text} value={comp.text}
                disabled={question.subject.entity === "thing" && comp.kind === "noun"}>{comp.text}</option>)}
            </select>
          </label> : <label className="tenses-control-group">
            <span className="tenses-control-label">Kata kerja</span>
            <select value={verb?.base} onChange={event => {
              const selected = verbs.find(item => item.base === event.target.value)!;
              update({verb: question.subject.entity === "thing" && selected.base === "work"
                ? {...selected, object: "well"} : selected});
            }}>
              {verbs.map(item => <option key={item.base} value={item.base}
                disabled={question.mode === "passive" && (!item.transitive || item.oddPassive)
                  || question.subject.entity === "thing" && item.base !== "work" && item.base !== verb?.base}>
                {item.base} — {item.past} — {item.participle}
              </option>)}
            </select>
          </label>}
        </div>
        <div className="tenses-pill-row" role="group" aria-label="Waktu">
          {TIMES.map(value => {
            let tense = (value + aspect) as Tense;
            if (explorerRestriction(question, tense)) tense = (value + "Simple") as Tense;
            return <button key={value} type="button" className={`tenses-option-pill ${time === value ? "active" : ""}`}
              aria-pressed={time === value} onClick={() => update({tense})}>
              {value === "present" ? "Present" : value === "past" ? "Past" : "Future"}
            </button>;
          })}
        </div>
        <div className="tenses-pill-row" role="group" aria-label="Aspek">
          {ASPECTS.map(item => {
            const tense = (time + item.suffix) as Tense;
            const restriction = explorerRestriction(question, tense);
            return <button type="button" key={item.suffix} title={restriction}
              disabled={Boolean(restriction)}
              className={`tenses-option-pill ${aspect === item.suffix ? "active" : ""}`}
              aria-pressed={aspect === item.suffix} onClick={() => update({tense})}>{item.label}</button>;
          })}
        </div>
        {question.mode === "nominal" && <p className="tenses-explorer-intro">
          Simple dan Perfect untuk keadaan, identitas, atau tempat. Continuous tersedia dengan
          pelengkap perilaku seperti careful untuk menunjukkan sikap sementara.
          Bentuk Future Continuous dan Perfect Continuous dengan be memerlukan konteks khusus dan dibatasi di halaman ini.
        </p>}
        <div className="tenses-pill-row" role="group" aria-label="Bentuk kalimat">
          {(["positive", "negative", "yesNoQuestion", "whQuestion"] as SentenceForm[]).map(form =>
            <button type="button" key={form} aria-pressed={question.form === form}
              className={`tenses-option-pill ${question.form === form ? "active" : ""}`}
              onClick={() => update({form})}>{FORM_LABELS[form]}</button>)}
        </div>
      </div>

      <section className="tenses-sentence-card" aria-label="Hasil kalimat" aria-live="polite">
        <div className="tenses-sentence-header">
          <span className="tag tag-tense">{TENSE_LABELS[question.tense]}</span>
          <button type="button" className="tenses-copy-btn" onClick={copy}>
            {copied ? "✓ Tersalin" : "Salin kalimat"}
          </button>
        </div>
        <SentencePlayback text={question.answer} question={question} />
        {copyFailed && <p className="hint">Pilih teks kalimat untuk menyalinnya secara manual.</p>}
        {question.mode !== "nominal" && verb && <div className="tenses-pill-row" aria-label="Bentuk kata kerja">
          {[["V1", verb.base], ["V2", verb.past], ["V3", verb.participle], ["V-ing", verb.ing], ["s/es", verb.thirdSingular]].map(([label, value]) =>
            <span key={label} className={`explorer-verb-form ${label === activeVerbForm ? "active" : ""}`}>
              {label} <strong>{value}</strong>
            </span>)}
        </div>}
        <div className="tenses-info-box"><strong>Pola grammar</strong><p>{guide.formula}</p></div>
        <p>{guide.reasons[0]}</p>
        {question.mode === "nominal" && isContinuous(question.tense) && <p>
          Being careful berarti sedang bersikap hati-hati pada saat itu. Pilihan ini menggambarkan perilaku sementara.
        </p>}
        {question.form === "whQuestion" && <p>
          {question.whWord} {question.whWord === "What" ? "menanyakan objek atau identitas."
            : question.whWord === "Where" ? "menanyakan tempat." : question.whWord === "Why" ? "menanyakan alasan." : "mengikuti informasi yang ditanyakan pada soal asal."}
        </p>}
        <details>
          <summary>Penjelasan & bagian kalimat</summary>
          {guide.reasons.slice(1).map(reason => <p key={reason}>{reason}</p>)}
          {guide.notes.map(note => <p key={note} className="note">{note}</p>)}
          <table className="explorer-parts"><thead><tr><th>Bagian kalimat</th><th>Fungsi</th></tr></thead>
            <tbody>{guide.parts.map((part, index) => <tr key={index}><td>{part.text}</td><td>{part.role}</td></tr>)}</tbody>
          </table>
        </details>
      </section>

      <details className="tenses-timeline-card">
        <summary>Garis waktu</summary>
        <svg viewBox="0 0 600 140" className="tenses-timeline-svg" role="img" aria-label="Garis waktu konseptual">
          <line x1="35" y1="70" x2="565" y2="70" stroke="var(--timeline-line)" strokeWidth="3" />
          <path d="M565 70 l-10 -6 v12 z" fill="var(--timeline-line)" />
          <rect x={barX}
            y="55" width={barWidth} height="30" rx="6" fill="var(--timeline-activity)" />
          <line x1={anchor}
            x2={anchor}
            y1="30" y2="95" stroke="var(--timeline-anchor)" strokeWidth="3" strokeDasharray="5 4" />
          <text x="80" y="120">Past</text><text x="275" y="120">Present</text><text x="465" y="120">Future</text>
        </svg>
        <p className="tenses-timeline-note">
          Garis putus-putus menunjukkan waktu patokan. Balok menggambarkan kejadian atau keadaan
          yang dibahas. Pada pertanyaan, kejadian tersebut sedang ditanyakan. Pada kalimat negatif,
          kejadian atau keadaan tersebut disangkal.
        </p>
      </details>
      <details className="tenses-comparison-card">
        <summary>Bandingkan tenses</summary>
        <div className="tenses-comparison-list">
          {TENSE_ORDER.map(tense => {
            const restriction = explorerRestriction(question, tense);
            return <button key={tense} type="button" disabled={Boolean(restriction)}
              className={`tenses-comparison-row ${question.tense === tense ? "selected" : ""}`}
              onClick={() => update({tense})}>
              <span className="tenses-comp-badge">{TENSE_LABELS[tense]}</span>
              <span>{restriction ?? changeExplorerQuestion(question, {tense}).answer}</span>
            </button>;
          })}
        </div>
      </details>
    </div>
  </main>;
}
