import { VERBS } from "./data/verbs";
import { SUBJECTS } from "./data/subjects";
import { conjugateVerbal, verbalClusters } from "./engine";
import { FORM_LABELS, TENSE_LABELS } from "./labels";
import type { Question, SentenceForm, Tense, Verb } from "./types";

export const GERUND_PATTERNS = [
  { value: "enjoy", label: "enjoy + V-ing" },
  { value: "avoid", label: "avoid + V-ing" },
  { value: "want", label: "want + to V1" },
] as const;
export type GerundPattern = typeof GERUND_PATTERNS[number]["value"];
export const GERUND_TENSES: Tense[] = ["presentSimple", "pastSimple", "futureSimple"];
export const GERUND_FORMS: SentenceForm[] = ["positive", "negative", "yesNoQuestion"];
const subjects = SUBJECTS.filter(s => ["I", "you", "we", "they", "he", "she", "Emma", "the students"].includes(s.text));
const activities: Record<GerundPattern, [string, string, string?][]> = {
  enjoy: [["read", "some books"], ["cook", "a meal"], ["play", "football"], ["learn", "a language"]],
  avoid: [["eat", "too much sugar"], ["drive", "", "at night"], ["use", "the phone", "before bed"], ["spend", "too much money"]],
  want: [["read", "some books"], ["cook", "a meal"], ["buy", "a new book"], ["learn", "a language"]],
};

export function supportsGerund(pattern?: string): boolean {
  return !pattern || GERUND_PATTERNS.some(item => item.value === pattern);
}

export function buildGerundQuestion(tense: Tense, form: SentenceForm, pattern?: string, previousAnswer?: string): Question {
  if (!GERUND_TENSES.includes(tense) || !GERUND_FORMS.includes(form) || !supportsGerund(pattern)) {
    throw new RangeError("Unsupported gerund/infinitive combination");
  }
  const candidates = GERUND_PATTERNS.filter(item => !pattern || item.value === pattern)
    .flatMap(({ value }) => subjects.flatMap(subject => activities[value].map(([base, object, time]) => {
      const activity = VERBS.find(v => v.base === base)!;
      const secondary = value === "want" ? `to ${activity.base}` : activity.ing;
      const main: Verb = { base: value, thirdSingular: `${value}s`, past: `${value}ed`, participle: `${value}ed`,
        ing: `${value}ing`, object: [secondary, object, time].filter(Boolean).join(" "), transitive: true,
        stative: value === "want", objectNumber: "singular", oddPassive: true };
      return { value, subject, activity, object, time, secondary, main, answer: conjugateVerbal(tense, subject, main, form) };
    })));
  const remaining = candidates.filter(item => item.answer !== previousAnswer);
  const pool = remaining.length ? remaining : candidates;
  const { value, subject, activity, object, time, secondary, main, answer } = pool[Math.floor(Math.random() * pool.length)];
  const clusters = verbalClusters(tense, subject, main);
  const explanation = `${value} diikuti ${value === "want" ? "to + V1" : "V-ing"}: ${value} ${secondary}. Tense dan bentuk kalimat mengubah verb utama ${value}; verb kegiatan tetap ${secondary}. Negatif dan pertanyaan memakai auxiliary pada verb utama.`;
  return {
    tense, mode: "verbal", form, subject, verb: main, answer,
    focused: {
      label: "Gerund & Infinitive",
      instruction: "Susun kalimat. Sesuaikan verb utama dengan tense dan bentuk soal, lalu ubah verb kegiatan sesuai pola verb utama.",
      rows: [{ label: "Bahan kalimat", detail: `${TENSE_LABELS[tense]} · Verbal · ${FORM_LABELS[form]}`,
        cues: { subject: subject.text, verb: value, secondaryVerb: activity.base, complement: object || undefined, time } }],
      explanation, alternatives: [],
      analysis: { parts: [
        { text: subject.text, role: "Subjek" },
        ...(form === "positive" ? [{ text: clusters.positiveCluster, role: "Verb utama" }]
          : [{ text: clusters.aux, role: "Auxiliary" }, { text: clusters.afterAux, role: "Verb utama" },
            ...(form === "negative" ? [{ text: "not", role: "Negasi" }] : [])]),
        { text: secondary, role: value === "want" ? "To-infinitive: kegiatan" : "Gerund: kegiatan" },
        ...(object ? [{ text: object, role: "Pelengkap kegiatan" }] : []),
        ...(time ? [{ text: time, role: "Keterangan waktu kegiatan" }] : []),
      ] },
    },
  };
}
