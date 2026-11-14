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

const NOUNS: Array<{
  singular: string;
  plural: string;
  pluralCount: "two" | "three" | "five";
  reason: string;
}> = [
  { singular: "book", plural: "books", pluralCount: "two", reason: "Tambahkan -s pada book." },
  { singular: "desk", plural: "desks", pluralCount: "three", reason: "Tambahkan -s pada desk." },
  { singular: "box", plural: "boxes", pluralCount: "two", reason: "Kata berakhiran -x mendapat -es." },
  { singular: "bus", plural: "buses", pluralCount: "three", reason: "Kata berakhiran -s ini mendapat -es." },
  { singular: "baby", plural: "babies", pluralCount: "three", reason: "Konsonan + y berubah menjadi -ies." },
  { singular: "toy", plural: "toys", pluralCount: "two", reason: "Vokal + y cukup ditambah -s: toys." },
  { singular: "child", plural: "children", pluralCount: "two", reason: "Child memiliki bentuk jamak tidak beraturan: children." },
  { singular: "person", plural: "people", pluralCount: "five", reason: "Untuk menghitung orang dalam konteks ini, gunakan people." },
  { singular: "mouse", plural: "mice", pluralCount: "three", reason: "Mouse memiliki bentuk jamak tidak beraturan: mice." },
  { singular: "sheep", plural: "sheep", pluralCount: "five", reason: "Bentuk tunggal dan jamak sheep sama." },
];

