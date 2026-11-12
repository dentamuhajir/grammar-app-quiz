import { BASICS_LABELS } from "../labels";

export type BasicsTopic = keyof typeof BASICS_LABELS;
export type BasicsFilter = BasicsTopic | "all";
export const NO_WORD = "∅";

export interface BasicsQuestion {
  id: string;
  topic: BasicsTopic;
  rule: string;
  prompt: string;
  context?: string;
  cue?: string;
  hint: string;
  answer: string;
  acceptedAnswers?: readonly string[];
  explanation: string;
}

/** Explicit sound/article metadata avoids guessing pronunciation from spelling. */
const ROLES = [
  { noun: "doctor", article: "a" },
  { noun: "teacher", article: "a" },
  { noun: "engineer", article: "an" },
  { noun: "artist", article: "an" },
  { noun: "university student", article: "a" },
  { noun: "honest person", article: "an" },
];

const NOUNS = [
  { singular: "book", plural: "books", reason: "Tambahkan -s pada book." },
  { singular: "desk", plural: "desks", reason: "Tambahkan -s pada desk." },
  { singular: "box", plural: "boxes", reason: "Kata berakhiran -x mendapat -es." },
  { singular: "bus", plural: "buses", reason: "Kata berakhiran -s ini mendapat -es." },
  { singular: "baby", plural: "babies", reason: "Konsonan + y berubah menjadi -ies." },
  { singular: "toy", plural: "toys", reason: "Vokal + y cukup ditambah -s: toys." },
  { singular: "child", plural: "children", reason: "Child memiliki bentuk jamak tidak beraturan: children." },
  { singular: "person", plural: "people", reason: "Untuk menghitung orang dalam konteks ini, gunakan people." },
  { singular: "mouse", plural: "mice", reason: "Mouse memiliki bentuk jamak tidak beraturan: mice." },
  { singular: "sheep", plural: "sheep", reason: "Bentuk tunggal dan jamak sheep sama." },
];

