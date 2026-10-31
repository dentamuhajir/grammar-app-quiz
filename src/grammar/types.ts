// ---------- Core domain types for the grammar engine ----------

/** The 12 English tenses covered by the app. */
export type Tense =
  | "presentSimple"
  | "presentContinuous"
  | "presentPerfect"
  | "presentPerfectContinuous"
  | "pastSimple"
  | "pastContinuous"
  | "pastPerfect"
  | "pastPerfectContinuous"
  | "futureSimple"
  | "futureContinuous"
  | "futurePerfect"
  | "futurePerfectContinuous";

/** Sentence construction the learner must produce. */
export type SentenceForm =
  | "positive"
  | "negative"
  | "yesNoQuestion"
  | "whQuestion";

/** Verbal (action verb) vs nominal (to be + complement) vs passive voice. */
export type Mode = "verbal" | "nominal" | "passive";

/** Grammatical person + number drives subject-verb agreement. */
export interface Subject {
  /** Display text, e.g. "He", "The students", "A pilot". */
  text: string;
  /** 1 = I/we, 2 = you, 3 = he/she/it/they/nouns. */
  person: 1 | 2 | 3;
  number: "singular" | "plural";
  /**
   * Object pronoun used when this subject becomes the agent in a passive
   * "by ..." phrase. Optional; only used for pronoun subjects.
   */
  objectForm?: string;
}

export interface Verb {
  /** Base form (V1), e.g. "work", "go". */
  base: string;
  /** Simple past (V2), e.g. "worked", "went". */
  past: string;
  /** Past participle (V3), e.g. "worked", "gone". */
  participle: string;
  /** -ing form, e.g. "working", "going". */
  ing: string;
  /** 3rd person singular present, e.g. "works", "goes". */
  thirdSingular: string;
  /** Can take a direct object -> eligible for passive voice. */
  transitive: boolean;
  /** Stative verbs reject -ing (continuous) forms. */
  stative: boolean;
  /** A natural object phrase used to complete verbal/passive sentences. */
  object: string;
}

export interface Complement {
  /** e.g. "a doctor", "happy", "busy", "at home". */
  text: string;
  /** adjective complements can use the "being" temporary-behavior form. */
  kind: "adjective" | "noun" | "adverb";
}

export type WhWord = "What" | "Where" | "When" | "Why" | "How";

/** A single generated quiz question. */
export interface Question {
  tense: Tense;
  mode: Mode;
  form: SentenceForm;
  subject: Subject;
  verb?: Verb;
  complement?: Complement;
  whWord?: WhWord;
  /** The correct, fully conjugated sentence (the "hint"/answer). */
  answer: string;
}
