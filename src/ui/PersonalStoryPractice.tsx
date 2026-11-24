import { useEffect, useRef, useState, type FormEvent } from "react";
import { PERSONAL_PROMPTS, type PersonalPrompt } from "../grammar/story/personal";
import { personalSentences } from "../grammar/story/personalSentences.js";
import { SpokenSentence } from "./SpokenSentence";
import { VoiceInputBar } from "./VoiceInputBar";
import { BottomSheet } from "./BottomSheet";
import { BASICS_TOPIC_GUIDES } from "../grammar/basics/engine";
import { BASICS_LABELS } from "../grammar/labels";
import { writingHintsFor, type WritingHint } from "../grammar/story/writingHints";

interface Review {
  strength: string;
  sentences: { original: string; revision: string; feedback: string }[];
  nextStep: string;
}

const HISTORY_KEY = "grammar-app-personal-story-history";

function readHistory(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string").slice(-10) : [];
  } catch {
    return [];
  }
}

function randomPrompt(history: string[], currentId?: string): PersonalPrompt {
  const date = new Date();
  const eligible = PERSONAL_PROMPTS.filter(item =>
    item.id !== currentId && (item.id !== "day-highlight" || date.getHours() >= 15));
  const unseen = eligible.filter(item => !history.includes(item.id));
  const choices = unseen.length ? unseen : eligible;
  return choices[Math.floor(Math.random() * choices.length)];
}

