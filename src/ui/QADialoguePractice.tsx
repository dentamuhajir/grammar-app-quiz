import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import { ROLEPLAY_STARTERS, SCENARIO_GROUPS, type RoleplayStarter } from "../grammar/qa/starters";
import { SpokenSentence } from "./SpokenSentence";
import { VoiceInputBar } from "./VoiceInputBar";

interface ConversationTurn {
  question: string;
  answer: string;
  feedback: string;
  correction: string;
  explanation: string;
}

function DialogueSession({ scenario }: { scenario: RoleplayStarter }) {
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [question, setQuestion] = useState(scenario.question);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [notice, setNotice] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const pending = useRef<AbortController | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      pending.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (followLatest.current && chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    else if (history.length) setHasNewMessages(true);
  }, [history, question, busy]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (pending.current || finished) return;
    if (!answer.trim()) {
      setNotice("Tulis jawaban Anda terlebih dahulu.");
      return;
    }
    if (!navigator.onLine) {
      setNotice("Koneksi internet terputus. Hubungkan kembali, lalu coba kirim lagi.");
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    setBusy(true);
    setNotice("");
    followLatest.current = true;
    let reason = "Tutor AI sedang tidak tersedia. Coba kirim lagi.";
    try {
      const response = await fetch("/api/roleplay", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "conversation", scenario: scenario.context, speaker: `${scenario.speaker} (${scenario.role})`,
          target: scenario.goal, question, answer: answer.trim(),
          history: history.slice(-3).map(({ question: previousQuestion, answer: previousAnswer }) => ({
            question: previousQuestion, answer: previousAnswer,
          })),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        if (typeof data?.message === "string") reason = data.message;
        else if (data?.error === "unconfigured") reason = "Tutor AI belum diaktifkan oleh pengelola aplikasi.";
        else if (response.status === 429) reason = "Batas penggunaan tutor AI tercapai. Coba lagi nanti.";
        throw new Error("Tutor unavailable");
      }
      if (!data || typeof data.feedback !== "string" || !data.feedback.trim()
        || typeof data.correction !== "string" || typeof data.nextQuestion !== "string" || !data.nextQuestion.trim()) {
        throw new Error("Incomplete tutor response");
      }
      if (pending.current !== controller) return;
      setHistory(turns => [...turns, {
        question, answer: answer.trim(), feedback: data.feedback, correction: data.correction,
        explanation: typeof data.explanation === "string" ? data.explanation : "",
      }]);
      setQuestion(data.nextQuestion);
      setAnswer("");
    } catch {
      if (pending.current !== controller) return;
      setNotice(!navigator.onLine
        ? "Koneksi internet terputus. Hubungkan kembali, lalu coba kirim lagi."
        : reason);
    } finally {
      window.clearTimeout(timeout);
      if (pending.current === controller) {
        pending.current = null;
        setBusy(false);
      }
    }
  }

  function restart() {
    pending.current?.abort();
    pending.current = null;
    setHistory([]);
    setQuestion(scenario.question);
    setAnswer("");
    setBusy(false);
    setFinished(false);
    setNotice("");
    followLatest.current = true;
    setHasNewMessages(false);
  }

  return <main className="card qa-dialogue-card" aria-label={scenario.title}>
    <header className="qa-scenario-intro">
      <div className="qa-scenario-meta"><strong>{scenario.group}</strong>{history.length > 0 && <span>{history.length} giliran selesai</span>}</div>
      <p>{scenario.context}</p>
    </header>
    <div className="qa-tutor">
      <span className="qa-tutor-icon" aria-hidden="true">✦</span>
      <div><strong>Tutor AI</strong><p>{online ? "Koreksi otomatis aktif" : "Koneksi internet terputus"}</p>
        <details className="qa-tutor-about"><summary>Tentang tutor</summary>
          <p>Jawaban dan hingga tiga giliran terakhir dikirim ke Groq atau penyedia cadangan Gemini untuk koreksi dan pertanyaan lanjutan.</p>
        </details>
      </div>
    </div>
    <div className="qa-chat-wrap">
      <div className="qa-chat" ref={chatRef} role="region" aria-label="Percakapan" tabIndex={0} onScroll={() => {
        const chat = chatRef.current;
        if (!chat) return;
        followLatest.current = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 80;
        if (followLatest.current) setHasNewMessages(false);
      }}>
        {history.map((turn, index) => <Fragment key={index}>
          <article className="qa-chat-message qa-chat-character"><strong className="qa-chat-author">{scenario.speaker}</strong><SpokenSentence text={turn.question} /></article>
          <article className="qa-chat-message qa-chat-user"><strong className="qa-chat-author">Anda</strong><p lang="en">{turn.answer}</p></article>
          <article className="qa-chat-message qa-chat-coach"><strong className="qa-chat-author">Tutor AI</strong>
            {turn.correction && turn.correction.trim().toLowerCase() !== turn.answer.trim().toLowerCase() && <SpokenSentence text={turn.correction} />}
            <p>{turn.feedback}</p>
            {turn.explanation && <details className="qa-tutor-explanation"><summary>Bahas lebih lanjut</summary><p>{turn.explanation}</p></details>}
          </article>
        </Fragment>)}
        {!finished && <section className="qa-dialogue-question qa-chat-message qa-chat-character" aria-label="Pertanyaan saat ini">
          <div className="qa-interlocutor"><span className="qa-avatar" aria-hidden="true">{scenario.speaker.charAt(0)}</span><div><strong>{scenario.speaker}</strong><span lang="en">{scenario.role}</span></div></div>
          <SpokenSentence text={question} />
          <details><summary>{history.length ? "Fokus latihan" : "Terjemahan & fokus latihan"}</summary>
            {!history.length && <p>{scenario.translation}</p>}<p>{scenario.goal}</p>
          </details>
        </section>}
        {busy && <article className="qa-chat-message qa-chat-coach" role="status"><strong className="qa-chat-author">Tutor AI</strong><p>Sedang menyiapkan balasan…</p></article>}
      </div>
      {hasNewMessages && <button type="button" className="btn qa-latest" onClick={() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
        followLatest.current = true;
        setHasNewMessages(false);
      }}>Pesan terbaru ↓</button>}
    </div>
    {!finished ? <form className="qa-answer-form" onSubmit={send}>
      <label htmlFor="dialogue-answer">Jawaban Anda</label>
      <div className="qa-composer">
        <textarea id="dialogue-answer" rows={2} maxLength={1500} value={answer} disabled={busy} onChange={event => { setAnswer(event.target.value); setNotice(""); }} placeholder="Balas dalam bahasa Inggris…" />
        <div className="qa-composer-tools">
          <VoiceInputBar compact value={answer} disabled={busy} onChange={setAnswer} />
          <button type="submit" className="btn btn-primary qa-send" disabled={busy || !online}>{busy ? "Menunggu…" : "Kirim"} <span aria-hidden="true">↗</span></button>
        </div>
      </div>
      {!online && <p role="status">Roleplay memerlukan koneksi internet. Jawaban Anda tersimpan di kotak ini.</p>}
      {notice && <p role="status">{notice}</p>}
    </form> : <div className="feedback feedback-ok" role="status"><strong>Percakapan selesai!</strong><p>Anda menyelesaikan {history.length} giliran.</p></div>}
    <div className="actions qa-session-actions">
      {!finished && history.length > 0 && <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setFinished(true)}>Akhiri percakapan</button>}
      <button type="button" className="btn btn-ghost" onClick={restart}>Mulai ulang skenario</button>
    </div>
  </main>;
}

