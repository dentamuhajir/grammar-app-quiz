import { conjugateNominal, conjugatePassive, conjugateVerbal } from "./engine";
import { FORM_LABELS, MODE_LABELS, TENSE_LABELS } from "./labels";
import type { ClauseCues, Mode, Question, SentenceForm, Subject, Tense, Verb } from "./types";

export type FocusPattern = "much" | "many" | "some" | "few" | "zero" | "first" | "second" | "third" | "who" | "which" | "usually" | "often" | "always" | "can" | "should" | "must";
export const FOCUS_PATTERNS = {
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

const people: Subject[] = [
  { text: "I", number: "singular", person: 1, entity: "person" },
  { text: "she", number: "singular", person: 3, entity: "person" },
  { text: "they", number: "plural", person: 3, entity: "person" },
];
const verb = (base: string, thirdSingular: string, past: string, participle: string, ing: string, object: string): Verb =>
  ({ base, thirdSingular, past, participle, ing, object, transitive: true, stative: false, objectNumber: "singular", oddPassive: false });

type ConditionalItem = { pattern: FocusPattern; form: SentenceForm; condition: ClauseCues; result: ClauseCues; answer: string; alternative?: string };
const conditionals: ConditionalItem[] = [
  { pattern: "zero", form: "positive", condition: { subject: "you", verb: "heat", complement: "ice" }, result: { subject: "it", verb: "melt" }, answer: "If you heat ice, it melts.", alternative: "It melts if you heat ice." },
  { pattern: "zero", form: "positive", condition: { subject: "it", verb: "rain" }, result: { subject: "the ground", verb: "get", complement: "wet" }, answer: "If it rains, the ground gets wet.", alternative: "The ground gets wet if it rains." },
  { pattern: "zero", form: "negative", condition: { subject: "plants", verb: "not get", complement: "water" }, result: { subject: "they", verb: "die" }, answer: "If plants do not get water, they die.", alternative: "Plants die if they do not get water." },
  { pattern: "zero", form: "yesNoQuestion", condition: { subject: "you", verb: "heat", complement: "ice" }, result: { subject: "it", verb: "melt" }, answer: "If you heat ice, does it melt?", alternative: "Does ice melt if you heat it?" },
  { pattern: "first", form: "positive", condition: { subject: "it", verb: "rain" }, result: { subject: "I", verb: "will stay", complement: "home" }, answer: "If it rains, I will stay home.", alternative: "I will stay home if it rains." },
  { pattern: "first", form: "positive", condition: { subject: "she", verb: "study" }, result: { subject: "she", verb: "will pass" }, answer: "If she studies, she will pass.", alternative: "She will pass if she studies." },
  { pattern: "first", form: "negative", condition: { subject: "it", verb: "rain" }, result: { subject: "I", verb: "will not go", complement: "out" }, answer: "If it rains, I will not go out.", alternative: "I will not go out if it rains." },
  { pattern: "first", form: "yesNoQuestion", condition: { subject: "it", verb: "rain" }, result: { subject: "you", verb: "will stay", complement: "home" }, answer: "If it rains, will you stay home?", alternative: "Will you stay home if it rains?" },
  { pattern: "second", form: "positive", condition: { subject: "I", verb: "be", complement: "rich" }, result: { subject: "I", verb: "would travel" }, answer: "If I were rich, I would travel.", alternative: "I would travel if I were rich." },
  { pattern: "second", form: "positive", condition: { subject: "she", verb: "have", complement: "time" }, result: { subject: "she", verb: "would read" }, answer: "If she had time, she would read.", alternative: "She would read if she had time." },
  { pattern: "second", form: "negative", condition: { subject: "I", verb: "be", complement: "you" }, result: { subject: "I", verb: "would not buy", complement: "it" }, answer: "If I were you, I would not buy it.", alternative: "I would not buy it if I were you." },
  { pattern: "second", form: "yesNoQuestion", condition: { subject: "you", verb: "have", complement: "time" }, result: { subject: "you", verb: "would travel" }, answer: "If you had time, would you travel?", alternative: "Would you travel if you had time?" },
  { pattern: "third", form: "positive", condition: { subject: "he", verb: "study" }, result: { subject: "he", verb: "would have passed" }, answer: "If he had studied, he would have passed.", alternative: "He would have passed if he had studied." },
  { pattern: "third", form: "positive", condition: { subject: "she", verb: "leave", time: "early" }, result: { subject: "she", verb: "would have arrived", time: "on time" }, answer: "If she had left early, she would have arrived on time.", alternative: "She would have arrived on time if she had left early." },
  { pattern: "third", form: "negative", condition: { subject: "he", verb: "study" }, result: { subject: "he", verb: "would not have failed" }, answer: "If he had studied, he would not have failed.", alternative: "He would not have failed if he had studied." },
  { pattern: "third", form: "yesNoQuestion", condition: { subject: "you", verb: "study" }, result: { subject: "you", verb: "would have passed" }, answer: "If you had studied, would you have passed?", alternative: "Would you have passed if you had studied?" },
];

function questionBase(tense: Tense, mode: Mode, form: SentenceForm, subject: Subject, answer: string): Question {
  return { tense, mode, form, subject, answer };
}

export function buildFocusedQuestion(focus: "quantifiers" | "conditionals", pattern: FocusPattern | undefined,
  tense: Tense, mode: Mode, form: SentenceForm, previousAnswer?: string): Question {
  if (focus === "conditionals") {
    const candidates = conditionals.filter(item => (!pattern || item.pattern === pattern) && item.form === form);
    const remaining = candidates.filter(item => item.answer !== previousAnswer);
    const pool = remaining.length ? remaining : candidates;
    const item = pool[Math.floor(Math.random() * pool.length)];
    return {
      ...questionBase(tense, mode, form, people[0], item.answer),
      focused: {
        label: "Conditionals", instruction: "Susun satu kalimat dengan syarat dan hasil.",
        rows: [
          { label: "Syarat", detail: item.pattern, cues: { wh: "if", ...item.condition } },
          { label: "Hasil", detail: form === "yesNoQuestion" ? "Yes/No Question" : form === "negative" ? "Negatif" : "Positif", cues: item.result },
        ],
        explanation: "Perhatikan pola jenis conditional serta urutan syarat dan hasil.",
        alternatives: item.alternative ? [item.alternative] : [],
      },
    };
  }

  const available = FOCUS_PATTERNS.quantifiers.map(item => item.value);
  const selected = available.includes(pattern as typeof available[number]) ? pattern! : available[Math.floor(Math.random() * available.length)];
  const words = selected === "much" ? ["much", "water"] : selected === "many" ? ["many", "books"]
    : selected === "some" ? [form === "positive" ? "some" : "any", "books"]
      : Math.random() < 0.5 ? ["a few", "books"] : ["a little", "water"];
  const phrase = words.join(" ");
  const plural = words[1] === "books";
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
  return {
    ...questionBase(tense, mode, form, subject, answer),
    focused: {
      label: "Quantifiers", instruction: "Susun kalimat dengan quantifier yang tersedia.",
      rows: [{ label: "Bahan kalimat", detail: `${selected} · ${TENSE_LABELS[tense]} · ${MODE_LABELS[mode]} · ${FORM_LABELS[form]}`, cues }],
      explanation: `${words[0]} digunakan dengan ${plural ? "kata benda jamak yang dapat dihitung" : "kata benda yang tidak dapat dihitung"}.`,
      alternatives: [],
    },
  };
}
