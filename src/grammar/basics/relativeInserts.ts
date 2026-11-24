import type { BasicsQuestion } from "./engine";

export const RELATIVE_INSERTS = "relative_inserts";
export const RELATIVE_INSERTS_LABEL = "Sisipan setelah kata benda";

export const phoneExample = "My phone, repaired by Dad, works again.";

const exercises: Omit<BasicsQuestion, "topic" | "rule" | "subtopic">[] = [
  {
    id: "rel-insert-subject",
    reading: { sentence: phoneExample, choices: ["Dad", "My phone"] },
    context: "Apa yang sekarang berfungsi lagi?",
    prompt: "___ works again.",
    answer: "My phone",
    hint: "Lewati bagian di antara dua koma. Apa yang disebut sebelum works again?",
    explanation: "My phone adalah subjek dari works. Dad adalah orang yang memperbaiki ponsel itu.",
  },
  {
    id: "rel-insert-main-verb",
    reading: { sentence: "Our bus, delayed by rain, arrived at noon.", choices: ["delayed", "arrived"] },
    context: "Kata mana yang menyatakan bahwa bus kami tiba?",
    prompt: "Our bus ___ at noon.",
    answer: "arrived",
    hint: "Baca Our bus lalu lanjutkan dari kata setelah koma kedua.",
    explanation: "Our bus arrived at noon berarti bus kami tiba pada tengah hari. Delayed by rain menjelaskan bahwa hujan membuat bus terlambat.",
  },
  {
    id: "rel-insert-referent",
    reading: { sentence: "Dad put my jacket, washed this morning, in the closet.", choices: ["My jacket", "The closet"] },
    context: "Apa yang dicuci tadi pagi?",
    prompt: "___ was washed this morning.",
    answer: "My jacket",
    hint: "Cari benda yang disebut tepat sebelum washed this morning.",
    explanation: "Washed this morning menerangkan my jacket. Ayah menaruh jaket itu di lemari.",
  },
  {
    id: "rel-insert-expand",
    reading: { sentence: "My bike, ___ fixed yesterday, is ready to ride.", choices: ["which did", "which was"] },
    context: "Lengkapi sisipan agar artinya ‘yang diperbaiki kemarin’.",
    prompt: "My bike, ___ fixed yesterday, is ready to ride.",
    answer: "which was",
    hint: "Sepeda menerima tindakan. Untuk bentuk pasif lampau, gunakan be sebelum fixed.",
    explanation: "Which merujuk pada my bike. Which was fixed yesterday berarti ‘yang diperbaiki kemarin’. Dalam bentuk ringkas, cukup tulis fixed yesterday.",
  },
  {
    id: "rel-insert-reduce",
    reading: { sentence: "The bridge, which was built in 1920, still carries trains.", choices: ["building", "built"] },
    context: "Jika ‘which was’ dihilangkan, kata apa yang tetap dipakai sebelum ‘in 1920’?",
    prompt: "The bridge, ___ in 1920, still carries trains.",
    answer: "built",
    hint: "Dalam which was built, kata mana yang menyebut tindakan yang dialami jembatan?",
    explanation: "Which was dapat dihilangkan sehingga tersisa built, bentuk ketiga dari build. Kata kerja utama tetap carries. Tahun 1920 menerangkan pembangunan jembatan.",
  },
  {
    id: "rel-insert-active",
    reading: { sentence: "The bakery, ___ at seven, sells fresh bread.", choices: ["which opens", "opens"] },
    context: "Bagaimana menulis ‘yang buka pukul tujuh’ di dalam sisipan?",
    prompt: "The bakery, ___ at seven, sells fresh bread.",
    answer: "which opens",
    hint: "Opens adalah kata kerja present simple. Kata mana yang menjadi subjeknya di dalam sisipan?",
    explanation: "Which merujuk pada the bakery dan menjadi subjek dari opens. Kalimat intinya adalah The bakery sells fresh bread.",
  },
];

export const relativeInsertQuestions: BasicsQuestion[] = exercises.map(exercise => ({
  ...exercise, topic: "relatives", subtopic: RELATIVE_INSERTS, rule: RELATIVE_INSERTS_LABEL,
}));