/** Generate only curated, compatible combinations; no arbitrary phrase pairing. */
export function buildQuestionPool(): BasicsQuestion[] {
  const pool: BasicsQuestion[] = [];
  const add = (q: BasicsQuestion) => pool.push(q);

  // 1. Articles (a / an / the / - )
  const articleHint = "Ketik a, an, the, atau - jika tidak memerlukan artikel. Perhatikan bunyi awal kata dan apakah benda sudah spesifik.";
  for (const name of ["Maya", "Rina"]) {
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
  for (const unique of [
    { key: "sun", prompt: "___ sun rises in the east.", label: "matahari (sun)" },
    { key: "moon", prompt: "___ moon looks very bright tonight.", label: "bulan (moon)" },
    { key: "sky", prompt: "Dark clouds covered ___ sky this afternoon.", label: "langit (sky)" },
  ]) {
    add({
      id: `article-unique-${unique.key}`,
      topic: "articles",
      rule: "The · satu-satunya (unik)",
      context: "Benda ini hanya ada satu di dunia atau lingkungan kita.",
      prompt: unique.prompt,
      hint: articleHint,
      answer: "the",
      explanation: `Gunakan “the” untuk objek yang unik atau satu-satunya seperti ${unique.label}.`,
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
  const prepHint = "Ketik in, on, at, atau - jika tidak memerlukan preposisi. Ingat: on = hari/permukaan, in = bulan/tahun/ruang, at = jam/titik lokasi.";
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
  for (const point of [
    { key: "bus-stop", prompt: "She is waiting ___ the bus stop.", label: "halte bus (titik lokasi)" },
    { key: "door", prompt: "Someone is knocking ___ the front door.", label: "pintu depan (titik lokasi)" },
    { key: "station", prompt: "Let's meet ___ the train station at five.", label: "stasiun kereta (titik temu)" },
    { key: "home", prompt: "We decided to stay ___ home this weekend.", label: "ungkapan tetap at home" },
  ]) {
    add({
      id: `prep-point-${point.key}`,
      topic: "prepositions",
      rule: "Tempat · titik lokasi (at)",
      context: `Menunjuk ${point.label}.`,
      prompt: point.prompt,
      hint: prepHint,
      answer: "at",
      explanation: `Gunakan “at” untuk titik lokasi spesifik atau ungkapan lokasi seperti ${point.label}.`,
    });
  }

  // 3. Singular & Plural
  for (const noun of NOUNS) {
    for (const count of ["one", noun.pluralCount] as const) {
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

  // 4. Pronouns & Possessives (object / possessive adjective / possessive pronoun / reflexive)
  const pronounHint = "Ubah kata ganti dasar menjadi bentuk yang tepat: objek (me/him/her/us/them), kepemilikan + benda (my/your/his/her/our/their), kepemilikan mandiri (mine/yours/his/hers/ours/theirs), atau diri sendiri (-self/-selves).";
  const pronounItems: Array<{
    key: string;
    rule: string;
    cue: string;
    prompt: string;
    answer: string;
    explanation: string;
  }> = [
    {
      key: "obj-me",
      rule: "Object pronoun · setelah kata kerja",
      cue: "I",
      prompt: "Rina called ___ last night to ask about the schedule.",
      answer: "me",
      explanation: "Setelah kata kerja “called”, gunakan object pronoun “me” (bukan subjek “I”).",
    },
    {
      key: "obj-him",
      rule: "Object pronoun · setelah kata kerja",
      cue: "he",
      prompt: "Mr. Budi is our new neighbor. Do you know ___?",
      answer: "him",
      explanation: "Sebagai objek dari kata kerja “know”, kata ganti “he” berubah menjadi “him”.",
    },
    {
      key: "obj-her",
      rule: "Object pronoun · setelah kata kerja",
      cue: "she",
      prompt: "Maya is carrying heavy boxes. Let's help ___.",
      answer: "her",
      explanation: "Sebagai objek setelah kata kerja “help”, kata ganti “she” berubah menjadi “her”.",
    },
    {
      key: "obj-us",
      rule: "Object pronoun · setelah preposisi",
      cue: "we",
      prompt: "The teacher explained the grammar rule clearly to ___.",
      answer: "us",
      explanation: "Setelah preposisi “to”, gunakan object pronoun “us” (bukan “we”).",
    },
    {
      key: "obj-them",
      rule: "Object pronoun · setelah kata kerja",
      cue: "they",
      prompt: "Where are my glasses? I cannot find ___ anywhere.",
      answer: "them",
      explanation: "Sebagai objek dari kata kerja “find”, kata ganti “they” berubah menjadi “them”.",
    },
    {
      key: "posadj-my",
      rule: "Possessive adjective · sebelum benda",
      cue: "I",
      prompt: "I forgot to bring ___ umbrella this morning.",
      answer: "my",
      explanation: "Di depan kata benda “umbrella”, gunakan possessive adjective “my” (bukan “me” atau “mine”).",
    },
    {
      key: "posadj-her",
      rule: "Possessive adjective · sebelum benda",
      cue: "she",
      prompt: "She always parks ___ bicycle in front of the library.",
      answer: "her",
      explanation: "Di depan kata benda “bicycle”, gunakan possessive adjective “her” (bukan “hers”).",
    },
    {
      key: "posadj-his",
      rule: "Possessive adjective · sebelum benda",
      cue: "he",
      prompt: "Alex washed ___ hands before eating lunch.",
      answer: "his",
      explanation: "Di depan kata benda “hands”, gunakan bentuk kepemilikan “his”.",
    },
    {
      key: "posadj-our",
      rule: "Possessive adjective · sebelum benda",
      cue: "we",
      prompt: "We need to submit ___ report before Friday.",
      answer: "our",
      explanation: "Di depan kata benda “report”, gunakan possessive adjective “our” (bukan “ours”).",
    },
    {
      key: "posadj-their",
      rule: "Possessive adjective · sebelum benda",
      cue: "they",
      prompt: "The students left ___ bags in the classroom.",
      answer: "their",
      explanation: "Di depan kata benda “bags”, gunakan possessive adjective “their” (bukan “theirs”).",
    },
    {
      key: "pospro-mine",
      rule: "Possessive pronoun · berdiri sendiri",
      cue: "I",
      prompt: "That black umbrella is yours, and this blue one is ___.",
      answer: "mine",
      explanation: "Karena tidak diikuti kata benda lagi di belakangnya, gunakan possessive pronoun “mine” (bukan “my”).",
    },
    {
      key: "pospro-hers",
      rule: "Possessive pronoun · berdiri sendiri",
      cue: "she",
      prompt: "This notebook belongs to Rina. It is ___.",
      answer: "hers",
      explanation: "Tanpa kata benda sesudahnya, kepemilikan untuk “she” menggunakan possessive pronoun “hers”.",
    },
    {
      key: "pospro-ours",
      rule: "Possessive pronoun · berdiri sendiri",
      cue: "we",
      prompt: "Their house is on Maple Street, while ___ is on Oak Street.",
      answer: "ours",
      explanation: "Kata ganti ini berdiri sendiri menggantikan “our house”, jadi gunakan “ours”.",
    },
    {
      key: "pospro-theirs",
      rule: "Possessive pronoun · berdiri sendiri",
      cue: "they",
      prompt: "We brought our own rackets, and they brought ___.",
      answer: "theirs",
      explanation: "Tanpa kata benda di belakangnya (“their rackets”), gunakan possessive pronoun “theirs”.",
    },
    {
      key: "pospro-yours",
      rule: "Possessive pronoun · berdiri sendiri",
      cue: "you",
      prompt: "I have my ticket right here. Do you have ___?",
      answer: "yours",
      explanation: "Untuk menggantikan “your ticket” tanpa mengulang kata bendanya, gunakan “yours”.",
    },
    {
      key: "refl-myself",
      rule: "Reflexive pronoun · diri sendiri",
      cue: "I",
      prompt: "I taught ___ how to play the guitar from online videos.",
      answer: "myself",
      explanation: "Subjek dan objek kalimat adalah orang yang sama (“I”), jadi gunakan reflexive pronoun “myself”.",
    },
    {
      key: "refl-himself",
      rule: "Reflexive pronoun · diri sendiri",
      cue: "he",
      prompt: "He accidentally cut ___ while slicing onions.",
      answer: "himself",
      explanation: "Karena subjek “He” melukai dirinya sendiri, gunakan reflexive pronoun “himself”.",
    },
    {
      key: "refl-herself",
      rule: "Reflexive pronoun · diri sendiri",
      cue: "she",
      prompt: "She made ___ a cup of hot tea before going to bed.",
      answer: "herself",
      explanation: "Subjek “She” membuat teh untuk dirinya sendiri: gunakan “herself”.",
    },
    {
      key: "refl-yourself",
      rule: "Reflexive pronoun · diri sendiri",
      cue: "you",
      prompt: "Be careful with that hot pan so you don't burn ___.",
      answer: "yourself",
      explanation: "Subjek tunggal “you” merujuk pada diri sendiri: gunakan “yourself”.",
    },
    {
      key: "refl-themselves",
      rule: "Reflexive pronoun · diri sendiri",
      cue: "they",
      prompt: "The children prepared the school performance all by ___.",
      answer: "themselves",
      explanation: "Ungkapan “by + reflexive pronoun” berarti sendirian/mandiri; untuk “they” gunakan “themselves”.",
    },
  ];
  for (const item of pronounItems) {
    add({
      id: `pronoun-${item.key}`,
      topic: "pronouns",
      rule: item.rule,
      prompt: item.prompt,
      cue: item.cue,
      hint: pronounHint,
      answer: item.answer,
      explanation: item.explanation,
    });
  }

  // 5. Quantifiers (much / many / some / any / a few / a little)
  const quantifierHint = "Perhatikan apakah kata benda setelah bagian kosong dapat dihitung (countable jamak: many / a few) atau tidak dapat dihitung (uncountable: much / a little), serta apakah kalimatnya positif (some) atau negatif/tanya (any).";
  const quantifierItems: Array<{
    key: string;
    rule: string;
    context: string;
    prompt: string;
    answer: string;
    accepted?: string[];
    explanation: string;
  }> = [
    {
      key: "much-water",
      rule: "Much vs Many · uncountable",
      context: "Pilih antara much atau many.",
      prompt: "How ___ water do you drink every day?",
      answer: "much",
      explanation: "“Water” adalah uncountable noun (tidak dapat dihitung satuan), jadi gunakan “much”.",
    },
    {
      key: "much-time",
      rule: "Much vs Many · uncountable",
      context: "Pilih antara much atau many.",
      prompt: "Hurry up! We don't have ___ time before the train leaves.",
      answer: "much",
      explanation: "“Time” (waktu) tidak dapat dihitung secara langsung, sehingga memakai “much”.",
    },
    {
      key: "much-sugar",
      rule: "Much vs Many · uncountable",
      context: "Pilih antara much atau many.",
      prompt: "She doesn't put ___ sugar in her coffee.",
      answer: "much",
      explanation: "“Sugar” adalah uncountable noun, jadi gunakan “much” pada kalimat negatif ini.",
    },
    {
      key: "much-money",
      rule: "Much vs Many · uncountable",
      context: "Pilih antara much atau many.",
      prompt: "How ___ money did you spend on the tickets?",
      answer: "much",
      explanation: "Kata “money” termasuk uncountable noun dalam bahasa Inggris, jadi wajib memakai “much”.",
    },
    {
      key: "many-books",
      rule: "Much vs Many · countable jamak",
      context: "Pilih antara much atau many.",
      prompt: "How ___ books did you borrow from the library?",
      answer: "many",
      explanation: "“Books” adalah kata benda jamak yang dapat dihitung (countable), jadi gunakan “many”.",
    },
    {
      key: "many-chairs",
      rule: "Much vs Many · countable jamak",
      context: "Pilih antara much atau many.",
      prompt: "There aren't ___ chairs in the meeting room.",
      answer: "many",
      explanation: "“Chairs” dapat dihitung dan berbentuk jamak, sehingga memakai “many”.",
    },
    {
      key: "many-emails",
      rule: "Much vs Many · countable jamak",
      context: "Pilih antara much atau many.",
      prompt: "How ___ emails do you receive every morning?",
      answer: "many",
      explanation: "“Emails” adalah countable noun jamak, jadi gunakan “many”.",
    },
    {
      key: "many-people",
      rule: "Much vs Many · countable jamak",
      context: "Pilih antara much atau many.",
      prompt: "Were there ___ people at the concert last night?",
      answer: "many",
      explanation: "“People” adalah bentuk jamak dari person (dapat dihitung), jadi gunakan “many”.",
    },
    {
      key: "some-milk",
      rule: "Some vs Any · kalimat positif",
      context: "Pilih antara some atau any.",
      prompt: "There is ___ fresh milk in the refrigerator.",
      answer: "some",
      explanation: "Gunakan “some” pada kalimat berita positif.",
    },
    {
      key: "some-friends",
      rule: "Some vs Any · kalimat positif",
      context: "Pilih antara some atau any.",
      prompt: "I met ___ old friends at the bookstore yesterday.",
      answer: "some",
      explanation: "Kalimat ini berbentuk positif (+), jadi gunakan “some”.",
    },
    {
      key: "some-offer",
      rule: "Some vs Any · tawaran sopan",
      context: "Pilih antara some atau any (kalimat menawarkan sesuatu).",
      prompt: "Would you like ___ hot tea or coffee?",
      answer: "some",
      explanation: "Meskipun berbentuk kalimat tanya, untuk menawarkan sesuatu (Would you like…?) gunakan “some”.",
    },
    {
      key: "any-bread",
      rule: "Some vs Any · kalimat negatif",
      context: "Pilih antara some atau any.",
      prompt: "We don't have ___ bread left for breakfast.",
      answer: "any",
      explanation: "Pada kalimat negatif (don't have), gunakan “any” (bukan “some”).",
    },
    {
      key: "any-questions",
      rule: "Some vs Any · kalimat negatif",
      context: "Pilih antara some atau any.",
      prompt: "He didn't ask ___ questions during the presentation.",
      answer: "any",
      explanation: "Gunakan “any” setelah kata kerja negatif (didn't ask).",
    },
    {
      key: "any-stamps",
      rule: "Some vs Any · kalimat tanya",
      context: "Pilih antara some atau any.",
      prompt: "Do you have ___ envelopes in your desk drawer?",
      answer: "any",
      explanation: "Untuk pertanyaan umum yang menanyakan ketersediaan, gunakan “any”.",
    },
    {
      key: "afew-minutes",
      rule: "A few vs A little · countable jamak",
      context: "Pilih antara a few atau a little.",
      prompt: "Please wait here; I only need ___ minutes to get ready.",
      answer: "a few",
      accepted: ["a few", "few"],
      explanation: "“Minutes” dapat dihitung dan jamak (-s), jadi gunakan “a few” (beberapa).",
    },
    {
      key: "afew-mistakes",
      rule: "A few vs A little · countable jamak",
      context: "Pilih antara a few atau a little.",
      prompt: "She made only ___ mistakes on the grammar test.",
      answer: "a few",
      accepted: ["a few", "few"],
      explanation: "“Mistakes” adalah countable noun jamak, sehingga memakai “a few”.",
    },
    {
      key: "afew-days",
      rule: "A few vs A little · countable jamak",
      context: "Pilih antara a few atau a little.",
      prompt: "We are going to stay in Yogyakarta for ___ days.",
      answer: "a few",
      explanation: "“Days” dapat dihitung dan berbentuk jamak, jadi gunakan “a few”.",
    },
    {
      key: "alittle-salt",
      rule: "A few vs A little · uncountable",
      context: "Pilih antara a few atau a little.",
      prompt: "This soup needs ___ salt to taste better.",
      answer: "a little",
      accepted: ["a little", "little"],
      explanation: "“Salt” (garam) tidak dapat dihitung satuan (uncountable), jadi gunakan “a little” (sedikit).",
    },
    {
      key: "alittle-rest",
      rule: "A few vs A little · uncountable",
      context: "Pilih antara a few atau a little.",
      prompt: "You look pale. You should get ___ rest before driving.",
      answer: "a little",
      accepted: ["a little", "little"],
      explanation: "“Rest” (istirahat) adalah uncountable noun, sehingga memakai “a little”.",
    },
    {
      key: "alittle-patience",
      rule: "A few vs A little · uncountable",
      context: "Pilih antara a few atau a little.",
      prompt: "Learning a new skill takes ___ patience and practice.",
      answer: "a little",
      accepted: ["a little", "little"],
      explanation: "“Patience” (kesabaran) adalah uncountable noun, jadi gunakan “a little”.",
    },
  ];
  for (const item of quantifierItems) {
    add({
      id: `quant-${item.key}`,
      topic: "quantifiers",
      rule: item.rule,
      context: item.context,
      prompt: item.prompt,
      hint: quantifierHint,
      answer: item.answer,
      acceptedAnswers: item.accepted,
      explanation: item.explanation,
    });
  }

  // 6. Comparatives & Superlatives
  const compHint = "Perhatikan penanda di kalimat: jika ada “than”, gunakan bentuk comparative (-er / more ...). Jika ada “the” di depan bagian kosong untuk membandingkan banyak hal, gunakan superlative (-est / most ...). Waspadai kata tidak beraturan (good/bad/far).";
  const compItems: Array<{
    key: string;
    rule: string;
    cue: string;
    prompt: string;
    answer: string;
    accepted?: string[];
    explanation: string;
  }> = [
    {
      key: "comp-taller",
      rule: "Comparative · 1 suku kata (-er)",
      cue: "tall",
      prompt: "My younger brother is now ___ than me.",
      answer: "taller",
      explanation: "Ada kata “than” (lebih ... daripada) dan “tall” hanya 1 suku kata: tambahkan -er menjadi “taller”.",
    },
    {
      key: "comp-cheaper",
      rule: "Comparative · 1 suku kata (-er)",
      cue: "cheap",
      prompt: "Taking the train is ___ than flying.",
      answer: "cheaper",
      explanation: "Kata sifat 1 suku kata “cheap” ditambah -er saat membandingkan dua hal (than): “cheaper”.",
    },
    {
      key: "comp-bigger",
      rule: "Comparative · konsonan ganda (-er)",
      cue: "big",
      prompt: "Jakarta is ___ than Bandung.",
      answer: "bigger",
      explanation: "“Big” berpola konsonan-vokal-konsonan pendek, sehingga huruf g digandakan sebelum -er: “bigger”.",
    },
    {
      key: "comp-heavier",
      rule: "Comparative · akhiran -y (-ier)",
      cue: "heavy",
      prompt: "This wooden table is ___ than the plastic one.",
      answer: "heavier",
      explanation: "Kata sifat berakhiran konsonan + y mengubah y menjadi -ier pada bentuk comparative: “heavier”.",
    },
    {
      key: "sup-fastest",
      rule: "Superlative · 1 suku kata (-est)",
      cue: "fast",
      prompt: "The cheetah is the ___ land animal in the world.",
      answer: "fastest",
      accepted: ["fastest", "the fastest"],
      explanation: "Ada “the ___ in the world” (paling): tambahkan -est pada kata sifat pendek “fast” → “fastest”.",
    },
    {
      key: "sup-oldest",
      rule: "Superlative · 1 suku kata (-est)",
      cue: "old",
      prompt: "This is the ___ building in our town.",
      answer: "oldest",
      accepted: ["oldest", "the oldest"],
      explanation: "Untuk menyatakan “paling tua” di suatu kota, tambahkan -est pada “old” → “oldest”.",
    },
    {
      key: "sup-easiest",
      rule: "Superlative · akhiran -y (-iest)",
      cue: "easy",
      prompt: "Question number one was the ___ part of the test.",
      answer: "easiest",
      accepted: ["easiest", "the easiest"],
      explanation: "Akhiran -y pada “easy” berubah menjadi -iest untuk bentuk superlative (paling mudah): “easiest”.",
    },
    {
      key: "sup-hottest",
      rule: "Superlative · konsonan ganda (-est)",
      cue: "hot",
      prompt: "October is usually the ___ month of the year here.",
      answer: "hottest",
      accepted: ["hottest", "the hottest"],
      explanation: "Gandakan konsonan akhir t pada “hot” sebelum menambahkan -est: “hottest”.",
    },
    {
      key: "comp-expensive",
      rule: "Comparative · kata panjang (more)",
      cue: "expensive",
      prompt: "This leather jacket is ___ than the canvas one.",
      answer: "more expensive",
      explanation: "“Expensive” memiliki 3 suku kata, jadi gunakan “more expensive” (bukan expensiver).",
    },
    {
      key: "comp-important",
      rule: "Comparative · kata panjang (more)",
      cue: "important",
      prompt: "Good health is ___ than money.",
      answer: "more important",
      explanation: "Untuk kata sifat panjang seperti “important” sebelum “than”, gunakan “more important”.",
    },
    {
      key: "comp-comfortable",
      rule: "Comparative · kata panjang (more)",
      cue: "comfortable",
      prompt: "The sofa is ___ than that wooden chair.",
      answer: "more comfortable",
      explanation: "Kata sifat panjang “comfortable” memakai “more” untuk menyatakan “lebih nyaman”: “more comfortable”.",
    },
    {
      key: "sup-interesting",
      rule: "Superlative · kata panjang (most)",
      cue: "interesting",
      prompt: "That was the ___ documentary I have ever seen.",
      answer: "most interesting",
      accepted: ["most interesting", "the most interesting"],
      explanation: "Untuk bentuk superlative (paling) pada kata sifat panjang, gunakan “most interesting”.",
    },
    {
      key: "sup-difficult",
      rule: "Superlative · kata panjang (most)",
      cue: "difficult",
      prompt: "The final chapter was the ___ part of the book.",
      answer: "most difficult",
      accepted: ["most difficult", "the most difficult"],
      explanation: "Kata sifat panjang “difficult” setelah “the” memakai “most”: “most difficult”.",
    },
    {
      key: "sup-popular",
      rule: "Superlative · kata panjang (most)",
      cue: "popular",
      prompt: "Football is the ___ sport in our country.",
      answer: "most popular",
      accepted: ["most popular", "the most popular"],
      explanation: "Gunakan “most popular” untuk menyatakan “paling populer”.",
    },
    {
      key: "comp-better",
      rule: "Comparative tidak beraturan · good",
      cue: "good",
      prompt: "Her homemade soup tastes ___ than the restaurant's.",
      answer: "better",
      explanation: "“Good” memiliki bentuk comparative tidak beraturan: “better” (bukan gooder atau more good).",
    },
    {
      key: "sup-best",
      rule: "Superlative tidak beraturan · good",
      cue: "good",
      prompt: "Maya is the ___ chess player in our school.",
      answer: "best",
      accepted: ["best", "the best"],
      explanation: "Bentuk superlative (paling baik) dari “good” adalah “best”.",
    },
    {
      key: "comp-worse",
      rule: "Comparative tidak beraturan · bad",
      cue: "bad",
      prompt: "The traffic today is ___ than it was yesterday.",
      answer: "worse",
      explanation: "Bentuk comparative (lebih buruk) dari “bad” adalah “worse” (bukan badder atau more bad).",
    },
    {
      key: "sup-worst",
      rule: "Superlative tidak beraturan · bad",
      cue: "bad",
      prompt: "That storm was the ___ weather we had all year.",
      answer: "worst",
      accepted: ["worst", "the worst"],
      explanation: "Bentuk superlative (paling buruk) dari “bad” adalah “worst”.",
    },
    {
      key: "comp-farther",
      rule: "Comparative tidak beraturan · far",
      cue: "far",
      prompt: "The airport is ___ from here than the train station.",
      answer: "farther",
      accepted: ["farther", "further"],
      explanation: "Bentuk comparative dari “far” (lebih jauh) adalah “farther” atau “further”.",
    },
    {
      key: "sup-farthest",
      rule: "Superlative tidak beraturan · far",
      cue: "far",
      prompt: "Neptune is the ___ planet from the sun.",
      answer: "farthest",
      accepted: ["farthest", "furthest", "the farthest", "the furthest"],
      explanation: "Bentuk superlative dari “far” (paling jauh) adalah “farthest” atau “furthest”.",
    },
  ];
  for (const item of compItems) {
    add({
      id: `comp-${item.key}`,
      topic: "comparatives",
      rule: item.rule,
      prompt: item.prompt,
      cue: item.cue,
      hint: compHint,
      answer: item.answer,
      acceptedAnswers: item.accepted,
      explanation: item.explanation,
    });
  }

  // 7. Adjectives & Adverbs (-ly vs adjective, good vs well, -ed vs -ing adjectives)
  const adjAdvHint = "Perhatikan fungsi katanya: gunakan adverb (-ly / well) untuk menerangkan cara melakukan kata kerja, adjective biasa setelah kata kerja penghubung (look/smell/be) atau sebelum benda, serta bedakan -ed (perasaan orang) vs -ing (sifat penyebabnya).";
  const adjAdvItems: Array<{
    key: string;
    rule: string;
    cue: string;
    prompt: string;
    answer: string;
    explanation: string;
  }> = [
    {
      key: "adv-fluently",
      rule: "Adverb (-ly) · menerangkan kata kerja",
      cue: "fluent",
      prompt: "She speaks English and Japanese very ___.",
      answer: "fluently",
      explanation: "Kata ini menerangkan cara dia berbicara (“speaks”), jadi gunakan adverb “fluently”.",
    },
    {
      key: "adv-carefully",
      rule: "Adverb (-ly) · menerangkan kata kerja",
      cue: "careful",
      prompt: "Please read the instructions ___ before starting.",
      answer: "carefully",
      explanation: "Untuk menerangkan kata kerja “read” (membaca dengan hati-hati), ubah “careful” menjadi adverb “carefully”.",
    },
    {
      key: "adv-quietly",
      rule: "Adverb (-ly) · menerangkan kata kerja",
      cue: "quiet",
      prompt: "He closed the door ___ so he wouldn't wake the baby.",
      answer: "quietly",
      explanation: "Menerangkan cara menutup pintu (“closed”): tambahkan -ly menjadi “quietly”.",
    },
    {
      key: "adv-easily",
      rule: "Adverb (-ily) · menerangkan kata kerja",
      cue: "easy",
      prompt: "They solved the math problem ___.",
      answer: "easily",
      explanation: "Menerangkan kata kerja “solved”: akhiran -y pada “easy” berubah menjadi -ily → “easily”.",
    },
    {
      key: "adj-careful",
      rule: "Adjective · menerangkan kata benda",
      cue: "careful",
      prompt: "My father is a very ___ driver.",
      answer: "careful",
      explanation: "Kata ini diletakkan sebelum kata benda “driver” untuk menerangkan orangnya, jadi tetap adjective “careful”.",
    },
    {
      key: "adj-delicious",
      rule: "Adjective · setelah linking verb",
      cue: "delicious",
      prompt: "This homemade soup smells ___.",
      answer: "delicious",
      explanation: "Setelah kata kerja panca indra / linking verb seperti “smells”, gunakan adjective “delicious” (bukan deliciously).",
    },
    {
      key: "irreg-well",
      rule: "Adverb tidak beraturan · good → well",
      cue: "good",
      prompt: "Rina played the violin very ___ at the concert.",
      answer: "well",
      explanation: "Untuk menerangkan kata kerja aksi “played”, bentuk adverb dari “good” adalah “well”.",
    },
    {
      key: "irreg-good",
      rule: "Adjective · setelah linking verb (look)",
      cue: "good",
      prompt: "Your new haircut looks really ___.",
      answer: "good",
      explanation: "Setelah linking verb “looks” (terlihat), gunakan adjective “good”.",
    },
    {
      key: "irreg-hard",
      rule: "Adverb tanpa -ly · hard",
      cue: "hard",
      prompt: "The team worked very ___ to finish the project on time.",
      answer: "hard",
      explanation: "Bentuk adverb dari “hard” (dengan giat/keras) tetap “hard”. (“Hardly” justru berarti “hampir tidak”).",
    },
    {
      key: "irreg-fast",
      rule: "Adverb tanpa -ly · fast",
      cue: "fast",
      prompt: "He can run very ___ when he plays football.",
      answer: "fast",
      explanation: "Kata “fast” berfungsi sebagai adjective sekaligus adverb tanpa tambahan -ly (tidak ada kata “fastly”).",
    },
    {
      key: "ed-bored",
      rule: "Adjective -ed · perasaan orang",
      cue: "bore",
      prompt: "I felt ___ because the movie was three hours long.",
      answer: "bored",
      explanation: "Untuk menggambarkan perasaan seseorang (merasa bosan), gunakan akhiran -ed: “bored”.",
    },
    {
      key: "ing-boring",
      rule: "Adjective -ing · sifat penyebab",
      cue: "bore",
      prompt: "The lecture was so ___ that several students yawned.",
      answer: "boring",
      explanation: "Yang dijelaskan adalah kuliahnya (“The lecture”) yang menimbulkan rasa bosan (membosankan): gunakan “boring”.",
    },
    {
      key: "ed-tired",
      rule: "Adjective -ed · perasaan orang",
      cue: "tire",
      prompt: "She was very ___ after working all day.",
      answer: "tired",
      explanation: "Menggambarkan perasaan/kondisi orang (“She” merasa lelah): gunakan bentuk -ed “tired”.",
    },
    {
      key: "ing-tiring",
      rule: "Adjective -ing · sifat penyebab",
      cue: "tire",
      prompt: "Moving all the furniture upstairs was a ___ job.",
      answer: "tiring",
      explanation: "Menerangkan sifat pekerjaan (“job”) yang membuat lelah (melelahkan): gunakan “tiring”.",
    },
    {
      key: "ed-interested",
      rule: "Adjective -ed · perasaan orang",
      cue: "interest",
      prompt: "Are you ___ in joining the photography club?",
      answer: "interested",
      explanation: "Menanyakan perasaan/ketertarikan orang (“you” tertarik): gunakan “interested”.",
    },
    {
      key: "ing-interesting",
      rule: "Adjective -ing · sifat penyebab",
      cue: "interest",
      prompt: "She shared an ___ story about her trip to Maluku.",
      answer: "interesting",
      explanation: "Menerangkan sifat cerita (“story”) yang menarik: gunakan bentuk -ing “interesting”.",
    },
    {
      key: "ed-confused",
      rule: "Adjective -ed · perasaan orang",
      cue: "confuse",
      prompt: "The tourists looked ___ when they read the map.",
      answer: "confused",
      explanation: "Menggambarkan perasaan para turis (merasa bingung): gunakan “confused”.",
    },
    {
      key: "ing-confusing",
      rule: "Adjective -ing · sifat penyebab",
      cue: "confuse",
      prompt: "The road signs at the intersection are quite ___.",
      answer: "confusing",
      explanation: "Menerangkan rambu jalan (“road signs”) yang membingungkan: gunakan “confusing”.",
    },
    {
      key: "ed-excited",
      rule: "Adjective -ed · perasaan orang",
      cue: "excite",
      prompt: "The children are ___ about going to the zoo tomorrow.",
      answer: "excited",
      explanation: "Menggambarkan perasaan anak-anak (merasa bersemangat): gunakan “excited”.",
    },
    {
      key: "ing-exciting",
      rule: "Adjective -ing · sifat penyebab",
      cue: "excite",
      prompt: "The final match was ___ from start to finish.",
      answer: "exciting",
      explanation: "Menerangkan sifat pertandingan (“The final match”) yang seru/menegangkan: gunakan “exciting”.",
    },
  ];
  for (const item of adjAdvItems) {
    add({
      id: `adjadv-${item.key}`,
      topic: "adjectives",
      rule: item.rule,
      prompt: item.prompt,
      cue: item.cue,
      hint: adjAdvHint,
      answer: item.answer,
      explanation: item.explanation,
    });
  }

  // 8. Gerund & Infinitive
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
  const relWhere = [
    { key: "cafe", prompt: "The cafe ___ we first met is now a bookstore." },
    { key: "hotel", prompt: "That is the hotel ___ we stayed during our holiday." },
    { key: "town", prompt: "She visited the small town ___ her grandfather was born." },
    { key: "office", prompt: "This is the office ___ my brother works." },
  ];
  for (const item of relWhere) {
    add({
      id: `rel-where-${item.key}`,
      topic: "relatives",
      rule: "Tempat · where",
      prompt: item.prompt,
      hint: "Kata benda di depan bagian kosong adalah tempat, dan klausa sesudahnya menjelaskan kejadian di tempat itu (“tempat di mana”).",
      answer: "where",
      explanation: "Gunakan “where” untuk menerangkan tempat terjadinya suatu kegiatan (setara dengan in/at which).",
    });
  }

  // 10. Modals (can / could / should / must / might / may)
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
      key: "ability-neg-now",
      rule: "Ketidakmampuan sekarang · cannot",
      context: "Menyatakan ketidakmampuan/tidak bisa hadir malam ini.",
      prompt: "I'm sorry, I ___ come to the dinner tonight.",
      answer: "cannot",
      accepted: ["cannot", "can't", "can not"],
      explanation: "Gunakan “cannot” (can't) untuk menyatakan tidak bisa melakukan sesuatu saat ini.",
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
      key: "advice-neg-late",
      rule: "Saran negatif · should not",
      context: "Memberikan saran agar tidak begadang sebelum ujian.",
      prompt: "You ___ stay up too late before the exam.",
      answer: "should not",
      accepted: ["should not", "shouldn't"],
      explanation: "Gunakan “should not” (shouldn't) untuk menyarankan agar seseorang tidak melakukan sesuatu.",
    },
    {
      key: "advice-neg-skip",
      rule: "Saran negatif · should not",
      context: "Saran kesehatan agar tidak melewatkan sarapan.",
      prompt: "Children ___ skip breakfast before going to school.",
      answer: "should not",
      accepted: ["should not", "shouldn't"],
      explanation: "Gunakan “should not” (shouldn't) untuk nasihat atau anjuran negatif.",
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
      key: "obligation-helmet",
      rule: "Kewajiban · must",
      context: "Aturan wajib keselamatan lalu lintas.",
      prompt: "Motorcycle riders ___ wear a helmet on the road.",
      answer: "must",
      explanation: "Gunakan “must” untuk menyatakan kewajiban sesuai aturan keselamatan.",
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
      key: "prohibition-park",
      rule: "Larangan · must not / cannot",
      context: "Larangan memarkir kendaraan di depan pintu darurat.",
      prompt: "Drivers ___ park in front of the emergency exit.",
      answer: "must not",
      accepted: ["must not", "mustn't", "cannot", "can't", "can not"],
      explanation: "Gunakan “must not” (mustn't) atau “cannot” untuk larangan resmi.",
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
      key: "possibility-asleep",
      rule: "Kemungkinan · might / may",
      context: "Perkiraan yang belum pasti karena lampu rumah sudah mati.",
      prompt: "All the lights are off. They ___ be asleep already.",
      answer: "might",
      accepted: ["might", "may", "could"],
      explanation: "Gunakan “might” atau “may” untuk menyatakan tebakan atau kemungkinan saat ini.",
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
    {
      key: "request-window",
      rule: "Permintaan sopan · could / would",
      context: "Meminta tolong dengan sopan kepada seseorang.",
      prompt: "___ you please open the window a little?",
      answer: "could",
      accepted: ["could", "would", "can"],
      explanation: "Gunakan “Could” atau “Would” untuk permintaan sopan.",
    },
    {
      key: "permission-borrow",
      rule: "Meminta izin · may / can / could",
      context: "Meminta izin dengan sopan untuk meminjam pena.",
      prompt: "___ I borrow your pen for a moment?",
      answer: "may",
      accepted: ["may", "could", "can"],
      explanation: "Gunakan “May I…”, “Could I…”, atau “Can I…” untuk meminta izin dengan sopan.",
    },
  ];
  for (const item of modalItems) {
    add({
      id: `modal-${item.key}`,
      topic: "modals",
      rule: item.rule,
      context: item.context,
      prompt: item.prompt,
      hint: "Ketik modal auxiliary yang sesuai (can / cannot / could / should / should not / must / must not / might / may / would) berdasarkan konteks kalimat.",
      answer: item.answer,
      acceptedAnswers: item.accepted,
      explanation: item.explanation,
    });
  }

  // 11. Conjunctions (because / although / but / so / if / unless / while / until / or)
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
      key: "contrast-but-small",
      rule: "Pertentangan setara · but",
      prompt: "The apartment is quite small, ___ the location is very strategic.",
      answer: "but",
      accepted: ["but", "yet"],
      explanation: "Kedua klausa memiliki makna yang berlawanan dan dipisahkan koma: gunakan “but”.",
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
      key: "contrast-although-tired",
      rule: "Pertentangan bertingkat · although",
      prompt: "___ she was very tired, she finished helping her sister.",
      answer: "although",
      accepted: ["although", "even though", "though"],
      explanation: "Gunakan “Although” / “Even though” di awal anak kalimat pertentangan.",
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
      key: "reason-because-late",
      rule: "Sebab / alasan · because",
      prompt: "He missed the morning bus ___ he woke up late.",
      answer: "because",
      accepted: ["because", "since", "as"],
      explanation: "“He woke up late” adalah alasan ia ketinggalan bus: gunakan “because”.",
    },
    {
      key: "result-so",
      rule: "Akibat / hasil · so",
      prompt: "The restaurant was full, ___ we cooked dinner at home.",
      answer: "so",
      explanation: "Klausa kedua adalah akibat/hasil dari klausa pertama: gunakan “so” (jadi/sehingga).",
    },
    {
      key: "result-so-rain",
      rule: "Akibat / hasil · so",
      prompt: "It started to rain heavily, ___ we ran inside the cafe.",
      answer: "so",
      explanation: "Klausa setelah koma menyatakan hasil/tindakan akibat hujan: gunakan “so”.",
    },
    {
      key: "condition-if",
      rule: "Syarat · if",
      prompt: "We will catch the early train ___ we leave right now.",
      answer: "if",
      explanation: "Gunakan “if” (jika) untuk menyatakan syarat terjadinya sesuatu.",
    },
    {
      key: "condition-if-rain",
      rule: "Syarat · if",
      prompt: "We will move the party indoors ___ it rains tomorrow.",
      answer: "if",
      explanation: "Gunakan “if” untuk menyatakan kondisi atau syarat di masa depan.",
    },
    {
      key: "condition-unless",
      rule: "Syarat negatif · unless",
      prompt: "You will miss the flight ___ you hurry up.",
      answer: "unless",
      explanation: "“Unless” berarti “kecuali jika / jika tidak” (if you do not hurry up).",
    },
    {
      key: "condition-unless-ticket",
      rule: "Syarat negatif · unless",
      prompt: "You cannot enter the concert hall ___ you have a ticket.",
      answer: "unless",
      explanation: "Gunakan “unless” (kecuali jika / jika tidak punya tiket).",
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
      key: "time-until-stop",
      rule: "Batas waktu · until",
      prompt: "They stayed under the shelter ___ the rain stopped.",
      answer: "until",
      accepted: ["until", "till"],
      explanation: "Gunakan “until” (sampai) untuk batas waktu berhentinya hujan.",
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
      key: "time-while-cook",
      rule: "Kejadian bersamaan · while",
      prompt: "He set the dining table ___ his wife was cooking soup.",
      answer: "while",
      accepted: ["while", "as"],
      explanation: "Gunakan “while” untuk menghubungkan dua aktivitas yang berlangsung bersamaan.",
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
  if (q.topic === "pronouns") {
    const posAdjs = ["my", "your", "his", "her", "our", "their"];
    const posPros = ["mine", "yours", "his", "hers", "ours", "theirs"];
    if (posPros.includes(q.answer) && posAdjs.includes(word)) {
      return `Tidak ada kata benda setelah bagian kosong, jadi gunakan possessive pronoun mandiri (“${q.answer}”), bukan “${word}”.`;
    }
    if (posAdjs.includes(q.answer) && posPros.includes(word)) {
      return `Ada kata benda tepat setelah bagian kosong, jadi gunakan possessive adjective (“${q.answer}”), bukan “${word}”.`;
    }
    if (q.answer.endsWith("self") || q.answer.endsWith("selves")) {
      return `Subjek dan objek merujuk pada orang yang sama (diri sendiri): gunakan reflexive pronoun “${q.answer}”.`;
    }
    if (word === q.cue?.toLowerCase()) {
      return `“${q.cue}” adalah bentuk subjek. Ubah menjadi bentuk yang sesuai dengan posisinya di kalimat (“${q.answer}”).`;
    }
    return `Bentuk kata ganti “${input.trim()}” belum tepat untuk kata dasar “${q.cue}” pada posisi ini.`;
  }
  if (q.topic === "quantifiers") {
    if (q.answer === "much" && word === "many") return "Kata benda setelah bagian kosong tidak dapat dihitung (uncountable), jadi gunakan “much”, bukan “many”.";
    if (q.answer === "many" && word === "much") return "Kata benda setelah bagian kosong dapat dihitung dan jamak (countable), jadi gunakan “many”, bukan “much”.";
    if (q.answer === "some" && word === "any") return "Untuk kalimat positif atau tawaran sopan (Would you like…?), gunakan “some”, bukan “any”.";
    if (q.answer === "any" && word === "some") return "Untuk kalimat negatif atau pertanyaan umum, gunakan “any”, bukan “some”.";
    if (q.answer === "a few" && (word === "a little" || word === "little")) return "Kata benda sesudahnya dapat dihitung (countable jamak): gunakan “a few”, bukan “a little”.";
    if (q.answer === "a little" && (word === "a few" || word === "few")) return "Kata benda sesudahnya tidak dapat dihitung (uncountable): gunakan “a little”, bukan “a few”.";
    return `Pilihan quantifier “${input.trim()}” belum sesuai. Perhatikan apakah bendanya countable/uncountable atau kalimatnya positif/negatif.`;
  }
  if (q.topic === "comparatives") {
    if (word === `more ${q.cue}` && !q.answer.startsWith("more ")) {
      return `Kata sifat “${q.cue}” tidak memakai “more”. Gunakan bentuk “${q.answer}”.`;
    }
    if (word === `most ${q.cue}` && !q.answer.startsWith("most ")) {
      return `Kata sifat “${q.cue}” tidak memakai “most”. Gunakan bentuk “${q.answer}”.`;
    }
    if (word === "gooder" || word === "badder" || word === "goodest" || word === "baddest") {
      return `“${q.cue}” adalah kata sifat tidak beraturan (irregular): gunakan “${q.answer}”.`;
    }
    const isComp = q.prompt.includes(" than ");
    if (isComp && (word.endsWith("est") || word.startsWith("most "))) {
      return `Ada kata “than” (membandingkan dua hal): gunakan bentuk comparative (“${q.answer}”), bukan superlative.`;
    }
    if (!isComp && (word.endsWith("er") || word.startsWith("more "))) {
      return `Kalimat ini menyatakan “paling …” (ada “the” sebelum bagian kosong): gunakan bentuk superlative (“${q.answer}”).`;
    }
    return `Bentuk perbandingan “${input.trim()}” belum tepat untuk kata dasar “${q.cue}”.`;
  }
  if (q.topic === "adjectives") {
    if (q.answer.endsWith("ed") && word.endsWith("ing")) {
      return `Akhiran -ing (“${word}”) menggambarkan sifat penyebabnya, sedangkan untuk perasaan orang gunakan akhiran -ed (“${q.answer}”).`;
    }
    if (q.answer.endsWith("ing") && word.endsWith("ed")) {
      return `Akhiran -ed (“${word}”) hanya untuk perasaan orang; untuk sifat benda/situasi penyebabnya gunakan -ing (“${q.answer}”).`;
    }
    if (q.answer === "hard" && word === "hardly") {
      return "Hati-hati: “hardly” berarti “hampir tidak”. Untuk arti “dengan giat/keras”, adverb-nya tetap “hard”.";
    }
    if (q.answer === "fast" && word === "fastly") {
      return "Dalam bahasa Inggris tidak ada kata “fastly”; baik adjective maupun adverb tetap “fast”.";
    }
    if (q.answer === "well" && word === "good") {
      return "Untuk menerangkan cara melakukan kata kerja aksi, ubah adjective “good” menjadi adverb “well”.";
    }
    if (q.answer.endsWith("ly") && word === q.cue) {
      return `Bagian ini menerangkan kata kerja, jadi ubah adjective “${q.cue}” menjadi adverb (-ly): “${q.answer}”.`;
    }
    if (!q.answer.endsWith("ly") && word.endsWith("ly")) {
      return `Setelah linking verb (look/smell/be) atau sebelum kata benda, gunakan adjective “${q.answer}”, bukan adverb “${word}”.`;
    }
    return `Bentuk “${input.trim()}” belum tepat. Perhatikan apakah posisi ini membutuhkan adjective atau adverb.`;
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
    if (q.answer === "where" && (word === "which" || word === "that")) return "Klausa ini menjelaskan tempat terjadinya suatu aktivitas (di mana): gunakan “where”.";
    if (word === "who" && (q.answer === "that" || q.answer === "which")) return "“Who” hanya untuk orang; untuk benda gunakan “that” atau “which”.";
    return `Kata penghubung “${input.trim()}” belum sesuai. Pilih antara that, which, who, whose, atau where sesuai konteks kalimat.`;
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
    if (q.answer === "unless" && word === "if") return "Menggunakan “if” di sini membuat maknanya terbalik dari konteks kalimat. Gunakan “unless” (kecuali jika).";
    return `Kata sambung “${input.trim()}” belum sesuai dengan hubungan logika antar kedua klausa.`;
  }
  return `Bentuk “${input.trim()}” belum sesuai. Perhatikan jumlah yang disebutkan.`;
}
