import { SUBJECTS } from "./data/subjects";
import { VERBS } from "./data/verbs";
import { conjugateVerbal, verbalClusters } from "./engine";
import { FORM_LABELS, TENSE_LABELS } from "./labels";
import type { Question, SentenceForm, Tense } from "./types";

export const TIME_PREPOSITION_PATTERNS = [
  { value: "timeClock", label: "Jam & titik waktu" },
  { value: "timeDay", label: "Hari & tanggal" },
  { value: "timePeriod", label: "Bulan, tahun & bagian hari" },
  { value: "timeBare", label: "Tanpa preposisi" },
] as const;
export const TIME_PREPOSITION_TENSES: Tense[] = ["presentSimple", "pastSimple", "futureSimple"];
export const TIME_PREPOSITION_FORMS: SentenceForm[] = ["positive", "negative", "yesNoQuestion"];
type Pattern = typeof TIME_PREPOSITION_PATTERNS[number]["value"];
type TimeItem = { pattern: Pattern; cue: string; preposition: "" | "at" | "on" | "in"; tenses: Tense[] };
const all = TIME_PREPOSITION_TENSES;
const times: TimeItem[] = [
  ...["7 a.m.", "9 p.m.", "noon", "midnight"].map(cue => ({ pattern: "timeClock" as const, cue, preposition: "at" as const, tenses: all })),
  { pattern: "timeDay", cue: "Mondays", preposition: "on", tenses: ["presentSimple"] },
  { pattern: "timeDay", cue: "Friday mornings", preposition: "on", tenses: ["presentSimple"] },
  ...["Monday", "May 20"].map(cue => ({ pattern: "timeDay" as const, cue, preposition: "on" as const, tenses: ["pastSimple", "futureSimple"] as Tense[] })),
  ...["March", "July", "the morning", "the afternoon", "the evening"].map(cue => ({ pattern: "timePeriod" as const, cue, preposition: "in" as const, tenses: all })),
  { pattern: "timePeriod", cue: "2020", preposition: "in", tenses: ["pastSimple"] },
  { pattern: "timeBare", cue: "today", preposition: "", tenses: all },
  { pattern: "timeBare", cue: "this week", preposition: "", tenses: all },
  ...["every Monday", "every evening"].map(cue => ({ pattern: "timeBare" as const, cue, preposition: "" as const, tenses: ["presentSimple"] as Tense[] })),
  ...["yesterday", "last night", "last week"].map(cue => ({ pattern: "timeBare" as const, cue, preposition: "" as const, tenses: ["pastSimple"] as Tense[] })),
  ...["tomorrow", "next Monday", "next year"].map(cue => ({ pattern: "timeBare" as const, cue, preposition: "" as const, tenses: ["futureSimple"] as Tense[] })),
];
const subjects = SUBJECTS.filter(s => ["I", "you", "we", "they", "he", "she", "Emma", "the students"].includes(s.text));
const actions = VERBS.filter(v => ["work", "study", "read"].includes(v.base)).map(v => ({
  ...v, object: v.base === "work" ? "" : v.base === "read" ? "some books" : "English",
}));

export function supportsTimePreposition(pattern: string | undefined, tense: Tense): boolean {
  return times.some(item => (!pattern || item.pattern === pattern) && item.tenses.includes(tense));
}

export function buildTimePrepositionQuestion(tense: Tense, form: SentenceForm, pattern?: string, previousAnswer?: string): Question {
  if (!TIME_PREPOSITION_FORMS.includes(form) || !supportsTimePreposition(pattern, tense)) {
    throw new RangeError("Unsupported time-preposition combination");
  }
  const candidates = times.filter(item => (!pattern || item.pattern === pattern) && item.tenses.includes(tense))
    .flatMap(time => subjects.flatMap(subject => actions.map(verb => {
      const phrase = [time.preposition, time.cue].filter(Boolean).join(" ");
      return { time, subject, verb, phrase, answer: conjugateVerbal(tense, subject, verb, form, { tail: phrase }) };
    })));
  const remaining = candidates.filter(item => item.answer !== previousAnswer);
  const pool = remaining.length ? remaining : candidates;
  const { time, subject, verb, phrase, answer } = pool[Math.floor(Math.random() * pool.length)];
  const plain = conjugateVerbal(tense, subject, verb, form);
  const embedded = form === "yesNoQuestion" || subject.text[0] === subject.text[0].toLowerCase()
    ? plain[0].toLowerCase() + plain.slice(1) : plain;
  const fronted = `${phrase[0].toUpperCase() + phrase.slice(1)}, ${embedded}`;
  const clusters = verbalClusters(tense, subject, verb);
  const explanation = time.preposition === "at" ? "Gunakan at untuk jam atau titik waktu seperti noon dan midnight."
    : time.preposition === "on" ? "Gunakan on untuk hari, tanggal, dan bagian hari yang menyebut hari tertentu."
    : time.preposition === "in" ? "Gunakan in untuk bulan, tahun, dan bagian hari seperti the morning."
    : "Today, yesterday, dan tomorrow serta frasa waktu dengan this, last, next, atau every tidak memakai at/on/in.";
  return {
    tense, mode: "verbal", form, subject, verb, timeSignal: phrase, answer,
    focused: {
      label: "Preposisi waktu",
      instruction: "Susun kalimat sesuai tense dan bentuk pada label. Pilih at, on, in, atau tanpa preposisi untuk bahan waktu. Keterangan waktu boleh di awal atau akhir.",
      rows: [{ label: "Bahan kalimat", detail: `${TENSE_LABELS[tense]} · Verbal · ${FORM_LABELS[form]}`,
        cues: { subject: subject.text, verb: verb.base, complement: verb.object || undefined, time: time.cue } }],
      explanation, alternatives: [fronted],
      analysis: { parts: [
        { text: subject.text, role: "Subjek" },
        ...(form === "positive" ? [{ text: clusters.positiveCluster, role: "Verb utama" }]
          : [{ text: clusters.aux, role: "Auxiliary" }, { text: clusters.afterAux, role: "Verb utama" },
            ...(form === "negative" ? [{ text: "not", role: "Negasi" }] : [])]),
        ...(verb.object ? [{ text: verb.object, role: "Objek" }] : []),
        ...(time.preposition ? [{ text: time.preposition, role: "Preposisi waktu" }] : []),
        { text: time.cue, role: "Keterangan waktu" },
      ] },
    },
  };
}
