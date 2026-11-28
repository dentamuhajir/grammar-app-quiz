import { conjugateNominal, conjugatePassive, conjugateVerbal } from "./engine";
import { FORM_LABELS, MODE_LABELS, TENSE_LABELS } from "./labels";
import type { ClauseCues, Mode, Question, SentenceForm, Subject, Tense, Verb } from "./types";
import type { StructurePattern } from "./structureSentences";
import { INDEFINITE_PERSONS, PERSON_SUBJECTS } from "./data/subjects";
import { GERUND_PATTERNS } from "./gerundSentences";

export type FocusPattern = StructurePattern | "enjoy" | "avoid" | "want" | "much" | "many" | "some" | "few" | "zero" | "first" | "second" | "third" | "who" | "which" | "usually" | "often" | "always" | "can" | "should" | "must";
export const FOCUS_PATTERNS = {
  gerundInfinitive: GERUND_PATTERNS,
  quantifiers: [
    { value: "much", label: "much" }, { value: "many", label: "many" },
    { value: "some", label: "some / any" }, { value: "few", label: "a few / a little" },
  ],
  conditionals: [
    { value: "zero", label: "Zero" }, { value: "first", label: "First" },
    { value: "second", label: "Second" }, { value: "third", label: "Third" },
  ],
} as const;
export const QUANTIFIER_TENSES: Tense[] = ["presentSimple", "pastSimple", "futureSimple"];
export const FOCUSED_FORMS: SentenceForm[] = ["positive", "negative", "yesNoQuestion"];

const people = PERSON_SUBJECTS.filter(subject => !INDEFINITE_PERSONS.includes(subject.text));
const verb = (base: string, thirdSingular: string, past: string, participle: string, ing: string, object: string): Verb =>
  ({ base, thirdSingular, past, participle, ing, object, transitive: true, stative: false, objectNumber: "singular", oddPassive: false });

function questionBase(tense: Tense, mode: Mode, form: SentenceForm, subject: Subject, answer: string): Question {
  return { tense, mode, form, subject, answer };
}

// ---------- Conditionals (generative) ----------

type CondType = "zero" | "first" | "second" | "third";

/**
 * A conditional clause described in base parts so the engine can conjugate it
 * per conditional type. `verb` is the base form; `be` marks "to be" clauses
 * (so the second conditional can use the subjunctive "were"). `tail` holds the
 * rest of the clause (object/complement/time) kept as one meaningful phrase.
 */
interface CondClause {
  subject: string;
  /** Grammatical person/number for subject-verb agreement. */
  person: 1 | 2 | 3;
  number: "singular" | "plural";
  /** Base verb (V1). Irregular pasts/participles are supplied when needed. */
  verb: string;
  past?: string;
  participle?: string;
  thirdSingular?: string;
  /** True for "to be" clauses, e.g. "If I were you". */
  be?: boolean;
  /** Object/complement/time phrase, kept intact (e.g. "home", "the train"). */
  tail?: string;
}

interface CondSituation {
  condition: CondClause;
  result: CondClause;
  /** Forms that read naturally for this situation. */
  forms: SentenceForm[];
}