/** Generate only curated, compatible combinations; no arbitrary phrase pairing. */
export function buildQuestionPool(): BasicsQuestion[] {
  const pool: BasicsQuestion[] = [];
  const add = (q: BasicsQuestion) => pool.push(q);

  // 1. Articles (a / an / the / - )
  const articleHint = "Ketik a, an, the, atau - jika tidak memerlukan artikel. Perhatikan bunyi awal kata dan apakah benda sudah spesifik.";
  for (const name of ["Maya", "Rina", "Alex"]) {
    for (const role of ROLES) {
      add({
        id: `article-role-${name}-${role.noun}`,
        topic: "articles",
        rule: "A / an · bunyi awal",
        context: "Perkenalkan profesi atau identitas orang ini untuk pertama kali.",
        prompt: `${name} is ___ ${role.noun}.`,
        hint: articleHint,
        answer: role.article,
        explanation: `Gunakan ${role.article} untuk menyebut satu ${role.noun} secara umum. A/an mengikuti bunyi awal: ${
          role.noun === "university student"
            ? "university dimulai dengan bunyi /y/, jadi a."
            : role.noun === "honest person"
              ? "h pada honest tidak dibunyikan, jadi an."
              : role.article === "an"
                ? "bunyi vokal memakai an."
                : "bunyi konsonan memakai a."
        }`,
      });
    }
  }
  for (const noun of ["book", "bag", "phone", "camera", "bicycle", "watch"]) {
    add({
      id: `article-known-${noun}`,
      topic: "articles",
      rule: "The · sudah disebut",
      context: `I bought a ${noun} yesterday.`,
      prompt: `___ ${noun} I bought is expensive.`,
      hint: articleHint,
      answer: "the",
      explanation: `Gunakan the: ${noun} yang dimaksud sudah disebut dan diperjelas oleh “I bought”.`,
    });
  }
  for (const language of ["English", "Japanese", "Spanish", "French"]) {
    add({
      id: `article-language-${language}`,
      topic: "articles",
      rule: "Tanpa artikel · bahasa",
      context: "Nama bahasa digunakan secara umum.",
      prompt: `We speak ___ ${language} at home.`,
      hint: articleHint,
      answer: NO_WORD,
      explanation: `Nama bahasa ${language} dalam penggunaan umum tidak memerlukan a, an, atau the (ketik -).`,
    });
  }
  for (const noun of ["Cats", "Dogs", "Birds", "Elephants"]) {
    add({
      id: `article-general-${noun}`,
      topic: "articles",
      rule: "Tanpa artikel · jamak umum",
      context: "Pernyataan ini membahas jenis hewan secara umum, bukan kelompok tertentu.",
      prompt: `___ ${noun.toLowerCase()} need water.`,
      hint: articleHint,
      answer: NO_WORD,
      explanation: "Kata benda jamak yang membahas suatu jenis secara umum tidak memerlukan artikel (ketik -).",
    });
  }

  // 2. Prepositions (in / on / at / - )
  const prepHint = "Ketik in, on, at, atau - jika tidak memerlukan preposisi. Ingat: on = hari/permukaan, in = bulan/tahun/ruang, at = jam/titik waktu.";
  const times: Array<{ values: string[]; answer: string; rule: string; reason: string; pattern: string }> = [
    { values: ["Monday", "Tuesday", "Wednesday", "Friday", "Sunday"], answer: "on", rule: "Hari", reason: "Gunakan on sebelum nama hari.", pattern: "The meeting is ___ $time." },
    { values: ["January", "April", "July", "December"], answer: "in", rule: "Bulan", reason: "Gunakan in sebelum nama bulan tanpa tanggal tertentu.", pattern: "The festival takes place ___ $time." },
    { values: ["2020", "2022", "2024"], answer: "in", rule: "Tahun", reason: "Gunakan in sebelum tahun.", pattern: "The shop opened ___ $time." },
    { values: ["nine o'clock", "7 a.m.", "noon", "midnight"], answer: "at", rule: "Jam / titik waktu", reason: "Gunakan at untuk jam atau titik waktu seperti noon dan midnight.", pattern: "The train leaves ___ $time." },
    { values: ["tomorrow", "next Monday", "next week", "next month"], answer: NO_WORD, rule: "Tanpa preposisi", reason: "Tomorrow serta ungkapan waktu dengan next tidak memakai in/on/at (ketik -).", pattern: "The meeting is ___ $time." },
  ];
  for (const group of times) {
    for (const time of group.values) {
      add({
        id: `prep-time-${time}`,
        topic: "prepositions",
        rule: `Waktu · ${group.rule}`,
        prompt: group.pattern.replace("$time", time),
        hint: prepHint,
        answer: group.answer,
        explanation: group.reason,
      });
    }
  }
  for (const place of ["box", "bag", "drawer"]) {
    add({
      id: `prep-inside-${place}`,
      topic: "prepositions",
      rule: "Tempat · di dalam",
      context: `Kunci berada di bagian dalam ${place}, bukan di permukaannya.`,
      prompt: `The keys are ___ the ${place}.`,
      hint: prepHint,
      answer: "in",
      explanation: "Gunakan in untuk posisi di dalam suatu ruang atau wadah.",
    });
  }
  for (const place of ["table", "desk", "shelf"]) {
    add({
      id: `prep-surface-${place}`,
      topic: "prepositions",
      rule: "Tempat · permukaan",
      context: `Buku terletak menyentuh permukaan atas ${place}.`,
      prompt: `The book is ___ the ${place}.`,
      hint: prepHint,
      answer: "on",
      explanation: "Gunakan on untuk benda yang berada di atas dan menyentuh permukaan.",
    });
  }

  // 3. Singular & Plural
  for (const noun of NOUNS) {
    for (const count of ["one", "two", "three", "five"]) {
      add({
        id: `plural-${noun.singular}-${count}`,
        topic: "plurals",
        rule: count === "one" ? "Tunggal" : "Jamak",
        prompt: `There ${count === "one" ? "is" : "are"} ${count} ___ in the picture.`,
        cue: noun.singular,
        hint: `Perhatikan jumlah “${count}” di depan bagian kosong. Apakah kata benda “${noun.singular}” tetap tunggal atau berubah menjadi jamak?`,
        answer: count === "one" ? noun.singular : noun.plural,
        explanation:
          count === "one"
            ? `One berarti satu, jadi gunakan bentuk tunggal ${noun.singular}.`
            : `${count[0].toUpperCase() + count.slice(1)} berarti lebih dari satu. ${noun.reason}`,
      });
    }
  }

  // 4. Gerund & Infinitive
  const gerundSubjects = [
    { base: "swim", ing: "swimming", tail: "every morning is good for your health." },
    { base: "read", ing: "reading", tail: "books every day expands your vocabulary." },
    { base: "drink", ing: "drinking", tail: "enough water keeps your body hydrated." },
    { base: "learn", ing: "learning", tail: "a new language takes patience." },
    { base: "wake", ing: "waking", tail: "up early gives you more time to prepare." },
    { base: "exercise", ing: "exercising", tail: "regularly helps reduce stress." },
  ];
  for (const item of gerundSubjects) {
    add({
      id: `gerund-subject-${item.base}`,
      topic: "gerunds",
      rule: "Gerund · subjek kalimat",
      prompt: `___ ${item.tail}`,
      cue: item.base,
      hint: "Kata kerja ini menempati posisi subjek di awal kalimat. Gunakan bentuk gerund (V-ing).",
      answer: item.ing,
      explanation: `Kata kerja yang menjadi subjek kalimat diubah ke bentuk gerund (-ing): ${item.base} → ${item.ing}.`,
    });
  }
  const gerundPreps = [
    { prep: "at", base: "solve", ing: "solving", prompt: "She is very good at ___ problems." },
    { prep: "for", base: "help", ing: "helping", prompt: "Thank you for ___ me yesterday." },
    { prep: "without", base: "say", ing: "saying", prompt: "He left the room without ___ goodbye." },
    { prep: "about", base: "start", ing: "starting", prompt: "They talked about ___ a new business." },
    { prep: "before", base: "eat", ing: "eating", prompt: "Wash your hands before ___ dinner." },
    { prep: "after", base: "finish", ing: "finishing", prompt: "She went home after ___ her work." },
    { prep: "by", base: "practice", ing: "practicing", prompt: "You can improve by ___ every day." },
    { prep: "in", base: "learn", ing: "learning", prompt: "He is interested in ___ Japanese." },
  ];
  for (const item of gerundPreps) {
    add({
      id: `gerund-prep-${item.prep}-${item.base}`,
      topic: "gerunds",
      rule: `Setelah preposisi (${item.prep} + V-ing)`,
      prompt: item.prompt,
      cue: item.base,
      hint: `Perhatikan kata depan (preposisi) “${item.prep}” tepat sebelum bagian kosong. Setelah preposisi selalu diikuti V-ing.`,
      answer: item.ing,
      explanation: `Setelah preposisi “${item.prep}”, kata kerja wajib berbentuk gerund (-ing): ${item.ing}.`,
    });
  }
  const verbGerunds = [
    { main: "enjoy", base: "read", ing: "reading", prompt: "I enjoy ___ novels in my free time." },
    { main: "finish", base: "write", ing: "writing", prompt: "She finished ___ the report at noon." },
    { main: "avoid", base: "drive", ing: "driving", prompt: "He avoids ___ late at night." },
    { main: "keep", base: "try", ing: "trying", prompt: "Please keep ___ until you succeed." },
    { main: "mind", base: "open", ing: "opening", prompt: "Would you mind ___ the window?" },
    { main: "suggest", base: "take", ing: "taking", prompt: "They suggested ___ the morning train." },
    { main: "miss", base: "play", ing: "playing", prompt: "We miss ___ football together." },
    { main: "practice", base: "speak", ing: "speaking", prompt: "She practices ___ English every day." },
  ];
  for (const item of verbGerunds) {
    add({
      id: `gerund-verb-${item.main}-${item.base}`,
      topic: "gerunds",
      rule: `Verb + Gerund (${item.main} + V-ing)`,
      prompt: item.prompt,
      cue: item.base,
      hint: `Kata kerja utama “${item.main}” termasuk kelompok kata kerja yang wajib diikuti gerund (V-ing).`,
      answer: item.ing,
      explanation: `Kata kerja “${item.main}” diikuti oleh gerund (-ing), bukan to + V1: gunakan “${item.ing}”.`,
    });
  }
  const verbInfinitives = [
    { main: "decide", base: "buy", prompt: "She decided ___ a new laptop." },
    { main: "plan", base: "visit", prompt: "We plan ___ Bandung next month." },
    { main: "promise", base: "arrive", prompt: "He promised ___ on time." },
    { main: "hope", base: "see", prompt: "I hope ___ you again soon." },
    { main: "agree", base: "help", prompt: "They agreed ___ the team." },
    { main: "want", base: "learn", prompt: "I want ___ how to cook." },
    { main: "need", base: "check", prompt: "You need ___ the schedule carefully." },
    { main: "refuse", base: "sign", prompt: "He refused ___ the document." },
  ];
  for (const item of verbInfinitives) {
    add({
      id: `infinitive-verb-${item.main}-${item.base}`,
      topic: "gerunds",
      rule: `Verb + To-Infinitive (${item.main} + to V1)`,
      prompt: item.prompt,
      cue: item.base,
      hint: `Kata kerja utama “${item.main}” diikuti oleh to-infinitive (to + V1).`,
      answer: `to ${item.base}`,
      explanation: `Kata kerja “${item.main}” diikuti oleh to-infinitive (to + V1): gunakan “to ${item.base}”.`,
    });
  }

  // 5. Relative Pronouns (that / which / who / whose)
  const relNonDefining = [
    { key: "laptop", prompt: "My laptop, ___ I bought in 2022, still works well." },
    { key: "car", prompt: "His car, ___ was parked outside, is electric." },
    { key: "museum", prompt: "The city museum, ___ opened last year, is free to enter." },
    { key: "hotel", prompt: "The hotel, ___ overlooks the beach, is fully booked." },
    { key: "camera", prompt: "This camera, ___ belongs to my sister, takes sharp photos." },
  ];
  for (const item of relNonDefining) {
    add({
      id: `rel-nondef-which-${item.key}`,
      topic: "relatives",
      rule: "Klausa dengan koma · which",
      prompt: item.prompt,
      hint: "Pilih kata ganti penghubung (that / which / who / whose). Perhatikan subjeknya adalah benda dan ada tanda koma di depannya.",
      answer: "which",
      explanation: "Klausa yang diapit koma (non-defining clause / informasi tambahan) untuk benda wajib memakai “which”, tidak boleh “that”.",
    });
  }
  const relThatOnly = [
    { key: "best-movie", prompt: "This is the best movie ___ I have ever watched." },
    { key: "only-key", prompt: "This is the only key ___ opens the cabinet." },
    { key: "first-book", prompt: "It was the first novel ___ she wrote." },
    { key: "everything", prompt: "She explained everything ___ happened at the office." },
    { key: "something", prompt: "There is something ___ you need to know." },
  ];
  for (const item of relThatOnly) {
    add({
      id: `rel-that-only-${item.key}`,
      topic: "relatives",
      rule: "Superlatif & tak tentu · that",
      prompt: item.prompt,
      hint: "Pilih antara that / which / who / whose. Perhatikan adanya superlatif (the best/only/first) atau kata everything/something.",
      answer: "that",
      explanation: "Setelah bentuk superlatif (the best / the first / the only) atau kata seperti everything / something, gunakan “that” (bukan “which”).",
    });
  }
  const relDefiningThing = [
    { key: "book", prompt: "The book ___ is on the desk belongs to Rina." },
    { key: "bag", prompt: "I found the bag ___ you lost yesterday." },
    { key: "bus", prompt: "The bus ___ goes to the airport leaves every hour." },
    { key: "cake", prompt: "The cake ___ she baked was delicious." },
  ];
  for (const item of relDefiningThing) {
    add({
      id: `rel-def-thing-${item.key}`,
      topic: "relatives",
      rule: "Benda tanpa koma · that / which",
      prompt: item.prompt,
      hint: "Kata ganti penghubung untuk benda pada klausa penjelas tanpa koma (that / which).",
      answer: "that",
      acceptedAnswers: ["that", "which"],
      explanation: "Pada klausa penjelas benda tanpa koma (defining clause), baik “that” maupun “which” dapat digunakan.",
    });
  }
  const relWho = [
    { key: "doctor", prompt: "The doctor ___ treated my mother was very kind." },
    { key: "woman", prompt: "Do you know the woman ___ is speaking on stage?" },
    { key: "teacher", prompt: "My teacher, ___ lives near the school, walks to work." },
    { key: "engineer", prompt: "The engineer ___ designed the bridge won an award." },
  ];
  for (const item of relWho) {
    const hasComma = item.prompt.includes(",");
    add({
      id: `rel-who-${item.key}`,
      topic: "relatives",
      rule: "Orang · who",
      prompt: item.prompt,
      hint: "Kata ganti penghubung untuk orang yang menjadi subjek kata kerja berikutnya.",
      answer: "who",
      acceptedAnswers: hasComma ? ["who"] : ["who", "that"],
      explanation: hasComma
        ? "Untuk orang pada klausa dengan koma (informasi tambahan), wajib gunakan “who” (tidak boleh “that”)."
        : "Untuk merujuk pada orang sebagai pelaku/subjek klausa, gunakan “who” (pada klausa tanpa koma, “that” juga diterima).",
    });
  }
  const relWhose = [
    { key: "student", prompt: "The student ___ phone rang in class apologized." },
    { key: "man", prompt: "I helped a man ___ car broke down on the road." },
    { key: "writer", prompt: "She is the writer ___ novel won the prize." },
    { key: "neighbor", prompt: "That is the neighbor ___ dog barks every night." },
  ];
  for (const item of relWhose) {
    add({
      id: `rel-whose-${item.key}`,
      topic: "relatives",
      rule: "Kepemilikan · whose",
      prompt: item.prompt,
      hint: "Perhatikan kata benda tepat setelah bagian kosong. Gunakan relative pronoun kepemilikan (“yang …-nya”).",
      answer: "whose",
      explanation: "Gunakan “whose” sebelum kata benda untuk menyatakan kepemilikan (“yang …-nya”).",
    });
  }

  // 6. Modals (can / could / should / must / might / may)
  const modalItems: Array<{
    key: string;
    rule: string;
    context: string;
    prompt: string;
    answer: string;
    accepted?: string[];
    explanation: string;
  }> = [
    {
      key: "ability-now-swim",
      rule: "Kemampuan sekarang · can",
      context: "Menyatakan kemampuan saat ini.",
      prompt: "She ___ speak three languages fluently.",
      answer: "can",
      explanation: "Gunakan “can” + V1 untuk menyatakan kemampuan di masa sekarang.",
    },
    {
      key: "ability-now-drive",
      rule: "Kemampuan sekarang · can",
      context: "Menyatakan kemampuan saat ini.",
      prompt: "I ___ drive a manual car.",
      answer: "can",
      explanation: "Gunakan “can” + V1 untuk menyatakan kemampuan saat ini.",
    },
    {
      key: "ability-past-run",
      rule: "Kemampuan masa lalu · could",
      context: "Menyatakan kemampuan umum di masa lalu (when he was young).",
      prompt: "When he was young, he ___ run very fast.",
      answer: "could",
      explanation: "Gunakan “could” (bentuk lampau dari can) untuk kemampuan di masa lalu.",
    },
    {
      key: "ability-past-read",
      rule: "Kemampuan masa lalu · could",
      context: "Menyatakan kemampuan di masa lalu (at the age of four).",
      prompt: "She ___ read before she started school.",
      answer: "could",
      explanation: "Karena klausa berikutnya berbentuk lampau (started), gunakan “could”.",
    },
    {
      key: "advice-rest",
      rule: "Saran · should",
      context: "Memberikan saran atau anjuran yang baik.",
      prompt: "You look very tired. You ___ take a rest.",
      answer: "should",
      explanation: "Gunakan “should” + V1 untuk memberikan saran atau nasihat.",
    },
    {
      key: "advice-doctor",
      rule: "Saran · should",
      context: "Memberikan saran kepada orang yang sedang sakit.",
      prompt: "He has a high fever. He ___ see a doctor.",
      answer: "should",
      explanation: "Gunakan “should” untuk menyarankan tindakan yang sebaiknya dilakukan.",
    },
    {
      key: "obligation-seatbelt",
      rule: "Kewajiban · must",
      context: "Aturan wajib demi keselamatan.",
      prompt: "All passengers ___ wear a seatbelt during the flight.",
      answer: "must",
      explanation: "Gunakan “must” untuk kewajiban kuat atau peraturan resmi.",
    },
    {
      key: "obligation-passport",
      rule: "Kewajiban · must",
      context: "Syarat wajib perjalanan internasional.",
      prompt: "You ___ show your passport at the immigration counter.",
      answer: "must",
      explanation: "Gunakan “must” untuk menyatakan keharusan atau aturan wajib.",
    },
    {
      key: "prohibition-smoke",
      rule: "Larangan · must not / cannot",
      context: "Larangan keras di area rumah sakit.",
      prompt: "Visitors ___ smoke inside the hospital.",
      answer: "must not",
      accepted: ["must not", "mustn't", "cannot", "can't", "can not"],
      explanation: "Gunakan “must not” (mustn't) atau “cannot” untuk menyatakan larangan.",
    },
    {
      key: "possibility-rain",
      rule: "Kemungkinan · might / may",
      context: "Kemungkinan yang belum pasti terjadi.",
      prompt: "Take an umbrella with you. It ___ rain later this evening.",
      answer: "might",
      accepted: ["might", "may"],
      explanation: "Gunakan “might” atau “may” untuk menyatakan kemungkinan yang belum pasti.",
    },
    {
      key: "possibility-late",
      rule: "Kemungkinan · might / may",
      context: "Kemungkinan karena jalanan macet (belum pasti).",
      prompt: "The traffic is heavy, so I ___ arrive a little late.",
      answer: "might",
      accepted: ["might", "may"],
      explanation: "Gunakan “might” atau “may” ketika sesuatu mungkin terjadi tetapi belum pasti.",
    },
    {
      key: "request-help",
      rule: "Permintaan sopan · could / would",
      context: "Meminta bantuan dengan sopan.",
      prompt: "___ you help me carry this heavy box, please?",
      answer: "could",
      accepted: ["could", "would", "can"],
      explanation: "Gunakan “Could” atau “Would” (atau “Can”) di awal kalimat tanya untuk meminta bantuan dengan sopan.",
    },
  ];
  for (const item of modalItems) {
    add({
      id: `modal-${item.key}`,
      topic: "modals",
      rule: item.rule,
      context: item.context,
      prompt: item.prompt,
      hint: "Ketik modal auxiliary yang sesuai (can / could / should / must / must not / might / may / would) berdasarkan konteks kalimat.",
      answer: item.answer,
      acceptedAnswers: item.accepted,
      explanation: item.explanation,
    });
  }

  // 7. Conjunctions (because / although / but / so / if / unless / while / until / or)
  const conjunctionItems: Array<{
    key: string;
    rule: string;
    prompt: string;
    answer: string;
    accepted?: string[];
    explanation: string;
  }> = [
    {
      key: "contrast-but",
      rule: "Pertentangan setara · but",
      prompt: "The jacket was warm, ___ it was too expensive.",
      answer: "but",
      accepted: ["but", "yet"],
      explanation: "Gunakan “but” setelah koma untuk menghubungkan dua klausa setara yang berlawanan makna.",
    },
    {
      key: "contrast-although-front",
      rule: "Pertentangan bertingkat · although",
      prompt: "___ it was raining heavily, they continued the match.",
      answer: "although",
      accepted: ["although", "even though", "though"],
      explanation: "Di awal kalimat sebelum anak kalimat pertentangan, gunakan “Although” / “Even though” (bukan “but”).",
    },
    {
      key: "contrast-although-mid",
      rule: "Pertentangan bertingkat · although",
      prompt: "He went to the office ___ he was feeling unwell.",
      answer: "although",
      accepted: ["although", "even though", "though"],
      explanation: "Gunakan “although” / “even though” untuk menggabungkan klausa pertentangan tanpa koma.",
    },
    {
      key: "reason-because",
      rule: "Sebab / alasan · because",
      prompt: "She stayed at home ___ she had a high fever.",
      answer: "because",
      accepted: ["because", "since", "as"],
      explanation: "Klausa kedua menjelaskan penyebab: gunakan “because” (karena).",
    },
    {
      key: "result-so",
      rule: "Akibat / hasil · so",
      prompt: "The restaurant was full, ___ we cooked dinner at home.",
      answer: "so",
      explanation: "Klausa kedua adalah akibat/hasil dari klausa pertama: gunakan “so” (jadi/sehingga).",
    },
    {
      key: "condition-if",
      rule: "Syarat · if",
      prompt: "We will catch the early train ___ we leave right now.",
      answer: "if",
      explanation: "Gunakan “if” (jika) untuk menyatakan syarat terjadinya sesuatu.",
    },
    {
      key: "condition-unless",
      rule: "Syarat negatif · unless",
      prompt: "You will miss the flight ___ you hurry up.",
      answer: "unless",
      explanation: "“Unless” berarti “kecuali jika / jika tidak” (if you do not hurry up).",
    },
    {
      key: "time-until",
      rule: "Batas waktu · until",
      prompt: "Please wait in the lobby ___ the manager calls your name.",
      answer: "until",
      accepted: ["until", "till"],
      explanation: "Gunakan “until” (sampai/hingga) untuk menunjukkan batas waktu suatu tindakan berlangsung.",
    },
    {
      key: "time-while",
      rule: "Kejadian bersamaan · while",
      prompt: "She listened to a podcast ___ she was driving to work.",
      answer: "while",
      accepted: ["while", "as", "when"],
      explanation: "Gunakan “while” ketika dua kegiatan sedang berlangsung bersamaan.",
    },
    {
      key: "choice-or",
      rule: "Pilihan · or",
      prompt: "Would you like hot tea ___ iced coffee?",
      answer: "or",
      explanation: "Gunakan “or” (atau) untuk menawarkan pilihan.",
    },
  ];
  for (const item of conjunctionItems) {
    add({
      id: `conj-${item.key}`,
      topic: "conjunctions",
      rule: item.rule,
      prompt: item.prompt,
      hint: "Perhatikan hubungan logika antar dua bagian kalimat (pertentangan: but/although, sebab: because, akibat: so, syarat: if/unless, waktu: while/until, pilihan: or).",
      answer: item.answer,
      acceptedAnswers: item.accepted,
      explanation: item.explanation,
    });
  }

  return pool;
}

