import type { ClauseCues, Mode, Question, SentenceForm, Tense } from "./types";
import { FORM_LABELS, MODE_LABELS, TENSE_LABELS } from "./labels";

export type StructureFocus = "sentenceStructure" | "thereIt" | "reasonClause" | "relativeClause";
export const STRUCTURE_LABELS: Record<StructureFocus, string> = {
  sentenceStructure: "Struktur & Urutan Kalimat", thereIt: "There & It",
  reasonClause: "Penghubung antarklausa", relativeClause: "Relative clause",
};
export const STRUCTURE_PATTERNS = {
  sentenceStructure: [
    { value: "sv", label: "Subjek + verb" },
    { value: "svc", label: "Subjek + be + pelengkap" },
    { value: "svo", label: "Subjek + verb + objek" },
    { value: "svoo", label: "Dua objek" },
    { value: "svoc", label: "Objek + pelengkap" },
    { value: "timePosition", label: "Posisi keterangan waktu" },
    { value: "adverbOrder", label: "Cara · tempat · waktu" },
    { value: "timeClause", label: "Klausa waktu" },
  ],
  thereIt: [
    { value: "existence", label: "There: keberadaan" },
    { value: "weather", label: "It: cuaca" },
    { value: "clockTime", label: "It: waktu" },
    { value: "evaluation", label: "It: penilaian kegiatan" },
  ],
  reasonClause: [
    { value: "because", label: "because · alasan" },
    { value: "when", label: "when · waktu" },
    { value: "before", label: "before · sebelum" },
    { value: "after", label: "after · sesudah" },
    { value: "although", label: "although · pertentangan" },
  ],
  relativeClause: [
    { value: "definingSubject", label: "Defining · pronoun sebagai subjek" },
    { value: "definingObject", label: "Defining · pronoun sebagai objek / boleh dihilangkan" },
  ],
} as const;
export type StructurePattern = typeof STRUCTURE_PATTERNS[StructureFocus][number]["value"];
export const STRUCTURE_TENSES: Tense[] = ["presentSimple", "pastSimple"];
export const STRUCTURE_MODES: Mode[] = ["verbal", "nominal"];
export const STRUCTURE_FORMS: SentenceForm[] = ["positive", "negative", "yesNoQuestion"];
export function usesStructureBank(focus?: string, pattern?: string): boolean {
  return focus === "sentenceStructure" || focus === "thereIt"
    || (focus === "reasonClause" || focus === "relativeClause")
      && STRUCTURE_PATTERNS[focus].some(item => item.value === pattern);
}
type Part = { text: string; role: string; alternatives?: string[] };
type Item = {
  focus: StructureFocus; pattern: StructurePattern; tense: Tense; mode: Mode; form: SentenceForm;
  answer: string; alternatives?: string[]; instruction: string;
  rows: { label: string; cues: ClauseCues }[]; parts: Part[]; explanation: string;
};
const parts = (...entries: [string, string, string[]?][]): Part[] => entries.map(([text, role, alternatives]) => ({ text, role, alternatives }));
const row = (cues: ClauseCues) => [{ label: "Bahan kalimat", cues }];

