import { Fragment, useEffect, useRef, useState } from "react";
import {
  highlightGroups, sampleArticle, sampleHighlights, sentenceRequest, splitArticle,
  type ArticleSentence, type GrammarHighlight,
} from "../grammar/articles/reader";
import { ARTICLE_MODE_LABELS, type ArticleMode } from "../grammar/articles/engine";

function HighlightedSentence({ text, highlights }: { text: string; highlights: GrammarHighlight[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const groups = highlightGroups(highlights);
  const selected = open === null ? undefined : groups[open];
  return <>
    <p className="reader-text" lang="en">
      {groups.map((group, index) => <Fragment key={group.start}>
        {text.slice(index ? groups[index - 1].end : 0, group.start)}
        <button type="button" className="reader-highlight" aria-expanded={open === index}
          onClick={() => setOpen(open === index ? null : index)}>{text.slice(group.start, group.end)}</button>
      </Fragment>)}
      {text.slice(groups.length ? groups[groups.length - 1].end : 0)}
    </p>
    {selected ? <div className="reader-notes" aria-live="polite">
      {selected.notes.map((note, index) => <div key={index}>
        <strong lang="en">{text.slice(note.start, note.end)}</strong> · {note.label}
        <p>{note.explanation}</p>
      </div>)}
    </div> : <small>{groups.length ? "Ketuk frasa yang disorot untuk melihat penjelasannya." : "Belum ada pola yang bisa dijelaskan pada kalimat ini."}</small>}
  </>;
}

function Reading({ sentences, example, editLabel, onEdit }: {
  sentences: ArticleSentence[]; example: boolean; editLabel: string; onEdit: () => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, GrammarHighlight[]>>({});
  const [error, setError] = useState("");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => {
    pending.current?.abort();
    pending.current = null;
  }, []);

  async function select(index: number) {
    pending.current?.abort();
    pending.current = null;
    setActive(index);
    setError("");
    if (results[index]) return;
    if (example) {
      setResults(previous => ({ ...previous, [index]: sampleHighlights(index) }));
      return;
    }
    const sentence = sentences[index];
    if (sentence.end - sentence.start > 4000) {
      setError("Kalimat ini melebihi 4.000 karakter. Pilih Ubah teks untuk membaginya menjadi bagian yang lebih pendek.");
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 32_000);
    let message = "Analisis belum tersedia. Periksa koneksi lalu coba lagi.";
    try {
      const response = await fetch("/api/article", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: controller.signal, body: JSON.stringify(sentenceRequest(sentence)),
      });
      if (response.status === 404 || response.status === 405) message = "Analisis Groq belum tersedia di versi aplikasi ini. Teks contoh bisa dicoba secara offline.";
      const data = await response.json();
      if (!response.ok) {
        if (data.error === "unconfigured") message = "Groq belum diaktifkan. Kamu tetap bisa memakai teks contoh atau latihan artikel.";
        else if (typeof data.message === "string") message = data.message;
        throw new Error("Analysis unavailable");
      }
      if (!Array.isArray(data.highlights)) throw new Error("Invalid analysis");
      if (pending.current === controller) setResults(previous => ({ ...previous, [index]: data.highlights }));
    } catch {
      if (pending.current === controller) setError(controller.signal.aborted ? "Analisis terlalu lama. Coba lagi." : message);
    } finally {
      window.clearTimeout(timeout);
      if (pending.current === controller) pending.current = null;
    }
  }

  return <main className="card article-reader">
    <div className="reader-heading"><h2>Pilih kalimat</h2>
      <button className="btn btn-ghost" onClick={onEdit}>{editLabel}</button>
    </div>
    <p className="reader-help">{example ? "Pilih kalimat untuk membuka sorotan dari teks contoh." : "Ketuk kalimat untuk menganalisisnya dengan Groq. Teks di sekitarnya ikut dibaca sebagai konteks."}</p>
    <div className="breakdown-sentences-stack">
      {sentences.map((sentence, index) => {
        const text = sentence.paragraph.slice(sentence.start, sentence.end);
        const selected = active === index;
        const highlights = selected ? results[index] : undefined;
        return <section key={index} className={`breakdown-sentence-card reader-sentence ${selected ? "active" : ""}`}>
          <button type="button" className="reader-sentence-toggle" aria-expanded={selected}
            onClick={() => {
              if (!selected) { void select(index); return; }
              pending.current?.abort();
              pending.current = null;
              setActive(null);
            }}>
            <span className="breakdown-sentence-num">Kalimat {index + 1}</span>
            {!highlights && <span className="reader-text" lang="en">{text}</span>}
          </button>
          {highlights && <HighlightedSentence text={text} highlights={highlights} />}
          {selected && !highlights && (error
            ? <div role="status" className="reader-status">{error}
                {text.length <= 4000 && <button className="btn btn-ghost" onClick={() => void select(index)}>Coba lagi</button>}
              </div>
            : <p role="status">Menganalisis kalimat…</p>)}
        </section>;
      })}
    </div>
  </main>;
}

export function ArticleReader({ onPractice }: { onPractice: (mode: ArticleMode) => void }) {
  const [draft, setDraft] = useState("");
  const [sentences, setSentences] = useState<ArticleSentence[] | null>(null);
  const [example, setExample] = useState(false);
  const [error, setError] = useState("");

  function read(text: string) {
    if (!text.trim() || text.length > 40_000) {
      setError("Masukkan teks antara 1 dan 40.000 karakter.");
      return;
    }
    if (!draft.trim()) setDraft(text);
    setError("");
    setExample(text.trim() === sampleArticle);
    setSentences(splitArticle(text));
  }

  if (sentences) return <Reading sentences={sentences} example={example}
    editLabel={example && draft.trim() !== sampleArticle ? "Kembali ke teks saya" : "Ubah teks"}
    onEdit={() => setSentences(null)} />;
  return <main className="card article-reader">
    <form className="reader-compose" onSubmit={event => { event.preventDefault(); read(draft); }}>
      <h2>Bedah teks sendiri</h2>
      <label htmlFor="reader-draft">Tempel teks bahasa Inggris</label>
      <textarea className="story-textarea" id="reader-draft" value={draft} rows={5} lang="en"
        spellCheck={false} onChange={event => { setDraft(event.target.value); setError(""); }} />
      {error && <p role="alert">{error}</p>}
      <div className="actions">
        <button className="btn btn-primary" type="submit">Bedah teks</button>
        <button className="btn btn-ghost" type="button" onClick={() => read(sampleArticle)}>Coba teks contoh</button>
      </div>
    </form>
    <section className="reader-practice">
      <h3>Latihan artikel</h3>
      <div className="actions">
        <button className="btn btn-ghost" onClick={() => onPractice("breakdown")}>{ARTICLE_MODE_LABELS.breakdown}</button>
        <button className="btn btn-ghost" onClick={() => onPractice("findFix")}>{ARTICLE_MODE_LABELS.findFix}</button>
      </div>
    </section>
  </main>;
}
