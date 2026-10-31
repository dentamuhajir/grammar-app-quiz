import type { Question } from "../types";
import { diffTokens, isPerfect, type DiffToken } from "./diff";
import { buildHint } from "./hints";
import { expandVariants, normalize, tokenize } from "./normalize";

export type { DiffToken } from "./diff";

export interface CheckResult {
  correct: boolean;
  /** token-level diff of the chosen variant against the answer */
  diff: DiffToken[];
  /** a single targeted hint (empty when correct) */
  hint: string;
  /** normalized correct answer, for display */
  normalizedAnswer: string;
  /** whether the user typed anything at all */
  empty: boolean;
}

/** Count matched tokens (for choosing the best variant). */
function matchScore(diff: DiffToken[]): number {
  return diff.reduce((n, d) => n + (d.op === "match" ? 1 : 0), 0);
}

/**
 * Check a user's answer against the question's correct sentence.
 * - Tolerant of case, spacing, punctuation, and contractions.
 * - Tries ambiguous contraction readings ('s = is/has) and keeps the best.
 * - Returns a word-level diff and one targeted hint when wrong.
 */
export function checkAnswer(q: Question, raw: string): CheckResult {
  const correctTokens = tokenize(normalize(q.answer));
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      correct: false,
      diff: correctTokens.map((t, i) => ({ op: "missing", correct: t, correctIndex: i })),
      hint: "Type your sentence, then check it.",
      normalizedAnswer: normalize(q.answer),
      empty: true,
    };
  }

  // Evaluate every normalized variant of the user's input; keep the best.
  let best: DiffToken[] | null = null;
  let bestScore = -1;
  for (const variant of expandVariants(trimmed)) {
    const userTokens = tokenize(variant);
    const d = diffTokens(userTokens, correctTokens);
    const score = matchScore(d) - (userTokens.length - matchScore(d)) * 0.01;
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }

  const diff = best ?? [];
  const correct = isPerfect(diff) && diff.length === correctTokens.length;

  return {
    correct,
    diff,
    hint: correct ? "" : buildHint(q, diff),
    normalizedAnswer: normalize(q.answer),
    empty: false,
  };
}
