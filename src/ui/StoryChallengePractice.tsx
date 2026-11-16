import { useEffect, useState, type FormEvent } from "react";
import {
  ALL_STORY_SCENARIOS,
  RULE_SHORT_NAMES,
  STORY_LEVEL_LABELS,
  evaluateStorySubmission,
  filterStoryScenarios,
  getScenarioAnchors,
  type StoryEvaluationResult,
  type StoryFilter,
  type StoryLevel,
  type StoryMission,
  type StoryScenario,
} from "../grammar/story/engine";
import {
  computeMiniLmSimilarityAsync,
  getMiniLmStatus,
  subscribeMiniLmStatus,
  type MiniLmProgressEvent,
} from "../grammar/story/minilm-client";
import { BottomSheet } from "./BottomSheet";
import { Confetti } from "./Confetti";
import { SuccessBadge } from "./FeedbackIcons";
import { SpokenSentence } from "./SpokenSentence";
import { VoiceInputBar } from "./VoiceInputBar";
import { useSwipeCard } from "./useSwipeCard";

const STORY_LEVELS = Object.keys(STORY_LEVEL_LABELS) as StoryLevel[];

const LEVEL_BADGE_EMOJI: Record<StoryLevel, string> = {
  starter: "🌱 Starter",
  intermediate: "🚀 Intermediate",
  master: "🔥 Master",
};

function filterSummary(filter: StoryFilter): string {
  if (filter.scenarioId !== "all") {
    const found = ALL_STORY_SCENARIOS.find((s) => s.id === filter.scenarioId);
    if (found) return found.title;
  }
  if (filter.level === "all") {
    return `Semua Skenario (${ALL_STORY_SCENARIOS.length})`;
  }
  return STORY_LEVEL_LABELS[filter.level];
}

