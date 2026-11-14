import { useState } from "react";
import {
  ARTICLE_MODE_LABELS,
  ARTICLE_TITLES,
  checkBreakdownAnswer,
  checkFindFixCorrection,
  createArticleDeck,
  findFixMistakeHint,
  findFixSpanFeedback,
  spotTapFeedback,
  type ArticleFilter,
  type ArticleId,
  type ArticleMode,
  type ArticleQuestion,
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
  if (q.kind === "diagnose") return "Identifikasi Struktur";
  if (q.kind === "spot") return "Cari di Artikel";
  return "Cari & Perbaiki";
}

function ArticleSession({ filter }: { filter: ArticleFilter }) {
  const [deck, setDeck] = useState<ArticleQuestion[]>(() =>
    createArticleDeck(filter),
  );
  const [index, setIndex] = useState(0);
  const [chosenOption, setChosenOption] = useState<string | null>(null);
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
    setChosenOption(null);
    setTappedSpanId(null);
    setErrorLocated(false);
    setInput("");
    setStatus(null);
    setHintOpen(false);
  }

  function handleOptionClick(option: string) {
    if (finished || q.kind !== "diagnose") return;
    setChosenOption(option);
    setStatus(checkBreakdownAnswer(q, option));
  }

  function handleSpanTap(spanId: string) {
    if (finished) return;
    setTappedSpanId(spanId);

    if (q.kind === "spot") {
      setStatus(checkBreakdownAnswer(q, spanId));
      return;
    }

    if (q.kind === "findFix") {
      if (spanId === q.errorSpanId) {
        setErrorLocated(true);
        setStatus(null);
      } else {
        setStatus("incorrect");
      }
    }
  }

  const { swipeHandlers, cardStyle, cardClass } = useSwipeCard({
    onSwipeLeft: next,
    onSwipeRight: () => setHintOpen(true),
  });

  const acceptedSpots =
    q.kind === "spot" ? (q.acceptedSpanIds ?? [q.targetSpanId]) : [];

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

        <div className="article-passage" lang="en">
          <p className="article-passage-meta">{q.category}</p>
          <p className="article-passage-text">
            {q.segments.map((seg, idx) => {
              if (!seg.spanId) {
                return <span key={idx}>{seg.text}</span>;
              }

              if (q.kind === "diagnose") {
                const isTarget = seg.spanId === q.targetSpanId;
                return isTarget ? (
                  <mark key={idx} className="article-highlight">
                    {seg.text}
                  </mark>
                ) : (
                  <span key={idx}>{seg.text}</span>
                );
              }

              const isSpotTarget =
                q.kind === "spot" && acceptedSpots.includes(seg.spanId);
              const isErrorSpan =
                q.kind === "findFix" && seg.spanId === q.errorSpanId;
              const isTapped = tappedSpanId === seg.spanId;

              let spanClass = "article-phrase-btn";
              if (finished && (isSpotTarget || isErrorSpan)) {
                spanClass += " ok";
              } else if (
                q.kind === "findFix" &&
                errorLocated &&
                isErrorSpan
              ) {
                spanClass += " selected";
              } else if (isTapped && status === "incorrect") {
                spanClass += " bad";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  className={spanClass}
                  disabled={finished || (q.kind === "findFix" && errorLocated)}
                  onClick={() => handleSpanTap(seg.spanId!)}
                >
                  {seg.text}
                </button>
              );
            })}
          </p>
        </div>

        {q.kind === "diagnose" && (
          <>
            <p className="article-question">{q.prompt}</p>
            <div className="article-options-grid">
              {q.options?.map((option) => {
                const isChosen = chosenOption === option;
                const isAnswer = option === q.answer;
                let cls = "article-option-btn";
                if (finished && isAnswer) cls += " ok";
                else if (isChosen && status === "incorrect") cls += " bad";
                return (
                  <button
                    key={option}
                    type="button"
                    className={cls}
                    disabled={finished}
                    onClick={() => handleOptionClick(option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {q.kind === "spot" && (
          <p className="article-question">{q.prompt}</p>
        )}

        {q.kind === "findFix" && (
          <div className="article-findfix-area">
            {!errorLocated && !finished ? (
              <p className="article-question">
                Langkah 1: Ketuk bagian di paragraf yang mengandung kesalahan grammar.
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
        )}

        <div aria-live="polite" aria-atomic="true">
          {status === "empty" && (
            <p className="hint hint-plain basics-feedback">
              Ketik perbaikan terlebih dahulu.
            </p>
          )}

          {status === "incorrect" && (
            <div className="feedback feedback-bad basics-feedback">
              <strong>Belum tepat — coba lagi.</strong>
              <p className="hint">
                {q.kind === "diagnose"
                  ? q.hint
                  : q.kind === "spot" && tappedSpanId
                    ? spotTapFeedback(q, tappedSpanId)
                    : q.kind === "findFix" && !errorLocated && tappedSpanId
                      ? findFixSpanFeedback(q, tappedSpanId)
                      : q.kind === "findFix"
                        ? findFixMistakeHint(q, input)
                        : q.hint}
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
                  Jawaban:{" "}
                  {q.kind === "findFix" ? q.correction : q.answer}
                </strong>
              )}
              <SpokenSentence text={q.spokenSentence} />
              <p className="basics-explanation">{q.explanation}</p>
            </div>
          )}
        </div>

        <div className="actions basics-actions">
          {finished ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={next}
            >
              Soal berikutnya →
            </button>
          ) : (
            (q.kind !== "findFix" || !errorLocated) && (
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
              <option value="all">Semua mode (Bedah + Cari &amp; Perbaiki)</option>
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
              <option value="all">Semua artikel (5 artikel)</option>
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

