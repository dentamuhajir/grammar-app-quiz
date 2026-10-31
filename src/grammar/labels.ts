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
