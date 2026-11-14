import { useState, type FormEvent } from "react";
import {
  ALL_STORY_SCENARIOS,
  RULE_SHORT_NAMES,
  STORY_LEVEL_LABELS,
  evaluateStorySubmission,
  filterStoryScenarios,
  type StoryEvaluationResult,
  type StoryFilter,
  type StoryLevel,
  type StoryMission,
  type StoryScenario,
} from "../grammar/story/engine";
import { BottomSheet } from "./BottomSheet";
import { Confetti } from "./Confetti";
import { SuccessBadge } from "./FeedbackIcons";
import { SpokenSentence } from "./SpokenSentence";
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

  const scenario: StoryScenario = scenarios[index % scenarios.length];
  const liveEval = evaluateStorySubmission(scenario, text);
  const activeEval = evaluation ?? liveEval;
  const allComplete = evaluation?.status === "complete";

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
  }

  function handleTrySample() {
    setText(scenario.sampleStory);
    const res = evaluateStorySubmission(scenario, scenario.sampleStory);
    setEvaluation(res);
    setSampleOpen(true);
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
                <strong>{activeEval.sentenceCount}</strong> kalimat
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

          <textarea
            id="story-textarea"
            className="answer-input story-textarea"
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

          <div className="actions">
            <button type="submit" className="btn-primary">
              Periksa Jawaban
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={handleTrySample}
            >
              Isi Contoh
            </button>
            <button type="button" className="btn-ghost" onClick={nextScenario}>
              Berikutnya →
            </button>
          </div>
        </form>

        {/* 4. TAMPILAN HASIL & KOREKSI (THE EVALUATION SCREEN) */}
        {evaluation && evaluation.status === "empty" && (
          <div className="feedback feedback-warn" role="status">
            <p className="feedback-title">Kotak cerita masih kosong</p>
            <p className="feedback-hint">
              Ketik cerita singkat Anda atau tekan <strong>Isi Contoh</strong>{" "}
              untuk melihat simulasi bedah paragraf visual.
            </p>
          </div>
        )}

        {evaluation && evaluation.status !== "empty" && (
          <section
            className={`story-eval-box ${
              allComplete ? "eval-complete" : "eval-incomplete"
            }`}
            role="status"
            aria-label="Hasil Bedah Paragraf Visual"
          >
            <div className="story-eval-header">
              {allComplete ? (
                <p className="feedback-title">
                  <SuccessBadge /> Misi Selesai Sempurna! (3/3 Grammar Terpenuhi)
                </p>
              ) : (
                <p className="feedback-title">
                  Bedah Paragraf Visual ({evaluation.passedCount}/
                  {evaluation.totalCount} Misi Terpenuhi)
                </p>
              )}
            </div>

            {/* Color-coded paragraph display */}
            <div className="story-dissected-paragraph">
              <p className="story-dissected-label">
                Hasil Bedah Teks Anda (Color-Coded Highlighting):
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

            {/* Feedback Khusus untuk misi yang belum selesai */}
            {!allComplete && (
              <div className="story-feedback-list">
                <p className="story-dissected-label">
                  Feedback & Saran Perbaikan:
                </p>
                {evaluation.missions
                  .filter((m) => !m.passed)
                  .map((m) => (
                    <div
                      key={m.mission.id}
                      className={`story-feedback-card ${
                        m.isNearMiss ? "near-miss" : ""
                      }`}
                    >
                      <span
                        className={`story-color-dot dot-${m.mission.color}`}
                      >
                        {RULE_SHORT_NAMES[m.mission.ruleId]}
                      </span>
                      <p>{m.feedback}</p>
                    </div>
                  ))}
              </div>
            )}

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
      <div className="filter-bar">
        <button
          type="button"
          className="filter-trigger"
          onClick={() => setSheetOpen(true)}
        >
          <span className="filter-trigger-text">
            <span className="filter-trigger-label">Skenario Story</span>
            <span className="filter-trigger-value">{filterSummary(filter)}</span>
          </span>
          <span className="filter-trigger-Action">Pilih ▾</span>
        </button>
      </div>

      <StorySession key={filterKey} filter={filter} />

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Pilih Level & Topik Story Challenge"
      >
        <div className="filter-sheet">
          <div className="filter-group">
            <span className="filter-group-label">Tingkat Kesulitan</span>
            <div className="topic-grid">
              <button
                type="button"
                className={`topic-chip ${
                  filter.level === "all" && filter.scenarioId === "all"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setFilter({ level: "all", scenarioId: "all" });
                  setSheetOpen(false);
                }}
              >
                Semua Level ({ALL_STORY_SCENARIOS.length})
              </button>
              {STORY_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`topic-chip ${
                    filter.level === lvl && filter.scenarioId === "all"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setFilter({ level: lvl, scenarioId: "all" });
                    setSheetOpen(false);
                  }}
                >
                  {STORY_LEVEL_LABELS[lvl]}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-group-label">Pilih Topik Langsung</span>
            <div className="topic-grid">
              {ALL_STORY_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  className={`topic-chip ${
                    filter.scenarioId === sc.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setFilter({ level: sc.level, scenarioId: sc.id });
                    setSheetOpen(false);
                  }}
                >
                  {LEVEL_BADGE_EMOJI[sc.level]} · {sc.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
