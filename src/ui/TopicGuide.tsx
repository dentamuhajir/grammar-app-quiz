import type { BasicsTopicGuide } from "../grammar/basics/engine";
import type { GuideToken } from "../grammar/basics/guideVisuals";

const TOKEN_LABELS: Record<NonNullable<GuideToken["kind"]>, string> = {
  preposition: "Preposisi", gerund: "Gerund · V-ing", infinitive: "To-infinitive", continuous: "Continuous",
  error: "Bentuk kurang tepat", subject: "Subjek", verb: "Verb / kata bantu", object: "Objek / pelengkap",
  adverb: "Keterangan", wh: "Kata tanya", clause: "Klausa", connector: "Penghubung",
  condition: "Syarat", result: "Hasil / kejadian utama",
  determiner: "Penentu / jumlah", noun: "Kata benda", adjective: "Kata sifat",
  chunk: "Ungkapan",
};

function HighlightedText({ tokens }: { tokens: GuideToken[] }) {
  return <>{tokens.map((token, i) => token.kind
    ? <mark key={i} title={TOKEN_LABELS[token.kind]} className={`guide-token guide-token-${token.kind}`}>{token.text}</mark>
    : <span key={i}>{token.text}</span>)}</>;
}

export function TopicGuide({ guide }: { guide: BasicsTopicGuide }) {
  const visual = guide.rules.some(rule => rule.visual);
  const kinds = [...new Set(guide.rules.flatMap(rule => rule.visual
    ? [...rule.visual.formula, ...rule.visual.examples.flatMap(example => [...example.tokens,
      ...(example.groups?.flatMap(group => group.tokens) ?? [])])] : [])
    .flatMap(token => token.kind && token.kind !== "error" ? [token.kind] : []))];
  return <div className={`sheet-content-stack topic-guide-stack${visual ? " topic-guide-visual" : ""}`}>
    <p className="note">{guide.summary}</p>
    {visual && <div className="guide-legend" aria-label="Arti warna kata">
      {kinds.map(kind => <span key={kind} className={`guide-token guide-token-${kind}`}>{TOKEN_LABELS[kind]}</span>)}
    </div>}
    <section className="topic-guide-section" aria-label="Aturan dan pola penggunaan">
      <h4 className="topic-guide-heading">Aturan &amp; Pola Penggunaan</h4>
      <div className="topic-guide-rules">
        {guide.rules.map(rule => {
          const content = <>
            {rule.visual && <div className="guide-formula" aria-label={rule.visual.formulaLabel ?? "Rumus"}>
              <span className="guide-formula-label">{rule.visual.formulaLabel ?? "Rumus"}</span>
              <p><HighlightedText tokens={rule.visual.formula} /></p>
            </div>}
            <p className="guide-rule-detail">{rule.detail}</p>
            {rule.visual && <ul className="guide-comparisons" aria-label={`Contoh: ${rule.label}`}>
              {rule.visual.examples.map((example, i) => <li key={i} className={`guide-example guide-example-${example.status}`}>
                <span className="guide-example-status">{example.status === "correct" ? "✓ Benar" : example.status === "incorrect" ? "✕ Kurang tepat" : "Bandingkan makna"}</span>
                {example.context && <p className="guide-example-context"><span>Konteks: </span>{example.context}</p>}
                {example.groups ? <div className="guide-clause-groups">
                  {example.groups.map((group, j) => <div className="guide-clause-group" key={j}>
                    <span className="guide-clause-label">{group.label}</span>
                    <p lang="en" className="guide-example-sentence"><HighlightedText tokens={group.tokens} /></p>
                  </div>)}
                </div> : <p lang="en" className="guide-example-sentence"><HighlightedText tokens={example.tokens} /></p>}
                <p className="guide-example-note">{example.note}</p>
              </li>)}
            </ul>}
          </>;
          return rule.visual?.collapsible
            ? <details className="topic-guide-rule-card guide-disclosure" key={rule.label}>
              <summary>{rule.label}<span className="guide-disclosure-hint">Buka perbandingan</span></summary>
              <div className="guide-rule-content">{content}</div>
            </details>
            : <div className="topic-guide-rule-card" key={rule.label}>
              <strong>{rule.label}</strong><div className="guide-rule-content">{content}</div>
            </div>;
        })}
      </div>
    </section>
    <section className="topic-guide-section" aria-label="Contoh kalimat">
      <h4 className="topic-guide-heading">Contoh Kalimat</h4>
      <ul className="topic-guide-examples">
        {guide.examples.map(ex => <li key={ex} className="topic-guide-example-item" lang="en">{ex}</li>)}
      </ul>
    </section>
  </div>;
}
