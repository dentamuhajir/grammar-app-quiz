import { example as ex, groupedExample as grouped, token as t, type GuideExample, type GuideToken, type GuideVisual } from "./guideVisuals";

const contextual = (status: GuideExample["status"], context: string, note: string, ...tokens: GuideToken[]): GuideExample => ({ ...ex(status, note, ...tokens), context });

export const REPORTED_GUIDE_VISUALS = {
  statement: {
    formula: [t("said / told", "verb"), t(" + (that) + subjek + verb sesuai waktu laporan")],
    examples: [contextual("compare", "Kemarin Maya berkata tentang keadaannya saat itu.", "Ucapan langsung mempertahankan kata-kata Maya.", t("Maya said, “I "), t("am", "verb"), t(" tired.”")),
      contextual("compare", "Melaporkan ucapan kemarin tentang keadaan Maya pada saat itu.", "Am bergeser menjadi was; I dalam ucapan Maya menjadi she.", t("Maya said she "), t("was", "verb"), t(" tired."))],
  },
  sayTell: {
    formula: [t("say + (that) klausa · tell + orang + (that) klausa", "verb")],
    examples: [ex("correct", "Told langsung diikuti penerima me.", t("She "), t("told me", "verb"), t(" that she was busy.")),
      ex("correct", "Said dapat langsung diikuti isi pernyataan.", t("She "), t("said", "verb"), t(" that she was busy.")),
      ex("incorrect", "Gunakan told me atau said to me, bukan said me.", t("She "), t("said me", "error"), t(" that she was busy."))],
  },
  question: {
    formula: [t("asked + WH / if / whether + "), t("subjek", "subject"), t(" + "), t("verb", "verb")],
    examples: [ex("correct", "Pertanyaan yang dilaporkan memakai urutan I lived.", t("She asked where "), t("I", "subject"), t(" "), t("lived", "verb"), t(".")),
      ex("incorrect", "Jangan gunakan inversi did I live dalam klausa laporan ini.", t("She asked where "), t("did I live", "error"), t(".")),
      ex("correct", "Pertanyaan yes/no dapat diperkenalkan dengan if atau whether.", t("She asked "), t("whether", "connector"), t(" the shop was open."))],
  },
  request: {
    formula: [t("asked / told + orang + (not) "), t("to + V1", "infinitive")],
    examples: [ex("correct", "Me adalah penerima permintaan; tindakan memakai to wait.", t("He asked "), t("me", "object"), t(" "), t("to wait", "infinitive"), t(".")),
      ex("correct", "Larangan dilaporkan dengan not sebelum to-infinitive.", t("She told us "), t("not to leave", "infinitive"), t(".")),
      ex("incorrect", "Pada pola permintaan ini, gunakan to wait.", t("He asked me "), t("wait", "error"), t("."))],
  },
  reference: {
    collapsible: true,
    formulaLabel: "Sesuaikan dengan sudut pandang laporan",
    formula: [t("I / you / here / today / tomorrow", "adverb"), t(" berubah hanya jika referen atau waktu laporan berubah")],
    examples: [contextual("compare", "Kemarin Maya berkata kepada saya bahwa dia akan menelepon besoknya.", "I adalah Maya; you adalah saya; tomorrow adalah hari setelah ucapan itu.", t("Maya said, “I will call you tomorrow.”")),
      contextual("compare", "Hari ini saya melaporkan ucapan Maya kemarin kepada orang lain.", "I → she, you → me, will → would, tomorrow → today sesuai konteks laporan ini.", t("Maya said "), t("she would call me today", "clause"), t("."))],
  },
} satisfies Record<string, GuideVisual>;

