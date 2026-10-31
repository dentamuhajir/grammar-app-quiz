import type { Mode, SentenceForm, Tense } from "./types";

export const TENSE_LABELS: Record<Tense, string> = {
  presentSimple: "Present Simple",
  presentContinuous: "Present Continuous",
  presentPerfect: "Present Perfect",
  presentPerfectContinuous: "Present Perfect Continuous",
  pastSimple: "Past Simple",
  pastContinuous: "Past Continuous",
  pastPerfect: "Past Perfect",
  pastPerfectContinuous: "Past Perfect Continuous",
  futureSimple: "Future Simple",
  futureContinuous: "Future Continuous",
  futurePerfect: "Future Perfect",
  futurePerfectContinuous: "Future Perfect Continuous",
};

export const TENSE_ORDER: Tense[] = [
  "presentSimple",
  "presentContinuous",
  "presentPerfect",
  "presentPerfectContinuous",
  "pastSimple",
  "pastContinuous",
  "pastPerfect",
  "pastPerfectContinuous",
  "futureSimple",
  "futureContinuous",
  "futurePerfect",
  "futurePerfectContinuous",
];

export const FORM_LABELS: Record<SentenceForm, string> = {
  positive: "Positive (+)",
  negative: "Negative (−)",
  yesNoQuestion: "Yes/No Question (?)",
  whQuestion: "WH- Question",
};

export const MODE_LABELS: Record<Mode, string> = {
  verbal: "Verbal (action verb)",
  nominal: "Nominal (to be)",
  passive: "Passive Voice",
};

/** Continuous family (verbal uses -ing; rejects stative verbs). */
export const CONTINUOUS_TENSES: Tense[] = [
  "presentContinuous",
  "pastContinuous",
  "futureContinuous",
  "presentPerfectContinuous",
  "pastPerfectContinuous",
  "futurePerfectContinuous",
];

/** Perfect-continuous family: no true nominal; nominal falls back to perfect. */
export const PERFECT_CONTINUOUS_TENSES: Tense[] = [
  "presentPerfectContinuous",
  "pastPerfectContinuous",
  "futurePerfectContinuous",
];

/** Perfect family (uses "How long" naturally; supports duration signals). */
export const PERFECT_TENSES: Tense[] = [
  "presentPerfect",
  "pastPerfect",
  "futurePerfect",
  ...PERFECT_CONTINUOUS_TENSES,
];

/**
 * Passive forms that are grammatically valid but rarely used by native
 * speakers (per the PDF). Hidden from the random "All" pool; still reachable
 * by explicitly filtering to the tense.
 */
export const RARE_PASSIVE_TENSES: Tense[] = [
  "futureContinuous",
  "presentPerfectContinuous",
  "pastPerfectContinuous",
  "futurePerfectContinuous",
];

export function isContinuous(t: Tense): boolean {
  return CONTINUOUS_TENSES.includes(t);
}
export function isPerfectContinuous(t: Tense): boolean {
  return PERFECT_CONTINUOUS_TENSES.includes(t);
}
export function isPerfect(t: Tense): boolean {
  return PERFECT_TENSES.includes(t);
}
export function isRarePassive(t: Tense): boolean {
  return RARE_PASSIVE_TENSES.includes(t);
}