export const BASICS_POOL = buildQuestionPool();

/** Shuffle a complete cycle, without repeating its last item at the next boundary. */
export function createDeck(filter: BasicsFilter, previousId?: string): BasicsQuestion[] {
  const deck = BASICS_POOL.filter((q) => filter === "all" || q.topic === filter);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  if (deck.length > 1 && deck[0].id === previousId) [deck[0], deck[1]] = [deck[1], deck[0]];
  return deck;
}

export function checkBasicsAnswer(q: BasicsQuestion, input: string): "empty" | "correct" | "incorrect" {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return "empty";
  if (q.answer === NO_WORD && (normalized === "-" || normalized === "none" || normalized === NO_WORD)) {
    return "correct";
  }
  const accepted = q.acceptedAnswers ?? [q.answer];
  return accepted.some((ans) => ans.toLowerCase() === normalized) ? "correct" : "incorrect";
}

export function completedSentence(q: BasicsQuestion): string {
  const sentence = q.prompt.replace("___", q.answer === NO_WORD ? "" : q.answer).replace(/\s+/g, " ").trim();
  return sentence[0].toUpperCase() + sentence.slice(1);
}

export function mistakeHint(q: BasicsQuestion, input: string): string {
  const word = input.trim().toLowerCase().replace(/\s+/g, " ");
  if (q.topic === "articles") {
    if (word === "the") return "The menunjuk sesuatu yang sudah spesifik/dapat diidentifikasi. Periksa apakah konteks ini menyebut sesuatu secara umum.";
    if (word === NO_WORD || word === "-" || word === "none") return "Bagian ini membutuhkan artikel (a / an / the). Periksa konteks dan bunyi awal kata berikutnya.";
    if (word === "a" || word === "an") return "A/an digunakan untuk kata benda tunggal yang dapat dihitung. Pilih berdasarkan konteks dan bunyi awal (vokal vs konsonan), bukan hanya huruf.";
    return "Ketik a, an, the, atau - jika tidak memerlukan artikel.";
  }
  if (q.topic === "prepositions") {
    return `Pilihan ${word === NO_WORD || word === "-" || word === "none" ? "tanpa preposisi" : `“${word}”`} belum sesuai dengan keterangan waktu atau posisi pada konteks ini.`;
  }
  if (q.topic === "gerunds") {
    const expectsInfinitive = q.answer.startsWith("to ");
    if (expectsInfinitive && word.endsWith("ing") && !word.startsWith("to ")) return `Kata kerja sebelum bagian kosong ini membutuhkan to-infinitive (“${q.answer}”), bukan gerund (“${word}”).`;
    if (expectsInfinitive && word === q.cue) return `Tambahkan “to” sebelum kata kerja dasar: “${q.answer}”.`;
    if (expectsInfinitive && word.startsWith("to ") && word.endsWith("ing")) return `Setelah “to” pada infinitive, gunakan bentuk dasar V1 (“${q.answer}”), bukan -ing.`;
    if (!expectsInfinitive && word.startsWith("to ")) return `Posisi ini membutuhkan gerund (-ing) “${q.answer}”, bukan to-infinitive.`;
    if (!expectsInfinitive && word === q.cue) return `Ubah kata dasar “${q.cue}” menjadi bentuk gerund (-ing): “${q.answer}”.`;
    return `Bentuk “${input.trim()}” belum tepat. Perhatikan apakah posisi ini membutuhkan gerund (-ing) atau to-infinitive (to + V1).`;
  }
  if (q.topic === "relatives") {
    if (q.answer === "which" && word === "that") return "Ada tanda koma sebelum bagian kosong (non-defining clause): tidak boleh memakai “that”, gunakan “which”.";
    if (q.answer === "that" && !q.acceptedAnswers && word === "which") return "Setelah superlatif (the best/first/only) atau everything/something, gunakan “that”, bukan “which”.";
    if (q.answer === "who" && (word === "which" || word === "that")) return q.prompt.includes(",")
      ? "Klausa dengan koma yang merujuk pada orang wajib memakai “who”, bukan “that” atau “which”."
      : "Yang dijelaskan adalah orang, bukan benda: gunakan “who”.";
    if (q.answer === "whose") return "Kata setelah bagian kosong adalah benda yang dimiliki: gunakan “whose” untuk menyatakan kepemilikan.";
    if (word === "who" && (q.answer === "that" || q.answer === "which")) return "“Who” hanya untuk orang; untuk benda gunakan “that” atau “which”.";
    return `Kata penghubung “${input.trim()}” belum sesuai. Pilih antara that, which, who, atau whose sesuai konteks kalimat.`;
  }
  if (q.topic === "modals") {
    if (word.includes(" to")) return "Modal auxiliary (can, could, should, must, might) langsung diikuti V1 murni tanpa “to”.";
    if (q.answer === "could" && word === "can" && q.context?.includes("masa lalu")) return "Konteks kalimat ini berada di masa lalu: gunakan bentuk lampau “could”, bukan “can”.";
    if (q.answer === "can" && word === "could") return "Konteks ini menyatakan kemampuan saat ini (fakta sekarang): gunakan “can”.";
    return `Modal “${input.trim()}” belum sesuai dengan makna pada konteks ini (${q.context?.toLowerCase() ?? "periksa makna kalimat"}).`;
  }
  if (q.topic === "conjunctions") {
    if (q.answer === "although" && word === "but") return "“But” tidak diletakkan di awal kalimat seperti ini atau tanpa koma di tengah klausa bertingkat; gunakan “although”.";
    if (q.answer === "but" && (word === "although" || word === "because")) return "Dua klausa utama ini berlawanan dan dipisahkan koma: gunakan “but”.";
    if (q.answer === "because" && word === "so") return "Klausa setelah bagian kosong adalah penyebab (alasan), bukan akibat: gunakan “because”.";
    if (q.answer === "so" && word === "because") return "Klausa setelah bagian kosong adalah hasil/akibat dari klausa pertama: gunakan “so”.";
    if (q.answer === "unless" && word === "if") return "“If you hurry up” membuat maknanya terbalik (kamu akan ketinggalan pesawat jika buru-buru). Gunakan “unless” (kecuali jika).";
    return `Kata sambung “${input.trim()}” belum sesuai dengan hubungan logika antar kedua klausa.`;
  }
  return `Bentuk “${input.trim()}” belum sesuai. Perhatikan jumlah yang disebutkan.`;
}
