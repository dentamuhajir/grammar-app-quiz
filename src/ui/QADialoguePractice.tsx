import { useEffect, useRef, useState, type FormEvent } from "react";
import { DIALOGUE_SCENARIOS, evaluateDialogueTurn, type DialogueHistoryItem, type DialogueIntentBranch, type DialogueScenario, type DialogueTurnEvaluation } from "../grammar/qa/dialogue";
import { computeMiniLmIntentScoresAsync, getMiniLmStatus, initMiniLmModel, subscribeMiniLmStatus } from "../grammar/story/minilm-client";
import { SpokenSentence } from "./SpokenSentence";
import { VoiceInputBar } from "./VoiceInputBar";

function DialogueSession({ scenario }: { scenario: DialogueScenario }) {
  const [nodeId, setNodeId] = useState<string | null>(scenario.initialNodeId);
  const [history, setHistory] = useState<DialogueHistoryItem[]>([]);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<DialogueTurnEvaluation | null>(null);
  const [model, setModel] = useState(getMiniLmStatus);
  const [useModel, setUseModel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const request = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const node = nodeId ? scenario.nodes[nodeId] : null;

  useEffect(() => subscribeMiniLmStatus(setModel), []);
  useEffect(() => () => { request.current++; }, []);
  useEffect(() => { if (history.length) inputRef.current?.focus(); }, [nodeId, history.length]);

  function edit(value: string) {
    request.current++;
    setBusy(false);
    setAnswer(value);
    setEvaluation(null);
    setNotice("");
  }

  async function check(event: FormEvent) {
    event.preventDefault();
    if (!node || busy) return;
    const token = ++request.current;
    const local = evaluateDialogueTurn(node, answer);
    setEvaluation(local);
    setNotice("");
    if (!useModel || !answer.trim() || !local.grammar.passed) return;
    setBusy(true);
    try {
      const result = await computeMiniLmIntentScoresAsync(`${scenario.id}-${node.id}`, node.branches, answer);
      if (token === request.current) setEvaluation(evaluateDialogueTurn(node, answer, { miniLmBranchCosines: result.branchCosines, latencyMs: result.latencyMs }));
    } catch {
      if (token === request.current) setNotice("MiniLM belum tersedia. Hasil memakai pencocokan lokal; latihan tetap dapat dilanjutkan.");
    } finally {
      if (token === request.current) setBusy(false);
    }
  }

  function advance(branch: DialogueIntentBranch) {
    if (!node || !evaluation?.grammar.passed || busy) return;
    request.current++;
    setHistory(items => [...items, { nodeId: node.id, speaker: node.speaker, question: node.question, userAnswer: answer.trim(), detectedStructure: evaluation.grammar.detectedStructure, matchedIntentId: branch.id, matchedIntentLabel: branch.label, npcReaction: branch.npcReaction }]);
    setNodeId(branch.nextNodeId);
    setAnswer("");
    setEvaluation(null);
    setNotice("");
  }

  function restart() {
    request.current++;
    setBusy(false);
    setNodeId(scenario.initialNodeId);
    setHistory([]);
    setAnswer("");
    setEvaluation(null);
    setNotice("");
  }

  return <main className="card qa-dialogue-card">
    <div className="tags"><span className="tag tag-tense">{scenario.levelBadge}</span><span className="tag">{history.length} giliran selesai</span></div>
    <h2>{scenario.title}</h2>
    <p>{scenario.contextDescription}</p>
    <details className="qa-model-settings"><summary>Pengaturan analisis topik</summary>
      <p>Pencocokan lokal aktif tanpa unduhan model. MiniLM opsional memakai worker bersama Story Challenge dan memerlukan unduhan model sekitar 23 MB, ditambah runtime.</p>
      <label><input type="checkbox" checked={useModel} onChange={e => { setUseModel(e.target.checked); request.current++; setBusy(false); setEvaluation(null); if (e.target.checked) initMiniLmModel(); }} /> Gunakan MiniLM di perangkat</label>
      {useModel && <><p role="status">{model.message}</p>{model.status === "error" && <button type="button" className="btn btn-ghost" onClick={initMiniLmModel}>Coba muat ulang model</button>}</>}
    </details>
    {history.length > 0 && <details className="qa-history" open={!node}><summary>Riwayat percakapan ({history.length} giliran)</summary>
      <ol>{history.map((item, index) => <li key={`${item.nodeId}-${index}`}>
        <p><strong>{item.speaker}:</strong> {item.question}</p>
        <p><strong>Anda:</strong> {item.userAnswer}</p>
        <small>Struktur terdeteksi: {item.detectedStructure} · Topik: {item.matchedIntentLabel}</small>
        <SpokenSentence text={item.npcReaction} />
      </li>)}</ol>
    </details>}
    {node ? <>
      {history.length > 0 && <div className="feedback feedback-reveal"><SpokenSentence text={history[history.length - 1].npcReaction} /></div>}
      <section className="qa-dialogue-question" aria-label="Pertanyaan saat ini">
        <span className="qa-speaker">{node.speaker} · {node.speakerRole}</span>
        <SpokenSentence text={node.question} />
        <details><summary>Terjemahan & petunjuk struktur</summary><p>{node.translation}</p><p><strong>{node.grammarFormula}</strong></p><p>{node.grammarHint}</p></details>
      </section>
      <form onSubmit={check}>
        <label htmlFor="dialogue-answer">Jawaban Anda dalam bahasa Inggris</label>
        <textarea ref={inputRef} id="dialogue-answer" rows={3} maxLength={1500} value={answer} onChange={e => edit(e.target.value)} placeholder="Tulis satu atau dua kalimat..." />
        <VoiceInputBar value={answer} disabled={busy} onChange={edit} />
        <div className="actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Memperkirakan topik..." : "Periksa jawaban"}</button></div>
      </form>
      <div aria-live="polite" aria-busy={busy}>
        {notice && <p role="status">{notice}</p>}
        {evaluation && <div className={`feedback ${evaluation.status === "advance" ? "feedback-ok" : "qa-feedback-partial"}`}>
          <strong>{evaluation.status === "empty" ? "Jawaban masih kosong" : "Struktur yang terdeteksi"}</strong>
          <p>{evaluation.grammar.feedback}</p>
          {evaluation.status !== "empty" && <><strong>Perkiraan topik</strong><p>{evaluation.source === "minilm-hybrid" ? "MiniLM + aturan lokal" : "Pencocokan lokal"} · {evaluation.confidenceBand === "high" ? "Arah topik cukup jelas" : "Perlu klarifikasi"}</p></>}
          {evaluation.clarificationPrompt && <p>{evaluation.clarificationPrompt}</p>}
          {evaluation.status === "grammar_retry" && <p>Coba ulangi dengan pola target. Pemeriksa ini hanya mengenali struktur terbatas; hasilnya bukan koreksi grammar menyeluruh.</p>}
          {!busy && evaluation.status === "advance" && evaluation.matchedBranch && <button type="button" className="btn btn-primary" onClick={() => advance(evaluation.matchedBranch!)}>Lanjutkan percakapan →</button>}
          {!busy && evaluation.status === "clarification_needed" && <div className="qa-clarification"><p>Pilih maksud Anda untuk mengonfirmasi arah dialog, atau perjelas jawaban lalu periksa lagi.</p>{node.branches.map(branch => <button type="button" className="btn btn-ghost" key={branch.id} onClick={() => advance(branch)}>{branch.label}</button>)}</div>}
          <small>{evaluation.limitationsNote}</small>
        </div>}
      </div>
    </> : <div className="feedback feedback-ok" role="status"><strong>Percakapan selesai!</strong><p>Anda menyelesaikan {history.length} giliran. Buka riwayat untuk meninjau jawaban dan struktur yang terdeteksi.</p></div>}
    <div className="actions"><button type="button" className="btn btn-ghost" onClick={restart}>Mulai ulang skenario</button></div>
    <p className="qa-dialogue-note">Dialog berasal dari bank skenario lokal. Perkiraan topik tidak membuktikan fakta, kesetaraan makna, atau semua grammar sudah benar.</p>
  </main>;
}

export function QADialoguePractice() {
  const [scenarioId, setScenarioId] = useState(DIALOGUE_SCENARIOS[0].id);
  const scenario = DIALOGUE_SCENARIOS.find(item => item.id === scenarioId)!;
  return <>
    <label className="qa-scenario-picker" htmlFor="qa-scenario">Skenario roleplay
      <select id="qa-scenario" value={scenarioId} onChange={e => setScenarioId(e.target.value)}>{DIALOGUE_SCENARIOS.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
    </label>
    <DialogueSession key={scenario.id} scenario={scenario} />
  </>;
}
