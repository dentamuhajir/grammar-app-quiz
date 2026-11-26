import { SUBJECTS } from "./data/subjects";
import { VERBS } from "./data/verbs";
import { conjugateNominal, conjugateVerbal } from "./engine";
import { FORM_LABELS } from "./labels";
import type { Question, SentenceForm, Tense, Verb } from "./types";

export const MODAL_FUNCTIONS = [
  { value: "ability", label: "Kemampuan" }, { value: "permission", label: "Izin" },
  { value: "advice", label: "Saran" }, { value: "obligation", label: "Kewajiban" },
  { value: "possibility", label: "Kemungkinan" }, { value: "deduction", label: "Kesimpulan kuat" },
] as const;
export const MODAL_TIMES = [
  { value: "present", label: "Sekarang" }, { value: "past", label: "Masa lalu" },
  { value: "future", label: "Masa depan" },
] as const;
export type ModalFunction = typeof MODAL_FUNCTIONS[number]["value"];
export type ModalTime = typeof MODAL_TIMES[number]["value"];
type Structure = "modal" | "able" | "allowed" | "haveTo";
interface ModalDefinition {
  value: string;
  label: string;
  function: ModalFunction;
  time: ModalTime;
  structure: Structure;
  modal?: string;
  perfect?: boolean;
  forms: readonly SentenceForm[];
  context?: string;
}
const allForms: SentenceForm[] = ["positive", "negative", "yesNoQuestion"];
const statements: SentenceForm[] = ["positive", "negative"];

