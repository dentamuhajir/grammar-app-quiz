import { useState } from "react";
import {
  ARTICLE_MODE_LABELS,
  ARTICLE_TITLES,
  checkFindFixCorrection,
  checkParagraphBreakdown,
  createArticleDeck,
  findFixMistakeHint,
  findFixSpanFeedback,
  type ArticleFilter,
  type ArticleId,
  type ArticleMode,
  type ArticleQuestion,
  type BreakdownQuestion,
  type ParagraphBreakdownResult,
} from "../grammar/articles/engine";
import { BottomSheet } from "./BottomSheet";
import { SuccessBadge } from "./FeedbackIcons";
import { SpokenSentence } from "./SpokenSentence";
import { useSwipeCard } from "./useSwipeCard";

const ARTICLE_IDS = Object.keys(ARTICLE_TITLES) as ArticleId[];
const ARTICLE_MODES = Object.keys(ARTICLE_MODE_LABELS) as ArticleMode[];

function filterSummary(filter: ArticleFilter): string {
  const modeLabel =
    filter.mode === "all" ? "Semua mode" : ARTICLE_MODE_LABELS[filter.mode];
  const articleLabel =
    filter.articleId === "all"
      ? "Semua artikel"
      : ARTICLE_TITLES[filter.articleId];
  return `${modeLabel} · ${articleLabel}`;
}

function kindLabel(q: ArticleQuestion): string {
  return q.kind === "breakdown" ? "Bedah Kalimat (Tag)" : "Cari & Perbaiki";
}

