import { example as ex, groupedExample as grouped, token as t, type GuideToken, type GuideVisual } from "./guideVisuals";

const group = (label: string, text: string, kind: GuideToken["kind"] = "clause") => ({ label, tokens: [t(text, kind)] });

export const RELATIVE_GUIDE_VISUALS = {
  who: {
    formula: [t("Orang + "), t("who / that", "connector"), t(" + verb (defining)")],
    examples: [ex("correct", "Who menerangkan orang dan menjadi subjek called.", t("The woman "), t("who", "connector"), t(" called me lives next door.")),
      ex("incorrect", "Untuk orang dalam kalimat ini, gunakan who atau that, bukan which.", t("The woman "), t("which", "error"), t(" called me lives next door."))],
  },
  whichThat: {
    formula: [t("Benda + "), t("that / which", "connector"), t(" (defining) · benda, "), t("which", "connector"), t(" …, (non-defining)")],
    examples: [ex("correct", "Klausa tanpa koma menentukan buku yang dimaksud; that atau which boleh digunakan.", t("The book "), t("that", "connector"), t(" is on the desk is mine.")),
      ex("correct", "Sisipan berkoma memberi informasi tambahan tentang laptop.", t("My laptop, "), t("which", "connector"), t(" I bought last year, still works well.")),
      ex("incorrect", "That tidak dipakai untuk sisipan non-defining berkoma.", t("My laptop, "), t("that", "error"), t(" I bought last year, still works well."))],
  },
  object: {
    formula: [t("Benda + (") , t("that / which", "connector"), t(") + "), t("subjek", "subject"), t(" + verb (defining)")],
    examples: [ex("correct", "That menggantikan objek bought; I adalah subjek klausa relatif.", t("The book "), t("that", "connector"), t(" "), t("I", "subject"), t(" bought is expensive.")),
      ex("correct", "Pronoun objek boleh dihilangkan dalam defining clause tanpa koma.", t("The book "), t("I bought", "clause"), t(" is expensive.")),
      ex("incorrect", "Jangan tambahkan it: objek bought sudah diwakili the book.", t("The book that I bought "), t("it", "error"), t(" is expensive."))],
  },
  subject: {
    formula: [t("Orang + "), t("who / that", "connector"), t(" sebagai subjek + verb")],
    examples: [ex("correct", "Who adalah subjek calls; pronoun wajib ditulis.", t("The woman "), t("who", "connector"), t(" calls me lives next door.")),
      ex("incorrect", "Pronoun subjek tidak boleh dihilangkan; tulis who/that calls me.", t("The woman "), t("calls me", "error"), t(" lives next door."))],
  },
  whoseWhere: {
    formula: [t("whose", "connector"), t(" + benda milik · tempat + "), t("where", "connector"), t(" + klausa")],
    examples: [ex("correct", "Whose menghubungkan orang dengan benda miliknya, a laptop.", t("The student "), t("whose laptop", "connector"), t(" was lost called us.")),
      ex("correct", "Where menunjukkan tempat terjadinya kegiatan study.", t("This is the cafe "), t("where", "connector"), t(" I study.")),
      ex("incorrect", "Who's berarti who is/has; untuk kepemilikan gunakan whose.", t("The student "), t("who’s", "error"), t(" laptop was lost called us."))],
  },
} satisfies Record<string, GuideVisual>;

