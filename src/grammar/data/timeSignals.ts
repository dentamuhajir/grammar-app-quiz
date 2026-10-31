import type { SentenceForm, Tense } from "../types";

/**
 * Time expressions per tense, drawn from the PDF examples.
 *
 * Each signal knows:
 * - pos: where it goes in the sentence.
 *     "mid" = frequency/time adverbs (usually, already, just) that sit before
 *             the main verb, i.e. after the first auxiliary or "be"
 *             ("Do you usually…", "She has just…", "She is usually…").
 *     "end" = phrases that close the clause ("yesterday", "for two hours").
 * - duration: "for/since/all ..." phrases. Dropped in "How long" questions.
 * - anchor: a deadline/reference point ("by 2028", "before the bus arrived")
 *           that can accompany a "How long" question.
 * - forms: restrict to some sentence forms ("yet" only in negatives and
 *          yes/no questions, "already" not in negatives, ...).
 *
 * Signals are grouped by what they describe:
 * - action: verbal and passive sentences
 * - state:  nominal sentences with an adjective or place complement
 * - role:   nominal sentences with a noun complement (a doctor, students)
 */
export interface TimeSignal {
  text: string;
  pos: "mid" | "end";
  duration?: boolean;
  anchor?: boolean;
  forms?: SentenceForm[];
}

export interface TenseSignals {
  action: TimeSignal[];
  state: TimeSignal[];
  role: TimeSignal[];
}

const end = (text: string, forms?: SentenceForm[]): TimeSignal => ({ text, pos: "end", forms });
const mid = (text: string, forms?: SentenceForm[]): TimeSignal => ({ text, pos: "mid", forms });
const dur = (text: string, forms?: SentenceForm[]): TimeSignal => ({ text, pos: "end", duration: true, forms });
const anchor = (text: string): TimeSignal => ({ text, pos: "end", anchor: true });

// Perfect simple + a duration only reads naturally in the negative
// ("She hasn't cooked dinner for two weeks"), not in "She has cooked dinner for two weeks".
const NEG: SentenceForm[] = ["negative"];

export const TIME_SIGNALS: Record<Tense, TenseSignals> = {
  presentSimple: {
    action: [
      end("every day"),
      end("every Sunday"),
      end("on Mondays"),
      mid("usually"),
      mid("often"),
      mid("always"),
    ],
    state: [mid("usually"), mid("often"), mid("always")],
    role: [],
  },
  presentContinuous: {
    action: [end("right now"), end("at the moment"), end("today")],
    state: [end("right now"), end("at the moment"), end("today")],
    role: [],
  },
  presentPerfect: {
    action: [
      mid("already", ["positive", "whQuestion"]),
      mid("just", ["positive", "yesNoQuestion", "whQuestion"]),
      end("yet", ["negative", "yesNoQuestion"]),
      end("recently"),
      end("this week"),
      dur("for two weeks", NEG),
    ],
    state: [end("recently"), end("lately"), end("this week"), dur("for three days"), dur("since Monday")],
    role: [dur("since 2015"), dur("for two years")],
  },
  presentPerfectContinuous: {
    action: [dur("for two hours"), dur("since 7 a.m."), dur("all day")],
    // nominal falls back to the present perfect
    state: [dur("for three days"), dur("since Monday")],
    role: [dur("since 2015"), dur("for two years")],
  },
  pastSimple: {
    action: [end("yesterday"), end("last week"), end("two days ago")],
    state: [end("yesterday"), end("last week"), end("two days ago")],
    role: [end("last year"), end("in 2020")],
  },
  pastContinuous: {
    action: [end("at 8 p.m. yesterday"), end("at that moment"), end("when I called")],
    state: [end("yesterday"), end("at that moment")],
    role: [],
  },
  pastPerfect: {
    action: [anchor("before she arrived"), anchor("before the meeting"), end("by then"), dur("for a year", NEG)],
    state: [anchor("before the test started"), dur("for a week")],
    role: [anchor("before she moved"), dur("for a year")],
  },
  pastPerfectContinuous: {
    action: [
      dur("for two hours"),
      dur("all morning"),
      anchor("before the bus arrived"),
      anchor("before the lights went out"),
    ],
    // nominal falls back to the past perfect
    state: [anchor("before the test started"), dur("for a week")],
    role: [anchor("before she moved"), dur("for a year")],
  },
  futureSimple: {
    action: [end("tomorrow"), end("next week"), end("soon")],
    state: [end("tomorrow"), end("next week"), end("soon")],
    role: [end("next year"), end("one day")],
  },
  futureContinuous: {
    action: [end("at 8 p.m. tomorrow"), end("this time next week")],
    state: [end("tomorrow morning"), end("at 8 p.m. tomorrow")],
    role: [],
  },
  futurePerfect: {
    action: [anchor("by 9 p.m."), anchor("by next year"), anchor("by tomorrow")],
    state: [anchor("by December"), dur("for a week by Friday")],
    role: [anchor("by 2030"), dur("for five years by 2030")],
  },
  futurePerfectContinuous: {
    action: [
      dur("for ten years by 2028"),
      dur("for three hours by 5 p.m."),
      anchor("by 2028"),
      anchor("by 5 p.m."),
    ],
    // nominal falls back to the future perfect
    state: [anchor("by December"), dur("for a week by Friday")],
    role: [anchor("by 2030"), dur("for five years by 2030")],
  },
};