function ArticleSession({ filter }: { filter: ArticleFilter }) {
  const [deck, setDeck] = useState<ArticleQuestion[]>(() =>
    createArticleDeck(filter),
  );
  const [index, setIndex] = useState(0);

  // Breakdown state
  const [activeSentenceId, setActiveSentenceId] = useState<string>("s1");
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [bdResult, setBdResult] = useState<ParagraphBreakdownResult | null>(
    null,
  );

  // Find & Fix state
  const [tappedSpanId, setTappedSpanId] = useState<string | null>(null);
  const [errorLocated, setErrorLocated] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<
    "empty" | "correct" | "incorrect" | "revealed" | null
  >(null);
  const [hintOpen, setHintOpen] = useState(false);

  const q = deck[index];
  const finished = status === "correct" || status === "revealed";

  function next() {
    if (index + 1 < deck.length) setIndex(index + 1);
    else {
      setDeck(createArticleDeck(filter, q.id));
      setIndex(0);
    }
    setActiveSentenceId("s1");
    setSelections({});
    setBdResult(null);
    setTappedSpanId(null);
    setErrorLocated(false);
    setInput("");
    setStatus(null);
    setHintOpen(false);
  }

  function toggleTagForSentence(
    question: BreakdownQuestion,
    sentenceId: string,
    tag: string,
  ) {
    if (finished) return;
    const targetSentence =
      question.sentences.find((s) => s.id === sentenceId) ??
      question.sentences[0];
    const current = selections[targetSentence.id] ?? [];
    const maxSlots = targetSentence.expectedTags.length;

    let updated: string[];
    if (current.includes(tag)) {
      updated = current.filter((t) => t !== tag);
    } else if (current.length < maxSlots) {
      updated = [...current, tag];
    } else {
      updated = [...current.slice(0, maxSlots - 1), tag];
    }

    const nextSelections = {
      ...selections,
      [targetSentence.id]: updated,
    };
    setSelections(nextSelections);
    setBdResult(null);
    setStatus(null);

    // Auto-advance to the next sentence that still has an empty slot
    if (updated.length === maxSlots && !current.includes(tag)) {
      const nextIncomplete = question.sentences.find(
        (s) =>
          s.id !== targetSentence.id &&
          (nextSelections[s.id]?.length ?? 0) < s.expectedTags.length,
      );
      if (nextIncomplete) {
        setActiveSentenceId(nextIncomplete.id);
      }
    }
  }

  function removeTagFromSentence(sentenceId: string, tag: string) {
    if (finished) return;
    const current = selections[sentenceId] ?? [];
    setSelections({
      ...selections,
      [sentenceId]: current.filter((t) => t !== tag),
    });
    setActiveSentenceId(sentenceId);
    setBdResult(null);
    setStatus(null);
  }

  function submitBreakdown(question: BreakdownQuestion) {
    if (finished) {
      next();
      return;
    }
    const res = checkParagraphBreakdown(question, selections);
    setBdResult(res);
    if (res.status === "correct") {
      setStatus("correct");
    } else if (res.status === "incorrect") {
      setStatus("incorrect");
      const firstWrong = question.sentences.find(
        (s) => !res.perSentence[s.id]?.correct,
      );
      if (firstWrong) setActiveSentenceId(firstWrong.id);
    }
  }

  function handleSpanTap(spanId: string) {
    if (finished || q.kind !== "findFix") return;
    setTappedSpanId(spanId);
    if (spanId === q.errorSpanId) {
      setErrorLocated(true);
      setStatus(null);
    } else {
      setStatus("incorrect");
    }
  }

  const { swipeHandlers, cardStyle, cardClass } = useSwipeCard({
    onSwipeLeft: next,
    onSwipeRight: () => setHintOpen(true),
  });

  const activeIndex =
    q.kind === "breakdown"
      ? Math.max(
          0,
          q.sentences.findIndex((s) => s.id === activeSentenceId),
        )
      : 0;

  return (
    <>
      <main
        className={`card article-card ${cardClass}`}
        style={cardStyle}
        {...swipeHandlers}
      >
        <div className="tags">
          <span className="tag tag-tense">{q.articleTitle}</span>
          <span className="tag tag-form">{kindLabel(q)}</span>
        </div>

        {q.kind === "breakdown" ? (
          <>
            <p className="article-question">
              Baca setiap kalimat, lalu pilih tag struktur grammar yang terdapat
              di dalamnya:
            </p>

            <div className="breakdown-sentences-stack">
              {q.sentences.map((sentence, sIdx) => {
                const chosen = selections[sentence.id] ?? [];
                const isActive =
                  !finished && sentence.id === q.sentences[activeIndex]?.id;
                const check = bdResult?.perSentence[sentence.id];
                const slotCount = sentence.expectedTags.length;

                let cardStateClass = "";
                if (finished) cardStateClass = "ok";
                else if (check && !check.correct && bdResult?.status === "incorrect")
                  cardStateClass = "bad";
                else if (isActive) cardStateClass = "active";

                return (
                  <div
                    key={sentence.id}
                    className={`breakdown-sentence-card ${cardStateClass}`}
                    onClick={() => {
                      if (!finished) setActiveSentenceId(sentence.id);
                    }}
                  >
                    <div className="breakdown-sentence-header">
                      <span className="breakdown-sentence-num">
                        Kalimat {sIdx + 1}
                      </span>
                      <span className="breakdown-sentence-req">
                        {finished
                          ? "✓ Terbedah"
                          : `${chosen.length}/${slotCount} struktur`}
                      </span>
                    </div>

                    <p className="breakdown-sentence-text" lang="en">
                      {sentence.text}
                    </p>

                    {!finished ? (
                      <div className="breakdown-slots">
                        {chosen.map((tag) => {
                          const isWrong =
                            bdResult?.status === "incorrect" &&
                            check?.wrongTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              className={`breakdown-slot-pill filled ${
                                isWrong ? "bad" : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTagFromSentence(sentence.id, tag);
                              }}
                              title="Ketuk untuk melepas tag"
                            >
                              <span>{tag}</span>
                              <span aria-hidden="true">✕</span>
                            </button>
                          );
                        })}
                        {Array.from({
                          length: Math.max(0, slotCount - chosen.length),
                        }).map((_, emptyIdx) => (
                          <span
                            key={emptyIdx}
                            className="breakdown-slot-pill empty"
                          >
                            + Pilih tag struktur
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="breakdown-evidence-list">
                        {sentence.evidence.map((ev, evIdx) => (
                          <span key={evIdx} className="breakdown-evidence-chip">
                            <strong lang="en">“{ev.phrase}”</strong> → {ev.tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!finished && (
              <div className="breakdown-bank-box">
                <p className="breakdown-bank-label">
                  Bank Tag Struktur (dipasang ke{" "}
                  <strong>Kalimat {activeIndex + 1}</strong>):
                </p>
                <div className="breakdown-tag-bank">
                  {q.tagBank.map((tag) => {
                    const activeId = q.sentences[activeIndex]?.id ?? "s1";
                    const inActive = (selections[activeId] ?? []).includes(tag);
                    const usedInIdx = q.sentences.findIndex((s) =>
                      (selections[s.id] ?? []).includes(tag),
                    );
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`breakdown-bank-btn ${
                          inActive
                            ? "active"
                            : usedInIdx !== -1
                              ? "used"
                              : ""
                        }`}
                        onClick={() =>
                          toggleTagForSentence(q, activeId, tag)
                        }
                      >
                        <span>{tag}</span>
                        {usedInIdx !== -1 && (
                          <span className="breakdown-bank-badge">
                            K{usedInIdx + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="article-passage" lang="en">
              <p className="article-passage-meta">{q.category}</p>
              <p className="article-passage-text">
                {q.segments.map((seg, idx) => {
                  if (!seg.spanId) {
                    return <span key={idx}>{seg.text}</span>;
                  }

                  const isErrorSpan = seg.spanId === q.errorSpanId;
                  const isTapped = tappedSpanId === seg.spanId;

                  let spanClass = "article-phrase-btn";
                  if (finished && isErrorSpan) {
                    spanClass += " ok";
                  } else if (errorLocated && isErrorSpan) {
                    spanClass += " selected";
                  } else if (isTapped && status === "incorrect") {
                    spanClass += " bad";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={spanClass}
                      disabled={finished || errorLocated}
                      onClick={() => handleSpanTap(seg.spanId!)}
                    >
                      {seg.text}
                    </button>
                  );
                })}
              </p>
            </div>

            <div className="article-findfix-area">
              {!errorLocated && !finished ? (
                <p className="article-question">
                  Langkah 1: Ketuk bagian di paragraf yang mengandung kesalahan
                  grammar.
                </p>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (finished) next();
                    else setStatus(checkFindFixCorrection(q, input));
                  }}
                >
                  <p className="article-question">
                    Langkah 2: Perbaiki frasa{" "}
                    <mark className="article-error-pill">{q.wrongText}</mark>{" "}
                    menjadi bentuk yang benar:
                  </p>
                  <div className="answer-input">
                    <input
                      id="article-fix-answer"
                      value={input}
                      readOnly={finished}
                      aria-label="Perbaikan frasa"
                      placeholder="Ketik perbaikan yang tepat…"
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      onChange={(event) => {
                        setInput(event.target.value);
                        setStatus(null);
                      }}
                      className={
                        status === "correct"
                          ? "ok"
                          : status === "incorrect"
                            ? "bad"
                            : ""
                      }
                      aria-invalid={status === "incorrect"}
                    />
                  </div>
                  {!finished && (
                    <div className="actions basics-actions">
                      <button className="btn btn-primary" type="submit">
                        Periksa perbaikan
                      </button>
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => setStatus("revealed")}
                      >
                        Lihat jawaban
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </>
        )}

        <div aria-live="polite" aria-atomic="true">
          {status === "empty" && (
            <p className="hint hint-plain basics-feedback">
              Ketik perbaikan terlebih dahulu.
            </p>
          )}

          {q.kind === "breakdown" && bdResult?.status === "incomplete" && (
            <p className="hint hint-plain basics-feedback">
              {bdResult.message}
            </p>
          )}

          {status === "incorrect" && (
            <div className="feedback feedback-bad basics-feedback">
              <strong>Belum tepat — coba lagi.</strong>
              <p className="hint">
                {q.kind === "breakdown"
                  ? bdResult?.message ?? q.hint
                  : !errorLocated && tappedSpanId
                    ? findFixSpanFeedback(q, tappedSpanId)
                    : findFixMistakeHint(q, input)}
              </p>
            </div>
          )}

          {finished && (
            <div
              className={`feedback basics-feedback ${
                status === "correct" ? "feedback-ok" : "feedback-reveal"
              }`}
            >
              {status === "correct" ? (
                <span className="feedback-title">
                  <SuccessBadge />
                  <span>Benar!</span>
                </span>
              ) : (
                <strong>
                  {q.kind === "findFix"
                    ? `Jawaban: ${q.correction}`
                    : "Hasil Bedah Kalimat"}
                </strong>
              )}
              <SpokenSentence text={q.spokenSentence} />
              <p className="basics-explanation">{q.explanation}</p>
            </div>
          )}
        </div>

        <div className="actions basics-actions">
          {finished ? (
            <button className="btn btn-primary" type="button" onClick={next}>
              Soal berikutnya →
            </button>
          ) : q.kind === "breakdown" ? (
            <>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => submitBreakdown(q)}
              >
                Periksa Bedah Kalimat
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setStatus("revealed")}
              >
                Lihat jawaban
              </button>
            </>
          ) : (
            !errorLocated && (
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setStatus("revealed")}
              >
                Lihat jawaban
              </button>
            )
          )}
        </div>

        <p className="swipe-hint">
          ← Geser kiri: soal baru · Geser kanan: hint →
        </p>
      </main>

      <BottomSheet
        open={hintOpen}
        onClose={() => setHintOpen(false)}
        title="Hint & Aturan Artikel"
      >
        <div className="sheet-content-stack">
          <div className="tags">
            <span className="tag tag-tense">{q.articleTitle}</span>
            <span className="tag">
              {q.kind === "findFix" ? q.rule : kindLabel(q)}
            </span>
          </div>
          <p className="note">💡 {q.hint}</p>
          {finished && <p className="basics-explanation">{q.explanation}</p>}
        </div>
      </BottomSheet>
    </>
  );
}

export function ArticlePractice() {
  const [filter, setFilter] = useState<ArticleFilter>({
    mode: "all",
    articleId: "all",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="filter-pill-bar"
        onClick={() => setFiltersOpen(true)}
      >
        <span className="filter-toggle-text">
          <span className="filter-toggle-label">Filter Article Lab</span>
          <span className="filter-toggle-summary">{filterSummary(filter)}</span>
        </span>
        <span className="filter-pill-action">⚙ Pilih</span>
      </button>

      <ArticleSession
        key={`${filter.mode}-${filter.articleId}`}
        filter={filter}
      />

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter Article Lab"
      >
        <div className="sheet-form">
          <label htmlFor="article-mode-filter">
            <span>Mode Latihan</span>
            <select
              id="article-mode-filter"
              value={filter.mode}
              onChange={(event) =>
                setFilter({
                  ...filter,
                  mode: event.target.value as ArticleFilter["mode"],
                })
              }
            >
              <option value="all">
                Semua mode (Bedah Kalimat + Cari &amp; Perbaiki)
              </option>
              {ARTICLE_MODES.map((mode) => (
                <option value={mode} key={mode}>
                  {ARTICLE_MODE_LABELS[mode]}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="article-topic-filter">
            <span>Pilih Artikel</span>
            <select
              id="article-topic-filter"
              value={filter.articleId}
              onChange={(event) =>
                setFilter({
                  ...filter,
                  articleId: event.target.value as ArticleFilter["articleId"],
                })
              }
            >
              <option value="all">
                Semua artikel ({ARTICLE_IDS.length} artikel)
              </option>
              {ARTICLE_IDS.map((id) => (
                <option value={id} key={id}>
                  {ARTICLE_TITLES[id]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFiltersOpen(false)}
          >
            Terapkan Filter
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
