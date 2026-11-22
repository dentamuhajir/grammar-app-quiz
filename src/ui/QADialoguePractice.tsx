import { useEffect, useRef, useState, type FormEvent } from "react";
import { evaluateDialogueTurn, type DialogueIntentBranch, type DialogueTurnEvaluation } from "../grammar/qa/dialogue";
import { ROLEPLAY_STARTERS, SCENARIO_GROUPS, type RoleplayStarter } from "../grammar/qa/starters";
import { SpokenSentence } from "./SpokenSentence";
import { VoiceInputBar } from "./VoiceInputBar";

interface ConversationTurn {
  speaker: string;
  question: string;
  answer: string;
  feedback: string;
  correction?: string;
  explanation?: string;
  reaction?: string;
}

function TurnFeedback({ turn }: { turn: ConversationTurn }) {
  return <>
    {turn.correction && <SpokenSentence text={turn.correction} />}
    <p>{turn.feedback}</p>
    {turn.explanation && <details className="qa-tutor-explanation">
      <summary>Bahas lebih lanjut</summary>
      <p>{turn.explanation}</p>
    </details>}
  </>;
}

function DialogueSession({ scenario }: { scenario: RoleplayStarter }) {
  const openingId = scenario.guided?.initialNodeId ?? "opening";
  const tutorAvailable = !window.location.hostname.endsWith(".github.io");
  const [nodeId, setNodeId] = useState<string | null>(openingId);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [useTutor, setUseTutor] = useState(tutorAvailable);
  const [followUp, setFollowUp] = useState("");
  const pendingTutor = useRef<AbortController | null>(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<DialogueTurnEvaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const request = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const node = nodeId ? scenario.guided?.nodes[nodeId] : undefined;
  const localQuestion = node?.question ?? (nodeId === "follow-up" ? scenario.localFollowUp : scenario.question);
  const translation = node?.translation ?? (nodeId === openingId ? scenario.translation : undefined);
  const question = followUp || localQuestion || "";
  const latest = history[history.length - 1];

  useEffect(() => () => { request.current++; pendingTutor.current?.abort(); }, []);
  useEffect(() => { if (history.length) inputRef.current?.focus(); }, [nodeId, history.length]);

  function edit(value: string) {
    request.current++;
    pendingTutor.current?.abort();
    setBusy(false);
    setAnswer(value);
    setEvaluation(null);
    setNotice("");
  }

  async function checkWithTutor(token: number) {
    if (!nodeId) return;
    const controller = new AbortController();
    pendingTutor.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    setBusy(true);
    let reason = "Tutor AI sedang tidak tersedia.";
    try {
      const response = await fetch("/api/roleplay", {
        method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "conversation", scenario: scenario.context, speaker: `${scenario.speaker} (${scenario.role})`, target: scenario.goal,
          question, answer: answer.trim(),
          history: history.slice(-3).map(({ question, answer }) => ({ question, answer })),
        }),
      });
      if (response.status === 429) reason = "Batas penggunaan tutor AI tercapai.";
      if (!response.ok) {
        const failure = await response.json().catch(() => null);
        if (typeof failure?.message === "string") {
          reason = failure.message;
        } else if (failure?.error === "unconfigured") {
          reason = "Tutor AI belum diaktifkan oleh pengelola aplikasi.";
        } else if (failure?.error === "timeout") {
          reason = "Tutor AI terlalu lama merespons.";
        }
        throw new Error("Tutor unavailable");
      }
      const tutor = await response.json();
      if (token !== request.current) return;
      if (typeof tutor.feedback !== "string" || !tutor.feedback.trim() || typeof tutor.correction !== "string"
          || typeof tutor.nextQuestion !== "string" || !tutor.nextQuestion.trim()) {
        throw new Error("Incomplete tutor turn");
      }
      setHistory(items => [...items, { speaker: scenario.speaker, question, answer: answer.trim(),
        feedback: tutor.feedback, correction: tutor.correction,
        explanation: tutor.correction && typeof tutor.explanation === "string" ? tutor.explanation.trim() : "" }]);
      // Keep a related offline question ready if the connection drops later.
      if (!followUp) {
        const nextLocal = node ? evaluateDialogueTurn(node, answer).matchedBranch?.nextNodeId : "follow-up";
        if (nextLocal) setNodeId(nextLocal);
      }
      setFollowUp(tutor.nextQuestion);
      setAnswer("");
    } catch {
      if (token !== request.current) return;
      setUseTutor(false);
      setFollowUp("");
      if (!followUp && node) setEvaluation(evaluateDialogueTurn(node, answer));
      setNotice(reason + (followUp
        ? " Mode lokal aktif. Jawaban Anda tersimpan di kotak isian. Sesuaikan dengan pertanyaan lokal di atas."
        : node ? " Jawaban Anda sudah diperiksa dalam mode lokal." : " Latihan mandiri tersedia. Simpan jawaban untuk melanjutkan."));
    } finally {
      window.clearTimeout(timeout);
      if (pendingTutor.current === controller) pendingTutor.current = null;
      if (token === request.current) setBusy(false);
    }
  }

  async function check(event: FormEvent) {
    event.preventDefault();
    if (!nodeId || busy || pendingTutor.current) return;
    const token = ++request.current;
    if (!answer.trim()) {
      setNotice("Tulis jawaban Anda terlebih dahulu.");
      return;
    }
    setNotice("");
    if (useTutor) {
      setEvaluation(null);
      await checkWithTutor(token);
    } else if (node) {
      setEvaluation(evaluateDialogueTurn(node, answer));
    } else {
      setHistory(items => [...items, { speaker: scenario.speaker, question, answer: answer.trim(), feedback: "Jawaban latihan mandiri tersimpan." }]);
      setNodeId(nodeId === openingId ? "follow-up" : null);
      setAnswer("");
    }
  }

  function advance(branch: DialogueIntentBranch) {
    if (!node || !evaluation?.grammar.passed || busy) return;
    request.current++;
    setHistory(items => [...items, { speaker: node.speaker, question, answer: answer.trim(),
      feedback: `Struktur terdeteksi: ${evaluation.grammar.detectedStructure} · Topik: ${branch.label}`, reaction: branch.npcReaction }]);
    setNodeId(branch.nextNodeId);
    setAnswer("");
    setEvaluation(null);
    setNotice("");
  }

  function restart() {
    request.current++;
    pendingTutor.current?.abort();
    setFollowUp("");
    setBusy(false);
    setNodeId(openingId);
    setUseTutor(tutorAvailable);
    setHistory([]);
    setAnswer("");
    setEvaluation(null);
    setNotice("");
  }

  return <main className="card qa-dialogue-card" aria-label={scenario.title}>
    <header className="qa-scenario-intro">
      <div className="qa-scenario-meta"><strong>{scenario.group}</strong>{history.length > 0 && <span>{history.length} giliran selesai</span>}</div>
      <p>{scenario.context}</p>
    </header>
    {nodeId && tutorAvailable && <div className="qa-tutor">
      <span className="qa-tutor-icon" aria-hidden="true">✦</span>
      <div><label htmlFor="qa-tutor-switch">Tutor AI</label>
        <p id="qa-tutor-description">{useTutor ? "Groq atau penyedia cadangan Gemini menerima jawaban dan hingga tiga giliran terakhir untuk memberi koreksi." : "Mode lokal aktif. Nyalakan tutor AI untuk mendapat koreksi dan pertanyaan lanjutan."}</p>
      </div>
      <input id="qa-tutor-switch" type="checkbox" role="switch" aria-describedby="qa-tutor-description" checked={useTutor} disabled={busy} onChange={event => {
        setUseTutor(event.target.checked);
        setFollowUp("");
        setEvaluation(null);
        setNotice("");
      }} />
    </div>}
    {history.length > 0 && <details className="qa-history" open={!nodeId}><summary>Riwayat percakapan ({history.length} giliran)</summary>
      <ol>{history.map((item, index) => <li key={index}>
        <p><strong>{item.speaker}:</strong> {item.question}</p>
        <p><strong>Anda:</strong> {item.answer}</p>
        {item.correction !== undefined ? <TurnFeedback turn={item} /> : <small>{item.feedback}</small>}
        {item.reaction && <SpokenSentence text={item.reaction} />}
      </li>)}</ol>
    </details>}
    {nodeId ? <>
      {latest && <div className="feedback feedback-reveal" role="status">{latest.reaction
        ? <SpokenSentence text={latest.reaction} />
        : <><strong>{latest.correction !== undefined ? "Umpan balik tutor" : "Latihan mandiri"}</strong><TurnFeedback key={history.length} turn={latest} /></>}
      </div>}
      <section className="qa-dialogue-question" aria-label="Pertanyaan saat ini">
        <div className="qa-interlocutor">
          <span className="qa-avatar" aria-hidden="true">{scenario.speaker.charAt(0)}</span>
          <div><strong>{scenario.speaker}</strong><span lang="en">{scenario.role}</span></div>
        </div>
        <SpokenSentence text={question} />
        <details><summary>{!followUp && translation ? "Terjemahan & fokus latihan" : "Fokus latihan"}</summary>
          {!followUp && translation && <p>{translation}</p>}
          <p>{node && !followUp ? node.grammarHint : scenario.goal}</p>
        </details>
      </section>
      <form className="qa-answer-form" onSubmit={check}>
        <label htmlFor="dialogue-answer">Jawaban Anda</label>
        <div className="qa-composer">
          <textarea ref={inputRef} id="dialogue-answer" rows={2} maxLength={1500} value={answer} onChange={e => edit(e.target.value)} placeholder="Balas dalam bahasa Inggris…" />
          <div className="qa-composer-tools">
            <VoiceInputBar compact value={answer} disabled={busy} onChange={edit} />
            <button type="submit" className="btn btn-primary qa-send" disabled={busy}>{busy ? "Menunggu…" : useTutor ? "Kirim jawaban" : node ? "Periksa jawaban" : "Simpan jawaban"}{!busy && <span aria-hidden="true">↗</span>}</button>
          </div>
        </div>
      </form>
      <div aria-live="polite" aria-busy={busy}>
        {notice && <p role="status">{notice}</p>}
        {evaluation && node && <div className={`feedback ${evaluation.status === "advance" ? "feedback-ok" : "qa-feedback-partial"}`}>
          <strong>{evaluation.status === "empty" ? "Jawaban masih kosong" : "Struktur yang terdeteksi"}</strong>
          <p>{evaluation.grammar.feedback}</p>
          {evaluation.status !== "empty" && <><strong>Perkiraan topik</strong><p>Pencocokan lokal · {evaluation.confidenceBand === "high" ? "Arah topik cukup jelas" : "Perlu klarifikasi"}</p></>}
          {evaluation.clarificationPrompt && <p>{evaluation.clarificationPrompt}</p>}
          {evaluation.status === "grammar_retry" && <p>Coba ulangi dengan pola target. Pemeriksa ini hanya mengenali struktur terbatas; hasilnya bukan koreksi grammar menyeluruh.</p>}
          {!busy && evaluation.status === "advance" && evaluation.matchedBranch && <button type="button" className="btn btn-primary" onClick={() => advance(evaluation.matchedBranch!)}>Lanjutkan percakapan →</button>}
          {!busy && evaluation.status === "clarification_needed" && <div className="qa-clarification"><p>Pilih maksud Anda untuk mengonfirmasi arah dialog, atau perjelas jawaban lalu periksa lagi.</p>{node.branches.map(branch => <button type="button" className="btn btn-ghost" key={branch.id} onClick={() => advance(branch)}>{branch.label}</button>)}</div>}
          <small>{evaluation.limitationsNote}</small>
        </div>}
      </div>
    </> : <div className="feedback feedback-ok" role="status"><strong>Percakapan selesai!</strong><p>Anda menyelesaikan {history.length} giliran. Buka riwayat untuk meninjau jawaban dan struktur yang terdeteksi.</p></div>}
    <div className="actions qa-session-actions">{useTutor && nodeId && history.length > 0 &&
      <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setNodeId(null)}>Akhiri percakapan</button>}
      <button type="button" className="btn btn-ghost" onClick={restart}>Mulai ulang skenario</button></div>
    {!useTutor && <p className="qa-dialogue-note">Pertanyaan mode lokal berasal dari bank skenario.</p>}
  </main>;
}

export function QADialoguePractice() {
  const [scenarioId, setScenarioId] = useState(() => {
    const index = Math.floor(Math.random() * ROLEPLAY_STARTERS.length);
    return ROLEPLAY_STARTERS[index].id;
  });
  const scenario = ROLEPLAY_STARTERS.find(item => item.id === scenarioId)!;
  return <>
    <label className="qa-scenario-picker" htmlFor="qa-scenario">Skenario roleplay
      <span className="qa-scenario-field">
        <select id="qa-scenario" value={scenarioId} onChange={event => setScenarioId(event.target.value)}>
          {SCENARIO_GROUPS.map(group => <optgroup key={group} label={group}>
            {ROLEPLAY_STARTERS.filter(item => item.group === group).map(item =>
              <option key={item.id} value={item.id}>{item.title}</option>)}
          </optgroup>)}
        </select>
        <span className="qa-scenario-chevron" aria-hidden="true">▾</span>
      </span>
    </label>
    <DialogueSession key={scenario.id} scenario={scenario} />
  </>;
}
