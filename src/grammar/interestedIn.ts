import { expandVariants, normalize } from "./check/normalize";

export const INTERESTED_IN = "interested_in";

interface InterestLesson {
  id: string;
  blank: string;
  answer: string;
  cue: string;
  situation: string;
  cues: string;
  subjectBe: string;
  activities: string[];
}

export const INTEREST_LESSONS: InterestLesson[] = [
  {
    id: "prep-adj-interested-in", blank: "She is very interested ___ learning digital design.", answer: "in", cue: "in / on / at",
    situation: "Di kelas bahasa, ceritakan bahwa Anda tertarik belajar bahasa Jepang.",
    cues: "I · learn Japanese", subjectBe: "I am", activities: ["learning Japanese"],
  },
  {
    id: "gerund-prep-in-learn", blank: "He is interested in ___ Japanese.", answer: "learning", cue: "learn",
    situation: "Teman Anda tertarik bergabung dengan klub catur. Ceritakan minatnya.",
    cues: "she · join the chess club", subjectBe: "She is", activities: ["joining the chess club"],
  },
  {
    id: "prep-interest-volunteer", blank: "We are interested ___ volunteering at the library.", answer: "in", cue: "at / in / for",
    situation: "Anda dan seorang teman tertarik memotret burung. Ceritakan hobi yang ingin kalian coba.",
    cues: "we · take photos of birds", subjectBe: "We are", activities: ["taking photos of birds", "taking pictures of birds", "photographing birds"],
  },
  {
    id: "gerund-interest-make", blank: "My sister is interested in ___ short films.", answer: "making", cue: "make",
    situation: "Rina tertarik membuat roti sendiri. Ceritakan apa yang menarik baginya.",
    cues: "Rina · make bread", subjectBe: "Rina is", activities: ["making bread", "making her own bread", "baking bread", "baking her own bread"],
  },
  {
    id: "prep-interest-grow", blank: "My parents are interested ___ growing vegetables.", answer: "in", cue: "on / at / in",
    situation: "Dua teman Anda ingin mencoba bermain gitar. Sampaikan minat mereka.",
    cues: "they · play the guitar", subjectBe: "They are", activities: ["playing the guitar", "playing guitar"],
  },
  {
    id: "gerund-interest-swim", blank: "I am interested in ___ in the ocean.", answer: "swimming", cue: "swim",
    situation: "Anda tertarik menulis cerita pendek. Sampaikan minat itu kepada teman.",
    cues: "I · write short stories", subjectBe: "I am", activities: ["writing short stories"],
  },
];

export const prepositionHint = "Kata yang hilang menghubungkan perasaan seseorang dengan kegiatan yang menarik baginya. Kata depan mana yang biasa berpasangan dengan interested?";
export const activityHint = "Kata setelah preposisi menyebut sebuah kegiatan. Bagaimana kata kerja dasarnya berubah saat dipakai sebagai nama kegiatan?";

export function interestExplanation(activity: string) {
  return `Pada “interested in ${activity}”, interested menyatakan rasa tertarik, dan “${activity}” menyebut kegiatan yang menarik bagi orang itu.`;
}

export function checkInterestWriting(lesson: InterestLesson, input: string) {
  if (!input.trim()) return { status: "empty", message: "Tulis satu kalimat terlebih dahulu." } as const;
  const answers = expandVariants(input);
  const activity = lesson.activities.find(activity => ["", "really ", "very "].some(intensity =>
    answers.includes(normalize(`${lesson.subjectBe} ${intensity}interested in ${activity}`))));
  if (activity) {
    return { status: "correct", message: interestExplanation(activity) } as const;
  }
  const words = answers[0];
  if (/\binteresting\b/.test(words)) return { status: "retry", message: "Anda sedang menggambarkan perasaan seseorang. Periksa bentuk kata sifat dari interest." } as const;
  if (!words.startsWith(normalize(lesson.subjectBe) + " ")) {
    return { status: "retry", message: "Periksa siapa yang tertarik. Pasangkan subjek pada kata panduan dengan am, is, atau are." } as const;
  }
  if (!/\binterested in\b/.test(words)) return { status: "retry", message: prepositionHint } as const;
  if (!/\binterested in [a-z]+ing\b/.test(words)) return { status: "retry", message: activityHint } as const;
  return { status: "retry", message: "Periksa kembali ejaan, kegiatan, dan makna positif yang diminta pada kata panduan." } as const;
}
