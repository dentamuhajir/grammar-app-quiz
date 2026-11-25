import { BASICS_LABELS } from "../labels";
import { FOR_SINCE, FOR_SINCE_LESSONS, timeExplanation, timeHint } from "../forSince";
import { INTERESTED_IN, INTEREST_LESSONS, activityHint, prepositionHint } from "../interestedIn";
import { ARTICLE_WRITING, ARTICLE_LESSONS, knownHint, soundHint } from "../articleWriting";
import type { WritingSkill } from "../writingPacks";
import { TOPIC_WRITING_LESSONS } from "../topicWriting";

export type BasicsTopic = keyof typeof BASICS_LABELS;
export type BasicsFilter = BasicsTopic | "all" | WritingSkill;
export const NO_WORD = "∅";

export interface BasicsQuestion {
  skillId?: WritingSkill;
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
  function addArticle(question: BasicsQuestion) {
    const lesson = ARTICLE_LESSONS.find(item => item.id === question.id);
    if (!lesson) return add(question);
    return add({ ...question, skillId: ARTICLE_WRITING, cue: "a / an / the",
      context: lesson.basicsContext ?? question.context, hint: lesson.group === "known" ? knownHint : soundHint });
  }
  for (const name of ["Maya", "Rina"]) {
    for (const role of ROLES) {
      addArticle({
        id: `article-role-${name}-${role.noun}`,
        topic: "articles",
        rule: "A / an · bunyi awal",
        prompt: `${name} is ___ ${role.noun}.`,
        hint: `Perkenalkan profesi atau identitas orang ini untuk pertama kali. ${articleHint}`,
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
    addArticle({
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
      prompt: unique.prompt,
      hint: `Benda ini hanya ada satu di dunia atau lingkungan kita. ${articleHint}`,
      answer: "the",
      explanation: `Gunakan “the” untuk objek yang unik atau satu-satunya seperti ${unique.label}.`,
    });
  }
  for (const language of ["English", "Japanese", "Spanish", "French"]) {
    add({
      id: `article-language-${language}`,
      topic: "articles",
      rule: "Tanpa artikel · bahasa",
      prompt: `We speak ___ ${language} at home.`,
      hint: `Nama bahasa digunakan secara umum. ${articleHint}`,
      answer: NO_WORD,
      explanation: `Nama bahasa ${language} dalam penggunaan umum tidak memerlukan a, an, atau the (ketik -).`,
    });
  }
  for (const noun of ["Cats", "Dogs", "Birds", "Elephants"]) {
    add({
      id: `article-general-${noun}`,
      topic: "articles",
      rule: "Tanpa artikel · jamak umum",
      prompt: `___ ${noun.toLowerCase()} need water.`,
      hint: `Pernyataan ini membahas jenis hewan secara umum, bukan kelompok tertentu. ${articleHint}`,
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
      prompt: `The keys are ___ the ${place}.`,
      hint: `Kunci berada di bagian dalam ${place}, bukan di permukaannya. ${prepHint}`,
      answer: "in",
      explanation: "Gunakan in untuk posisi di dalam suatu ruang atau wadah.",
    });
  }
  for (const place of ["table", "desk", "shelf"]) {
    add({
      id: `prep-surface-${place}`,
      topic: "prepositions",
      rule: "Tempat · permukaan",
      prompt: `The book is ___ the ${place}.`,
      hint: `Buku terletak menyentuh permukaan atas ${place}. ${prepHint}`,
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
      prompt: point.prompt,
      hint: `Menunjuk ${point.label}. ${prepHint}`,
      answer: "at",
      explanation: `Gunakan “at” untuk titik lokasi spesifik atau ungkapan lokasi seperti ${point.label}.`,
    });
  }
  const advancedPreps: Array<{
    key: string;
    rule: string;
    hintDetail?: string;
    cue: string;
    prompt: string;
    answer: string;
    explanation: string;
  }> = [
    {
      key: "to-for-send",
      rule: "Arah/penerima · to vs for",
      cue: "to / for",
      prompt: "Please send this report ___ the manager.",
      answer: "to",
      explanation: "Gunakan “to” untuk menunjukkan arah perpindahan atau penerima langsung (send to).",
    },
    {
      key: "to-for-benefit",
      rule: "Tujuan/manfaat · to vs for",
      cue: "to / for",
      prompt: "I bought these flowers ___ my mother.",
      answer: "for",
      explanation: "Gunakan “for” ketika melakukan sesuatu demi manfaat atau untuk diberikan kepada seseorang (buy for).",
    },
    {
      key: "adj-good-at",
      rule: "Adjective + Preposition · good at",
      cue: "in / on / at",
      prompt: "My brother is really good ___ solving math problems.",
      answer: "at",
      explanation: "Untuk menyatakan keahlian dalam suatu bidang, gunakan “good at”.",
    },
    {
      key: "adj-afraid-of",
      rule: "Adjective + Preposition · afraid of",
      cue: "of / from / at",
      prompt: "Many children are afraid ___ the dark.",
      answer: "of",
      explanation: "Pasangan preposisi tetap untuk kata sifat takut adalah “afraid of”.",
    },
    {
      key: "adj-responsible-for",
      rule: "Adjective + Preposition · responsible for",
      cue: "for / to / of",
      prompt: "Our team is responsible ___ testing the new software.",
      answer: "for",
      explanation: "Gunakan “responsible for” untuk menyatakan tanggung jawab atas suatu tugas.",
    },
  ];
  for (const item of advancedPreps) {
    add({
      id: `prep-${item.key}`,
      topic: "prepositions",
      rule: item.rule,
      cue: item.cue,
      prompt: item.prompt,
      hint: `${item.hintDetail ? `${item.hintDetail} ` : ""}Perhatikan pasangan preposisi: for (durasi) vs since (titik awal), to (arah) vs for (manfaat), interested in, good at, atau responsible for.`,
      answer: item.answer,
      explanation: item.explanation,
    });
  }

  const habitQuestions: Array<{
    key: string;
    rule: string;
    hintDetail: string;
    cue: string;
    prompt: string;
    answer: string;
    explanation: string;
  }> = [
    {
      key: "used-to-past",
      rule: "Kebiasaan masa lalu · used to + V1",
      hintDetail: "Kebiasaan di masa lalu yang sekarang sudah tidak dilakukan lagi (diikuti V1).",
      cue: "used to / am used to",
      prompt: "I ___ wake up late, but now I wake up at 5 a.m.",
      answer: "used to",
      explanation: "Gunakan “used to + V1” untuk kebiasaan masa lalu yang sudah berhenti.",
    },
    {
      key: "be-used-to-ing",
      rule: "Terbiasa dengan · be used to + V-ing",
      hintDetail: "Sudah terbiasa dengan kondisi saat ini (perhatikan kata kerja sesudahnya berbentuk V-ing).",
      cue: "used to / am used to",
      prompt: "After living here for two years, I ___ driving in heavy traffic.",
      answer: "am used to",
      explanation: "Jika diikuti V-ing (driving) dan bermakna “sudah terbiasa”, gunakan “be used to” (am used to).",
    },
  ];
  for (const item of habitQuestions) {
    add({
      id: `habit-${item.key}`,
      topic: "habits",
      rule: item.rule,
      cue: item.cue,
      prompt: item.prompt,
      hint: `${item.hintDetail} Bedakan: used to + V1 (kebiasaan masa lalu yang sudah berhenti) vs be used to + V-ing (sekarang sudah terbiasa).`,
      answer: item.answer,
      explanation: item.explanation,
    });
  }

  for (const lesson of FOR_SINCE_LESSONS) {
    const expression = lesson.blank.split("___ ")[1].replace(/\.$/, "");
    add({
      id: lesson.id, skillId: FOR_SINCE, topic: "prepositions", rule: "Durasi dan titik awal",
      cue: "for / since", prompt: lesson.blank, answer: lesson.preposition,
      hint: timeHint(expression), explanation: timeExplanation(lesson.preposition, expression),
    });
  }

  for (const lesson of INTEREST_LESSONS) {
    const preposition = lesson.answer === "in";
    add({ id: lesson.id, skillId: INTERESTED_IN, topic: preposition ? "prepositions" : "gerunds",
      prompt: lesson.blank, rule: preposition ? "Kata depan setelah interested" : "Bentuk kata kerja setelah preposisi",
      answer: lesson.answer, cue: lesson.cue, hint: preposition ? prepositionHint : activityHint,
      explanation: preposition
        ? "Gunakan in untuk menghubungkan interested dengan kegiatan yang menarik bagi subjek."
        : `Setelah interested in, kegiatan dinyatakan dengan kata kerja berbentuk -ing. Di sini “${lesson.cue}” menjadi “${lesson.answer}”.`,
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
  const quantifierHint = "Perhatikan apakah kata benda setelah bagian kosong dapat dihitung (countable jamak: many / a few) atau tidak dapat dihitung (uncountable: much / a little), serta apakah kalimatnya positif/tawaran (some) atau negatif/tanya (any).";
  const quantifierItems: Array<{
    key: string;
    rule: string;
    cue: string;
    prompt: string;
    answer: string;
    accepted?: string[];
    explanation: string;
  }> = [
    {
      key: "much-water",
      rule: "Much vs Many · uncountable",
      cue: "much / many",
      prompt: "How ___ water do you drink every day?",
      answer: "much",
      explanation: "“Water” adalah uncountable noun (tidak dapat dihitung satuan), jadi gunakan “much”.",
    },
    {
      key: "much-time",
      rule: "Much vs Many · uncountable",
      cue: "much / many",
      prompt: "Hurry up! We don't have ___ time before the train leaves.",
      answer: "much",
      explanation: "“Time” (waktu) tidak dapat dihitung secara langsung, sehingga memakai “much”.",
    },
    {
      key: "much-sugar",
      rule: "Much vs Many · uncountable",
      cue: "much / many",
      prompt: "She doesn't put ___ sugar in her coffee.",
      answer: "much",
      explanation: "“Sugar” adalah uncountable noun, jadi gunakan “much” pada kalimat negatif ini.",
    },
    {
      key: "much-money",
      rule: "Much vs Many · uncountable",
      cue: "much / many",
      prompt: "How ___ money did you spend on the tickets?",
      answer: "much",
      explanation: "Kata “money” termasuk uncountable noun dalam bahasa Inggris, jadi wajib memakai “much”.",
    },
    {
      key: "many-books",
      rule: "Much vs Many · countable jamak",
      cue: "much / many",
      prompt: "How ___ books did you borrow from the library?",
      answer: "many",
      explanation: "“Books” adalah kata benda jamak yang dapat dihitung (countable), jadi gunakan “many”.",
    },
    {
      key: "many-chairs",
      rule: "Much vs Many · countable jamak",
      cue: "much / many",
      prompt: "There aren't ___ chairs in the meeting room.",
      answer: "many",
      explanation: "“Chairs” dapat dihitung dan berbentuk jamak, sehingga memakai “many”.",
    },
    {
      key: "many-emails",
      rule: "Much vs Many · countable jamak",
      cue: "much / many",
      prompt: "How ___ emails do you receive every morning?",
      answer: "many",
      explanation: "“Emails” adalah countable noun jamak, jadi gunakan “many”.",
    },
    {
      key: "many-people",
      rule: "Much vs Many · countable jamak",
      cue: "much / many",
      prompt: "Were there ___ people at the concert last night?",
      answer: "many",
      explanation: "“People” adalah bentuk jamak dari person (dapat dihitung), jadi gunakan “many”.",
    },
    {
      key: "some-milk",
      rule: "Some vs Any · kalimat positif",
      cue: "some / any",
      prompt: "There is ___ fresh milk in the refrigerator.",
      answer: "some",
      explanation: "Gunakan “some” pada kalimat berita positif.",
    },
    {
      key: "some-friends",
      rule: "Some vs Any · kalimat positif",
      cue: "some / any",
      prompt: "I met ___ old friends at the bookstore yesterday.",
      answer: "some",
      explanation: "Kalimat ini berbentuk positif (+), jadi gunakan “some”.",
    },
    {
      key: "some-offer",
      rule: "Some vs Any · tawaran sopan",
      cue: "some / any",
      prompt: "Would you like ___ hot tea or coffee?",
      answer: "some",
      explanation: "Meskipun berbentuk kalimat tanya, untuk menawarkan sesuatu (Would you like…?) gunakan “some”.",
    },
    {
      key: "any-bread",
      rule: "Some vs Any · kalimat negatif",
      cue: "some / any",
      prompt: "We don't have ___ bread left for breakfast.",
      answer: "any",
      explanation: "Pada kalimat negatif (don't have), gunakan “any” (bukan “some”).",
    },
    {
      key: "any-questions",
      rule: "Some vs Any · kalimat negatif",
      cue: "some / any",
      prompt: "He didn't ask ___ questions during the presentation.",
      answer: "any",
      explanation: "Gunakan “any” setelah kata kerja negatif (didn't ask).",
    },
    {
      key: "any-stamps",
      rule: "Some vs Any · kalimat tanya",
      cue: "some / any",
      prompt: "Do you have ___ envelopes in your desk drawer?",
      answer: "any",
      explanation: "Untuk pertanyaan umum yang menanyakan ketersediaan, gunakan “any”.",
    },
    {
      key: "afew-minutes",
      rule: "A few vs A little · countable jamak",
      cue: "a few / a little",
      prompt: "Please wait here; I only need ___ minutes to get ready.",
      answer: "a few",
      accepted: ["a few", "few"],
      explanation: "“Minutes” dapat dihitung dan jamak (-s), jadi gunakan “a few” (beberapa).",
    },
    {
      key: "afew-mistakes",
      rule: "A few vs A little · countable jamak",
      cue: "a few / a little",
      prompt: "She made only ___ mistakes on the grammar test.",
      answer: "a few",
      accepted: ["a few", "few"],
      explanation: "“Mistakes” adalah countable noun jamak, sehingga memakai “a few”.",
    },
    {
      key: "afew-days",
      rule: "A few vs A little · countable jamak",
      cue: "a few / a little",
      prompt: "We are going to stay in Yogyakarta for ___ days.",
      answer: "a few",
      explanation: "“Days” dapat dihitung dan berbentuk jamak, jadi gunakan “a few”.",
    },
    {
      key: "alittle-salt",
      rule: "A few vs A little · uncountable",
      cue: "a few / a little",
      prompt: "This soup needs ___ salt to taste better.",
      answer: "a little",
      accepted: ["a little", "little"],
      explanation: "“Salt” (garam) tidak dapat dihitung satuan (uncountable), jadi gunakan “a little” (sedikit).",
    },
    {
      key: "alittle-rest",
      rule: "A few vs A little · uncountable",
      cue: "a few / a little",
      prompt: "You look pale. You should get ___ rest before driving.",
      answer: "a little",
      accepted: ["a little", "little"],
      explanation: "“Rest” (istirahat) adalah uncountable noun, sehingga memakai “a little”.",
    },
    {
      key: "alittle-patience",
      rule: "A few vs A little · uncountable",
      cue: "a few / a little",
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
      cue: item.cue,
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
  ];
  for (const item of gerundPreps) {
    add({
      id: `gerund-prep-${item.prep}-${item.base}`,
      topic: "gerunds",
      rule: `Setelah preposisi (${item.prep} + V-ing)`,
      prompt: item.prompt,
      cue: item.base,
      hint: `Kata setelah “${item.prep}” menyatakan kegiatan. Pakai bentuk -ing dari kata dasar yang diberikan.`,
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
      cue: "who / which",
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
      cue: hasComma ? "who / which" : undefined,
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
    hintDetail: string;
    cue: string;
    prompt: string;
    answer: string;
    accepted?: string[];
    explanation: string;
  }> = [
    {
      key: "ability-now-swim",
      rule: "Kemampuan sekarang · can",
      hintDetail: "Menyatakan kemampuan saat ini.",
      cue: "can / should / must",
      prompt: "She ___ speak three languages fluently.",
      answer: "can",
      explanation: "Gunakan “can” + V1 untuk menyatakan kemampuan di masa sekarang.",
    },
    {
      key: "ability-now-drive",
      rule: "Kemampuan sekarang · can",
      hintDetail: "Menyatakan kemampuan saat ini.",
      cue: "can / must / should",
      prompt: "I ___ drive a manual car.",
      answer: "can",
      explanation: "Gunakan “can” + V1 untuk menyatakan kemampuan saat ini.",
    },
    {
      key: "ability-neg-now",
      rule: "Ketidakmampuan sekarang · cannot",
      hintDetail: "Menyatakan ketidakmampuan/tidak bisa hadir malam ini.",
      cue: "cannot / must / should",
      prompt: "I'm sorry, I ___ come to the dinner tonight.",
      answer: "cannot",
      accepted: ["cannot", "can't", "can not"],
      explanation: "Gunakan “cannot” (can't) untuk menyatakan tidak bisa melakukan sesuatu saat ini.",
    },
    {
      key: "ability-past-run",
      rule: "Kemampuan masa lalu · could",
      hintDetail: "Menyatakan kemampuan umum di masa lalu (when he was young).",
      cue: "can / could / should",
      prompt: "When he was young, he ___ run very fast.",
      answer: "could",
      explanation: "Gunakan “could” (bentuk lampau dari can) untuk kemampuan di masa lalu.",
    },
    {
      key: "ability-past-read",
      rule: "Kemampuan masa lalu · could",
      hintDetail: "Menyatakan kemampuan di masa lalu (before she started school).",
      cue: "can / could / must",
      prompt: "She ___ read before she started school.",
      answer: "could",
      explanation: "Karena klausa berikutnya berbentuk lampau (started), gunakan “could”.",
    },
    {
      key: "advice-rest",
      rule: "Saran · should",
      hintDetail: "Memberikan saran atau anjuran yang baik.",
      cue: "should / can / might",
      prompt: "You look very tired. You ___ take a rest.",
      answer: "should",
      explanation: "Gunakan “should” + V1 untuk memberikan saran atau nasihat.",
    },
    {
      key: "advice-doctor",
      rule: "Saran · should",
      hintDetail: "Memberikan saran kepada orang yang sedang sakit.",
      cue: "should / could / might",
      prompt: "He has a high fever. He ___ see a doctor.",
      answer: "should",
      explanation: "Gunakan “should” untuk menyarankan tindakan yang sebaiknya dilakukan.",
    },
    {
      key: "advice-neg-late",
      rule: "Saran negatif · should not",
      hintDetail: "Memberikan saran agar tidak begadang sebelum ujian.",
      cue: "should not / can / might",
      prompt: "You ___ stay up too late before the exam.",
      answer: "should not",
      accepted: ["should not", "shouldn't"],
      explanation: "Gunakan “should not” (shouldn't) untuk menyarankan agar seseorang tidak melakukan sesuatu.",
    },
    {
      key: "advice-neg-skip",
      rule: "Saran negatif · should not",
      hintDetail: "Saran kesehatan agar tidak melewatkan sarapan.",
      cue: "should not / can / might",
      prompt: "Children ___ skip breakfast before going to school.",
      answer: "should not",
      accepted: ["should not", "shouldn't"],
      explanation: "Gunakan “should not” (shouldn't) untuk nasihat atau anjuran negatif.",
    },
    {
      key: "obligation-seatbelt",
      rule: "Kewajiban · must",
      hintDetail: "Aturan wajib demi keselamatan.",
      cue: "must / can / might",
      prompt: "All passengers ___ wear a seatbelt during the flight.",
      answer: "must",
      explanation: "Gunakan “must” untuk kewajiban kuat atau peraturan resmi.",
    },
    {
      key: "obligation-passport",
      rule: "Kewajiban · must",
      hintDetail: "Syarat wajib perjalanan internasional.",
      cue: "must / could / might",
      prompt: "You ___ show your passport at the immigration counter.",
      answer: "must",
      explanation: "Gunakan “must” untuk menyatakan keharusan atau aturan wajib.",
    },
    {
      key: "obligation-helmet",
      rule: "Kewajiban · must",
      hintDetail: "Aturan wajib keselamatan lalu lintas.",
      cue: "must / can / might",
      prompt: "Motorcycle riders ___ wear a helmet on the road.",
      answer: "must",
      explanation: "Gunakan “must” untuk menyatakan kewajiban sesuai aturan keselamatan.",
    },
    {
      key: "prohibition-smoke",
      rule: "Larangan · must not / cannot",
      hintDetail: "Larangan keras di area rumah sakit.",
      cue: "must not / should / might",
      prompt: "Visitors ___ smoke inside the hospital.",
      answer: "must not",
      accepted: ["must not", "mustn't", "cannot", "can't", "can not"],
      explanation: "Gunakan “must not” (mustn't) atau “cannot” untuk menyatakan larangan.",
    },
    {
      key: "prohibition-park",
      rule: "Larangan · must not / cannot",
      hintDetail: "Larangan memarkir kendaraan di depan pintu darurat.",
      cue: "must not / could / might",
      prompt: "Drivers ___ park in front of the emergency exit.",
      answer: "must not",
      accepted: ["must not", "mustn't", "cannot", "can't", "can not"],
      explanation: "Gunakan “must not” (mustn't) atau “cannot” untuk larangan resmi.",
    },
    {
      key: "possibility-rain",
      rule: "Kemungkinan · might / may",
      hintDetail: "Kemungkinan yang belum pasti terjadi.",
      cue: "might / must / should",
      prompt: "Take an umbrella with you. It ___ rain later this evening.",
      answer: "might",
      accepted: ["might", "may"],
      explanation: "Gunakan “might” atau “may” untuk menyatakan kemungkinan yang belum pasti.",
    },
    {
      key: "possibility-late",
      rule: "Kemungkinan · might / may",
      hintDetail: "Kemungkinan karena jalanan macet (belum pasti).",
      cue: "might / must / should",
      prompt: "The traffic is heavy, so I ___ arrive a little late.",
      answer: "might",
      accepted: ["might", "may"],
      explanation: "Gunakan “might” atau “may” ketika sesuatu mungkin terjadi tetapi belum pasti.",
    },
    {
      key: "possibility-asleep",
      rule: "Kemungkinan · might / may",
      hintDetail: "Perkiraan yang belum pasti karena lampu rumah sudah mati.",
      cue: "might / should / can",
      prompt: "All the lights are off. They ___ be asleep already.",
      answer: "might",
      accepted: ["might", "may", "could"],
      explanation: "Gunakan “might” atau “may” untuk menyatakan tebakan atau kemungkinan saat ini.",
    },
    {
      key: "request-help",
      rule: "Permintaan sopan · could / would",
      hintDetail: "Meminta bantuan dengan sopan.",
      cue: "could / must / should",
      prompt: "___ you help me carry this heavy box, please?",
      answer: "could",
      accepted: ["could", "would", "can"],
      explanation: "Gunakan “Could” atau “Would” (atau “Can”) di awal kalimat tanya untuk meminta bantuan dengan sopan.",
    },
    {
      key: "request-window",
      rule: "Permintaan sopan · could / would",
      hintDetail: "Meminta tolong dengan sopan kepada seseorang.",
      cue: "could / must / should",
      prompt: "___ you please open the window a little?",
      answer: "could",
      accepted: ["could", "would", "can"],
      explanation: "Gunakan “Could” atau “Would” untuk permintaan sopan.",
    },
    {
      key: "permission-borrow",
      rule: "Meminta izin · may / can / could",
      hintDetail: "Meminta izin dengan sopan untuk meminjam pena.",
      cue: "may / must / should",
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
      cue: item.cue,
      prompt: item.prompt,
      hint: `${item.hintDetail} Pilih modal auxiliary yang sesuai berdasarkan makna kalimat.`,
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

  // 12. Conditionals (Zero, First, Second, Third, Mixed)
  const conditionalItems: Array<{
    key: string;
    rule: string;
    context: string;
    cue: string;
    prompt: string;
    answer: string;
    accepted?: string[];
    explanation: string;
  }> = [
    {
      key: "zero-boil",
      rule: "Zero Conditional · fakta ilmiah",
      context: "Fakta umum/ilmiah yang selalu benar (If + Present Simple, Present Simple).",
      cue: "boil",
      prompt: "If you heat water to 100 degrees, it ___.",
      answer: "boils",
      explanation: "Pada Zero Conditional (fakta ilmiah), kedua klausa memakai Present Simple: “it boils”.",
    },
    {
      key: "zero-melt",
      rule: "Zero Conditional · fakta ilmiah",
      context: "Fakta alam yang selalu terjadi (If + Present Simple, Present Simple).",
      cue: "melt",
      prompt: "If ice stays under the hot sun, it ___ quickly.",
      answer: "melts",
      explanation: "Subjek tunggal “it” pada Zero Conditional menggunakan V1+s: “melts”.",
    },
    {
      key: "zero-mix",
      rule: "Zero Conditional · fakta umum",
      context: "Fakta pasti saat mencampur warna (If + Present Simple, Present Simple).",
      cue: "mix",
      prompt: "If you ___ red and blue, you get purple.",
      answer: "mix",
      explanation: "Pada klausa If untuk fakta umum dengan subjek “you”, gunakan Present Simple “mix”.",
    },
    {
      key: "zero-plants",
      rule: "Zero Conditional · fakta ilmiah",
      context: "Fakta biologis (Present Simple + if + Present Simple negatif).",
      cue: "not get",
      prompt: "Plants die if they ___ enough water.",
      answer: "do not get",
      accepted: ["do not get", "don't get"],
      explanation: "Untuk bentuk negatif Present Simple dengan subjek “they”, gunakan “do not get” / “don't get”.",
    },
    {
      key: "first-study",
      rule: "First Conditional · rencana/kemungkinan nyata",
      context: "Kemungkinan nyata di masa depan (If + Present Simple, will + V1).",
      cue: "study",
      prompt: "If I have free time tonight, I ___ English.",
      answer: "will study",
      accepted: ["will study", "'ll study"],
      explanation: "Pada First Conditional, klausa hasil menggunakan “will + V1”: “will study”.",
    },
    {
      key: "first-rain",
      rule: "First Conditional · klausa If",
      context: "Kemungkinan nyata besok (If + Present Simple, will + V1).",
      cue: "rain",
      prompt: "If it ___ tomorrow morning, we will stay at home.",
      answer: "rains",
      explanation: "Hati-hati: klausa “If” pada First Conditional tidak boleh memakai “will”, melainkan Present Simple (“rains”).",
    },
    {
      key: "first-hurry",
      rule: "First Conditional · klausa hasil",
      context: "Peringatan nyata saat ini (If + Present Simple, will + V1).",
      cue: "miss",
      prompt: "If we do not hurry now, we ___ the train.",
      answer: "will miss",
      explanation: "Klausa hasil pada First Conditional memakai “will + V1”: “will miss”.",
    },
    {
      key: "first-ask",
      rule: "First Conditional · klausa If",
      context: "Kemungkinan nyata di masa depan (will + V1 + if + Present Simple).",
      cue: "ask",
      prompt: "She will help you if you ___ her nicely.",
      answer: "ask",
      explanation: "Setelah “if” pada First Conditional, gunakan Present Simple “ask” (bukan will ask).",
    },
    {
      key: "second-money",
      rule: "Second Conditional · pengandaian masa kini",
      context: "Khayalan/pengandaian yang berlawanan dengan kenyataan saat ini (If + Past Simple, would + V1).",
      cue: "buy",
      prompt: "If I had enough money now, I ___ a house.",
      answer: "would buy",
      accepted: ["would buy", "'d buy"],
      explanation: "Klausa If memakai V2 (“had”), sehingga klausa hasil memakai “would + V1”: “would buy”.",
    },
    {
      key: "second-know",
      rule: "Second Conditional · klausa If (V2)",
      context: "Pengandaian saat ini — faktanya saya tidak tahu nomornya (If + Past Simple, would + V1).",
      cue: "know",
      prompt: "If I ___ her phone number, I would call her right now.",
      answer: "knew",
      explanation: "Pada Second Conditional, klausa If menggunakan Past Simple (V2 dari know adalah “knew”).",
    },
    {
      key: "second-were",
      rule: "Second Conditional · If I were you",
      context: "Pengandaian memberi saran (If + Subject + were, would + V1).",
      cue: "be",
      prompt: "If I ___ you, I would accept that job offer.",
      answer: "were",
      accepted: ["were", "was"],
      explanation: "Dalam bahasa Inggris standar untuk pengandaian Second Conditional, semua subjek memakai “were” (“If I were you”).",
    },
    {
      key: "second-read",
      rule: "Second Conditional · klausa hasil",
      context: "Pengandaian saat ini (Subject + would + V1 + if + Past Simple).",
      cue: "read",
      prompt: "He ___ more books if he had more free time.",
      answer: "would read",
      explanation: "Karena klausa If memakai Past Simple (“had”), klausa hasil memakai “would + V1” (“would read”).",
    },
    {
      key: "second-fly",
      rule: "Second Conditional · klausa If (V2)",
      context: "Pengandaian imajiner saat ini (If + Past Simple, would + V1).",
      cue: "have",
      prompt: "If birds did not have wings, they ___ not be able to fly.",
      answer: "would",
      explanation: "Klausa hasil pada Second Conditional menggunakan modal lampau “would”.",
    },
    {
      key: "third-study",
      rule: "Third Conditional · penyesalan masa lalu",
      context: "Kejadian di masa lalu yang sudah terlambat diubah (If + had + V3, would have + V3).",
      cue: "pass",
      prompt: "If I had studied harder, I ___ the exam.",
      answer: "would have passed",
      explanation: "Pada Third Conditional, klausa hasil memakai rumus “would have + V3”: “would have passed”.",
    },
    {
      key: "third-leave",
      rule: "Third Conditional · klausa If (had + V3)",
      context: "Penyesalan masa lalu — faktanya kami berangkat terlambat (If + had + V3, would have + V3).",
      cue: "leave",
      prompt: "If we ___ earlier, we would not have missed the flight.",
      answer: "had left",
      explanation: "Klausa If pada Third Conditional wajib memakai Past Perfect (“had + V3”): “had left”.",
    },
    {
      key: "third-invite",
      rule: "Third Conditional · klausa If (had + V3)",
      context: "Penyesalan masa lalu (would have + V3 + if + had + V3).",
      cue: "invite",
      prompt: "She would have come to the party if you ___ her.",
      answer: "had invited",
      explanation: "Karena klausa utama memakai “would have come”, klausa If memakai “had + V3” (“had invited”).",
    },
    {
      key: "third-rain",
      rule: "Third Conditional · klausa hasil",
      context: "Kejadian masa lalu yang batal karena hujan (If + had + V3, would have + V3).",
      cue: "play",
      prompt: "If it had not rained heavily yesterday, we ___ football outside.",
      answer: "would have played",
      explanation: "Untuk hasil yang batal terjadi di masa lalu (Third Conditional), gunakan “would have + V3”: “would have played”.",
    },
    {
      key: "third-alarm",
      rule: "Third Conditional · klausa If (had + V3)",
      context: "Penyesalan tadi pagi (would have + V3 + if + had + V3).",
      cue: "set",
      prompt: "I would have woken up on time if I ___ my alarm last night.",
      answer: "had set",
      explanation: "Gunakan Past Perfect “had set” pada klausa If untuk pengandaian masa lampau.",
    },
    {
      key: "mixed-sleep",
      rule: "Mixed Conditional · sebab lampau, akibat sekarang",
      context: "Penyebab di masa lalu (last night), tetapi hasilnya dirasakan SEKARANG (right now).",
      cue: "not be",
      prompt: "If I had slept earlier last night, I ___ so tired right now.",
      answer: "would not be",
      accepted: ["would not be", "wouldn't be"],
      explanation: "Ini Mixed Conditional: karena ada penanda “right now”, hasilnya memakai “would + V1” (“would not be”), bukan would have been.",
    },
    {
      key: "mixed-map",
      rule: "Mixed Conditional · sebab lampau, akibat sekarang",
      context: "Penyebab terjadi kemarin (yesterday), akibatnya kami tersesat sekarang (now).",
      cue: "bring",
      prompt: "If we ___ the map yesterday, we would not be lost now.",
      answer: "had brought",
      explanation: "Penyebab di masa lampau (“yesterday”) tetap memakai Past Perfect “had brought”.",
    },
  ];
  for (const item of conditionalItems) {
    add({
      id: `cond-${item.key}`,
      topic: "conditionals",
      rule: item.rule,
      cue: item.cue,
      prompt: item.prompt,
      hint: `${item.context} Ingat rumus Conditional: Zero (V1, V1), Type 1 (V1, will + V1), Type 2 (V2/were, would + V1), Type 3 (had + V3, would have + V3), Mixed (had + V3, would + V1 now).`,
      answer: item.answer,
      acceptedAnswers: item.accepted,
      explanation: item.explanation,
    });
  }

  // 13. Collocations (Natural Word Combinations)
  const collocationItems: Array<{
    key: string;
    rule: string;
    cue: string;
    prompt: string;
    answer: string;
    accepted?: string[];
    explanation: string;
  }> = [
    {
      key: "give-feedback",
      rule: "Collocation · give feedback",
      cue: "give / make / do",
      prompt: "The manager promised to ___ constructive feedback after our presentation.",
      answer: "give",
      explanation: "Pasangan kata alami (collocation) untuk “feedback” adalah “give feedback” (bukan make/do feedback).",
    },
    {
      key: "make-decision",
      rule: "Collocation · make a decision",
      cue: "make / do / take",
      prompt: "We need to ___ a final decision before Friday.",
      answer: "make",
      explanation: "Dalam bahasa Inggris alami, gunakan “make a decision” (membuat keputusan).",
    },
    {
      key: "make-progress",
      rule: "Collocation · make progress",
      cue: "make / do / get",
      prompt: "You will ___ great progress if you practice speaking every day.",
      answer: "make",
      explanation: "Pasangan kata alami untuk kemajuan adalah “make progress” (bukan do progress).",
    },
    {
      key: "pay-attention",
      rule: "Collocation · pay attention",
      cue: "pay / give / take",
      prompt: "Please ___ attention to the safety instructions.",
      answer: "pay",
      explanation: "Ungkapan baku untuk memperhatikan adalah “pay attention (to)”.",
    },
    {
      key: "gain-experience",
      rule: "Collocation · gain experience",
      cue: "gain / make / do",
      prompt: "Internships help students ___ valuable work experience.",
      answer: "gain",
      accepted: ["gain", "get"],
      explanation: "Pasangan kata alami untuk memperoleh pengalaman adalah “gain experience” (atau get experience).",
    },
    {
      key: "take-responsibility",
      rule: "Collocation · take responsibility",
      cue: "take / make / do",
      prompt: "A good leader must ___ responsibility for the team's results.",
      answer: "take",
      explanation: "Ungkapan alami untuk memikul tanggung jawab adalah “take responsibility”.",
    },
    {
      key: "make-mistake",
      rule: "Collocation · make a mistake",
      cue: "make / do / take",
      prompt: "Don't be afraid to ___ mistakes when learning a new language.",
      answer: "make",
      explanation: "Untuk melakukan kesalahan, selalu gunakan “make a mistake / make mistakes” (bukan do mistakes).",
    },
    {
      key: "do-homework",
      rule: "Collocation · do homework/assignments",
      cue: "done / made / taken",
      prompt: "Have you ___ your English assignment yet?",
      answer: "done",
      explanation: "Untuk tugas atau pekerjaan rumah (homework/assignment), gunakan kata kerja “do” (V3: “done”).",
    },
    {
      key: "do-favor",
      rule: "Collocation · do someone a favor",
      cue: "do / make / give",
      prompt: "Could you please ___ me a small favor?",
      answer: "do",
      explanation: "Ungkapan meminta bantuan adalah “do someone a favor” (bukan make a favor).",
    },
    {
      key: "do-best",
      rule: "Collocation · do your best",
      cue: "do / make / give",
      prompt: "Just ___ your best in the interview tomorrow.",
      answer: "do",
      explanation: "Ungkapan melakukan yang terbaik adalah “do your best”.",
    },
    {
      key: "make-effort",
      rule: "Collocation · make an effort",
      cue: "makes / does / takes",
      prompt: "She always ___ an effort to speak English at the office.",
      answer: "makes",
      explanation: "Pasangan kata untuk berusaha adalah “make an effort” (subjek She → “makes”).",
    },
    {
      key: "take-break",
      rule: "Collocation · take a break",
      cue: "take / make / do",
      prompt: "You have worked for four hours; let's ___ a short break.",
      answer: "take",
      explanation: "Untuk beristirahat sejenak, gunakan “take a break”.",
    },
    {
      key: "take-notes",
      rule: "Collocation · take notes",
      cue: "take / make / do",
      prompt: "Students should ___ notes during the lecture.",
      answer: "take",
      accepted: ["take", "make"],
      explanation: "Ungkapan paling umum untuk mencatat saat kuliah/rapat adalah “take notes”.",
    },
    {
      key: "take-risk",
      rule: "Collocation · take a risk",
      cue: "take / make / do",
      prompt: "Successful entrepreneurs are willing to ___ calculated risks.",
      answer: "take",
      explanation: "Pasangan kata alami untuk mengambil risiko adalah “take a risk / take risks”.",
    },
    {
      key: "keep-promise",
      rule: "Collocation · keep a promise",
      cue: "keep / hold / make",
      prompt: "You should always ___ your promise to your friends.",
      answer: "keep",
      explanation: "Untuk menepati janji, gunakan “keep a promise” (bukan hold a promise).",
    },
    {
      key: "catch-cold",
      rule: "Collocation · catch a cold",
      cue: "catch / take / make",
      prompt: "Wear a warm jacket so you don't ___ a cold.",
      answer: "catch",
      accepted: ["catch", "get"],
      explanation: "Ungkapan alami untuk terkena flu/masuk angin adalah “catch a cold”.",
    },
    {
      key: "save-time",
      rule: "Collocation · save time",
      cue: "save / keep / spend",
      prompt: "Using keyboard shortcuts will ___ you a lot of time.",
      answer: "save",
      explanation: "Untuk menghemat waktu, gunakan “save time” (bukan keep time).",
    },
    {
      key: "break-habit",
      rule: "Collocation · break a habit",
      cue: "break / stop / lose",
      prompt: "It is hard to ___ a bad habit without daily discipline.",
      answer: "break",
      explanation: "Pasangan kata alami untuk menghentikan kebiasaan buruk adalah “break a habit”.",
    },
    {
      key: "reach-goal",
      rule: "Collocation · reach/achieve a goal",
      cue: "reach / arrive / get",
      prompt: "Consistent daily practice will help you ___ your fluency goal.",
      answer: "reach",
      accepted: ["reach", "achieve"],
      explanation: "Gunakan “reach a goal” atau “achieve a goal” untuk mencapai tujuan.",
    },
    {
      key: "meet-deadline",
      rule: "Collocation · meet a deadline",
      cue: "meet / catch / do",
      prompt: "Our developers worked hard to ___ the project deadline.",
      answer: "meet",
      explanation: "Ungkapan bisnis baku untuk memenuhi tenggat waktu adalah “meet a deadline”.",
    },
  ];
  for (const item of collocationItems) {
    add({
      id: `colloc-${item.key}`,
      topic: "collocations",
      rule: item.rule,
      cue: item.cue,
      prompt: item.prompt,
      hint: "Pilih kata kerja yang membentuk pasangan kata alami (natural collocation) dengan kata benda sesudahnya.",
      answer: item.answer,
      acceptedAnswers: item.accepted,
      explanation: item.explanation,
    });
  }

  const foundationQuestions: BasicsQuestion[] = [
    { id: "foundation-agreement-everyone", topic: "plurals", rule: "Subject–verb agreement", prompt: "Everyone in the class ___ ready.", cue: "is / are", answer: "is", hint: "Everyone adalah subjek tunggal. Pilih bentuk be yang sesuai.", explanation: "Everyone diperlakukan sebagai subjek tunggal, sehingga memakai is." },
    { id: "foundation-agreement-students", topic: "plurals", rule: "Subject–verb agreement", prompt: "The students in the classroom ___ ready.", cue: "is / are", answer: "are", hint: "Cari kata inti subjek sebelum memilih bentuk be.", explanation: "Kata inti subjek adalah students, yang jamak, sehingga memakai are." },
    { id: "foundation-agreement-basket", topic: "plurals", rule: "Subject–verb agreement", prompt: "The basket of apples ___ on the table.", cue: "is / are", answer: "is", hint: "Cari benda utama yang dibicarakan, bukan kata benda setelah of.", explanation: "Kata inti subjek adalah basket yang tunggal, sehingga memakai is." },
    { id: "foundation-agreement-works", topic: "plurals", rule: "Subject–verb agreement", prompt: "My sister ___ at a hospital.", cue: "work / works", answer: "works", hint: "Subjek tunggal orang ketiga memerlukan bentuk present simple yang sesuai.", explanation: "My sister adalah subjek tunggal orang ketiga, sehingga work menjadi works." },
    { id: "foundation-count-books", topic: "quantifiers", rule: "Countable nouns", prompt: "There are three ___ on the shelf.", cue: "book / books", answer: "books", hint: "Book dapat dihitung dan jumlahnya lebih dari satu.", explanation: "Book dapat dihitung. Setelah three gunakan bentuk jamak books." },
    { id: "foundation-count-water", topic: "quantifiers", rule: "Uncountable nouns", prompt: "Please give me a glass of ___.", cue: "water / waters", answer: "water", hint: "Water biasanya tidak dihitung langsung. Glass menyatakan satuannya.", explanation: "Water biasanya uncountable. Jumlahnya dapat dinyatakan dengan satuan a glass of water." },
    { id: "foundation-count-advice", topic: "quantifiers", rule: "Uncountable nouns", prompt: "She gave me a piece of ___.", cue: "advice / advices", answer: "advice", hint: "Advice adalah uncountable noun. Piece menyatakan satuannya.", explanation: "Advice tidak memakai bentuk jamak advices. Gunakan a piece of advice." },
    { id: "foundation-frequency-verb", topic: "adjectives", rule: "Adverbs of frequency", prompt: "She ___ breakfast before work.", cue: "usually eats / eats usually", answer: "usually eats", hint: "Usually umumnya diletakkan sebelum kata kerja utama.", explanation: "Usually biasanya berada sebelum kata kerja utama eats." },
    { id: "foundation-frequency-be", topic: "adjectives", rule: "Adverbs of frequency", prompt: "He ___ for class.", cue: "is always / always is", answer: "is always", hint: "Always umumnya diletakkan setelah bentuk be.", explanation: "Always biasanya diletakkan setelah kata kerja be, seperti is always." },
    { id: "foundation-frequency-aux", topic: "adjectives", rule: "Adverbs of frequency", prompt: "They have ___ finished their work on time.", cue: "often / oftens", answer: "often", hint: "Pilih bentuk adverb yang tepat setelah kata bantu have.", explanation: "Often tidak berubah mengikuti subjek dan dapat berada setelah kata bantu have." },
    { id: "foundation-possessive-singular", topic: "pronouns", rule: "Possessive nouns", prompt: "This is ___ book.", cue: "Rina's / Rinas", answer: "Rina's", acceptedAnswers: ["Rina's", "Rina’s"], hint: "Tambahkan apostrof dan s pada nama pemilik tunggal.", explanation: "Tambahkan 's pada Rina untuk menunjukkan bahwa buku itu miliknya." },
    { id: "foundation-possessive-plural", topic: "pronouns", rule: "Possessive nouns", prompt: "The ___ room is next to the library.", context: "Ruangan ini milik beberapa siswa.", cue: "students' / student's", answer: "students'", acceptedAnswers: ["students'", "students’"], hint: "Ruangan ini milik beberapa students. Letakkan apostrof setelah s jamak.", explanation: "Untuk pemilik jamak berakhiran s, tambahkan apostrof setelah s: students'." },
    { id: "foundation-possessive-irregular", topic: "pronouns", rule: "Possessive nouns", prompt: "The ___ toys are in the box.", cue: "children's / childrens'", answer: "children's", acceptedAnswers: ["children's", "children’s"], hint: "Children sudah jamak dan tidak berakhir dengan s.", explanation: "Children adalah bentuk jamak tidak beraturan, sehingga bentuk kepemilikannya children's." },
  ];
  foundationQuestions.forEach(add);

  for (const lesson of TOPIC_WRITING_LESSONS) {
    add({
      id: lesson.id, skillId: `writing_${lesson.topic}`, topic: lesson.topic,
      rule: BASICS_LABELS[lesson.topic], prompt: lesson.prompt,
      context: lesson.context, cue: lesson.cue,
      answer: lesson.answer, acceptedAnswers: lesson.acceptedAnswers,
      hint: lesson.hint ?? "Perhatikan kata di sekitar bagian kosong dan makna kalimatnya. Buka panduan topik jika perlu.",
      explanation: lesson.explanation,
    });
  }
  return pool;
}

export const BASICS_POOL = buildQuestionPool();

/** Shuffle a complete cycle, without repeating its last item at the next boundary. */
export function createDeck(filter: BasicsFilter, previousId?: string): BasicsQuestion[] {
  const deck = BASICS_POOL.filter((q) => filter === "all" || q.topic === filter || q.skillId === filter);
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
  if (q.id.startsWith("foundation-")) return q.hint;
  if (q.skillId === `writing_${q.topic}`) return q.explanation;
  const word = input.trim().toLowerCase().replace(/\s+/g, " ");
  if (q.topic === "articles") {
    if (word === "the") return "The menunjuk sesuatu yang sudah spesifik/dapat diidentifikasi. Periksa apakah konteks ini menyebut sesuatu secara umum.";
    if (word === NO_WORD || word === "-" || word === "none") return "Bagian ini membutuhkan artikel (a / an / the). Periksa konteks dan bunyi awal kata berikutnya.";
    if (word === "a" || word === "an") return "A/an digunakan untuk kata benda tunggal yang dapat dihitung. Pilih berdasarkan konteks dan bunyi awal (vokal vs konsonan), bukan hanya huruf.";
    return "Ketik a, an, the, atau - jika tidak memerlukan artikel.";
  }
  if (q.topic === "prepositions") {
    if (q.answer === "for" && word === "since") return "Setelah bagian kosong adalah rentang/durasi waktu (berapa lama), jadi gunakan “for”, bukan “since”.";
    if (q.answer === "since" && word === "for") return "Setelah bagian kosong adalah titik awal waktu (sejak kapan), jadi gunakan “since”, bukan “for”.";
    return `Pilihan ${word === NO_WORD || word === "-" || word === "none" ? "tanpa preposisi" : `“${word}”`} belum sesuai dengan keterangan waktu, posisi, atau pasangan kata pada konteks ini.`;
  }
  if (q.topic === "habits") {
    if (q.answer === "used to" && word === "am used to") return "Diikuti V1 murni (kebiasaan masa lalu yang sudah berhenti): gunakan “used to”, bukan “am used to”.";
    if (q.answer === "am used to" && word === "used to") return "Diikuti V-ing dan bermakna “sudah terbiasa sekarang”: gunakan “am used to”, bukan “used to”.";
    return `Pilihan “${input.trim()}” belum sesuai. Perhatikan apakah kata kerja sesudahnya berbentuk V1 (used to) atau V-ing (be used to).`;
  }
  if (q.topic === "conditionals") {
    if (q.prompt.startsWith("If ") && q.prompt.indexOf("___") < q.prompt.indexOf(",") && (word.startsWith("will ") || word.startsWith("would "))) {
      return "Di dalam anak kalimat “If ...”, jangan gunakan “will” atau “would”. Gunakan tense kondisinya (“" + q.answer + "”).";
    }
    if (q.answer.startsWith("would have ") && word.startsWith("would ") && !word.startsWith("would have ")) {
      return `Ini Third Conditional (penyesalan masa lalu dengan “had + V3”): gunakan “${q.answer}”, bukan “${word}”.`;
    }
    if (q.answer === "would not be" && word.includes("have been")) {
      return "Perhatikan kata “right now” di ujung kalimat (Mixed Conditional — akibat dirasakan sekarang): gunakan “would not be”.";
    }
    return `Bentuk “${input.trim()}” belum sesuai dengan tipe Conditional pada kalimat ini. Periksa klausa pasangan di sebelahnya.`;
  }
  if (q.topic === "collocations") {
    return `Dalam bahasa Inggris alami, kata benda pada kalimat ini tidak berpasangan dengan “${input.trim()}”, melainkan “${q.answer}” (${q.rule.replace("Collocation · ", "")}).`;
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
    if (q.answer === "could" && word === "can" && q.rule.includes("masa lalu")) return "Konteks kalimat ini berada di masa lalu: gunakan bentuk lampau “could”, bukan “can”.";
    if (q.answer === "can" && word === "could") return "Konteks ini menyatakan kemampuan saat ini (fakta sekarang): gunakan “can”.";
    return `Modal “${input.trim()}” belum sesuai dengan makna pada konteks ini (${q.rule.toLowerCase()}).`;
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

export interface BasicsTopicGuide {
  summary: string;
  rules: Array<{ label: string; detail: string }>;
  examples: string[];
}

export const BASICS_TOPIC_GUIDES: Record<BasicsTopic, BasicsTopicGuide> = {
  articles: {
    summary: "Articles (a, an, the, atau tanpa artikel) menentukan apakah suatu kata benda bersifat umum (belum spesifik) atau sudah spesifik/diketahui bersama.",
    rules: [
      { label: "a + bunyi konsonan", detail: "Untuk 1 benda umum yang diawali bunyi konsonan (a doctor, a university)." },
      { label: "an + bunyi vokal", detail: "Untuk 1 benda umum yang diawali bunyi vokal a/i/u/e/o (an engineer, an honest person)." },
      { label: "the (spesifik / unik)", detail: "Untuk benda yang sudah disebut sebelumnya, spesifik, atau hanya ada satu (the sun, the book I bought)." },
      { label: "Tanpa artikel (-)", detail: "Untuk nama bahasa, olahraga, atau kata benda jamak/uncountable secara umum (speak English, Cats need water)." },
    ],
    examples: [
      "Rina is an engineer at a technology company.",
      "I bought a book yesterday. The book is very interesting.",
      "The sun rises in the east.",
      "We speak English at the office.",
    ],
  },
  prepositions: {
    summary: "Prepositions (kata depan) menghubungkan waktu, tempat/posisi, arah, maupun pasangan kata sifat dan kata kerja tertentu.",
    rules: [
      { label: "in / on / at (Waktu)", detail: "in = bulan/tahun (in July, in 2024) · on = hari/tanggal (on Monday) · at = jam/titik waktu (at 7 a.m., at noon)." },
      { label: "in / on / at (Tempat)", detail: "in = di dalam ruang/wadah (in the box) · on = menempel di permukaan (on the table) · at = titik spesifik (at the bus stop)." },
      { label: "for vs since", detail: "for + durasi waktu (for three hours) · since + titik awal waktu (since Monday / since 2022)." },
      { label: "Pasangan tetap (adjective/verb + preposition)", detail: "interested in, good at, afraid of, responsible for, wait for, listen to, talk about, look at." },
      { label: "Verb + preposition dalam pertanyaan", detail: "wait for, listen to, talk about, look at, shop for. Saat objek preposisi ditanyakan, preposisi sering berada di akhir: Who are you waiting for? Bentuk formal For whom are you waiting? juga benar." },
    ],
    examples: [
      "The meeting is on Monday at 9 a.m.",
      "She has lived in Jakarta since 2022 (for four years).",
      "He is very good at solving problems.",
      "Who are you waiting for?",
    ],
  },
  habits: {
    summary: "“Used to” dan “be used to” sama-sama tentang kebiasaan, tetapi berbeda makna dan tata bahasa. Perhatikan bentuk kata kerja yang mengikutinya.",
    rules: [
      { label: "used to + V1", detail: "Kebiasaan atau keadaan di masa lalu yang sekarang sudah tidak terjadi lagi. Diikuti kata kerja dasar (V1): I used to smoke. · She used to live in Bali." },
      { label: "be used to + V-ing / kata benda", detail: "Berarti “sudah terbiasa (dengan)” sekarang. “be” menyesuaikan subjek (am/is/are/was), diikuti V-ing atau kata benda: I am used to waking up early. · He is used to the noise." },
      { label: "Bentuk negatif & tanya (used to)", detail: "Masa lalu: didn't use to + V1 (I didn't use to like coffee) dan Did you use to …? (perhatikan “use”, bukan “used”)." },
    ],
    examples: [
      "I used to wake up late, but now I am used to waking up early.",
      "She used to live in a village when she was a child.",
      "After three months here, he is used to driving on the left.",
      "Did you use to play football at school?",
    ],
  },
  questions: {
    summary: "Pertanyaan memakai kata bantu dan kata tanya untuk meminta informasi.",
    rules: [
      { label: "Yes/No dan Wh-", detail: "Letakkan kata bantu sebelum subjek: Does she work? Where does she work? Setelah do, does, dan did gunakan kata kerja dasar." },
      { label: "Be dan modal", detail: "Letakkan be atau modal sebelum subjek: Are they ready? What can you do?" },
      { label: "Who sebagai subjek", detail: "Who called you? menanyakan pelaku. Who did you call? menanyakan orang yang dihubungi." },
      { label: "Preposisi dan jumlah", detail: "Who are you waiting for? How many books? How much water?" },
      { label: "Indirect question", detail: "Setelah Could you tell me, gunakan urutan pernyataan: where she works." },
    ],
    examples: ["Where did she go?", "Who called you?", "What are you listening to?", "Could you tell me where she works?"],
  },
  plurals: {
    summary: "Singular & Plural mengatur perubahan kata benda dari tunggal (satu) menjadi jamak (lebih dari satu).",
    rules: [
      { label: "Subject–verb agreement", detail: "Kata kerja mengikuti kata inti subjek. Everyone is ready dan the students are ready. Dalam the basket of apples is, basket adalah inti subjek. Pada present simple, she works memakai -s." },
      { label: "Reguler (+s / +es)", detail: "Umumnya ditambah -s (books, desks). Kata berakhiran -s, -x, -ch, -sh ditambah -es (boxes, buses)." },
      { label: "Akhiran huruf -y", detail: "Konsonan + y berubah menjadi -ies (baby → babies). Vokal + y cukup ditambah -s (toy → toys)." },
      { label: "Irregular (Tidak beraturan)", detail: "Berubah bentuk atau tetap sama: child → children, person → people, mouse → mice, sheep → sheep." },
    ],
    examples: [
      "There is one book on the desk, and there are three boxes on the floor.",
      "Two children are playing with their toys.",
      "Five people are waiting at the bus stop.",
    ],
  },
  pronouns: {
    summary: "Pronouns & Possessives menggantikan kata benda sesuai posisinya (subjek, objek, kepemilikan, atau diri sendiri).",
    rules: [
      { label: "Possessive nouns", detail: "Tambahkan 's pada pemilik tunggal (Rina's book). Untuk bentuk jamak berakhiran s, tambahkan apostrof setelah s (students' room). Bentuk jamak tidak beraturan memakai 's (children's toys)." },
      { label: "Subject vs Object", detail: "Subjek di awal sebelum kata kerja (I, she, they). Objek setelah kata kerja/preposisi (me, her, them)." },
      { label: "Possessive Adjective", detail: "Wajib diikuti kata benda: my, your, his, her, our, their (my bag, her laptop)." },
      { label: "Possessive Pronoun", detail: "Berdiri sendiri tanpa kata benda sesudahnya: mine, yours, his, hers, ours, theirs (This bag is mine)." },
      { label: "Reflexive (-self/-selves)", detail: "Ketika subjek dan objek adalah orang yang sama (myself, himself, themselves)." },
    ],
    examples: [
      "She called me yesterday to borrow my notebook.",
      "This umbrella is hers, and that one is mine.",
      "He taught himself how to play the guitar.",
    ],
  },
  quantifiers: {
    summary: "Quantifiers menyatakan jumlah atau kuantitas benda berdasarkan apakah benda tersebut dapat dihitung (countable) atau tidak (uncountable).",
    rules: [
      { label: "Countable vs uncountable nouns", detail: "Countable nouns dapat dihitung: one book, three books. Uncountable nouns seperti water dan advice biasanya memakai satuan: a glass of water, a piece of advice." },
      { label: "many vs much", detail: "many + benda jamak dapat dihitung (many books) · much + benda tak dapat dihitung (much water, much time, much money)." },
      { label: "a few vs a little", detail: "a few = beberapa (+ countable jamak: a few minutes) · a little = sedikit (+ uncountable: a little sugar, a little patience)." },
      { label: "some vs any", detail: "some untuk kalimat positif & tawaran sopan (Would you like some tea?) · any untuk kalimat negatif & tanya (don't have any bread)." },
    ],
    examples: [
      "How much money and how many books did you bring?",
      "I only need a few minutes and a little rest.",
      "There is some milk in the fridge, but we don't have any bread.",
    ],
  },
  comparatives: {
    summary: "Comparatives membandingkan dua hal (lebih ... daripada), sedangkan Superlatives menyatakan yang paling ... di antara banyak hal.",
    rules: [
      { label: "Comparative (... than)", detail: "Kata pendek ditambah -er (taller, heavier). Kata panjang (2–3+ suku kata) memakai more (more expensive, more interesting)." },
      { label: "Superlative (the ...)", detail: "Kata pendek ditambah -est (the tallest, the fastest). Kata panjang memakai most (the most important)." },
      { label: "Irregular (Tidak beraturan)", detail: "good → better → the best · bad → worse → the worst · far → farther/further → the farthest/furthest." },
    ],
    examples: [
      "This laptop is more expensive than my old one, but it is faster.",
      "Mount Everest is the highest mountain in the world.",
      "Maya is the best chess player in our school.",
    ],
  },
  adjectives: {
    summary: "Adjectives menerangkan kata benda (atau kondisi subjek), sedangkan Adverbs menerangkan cara suatu kata kerja dilakukan.",
    rules: [
      { label: "Posisi adverbs of frequency", detail: "Usually dan always umumnya berada sebelum kata kerja utama (she usually eats), setelah be (he is always late), atau setelah kata bantu pertama (they have often finished early)." },
      { label: "Adjective vs Adverb (-ly)", detail: "Adjective menerangkan benda/linking verb (quick, careful). Adverb menerangkan kata kerja aksi, umumnya +ly (quickly, carefully)." },
      { label: "Irregular Adverb", detail: "good → well (speak English well) · fast → fast · hard → hard (work hard; hati-hati: hardly = hampir tidak)." },
      { label: "Adjective -ed vs -ing", detail: "-ed menggambarkan perasaan orang (bored, tired, interested) · -ing menggambarkan sifat penyebabnya (boring movie, tiring day)." },
    ],
    examples: [
      "She is a fluent speaker and she speaks English fluently.",
      "He worked very hard and performed well in the interview.",
      "The long meeting was exhausting, so everyone felt exhausted.",
    ],
  },
  gerunds: {
    summary: "Perhatikan posisi kegiatan dalam kalimat. Bentuk -ing dapat mengisi posisi subjek atau mengikuti preposisi. Bentuk to + V1 dapat menjelaskan tugas, tujuan, atau kata sifat. Setelah beberapa kata kerja, pilihan bentuk juga menentukan makna.",
    rules: [
      { label: "Gerund sebagai subjek atau setelah preposisi", detail: "Swimming is healthy memakai swimming sebagai subjek. Setelah for, perhatikan apa yang disebut. For the team menyebut kelompok, for them memakai kata ganti, dan responsible for ensuring the data is accurate menyebut kegiatan." },
      { label: "Verb + Gerund (V-ing)", detail: "Kata kerja yang wajib diikuti V-ing: enjoy, finish, avoid, mind, keep, suggest (enjoy reading, finish working)." },
      { label: "Verb + To-Infinitive (to + V1)", detail: "Kata kerja yang diikuti to + V1: want, decide, plan, hope, promise, agree, need (decide to buy, plan to visit)." },
      { label: "Tugas atau tujuan + be + to V1", detail: "Dalam My responsibility was to ensure the data was accurate, to ensure menjelaskan isi tanggung jawab saya. Pola yang sama muncul dalam My job is to build websites dan My goal is to finish the course." },
      { label: "Adjective + to V1", detail: "Happy to help menyatakan kesediaan. This guide is easy to follow menjelaskan tingkat kesulitan mengikuti panduan. It is important to check the data menyatakan pentingnya tindakan itu." },
      { label: "Stop, remember, try", detail: "Stop talking berarti mengakhiri pembicaraan. Stop to talk berarti menjeda kegiatan lain untuk berbicara. Remember locking berarti ingat pernah mengunci. Remember to lock berarti ingat untuk mengunci. Try restarting mengusulkan solusi. Try to restart menyatakan upaya." },
    ],
    examples: [
      "Swimming every morning keeps my body fit.",
      "I was responsible for ensuring the data was accurate.",
      "My responsibility was to ensure the data was accurate.",
      "I enjoy learning English, and I have finished reading this chapter.",
      "They decided to move to a bigger office next month.",
    ],
  },
  relatives: {
    summary: "Relative Clauses (who, which, that, whose, where) menggabungkan dan memperjelas informasi tentang orang, benda, kepemilikan, atau tempat.",
    rules: [
      { label: "who (Orang)", detail: "Menjelaskan manusia sebagai subjek/objek klausa (The doctor who treated me)." },
      { label: "which dan that untuk benda", detail: "Dalam the book that I bought, that juga dapat diganti dengan which. Untuk memberi informasi tambahan di antara koma, gunakan which jika kata penghubungnya ditulis." },
      { label: "whose (Kepemilikan) & where (Tempat)", detail: "whose + benda milik (the student whose laptop was lost) · where untuk tempat terjadinya aksi (the cafe where we met)." },
    ],
    examples: [
      "The woman who called you earlier is our new project manager.",
      "My laptop, which I bought three years ago, still works well.",
      "This is the quiet cafe where I usually study on weekends.",
    ],
  },
  modals: {
    summary: "Modals (can, could, should, must, might, may, would) adalah kata kerja bantu yang menambahkan makna kemampuan, saran, kewajiban, larangan, atau kemungkinan. Semua modal wajib diikuti V1 murni (tanpa to).",
    rules: [
      { label: "can vs could (Kemampuan & Permintaan)", detail: "can = kemampuan saat ini · could = kemampuan masa lalu (when I was young) atau permintaan sopan (Could you help me?)." },
      { label: "should / should not (Saran)", detail: "Digunakan untuk memberi nasihat atau anjuran yang baik (You should take a rest)." },
      { label: "must vs must not (Kewajiban & Larangan)", detail: "must = aturan/keharusan wajib · must not / cannot = larangan keras (Visitors must not smoke)." },
      { label: "might / may (Kemungkinan)", detail: "Menyatakan kemungkinan yang belum pasti terjadi (It might rain later)." },
    ],
    examples: [
      "She can speak three languages, and she could read when she was four.",
      "You look tired; you should get some sleep.",
      "Passengers must wear a seatbelt and must not smoke on the plane.",
      "Take an umbrella because it might rain this evening.",
    ],
  },
  conjunctions: {
    summary: "Conjunctions (kata penghubung) menyambungkan dua klausa berdasarkan hubungan logika: pertentangan, sebab-akibat, syarat, atau waktu.",
    rules: [
      { label: "Pertentangan: but vs although", detail: "but menghubungkan dua klausa setara setelah koma · although / even though berada di awal anak kalimat pertentangan." },
      { label: "Sebab & Akibat: because vs so", detail: "because + alasan/penyebab · so + hasil/akibat setelah koma." },
      { label: "Syarat: if vs unless", detail: "if = jika · unless = kecuali jika / jika tidak (if ... not)." },
      { label: "Waktu: while vs until", detail: "while = sementara/ketika dua aksi berlangsung bersamaan · until = sampai batas waktu tertentu." },
    ],
    examples: [
      "Although it was raining heavily, they continued the match.",
      "The restaurant was full, so we cooked dinner at home.",
      "You will miss the morning train unless you leave right now.",
    ],
  },
  conditionals: {
    summary: "Conditionals (Kalimat Pengandaian If) menyatakan hubungan syarat (If...) dan hasil berdasarkan tingkat kemungkinannya (fakta, rencana nyata, khayalan masa kini, atau penyesalan masa lalu).",
    rules: [
      { label: "Zero Conditional (Fakta Ilmiah)", detail: "If + Present Simple (V1), Present Simple (V1) — selalu benar setiap saat." },
      { label: "First Conditional (Kemungkinan Nyata)", detail: "If + Present Simple (V1), will + V1 — mungkin terjadi di masa depan (jangan pakai will di klausa If!)." },
      { label: "Second Conditional (Pengandaian Masa Kini)", detail: "If + Past Simple (V2 / were), would + V1 — berlawanan dengan kenyataan sekarang." },
      { label: "Third & Mixed Conditional (Masa Lalu)", detail: "Type 3: If + had + V3, would have + V3 (penyesalan masa lalu). Mixed: If + had + V3, would + V1 now (sebab lampau, akibat sekarang)." },
    ],
    examples: [
      "Zero: If you heat water to 100 degrees, it boils.",
      "Type 1: If I have time tonight, I will study English.",
      "Type 2: If I had enough money now, I would buy a house.",
      "Type 3: If I had studied harder, I would have passed the exam.",
    ],
  },
  collocations: {
    summary: "Pelajari kata yang sering muncul bersama dan potongan kalimat yang bisa dipakai kembali. Saat menemukan get, have, take, atau go, lihat kata sesudahnya untuk memahami makna seluruh ungkapan.",
    rules: [
      { label: "make + hasil / keputusan / kemajuan", detail: "make a decision, make progress, make a mistake, make an effort." },
      { label: "do + tugas / aktivitas / bantuan", detail: "do homework, do an assignment, do your best, do someone a favor." },
      { label: "take + tindakan / jeda / tanggung jawab", detail: "take responsibility, take a break, take notes, take a risk." },
      { label: "Ungkapan penting lainnya", detail: "give feedback, pay attention, gain experience, keep a promise, meet a deadline, break a habit, save time." },
      { label: "Chunks untuk merespons", detail: "It depends on the weather menyebut faktor penentu. Would you mind closing the door? meminta bantuan dengan sopan. Ganti kegiatan setelah mind untuk membuat permintaan baru." },
      { label: "Common Verbs in Context · get", detail: "Get tired berarti menjadi lelah, get home berarti sampai di rumah, dan I get it berarti saya paham. Dalam I got a ticket at the station, get bisa berarti memperoleh atau membeli." },
      { label: "Common Verbs in Context · have, take, go", detail: "Pada have a chat dan take a look, kata benda menyebut tindakan utamanya. Go for a walk berarti pergi berjalan kaki. Pelajari seluruh frasa agar bisa memakainya dalam situasi baru." },
    ],
    examples: [
      "You will make great progress if you practice every day.",
      "Our team worked hard to meet the project deadline.",
      "Please pay attention and take notes during the presentation.",
    ],
  },
  phrasalVerbs: {
    summary: "Pelajari ungkapan percakapan sebagai satu kesatuan. Perhatikan maknanya serta posisi benda atau orang yang dibicarakan.",
    rules: [
      { label: "Figure out dan find out", detail: "Figure out berarti menemukan jawaban lewat pemikiran. Find out berarti memperoleh informasi. Dengan figure out, kata benda bisa di tengah atau di akhir (figure the answer out, figure out the answer). Kata ganti berada di tengah (figure it out)." },
      { label: "Run out of + benda", detail: "We ran out of milk berarti persediaan susu habis. Seluruh rangkaian run out of mendahului bendanya. Dengan kata ganti, gunakan run out of it." },
      { label: "Go ahead", detail: "Saat seseorang meminta izin, Go ahead berarti silakan. Dalam Go ahead and start, pembicara mempersilakan orang lain untuk mulai." },
      { label: "Be into dan be up to", detail: "I’m into jazz menyatakan minat. What are you up to? menanyakan kegiatan seseorang. Dalam It’s up to you, up to menyatakan siapa yang menentukan pilihan." },
      { label: "Be about to + V1", detail: "The train is about to leave berarti kereta akan segera berangkat. Tindakan itu belum dimulai." },
    ],
    examples: ["I figured it out on the bus.", "We ran out of milk this morning.", "What are you up to this weekend?"],
  },
  causatives: {
    summary: "Untuk menceritakan pekerjaan yang dilakukan orang lain, pilih apakah Anda ingin menyebut pelakunya atau benda yang dikerjakan.",
    rules: [
      { label: "Have + orang + V1", detail: "I’ll have IT check the laptop berarti saya akan meminta tim IT memeriksa laptop. Sesudah pelaku, gunakan kata kerja dasar." },
      { label: "Get + orang + to V1", detail: "I’ll get IT to check the laptop menyatakan bahwa saya akan mengusahakan agar tim IT memeriksanya. Setelah orang yang diminta, gunakan to + kata kerja dasar." },
      { label: "Have atau get + benda + V3", detail: "I had my bike repaired dan I got my bike repaired menceritakan perbaikan oleh orang lain. My bike menerima tindakan sehingga repair menjadi repaired." },
      { label: "Make, let, help + orang", detail: "Make me wait menyatakan paksaan dan let me leave menyatakan izin. Keduanya memakai V1 dalam kalimat aktif. Help me carry dan help me to carry sama-sama menyatakan bantuan." },
    ],
    examples: ["I’ll have IT check the laptop.", "I’ll get IT to check the laptop.", "I’ll have the laptop checked."],
  },
};