// Function/time are explicit: identical words can teach different meanings.
export const MODAL_PATTERNS: readonly ModalDefinition[] = [
  { value: "can", label: "can", function: "ability", time: "present", structure: "modal", modal: "can", forms: allForms },
  { value: "beAble", label: "be able to", function: "ability", time: "present", structure: "able", forms: allForms },
  { value: "could", label: "could · kemampuan umum", function: "ability", time: "past", structure: "modal", modal: "could", forms: allForms, context: "Kemampuan umum di masa lalu, bukan keberhasilan pada satu kejadian." },
  { value: "wasAble", label: "was/were able to", function: "ability", time: "past", structure: "able", forms: allForms, context: "Satu kesempatan di masa lalu: berhasil atau tidak berhasil melakukan tindakan." },
  { value: "willAble", label: "will be able to", function: "ability", time: "future", structure: "able", forms: allForms },
  { value: "canPermission", label: "can · izin", function: "permission", time: "present", structure: "modal", modal: "can", forms: allForms },
  { value: "mayPermission", label: "may · izin formal", function: "permission", time: "present", structure: "modal", modal: "may", forms: allForms },
  { value: "couldPermission", label: "could · meminta izin dengan sopan", function: "permission", time: "present", structure: "modal", modal: "could", forms: ["yesNoQuestion"], context: "Meminta izin dengan sopan sekarang; could di sini bukan kemampuan masa lalu." },
  { value: "wasAllowed", label: "was/were allowed to", function: "permission", time: "past", structure: "allowed", forms: allForms },
  { value: "willAllowed", label: "will be allowed to", function: "permission", time: "future", structure: "allowed", forms: allForms },
  { value: "should", label: "should", function: "advice", time: "present", structure: "modal", modal: "should", forms: allForms },
  { value: "shouldHave", label: "should have + V3", function: "advice", time: "past", structure: "modal", modal: "should", perfect: true, forms: allForms, context: "Menilai tindakan masa lalu: seharusnya dilakukan atau seharusnya tidak dilakukan." },
  { value: "shouldFuture", label: "should · masa depan", function: "advice", time: "future", structure: "modal", modal: "should", forms: allForms },
  { value: "must", label: "must", function: "obligation", time: "present", structure: "modal", modal: "must", forms: allForms },
  { value: "haveTo", label: "have/has to", function: "obligation", time: "present", structure: "haveTo", forms: allForms },
  { value: "hadTo", label: "had to", function: "obligation", time: "past", structure: "haveTo", forms: allForms },
  { value: "willHaveTo", label: "will have to", function: "obligation", time: "future", structure: "haveTo", forms: allForms },
  { value: "may", label: "may", function: "possibility", time: "present", structure: "modal", modal: "may", forms: statements },
  { value: "might", label: "might", function: "possibility", time: "present", structure: "modal", modal: "might", forms: statements },
  { value: "couldPossibility", label: "could · kemungkinan", function: "possibility", time: "present", structure: "modal", modal: "could", forms: ["positive"] },
  { value: "mayHave", label: "may have + V3", function: "possibility", time: "past", structure: "modal", modal: "may", perfect: true, forms: statements },
  { value: "mightHave", label: "might have + V3", function: "possibility", time: "past", structure: "modal", modal: "might", perfect: true, forms: statements },
  { value: "couldHave", label: "could have + V3", function: "possibility", time: "past", structure: "modal", modal: "could", perfect: true, forms: ["positive"], context: "Dugaan bahwa sesuatu mungkin terjadi, bukan kesempatan yang tidak digunakan." },
  { value: "mayFuture", label: "may · masa depan", function: "possibility", time: "future", structure: "modal", modal: "may", forms: statements },
  { value: "mightFuture", label: "might · masa depan", function: "possibility", time: "future", structure: "modal", modal: "might", forms: statements },
  { value: "couldFuture", label: "could · kemungkinan masa depan", function: "possibility", time: "future", structure: "modal", modal: "could", forms: ["positive"] },
  { value: "mustDeduction", label: "must · kesimpulan", function: "deduction", time: "present", structure: "modal", modal: "must", forms: ["positive"] },
  { value: "cannotDeduction", label: "cannot · tidak mungkin", function: "deduction", time: "present", structure: "modal", modal: "can", forms: ["negative"] },
  { value: "mustHave", label: "must have + V3", function: "deduction", time: "past", structure: "modal", modal: "must", perfect: true, forms: ["positive"] },
  { value: "cannotHave", label: "cannot have + V3", function: "deduction", time: "past", structure: "modal", modal: "can", perfect: true, forms: ["negative"] },
];
export interface ModalSelection {
  modalFunction?: ModalFunction;
  modalTime?: ModalTime;
  modalPattern?: string;
}
export function modalPatterns(selection: ModalSelection = {}): readonly ModalDefinition[] {
  return MODAL_PATTERNS.filter(p => (!selection.modalFunction || p.function === selection.modalFunction)
    && (!selection.modalTime || p.time === selection.modalTime)
    && (!selection.modalPattern || p.value === selection.modalPattern));
}
export function modalForms(selection: ModalSelection = {}): SentenceForm[] {
  return allForms.filter(form => modalPatterns(selection).some(p => p.forms.includes(form)));
}
export function modalSummary(selection: ModalSelection): string {
  return [MODAL_FUNCTIONS.find(f => f.value === selection.modalFunction)?.label ?? "Semua fungsi",
    MODAL_TIMES.find(t => t.value === selection.modalTime)?.label ?? "Semua waktu",
    MODAL_PATTERNS.find(p => p.value === selection.modalPattern)?.label ?? "Semua pola"].join(" · ");
}
const subjects = SUBJECTS.filter(s => ["I", "you", "we", "they", "he", "she", "Emma", "the students"].includes(s.text));
const actions: Record<ModalFunction, string[]> = {
  ability: ["cook", "read", "write", "play", "swim", "speak"],
  permission: ["open", "close", "use", "leave", "read"],
  advice: ["study", "help", "wash", "eat", "drink", "read"],
  obligation: ["study", "wash", "open", "close", "finish", "clean"],
  possibility: ["know", "like"], deduction: ["know", "like"],
};
const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
const tenseFor: Record<ModalTime, Tense> = { present: "presentSimple", past: "pastSimple", future: "futureSimple" };

