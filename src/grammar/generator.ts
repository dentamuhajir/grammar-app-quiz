import { BEHAVIORAL_ADJECTIVES, COMPLEMENTS } from "./data/complements";
import { buildRelativeQuestion } from "./relativeSentences";
import { buildReasonQuestion } from "./reasonSentences";
import { buildFocusedQuestion, FOCUSED_FORMS, QUANTIFIER_TENSES, type FocusPattern } from "./focusedSentences";
import { INDEFINITE_PERSONS, PERSON_SUBJECTS, SUBJECTS } from "./data/subjects";
import { TIME_SIGNALS, type TimeSignal } from "./data/timeSignals";
import { DYNAMIC_VERBS, PASSIVE_VERBS, STATIVE_VERBS, VERBS } from "./data/verbs";
import {
  conjugateNominal,
  conjugatePassive,
  conjugateVerbal,
  type TimeOpts,
} from "./engine";
import {
  PERFECT_TENSES,
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
  /** Include rarely-used forms and the stative-verb trap drill. */
  includeRare: boolean;
}

export const DEFAULT_FILTER: QuizFilter = {
  tense: "all",
  mode: "all",
  form: "all",
  includeRare: false,
};

export interface MultiQuizFilter {
  focus?: "relativeClause" | "reasonClause" | "quantifiers" | "conditionals";
  focusPattern?: FocusPattern;
  tenses: Tense[];
  modes: Mode[];
  forms: SentenceForm[];
  includeRare: boolean;
}

export const DEFAULT_MULTI_FILTER: MultiQuizFilter = {
  tenses: [...TENSE_ORDER],
  modes: ["verbal", "nominal", "passive"],
  forms: [...FORMS],
  includeRare: false,
};

export const BEGINNER_FILTER: MultiQuizFilter = {
  tenses: ["presentSimple"],
  modes: ["verbal", "nominal"],
  forms: ["positive", "negative", "yesNoQuestion", "whQuestion"],
  includeRare: false,
};

export const REASON_TENSES = ["presentSimple", "pastSimple"] as const;

export function quizCombinations(filter: MultiQuizFilter) {
  if (filter.focus === "quantifiers") {
    return filter.tenses.filter(tense => QUANTIFIER_TENSES.includes(tense)).flatMap(tense =>
      filter.modes.flatMap(mode => filter.forms.filter(form => FOCUSED_FORMS.includes(form)).map(form => ({ tense, mode, form }))));
  }
  if (filter.focus === "conditionals") {
    if (!filter.modes.includes("verbal")) return [];
    return filter.forms.filter(form => FOCUSED_FORMS.includes(form))
      .map(form => ({ tense: "presentSimple" as const, mode: "verbal" as const, form }));
  }
  if (filter.focus === "reasonClause") {
    if (!filter.modes.includes("verbal") || !filter.forms.includes("positive")) return [];
    return REASON_TENSES.filter(tense => filter.tenses.includes(tense))
      .map(tense => ({ tense, mode: "verbal" as const, form: "positive" as const }));
  }
  return filter.tenses.flatMap(tense => filter.modes.flatMap(mode => {
    if (mode === "nominal" && (isPerfectContinuous(tense) || tense === "futureContinuous")) return [];
    if (filter.focus === "relativeClause" && filter.focusPattern === "which" && mode === "nominal" && isContinuous(tense)) return [];
    if (mode === "passive" && isRarePassive(tense) && !filter.includeRare) return [];
    return filter.forms.map(form => ({tense, mode, form}));
  }));
}