/** Curated situation pairs, netral terhadap jenis conditional. */
const COND_SITUATIONS: CondSituation[] = [
  {
    condition: { subject: "it", person: 3, number: "singular", verb: "rain", past: "rained", participle: "rained", thirdSingular: "rains" },
    result: { subject: "we", person: 1, number: "plural", verb: "play", past: "played", participle: "played", thirdSingular: "plays", tail: "outside" },
    forms: ["negative"],
  },
  {
    condition: { subject: "she", person: 3, number: "singular", verb: "be", be: true, tail: "tired" },
    result: { subject: "she", person: 3, number: "singular", verb: "work", past: "worked", participle: "worked", thirdSingular: "works", tail: "late" },
    forms: ["negative"],
  },

  {
    condition: { subject: "it", person: 3, number: "singular", verb: "rain", past: "rained", participle: "rained", thirdSingular: "rains" },
    result: { subject: "I", person: 1, number: "singular", verb: "stay", past: "stayed", participle: "stayed", thirdSingular: "stays", tail: "home" },
    forms: ["positive", "yesNoQuestion"],
  },
  {
    condition: { subject: "she", person: 3, number: "singular", verb: "study", past: "studied", participle: "studied", thirdSingular: "studies" },
    result: { subject: "she", person: 3, number: "singular", verb: "pass", past: "passed", participle: "passed", thirdSingular: "passes", tail: "the exam" },
    forms: ["positive", "yesNoQuestion"],
  },
  {
    condition: { subject: "you", person: 2, number: "singular", verb: "heat", past: "heated", participle: "heated", thirdSingular: "heats", tail: "ice" },
    result: { subject: "it", person: 3, number: "singular", verb: "melt", past: "melted", participle: "melted", thirdSingular: "melts" },
    forms: ["positive", "yesNoQuestion"],
  },
  {
    condition: { subject: "we", person: 1, number: "plural", verb: "leave", past: "left", participle: "left", thirdSingular: "leaves", tail: "early" },
    result: { subject: "we", person: 1, number: "plural", verb: "catch", past: "caught", participle: "caught", thirdSingular: "catches", tail: "the train" },
    forms: ["positive", "yesNoQuestion"],
  },
  {
    condition: { subject: "he", person: 3, number: "singular", verb: "have", past: "had", participle: "had", thirdSingular: "has", tail: "time" },
    result: { subject: "he", person: 3, number: "singular", verb: "read", past: "read", participle: "read", thirdSingular: "reads", tail: "more books" },
    forms: ["positive", "yesNoQuestion"],
  },
  {
    condition: { subject: "I", person: 1, number: "singular", verb: "be", be: true, tail: "rich" },
    result: { subject: "I", person: 1, number: "singular", verb: "travel", past: "travelled", participle: "travelled", thirdSingular: "travels", tail: "the world" },
    forms: ["positive"],
  },
];

const COND_LABELS: Record<CondType, string> = { zero: "Zero", first: "First", second: "Second", third: "Third" };

/** Capitalize the first letter of a sentence body. */
function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const CONDITIONAL_TENSES: Record<CondType, Tense> = {
  zero: "presentSimple", first: "presentSimple", second: "pastSimple", third: "pastPerfect",
};

function clauseSubject(c: CondClause): Subject {
  return { text: c.subject, person: c.person, number: c.number, entity: "person" };
}

function clauseVerb(c: CondClause): Verb {
  if (!c.thirdSingular || !c.past || !c.participle) throw new RangeError("Missing conditional verb forms");
  return verb(c.verb, c.thirdSingular, c.past, c.participle, "", c.tail ?? "");
}

function clauseBody(sentence: string, subject: string): string {
  const body = sentence.slice(0, -1);
  return body.startsWith(`${subject} `) ? body : body[0].toLowerCase() + body.slice(1);
}

function conditionClause(c: CondClause, type: CondType): string {
  const tense = CONDITIONAL_TENSES[type];
  if (c.be && type === "second") return `${c.subject} were ${c.tail}`;
  const sentence = c.be
    ? conjugateNominal(tense, clauseSubject(c), { text: c.tail ?? "", kind: "adjective" }, "positive")
    : conjugateVerbal(tense, clauseSubject(c), clauseVerb(c), "positive");
  return clauseBody(sentence, c.subject);
}

function resultClause(c: CondClause, type: CondType, form: SentenceForm): string {
  const tense = type === "zero" ? "presentSimple" : type === "third" ? "futurePerfect" : "futureSimple";
  const sentence = conjugateVerbal(tense, clauseSubject(c), clauseVerb(c), form);
  // The shared engine supplies the complete auxiliary chain and question order.
  const modalSentence = type === "second" || type === "third" ? sentence.replace(/\bwill\b/i, "would") : sentence;
  return clauseBody(modalSentence, c.subject);
}

// Negation and interrogation target the result; the condition stays positive.
function assembleConditional(situation: CondSituation, type: CondType, form: SentenceForm) {
  const condition = conditionClause(situation.condition, type);
  const result = resultClause(situation.result, type, form);
  const punctuation = form === "yesNoQuestion" ? "?" : ".";
  return {
    answer: `If ${condition}, ${result}${punctuation}`,
    alternative: `${cap(result)} if ${condition}${punctuation}`,
  };
}