export function PersonalStoryPractice() {
  const [history, setHistory] = useState(readHistory);
  const [prompt, setPrompt] = useState(() => randomPrompt(readHistory()));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [review, setReview] = useState<Review | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<WritingHint | null>(null);
  const pending = useRef<AbortController | null>(null);
  const answer = drafts[prompt.id] ?? "";
  const hints = writingHintsFor(prompt);
  const sentences = personalSentences(answer);
  const sentenceCount = sentences.filter(sentence => /[a-zA-Z]/.test(sentence)).length;

  useEffect(() => () => { pending.current?.abort(); pending.current = null; }, []);
  useEffect(() => {
    setHistory(current => {
      const recent = [...current.filter(id => id !== prompt.id), prompt.id].slice(-10);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(recent)); } catch { /* Storage is optional. */ }
      return recent;
    });
  }, [prompt.id]);

  function select(next: PersonalPrompt) {
    pending.current?.abort();
    pending.current = null;
    setBusy(false);
    setReview(null);
    setNotice("");
    setPrompt(next);
  }

  function nextPrompt() {
    select(randomPrompt(history, prompt.id));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    if (!answer.trim()) { setNotice("Tulis ceritamu terlebih dahulu."); return; }
    if (sentenceCount < 3) { setNotice("Tulis minimal 3 kalimat untuk meminta umpan balik."); return; }
    if (answer.length > 8000) { setNotice("Cerita dapat berisi hingga 8.000 karakter."); return; }
    const controller = new AbortController();
    pending.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 75_000);
    setBusy(true);
    setNotice("");
    setReview(null);
    try {
      const response = await fetch("/api/story", {
        method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "personal", story: answer.trim(), scenario: prompt.question,
          missions: [{ label: prompt.grammar, formula: prompt.formula }] }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(typeof data?.message === "string" ? data.message
          : data?.error === "unconfigured" ? "Tutor AI belum diaktifkan."
            : "Tutor AI belum tersedia. Coba lagi.");
      }
      if (typeof data?.strength !== "string" || typeof data.nextStep !== "string"
        || !Array.isArray(data.sentences) || data.sentences.length !== sentences.length
        || !sentences.every((original, index) => {
          const row = data.sentences[index];
          return row?.original === original && typeof row.revision === "string" && typeof row.feedback === "string";
        })) {
        throw new Error("Jawaban tutor belum dapat diproses. Coba lagi.");
      }
      if (pending.current === controller) setReview(data);
    } catch (error) {
      if (pending.current === controller) setNotice(!navigator.onLine
        ? "Koneksi internet terputus. Ceritamu tetap tersimpan di kotak jawaban."
        : error instanceof Error && error.name !== "AbortError" ? error.message : "Tutor terlalu lama merespons. Coba lagi.");
    } finally {
      window.clearTimeout(timeout);
      if (pending.current === controller) { pending.current = null; setBusy(false); }
    }
  }

  return <main className="card story-challenge-card personal-story">
    <div className="tags"><span className="tag tag-tense">Menulis Bebas</span></div>
    <section className="story-scenario-box personal-prompt">
      <p className="story-box-eyebrow">Topik tulisan</p>
      <h2 className="story-scenario-title">{prompt.question}</h2>
      <p className="story-scenario-prompt">{prompt.translation}</p>
      <button type="button" className="btn btn-ghost personal-next" disabled={busy} onClick={nextPrompt}>↻ Ganti pertanyaan</button>
    </section>
    <section className="story-missions-box personal-guidance" aria-label="Bantuan menulis">
      <div className="story-missions-header">
        <span className="story-box-eyebrow">Bantuan menulis</span>
        <span className="personal-optional">Opsional</span>
      </div>
      <p className="personal-grammar">Pilih pola untuk melihat contoh.</p>
      <div className="personal-hints" aria-label="Saran pola kalimat">
        {hints.slice(0, 3).map(item => <button type="button" key={item.label}
          className={`story-mission-chip personal-hint-${item.category}`} onClick={() => setHint(item)}>{item.label} <span aria-hidden="true">ⓘ</span></button>)}
      </div>
      {hints.length > 3 && <details className="personal-tutor-info">
        <summary>Lebih banyak pola</summary>
        <div className="personal-hints">
          {hints.slice(3).map(item => <button type="button" key={item.label}
            className={`story-mission-chip personal-hint-${item.category}`} onClick={() => setHint(item)}>{item.label} <span aria-hidden="true">ⓘ</span></button>)}
        </div>
      </details>}
      <div className="story-keywords-bar">
        <span className="story-keywords-label">Ide kata</span>
        <div className="story-keywords-list">{prompt.words.map(word => <span className="personal-word" key={word}>{word}</span>)}</div>
      </div>
    </section>
    <form className="writing-answer-form" onSubmit={submit}>
      <div className="sentence-answer-block">
        <label className="sentence-answer-label" htmlFor="personal-story-answer">Tulisan Anda</label>
        <div className="qa-composer sentence-composer">
          <textarea id="personal-story-answer" rows={4} maxLength={8000} value={answer} disabled={busy}
            onChange={event => { setDrafts(current => ({ ...current, [prompt.id]: event.target.value })); setReview(null); setNotice(""); }}
            placeholder="Tulis jawaban dalam bahasa Inggris…" />
          <div className="qa-composer-tools">
            <VoiceInputBar compact multiline value={answer} disabled={busy} onChange={value => { setDrafts(current => ({ ...current, [prompt.id]: value })); setReview(null); setNotice(""); }} />
            <button type="submit" className="btn btn-primary qa-send" disabled={busy || sentenceCount < 3}>{busy ? "Memeriksa…" : "Minta umpan balik"} ↗</button>
          </div>
        </div>
      </div>
      <p className="personal-sentence-count" aria-live="polite">{sentenceCount} dari minimal 3 kalimat{sentenceCount < 3 ? " · Pisahkan kalimat dengan titik, tanda tanya, atau tanda seru." : ""}</p>
      <details className="personal-tutor-info"><summary>Tentang umpan balik AI</summary><p>Tulisan dan topik dikirim ke Groq atau Gemini untuk diperiksa.</p></details>
      {notice && <p role="status">{notice}</p>}
      {review && <section className="feedback feedback-reveal" aria-label="Umpan balik tutor" role="status">
        <strong>Umpan balik tutor</strong><p>{review.strength}</p>
        <ol className="personal-review-list" aria-label="Umpan balik per kalimat">
          {review.sentences.map((row, index) => <li key={index}>
            <strong>Kalimat {index + 1}{row.revision ? "" : " · Sudah tepat"}</strong>
            <p lang="en">{row.original}</p>
            {row.revision && <>
              <strong>Saran perbaikan</strong>
              <SpokenSentence text={row.revision} />
              <p>{row.feedback}</p>
            </>}
          </li>)}
        </ol>
        {review.nextStep && <><strong>Kembangkan cerita</strong><p>{review.nextStep}</p></>}
      </section>}
    </form>
    <BottomSheet open={hint !== null} onClose={() => setHint(null)} title={hint?.label ?? "Bantuan menulis"}>
      {hint && <div className="sheet-content-stack">
        <p>{hint.explanation}</p>
        <div className="feedback feedback-reveal"><strong>Contoh kalimat</strong><SpokenSentence text={hint.example} /></div>
        {hint.topic && <details>
          <summary>Materi {BASICS_LABELS[hint.topic]}</summary>
          <p>{BASICS_TOPIC_GUIDES[hint.topic].summary}</p>
          {BASICS_TOPIC_GUIDES[hint.topic].rules.map(rule => <p key={rule.label}><strong>{rule.label}</strong><br />{rule.detail}</p>)}
        </details>}
      </div>}
    </BottomSheet>
  </main>;
}
