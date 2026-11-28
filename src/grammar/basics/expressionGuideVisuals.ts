import { example as ex, groupedExample as grouped, token as t, type GuideExample, type GuideToken, type GuideVisual } from "./guideVisuals";

const contextual = (status: GuideExample["status"], context: string, note: string, ...tokens: GuideToken[]): GuideExample => ({ ...ex(status, note, ...tokens), context });

export const COLLOCATION_GUIDE_VISUALS = {
  make: {
    formulaLabel: "Pelajari pasangan katanya",
    formula: [t("make a decision · make progress · make a mistake", "chunk")],
    examples: [ex("correct", "Decision lazim dipasangkan dengan make.", t("We need to "), t("make a decision", "chunk"), t(".")),
      ex("incorrect", "Untuk ungkapan mengambil keputusan, gunakan make a decision.", t("We need to "), t("do a decision", "error"), t(".")),
      ex("correct", "Progress uncountable dalam makna kemajuan; ungkapannya make progress.", t("You are "), t("making progress", "chunk"), t("."))],
  },
  do: {
    formulaLabel: "Pelajari pasangan katanya",
    formula: [t("do homework · do an assignment · do someone a favor", "chunk")],
    examples: [ex("correct", "Homework lazim memakai do, bukan make.", t("I need to "), t("do my homework", "chunk"), t(".")),
      ex("incorrect", "Gunakan do my homework untuk kegiatan mengerjakan PR.", t("I need to "), t("make my homework", "error"), t(".")),
      ex("correct", "Do me a favor adalah ungkapan meminta bantuan.", t("Could you "), t("do me a favor", "chunk"), t("?"))],
  },
  take: {
    formulaLabel: "Pelajari sebagai satu frasa",
    formula: [t("take a break · take notes · take responsibility", "chunk")],
    examples: [contextual("correct", "Mengusulkan jeda dari pekerjaan.", "Take a break berarti beristirahat sejenak.", t("Let’s "), t("take a break", "chunk"), t(".")),
      contextual("correct", "Mencatat poin penting dalam rapat.", "Take notes berarti membuat catatan.", t("Please "), t("take notes", "chunk"), t(" during the meeting.")),
      ex("correct", "Take responsibility menyatakan menerima tanggung jawab.", t("We must "), t("take responsibility", "chunk"), t(" for the result."))],
  },
  other: {
    formulaLabel: "Pasangan kata yang lazim",
    formula: [t("give feedback · pay attention · meet a deadline · keep a promise", "chunk")],
    examples: [ex("correct", "Meet a deadline berarti memenuhi tenggat waktu.", t("We need to "), t("meet the deadline", "chunk"), t(".")),
      ex("correct", "Pay attention berarti memperhatikan, bukan membayar uang.", t("Please "), t("pay attention", "chunk"), t(" to the instructions.")),
      ex("incorrect", "Gunakan give feedback dalam makna memberikan masukan.", t("Please "), t("say feedback", "error"), t(" on my draft."))],
  },
  responses: {
    formulaLabel: "Gunakan sesuai situasi",
    formula: [t("It depends on + faktor · Would you mind + V-ing?", "chunk")],
    examples: [contextual("correct", "Ditanya apakah acara dapat diadakan di luar ruangan.", "It depends on menyebut faktor penentu keputusan.", t("It "), t("depends on the weather", "chunk"), t(".")),
      contextual("correct", "Meminta seseorang menutup pintu dengan sopan.", "Setelah mind, kegiatan memakai bentuk -ing.", t("Would you mind "), t("closing", "gerund"), t(" the door?")),
      ex("incorrect", "Gunakan closing setelah mind pada pola permintaan ini.", t("Would you mind "), t("to close", "error"), t(" the door?"))],
  },
  get: {
    formulaLabel: "Konteks menentukan makna get",
    formula: [t("get tired · get home · get it · get a ticket", "chunk")],
    examples: [contextual("compare", "Setelah bekerja lama, mulai merasa lelah.", "Get tired berarti menjadi lelah.", t("I "), t("get tired", "chunk"), t(" after long meetings.")),
      contextual("compare", "Menjelaskan kapan sampai di rumah.", "Get home berarti tiba di rumah.", t("I usually "), t("get home", "chunk"), t(" at six.")),
      contextual("compare", "Setelah mendengar penjelasan, sekarang paham.", "Get it berarti memahami.", t("I "), t("get it", "chunk"), t(" now."))],
  },
  everyday: {
    formulaLabel: "Baca seluruh frasanya",
    formula: [t("have a chat · take a look · go for a walk", "chunk")],
    examples: [contextual("compare", "Mengajak mengobrol sebentar.", "Have a chat menyebut kegiatan mengobrol.", t("Let’s "), t("have a chat", "chunk"), t(".")),
      contextual("compare", "Meminta seseorang melihat masalah sebentar.", "Take a look berarti melihat atau memeriksa.", t("Could you "), t("take a look", "chunk"), t(" at this?")),
      contextual("compare", "Mengajak berjalan-jalan.", "Go for a walk adalah satu ungkapan kegiatan.", t("Let’s "), t("go for a walk", "chunk"), t("."))],
  },
} satisfies Record<string, GuideVisual>;

