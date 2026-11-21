import { normalize } from "./check/normalize";

export const ARTICLE_WRITING = "a_an_the";
export const knownHint = "Apakah pendengar sudah bisa mengenali benda atau orang yang dimaksud dari kalimat sebelumnya?";
export const soundHint = "Ucapkan kata tepat setelah bagian kosong. Apakah bunyi pertamanya vokal atau konsonan?";

interface ArticleLesson {
  id: string;
  group: "first-mention" | "known";
  basicsContext?: string;
  situation: string;
  cues: string;
  first: string[];
  second: string[];
  explanation: string;
}

// IDs link the writing situations to existing Articles questions.
export const ARTICLE_LESSONS: ArticleLesson[] = [
  {
    id: "article-known-book", group: "known",
    situation: "Kemarin Anda melihat seekor kucing. Kucing itu sedang tidur. Ceritakan kepada teman yang baru mendengarnya.",
    cues: "I · see · cat / cat · sleep",
    first: ["I saw a cat", "Yesterday I saw a cat", "I saw a cat yesterday"],
    second: ["The cat was sleeping", "The cat was asleep"],
    explanation: "A cat memperkenalkan seekor kucing. Pada kalimat kedua, teman Anda sudah tahu kucing mana yang sedang tidur, jadi gunakan the cat.",
  },
  {
    id: "article-role-Maya-university student", group: "first-mention",
    basicsContext: "Seorang teman baru bertanya apa kesibukan Maya. Anda menjelaskan bahwa ia kuliah.",
    situation: "Anda membeli satu seragam. Seragam itu berwarna biru. Ceritakan pembelian itu untuk pertama kalinya.",
    cues: "I · buy · uniform / uniform · blue",
    first: ["I bought a uniform"], second: ["The uniform was blue", "The uniform is blue"],
    explanation: "Uniform dimulai dengan bunyi /j/, seperti y pada yes, sehingga bentuknya a uniform. The uniform menunjuk seragam yang baru Anda ceritakan.",
  },
  {
    id: "article-role-Rina-engineer", group: "first-mention",
    basicsContext: "Anda memperkenalkan Rina kepada tetangga yang baru bertemu dengannya. Sebutkan profesinya.",
    situation: "Anda menemukan sebuah payung. Payung itu basah saat ditemukan. Ceritakan penemuan itu kepada teman.",
    cues: "I · find · umbrella / umbrella · wet",
    first: ["I found an umbrella"], second: ["The umbrella was wet"],
    explanation: "Umbrella dimulai dengan bunyi vokal sehingga memakai an saat diperkenalkan. The umbrella kemudian menunjuk payung yang Anda temukan.",
  },
  {
    id: "article-known-bag", group: "known",
    situation: "Anda membuka sebuah kotak. Kotak itu ternyata kosong. Sebelumnya pendengar belum tahu tentang kotak itu.",
    cues: "I · open · box / box · empty",
    first: ["I opened a box"], second: ["The box was empty", "The box turned out to be empty"],
    explanation: "A box memperkenalkan satu kotak. Ketika Anda mengatakan the box was empty, pendengar menghubungkannya dengan kotak yang tadi dibuka.",
  },
  {
    id: "article-role-Maya-honest person", group: "first-mention",
    basicsContext: "Teman Anda belum mengenal Maya. Anda ingin menggambarkan sifatnya.",
    situation: "Anda bertemu seorang pria jujur. Pria itu membantu Anda. Ceritakan pengalaman ini untuk pertama kalinya.",
    cues: "I · meet · honest man / man · help me",
    first: ["I met an honest man"], second: ["The man helped me", "The honest man helped me"],
    explanation: "H pada honest tidak dibunyikan. Bunyi vokal di awal honest membuat kita memakai an honest man. The man merujuk pada pria yang sama.",
  },
  {
    id: "article-role-Rina-teacher", group: "first-mention",
    basicsContext: "Seorang teman ingin tahu pekerjaan Rina. Anda menyebutkan profesinya.",
    situation: "Anda dan teman menyewa satu sepeda untuk dipakai bergantian. Sepeda itu berwarna merah. Ceritakan kepada orang lain.",
    cues: "we · rent · bike / bike · red",
    first: ["We rented a bike", "We rented a bicycle"], second: ["The bike was red", "The bicycle was red"],
    explanation: "A bike memperkenalkan satu sepeda. The bike menunjuk sepeda sewaan yang sama ketika Anda menceritakan warnanya.",
  },
];

function withoutArticle(sentence: string) {
  return normalize(sentence).split(" ").filter(word => !["a", "an", "the"].includes(word)).join(" ");
}

export function checkArticleWriting(lesson: ArticleLesson, input: string) {
  if (!input.trim()) return { status: "empty", message: "Tulis dua kalimat terlebih dahulu." } as const;
  const sentences = input.trim().split(/[.!?\n]+/).map(normalize).filter(Boolean);
  if (sentences.length !== 2) {
    return { status: "retry", message: "Pisahkan cerita menjadi dua kalimat dengan titik atau baris baru. Kenalkan sesuatu dahulu, lalu ceritakan detailnya." } as const;
  }
  const [first, second] = sentences;
  if (!lesson.first.some(candidate => normalize(candidate) === first)) {
    if (lesson.first.some(candidate => withoutArticle(candidate) === withoutArticle(first))) {
      const message = first.split(" ").includes("the")
        ? "Pada kalimat pertama, pendengar baru mendengar tentang benda atau orang ini. Artikel mana yang cocok untuk memperkenalkannya?"
        : "Periksa artikel sebelum kata benda tunggal di kalimat pertama. Dengarkan bunyi awal kata yang langsung mengikuti artikel.";
      return { status: "retry", message } as const;
    }
    return { status: "retry", message: "Cocokkan subjek dan kejadian di kalimat pertama dengan kata panduan. Ceritakan apa yang sudah terjadi." } as const;
  }
  if (lesson.second.some(candidate => normalize(candidate) === second)) {
    return { status: "correct", message: lesson.explanation } as const;
  }
  if (/^(it|he|she)\b/.test(second)) {
    return { status: "retry", message: "Kata ganti bisa merujuk pada hal yang sama. Untuk latihan artikel ini, ulangi kata bendanya di kalimat kedua." } as const;
  }
  if (lesson.second.some(candidate => withoutArticle(candidate) === withoutArticle(second))) {
    return { status: "retry", message: knownHint } as const;
  }
  return { status: "retry", message: "Periksa detail kalimat kedua. Pakai kembali kata benda dari kalimat pertama dan ceritakan apa yang terjadi padanya atau bagaimana keadaannya." } as const;
}
