import { sentenceVariants } from "./variants";
import type { Question } from "../types";
import { diffTokens, isPerfect, type DiffToken } from "./diff";
import { buildHint } from "./hints";
import { expandVariants, normalize, tokenize } from "./normalize";

export type { DiffToken } from "./diff";

export interface CheckResult {
  correct: boolean;
  /** A supported placement of the time phrase differs from the reference. */
  alternativeOrder?: boolean;
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
      hint: "Tulis kalimatmu terlebih dahulu, lalu periksa jawabannya.",
      normalizedAnswer: normalize(q.answer),
      empty: true,
    };
  }

  const userVariants = expandVariants(trimmed);
  const acceptedVariants = sentenceVariants(q);
  let best: DiffToken[] | null = null;
  let bestScore = -Infinity;
  let bestAccepted = acceptedVariants[0];
  for (const accepted of acceptedVariants) {
    const expectedTokens = tokenize(accepted);
    for (const variant of userVariants) {
      const userTokens = tokenize(variant);
      const d = diffTokens(userTokens, expectedTokens);
      const score = matchScore(d) - (userTokens.length - matchScore(d)) * 0.01;
      if (score > bestScore) {
        bestScore = score;
        bestAccepted = accepted;
        // Hints use roles from the reference sentence. Preserve those indices
        // even when the displayed diff uses a fronted time phrase.
        const timeLength = accepted !== acceptedVariants[0] ? tokenize(normalize(q.timeSignal!)).length : 0;
        best = d.map(token => ({ ...token, correctIndex: token.correctIndex === undefined ? undefined
          : timeLength ? token.correctIndex < timeLength
            ? correctTokens.length - timeLength + token.correctIndex
            : token.correctIndex - timeLength
          : token.correctIndex }));
      }
    }
  }

  const diff = best ?? [];
  const correct = isPerfect(diff) && diff.length === correctTokens.length;

  return {
    correct,
    alternativeOrder: correct && bestAccepted !== acceptedVariants[0] || undefined,
    diff,
    hint: correct ? "" : buildHint(q, diff),
    normalizedAnswer: bestAccepted,
    empty: false,
  };
}