export const PHRASAL_GUIDE_VISUALS = {
  figureFind: {
    formula: [t("figure out + benda / figure + benda + out · figure + pronoun + out", "chunk")],
    examples: [ex("correct", "Kata benda the answer dapat berada setelah figure out.", t("I "), t("figured out the answer", "chunk"), t(".")),
      ex("correct", "Pronoun it harus berada di tengah pada ungkapan ini.", t("I "), t("figured it out", "chunk"), t(".")),
      ex("incorrect", "Gunakan figured it out, bukan figured out it.", t("I "), t("figured out it", "error"), t(".")),
      contextual("correct", "Mendapat informasi jam keberangkatan kereta.", "Find out berfokus pada memperoleh informasi.", t("I "), t("found out", "chunk"), t(" when the train leaves."))],
  },
  runOut: {
    formula: [t("run out of + benda / pronoun", "chunk")],
    examples: [contextual("correct", "Persediaan susu sudah habis.", "Seluruh frasa run out of mendahului bendanya.", t("We "), t("ran out of", "chunk"), t(" "), t("milk", "noun"), t(".")),
      ex("correct", "Pronoun tetap berada setelah of.", t("We "), t("ran out of", "chunk"), t(" "), t("it", "object"), t(".")),
      ex("incorrect", "Ungkapan ini tidak dipisah seperti figure it out.", t("We "), t("ran milk out of", "error"), t("."))],
  },
  goAhead: {
    formulaLabel: "Respons untuk memberi izin",
    formula: [t("Go ahead. / Go ahead and + V1.", "chunk")],
    examples: [grouped("correct", "Go ahead dalam percakapan ini berarti silakan.", { label: "Meminta izin", tokens: [t("May I start?")] }, { label: "Memberi izin", tokens: [t("Go ahead.", "chunk")] }),
      ex("correct", "Sesudah go ahead and, gunakan V1 start.", t("Go ahead and "), t("start", "chunk"), t("."))],
  },
  intoUpTo: {
    formulaLabel: "Makna mengikuti seluruh ungkapan",
    formula: [t("be into + minat · be up to + kegiatan · be up to + penentu keputusan", "chunk")],
    examples: [contextual("compare", "Membicarakan minat musik.", "Be into berarti menyukai atau berminat pada sesuatu.", t("I’m "), t("into jazz", "chunk"), t(".")),
      contextual("compare", "Menanyakan kegiatan teman akhir pekan ini.", "Be up to di sini menanyakan apa yang dilakukan.", t("What are you "), t("up to", "chunk"), t(" this weekend?")),
      contextual("compare", "Menyerahkan keputusan kepada lawan bicara.", "It’s up to you berarti kamu yang menentukan.", t("It’s "), t("up to you", "chunk"), t("."))],
  },
  aboutTo: {
    formula: [t("be about to + V1", "chunk"), t(" (akan segera)")],
    examples: [contextual("correct", "Kereta siap berangkat dalam waktu sangat dekat.", "Is about to leave menunjukkan tindakan belum dimulai tetapi segera terjadi.", t("The train "), t("is about to leave", "chunk"), t(".")),
      ex("incorrect", "Setelah be about to, gunakan V1 leave.", t("The train is about to "), t("leaving", "error"), t("."))],
  },
} satisfies Record<string, GuideVisual>;

export const CAUSATIVE_GUIDE_VISUALS = {
  havePerson: {
    formula: [t("have", "verb"), t(" + "), t("orang", "object"), t(" + "), t("V1", "verb")],
    examples: [ex("correct", "IT adalah pelaksana; check tetap V1 setelahnya.", t("I’ll "), t("have", "verb"), t(" "), t("IT", "object"), t(" "), t("check", "verb"), t(" the laptop.")),
      ex("incorrect", "Pola have + orang ini memakai check tanpa to.", t("I’ll have IT "), t("to check", "error"), t(" the laptop."))],
  },
  getPerson: {
    formula: [t("get", "verb"), t(" + "), t("orang", "object"), t(" + "), t("to + V1", "infinitive")],
    examples: [ex("correct", "Get + orang diikuti to-infinitive.", t("I’ll "), t("get", "verb"), t(" "), t("IT", "object"), t(" "), t("to check", "infinitive"), t(" the laptop.")),
      ex("incorrect", "Gunakan to check setelah get IT pada pola ini.", t("I’ll get IT "), t("check", "error"), t(" the laptop."))],
  },
  object: {
    formula: [t("have / get", "verb"), t(" + "), t("benda yang dikerjakan", "object"), t(" + "), t("V3", "verb")],
    examples: [contextual("compare", "Saya meminta bengkel memperbaiki sepeda.", "Benda menerima tindakan; repaired adalah V3.", t("I had "), t("my bike", "object"), t(" "), t("repaired", "verb"), t(".")),
      contextual("compare", "Saya sendiri yang melakukan perbaikan.", "Kalimat ini tidak menyatakan pekerjaan oleh orang lain.", t("I "), t("repaired", "verb"), t(" my bike.")),
      ex("incorrect", "Untuk pola pekerjaan pada benda, gunakan repaired, bukan repair.", t("I had my bike "), t("repair", "error"), t("."))],
  },
  makeLetHelp: {
    collapsible: true,
    formula: [t("make / let + orang + V1 · help + orang + (to) V1", "verb")],
    examples: [ex("compare", "Make menyatakan menyebabkan atau memaksa seseorang melakukan tindakan.", t("They "), t("made me wait", "verb"), t(".")),
      ex("compare", "Let menyatakan izin untuk melakukan tindakan.", t("They "), t("let me leave", "verb"), t(".")),
      ex("correct", "Help menerima V1 tanpa to; help me to carry juga benar.", t("Please "), t("help me carry", "verb"), t(" this box.")),
      ex("incorrect", "Dalam kalimat aktif ini, make + orang memakai V1 tanpa to.", t("They made me "), t("to wait", "error"), t("."))],
  },
} satisfies Record<string, GuideVisual>;