export const STRUCTURE_ITEMS: Item[] = [
  { focus: "sentenceStructure", pattern: "sv", tense: "presentSimple", mode: "verbal", form: "positive",
    answer: "The baby sleeps.", instruction: "Nyatakan kebiasaan bayi. Kalimat ini tidak memerlukan objek.", rows: row({ subject: "the baby", verb: "sleep" }),
    parts: parts(["The baby", "Subjek"], ["sleeps", "Verb"]), explanation: "Sleep tidak memerlukan objek. Subjek tunggal the baby memakai sleeps dalam Present Simple positif." },
  { focus: "sentenceStructure", pattern: "sv", tense: "pastSimple", mode: "verbal", form: "positive",
    answer: "The children laughed.", instruction: "Nyatakan kejadian lampau. Kalimat ini tidak memerlukan objek.", rows: row({ subject: "the children", verb: "laugh" }),
    parts: parts(["The children", "Subjek"], ["laughed", "Verb"]), explanation: "Laugh dapat berdiri tanpa objek. Dalam Past Simple positif, gunakan laughed." },
  { focus: "sentenceStructure", pattern: "svc", tense: "presentSimple", mode: "nominal", form: "positive",
    answer: "Maya is a teacher.", instruction: "Sampaikan pekerjaan Maya sekarang.", rows: row({ subject: "Maya", verb: "be", complement: "a teacher" }),
    parts: parts(["Maya", "Subjek"], ["is", "Be"], ["a teacher", "Pelengkap subjek"]), explanation: "A teacher menjelaskan identitas Maya, sehingga merupakan pelengkap subjek. Gunakan is untuk Maya." },
  { focus: "sentenceStructure", pattern: "svc", tense: "pastSimple", mode: "nominal", form: "positive",
    answer: "They were tired.", instruction: "Nyatakan keadaan mereka pada masa lalu.", rows: row({ subject: "they", verb: "be", complement: "tired" }),
    parts: parts(["They", "Subjek"], ["were", "Be"], ["tired", "Pelengkap subjek"]), explanation: "Tired menerangkan keadaan subjek. They memakai were dalam Past Simple." },
  { focus: "sentenceStructure", pattern: "svo", tense: "presentSimple", mode: "verbal", form: "positive",
    answer: "Maya reads some books.", instruction: "Nyatakan kebiasaan Maya dengan bahan yang tersedia.", rows: row({ subject: "Maya", verb: "read", complement: "some books" }),
    parts: parts(["Maya", "Subjek"], ["reads", "Verb"], ["some books", "Objek"]), explanation: "Some books adalah satu frasa objek. Maya memakai reads dalam Present Simple positif." },
  { focus: "sentenceStructure", pattern: "svo", tense: "pastSimple", mode: "verbal", form: "positive",
    answer: "They watched a film.", instruction: "Nyatakan kegiatan yang sudah terjadi.", rows: row({ subject: "they", verb: "watch", complement: "a film" }),
    parts: parts(["They", "Subjek"], ["watched", "Verb"], ["a film", "Objek"]), explanation: "A film menjadi objek watched. Past Simple positif memakai watched." },
  { focus: "sentenceStructure", pattern: "svoo", tense: "presentSimple", mode: "verbal", form: "positive",
    answer: "Maya gives her brother some books.", alternatives: ["Maya gives some books to her brother."], instruction: "Sampaikan kebiasaan Maya memberi buku kepada adiknya. Boleh gunakan pola dua objek atau to + penerima.", rows: row({ subject: "Maya", verb: "give", recipient: "her brother", complement: "some books" }),
    parts: parts(["Maya", "Subjek"], ["gives", "Verb"], ["her brother", "Penerima"], ["some books", "Objek langsung"]), explanation: "Give dapat diikuti penerima lalu benda: gives her brother some books. Alternatifnya gives some books to her brother." },
  { focus: "sentenceStructure", pattern: "svoo", tense: "pastSimple", mode: "verbal", form: "positive",
    answer: "They sent Maya a letter.", alternatives: ["They sent a letter to Maya."], instruction: "Sampaikan bahwa mereka mengirim surat kepada Maya. Boleh gunakan to + penerima.", rows: row({ subject: "they", verb: "send", recipient: "Maya", complement: "a letter" }),
    parts: parts(["They", "Subjek"], ["sent", "Verb"], ["Maya", "Penerima"], ["a letter", "Objek langsung"]), explanation: "Sent Maya a letter dan sent a letter to Maya menyatakan penerima dan benda yang sama." },
  { focus: "sentenceStructure", pattern: "svoc", tense: "presentSimple", mode: "verbal", form: "positive",
    answer: "The news makes Maya happy.", instruction: "Sampaikan pengaruh berita itu terhadap Maya.", rows: row({ subject: "the news", verb: "make", complement: "Maya", objectComplement: "happy" }),
    parts: parts(["The news", "Subjek"], ["makes", "Verb"], ["Maya", "Objek"], ["happy", "Pelengkap objek"]), explanation: "Happy menjelaskan keadaan objek Maya setelah menerima pengaruh berita. The news memakai makes." },
  { focus: "sentenceStructure", pattern: "svoc", tense: "pastSimple", mode: "verbal", form: "positive",
    answer: "They painted the door blue.", instruction: "Sampaikan warna pintu setelah dicat.", rows: row({ subject: "they", verb: "paint", complement: "the door", objectComplement: "blue" }),
    parts: parts(["They", "Subjek"], ["painted", "Verb"], ["the door", "Objek"], ["blue", "Pelengkap objek"]), explanation: "Blue menjelaskan hasil pada objek the door. Polanya subjek + verb + objek + pelengkap objek." },
  { focus: "sentenceStructure", pattern: "timePosition", tense: "presentSimple", mode: "verbal", form: "positive",
    answer: "Maya reads some books every evening.", alternatives: ["Every evening, Maya reads some books."], instruction: "Nyatakan kebiasaan Maya. Keterangan waktu boleh di awal atau akhir.", rows: row({ subject: "Maya", verb: "read", complement: "some books", time: "every evening" }),
    parts: parts(["Maya", "Subjek"], ["reads", "Verb"], ["some books", "Objek"], ["every evening", "Keterangan waktu"]), explanation: "Every evening dapat berada di awal atau akhir. Keterangan pendek di awal tidak selalu memerlukan koma." },
  { focus: "sentenceStructure", pattern: "timePosition", tense: "pastSimple", mode: "verbal", form: "positive",
    answer: "They visited the museum yesterday.", alternatives: ["Yesterday, they visited the museum."], instruction: "Nyatakan kunjungan kemarin. Keterangan waktu boleh di awal atau akhir.", rows: row({ subject: "they", verb: "visit", complement: "the museum", time: "yesterday" }),
    parts: parts(["They", "Subjek"], ["visited", "Verb"], ["the museum", "Objek"], ["yesterday", "Keterangan waktu"]), explanation: "Yesterday memberi konteks waktu dan boleh berada di awal atau akhir kalimat." },
  { focus: "sentenceStructure", pattern: "adverbOrder", tense: "presentSimple", mode: "verbal", form: "positive",
    answer: "Maya works quietly at home every morning.", instruction: "Letakkan semua keterangan di akhir dengan urutan umum: cara, tempat, lalu waktu.", rows: row({ subject: "Maya", verb: "work", manner: "quietly", place: "at home", time: "every morning" }),
    parts: parts(["Maya", "Subjek"], ["works", "Verb"], ["quietly", "Keterangan cara"], ["at home", "Keterangan tempat"], ["every morning", "Keterangan waktu"]), explanation: "Untuk target soal ini, gunakan quietly (cara), at home (tempat), every morning (waktu). Ini urutan umum, bukan satu-satunya urutan dalam semua konteks." },
  { focus: "sentenceStructure", pattern: "adverbOrder", tense: "pastSimple", mode: "verbal", form: "positive",
    answer: "They practised carefully at school yesterday.", alternatives: ["They practiced carefully at school yesterday."], instruction: "Letakkan semua keterangan di akhir: cara, tempat, lalu waktu.", rows: row({ subject: "they", verb: "practise / practice", manner: "carefully", place: "at school", time: "yesterday" }),
    parts: parts(["They", "Subjek"], ["practised", "Verb", ["practiced"]], ["carefully", "Keterangan cara"], ["at school", "Keterangan tempat"], ["yesterday", "Keterangan waktu"]), explanation: "Carefully menjelaskan cara, at school tempat, dan yesterday waktu. Ejaan practised dan practiced diterima." },
  { focus: "sentenceStructure", pattern: "timeClause", tense: "pastSimple", mode: "verbal", form: "positive",
    answer: "When the film started, we stopped talking.", alternatives: ["We stopped talking when the film started."], instruction: "Hubungkan kedua klausa dengan when. Kedua urutan klausa diterima; gunakan koma jika klausa waktu di awal.", rows: [
      { label: "Waktu", cues: { wh: "when", subject: "the film", verb: "start" } },
      { label: "Kejadian utama", cues: { subject: "we", verb: "stop", complement: "talking" } },
    ], parts: parts(["When the film started", "Klausa waktu"], ["we", "Subjek"], ["stopped", "Verb"], ["talking", "Gerund: kegiatan yang dihentikan"]), explanation: "Kedua klausa memakai Past Simple. Stop + -ing berarti berhenti melakukan kegiatan tersebut. Klausa when boleh di awal atau akhir; di awal, pisahkan dengan koma." },
];

