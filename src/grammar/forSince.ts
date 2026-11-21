import { expandVariants, normalize } from "./check/normalize";

export const FOR_SINCE = "for_since";

interface ForSinceLesson {
  id: string;
  preposition: "for" | "since";
  blank: string;
  situation: string;
  cues: string;
  time: string;
  clauses: string[];
}

// Each writing task uses a different situation from its recognition question.
export const FOR_SINCE_LESSONS: ForSinceLesson[] = [
  {
    id: "prep-dur-for-hours", preposition: "for",
    blank: "She has been studying English ___ three hours.",
    situation: "Anda mulai bekerja di sini tiga tahun lalu dan masih bekerja di sini. Ceritakan sudah berapa lama.",
    cues: "I · work here · three years", time: "three years",
    clauses: ["I have worked here", "I have been working here"],
  },
  {
    id: "prep-dur-since-2022", preposition: "since",
    blank: "They have lived in Jakarta ___ 2022.",
    situation: "Anda pindah ke Bandung pada 2021 dan masih tinggal di sana. Sebutkan kapan Anda mulai tinggal di sana.",
    cues: "I · live in Bandung · 2021", time: "2021",
    clauses: ["I have lived in Bandung", "I have been living in Bandung"],
  },
  {
    id: "prep-dur-for-five-years", preposition: "for",
    blank: "He has worked at this company ___ five years.",
    situation: "Rina adalah teman Anda. Kalian sudah saling kenal selama dua tahun. Ceritakan dari sudut pandang Anda.",
    cues: "I · know Rina · two years", time: "two years",
    clauses: ["I have known Rina"],
  },
  {
    id: "prep-dur-since-monday", preposition: "since",
    blank: "It has been raining ___ Monday morning.",
    situation: "Dia mulai belajar bahasa Inggris pada Januari dan masih belajar sampai sekarang.",
    cues: "she · study English · January", time: "January",
    clauses: ["She has studied English", "She has been studying English"],
  },
  {
    id: "prep-dur-for-weeks", preposition: "for",
    blank: "We have been away from home ___ two weeks.",
    situation: "Anda dan teman Anda mulai tinggal di sini enam bulan lalu. Kalian masih tinggal di sini.",
    cues: "we · live here · six months", time: "six months",
    clauses: ["We have lived here", "We have been living here"],
  },
  {
    id: "prep-dur-since-friday", preposition: "since",
    blank: "The library has been closed ___ Friday.",
    situation: "Kamu mengenal Rina sejak SMA dan masih mengenalnya sekarang. Ceritakan dengan memakai kata-kata yang diberikan.",
    cues: "I · know Rina · high school", time: "high school",
    clauses: ["I have known Rina"],
  },
];

export function timeHint(expression: string) {
  return `Perhatikan “${expression}”. Apakah ini menjawab “berapa lama” atau “mulai kapan”?`;
}

export function timeExplanation(preposition: string, expression: string) {
  return preposition === "for"
    ? `“${expression}” menjawab pertanyaan “berapa lama?”, jadi gunakan “for”. Pada “since Monday”, Monday menunjukkan kapan kegiatan dimulai.`
    : `“${expression}” menjawab pertanyaan “mulai kapan?”, jadi gunakan “since”. Pada “for two days”, two days menunjukkan lamanya kegiatan.`;
}

export function referenceSentence(lesson: ForSinceLesson) {
  return `${lesson.clauses[0]} ${lesson.preposition} ${lesson.time}.`;
}

function normalizeTime(value: string) {
  return normalize(value).replace(/\b2\b/g, "two").replace(/\b3\b/g, "three").replace(/\b6\b/g, "six");
}

export function checkForSinceWriting(lesson: ForSinceLesson, input: string) {
  if (!input.trim()) return { status: "empty", message: "Tulis satu kalimat terlebih dahulu." } as const;
  const answers = expandVariants(input).map(normalizeTime);
  const adjuncts = lesson.preposition === "for"
    ? [`for ${lesson.time}`, `for the last ${lesson.time}`, `for the past ${lesson.time}`]
    : [`since ${lesson.time}`, `ever since ${lesson.time}`];
  if (lesson.time === "high school") adjuncts.push("since I was in high school");
  const accepted = lesson.clauses.flatMap(clause => adjuncts.flatMap(adjunct => [
    normalizeTime(`${clause} ${adjunct}`), normalizeTime(`${adjunct}, ${clause}`),
  ]));
  if (answers.some(answer => accepted.includes(answer))) {
    return { status: "correct", message: timeExplanation(lesson.preposition, lesson.time) } as const;
  }
  const other = lesson.preposition === "for" ? "since" : "for";
  if (answers.some(answer => answer.split(" ").includes(other))) {
    return { status: "retry", message: timeHint(lesson.time) } as const;
  }
  if (answers.some(answer => /\b(?:been )?knowing\b/.test(answer)) && lesson.cues.includes("know Rina")) {
    return { status: "retry", message: "Know menyatakan keadaan yang masih berlangsung. Coba gunakan bentuk ketiganya setelah have." } as const;
  }
  return { status: "retry", message: "Cocokkan kalimat dengan kata panduan. Hubungkan masa lalu dengan sekarang memakai have/has, lalu sertakan keterangan waktunya." } as const;
}