/** Every supported combination appears once per cycle, in a shuffled order. */
export function createQuestionCycle(filter: MultiQuizFilter): () => Question {
  const combinations = quizCombinations(filter);
  if (!combinations.length) throw new RangeError("Filter has no supported combinations");
  let remaining: typeof combinations = [];
  let previous: typeof combinations[number] | undefined;
  let previousNoun: string | undefined;
  let previousReasonVerb: string | undefined;
  let previousFocusedAnswer: string | undefined;
  return () => {
    if (!remaining.length) {
      remaining = [...combinations];
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      if (remaining.length > 1 && remaining[remaining.length - 1] === previous) {
        [remaining[0], remaining[remaining.length - 1]] = [remaining[remaining.length - 1], remaining[0]];
      }
    }
    const combination = remaining.pop()!;
    previous = combination;
    const {tense, mode, form} = combination;
    if (filter.focus === "quantifiers" || filter.focus === "conditionals") {
      const question = buildFocusedQuestion(filter.focus, filter.focusPattern, tense, mode, form, previousFocusedAnswer);
      previousFocusedAnswer = question.answer;
      return question;
    }
    if (filter.focus === "reasonClause" && (tense === "presentSimple" || tense === "pastSimple")) {
      const question = buildReasonQuestion(tense, previousReasonVerb);
      previousReasonVerb = question.verb!.base;
      return question;
    }
    if (filter.focus === "relativeClause") {
      const pronoun = filter.focusPattern === "who" || filter.focusPattern === "which" ? filter.focusPattern : undefined;
      const question = buildRelativeQuestion(tense, mode, form, previousNoun, pronoun);
      previousNoun = question.relativeClause!.antecedent;
      return question;
    }
    if (mode === "verbal") return buildVerbal(tense, form, filter.includeRare);
    if (mode === "nominal") return buildNominal(tense, form);
    return buildPassive(tense, form);
  };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Capitalize a display chip (subjects are stored lowercase). */
export function displayCap(s: string): string {
  return s === "i" ? "I" : s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------- grammar rule tables ----------

/**
 * "When" isn't offered with these. Present/past perfect can't take "When"
 * ("When have you seen him?" is wrong), and the perfect-continuous tenses are
 * about duration, which "When" can't ask about.
 */
const NO_WHEN_TENSES: Tense[] = [
  "presentPerfect",
  "presentPerfectContinuous",
  "pastPerfect",
  "pastPerfectContinuous",
  "futurePerfectContinuous",
];

/** Simple tenses: the only ones where nominal "What is she?" reads naturally. */
const SIMPLE_TENSES: Tense[] = ["presentSimple", "pastSimple", "futureSimple"];

/** Nominal continuous = temporary behavior: always "being + behavioral adjective". */
const BEING_TENSES: Tense[] = ["presentContinuous", "pastContinuous"];

/** Manner adverbs answer "How" (run fast -> How does he run?). */
const MANNER_OBJECTS = new Set(["fast", "well", "hard", "smoothly"]);

/** People-objects take "Who", not "What" (What is she helping? -> wrong). */
const PERSON_OBJECTS = new Set([
  "the children",
  "a friend",
  "the guests",
  "the manager",
  "the team",
  "him",
]);

/** Verbs an animal subject can plausibly do (the dog eats breakfast). */
const ANIMAL_VERBS = new Set(["sleep", "run", "swim", "eat", "catch", "find", "pull"]);

/** Complements that fit animal / thing subjects. */
const ANIMAL_COMPLEMENTS = new Set(["happy", "tired", "sick", "noisy", "here", "at home"]);
const THING_COMPLEMENTS = new Set(["noisy", "ready", "here", "at home", "in the office"]);

// These objects suit devices as well as the unspecified thing referred to by it.
const THING_OBJECTS: Record<string, string> = {
  work: "well",
  run: "smoothly",
  make: "a noise",
  produce: "heat",
  show: "the results",
};
const THING_ACTIONS = VERBS.filter(verb => verb.base in THING_OBJECTS)
  .map(verb => ({ ...verb, object: THING_OBJECTS[verb.base] }));
const IT_SUBJECT = SUBJECTS.find(subject => subject.text === "it")!;
const DEVICE_SUBJECTS = SUBJECTS.filter(subject => subject.entity === "thing" && subject.text !== "it");

// ---------- time signals ----------

interface PickedTime {
  signal?: TimeSignal;
  opts: TimeOpts;
}

/**
 * Choose a time signal that fits the sentence form and WH word.
 * - "When" asks for the time itself -> no time signal.
 * - "How long" asks for the duration -> only anchors (by 2028, before ...).
 * - Perfect-continuous tenses are about duration -> always get a duration.
 */
function pickTime(
  list: TimeSignal[],
  form: SentenceForm,
  wh: WhWord | undefined,
  opts: { requireDuration?: boolean; chance?: number; noMid?: boolean } = {},
): PickedTime {
  const none: PickedTime = { opts: {} };
  if (wh === "When") return none;

  let pool = list.filter(
    (s) => (!s.forms || s.forms.includes(form)) && !(opts.noMid && s.pos === "mid"),
  );
  if (wh === "How long") {
    pool = pool.filter((s) => s.anchor);
    if (!pool.length) return none;
  } else if (opts.requireDuration) {
    pool = pool.filter((s) => s.duration);
    if (!pool.length) return none;
  } else {
    if (!pool.length) return none;
    if (Math.random() >= (opts.chance ?? 0.55)) return none;
  }

  const signal = pick(pool);
  return {
    signal,
    opts: signal.pos === "mid" ? { mid: signal.text } : { tail: signal.text },
  };
}

// ---------- WH-word selection ----------

interface WhChoice {
  wh: WhWord;
  dropObject?: boolean;
}

function whForVerbal(tense: Tense, verb: Verb): WhChoice {
  const options: WhChoice[] = [{ wh: "Why" }];
  if (!NO_WHEN_TENSES.includes(tense)) options.push({ wh: "When" });
  if (!MANNER_OBJECTS.has(verb.object)) options.push({ wh: "Where" });
  if (verb.transitive && verb.object && !PERSON_OBJECTS.has(verb.object)) {
    options.push({ wh: "What" }); // replaces the object
  }
  if (MANNER_OBJECTS.has(verb.object)) {
    options.push({ wh: "How", dropObject: true }); // replaces "fast/well/hard"
  }
  if (isPerfectContinuous(tense)) options.push({ wh: "How long" });
  return pick(options);
}

function whForNominal(tense: Tense, comp: Complement, being: boolean): WhWord {
  // PDF pattern for temporary behavior: "Why is he being so rude?"
  if (being) return "Why";
  const options: WhWord[] = ["Why"];
  if (!NO_WHEN_TENSES.includes(tense) && comp.kind !== "noun") options.push("When");
  if (comp.kind === "noun" && SIMPLE_TENSES.includes(tense)) options.push("What"); // What is she?
  if (comp.kind === "adverb") options.push("Where"); // Where is he?
  if (comp.kind === "adjective") options.push("How"); // How is she?
  if (PERFECT_TENSES.includes(tense)) options.push("How long"); // How long has she been sick?
  return pick(options);
}

function whForPassive(tense: Tense): WhWord {
  const options: WhWord[] = ["Why", "Where"];
  if (!NO_WHEN_TENSES.includes(tense)) options.push("When");
  return pick(options);
}

// ---------- subject selection ----------

/** Match the subject to the verb: no "the dog develops the app", no "the children help the children". */
export function subjectFitsForm(subject: Subject, form: SentenceForm): boolean {
  if (subject.text === "anyone" || subject.text === "anybody") return form === "yesNoQuestion";
  if (subject.text === "nobody" || subject.text === "no one") return form === "positive";
  return true;
}

function pickSubjectFor(verb: Verb, form: SentenceForm): Subject {
  const pool = SUBJECTS.filter((s) => {
    if (!subjectFitsForm(s, form)) return false;
    if (s.text === verb.object) return false;
    if (s.entity === "person") return true;
    if (s.entity === "animal") return ANIMAL_VERBS.has(verb.base);
    return false; // things don't perform actions in this drill
  });
  return pick(pool);
}

function pickSubjectForComplement(comp: Complement, being: boolean, form: SentenceForm): Subject {
  const root = comp.text.replace(/^(a|an|the) /, "").replace(/^good /, "");
  const pool = SUBJECTS.filter((s) => {
    if (!subjectFitsForm(s, form)) return false;
    if (s.text.includes(root)) return false; // the engineer is an engineer
    if (s.entity === "person") return true;
    if (being) return s.entity === "animal" && comp.text === "noisy"; // the dog is being noisy
    if (s.entity === "animal") return ANIMAL_COMPLEMENTS.has(comp.text);
    return THING_COMPLEMENTS.has(comp.text);
  });
  return pick(pool.length ? pool : PERSON_SUBJECTS);
}

// ---------- builders per mode ----------

function buildVerbal(tense: Tense, form: SentenceForm, allowStative: boolean): Question {
  const pool = isContinuous(tense) || !allowStative ? DYNAMIC_VERBS : VERBS;
  const useThing = Math.random() < 0.2;
  const verb = pick(useThing ? THING_ACTIONS : pool);
  let subject: Subject;
  if (useThing) {
    subject = Math.random() < 0.5 ? IT_SUBJECT : pick(DEVICE_SUBJECTS);
  } else {
    subject = pickSubjectFor(verb, form);
  }
  const choice = form === "whQuestion" ? whForVerbal(tense, verb) : undefined;
  const wh = choice?.wh;

  // Stative verbs describe permanent states: no frequency/time signal
  // ("She usually knows him" is wrong).
  const time = verb.stative
    ? { opts: {} }
    : pickTime(TIME_SIGNALS[tense].action, form, wh, {
        requireDuration: isPerfectContinuous(tense),
      });

  const answer = conjugateVerbal(tense, subject, verb, form, {
    wh,
    dropObject: choice?.dropObject,
    ...time.opts,
  });
  return {
    tense,
    mode: "verbal",
    form,
    subject,
    verb,
    whWord: wh,
    timeSignal: time.signal?.text,
    answer,
  };
}

function buildNominal(tense: Tense, form: SentenceForm): Question {
  const being = BEING_TENSES.includes(tense);

  let comp: Complement;
  if (being) {
    comp = pick(BEHAVIORAL_ADJECTIVES); // only behavioral adjectives take "being"
  } else if (tense === "futureContinuous") {
    comp = pick(COMPLEMENTS.filter((c) => c.kind !== "noun"));
  } else {
    comp = pick(COMPLEMENTS);
  }

  const subject = pickSubjectForComplement(comp, being, form);
  const wh = form === "whQuestion" ? whForNominal(tense, comp, being) : undefined;
  const signals = TIME_SIGNALS[tense];
  // When What/Where/How replaces the complement, a mid adverb would end the
  // sentence ("How are you often?"), so only end-position signals are used.
  const replacesComp = wh === "What" || wh === "Where" || wh === "How";
  const time = pickTime(comp.kind === "noun" ? signals.role : signals.state, form, wh, {
    noMid: replacesComp,
  });

  const answer = conjugateNominal(tense, subject, comp, form, {
    wh,
    being,
    ...time.opts,
  });

  return {
    tense,
    mode: "nominal",
    form,
    subject,
    complement: comp,
    whWord: wh,
    timeSignal: time.signal?.text,
    answer,
  };
}

function buildPassive(tense: Tense, form: SentenceForm): Question {
  const verb = pick(PASSIVE_VERBS);
  // Active doer (agent) is a person; passive subject is the verb's object.
  // Avoid the agent coinciding with the object (children helped by children).
  const objRoot = verb.object.replace(/^(a|an|the) /, "");
  const agentPool = PERSON_SUBJECTS.filter((s) => !INDEFINITE_PERSONS.includes(s.text) && !s.text.includes(objRoot));
  const agent = pick(agentPool.length ? agentPool : PERSON_SUBJECTS);
  const passiveSubject = {
    text: verb.object, // e.g. "the lesson"
    person: 3 as const,
    number: verb.objectNumber,
  };
  const wh = form === "whQuestion" ? whForPassive(tense) : undefined;
  const time = pickTime(TIME_SIGNALS[tense].action, form, wh, {
    requireDuration: isPerfectContinuous(tense),
  });

  // The prompt is the active sentence WITHOUT the time signal; the time signal
  // is shown as its own chip (so the learner knows it belongs in the answer).
  const activePrompt = conjugateVerbal(tense, agent, verb, "positive").replace(/\.$/, "");

  // Name the doer with its object pronoun (by him) or noun text (by the teacher).
  const byAgent = agent.objectForm ?? agent.text;
  const answer = conjugatePassive(tense, passiveSubject, verb, form, {
    wh,
    byAgent,
    ...time.opts,
  });

  return {
    tense,
    mode: "passive",
    form,
    subject: agent,
    verb,
    whWord: wh,
    timeSignal: time.signal?.text,
    answer,
    activePrompt,
    rare: isRarePassive(tense),
  };
}

// ---------- stative-verb trap ----------

/** Perfect continuous -> the perfect tense a stative verb falls back to. */
const STATIVE_FALLBACK: Record<string, { tense: Tense; label: string; tail: string }> = {
  presentPerfectContinuous: { tense: "presentPerfect", label: "Present Perfect (have/has + V3)", tail: "for years" },
  pastPerfectContinuous: { tense: "pastPerfect", label: "Past Perfect (had + V3)", tail: "for years" },
  futurePerfectContinuous: { tense: "futurePerfect", label: "Future Perfect (will have + V3)", tail: "for five years by next month" },
};

/**
 * Stative-verb trap (PDF: "I have been knowing him" is wrong -> "I have known him").
 * The question is labeled with the perfect-continuous tense, but the correct
 * answer falls back to the perfect.
 */
export function generateStativeTrap(tense: Tense = "presentPerfectContinuous"): Question {
  const fallback = STATIVE_FALLBACK[tense] ?? STATIVE_FALLBACK.presentPerfectContinuous;
  const labelTense = STATIVE_FALLBACK[tense] ? tense : "presentPerfectContinuous";
  const verb = pick(STATIVE_VERBS);
  const subject = pick(PERSON_SUBJECTS.filter((s) => s.text !== verb.object && !INDEFINITE_PERSONS.includes(s.text)));
  const answer = conjugateVerbal(fallback.tense, subject, verb, "positive", {
    tail: fallback.tail,
  });
  return {
    tense: labelTense,
    mode: "verbal",
    form: "positive",
    subject,
    verb,
    timeSignal: fallback.tail,
    answer,
    rare: true,
  };
}

// ---------- public generator ----------

/** Generate one random question honoring the filter and grammar rules. */
export function generateQuestion(filter: QuizFilter = DEFAULT_FILTER): Question {
  for (let attempt = 0; attempt < 80; attempt++) {
    const tense: Tense = filter.tense === "all" ? pick(TENSE_ORDER) : filter.tense;
    const mode: Mode =
      filter.mode === "all" ? pick<Mode>(["verbal", "nominal", "passive"]) : filter.mode;
    const form: SentenceForm = filter.form === "all" ? pick(FORMS) : filter.form;

    // Rare passive tenses are excluded from the random pool unless opted in
    // or the user explicitly selected that tense.
    if (mode === "passive" && isRarePassive(tense) && !filter.includeRare && filter.tense === "all") {
      continue;
    }

    // Perfect-continuous has no real nominal; only shown when the tense is
    // explicitly selected, to keep "All" free of fallback sentences.
    if (mode === "nominal" && isPerfectContinuous(tense) && filter.tense === "all") {
      continue;
    }

    if (mode === "verbal") {
      // Stative-verb trap: only with the rare toggle on, perfect continuous, positive.
      if (filter.includeRare && isPerfectContinuous(tense) && form === "positive" && Math.random() < 0.35) {
        return generateStativeTrap(tense);
      }
      return buildVerbal(tense, form, filter.includeRare);
    }
    if (mode === "nominal") return buildNominal(tense, form);
    return buildPassive(tense, form);
  }

  // Fallback: a guaranteed-valid simple question.
  return buildVerbal("presentSimple", "positive", false);
}