function meaning(p: ModalDefinition, form: SentenceForm): string {
  if (p.function === "ability") return form === "negative" ? "Ketidakmampuan: tidak bisa melakukan tindakan." : "Kemampuan: bisa melakukan tindakan.";
  if (p.function === "permission") return form === "negative" ? "Izin tidak diberikan: tidak boleh melakukan tindakan."
    : form === "yesNoQuestion" ? p.time === "past" ? "Tanyakan apakah izin untuk melakukan tindakan diberikan di masa lalu."
      : p.time === "future" ? "Tanyakan apakah izin untuk melakukan tindakan akan diberikan." : "Minta izin untuk melakukan tindakan."
      : "Izin: diperbolehkan melakukan tindakan.";
  if (p.function === "advice") return form === "negative" ? "Saran: sebaiknya tidak melakukan tindakan (seharusnya tidak, untuk masa lalu)." : "Saran: sebaiknya melakukan tindakan (seharusnya, untuk masa lalu).";
  if (p.function === "possibility") return form === "negative" ? "Kemungkinan: mungkin tidak terjadi, bukan pasti tidak terjadi." : "Kemungkinan: mungkin terjadi; pembicara belum yakin.";
  if (p.function === "deduction") return form === "negative" ? "Bukti mengarah pada kesimpulan: tidak mungkin; bukan larangan." : "Bukti mengarah pada kesimpulan kuat: pasti; bukan kewajiban.";
  return form === "negative" ? p.structure === "haveTo" ? "Tidak ada kewajiban: tidak perlu, bukan tidak boleh."
    : "Larangan: must not berarti tidak boleh, bukan tidak perlu." : "Kewajiban: harus melakukan tindakan.";
}

export function buildModalQuestion(form: SentenceForm, pattern?: string, selection: ModalSelection = {}): Question {
  const candidates = modalPatterns({ ...selection, modalPattern: pattern ?? selection.modalPattern }).filter(p => p.forms.includes(form));
  if (!candidates.length) throw new RangeError("Unsupported modal function/time/pattern/form");
  const p = pick(candidates);
  const subject = pick(p.function === "permission" && form === "yesNoQuestion" ? subjects.filter(s => ["I", "we"].includes(s.text)) : subjects);
  let verb = pick(VERBS.filter(v => actions[p.function].includes(v.base)));
  if (p.function === "possibility" || p.function === "deduction") {
    verb = { ...verb, object: pick(verb.base === "know" ? ["him", "the answer", "the teacher"] : ["coffee", "tea", "the book"]) };
  }
  const tense = tenseFor[p.time];
  const time = p.value === "could" ? "in the past" : p.time === "past" ? "yesterday" : p.time === "future" ? "tomorrow" : "now";
  const predicate = [verb.base, verb.object].filter(Boolean).join(" ");
  let answer: string;
  if (p.structure === "able" || p.structure === "allowed") {
    answer = conjugateNominal(tense, subject, { kind: "adjective", text: `${p.structure === "able" ? "able" : "allowed"} to ${predicate}` }, form, { tail: time });
  } else if (p.structure === "haveTo") {
    const have: Verb = { ...verb, base: "have", thirdSingular: "has", past: "had", participle: "had", ing: "having", object: `to ${predicate}` };
    answer = conjugateVerbal(tense, subject, have, form, { tail: time });
  } else {
    const tail = [p.perfect ? `have ${verb.participle}` : verb.base, verb.object, time].filter(Boolean).join(" ");
    const modal = form === "negative" ? p.modal === "can" ? "cannot" : `${p.modal} not` : p.modal!;
    const text = form === "yesNoQuestion" ? `${modal} ${subject.text} ${tail}` : `${subject.text} ${modal} ${tail}`;
    answer = text[0].toUpperCase() + text.slice(1) + (form === "yesNoQuestion" ? "?" : ".");
  }
  const explanation = `${meaning(p, form)} ${p.structure === "haveTo" ? "Have/has to menjadi had to atau will have to sesuai waktu. Present/past memakai do/does/did pada negatif dan tanya."
    : p.structure === "able" || p.structure === "allowed" ? "Sesuaikan be dengan subjek dan waktu; setelah to gunakan V1."
      : p.perfect ? "Gunakan modal + have + V3; have tidak berubah menjadi has/had."
        : "Gunakan modal + V1 tanpa -s atau to. Negatif memakai not; tanya membalik modal dan subjek tanpa do/does/did."}`;
  return {
    tense, mode: "verbal", form, subject, verb, answer, timeSignal: time,
    focused: {
      label: "Modals", instruction: `Gunakan pola ${p.label}. ${meaning(p, form)} ${p.context ?? ""}`.trim(),
      rows: [{ label: "Bahan kalimat", detail: `${MODAL_FUNCTIONS.find(f => f.value === p.function)!.label} · ${MODAL_TIMES.find(t => t.value === p.time)!.label} · ${p.label} · Verbal · ${FORM_LABELS[form]}`,
        cues: { subject: subject.text, modal: p.label.split(" · ")[0].replace(" + V3", ""), verb: verb.base, complement: verb.object, time } }],
      explanation, alternatives: [],
    },
  };
}