export function supportsConditional(pattern: FocusPattern | undefined, form: SentenceForm): boolean {
  return (!pattern || FOCUS_PATTERNS.conditionals.some(item => item.value === pattern))
    && COND_SITUATIONS.some(item => item.forms.includes(form));
}

export function buildConditionalQuestion(pattern: FocusPattern | undefined, form: SentenceForm, previousAnswer?: string): Question {
  if (!supportsConditional(pattern, form)) throw new RangeError("Unsupported conditional combination");
  const type = pattern as CondType | undefined
    ?? FOCUS_PATTERNS.conditionals[Math.floor(Math.random() * FOCUS_PATTERNS.conditionals.length)].value;
  const candidates = COND_SITUATIONS.filter(s => s.forms.includes(form));
  const built = candidates.map(s => ({ situation: s, ...assembleConditional(s, type, form) }));
  const remaining = built.filter(b => b.answer !== previousAnswer);
  const pool = remaining.length ? remaining : built;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const subject: Subject = { text: chosen.situation.result.subject, number: chosen.situation.result.number, person: chosen.situation.result.person, entity: "person" };
  const resultDetail = form === "yesNoQuestion" ? "Yes/No Question" : form === "negative" ? "Negatif" : "Positif";
  return {
    ...questionBase("presentSimple", "verbal", form, subject, chosen.answer),
    focused: {
      label: "Conditionals",
      instruction: `${COND_LABELS[type]} conditional. Susun syarat positif dan hasil ${FORM_LABELS[form]}. Bentuk negatif atau pertanyaan hanya diterapkan pada Hasil.`,
      rows: [
        { label: "Syarat", detail: `${type} · ${TENSE_LABELS[CONDITIONAL_TENSES[type]]} · Positif`, cues: cuesFromClause(chosen.situation.condition, "if") },
        { label: "Hasil", detail: `${type === "zero" ? "Present Simple" : type === "first" ? "will + V1" : type === "second" ? "would + V1" : "would have + V3"} · ${resultDetail}`, cues: cuesFromClause(chosen.situation.result) },
      ],
      explanation: conditionalExplanation(type),
      alternatives: [chosen.alternative],
    },
  };
}

function cuesFromClause(c: CondClause, wh?: string): ClauseCues {
  return { ...(wh ? { wh } : {}), subject: c.subject, verb: c.be ? "be" : c.verb, ...(c.tail ? { complement: c.tail } : {}) };
}

function conditionalExplanation(type: CondType): string {
  switch (type) {
    case "zero": return "Zero conditional: syarat dan hasil sama-sama Present Simple (fakta yang selalu benar).";
    case "first": return "First conditional: syarat Present Simple, hasil will + V1 (kemungkinan nyata di masa depan).";
    case "second": return "Second conditional: syarat Past Simple (were untuk be), hasil would + V1 (pengandaian masa kini).";
    case "third": return "Third conditional: syarat had + V3, hasil would have + V3 (pengandaian masa lalu).";
  }
}

export function buildFocusedQuestion(focus: "quantifiers" | "conditionals", pattern: FocusPattern | undefined,
  tense: Tense, mode: Mode, form: SentenceForm, previousAnswer?: string): Question {
  if (focus === "conditionals") {
    return buildConditionalQuestion(pattern, form, previousAnswer);
  }
  return buildQuantifierQuestion(pattern, tense, mode, form);
}

// ---------- Quantifiers (expanded) ----------

interface QuantNoun {
  /** Frasa benda utuh, mis. "books", "water". */
  text: string;
  countable: boolean;
}

const COUNTABLE_NOUNS: QuantNoun[] = [
  { text: "books", countable: true },
  { text: "chairs", countable: true },
  { text: "emails", countable: true },
  { text: "apples", countable: true },
];
const UNCOUNTABLE_NOUNS: QuantNoun[] = [
  { text: "water", countable: false },
  { text: "time", countable: false },
  { text: "money", countable: false },
  { text: "sugar", countable: false },
];

/** Quantifier -> jenis benda dan penjelasan. */
interface QuantSpec {
  positiveWord: string;
  interrogativeWord?: string;
  countable: boolean;
  explain: (word: string) => string;
}

