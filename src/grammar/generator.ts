import {
  ADJECTIVE_COMPLEMENTS,
  BEHAVIORAL_ADJECTIVES,
  COMPLEMENTS,
} from "./data/complements";
import { PERSON_SUBJECTS, SUBJECTS } from "./data/subjects";
import { DYNAMIC_VERBS, PASSIVE_VERBS, STATIVE_VERBS, VERBS } from "./data/verbs";
import { TIME_SIGNALS } from "./data/timeSignals";
import {
  conjugateNominal,
  conjugatePassive,
  conjugateVerbal,
} from "./engine";
import {
  TENSE_ORDER,
  isContinuous,
  isPerfectContinuous,
  isRarePassive,
} from "./labels";
import type {
  Complement,
  Mode,
  Question,
  SentenceForm,
  Subject,
  Tense,
  Verb,
  WhWord,
} from "./types";

const FORMS: SentenceForm[] = [
  "positive",
  "negative",
  "yesNoQuestion",
  "whQuestion",
];

export interface QuizFilter {
  tense: Tense | "all";
  mode: Mode | "all";
  form: SentenceForm | "all";
  /** Include rarely-used forms and the stative trap drill. */
  includeRare: boolean;
}

export const DEFAULT_FILTER: QuizFilter = {
  tense: "all",
  mode: "all",
  form: "all",
  includeRare: false,
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybe<T>(arr: T[]): T | undefined {
  return arr.length ? pick(arr) : undefined;
}

/** Capitalize a display chip (subjects are stored lowercase). */
export function displayCap(s: string): string {
  return s === "i" ? "I" : s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------- time signals ----------

function timeFor(tense: Tense, wh: WhWord | undefined): string | undefined {
  const set = TIME_SIGNALS[tense];
  // "When" asks for the time -> drop point signals. "How long" asks for the
  // duration -> drop duration signals.
  if (wh === "When") return maybe(set.duration);
  if (wh === "How long") return maybe(set.point);
  // ~55% of statements get a time signal, preferring point-in-time.
  if (Math.random() < 0.55) {
    return maybe([...set.point, ...set.duration]);
  }
  return undefined;
}

// ---------- WH-word selection ----------

function whForVerbal(verb: Verb): WhWord {
  const options: WhWord[] = ["Why", "When"];
  if (verb.transitive && verb.object) options.push("What"); // replaces object
  if (verb.object === "fast" || verb.object === "well" || verb.object === "hard") {
    options.push("How"); // manner adverbs answer "how"
  }
  return pick(options);
}

function whForNominal(comp: Complement): WhWord {
  const options: WhWord[] = ["Why", "When"];
  if (comp.kind === "noun") options.push("What"); // "What is she?" (role)
  if (comp.kind === "adverb") options.push("Where"); // place
  if (comp.kind === "adjective") options.push("How"); // "How is she?"
  return pick(options);
}

function whForPassive(): WhWord {
  return pick<WhWord>(["Why", "When", "Where"]);
}

// ---------- builders per mode ----------

function buildVerbal(tense: Tense, form: SentenceForm, allowStative: boolean): Question {
  const pool = isContinuous(tense)
    ? DYNAMIC_VERBS
    : allowStative
      ? VERBS
      : DYNAMIC_VERBS;
  const verb = pick(pool);
  const subject = pickSubjectFor(verb);
  const wh = form === "whQuestion" ? whForVerbal(verb) : undefined;
  const time = timeFor(tense, wh);
  const answer = conjugateVerbal(tense, subject, verb, form, { wh, tail: time });
  return {
    tense,
    mode: "verbal",
    form,
    subject,
    verb,
    whWord: wh,
    timeSignal: time,
    answer,
  };
}

/** Avoid "the dog develops the app": match subject entity to the verb. */
function pickSubjectFor(verb: Verb): Subject {
  // Animals/things only pair with physical, non-professional verbs.
  const simplePhysical = new Set([
    "sleep", "run", "swim", "eat", "drink", "play", "catch", "find",
    "wait", "follow", "pull", "push", "watch", "hear",
  ]);
  let pool = SUBJECTS;
  if (!simplePhysical.has(verb.base)) {
    pool = SUBJECTS.filter((s) => s.entity === "person");
  }
  return pick(pool);
}

function buildNominal(tense: Tense, form: SentenceForm): Question {
  const useBeing =
    isContinuous(tense) && !isPerfectContinuous(tense) && Math.random() < 0.6;

  // choose complement pool
  let comp: Complement;
  if (useBeing) {
    comp = pick(BEHAVIORAL_ADJECTIVES); // only behavioral adjectives take "being"
  } else if (isContinuous(tense) && !isPerfectContinuous(tense)) {
    comp = pick(ADJECTIVE_COMPLEMENTS); // continuous without being -> still adj
  } else {
    comp = pick(COMPLEMENTS);
  }

  // choose a subject that doesn't make the complement a tautology / nonsense
  const subject = pickSubjectForComplement(comp);
  const wh = form === "whQuestion" ? whForNominal(comp) : undefined;
  const time = timeFor(tense, wh);

  const answer = conjugateNominal(tense, subject, comp, form, {
    wh,
    being: useBeing,
    tail: time,
  });

  let note: string | undefined;
  if (isPerfectContinuous(tense)) {
    note =
      "This tense has no nominal form, so it falls back to the perfect (…has/had/will have been…).";
  }

  return {
    tense,
    mode: "nominal",
    form,
    subject,
    complement: comp,
    whWord: wh,
    timeSignal: time,
    answer,
    note,
  };
}

function pickSubjectForComplement(comp: Complement): Subject {
  let pool = SUBJECTS;
  // professions/roles -> people only
  if (comp.kind === "noun") {
    pool = SUBJECTS.filter((s) => s.entity === "person");
  }
  // avoid "the engineer is an engineer"
  const root = comp.text.replace(/^(a|an|the) /, "").replace(/^good /, "");
  pool = pool.filter((s) => !s.text.includes(root));
  return pick(pool.length ? pool : SUBJECTS);
}

function buildPassive(tense: Tense, form: SentenceForm): Question {
  const verb = pick(PASSIVE_VERBS);
  // Active doer (agent) is a person; passive subject is the verb's object.
  // Avoid the agent coinciding with the object (e.g. children helped children).
  const objRoot = verb.object.replace(/^(a|an|the) /, "");
  const agentPool = PERSON_SUBJECTS.filter((s) => !s.text.includes(objRoot));
  const agent = pick(agentPool.length ? agentPool : PERSON_SUBJECTS);
  const passiveSubject = {
    text: verb.object, // e.g. "the lesson"
    person: 3 as const,
    number: verb.objectNumber,
  };
  // Active prompt shown to the learner: "The teacher + explain + the lesson".
  const activePrompt = `${displayCap(agent.text)} ${formatActiveVerb(tense, agent, verb)} ${verb.object}`.trim();

  const wh = form === "whQuestion" ? whForPassive() : undefined;
  const time = timeFor(tense, wh);
  // Name the doer with its object pronoun (by him) or noun text (by the teacher).
  const byAgent = agent.objectForm ?? agent.text;

  const base = conjugatePassive(tense, passiveSubject, verb, form, {
    wh,
    byAgent,
  });
  const answer = time ? appendTail(base, time) : base;

  return {
    tense,
    mode: "passive",
    form,
    subject: agent,
    verb,
    whWord: wh,
    timeSignal: time,
    answer,
    activePrompt,
    rare: isRarePassive(tense),
    note: isRarePassive(tense)
      ? "Grammatically valid but rarely used by native speakers."
      : undefined,
  };
}

/** Render the active-voice verb cluster for the passive prompt. */
function formatActiveVerb(tense: Tense, agent: Subject, verb: Verb): string {
  // Reuse the verbal engine to get a natural active form, then strip subject.
  const sentence = conjugateVerbal(tense, agent, verb, "positive");
  // sentence = "The teacher explains the lesson." -> take middle verb phrase
  const withoutSubject = sentence.slice(displayCap(agent.text).length).trim();
  // remove trailing object + period
  const noPeriod = withoutSubject.replace(/\.$/, "");
  const obj = verb.object;
  return noPeriod.endsWith(obj) ? noPeriod.slice(0, -obj.length).trim() : noPeriod;
}

/** Insert a time signal before the final punctuation, avoiding double periods. */
function appendTail(sentence: string, tail: string): string {
  const punct = sentence.slice(-1); // "." or "?"
  const body = sentence.slice(0, -1).trimEnd();
  const combined = `${body} ${tail}`.trimEnd();
  // tail may itself end in an abbreviation period ("p.m.")
  if (punct === "." && combined.endsWith(".")) return combined;
  if (punct === "?" && combined.endsWith(".")) return combined.slice(0, -1) + "?";
  return combined + punct;
}

// ---------- public generator ----------

/**
 * Generate one random question honoring the filter and grammar rules.
 * Returns null-free Question. Impossible filter combos are handled by the UI
 * (it disables them), but we still guard here.
 */
export function generateQuestion(filter: QuizFilter = DEFAULT_FILTER): Question {
  for (let attempt = 0; attempt < 80; attempt++) {
    const tense: Tense =
      filter.tense === "all" ? pickTense(filter) : filter.tense;
    const mode: Mode = filter.mode === "all" ? pickMode() : filter.mode;
    let form: SentenceForm = filter.form === "all" ? pick(FORMS) : filter.form;

    // Rare passive tenses excluded from the random pool unless opted in or
    // the user explicitly selected that tense.
    if (
      mode === "passive" &&
      isRarePassive(tense) &&
      !filter.includeRare &&
      filter.tense === "all"
    ) {
      continue;
    }

    // Perfect-continuous has no real nominal; only offer it when the user
    // explicitly wants to see the fallback (tense selected) — otherwise skip
    // to keep "All" clean of mislabeled sentences.
    if (
      mode === "nominal" &&
      isPerfectContinuous(tense) &&
      filter.tense === "all"
    ) {
      continue;
    }

    const allowStative = filter.includeRare;

    if (mode === "verbal") return buildVerbal(tense, form, allowStative);
    if (mode === "nominal") return buildNominal(tense, form);
    // passive
    return buildPassive(tense, form);
  }

  // Fallback: a guaranteed-valid simple question.
  return buildVerbal("presentSimple", "positive", false);
}

function pickTense(_filter: QuizFilter): Tense {
  return pick(TENSE_ORDER);
}

function pickMode(): Mode {
  return pick<Mode>(["verbal", "nominal", "passive"]);
}

/** Generate a stative-verb "trap" question (fallback-to-perfect drill). */
export function generateStativeTrap(): Question {
  const verb = pick(STATIVE_VERBS);
  const subject = pick(PERSON_SUBJECTS);
  // Intended tense is a continuous one; correct answer uses the perfect.
  const correct = conjugateVerbal("presentPerfect", subject, verb, "positive", {
    tail: "for years",
  });
  return {
    tense: "presentPerfectContinuous",
    mode: "verbal",
    form: "positive",
    subject,
    verb,
    answer: correct,
    note: `"${verb.base}" is a stative verb, so it cannot take -ing. It falls back to the Present Perfect (have/has + V3).`,
    rare: true,
  };
}

/** Whether a filter combination can produce anything. */
export function isImpossible(filter: QuizFilter): boolean {
  // All current mode/form/tense combinations are producible.
  void filter;
  return false;
}