function StorySession({ filter }: { filter: StoryFilter }) {
  const scenarios = filterStoryScenarios(filter);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [evaluation, setEvaluation] = useState<StoryEvaluationResult | null>(
    null,
  );
  const [selectedMission, setSelectedMission] = useState<StoryMission | null>(
    null,
  );
  const [sampleOpen, setSampleOpen] = useState(false);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [miniLmState, setMiniLmState] = useState<MiniLmProgressEvent>(() =>
    getMiniLmStatus(),
  );
  const [miniLmRunning, setMiniLmRunning] = useState(false);

  useEffect(() => {
    return subscribeMiniLmStatus((st) => {
      setMiniLmState(st);
    });
  }, []);

  const scenario: StoryScenario = scenarios[index % scenarios.length];
  const liveEval = evaluateStorySubmission(scenario, text);
  const activeEval = evaluation ?? liveEval;
  const allComplete = evaluation?.status === "complete";

  async function runMiniLmForText(targetScenario: StoryScenario, rawText: string) {
    if (!rawText.trim()) return;
    setMiniLmRunning(true);
    try {
      const anchors = getScenarioAnchors(targetScenario);
      const sim = await computeMiniLmSimilarityAsync(
        targetScenario.id,
        anchors,
        rawText,
      );
      setEvaluation((prev) => {
        if (!prev) return prev;
        return evaluateStorySubmission(targetScenario, rawText, {
          miniLmSimilarity: sim.calibratedScore,
          rawMiniLmCosine: sim.rawCosine,
          latencyMs: sim.latencyMs,
        });
      });
    } catch {
      // Fallback gracefully to local semantic score already in `evaluation`
    } finally {
      setMiniLmRunning(false);
    }
  }

  function nextScenario() {
    setIndex((prev) => (prev + 1) % scenarios.length);
    setText("");
    setEvaluation(null);
    setSelectedMission(null);
    setSampleOpen(false);
  }

  function handleCheck(e: FormEvent) {
    e.preventDefault();
    const res = evaluateStorySubmission(scenario, text);
    setEvaluation(res);
    if (res.status === "complete") {
      setCelebrateKey((k) => k + 1);
      setSampleOpen(true);
    }
    if (miniLmState.status === "ready" && text.trim()) {
      void runMiniLmForText(scenario, text);
    }
  }

  function handleTrySample() {
    setText(scenario.sampleStory);
    const res = evaluateStorySubmission(scenario, scenario.sampleStory);
    setEvaluation(res);
    setSampleOpen(true);
    if (miniLmState.status === "ready") {
      void runMiniLmForText(scenario, scenario.sampleStory);
    }
  }

  function handleActivateMiniLm() {
    const currentText = text.trim() ? text : scenario.sampleStory;
    if (!text.trim()) {
      setText(scenario.sampleStory);
      setEvaluation(evaluateStorySubmission(scenario, scenario.sampleStory));
    }
    void runMiniLmForText(scenario, currentText);
  }

  function handleResetText() {
    setText("");
    setEvaluation(null);
    setSampleOpen(false);
  }

  function insertWordAtEnd(word: string) {
    setText((prev) => {
      if (!prev.trim()) return word;
      const needsSpace = !/\s$/.test(prev);
      return `${prev}${needsSpace ? " " : ""}${word}`;
    });
    setEvaluation(null);
  }

  const { swipeHandlers, cardStyle, cardClass } = useSwipeCard({
    onSwipeLeft: nextScenario,
    onSwipeRight: () => setSelectedMission(scenario.missions[0]),
  });

  return (
    <>
      <main
        key={scenario.id}
        className={`card story-challenge-card ${cardClass}`}
        style={cardStyle}
        {...swipeHandlers}
      >
        <Confetti fire={celebrateKey} />

        <div className="tags">
          <span className="tag tag-tense">Story Challenge</span>
          <span className={`tag story-level-chip level-${scenario.level}`}>
            {LEVEL_BADGE_EMOJI[scenario.level]}
          </span>
          <span className="tag tag-mode">
            {index + 1} / {scenarios.length}
          </span>
        </div>

        {/* 1. SKENARIO (TOPIK CERITA) */}
        <section className="story-scenario-box" aria-label="Skenario Cerita">
          <h2 className="story-scenario-title">{scenario.title}</h2>
          <p className="story-scenario-prompt">{scenario.scenarioPrompt}</p>

          <div className="story-keywords-bar">
            <span className="story-keywords-label">Kata Konteks:</span>
            <div className="story-keywords-list">
              {scenario.keywords.map((kw) => {
                const used = activeEval.matchedKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    type="button"
                    className={`story-keyword-pill ${used ? "used" : ""}`}
                    onClick={() => insertWordAtEnd(kw)}
                    title="Klik untuk menyisipkan kata ini"
                  >
                    {used ? "✓ " : "+ "}
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. MISI GRAMMAR (RAMPING & INLINE - KLIK UNTUK MODAL RUMUS) */}
        <section className="story-missions-box" aria-label="Misi Grammar">
          <div className="story-missions-header">
            <p className="story-box-eyebrow">
              Misi Grammar <span className="story-tap-hint">(klik untuk rumus)</span>
            </p>
            <span className="story-missions-counter">
              {activeEval.passedCount}/{activeEval.totalCount}
            </span>
          </div>

          <div className="story-mission-chips">
            {activeEval.missions.map((item) => {
              const { mission, passed } = item;
              return (
                <button
                  key={mission.id}
                  type="button"
                  className={`story-mission-chip chip-${mission.color} ${
                    passed ? "passed" : ""
                  }`}
                  onClick={() => setSelectedMission(mission)}
                >
                  <span
                    className={`story-mission-check-mini ${
                      passed ? "checked" : ""
                    }`}
                    aria-hidden="true"
                  >
                    {passed ? "✓" : ""}
                  </span>
                  <span className="story-mission-chip-text">
                    {RULE_SHORT_NAMES[mission.ruleId]}
                  </span>
                  <span className="story-mission-info-icon" aria-hidden="true">
                    ?
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. AREA INPUT TEKS (TEXT BOX) */}
        <form className="story-input-section" onSubmit={handleCheck}>
          <div className="story-input-header">
            <label className="label" htmlFor="story-textarea">
              Ketik Cerita Anda:
            </label>
            <div className="story-meta-bar">
              <span>
                <strong>{activeEval.sentenceCount}</strong>/3 kalimat ·{" "}
                <strong>{activeEval.wordCount}</strong>/15 kata
              </span>
              {text.trim().length > 0 && (
                <button
                  type="button"
                  className="story-clear-btn"
                  onClick={handleResetText}
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          <div className="answer-input">
            <textarea
              id="story-textarea"
              className="story-textarea"
              rows={4}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (evaluation) setEvaluation(null);
              }}
              placeholder="Contoh: I ran fast to the station, but the train had left before I arrived..."
              autoCapitalize="sentences"
              spellCheck={true}
            />
            <VoiceInputBar
              value={text}
              multiline={true}
              onChange={(nextVal) => {
                setText(nextVal);
                if (evaluation) setEvaluation(null);
              }}
            />
          </div>

          <div className="actions">
            <button type="submit" className="btn btn-primary">
              Periksa Jawaban
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleTrySample}
            >
              Isi Contoh
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={nextScenario}
            >
              Berikutnya →
            </button>
          </div>
        </form>

        {/* 4. TAMPILAN HASIL TERPISAH SESUAI 13.5:
            (A) Struktur & Syarat Eksplisit Terdeteksi
            (B) Perkiraan Relevansi Topik (MiniLM / Semantik)
            (C) Saran Berbasis Template (Eksploratif) */}
        {evaluation && evaluation.status === "empty" && (
          <div className="feedback feedback-warn" role="status">
            <p className="feedback-title">Kotak cerita masih kosong</p>
            <p className="feedback-hint">
              Ketik cerita singkat Anda atau tekan <strong>Isi Contoh</strong>{" "}
              untuk melihat hasil bedah struktur, perkiraan relevansi, dan saran
              berbasis template.
            </p>
          </div>
        )}

        {evaluation && evaluation.status !== "empty" && (
          <section
            className={`story-eval-box ${
              allComplete ? "eval-complete" : "eval-incomplete"
            }`}
            role="status"
            aria-label="Hasil Evaluasi Terpisah Story Challenge"
          >
            {/* PANEL 1: STRUKTUR & SYARAT EKSPLISIT TERDETEKSI (ATURAN LOKAL) */}
            <div className="story-panel-block">
              <div className="story-panel-header">
                <span className="story-panel-number">1</span>
                <div className="story-panel-title-wrap">
                  <h3 className="story-panel-title">
                    Struktur &amp; Syarat Eksplisit Terdeteksi
                  </h3>
                  <span className="story-panel-subtitle">
                    Diperiksa dengan aturan lokal (Rule-Based Engine)
                  </span>
                </div>
                {evaluation.explicitChecks.allPassed ? (
                  <span className="story-status-pill pill-ok">
                    <SuccessBadge /> Lengkap
                  </span>
                ) : (
                  <span className="story-status-pill pill-warn">
                    {evaluation.passedCount}/{evaluation.totalCount} Misi
                  </span>
                )}
              </div>

              {/* 3 Syarat Eksplisit Lokal: Struktur Target, Panjang Minimum, Format */}
              <div className="story-explicit-grid">
                <div
                  className={`story-explicit-item ${
                    evaluation.explicitChecks.targetStructures.passed
                      ? "passed"
                      : "pending"
                  }`}
                >
                  <span className="story-explicit-icon" aria-hidden="true">
                    {evaluation.explicitChecks.targetStructures.passed
                      ? "✓"
                      : "!"}
                  </span>
                  <div>
                    <strong>
                      {evaluation.explicitChecks.targetStructures.label}
                    </strong>
                    <p>{evaluation.explicitChecks.targetStructures.detail}</p>
                  </div>
                </div>

                <div
                  className={`story-explicit-item ${
                    evaluation.explicitChecks.minimumLength.passed
                      ? "passed"
                      : "pending"
                  }`}
                >
                  <span className="story-explicit-icon" aria-hidden="true">
                    {evaluation.explicitChecks.minimumLength.passed ? "✓" : "!"}
                  </span>
                  <div>
                    <strong>
                      {evaluation.explicitChecks.minimumLength.label}
                    </strong>
                    <p>{evaluation.explicitChecks.minimumLength.detail}</p>
                  </div>
                </div>

                <div
                  className={`story-explicit-item ${
                    evaluation.explicitChecks.format.passed
                      ? "passed"
                      : "pending"
                  }`}
                >
                  <span className="story-explicit-icon" aria-hidden="true">
                    {evaluation.explicitChecks.format.passed ? "✓" : "!"}
                  </span>
                  <div>
                    <strong>{evaluation.explicitChecks.format.label}</strong>
                    <p>{evaluation.explicitChecks.format.detail}</p>
                  </div>
                </div>
              </div>

              {/* Color-coded paragraph display */}
              <div className="story-dissected-paragraph">
                <p className="story-dissected-label">
                  Bedah Struktur Paragraf Anda (Color-Coded Highlighting):
                </p>
                <p className="story-dissected-text">
                  {evaluation.segments.map((seg, i) =>
                    seg.highlight ? (
                      <mark
                        key={i}
                        className={`story-hl story-hl-${seg.highlight.color}`}
                      >
                        [{seg.text}]
                        <span className="story-hl-tag">
                          {seg.highlight.ruleName}
                        </span>
                      </mark>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    ),
                  )}
                </p>
              </div>
            </div>

            {/* PANEL 2: PERKIRAAN RELEVANSI TOPIK (MINILM / SEMANTIK) */}
            <div className="story-panel-block">
              <div className="story-panel-header">
                <span className="story-panel-number">2</span>
                <div className="story-panel-title-wrap">
                  <h3 className="story-panel-title">
                    Perkiraan Relevansi Terhadap Topik
                  </h3>
                  <span className="story-panel-subtitle">
                    {evaluation.relevance.source === "minilm-hybrid"
                      ? `MiniLM-L6-v2 On-Device (384-dim${
                          evaluation.relevance.latencyMs
                            ? ` · ${evaluation.relevance.latencyMs} ms`
                            : ""
                        })`
                      : "Estimasi Vektor Semantik Multi-Anchor Lokal"}
                  </span>
                </div>
                <span
                  className={`story-status-pill relevance-${evaluation.relevance.level}`}
                >
                  {evaluation.relevance.label} (
                  {evaluation.relevance.percentage}%)
                </span>
              </div>

              <div className="story-relevance-meter-wrap">
                <div
                  className="story-relevance-meter-bar"
                  role="progressbar"
                  aria-valuenow={evaluation.relevance.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`story-relevance-meter-fill fill-${evaluation.relevance.level}`}
                    style={{ width: `${evaluation.relevance.percentage}%` }}
                  />
                </div>
              </div>

              <p className="story-relevance-summary">
                {evaluation.relevance.summary}
              </p>

              {evaluation.relevance.matchedConcepts.length > 0 && (
                <div className="story-concept-tags">
                  <span className="story-concept-label">
                    Konsep Tema Terdeteksi:
                  </span>
                  {evaluation.relevance.matchedConcepts.map((c) => (
                    <span key={c} className="story-concept-chip matched">
                      ✓ {c}
                    </span>
                  ))}
                </div>
              )}

              {/* Kontrol Opsional MiniLM On-Device Web Worker */}
              <div className="story-minilm-bar">
                {miniLmState.status === "ready" ? (
                  <span className="story-minilm-ready-badge">
                    ⚡ MiniLM-L6-v2 (q8) aktif di Web Worker HP
                    {miniLmRunning ? " · Menghitung embedding..." : ""}
                  </span>
                ) : miniLmState.status === "loading" ? (
                  <span className="story-minilm-loading-badge">
                    ⏳ {miniLmState.message}
                  </span>
                ) : (
                  <div className="story-minilm-cta">
                    <button
                      type="button"
                      className="story-minilm-btn"
                      onClick={handleActivateMiniLm}
                      disabled={miniLmRunning}
                    >
                      ⚡ Gunakan MiniLM-L6-v2 On-Device (~23 MB)
                    </button>
                    <span className="story-minilm-hint">
                      Opsional: diunduh 1x ke cache browser HP &amp; berjalan di
                      Web Worker tanpa membebani UI.
                    </span>
                  </div>
                )}
              </div>

              <p className="story-limitations-note">
                ℹ️ {evaluation.relevance.limitationsDisclaimer}
              </p>
            </div>

            {/* PANEL 3: SARAN BERBASIS TEMPLATE & EKSPLORASI */}
            <div className="story-panel-block">
              <div className="story-panel-header">
                <span className="story-panel-number">3</span>
                <div className="story-panel-title-wrap">
                  <h3 className="story-panel-title">
                    Saran Berbasis Template &amp; Eksplorasi
                  </h3>
                  <span className="story-panel-subtitle">
                    Panduan terarah &amp; saran eksploratif (bukan vonis
                    definitif)
                  </span>
                </div>
              </div>

              <div className="story-feedback-list">
                {evaluation.templateSuggestions.map((item) => (
                  <div
                    key={item.id}
                    className={`story-feedback-card ${
                      item.isExploratory
                        ? "exploratory-card"
                        : item.category === "structure"
                          ? "near-miss"
                          : ""
                    }`}
                  >
                    <span
                      className={`story-color-dot ${
                        item.isExploratory
                          ? "dot-exploratory"
                          : item.category === "length-format"
                            ? "dot-blue"
                            : "dot-purple"
                      }`}
                    >
                      {item.badge}
                    </span>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contoh Cerita Referensi + Audio TTS */}
            <div className="story-sample-toggle-wrap">
              {!sampleOpen ? (
                <button
                  type="button"
                  className="story-sample-btn"
                  onClick={() => setSampleOpen(true)}
                >
                  Lihat Contoh Cerita Referensi (Model Story) 🔊
                </button>
              ) : (
                <div className="story-sample-card">
                  <p className="story-dissected-label">
                    Contoh Cerita Referensi (Native Flow):
                  </p>
                  <div className="feedback-answer">
                    <SpokenSentence text={scenario.sampleStory} />
                  </div>
                  <p className="feedback-translation">
                    🇮🇩 <em>&ldquo;{scenario.sampleTranslation}&rdquo;</em>
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* MODAL BANTUAN RUMUS SAAT CHIP MISI DIKLIK */}
      <BottomSheet
        open={selectedMission !== null}
        onClose={() => setSelectedMission(null)}
        title="Bantuan Rumus Misi"
      >
        {selectedMission && (
          <div className="story-mission-modal">
            <div className="story-mission-modal-tabs">
              {scenario.missions.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`story-modal-tab dot-${m.color} ${
                    selectedMission.id === m.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedMission(m)}
                >
                  {RULE_SHORT_NAMES[m.ruleId]}
                </button>
              ))}
            </div>

            <div className="sentence-help-block">
              <span className="sheet-section-label">Target Misi</span>
              <p className="story-modal-target">{selectedMission.label}</p>
            </div>

            <div className="sentence-help-block">
              <span className="sheet-section-label">Rumus (Formula)</span>
              <p className="sentence-formula">{selectedMission.formula}</p>
            </div>

            <div className="sentence-help-block">
              <span className="sheet-section-label">Tips Penggunaan</span>
              <p className="sentence-glossary">{selectedMission.tip}</p>
            </div>

            <div className="sentence-help-block">
              <span className="sheet-section-label">Contoh Kalimat</span>
              <div className="story-sample-card">
                <div className="feedback-answer">
                  <SpokenSentence text={selectedMission.example} />
                </div>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}

export function StoryChallengePractice() {
  const [filter, setFilter] = useState<StoryFilter>({
    level: "all",
    scenarioId: "all",
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  const filterKey = `${filter.level}-${filter.scenarioId}`;

  return (
    <>
      <button
        type="button"
        className="filter-pill-bar"
        onClick={() => setSheetOpen(true)}
      >
        <span className="filter-toggle-text">
          <span className="filter-toggle-label">Skenario Story</span>
          <span className="filter-toggle-summary">{filterSummary(filter)}</span>
        </span>
        <span className="filter-pill-action">⚙ Pilih</span>
      </button>

      <StorySession key={filterKey} filter={filter} />

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filter Story Challenge"
      >
        <div className="sheet-form">
          <label htmlFor="story-level-filter">
            <span>Tingkat Kesulitan</span>
            <select
              id="story-level-filter"
              value={filter.level}
              onChange={(e) =>
                setFilter({
                  level: e.target.value as StoryFilter["level"],
                  scenarioId: "all",
                })
              }
            >
              <option value="all">
                Semua Level ({ALL_STORY_SCENARIOS.length} skenario)
              </option>
              {STORY_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {STORY_LEVEL_LABELS[lvl]}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="story-topic-filter">
            <span>Pilih Topik Cerita</span>
            <select
              id="story-topic-filter"
              value={filter.scenarioId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "all") {
                  setFilter({ ...filter, scenarioId: "all" });
                } else {
                  const found = ALL_STORY_SCENARIOS.find((s) => s.id === val);
                  setFilter({
                    level: found ? found.level : filter.level,
                    scenarioId: val,
                  });
                }
              }}
            >
              <option value="all">
                Semua Skenario ({ALL_STORY_SCENARIOS.length} topik)
              </option>
              {ALL_STORY_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {LEVEL_BADGE_EMOJI[sc.level]} — {sc.title}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setSheetOpen(false)}
          >
            Terapkan Filter
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
