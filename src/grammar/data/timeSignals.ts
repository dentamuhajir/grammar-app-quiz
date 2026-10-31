import type { Tense } from "../types";

/**
 * Natural time expressions per tense, drawn from the PDF examples. These are
 * appended to sentences to make tenses distinguishable (e.g. nominal Future
 * Simple vs Future Continuous would otherwise look identical).
 *
 * `duration` signals (for/since/How long) are separated so WH "How long"
 * questions can drop them and plain WH questions can drop point-in-time ones.
 */
export interface TimeSet {
  point: string[];
  duration: string[];
}

export const TIME_SIGNALS: Record<Tense, TimeSet> = {
  presentSimple: { point: ["every day", "every Sunday", "usually", "on Mondays"], duration: [] },
  presentContinuous: { point: ["right now", "at the moment", "today"], duration: [] },
  presentPerfect: { point: ["already", "just", "recently"], duration: ["for 2 hours", "since 2015"] },
  presentPerfectContinuous: { point: [], duration: ["for 2 hours", "since 7 a.m.", "all day"] },
  pastSimple: { point: ["yesterday", "last week", "two days ago"], duration: [] },
  pastContinuous: { point: ["at 8 p.m. yesterday", "at that moment"], duration: [] },
  pastPerfect: { point: ["before she arrived", "by then"], duration: ["for a year"] },
  pastPerfectContinuous: { point: ["before the bus arrived"], duration: ["for two hours", "all morning"] },
  futureSimple: { point: ["tomorrow", "next week", "soon"], duration: [] },
  futureContinuous: { point: ["at 8 p.m. tomorrow", "this time next week"], duration: [] },
  futurePerfect: { point: ["by 9 p.m.", "by next year"], duration: ["for 5 years"] },
  futurePerfectContinuous: { point: [], duration: ["for 10 years by 2028", "for 3 hours by 5 p.m."] },
};