export const CONJUNCTION_GUIDE_VISUALS = {
  contrast: {
    formula: [t("Klausa, "), t("but", "connector"), t(" klausa · "), t("although + klausa", "clause"), t(", klausa utama")],
    examples: [grouped("correct", "But menghubungkan dua klausa setara.", group("Keadaan", "It rained,", "clause"), group("Pertentangan", "but Maya went out.", "result")),
      grouped("correct", "Although memperkenalkan keadaan yang berlawanan dengan kejadian utama.", group("Pertentangan", "Although it rained,", "clause"), group("Kejadian utama", "Maya went out.", "result")),
      ex("incorrect", "Pada pola ini, pilih although atau but; jangan pasangkan keduanya.", t("Although it rained, "), t("but", "error"), t(" Maya went out."))],
  },
  cause: {
    formula: [t("Hasil + "), t("because", "connector"), t(" + alasan · alasan, "), t("so", "connector"), t(" + hasil")],
    examples: [grouped("correct", "Because diikuti alasan mengapa Maya tinggal di rumah.", group("Hasil", "Maya stayed home", "result"), group("Alasan", "because she felt sick.", "clause")),
      grouped("correct", "So diikuti hasil dari keadaan sebelumnya.", group("Alasan", "Maya felt sick,", "clause"), group("Hasil", "so she stayed home.", "result")),
      ex("incorrect", "Jangan gunakan because dan so sekaligus untuk pasangan alasan–hasil ini.", t("Because Maya felt sick, "), t("so", "error"), t(" she stayed home."))],
  },
  unless: {
    formula: [t("unless", "connector"), t(" ≈ "), t("if … not", "connector"), t(" (kecuali jika / jika tidak)")],
    examples: [grouped("compare", "Tidak belajar adalah syarat untuk hasil ini.", group("Syarat", "If you do not study,", "condition"), group("Hasil", "you will fail.", "result")),
      grouped("compare", "Unless sudah mengandung makna if not; hubungan maknanya sama.", group("Syarat", "Unless you study,", "condition"), group("Hasil", "you will fail.", "result"))],
  },
  whileUntil: {
    formula: [t("while", "connector"), t(" + kejadian bersamaan · "), t("until", "connector"), t(" + batas waktu")],
    examples: [grouped("compare", "While menunjukkan dua kegiatan yang berlangsung bersamaan.", group("Waktu", "While Maya was cooking,", "clause"), group("Kegiatan lain", "I was reading.", "result")),
      grouped("compare", "Until menunjukkan batas berakhirnya kegiatan menunggu.", group("Kegiatan utama", "We waited", "result"), group("Batas waktu", "until the rain stopped.", "clause"))],
  },
  time: {
    formula: [t("when / before / after", "connector"), t(" + klausa waktu, klausa utama")],
    examples: [grouped("compare", "Before: mencuci tangan terjadi lebih dulu daripada makan.", group("Kegiatan utama", "Maya washed her hands", "result"), group("Waktu: sebelum", "before she ate lunch.", "clause")),
      grouped("compare", "After: menelepon dilakukan setelah bekerja selesai.", group("Waktu: sesudah", "After Maya finished work,", "clause"), group("Kegiatan utama", "she called her mother.", "result")),
      grouped("correct", "When menunjukkan kapan kegiatan utama terjadi.", group("Waktu: ketika", "When the film started,", "clause"), group("Kegiatan utama", "we stopped talking.", "result"))],
  },
  order: {
    formula: [t("Anak kalimat", "clause"), t(", "), t("klausa utama", "result"), t(" / "), t("klausa utama", "result"), t(" + "), t("anak kalimat", "clause")],
    examples: [grouped("correct", "Anak kalimat di awal dipisahkan koma dari klausa utama.", group("Alasan", "Because Maya felt sick,", "clause"), group("Kejadian utama", "she stayed home.", "result")),
      grouped("correct", "Alasan boleh di akhir; maknanya tetap sama.", group("Kejadian utama", "Maya stayed home", "result"), group("Alasan", "because she felt sick.", "clause"))],
  },
} satisfies Record<string, GuideVisual>;