for (const tense of STRUCTURE_TENSES) {
  const past = tense === "pastSimple";
  for (const [pattern, label, main, subordinate, mainCues, subCues] of [
    ["because", "Alasan", past ? "Maya stayed home" : "Maya stays home", past ? "she felt sick" : "she feels sick", { subject: "Maya", verb: "stay", complement: "home" }, { subject: "she", verb: "feel", complement: "sick" }],
    ["when", "Waktu", past ? "we stopped talking" : "we stop talking", past ? "the film started" : "the film starts", { subject: "we", verb: "stop", complement: "talking" }, { subject: "the film", verb: "start" }],
    ["before", "Waktu: sebelum", past ? "Maya washed her hands" : "Maya washes her hands", past ? "she ate lunch" : "she eats lunch", { subject: "Maya", verb: "wash", complement: "her hands" }, { subject: "she", verb: "eat", complement: "lunch" }],
    ["after", "Waktu: sesudah", past ? "Maya called her mother" : "Maya calls her mother", past ? "she finished work" : "she finishes work", { subject: "Maya", verb: "call", complement: "her mother" }, { subject: "she", verb: "finish", complement: "work" }],
    ["although", "Pertentangan", past ? "Maya went out" : "Maya goes out", past ? "it rained" : "it rains", { subject: "Maya", verb: "go", complement: "out" }, { subject: "it", verb: "rain" }],
  ] as const) {
    const capitalizedMain = main[0].toUpperCase() + main.slice(1);
    const connector = pattern[0].toUpperCase() + pattern.slice(1);
    const fronted = `${connector} ${subordinate}, ${main}.`;
    // Repeated Maya avoids an unclear she before her antecedent in the fronted order.
    const alternative = subordinate.startsWith("she ") ? fronted.replace(/she /, "Maya ").replace(/, Maya /, ", she ") : undefined;
    STRUCTURE_ITEMS.push({ focus: "reasonClause", pattern, tense, mode: "verbal", form: "positive",
      answer: `${capitalizedMain} ${pattern} ${subordinate}.`, alternatives: [fronted, ...(alternative ? [alternative] : [])],
      instruction: `Hubungkan kedua klausa dengan ${pattern}. Kedua urutan diterima. Pisahkan dengan koma jika klausa ${pattern} di awal.`,
      rows: [{ label: "Kejadian utama", cues: mainCues }, { label, cues: { wh: pattern, ...subCues } }],
      parts: [{ text: capitalizedMain, role: "Klausa utama", alternatives: [main.replace(/^Maya /, "she ")] },
        { text: `${pattern} ${subordinate}`, role: label, alternatives: [`${pattern} ${subordinate.replace(/^she /, "Maya ")}`] }],
      explanation: `${pattern} menyatakan ${pattern === "because" ? "alasan" : pattern === "although" ? "pertentangan; jangan tambahkan but" : "hubungan waktu"}. Kedua klausa memakai ${TENSE_LABELS[tense]}. Klausa penghubung dapat berada di awal atau akhir.`,
    });
  }
  const be = past ? "was" : "is";
  const bought = past ? "bought" : "buy";
  STRUCTURE_ITEMS.push({ focus: "relativeClause", pattern: "definingObject", tense, mode: "nominal", form: "positive",
    answer: `The book that I ${bought} ${be} expensive.`, alternatives: [`The book which I ${bought} ${be} expensive.`, `The book I ${bought} ${be} expensive.`],
    instruction: "Gabungkan menjadi satu kalimat dengan defining relative clause tentang the book. That/which boleh digunakan atau dihilangkan karena menjadi objek. Jangan gunakan koma.",
    rows: [{ label: "Kalimat utama", cues: { subject: "the book", verb: "be", complement: "expensive" } },
      { label: "Penjelas buku", cues: { subject: "I", verb: "buy", complement: "the book" } }],
    parts: [{ text: "that", role: "Relative pronoun: objek", alternatives: ["which"] }, ...parts(["The book", "Subjek utama"], ["I", "Subjek klausa relatif"], [bought, "Verb klausa relatif"], [be, "Be utama"], ["expensive", "Pelengkap subjek"])],
    explanation: "Dalam the book (that/which) I buy/bought, pronoun menggantikan objek buy/bought. Pada defining relative clause, pronoun objek boleh dihilangkan. I tetap subjek klausa relatif. Jangan hilangkan pronoun subjek atau pronoun dalam sisipan non-defining berkoma.",
  });
  STRUCTURE_ITEMS.push({ focus: "relativeClause", pattern: "definingSubject", tense, mode: "verbal", form: "positive",
    answer: `The woman who ${past ? "called" : "calls"} me ${past ? "lived" : "lives"} next door.`,
    alternatives: [`The woman that ${past ? "called" : "calls"} me ${past ? "lived" : "lives"} next door.`],
    instruction: "Gabungkan menjadi satu kalimat dengan defining relative clause tentang the woman. Gunakan who atau that sebagai subjek klausa penjelas; jangan dihilangkan dan jangan gunakan koma.",
    rows: [{ label: "Kalimat utama", cues: { subject: "the woman", verb: "live", place: "next door" } },
      { label: "Penjelas wanita", cues: { subject: "the woman", verb: "call", complement: "me" } }],
    parts: [{ text: "who", role: "Relative pronoun: subjek", alternatives: ["that"] }, ...parts(["The woman", "Subjek utama"], [past ? "called" : "calls", "Verb klausa relatif"], ["me", "Objek klausa relatif"], [past ? "lived" : "lives", "Verb utama"], ["next door", "Keterangan tempat"])],
    explanation: "Who/that menjadi subjek calls/called, sehingga wajib ditulis. Klausa ini membatasi wanita yang dimaksud, sehingga tidak diapit koma.",
  });
}

