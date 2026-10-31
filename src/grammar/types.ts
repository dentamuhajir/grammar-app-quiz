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

/** What kind of real-world thing a subject is, used to avoid nonsense pairings. */
export type Entity = "person" | "animal" | "thing";

/** Grammatical person + number drives subject-verb agreement. */
export interface Subject {
  /** Display text. Stored lowercase except proper words like "I". */
  text: string;
  /** 1 = I/we, 2 = you, 3 = he/she/it/they/nouns. */
  person: 1 | 2 | 3;
  number: "singular" | "plural";
  entity: Entity;
  /**
   * Object pronoun for the passive "by ..." phrase (pronoun subjects only).
   * e.g. He -> "him". Noun subjects reuse their own text.
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
  /** Direct object phrase (empty for intransitive verbs). */
  object: string;
  /**
   * Agreement data for the object when it becomes a passive subject.
   * Only meaningful for transitive verbs.
   */
  objectNumber: "singular" | "plural";
  /**
   * Some transitive verbs sound odd in the passive with these objects
   * (e.g. "take the bus" -> "the bus is taken"). Excluded from passive.
   */
  oddPassive: boolean;
}

export type ComplementKind = "noun" | "adjective" | "adverb";

export interface Complement {
  /** Singular display text, e.g. "a doctor", "happy", "at home". */
  text: string;
  kind: ComplementKind;
  /**
   * Plural form for plural subjects (nouns only), e.g. "doctors".
   * Non-noun complements leave this undefined.
   */
  plural?: string;
  /**
   * Adjectives only: behavioral adjectives (rude, careful) work with the
   * continuous "being" form; state adjectives (happy, tired) do not.
   */
  behavioral?: boolean;
}

export type WhWord = "What" | "Where" | "When" | "Why" | "How" | "How long";

/** A single generated quiz question. */
export interface Question {
  tense: Tense;
  mode: Mode;
  form: SentenceForm;
  subject: Subject;
  verb?: Verb;
  complement?: Complement;
  whWord?: WhWord;
  /** Optional time expression shown with the sentence, e.g. "yesterday". */
  timeSignal?: string;
  /** The correct, fully conjugated sentence (the answer). */
  answer: string;
  /**
   * For passive questions: the equivalent active sentence shown as the prompt
   * so the learner practices the active -> passive transformation.
   */
  activePrompt?: string;
  /**
   * An explanatory note, e.g. the stative fallback rule or a rare-form warning.
   */
  note?: string;
  /** True for grammatically valid but rarely-used forms (hidden from "All"). */
  rare?: boolean;
}