export const PARTICIPLE_GUIDE_VISUALS = {
  active: {
    formula: [t("Benda / orang + "), t("V-ing", "verb"), t(" (penjelas aktif)")],
    examples: [ex("compare", "Bentuk lengkap: who is standing menerangkan wanita.", t("The woman "), t("who is standing near the door", "clause"), t(" is my aunt.")),
      ex("compare", "Bentuk ringkas mempertahankan makna aktif: wanita itu berdiri.", t("The woman "), t("standing near the door", "clause"), t(" is my aunt."))],
  },
  passive: {
    formula: [t("Benda / orang + "), t("V3", "verb"), t(" (penjelas pasif)")],
    examples: [ex("compare", "Bentuk lengkap: paket menerima tindakan pengiriman.", t("The package "), t("that was sent yesterday", "clause"), t(" arrived today.")),
      ex("compare", "Bentuk ringkas memakai V3 sent dan tetap bermakna pasif.", t("The package "), t("sent yesterday", "clause"), t(" arrived today."))],
  },
  meaning: {
    formulaLabel: "Periksa pelaku dan penerima tindakan",
    formula: [t("V-ing", "verb"), t(" (melakukan) · "), t("V3", "verb"), t(" (menerima tindakan pada pola ini)")],
    examples: [ex("correct", "Dokumen ditandatangani oleh manajer. Are here adalah predikat utama.", t("The documents "), t("signed by the manager", "clause"), t(" "), t("are", "verb"), t(" here.")),
      ex("incorrect", "Dokumen menerima tanda tangan, bukan melakukan signing; gunakan signed.", t("The documents "), t("signing", "error"), t(" by the manager are here.")),
      ex("incorrect", "Standing near the door hanya penjelas; kalimat utama masih membutuhkan is.", t("The woman standing near the door "), t("my aunt", "error"), t("."))],
  },
} satisfies Record<string, GuideVisual>;

export const INVERSION_GUIDE_VISUALS = {
  never: {
    formula: [t("Never", "adverb"), t(" + "), t("auxiliary", "verb"), t(" + "), t("subjek", "subject"), t(" + verb lanjutan")],
    examples: [ex("compare", "Urutan pernyataan biasa: I have never seen … .", t("I have never seen such a view.")),
      ex("compare", "Never di depan memberi penekanan; have mendahului I. Ini pernyataan, bukan pertanyaan.", t("Never", "adverb"), t(" "), t("have", "verb"), t(" "), t("I", "subject"), t(" seen such a view.")),
      ex("incorrect", "Jika never dipindah ke awal pada pola ini, gunakan have I.", t("Never "), t("I have", "error"), t(" seen such a view."))],
  },
  notOnly: {
    formula: [t("Not only + auxiliary + subjek + verb", "clause"), t(", but + klausa tambahan")],
    examples: [grouped("correct", "Not only di awal memicu inversi pada klausa pertama; klausa kedua tetap berurutan biasa.",
      { label: "Penekanan", tokens: [t("Not only ", "adverb"), t("did", "verb"), t(" "), t("she", "subject"), t(" call,")] },
      { label: "Tambahan", tokens: [t("but she also wrote.", "clause")] }),
      ex("incorrect", "Setelah did, gunakan V1 call, bukan called.", t("Not only did she "), t("called", "error"), t(", but she also wrote."))],
  },
  onlyThen: {
    formula: [t("Only then", "adverb"), t(" + "), t("auxiliary", "verb"), t(" + "), t("subjek", "subject"), t(" + verb lanjutan")],
    examples: [ex("compare", "Only then di akhir memakai urutan pernyataan biasa.", t("He noticed the mistake only then.")),
      ex("correct", "Pada Past Simple, tambahkan did sebelum he; notice kembali ke V1.", t("Only then", "adverb"), t(" "), t("did", "verb"), t(" "), t("he", "subject"), t(" notice the mistake.")),
      ex("incorrect", "Gunakan did he notice setelah only then yang diletakkan di depan.", t("Only then "), t("he noticed", "error"), t(" the mistake."))],
  },
} satisfies Record<string, GuideVisual>;