// Agreement follows the noun phrase after existential there, not the word there.
for (const tense of STRUCTURE_TENSES) {
  for (const plural of [false, true]) {
    const be = tense === "presentSimple" ? plural ? "are" : "is" : plural ? "were" : "was";
    const noun = plural ? "some books" : "a book";
    for (const form of STRUCTURE_FORMS) {
      const phrase = form !== "positive" ? plural ? "any books" : "a book" : noun;
      const answer = form === "yesNoQuestion" ? `${be} there ${phrase} on the desk?`
        : `There ${be}${form === "negative" ? " not" : ""} ${phrase} on the desk.`;
      STRUCTURE_ITEMS.push({ focus: "thereIt", pattern: "existence", tense, mode: "nominal", form,
        answer: answer[0].toUpperCase() + answer.slice(1), instruction: "Gunakan there untuk menyatakan atau menanyakan keberadaan sesuai bentuk soal.",
        rows: row({ subject: "there", verb: "be", complement: phrase, place: "on the desk" }),
        parts: form === "yesNoQuestion" ? parts([be, "Be"], ["there", "Subjek pengantar"], [phrase, "Benda yang ditanyakan"], ["on the desk", "Keterangan tempat"])
          : parts(["There", "Subjek pengantar"], [`${be}${form === "negative" ? " not" : ""}`, "Be"], [phrase, "Benda yang dinyatakan"], ["on the desk", "Keterangan tempat"]),
        explanation: `There memperkenalkan keberadaan. ${plural ? "Books jamak" : "A book tunggal"} memakai ${be}. Pertanyaan menempatkan be sebelum there; negatif menambahkan not setelah be.` });
    }
  }
  const be = tense === "presentSimple" ? "is" : "was";
  for (const [pattern, complement, role, explanation] of [
    ["weather", "cold", "Pelengkap cuaca", "It menjadi subjek pengantar untuk cuaca; tidak merujuk benda tertentu."],
    ["clockTime", "five o'clock", "Pelengkap waktu", "It digunakan untuk menyatakan atau menanyakan waktu pada jam."],
    ["evaluation", "important to practise every day", "Penilaian dan kegiatan", "It mengisi posisi subjek. Important memberi penilaian terhadap kegiatan to practise every day."],
  ] as const) {
    for (const form of STRUCTURE_FORMS) {
      const answer = form === "yesNoQuestion" ? `${be} it ${complement}?` : `It ${be}${form === "negative" ? " not" : ""} ${complement}.`;
      STRUCTURE_ITEMS.push({ focus: "thereIt", pattern, tense, mode: "nominal", form,
        answer: answer[0].toUpperCase() + answer.slice(1), alternatives: pattern === "evaluation" ? [(answer[0].toUpperCase() + answer.slice(1)).replace("practise", "practice")] : [], instruction: `Gunakan it untuk ${pattern === "weather" ? "cuaca" : pattern === "clockTime" ? "waktu pada jam" : "menilai kegiatan berlatih setiap hari"}, sesuai bentuk soal.`,
        rows: row({ subject: "it", verb: "be", complement }),
        parts: [
          ...(form === "yesNoQuestion" ? parts([be, "Be"], ["it", "Subjek pengantar"])
            : parts(["It", "Subjek pengantar"], [`${be}${form === "negative" ? " not" : ""}`, "Be"])),
          ...(pattern === "evaluation" ? parts(["important", "Pelengkap penilaian"], ["to practise", "Kegiatan yang dinilai", ["to practice"]], ["every day", "Keterangan waktu"])
            : parts([complement, role])),
        ],
        explanation });
    }
  }
}

export function structureItems(focus: StructureFocus, pattern?: string) {
  return STRUCTURE_ITEMS.filter(item => item.focus === focus && (!pattern || item.pattern === pattern));
}

export function buildStructureQuestion(focus: StructureFocus, pattern: string | undefined, tense: Tense, mode: Mode, form: SentenceForm, previousAnswer?: string): Question {
  const candidates = structureItems(focus, pattern).filter(item => item.tense === tense && item.mode === mode && item.form === form);
  const remaining = candidates.filter(item => item.answer !== previousAnswer);
  const pool = remaining.length ? remaining : candidates;
  if (!pool.length) throw new RangeError("Unsupported sentence structure combination");
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { tense, mode, form, answer: item.answer,
    subject: { text: item.rows[0].cues.subject ?? "it", number: "singular", person: 3, entity: "thing" },
    focused: { label: STRUCTURE_LABELS[focus], instruction: item.instruction,
      rows: item.rows.map(r => ({ ...r, detail: `${TENSE_LABELS[tense]} · ${MODE_LABELS[mode]} · ${FORM_LABELS[form]}` })),
      alternatives: item.alternatives ?? [], explanation: item.explanation,
      analysis: { parts: item.parts },
    },
  };
}