export function QADialoguePractice() {
  const [group, setGroup] = useState<string>(ROLEPLAY_STARTERS[0].group);
  const [scenarioId, setScenarioId] = useState(ROLEPLAY_STARTERS[0].id);
  const [sessionKey, setSessionKey] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);
  const [sessionAvailable, setSessionAvailable] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => { setOnline(navigator.onLine); if (navigator.onLine) setSessionAvailable(true); };
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  const scenario = ROLEPLAY_STARTERS.find(item => item.id === scenarioId)!;

  function choose(item: RoleplayStarter) {
    setGroup(item.group);
    setScenarioId(item.id);
    setSessionKey(key => key + 1);
  }

  function randomScenario() {
    const choices = ROLEPLAY_STARTERS.filter(item => item.id !== scenarioId);
    choose(choices[Math.floor(Math.random() * choices.length)]);
  }

  return <>
    <label className="qa-scenario-picker" htmlFor="qa-category">Kategori
      <span className="qa-scenario-field"><select id="qa-category" value={group} disabled={!online} onChange={event => {
        const next = ROLEPLAY_STARTERS.find(item => item.group === event.target.value);
        if (next) choose(next);
      }}>{SCENARIO_GROUPS.map(item => <option key={item} value={item}>{item}</option>)}</select>
        <span className="qa-scenario-chevron" aria-hidden="true">▾</span></span>
    </label>
    <label className="qa-scenario-picker" htmlFor="qa-scenario">Skenario roleplay
      <span className="qa-scenario-field"><select id="qa-scenario" value={scenarioId} disabled={!online} onChange={event => {
        const next = ROLEPLAY_STARTERS.find(item => item.id === event.target.value);
        if (next) choose(next);
      }}>{ROLEPLAY_STARTERS.filter(item => item.group === group).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
        <span className="qa-scenario-chevron" aria-hidden="true">▾</span></span>
    </label>
    <button type="button" className="btn btn-ghost" disabled={!online} onClick={randomScenario}>Pilih skenario acak</button>
    {sessionAvailable ? <DialogueSession key={sessionKey} scenario={scenario} /> : <div className="feedback" role="status">Roleplay membutuhkan koneksi internet. Hubungkan perangkat untuk memulai.</div>}
  </>;
}
