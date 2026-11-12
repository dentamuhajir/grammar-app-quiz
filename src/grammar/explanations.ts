import { nominalClusters, passiveClusters, verbalClusters } from "./engine";
import { isContinuous, isPerfectContinuous, TENSE_LABELS } from "./labels";
import type { Question, Tense, Verb } from "./types";

export interface SentenceGuide {
  formula: string;
  reasons: string[];
  notes: string[];
  parts: Array<{ text: string; role: string }>;
}

export function effectiveTense(q: Question): Tense {
  if ((q.mode === "nominal" || q.mode === "verbal" && q.verb?.stative) && isPerfectContinuous(q.tense)) {
    return q.tense.replace("Continuous", "") as Tense;
  }
  if (q.mode === "nominal" && q.tense === "futureContinuous") return "futureSimple";
  return q.tense;
}

const USES: Record<Tense, string> = {
  presentSimple: "Present Simple menyatakan kebiasaan, fakta, atau keadaan yang berlaku secara umum.",
  pastSimple: "Past Simple menyatakan kejadian atau keadaan pada masa lalu.",
  futureSimple: "Bentuk will menyatakan prediksi, keputusan, atau hal yang akan terjadi.",
  presentContinuous: "Present Continuous menyatakan kegiatan yang sedang berlangsung, keadaan sementara, atau rencana yang sudah diatur.",
  pastContinuous: "Past Continuous menyatakan kegiatan yang sedang berlangsung pada suatu waktu di masa lalu.",
  futureContinuous: "Future Continuous menyatakan kegiatan yang akan sedang berlangsung pada suatu waktu mendatang.",
  presentPerfect: "Present Perfect menghubungkan kejadian atau keadaan sebelumnya dengan keadaan sekarang.",
  pastPerfect: "Past Perfect menunjukkan sesuatu yang sudah terjadi sebelum titik waktu atau kejadian lain di masa lalu.",
  futurePerfect: "Future Perfect menunjukkan sesuatu yang akan sudah selesai atau tercapai sebelum titik waktu mendatang.",
  presentPerfectContinuous: "Present Perfect Continuous menekankan proses atau durasi kegiatan yang berlangsung hingga sekarang atau baru saja berhenti.",
  pastPerfectContinuous: "Past Perfect Continuous menekankan durasi kegiatan sebelum titik waktu lain di masa lalu.",
  futurePerfectContinuous: "Future Perfect Continuous menekankan durasi kegiatan hingga titik waktu tertentu di masa depan.",
};

export function sentenceGuide(q: Question): SentenceGuide {
  const tense = effectiveTense(q);
  const agreement = q.mode === "passive" && q.verb
    ? { text: q.verb.object, person: 3 as const, number: q.verb.objectNumber }
    : q.subject;
  const symbolic = { ...q.verb, base: "V1", past: "V2", participle: "V3", ing: "V-ing", thirdSingular: "V1+s/es" } as Verb;
  const being = q.mode === "nominal" && ["presentContinuous", "pastContinuous"].includes(tense);
  const cluster = q.mode === "passive" ? passiveClusters(tense, agreement)
    : q.mode === "nominal" ? nominalClusters(tense, agreement, being)
    : verbalClusters(tense, agreement, symbolic);
  const isQuestion = q.form === "yesNoQuestion" || q.form === "whQuestion";
  const subjectLabel = q.mode === "passive" ? "Subjek penerima tindakan" : "Subjek";
  const formulaParts = q.form === "positive" ? [subjectLabel, cluster.positiveCluster]
    : q.form === "negative" ? [subjectLabel, cluster.aux, "not", cluster.afterAux]
    : [q.form === "whQuestion" ? q.whWord : "", cluster.aux, subjectLabel, cluster.afterAux];
  if (q.mode === "passive") formulaParts.push("V3", "by + pelaku");
  if (q.mode === "nominal" && !["What", "Where", "How"].includes(q.whWord ?? "")) formulaParts.push("Pelengkap");
  if (q.mode === "verbal" && q.verb?.object && q.whWord !== "What" && !(q.whWord === "How" && ["fast", "well", "hard"].includes(q.verb.object))) formulaParts.push("Objek / pelengkap");
  const reasons = [USES[tense]];
  if (q.mode === "passive") {
    reasons.push(`Dalam passive, “${agreement.text}” menjadi subjek penerima tindakan. Kata bantu mengikuti subjek ini, bukan pelaku “${q.subject.text}”. Kata kerja utama memakai V3${q.verb ? `: ${q.verb.participle}` : ""}.`);
  } else if (q.mode === "nominal") {
    reasons.push(being ? "Being + kata sifat perilaku menyatakan cara bersikap sementara, bukan sifat tetap." : "Kalimat ini memakai be untuk menghubungkan subjek dengan identitas, sifat, atau tempat; tidak memakai do/does/did sebagai kata bantu.");
    if (q.complement?.kind === "noun" && q.subject.number === "plural") reasons.push(`Subjek jamak memakai pelengkap jamak: ${q.complement.plural}.`);
  } else if (q.verb) {
    if (["presentSimple", "pastSimple"].includes(tense) && q.form !== "positive") reasons.push(`Setelah ${cluster.aux}, gunakan V1 “${q.verb.base}”. Penanda waktu atau kesesuaian subjek sudah ada pada kata bantu; jangan menambahkan -s atau memakai V2 lagi.`);
    else if (tense === "presentSimple") reasons.push(agreement.person === 3 && agreement.number === "singular"
      ? `“${agreement.text}” adalah orang ketiga tunggal. Bentuk kata kerjanya “${q.verb.thirdSingular}” (umumnya -s/-es; have menjadi has).`
      : `Dengan subjek “${agreement.text}”, gunakan bentuk dasar “${q.verb.base}” tanpa tambahan -s/-es.`);
    else if (tense === "pastSimple") reasons.push(`Kalimat positif Past Simple memakai V2: ${q.verb.base} → ${q.verb.past}.`);
    else if (isContinuous(tense)) reasons.push(`Kata kerja utama memakai bentuk -ing: ${q.verb.ing}. Rangkaian kata bantu mengikuti tense pada pola di atas.`);
    else if (tense.includes("Perfect")) reasons.push(`Bentuk perfect memakai V3: ${q.verb.participle}, setelah have/has/had atau will have.`);
    else reasons.push(`Setelah will, gunakan bentuk dasar “${q.verb.base}”.`);
  }
  if (q.form === "negative") reasons.push(`Not diletakkan setelah kata bantu pertama: ${cluster.aux} not.`);
  if (isQuestion) reasons.push(`Kata bantu pertama (${cluster.aux}) berada sebelum subjek${q.form === "whQuestion" ? `, setelah kata tanya ${q.whWord}` : ""}.`);
  if (q.timeSignal) reasons.push(`Keterangan “${q.timeSignal}” ikut dimasukkan. Letaknya dapat dilihat pada pembagian kalimat; kata seperti usually berada di tengah kalimat.`);
  const notes: string[] = [];
  if (tense !== q.tense) notes.push(`Pada soal berlabel ${TENSE_LABELS[q.tense]} ini, pola yang digunakan sebenarnya ${TENSE_LABELS[tense]}. ${q.mode === "nominal" ? "Generator memakai bentuk nominal pengganti; ini bukan pola continuous nominal tersendiri." : `Kata kerja “${q.verb?.base}” pada makna ini menyatakan keadaan, sehingga latihan memakai bentuk perfect tanpa -ing.`}`);
  if (q.rare && q.mode === "passive") notes.push("Bentuk passive ini valid tetapi jarang dipakai dalam percakapan sehari-hari.");
  return { formula: formulaParts.filter(Boolean).join(" + "), reasons, notes, parts: sentenceParts(q) };
}

