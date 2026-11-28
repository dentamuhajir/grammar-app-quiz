import { conjugateNominal, nominalClusters } from "./engine";
import { FORM_LABELS, TENSE_LABELS } from "./labels";
import type { Question, SentenceForm, Subject, Tense } from "./types";

export const COMPARISON_PATTERNS = [
  { value: "comparative", label: "Comparative · dua pembanding" },
  { value: "superlative", label: "Superlative · dalam kelompok" },
] as const;
export const COMPARISON_TENSES: Tense[] = ["presentSimple", "pastSimple", "futureSimple"];
export const COMPARISON_FORMS: SentenceForm[] = ["positive", "negative", "yesNoQuestion"];
type Situation = {
  adjective: string; comparative: string[]; superlative: string[];
  metric: string; names: [string, string, string]; values: [number, number, number]; unit: string;
  number?: Subject["number"];
};
// Values increase in the direction of the adjective (including bad -> worse).
const situations: Situation[] = [
  { adjective: "big", comparative: ["bigger"], superlative: ["biggest"],
    metric: "Luas ruangan", names: ["Room A", "Room B", "Room C"], values: [12, 18, 24], unit: "m²" },
  { adjective: "tall", comparative: ["taller"], superlative: ["tallest"],
    metric: "Tinggi menara", names: ["Tower A", "Tower B", "Tower C"], values: [30, 45, 60], unit: "m" },
  { adjective: "heavy", comparative: ["heavier"], superlative: ["heaviest"],
    metric: "Berat kotak", names: ["Box A", "Box B", "Box C"], values: [2, 4, 6], unit: "kg" },
  { adjective: "expensive", comparative: ["more expensive"], superlative: ["most expensive"],
    metric: "Harga laptop", names: ["Laptop A", "Laptop B", "Laptop C"], values: [400, 600, 800], unit: "dolar" },
  { adjective: "good", comparative: ["better"], superlative: ["best"],
    metric: "Skor kualitas hotel (semakin tinggi semakin baik)", names: ["Hotel A", "Hotel B", "Hotel C"], values: [6, 8, 9], unit: "/10" },
  { adjective: "bad", comparative: ["worse"], superlative: ["worst"],
    metric: "Skor kerusakan jalan (semakin tinggi semakin buruk)", names: ["Road A", "Road B", "Road C"], values: [2, 5, 8], unit: "/10" },
  { adjective: "far", comparative: ["farther", "further"], superlative: ["farthest", "furthest"],
    metric: "Jarak dari sekolah", names: ["Station A", "Station B", "Station C"], values: [1, 3, 5], unit: "km" },
  { adjective: "heavy", comparative: ["heavier"], superlative: ["heaviest"], number: "plural",
    metric: "Berat setiap kotak menurut warna", names: ["the red boxes", "the blue boxes", "the green boxes"], values: [2, 4, 6], unit: "kg per kotak" },
];

export function supportsComparison(pattern?: string): boolean {
  return !pattern || COMPARISON_PATTERNS.some(item => item.value === pattern);
}

export function buildComparisonQuestion(tense: Tense, form: SentenceForm, pattern?: string, previousAnswer?: string): Question {
  if (!COMPARISON_TENSES.includes(tense) || !COMPARISON_FORMS.includes(form) || !supportsComparison(pattern)) {
    throw new RangeError("Unsupported comparison combination");
  }
  const patterns = COMPARISON_PATTERNS.filter(item => !pattern || item.value === pattern);
  const candidates = patterns.flatMap(({ value }) => situations.flatMap(situation => {
    const pairs = value === "comparative" ? [[1, 0], [2, 0], [2, 1]] : [[2, 0]];
    const targets = form !== "negative" ? pairs : value === "comparative"
      ? pairs.map(([higher, lower]) => [lower, higher]) : [[0, 0], [1, 0]];
    return targets.map(([target, other]) => {
      const subject: Subject = { text: situation.names[target], number: situation.number ?? "singular", person: 3, entity: "thing" };
      const forms = value === "comparative" ? situation.comparative : situation.superlative;
      const comparison = value === "comparative" ? situation.names[other] : "in the group";
      const complements = forms.map(word => value === "comparative" ? `${word} than ${comparison}` : `the ${word} ${comparison}`);
      const answers = complements.map(text => conjugateNominal(tense, subject, { text, kind: "adjective" }, form));
      return { value, situation, subject, comparison, complements, answers };
    });
  }));
  const remaining = candidates.filter(item => !item.answers.includes(previousAnswer ?? ""));
  const pool = remaining.length ? remaining : candidates;
  const { value, situation, subject, comparison, complements, answers } = pool[Math.floor(Math.random() * pool.length)];
  const context = tense === "pastSimple" ? "Catatan tahun lalu" : tense === "futureSimple" ? "Perkiraan tahun depan" : "Data sekarang";
  const data = situation.names.map((name, index) => `${name}: ${situation.values[index]} ${situation.unit}`).join("; ");
  const target = value === "comparative"
    ? `Bandingkan ${subject.text} dengan ${comparison}` : `Bandingkan ${subject.text} dengan seluruh kelompok di atas`;
  const adjectivePhrase = value === "comparative" ? situation.comparative[0] : `the ${situation.superlative[0]}`;
  const clusters = nominalClusters(tense, subject, false);
  const explanation = `${situation.adjective} menjadi ${value === "comparative" ? situation.comparative.join(" / ") : situation.superlative.join(" / ")}. ${value === "comparative" ? "Gunakan comparative + than untuk dua pembanding." : "Gunakan the + superlative untuk anggota kelompok."} Mulai dengan ${subject.text}; be mengikuti tense dan jumlah subjek. ${form === "negative" ? "Data menunjukkan perbandingan ini tidak benar, sehingga gunakan bentuk negatif." : form === "yesNoQuestion" ? "Pada pertanyaan, pindahkan auxiliary/be ke depan subjek." : "Data menentukan arah perbandingan."}`;
  return {
    tense, mode: "nominal", form, subject, answer: answers[0], complement: { text: complements[0], kind: "adjective" },
    focused: {
      label: "Comparatives & Superlatives",
      instruction: `${context}. ${situation.metric}: ${data}. ${target} memakai ${situation.adjective}. Mulai dengan ${subject.text} dan ikuti bentuk pada label.`,
      rows: [{ label: "Bahan kalimat", detail: `${value === "comparative" ? "Comparative" : "Superlative"} · ${TENSE_LABELS[tense]} · Nominal · ${FORM_LABELS[form]}`,
        cues: { subject: subject.text, verb: "be", complement: situation.adjective, comparison } }],
      explanation, alternatives: answers.slice(1),
      analysis: { parts: [
        { text: subject.text, role: "Subjek yang dibandingkan" },
        ...(form === "positive" ? [{ text: clusters.positiveCluster, role: "Be / auxiliary" }]
          : [{ text: clusters.aux, role: "Be / auxiliary" }, ...(clusters.afterAux ? [{ text: clusters.afterAux, role: "Be" }] : []),
            ...(form === "negative" ? [{ text: "not", role: "Negasi" }] : [])]),
        { text: adjectivePhrase, role: value === "comparative" ? "Comparative" : "Superlative",
          alternatives: value === "comparative" ? situation.comparative.slice(1) : situation.superlative.slice(1).map(word => `the ${word}`) },
        ...(value === "comparative" ? [{ text: "than", role: "Penghubung perbandingan" }] : []),
        { text: comparison, role: value === "comparative" ? "Pembanding" : "Kelompok pembanding" },
      ] },
    },
  };
}
