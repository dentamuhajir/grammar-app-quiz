import { DEFAULT_MULTI_FILTER, type MultiQuizFilter } from "./generator";
import { FOCUSED_FORMS, QUANTIFIER_TENSES } from "./focusedSentences";
import { FREQUENCY_FORMS, FREQUENCY_MODES, FREQUENCY_TENSES } from "./frequencySentences";
import { structureItems, type StructureFocus } from "./structureSentences";
import { GERUND_TENSES } from "./gerundSentences";
import { COMPARISON_TENSES } from "./comparisonSentences";
import { TIME_PREPOSITION_TENSES } from "./timePrepositionSentences";
import type { Mode, SentenceForm, Tense } from "./types";

export const SENTENCE_PRESETS: { id: string; label: string; description: string; filter: MultiQuizFilter }[] = [
  { id: "basic", label: "Dasar", description: "Present Simple · verbal dan nominal · positif",
    filter: { tenses: ["presentSimple"], modes: ["verbal", "nominal"], forms: ["positive"], includeRare: false } },
  { id: "everyday", label: "Sehari-hari", description: "Empat tense: kebiasaan, kejadian lampau, kegiatan sekarang, dan masa depan.",
    filter: { tenses: ["presentSimple", "pastSimple", "presentContinuous", "futureSimple"], modes: ["verbal", "nominal"],
      forms: ["positive", "negative", "yesNoQuestion"], includeRare: false } },
  { id: "extended", label: "Lebih lengkap", description: "Paket Sehari-hari, ditambah Present Perfect dan Past Continuous.",
    filter: { tenses: ["presentSimple", "pastSimple", "presentContinuous", "futureSimple", "presentPerfect", "pastContinuous"],
      modes: ["verbal", "nominal"], forms: ["positive", "negative", "yesNoQuestion"], includeRare: false } },
  { id: "all", label: "Semua tense", description: "Seluruh kombinasi Latihan umum yang didukung, termasuk passive dan WH.",
    filter: DEFAULT_MULTI_FILTER },
];
export const STARTER_SENTENCE_FILTER = SENTENCE_PRESETS[0].filter;
export function copySentenceFilter(filter: MultiQuizFilter): MultiQuizFilter {
  return { ...filter, tenses: [...filter.tenses], modes: [...filter.modes], forms: [...filter.forms] };
}
export function matchingSentencePreset(filter: MultiQuizFilter) {
  const same = <T,>(a: T[], b: T[]) => a.length === b.length && a.every(item => b.includes(item));
  return !filter.focus ? SENTENCE_PRESETS.find(p => same(p.filter.tenses, filter.tenses)
    && same(p.filter.modes, filter.modes) && same(p.filter.forms, filter.forms) && p.filter.includeRare === filter.includeRare) : undefined;
}
type Focus = MultiQuizFilter["focus"];
export const SENTENCE_FOCUS_GROUPS: { label: string; items: { value: Focus; label: string }[] }[] = [
  { label: "Kalimat dasar", items: [
    { value: undefined, label: "Latihan umum" }, { value: "sentenceStructure", label: "Struktur & Urutan Kalimat" },
    { value: "thereIt", label: "There & It" },
  ] },
  { label: "Pola kata", items: [
    { value: "frequencyAdverbs", label: "Adverbs of Frequency" }, { value: "modals", label: "Modals" },
    { value: "timePrepositions", label: "Preposisi waktu" }, { value: "comparisons", label: "Comparatives & Superlatives" },
    { value: "gerundInfinitive", label: "Gerund & Infinitive" }, { value: "quantifiers", label: "Quantifiers" },
  ] },
  { label: "Hubungan antarklausa", items: [
    { value: "relativeClause", label: "Relative clause" }, { value: "reasonClause", label: "Penghubung antarklausa" },
    { value: "conditionals", label: "If / Conditionals" },
  ] },
];

export function selectSentenceFocus(current: MultiQuizFilter, general: MultiQuizFilter, focus: Focus): MultiQuizFilter {
  if (!focus || focus === "relativeClause") return { ...copySentenceFilter(general), focus, focusPattern: undefined };
  const retain = <T,>(selected: T[], available: readonly T[]) => {
    const kept = selected.filter(item => available.includes(item));
    return kept.length ? kept : [...available];
  };
  if (focus === "sentenceStructure" || focus === "thereIt" || focus === "reasonClause") {
    const focusPattern = focus === "reasonClause" ? "because" : undefined;
    const items = structureItems(focus as StructureFocus, focusPattern);
    return { ...current, focus, focusPattern, tenses: retain(current.tenses, [...new Set(items.map(i => i.tense))]),
      modes: [...new Set(items.map(i => i.mode))], forms: retain(current.forms, [...new Set(items.map(i => i.form))]) };
  }
  if (focus === "modals") return { ...current, focus, focusPattern: undefined, modalFunction: "ability", modalTime: "present",
    modalPattern: undefined, modes: ["verbal"], forms: retain(current.forms, FOCUSED_FORMS) };
  const tenses: Tense[] = focus === "frequencyAdverbs" ? FREQUENCY_TENSES
    : focus === "gerundInfinitive" ? GERUND_TENSES : focus === "comparisons" ? COMPARISON_TENSES
    : focus === "timePrepositions" ? TIME_PREPOSITION_TENSES : focus === "quantifiers" ? QUANTIFIER_TENSES : current.tenses;
  const modes: Mode[] = focus === "frequencyAdverbs" ? retain(current.modes, FREQUENCY_MODES)
    : focus === "comparisons" ? ["nominal"] : focus === "quantifiers" ? retain(current.modes, ["verbal", "nominal", "passive"] as Mode[]) : ["verbal"];
  const forms: SentenceForm[] = focus === "frequencyAdverbs" ? FREQUENCY_FORMS : FOCUSED_FORMS;
  return { ...current, focus, focusPattern: undefined, tenses: retain(current.tenses, tenses), modes, forms: retain(current.forms, forms) };
}
