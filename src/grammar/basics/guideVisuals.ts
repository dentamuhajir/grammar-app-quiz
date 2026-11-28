export type GuideToken = { text: string; kind?: "preposition" | "gerund" | "infinitive" | "continuous" | "error" | "subject" | "verb" | "object" | "adverb" | "wh" | "clause" | "connector" | "condition" | "result" | "determiner" | "noun" | "adjective" | "chunk" };
export interface GuideExample {
  status: "correct" | "incorrect" | "compare";
  tokens: GuideToken[];
  groups?: { label: string; tokens: GuideToken[] }[];
  note: string;
  context?: string;
}
export interface GuideVisual {
  formula: GuideToken[];
  formulaLabel?: string;
  examples: GuideExample[];
  collapsible?: boolean;
}
export const token = (text: string, kind?: GuideToken["kind"]): GuideToken => ({ text, kind });
export const example = (status: "correct" | "incorrect" | "compare", note: string, ...tokens: GuideToken[]) => ({ status, tokens, note });
export const groupedExample = (status: GuideExample["status"], note: string, ...groups: NonNullable<GuideExample["groups"]>): GuideExample => ({ status, note, tokens: [], groups });

export const GERUND_GUIDE_VISUALS: Record<string, GuideVisual> = {
  subject: {
    formula: [token("V-ing", "gerund"), token(" + verb + pelengkap")],
    examples: [example("correct", "Kegiatan berenang menjadi subjek.", token("Swimming", "gerund"), token(" is healthy.")),
      example("incorrect", "V1 saja tidak mengisi posisi nama kegiatan pada pola ini.", token("Swim", "error"), token(" is healthy."))],
  },
  continuous: {
    formula: [token("Gerund: "), token("V-ing", "gerund"), token(" sebagai kegiatan · Continuous: "), token("be + V-ing", "continuous")],
    examples: [example("compare", "Gerund: kegiatan berenang menjadi subjek.", token("Swimming", "gerund"), token(" is healthy.")),
      example("compare", "Continuous: tindakan sedang berlangsung.", token("She "), token("is swimming", "continuous"), token(" now."))],
  },
  preposition: {
    formula: [token("Preposition", "preposition"), token(" + "), token("V-ing", "gerund")],
    examples: [example("correct", "Improving menyebut kegiatan setelah for.", token("This tool is useful "), token("for", "preposition"), token(" "), token("improving", "gerund"), token(" customer engagement.")),
      example("incorrect", "Setelah preposisi for, gunakan improving.", token("This tool is useful "), token("for", "preposition"), token(" "), token("improve", "error"), token(" customer engagement."))],
  },
  twoTo: {
    formula: [token("Infinitive: "), token("to + V1", "infinitive"), token(" · Preposisi: "), token("to", "preposition"), token(" + "), token("V-ing", "gerund")],
    examples: [example("correct", "To menandai infinitive setelah want.", token("I want "), token("to learn", "infinitive"), token(" English.")),
      example("correct", "To adalah preposisi dalam look forward to.", token("I look forward "), token("to", "preposition"), token(" "), token("meeting", "gerund"), token(" you.")),
      example("incorrect", "Gunakan meeting setelah look forward to.", token("I look forward "), token("to", "preposition"), token(" "), token("meet", "error"), token(" you."))],
  },
  verbGerund: {
    formula: [token("enjoy / finish / avoid / mind / keep / suggest + "), token("V-ing", "gerund")],
    examples: [example("correct", "Enjoy diikuti gerund untuk kegiatan.", token("I enjoy "), token("reading", "gerund"), token(" books.")),
      example("incorrect", "Pola enjoy + to-infinitive tidak tepat.", token("I enjoy "), token("to read", "error"), token(" books."))],
  },
  verbInfinitive: {
    formula: [token("want / decide / plan / hope / promise / agree / need + "), token("to + V1", "infinitive")],
    examples: [example("correct", "Decide memakai to + V1 pada pola ini.", token("They decided "), token("to move", "infinitive"), token(" next month.")),
      example("incorrect", "Gunakan to move setelah decided.", token("They decided "), token("moving", "error"), token(" next month."))],
  },
  person: {
    formula: [token("Verb + orang (me/him/her/us/them) + "), token("to + V1", "infinitive")],
    examples: [example("correct", "Me adalah orang yang diminta menunggu.", token("She asked me "), token("to wait", "infinitive"), token(".")),
      example("incorrect", "Gunakan bentuk objek me setelah asked.", token("She asked "), token("I", "error"), token(" to wait."))],
  },
  purpose: {
    formula: [token("Tindakan + "), token("to + V1", "infinitive"), token(" (untuk tujuan)")],
    examples: [example("correct", "Tujuan menelepon adalah mengonfirmasi rapat.", token("I called her "), token("to confirm", "infinitive"), token(" the meeting.")),
      example("incorrect", "Gunakan to confirm untuk tujuan tindakan ini.", token("I called her "), token("for confirm", "error"), token(" the meeting."))],
  },
  responsibility: {
    formula: [token("Tugas / sasaran + be + "), token("to + V1", "infinitive")],
    examples: [example("correct", "To ensure menjelaskan isi tanggung jawab.", token("My responsibility was "), token("to ensure", "infinitive"), token(" the data was accurate."))],
  },
  adjective: {
    formula: [token("Adjective tertentu + "), token("to + V1", "infinitive")],
    examples: [example("correct", "To check melengkapi penilaian important.", token("It is important "), token("to check", "infinitive"), token(" the data.")),
      example("correct", "Interested memakai preposisi in, lalu gerund.", token("I am interested "), token("in", "preposition"), token(" "), token("learning", "gerund"), token(" English."))],
  },
  both: {
    formula: [token("like / love / hate / prefer + "), token("V-ing", "gerund"), token(" atau "), token("to + V1", "infinitive")],
    examples: [example("correct", "Menyoroti kegiatan atau pengalaman membaca.", token("I like "), token("reading", "gerund"), token(".")),
      example("correct", "Juga benar; dapat menyoroti pilihan atau kebiasaan.", token("I like "), token("to read", "infinitive"), token("."))],
  },
  stop: {
    collapsible: true,
    formula: [token("stop + "), token("V-ing", "gerund"), token(" ≠ stop + "), token("to + V1", "infinitive")],
    examples: [example("compare", "Kegiatan mengobrol berakhir.", token("We stopped "), token("talking", "gerund"), token(".")),
      example("compare", "Menjeda kegiatan lain untuk mengobrol.", token("We stopped "), token("to talk", "infinitive"), token("."))],
  },
  remember: {
    collapsible: true,
    formula: [token("remember + "), token("V-ing", "gerund"), token(" ≠ remember + "), token("to + V1", "infinitive")],
    examples: [example("compare", "Ingat tindakan mengunci yang sudah terjadi.", token("I remember "), token("locking", "gerund"), token(" the door.")),
      example("compare", "Pengingat untuk melakukan tugas mengunci.", token("Remember "), token("to lock", "infinitive"), token(" the door."))],
  },
  try: {
    collapsible: true,
    formula: [token("try + "), token("V-ing", "gerund"), token(" ≠ try + "), token("to + V1", "infinitive")],
    examples: [example("compare", "Mencoba memulai ulang sebagai solusi.", token("Try "), token("restarting", "gerund"), token(" the app.")),
      example("compare", "Berusaha memulai ulang, belum tentu berhasil.", token("Try "), token("to restart", "infinitive"), token(" the app."))],
  },
};
