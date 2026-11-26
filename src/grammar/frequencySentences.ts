import { COMPLEMENTS } from "./data/complements";
import { SUBJECTS } from "./data/subjects";
import { VERBS } from "./data/verbs";
import { conjugateNominal, conjugateVerbal } from "./engine";
import { FORM_LABELS, MODE_LABELS, TENSE_LABELS } from "./labels";
import type { Mode, Question, SentenceForm, Tense } from "./types";

export const FREQUENCY_ADVERBS = ["usually", "often", "always"] as const;
export type FrequencyAdverb = typeof FREQUENCY_ADVERBS[number];
// Repeated actions/states: continuous forms need a separate context design.
export const FREQUENCY_TENSES: Tense[] = [
  "presentSimple", "pastSimple", "futureSimple",
  "presentPerfect", "pastPerfect", "futurePerfect",
];
export const FREQUENCY_MODES: Mode[] = ["verbal", "nominal"];
export const FREQUENCY_FORMS: SentenceForm[] = ["positive", "negative", "yesNoQuestion"];
const subjects = SUBJECTS.filter(s => ["I", "you", "we", "they", "he", "she", "Emma", "the students"].includes(s.text));
const verbs = VERBS.filter(v => ["cook", "read", "eat", "help", "wash", "study", "play", "drink"].includes(v.base));
const complements = COMPLEMENTS.filter(c => ["ready", "busy", "polite", "careful", "at home"].includes(c.text));
const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export function buildFrequencyQuestion(tense: Tense, mode: Mode, form: SentenceForm, pattern?: string): Question {
  if (!FREQUENCY_TENSES.includes(tense) || !FREQUENCY_MODES.includes(mode) || !FREQUENCY_FORMS.includes(form)) {
    throw new RangeError("Unsupported frequency-adverb combination");
  }
  const adverb = FREQUENCY_ADVERBS.find(word => word === pattern) ?? pick(FREQUENCY_ADVERBS);
  const subject = pick(subjects);
  const verb = mode === "verbal" ? pick(verbs) : undefined;
  const complement = mode === "nominal" ? pick(complements) : undefined;
  const opts = { mid: adverb };
  const answer = verb ? conjugateVerbal(tense, subject, verb, form, opts)
    : conjugateNominal(tense, subject, complement!, form, opts);
  const alternatives: string[] = [];
  // Fronting a positive usually/often preserves the target meaning. Do not
  // move across negation: "not usually" and "usually not" differ in scope.
  if (form === "positive" && adverb !== "always") {
    const plain = verb ? conjugateVerbal(tense, subject, verb, form)
      : conjugateNominal(tense, subject, complement!, form);
    const clause = subject.text + plain.slice(subject.text.length);
    alternatives.push(`${adverb}, ${clause}`);
    if (adverb === "often") alternatives.push(`${plain.slice(0, -1)} often.`);
  }
  const meaning = { usually: "tidak biasanya", often: "tidak sering", always: "tidak selalu" }[adverb];
  const explanation = form === "negative"
    ? `Letakkan ${adverb} setelah not. Not ${adverb} berarti ${meaning}; jangan pindahkan adverb melewati not karena maknanya dapat berubah.`
    : `Letakkan ${adverb} sebelum verb utama tanpa auxiliary, atau setelah auxiliary pertama/be. Usually dan often juga dapat berada di awal kalimat positif; often dapat berada di akhir.`;
  return {
    tense, mode, form, subject, verb, complement, answer,
    focused: {
      label: "Adverbs of Frequency",
      instruction: "Susun kalimat dengan adverb frekuensi yang tersedia. Pada bentuk negatif, letakkan adverb setelah not.",
      rows: [{ label: "Bahan kalimat", detail: `${TENSE_LABELS[tense]} · ${MODE_LABELS[mode]} · ${FORM_LABELS[form]}`,
        cues: { subject: subject.text, verb: verb?.base ?? "be", complement: verb?.object ?? complement?.text, time: adverb } }],
      explanation, alternatives,
    },
  };
}
