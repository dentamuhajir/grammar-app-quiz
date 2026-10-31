import { COMPLEMENTS } from "./data/complements";
import { SUBJECTS } from "./data/subjects";
import { VERBS } from "./data/verbs";
import {
  conjugateNominal,
  conjugatePassive,
  conjugateVerbal,
} from "./engine";
import { TENSE_ORDER } from "./labels";
import type {
  Mode,
  Question,
  SentenceForm,
  Tense,
  WhWord,
} from "./types";

const FORMS: SentenceForm[] = [
  "positive",
  "negative",
  "yesNoQuestion",
  "whQuestion",
];

const WH_WORDS: WhWord[] = ["What", "Where", "When", "Why", "How"];

/** Continuous tenses cannot take stative verbs (no -ing on stative). */
const CONTINUOUS_TENSES: Tense[] = [
  "presentContinuous",
  "pastContinuous",
  "futureContinuous",
  "presentPerfectContinuous",
  "pastPerfectContinuous",
  "futurePerfectContinuous",
];

export interface QuizFilter {
  /** Restrict to one tense, or "all" for any. */
  tense: Tense | "all";
  /** Restrict to one mode, or "all" for any. */
  mode: Mode | "all";
  /** Restrict to one sentence form, or "all" for any. */
  form: SentenceForm | "all";
}

export const DEFAULT_FILTER: QuizFilter = {
  tense: "all",
  mode: "all",
  form: "all",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isContinuous(tense: Tense): boolean {
  return CONTINUOUS_TENSES.includes(tense);
}

/**
 * Generate a single random question honoring the filter and grammar rules:
 * - passive requires a transitive verb (object becomes subject)
 * - continuous tenses exclude stative verbs
 * - passive produces only +/- forms (matches the source material)
 */
export function generateQuestion(filter: QuizFilter = DEFAULT_FILTER): Question {
  // Try a bounded number of times to satisfy constraints, then relax.
  for (let attempt = 0; attempt < 60; attempt++) {
    const tense: Tense =
      filter.tense === "all" ? pick(TENSE_ORDER) : filter.tense;
    const mode: Mode =
      filter.mode === "all"
        ? pick<Mode>(["verbal", "nominal", "passive"])
        : filter.mode;

    let form: SentenceForm =
      filter.form === "all" ? pick(FORMS) : filter.form;

    // Passive only supports + and - in this app.
    if (mode === "passive" && (form === "yesNoQuestion" || form === "whQuestion")) {
      if (filter.form !== "all") continue; // user forced an unsupported combo
      form = pick<SentenceForm>(["positive", "negative"]);
    }

    const wh = form === "whQuestion" ? pick(WH_WORDS) : undefined;

    if (mode === "nominal") {
      // Continuous "being" form only makes sense with adjectives.
      const pool = isContinuous(tense)
        ? COMPLEMENTS.filter((c) => c.kind === "adjective")
        : COMPLEMENTS;
      const subject = pick(SUBJECTS);
      const complement = pick(pool);
      const answer = conjugateNominal(tense, subject, complement, form, wh);
      return { tense, mode, form, subject, complement, whWord: wh, answer };
    }

    if (mode === "passive") {
      const pool = VERBS.filter((v) => v.transitive);
      const verb = pick(pool);
      // Passive subject is the thing being acted on -> use the verb's object.
      // Keep agreement simple by using a neutral noun-phrase subject.
      const subject = pick(SUBJECTS.filter((s) => s.person === 3));
      const answer = conjugatePassive(tense, subject, verb, form);
      return { tense, mode, form, subject, verb, answer };
    }

    // verbal
    const pool = isContinuous(tense)
      ? VERBS.filter((v) => !v.stative)
      : VERBS;
    const verb = pick(pool);
    const subject = pick(SUBJECTS);
    const answer = conjugateVerbal(tense, subject, verb, form, wh);
    return { tense, mode, form, subject, verb, whWord: wh, answer };
  }

  // Fallback (should be unreachable): a safe default question.
  const subject = SUBJECTS[0];
  const verb = VERBS[0];
  return {
    tense: "presentSimple",
    mode: "verbal",
    form: "positive",
    subject,
    verb,
    answer: conjugateVerbal("presentSimple", subject, verb, "positive"),
  };
}