const QUANT_SPECS: Record<"much" | "many" | "some" | "few", QuantSpec> = {
  much: {
    positiveWord: "much", countable: false,
    explain: () => "much digunakan dengan kata benda yang tidak dapat dihitung.",
  },
  many: {
    positiveWord: "many", countable: true,
    explain: () => "many digunakan dengan kata benda jamak yang dapat dihitung.",
  },
  some: {
    positiveWord: "some", interrogativeWord: "any", countable: true,
    explain: (word) => word === "some"
      ? "some digunakan pada kalimat positif atau tawaran."
      : "any digunakan pada kalimat negatif atau pertanyaan.",
  },
  few: {
    positiveWord: "a few", countable: true,
    explain: (word) => word.includes("few")
      ? "a few digunakan dengan kata benda jamak yang dapat dihitung."
      : "a little digunakan dengan kata benda yang tidak dapat dihitung.",
  },
};

function pickNoun(countable: boolean): QuantNoun {
  const pool = countable ? COUNTABLE_NOUNS : UNCOUNTABLE_NOUNS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function supportsQuantifier(pattern: FocusPattern | undefined, mode: Mode, form: SentenceForm): boolean {
  return (!pattern || FOCUS_PATTERNS.quantifiers.some(item => item.value === pattern))
    && FOCUSED_FORMS.includes(form)
    && !(pattern === "some" && mode !== "verbal" && form === "negative");
}

function buildQuantifierQuestion(pattern: FocusPattern | undefined, tense: Tense, mode: Mode, form: SentenceForm): Question {
  if (!QUANTIFIER_TENSES.includes(tense) || !supportsQuantifier(pattern, mode, form)) {
    throw new RangeError("Unsupported quantifier combination");
  }
  const available = FOCUS_PATTERNS.quantifiers.map(item => item.value)
    .filter(value => supportsQuantifier(value, mode, form));
  const selected = (available.includes(pattern as typeof available[number]) ? pattern! : available[Math.floor(Math.random() * available.length)]) as "much" | "many" | "some" | "few";

  // Some/any and a few/a little cover both noun classes.
  let countable = QUANT_SPECS[selected].countable;
  let quantWord = QUANT_SPECS[selected].positiveWord;
  if (selected === "few" || selected === "some") {
    countable = Math.random() < 0.5;
    if (selected === "few") quantWord = countable ? "a few" : "a little";
  }
  if (selected === "some" && form !== "positive") {
    quantWord = QUANT_SPECS.some.interrogativeWord!;
  }

  const noun = pickNoun(countable);
  const phrase = `${quantWord} ${noun.text}`;
  const plural = countable;
  const person = people[Math.floor(Math.random() * people.length)];
  const nounSubject: Subject = { text: phrase, number: plural ? "plural" : "singular", person: 3, entity: "thing" };
  let subject = person;
  let answer: string;
  let cues: ClauseCues;
  if (mode === "verbal") {
    const action = verb("need", "needs", "needed", "needed", "needing", phrase);
    answer = conjugateVerbal(tense, person, action, form);
    cues = { subject: person.text, verb: "need", complement: phrase };
  } else if (mode === "nominal") {
    subject = nounSubject;
    answer = conjugateNominal(tense, subject, { text: "available", kind: "adjective" }, form);
    cues = { subject: phrase, verb: "be", complement: "available" };
  } else {
    subject = nounSubject;
    const action = verb("use", "uses", "used", "used", "using", phrase);
    answer = conjugatePassive(tense, subject, action, form);
    cues = { subject: phrase, verb: "be used" };
  }

  const spec = QUANT_SPECS[selected];
  return {
    ...questionBase(tense, mode, form, subject, answer),
    focused: {
      label: "Quantifiers", instruction: "Susun kalimat dengan quantifier yang tersedia.",
      rows: [{ label: "Bahan kalimat", detail: `${selected} · ${quantWord} · ${TENSE_LABELS[tense]} · ${MODE_LABELS[mode]} · ${FORM_LABELS[form]}`, cues }],
      explanation: spec.explain(quantWord),
      alternatives: [],
    },
  };
}
