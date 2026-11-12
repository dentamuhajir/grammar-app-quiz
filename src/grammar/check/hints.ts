import { effectiveTense, sentenceGuide } from "../explanations";
import type { Question } from "../types";
import type { DiffToken } from "./diff";
import { normalize, tokenize } from "./normalize";

const AUX = new Set(["do", "does", "did", "am", "is", "are", "was", "were", "be", "being", "been", "have", "has", "had", "will"]);
const MID = new Set(["usually", "often", "always", "already", "just", "never", "sometimes"]);
const ARTICLES = new Set(["a", "an", "the"]);

/** Explain the actual mismatched slot, rather than guessing from the tense alone. */
export function buildHint(q: Question, diff: DiffToken[]): string {
  const issues = diff.filter(d => d.op !== "match");
  const issue = issues[0];
  if (!issue) return "Jawaban sudah sesuai.";
  const expected = issue.correct ?? "";
  const typed = issue.user ?? "";
  const tense = effectiveTense(q);
  if (q.verb?.stative && issues.some(d => d.user === q.verb?.ing)) {
    return `Kata kerja “${q.verb.base}” menyatakan keadaan (stative verb) sehingga tidak memakai bentuk -ing. Gunakan bentuk perfect dengan V3: “${q.verb.participle}”.`;
  }
  if (expected === "yet" && typed === "already") {
    return "Gunakan “yet” di akhir kalimat negatif atau tanya; “already” umumnya dipakai pada kalimat positif.";
  }
  const roles = sentenceGuide(q).parts.flatMap(part => tokenize(normalize(part.text)).map(() => part.role));
  const role = issue.correctIndex === undefined ? "" : roles[issue.correctIndex];
  const missing = new Set(issues.filter(d => d.correct).map(d => d.correct));
  const moved = issues.map(d => d.user).find(word => word && missing.has(word));
  if (moved) {
    if (MID.has(moved)) return `Posisi “${moved}” belum sesuai. Pada pola latihan ini, kata tersebut berada sebelum kata kerja utama tanpa kata bantu, atau setelah kata bantu pertama / be.`;
    if (AUX.has(moved) && (q.form === "whQuestion" || q.form === "yesNoQuestion")) return `Pada pertanyaan ini, kata bantu “${moved}” berada sebelum subjek${q.whWord ? ` dan setelah ${q.whWord}` : ""}.`;
    return `Kata “${moved}” sudah ada, tetapi posisinya belum sesuai pola soal. Bandingkan urutannya dengan kalimat acuan.`;
  }
  if (ARTICLES.has(expected) || ARTICLES.has(typed)) {
    return `Periksa artikel pada frasa ini: ${expected ? `soal memerlukan “${expected}”` : `“${typed}” tidak diperlukan di posisi ini`}. A/an mengikuti bunyi awal kata berikutnya; the menunjuk sesuatu yang dapat diidentifikasi. Pertahankan frasa yang diberikan soal.`;
  }
  if (role === "Keterangan waktu / frekuensi") {
    return `Periksa keterangan “${q.timeSignal}”. ${expected ? `Bagian yang diharapkan di sini adalah “${expected}”.` : "Gunakan keterangan yang diberikan soal."} Kesalahan ini ada pada keterangan, bukan otomatis pada rumus tense.`;
  }
  if (role === "Kata kerja utama" || role === "Kata kerja V3") {
    const v = q.verb!;
    if (q.mode === "passive") return `Passive memakai V3 setelah rangkaian be: gunakan “${v.participle}”. Walaupun bentuk V2 dan V3 bisa sama, fungsi kata ini adalah V3.`;
    if (["presentSimple", "pastSimple"].includes(tense) && q.form !== "positive") return `Setelah do/does/did, kata kerja utama kembali ke V1: “${v.base}”. Jangan memakai “${typed || "bentuk lain"}” di posisi ini; penanda waktu atau subjek sudah ada pada kata bantu.`;
    if (tense === "presentSimple") return q.subject.person === 3 && q.subject.number === "singular"
      ? `Subjek “${q.subject.text}” adalah orang ketiga tunggal. Gunakan “${v.thirdSingular}” pada kalimat positif (umumnya -s/-es; have menjadi has).`
      : `Dengan subjek “${q.subject.text}”, gunakan bentuk dasar “${v.base}”, tanpa tambahan -s/-es.`;
    if (tense === "pastSimple") return `Kalimat positif Past Simple memakai V2: ${v.base} → ${v.past}.`;
    if (expected === v.ing) return `Pola continuous ini memakai bentuk -ing: “${v.ing}”, setelah rangkaian kata bantu yang sesuai.`;
    if (expected === v.participle) return `Pola perfect ini memakai V3: “${v.participle}”.${tense !== q.tense ? " Kata kerja keadaan pada soal ini memakai bentuk perfect, bukan perfect continuous." : ""}`;
    if (expected === v.base) return `Setelah will, gunakan V1: “${v.base}”.`;
    return `Gunakan bentuk kata kerja “${expected}” sesuai pola soal.`;
  }
  if (role === "Penyangkalan" || typed === "not") return "Letakkan not tepat setelah kata bantu pertama. Pada pertanyaan negatif pun, posisi not perlu mengikuti pola yang diminta soal.";
  if (role === "Kata bantu" || role === "Bentuk be / penghubung") {
    const subject = q.mode === "passive" ? q.verb?.object : q.subject.text;
    if (["do", "does", "did"].includes(expected)) return `Gunakan “${expected}” sebagai kata bantu untuk subjek “${subject}” dan tense ini. Kata kerja setelahnya tetap V1.`;
    if (["am", "is", "are", "was", "were"].includes(expected)) return `Bentuk be untuk subjek “${subject}” pada soal ini adalah “${expected}”.${q.mode === "passive" ? " Dalam passive, kesesuaian mengikuti penerima tindakan, bukan pelakunya." : ""}`;
    if (["have", "has", "had"].includes(expected)) return `Gunakan “${expected}” pada rangkaian perfect ini. Has mengikuti orang ketiga tunggal; had dipakai untuk past perfect; setelah will gunakan have.`;
    if (expected === "been") return "Gunakan been, bentuk V3 dari be, pada rangkaian perfect ini.";
    if (expected === "being") return "Gunakan being untuk continuous passive atau perilaku sementara dengan be.";
    if (expected === "be") return "Setelah will, bentuk dasar be tetap be; jangan menggantinya dengan is/are.";
    if (expected === "will") return "Pola future pada soal ini memakai will sebagai kata bantu pertama.";
  }
  if (role === "Pelengkap" && q.complement?.kind === "noun" && q.subject.number === "plural") return `Subjek jamak memerlukan pelengkap jamak pada soal ini: “${q.complement.plural}”.`;
  if (role === "Subjek" || role === "Subjek penerima tindakan") return `Periksa subjek: gunakan “${q.mode === "passive" ? q.verb?.object : q.subject.text}”.${q.mode === "passive" ? " Objek kalimat aktif menjadi subjek kalimat passive." : ""}`;
  if (role === "Kata tanya") return `Gunakan kata tanya “${q.whWord}” sesuai petunjuk soal.`;
  if (role === "Pelaku tindakan") return `Pelaku dalam passive ditulis setelah by: “by ${q.subject.objectForm ?? q.subject.text}”. Gunakan bentuk objek seperti him/her/them bila pelakunya kata ganti.`;
  if (issue.op === "missing") return `Ada kata yang belum ditulis: “${expected}”. Periksa frasa yang diberikan soal.`;
  if (issue.op === "extra") return `Kata “${typed}” tidak diperlukan pada posisi ini dalam pola soal.`;
  return `Periksa ${role === "Objek / pelengkap" || role === "Pelengkap" ? "objek atau pelengkap" : "kata ini"}: kamu menulis “${typed || "—"}”, sedangkan soal menggunakan “${expected || "—"}”. Ini belum tentu kesalahan tense.`;
}