/** Label known spans before classifying auxiliaries; time clauses may contain their own verbs. */
function sentenceParts(q: Question): SentenceGuide["parts"] {
  const tokens = q.answer.split(/\s+/);
  const clean = (s: string) => s.toLowerCase().replace(/[.,!?]+$/g, "");
  const words = tokens.map(clean);
  const roles: Array<string | undefined> = tokens.map(() => undefined);
  function mark(phrase: string | undefined, role: string) {
    if (!phrase) return;
    const pattern = phrase.split(/\s+/).map(clean);
    for (let i = 0; i <= words.length - pattern.length; i++) {
      if (pattern.every((word, j) => words[i + j] === word && !roles[i + j])) {
        pattern.forEach((_, j) => { roles[i + j] = role; });
        return;
      }
    }
  }
  mark(q.timeSignal, "Keterangan waktu / frekuensi");
  mark(q.whWord, "Kata tanya");
  if (q.mode === "passive") {
    mark(q.verb?.object, "Subjek penerima tindakan");
    mark(`by ${q.subject.objectForm ?? q.subject.text}`, "Pelaku tindakan");
  } else mark(q.subject.text, "Subjek");
  if (q.mode === "nominal" && q.complement) mark(q.subject.number === "plural" && q.complement.kind === "noun" ? q.complement.plural : q.complement.text, "Pelengkap");
  if (q.mode === "verbal") mark(q.verb?.object, "Objek / pelengkap");
  const verbForms = q.verb ? [q.verb.base, q.verb.thirdSingular, q.verb.past, q.verb.participle, q.verb.ing] : [];
  // Last unmatched verb-form occurrence is the main verb (e.g. "Does she do …?").
  if (q.mode !== "nominal") {
    for (let i = words.length - 1; i >= 0; i--) {
      if (!roles[i] && verbForms.includes(words[i])) { roles[i] = q.mode === "passive" ? "Kata kerja V3" : "Kata kerja utama"; break; }
    }
  }
  words.forEach((word, i) => {
    if (roles[i]) return;
    roles[i] = word === "not" ? "Penyangkalan" : /^(am|is|are|was|were|be|being|been|do|does|did|have|has|had|will)$/.test(word)
      ? (q.mode === "nominal" && /^(am|is|are|was|were|be|being|been)$/.test(word) ? "Bentuk be / penghubung" : "Kata bantu") : "Bagian kalimat";
  });
  const parts: SentenceGuide["parts"] = [];
  tokens.forEach((text, i) => {
    const role = roles[i]!;
    if (parts[parts.length - 1]?.role === role) parts[parts.length - 1].text += ` ${text}`;
    else parts.push({ text, role });
  });
  return parts;
}