export const CONDITIONAL_GUIDE_VISUALS = {
  zero: {
    formula: [t("If + Present Simple", "condition"), t(", "), t("Present Simple", "result")],
    examples: [grouped("correct", "Kebiasaan: setiap kali merasa lelah, saya beristirahat.", group("Syarat", "If I feel tired,", "condition"), group("Hasil", "I take a break.", "result")),
      grouped("incorrect", "Dengan subjek it dalam Present Simple positif, gunakan melts.", group("Syarat", "If you heat ice,", "condition"), group("Hasil kurang tepat", "it melt.", "error"))],
  },
  first: {
    formula: [t("If + Present Simple", "condition"), t(", "), t("will + V1", "result")],
    examples: [grouped("correct", "Kemungkinan nyata di masa depan; klausa if memakai Present Simple.", group("Syarat", "If it rains tomorrow,", "condition"), group("Hasil", "I will stay home.", "result")),
      grouped("incorrect", "Untuk prediksi masa depan pada pola dasar ini, gunakan rains di klausa if.", group("Syarat kurang tepat", "If it will rain tomorrow,", "error"), group("Hasil", "I will stay home.", "result"))],
  },
  second: {
    formula: [t("If + Past Simple (V2 / were)", "condition"), t(", "), t("would + V1", "result")],
    examples: [grouped("correct", "Bayangan keadaan sekarang: saya belum punya cukup uang.", group("Syarat", "If I had enough money now,", "condition"), group("Hasil", "I would buy a house.", "result")),
      grouped("correct", "Were lazim dipakai untuk memberi saran lewat pengandaian.", group("Syarat", "If I were you,", "condition"), group("Hasil", "I would rest.", "result"))],
  },
  third: {
    formula: [t("If + had + V3", "condition"), t(", "), t("would have + V3", "result")],
    examples: [grouped("correct", "Membayangkan masa lalu yang berbeda: saya tidak belajar cukup keras dan tidak lulus.", group("Syarat lampau", "If I had studied harder,", "condition"), group("Hasil lampau", "I would have passed the exam.", "result")),
      grouped("incorrect", "Setelah would have, gunakan V3 passed, bukan V1 pass.", group("Syarat lampau", "If I had studied harder,", "condition"), group("Hasil kurang tepat", "I would have pass the exam.", "error"))],
  },
  mixed: {
    collapsible: true,
    formula: [t("If + had + V3 (lampau)", "condition"), t(", "), t("would + V1 (sekarang)", "result")],
    examples: [grouped("compare", "Third conditional: syarat dan hasil sama-sama tentang masa lalu.", group("Syarat lampau", "If I had slept well,", "condition"), group("Hasil lampau", "I would have felt better yesterday.", "result")),
      grouped("compare", "Mixed ini: sebab di masa lalu, akibat dirasakan sekarang.", group("Syarat lampau", "If I had slept well,", "condition"), group("Hasil sekarang", "I would not be tired now.", "result"))],
  },
  order: {
    formula: [t("If + syarat", "condition"), t(", "), t("hasil", "result"), t(" / "), t("hasil", "result"), t(" + "), t("if + syarat", "condition")],
    examples: [grouped("correct", "Syarat di awal memakai koma sebelum hasil.", group("Syarat", "If I have time tonight,", "condition"), group("Hasil", "I will study English.", "result")),
      grouped("correct", "Syarat di akhir biasanya tidak membutuhkan koma sebelumnya.", group("Hasil", "I will study English", "result"), group("Syarat", "if I have time tonight.", "condition"))],
  },
} satisfies Record<string, GuideVisual>;

export const NOUN_CLAUSE_GUIDE_VISUALS = {
  functions: {
    formula: [t("Noun clause", "clause"), t(" sebagai subjek / objek / pelengkap")],
    examples: [ex("compare", "Seluruh klausa That she passed menjadi subjek is.", t("That she passed", "clause"), t(" is good news.")),
      ex("compare", "Seluruh klausa setelah know menjadi objeknya.", t("I know "), t("that she is busy", "clause"), t(".")),
      ex("compare", "Klausa setelah is menjelaskan persoalan yang dimaksud.", t("The problem is "), t("that we have no time", "clause"), t("."))],
  },
  that: {
    formula: [t("Verb + "), t("that", "connector"), t(" + "), t("subjek", "subject"), t(" + verb")],
    examples: [ex("correct", "That memperkenalkan isi yang diketahui.", t("I know "), t("that", "connector"), t(" "), t("she", "subject"), t(" is busy.")),
      ex("correct", "That sering boleh dihilangkan dalam klausa objek setelah know.", t("I know "), t("she is busy", "clause"), t("."))],
  },
  indirect: {
    formula: [t("Klausa utama + "), t("WH", "connector"), t(" + "), t("subjek", "subject"), t(" + "), t("verb", "verb")],
    examples: [ex("correct", "Setelah where gunakan urutan she lives, bukan inversi.", t("I don’t know "), t("where", "connector"), t(" "), t("she", "subject"), t(" "), t("lives", "verb"), t(".")),
      ex("incorrect", "Does she live adalah urutan pertanyaan langsung.", t("I don’t know where "), t("does she live", "error"), t("."))],
  },
  whether: {
    formula: [t("whether / if", "connector"), t(" + subjek + verb (apakah)")],
    examples: [ex("correct", "Whether memperkenalkan ketidakpastian buka atau tutup.", t("I don’t know "), t("whether", "connector"), t(" the shop is open or closed.")),
      ex("correct", "If juga dapat memperkenalkan pertanyaan yes/no tidak langsung pada kalimat ini.", t("I don’t know "), t("if", "connector"), t(" the shop is open."))],
  },
  what: {
    formula: [t("what", "connector"), t(" + klausa = hal yang …")],
    examples: [ex("correct", "What you mean menyebut hal yang kamu maksud.", t("I understand "), t("what you mean", "clause"), t(".")),
      ex("incorrect", "Dalam pola ini, gunakan what you mean, bukan that you mean.", t("I understand "), t("that you mean", "error"), t("."))],
  },
} satisfies Record<string, GuideVisual>;
