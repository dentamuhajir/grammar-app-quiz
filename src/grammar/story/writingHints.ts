import type { BasicsTopic } from "../basics/engine";
import type { PersonalPrompt } from "./personal";

export interface WritingHint {
  label: string;
  explanation: string;
  example: string;
  topic?: BasicsTopic;
}

const hints = {
  wouldLike: { label: "Would like to", explanation: "Gunakan would like to + kata kerja dasar untuk menyampaikan keinginan.", example: "I'd like to try photography." },
  want: { label: "Want to", explanation: "Gunakan want to + kata kerja dasar untuk menyampaikan keinginan.", example: "I want to improve my speaking." },
  because: { label: "Because", explanation: "Gunakan because sebelum alasan.", example: "I enjoy gardening because it helps me relax.", topic: "conjunctions" },
  if: { label: "If", explanation: "Untuk membayangkan keadaan yang berbeda saat ini, gunakan if + bentuk lampau dan would + kata kerja dasar.", example: "If I had more time, I would practice every day.", topic: "conditionals" },
  should: { label: "Should", explanation: "Gunakan should + kata kerja dasar untuk menyampaikan saran atau pendapat.", example: "Schools should teach practical skills.", topic: "modals" },
  could: { label: "Could", explanation: "Gunakan could + kata kerja dasar untuk mengusulkan kemungkinan atau solusi.", example: "Our community could plant more trees.", topic: "modals" },
  can: { label: "Can", explanation: "Gunakan can + kata kerja dasar untuk menyatakan kemampuan atau kemungkinan.", example: "People can check the source before sharing news.", topic: "modals" },
  might: { label: "Might", explanation: "Gunakan might + kata kerja dasar untuk menyatakan kemungkinan.", example: "Technology might change the way we learn.", topic: "modals" },
  relative: { label: "Who / that", explanation: "Gunakan who untuk menambahkan informasi tentang orang, dan that untuk menjelaskan orang atau benda.", example: "I admire people who help their communities.", topic: "relatives" },
  relativeThing: { label: "Which / that", explanation: "Gunakan which atau that untuk menambahkan informasi penting tentang benda atau gagasan. Setelah koma, gunakan which.", example: "I read a book that changed my perspective.", topic: "relatives" },
  relativePlace: { label: "Where", explanation: "Gunakan where untuk menambahkan informasi tentang tempat.", example: "I enjoy places where people can relax.", topic: "relatives" },
  when: { label: "When", explanation: "Gunakan when untuk menghubungkan kejadian dengan waktu atau peristiwa lain.", example: "When I arrived, my friends were waiting.", topic: "conjunctions" },
  after: { label: "After / before", explanation: "Gunakan after dan before untuk menunjukkan urutan kegiatan.", example: "After I finished my work, I visited my friend.", topic: "conjunctions" },
  frequency: { label: "Usually / often", explanation: "Letakkan usually atau often sebelum kata kerja utama untuk menjelaskan frekuensi.", example: "I usually read before bed." },
  compare: { label: "Comparatives", explanation: "Gunakan bentuk perbandingan dan than untuk membandingkan dua hal.", example: "The train is faster than the bus.", topic: "comparatives" },
  sequence: { label: "First / then / finally", explanation: "Gunakan first, then, dan finally untuk mengurutkan kejadian atau langkah.", example: "First, I made a plan. Then, I called my friend." },
  feeling: { label: "Perasaan", explanation: "Gunakan feel atau felt dengan kata sifat untuk menjelaskan perasaan sekarang atau masa lalu.", example: "I felt proud after finishing the project.", topic: "adjectives" },
  result: { label: "So / as a result", explanation: "Gunakan so untuk menghubungkan penyebab dengan hasil. As a result dapat membuka kalimat hasil.", example: "It was raining, so we stayed inside.", topic: "conjunctions" },
  although: { label: "Although", explanation: "Gunakan although untuk menyatakan keadaan yang berlawanan dengan klausa utama.", example: "Although the task was difficult, I enjoyed it.", topic: "conjunctions" },
  pastContinuous: { label: "Past Continuous", explanation: "Gunakan was/were + verb-ing untuk menggambarkan kegiatan yang sedang berlangsung pada waktu lampau.", example: "I was walking home when it started to rain." },
  pastPerfect: { label: "Past Perfect", explanation: "Gunakan had + past participle ketika perlu menjelaskan kejadian yang sudah selesai sebelum kejadian lampau lain.", example: "The train had left before I arrived." },
  gerund: { label: "Enjoy + -ing", explanation: "Setelah enjoy, gunakan kata kerja berakhiran -ing untuk menyebut kegiatan yang disukai.", example: "I enjoy taking photos outdoors.", topic: "gerunds" },
  conclude: { label: "In conclusion", explanation: "Gunakan in conclusion untuk memperkenalkan rangkuman pendapat pada akhir tulisan.", example: "In conclusion, small changes can make a difference." },
  contrast: { label: "But / however", explanation: "Gunakan but atau however untuk menghubungkan gagasan yang berbeda.", example: "Technology saves time, but it can also be distracting.", topic: "conjunctions" },
  example: { label: "For example", explanation: "Gunakan for example untuk memperjelas pendapat dengan contoh.", example: "Small actions matter. For example, we can reuse bags." },
  past: { label: "Past Simple", explanation: "Gunakan bentuk lampau untuk menceritakan kejadian yang selesai di masa lalu.", example: "I visited my family last weekend." },
  present: { label: "Present Simple", explanation: "Gunakan Present Simple untuk kebiasaan dan keadaan yang umum.", example: "I usually read before bed." },
  perfect: { label: "Present Perfect", explanation: "Gunakan have/has + past participle untuk pengalaman atau hal yang berhubungan dengan sekarang.", example: "I have learned a lot this month." },
  continuous: { label: "Present Continuous", explanation: "Gunakan am/is/are + verb-ing untuk kegiatan yang sedang berlangsung.", example: "I am working on a new project." },
  future: { label: "Going to", explanation: "Gunakan am/is/are + going to + kata kerja dasar untuk rencana.", example: "I'm going to visit my family this weekend." },
  opinion: { label: "I think", explanation: "Gunakan I think untuk memperkenalkan pendapatmu.", example: "I think public parks are important." },
} satisfies Record<string, WritingHint>;

type HintId = keyof typeof hints;

const primary: Record<string, HintId> = {
  "Would like to": "wouldLike", "Want to": "want", "Past Simple": "past",
  "Present Simple": "present", "Present Perfect": "perfect", "Present Continuous": "continuous",
  "Present and past": "past", "Future plans": "future", "Going to": "future",
  "Future possibilities": "might", "Possibilities and plans": "could",
  "Could untuk saran": "could", "Can untuk kemungkinan": "can", "Can untuk saran": "can",
  "Can untuk solusi": "can", "Should untuk pendapat": "should", "Giving advice": "should",
  "Would untuk gagasan": "if", "Would untuk kemungkinan": "if",
  "Cause and effect": "because", "Giving reasons": "because", "Giving examples": "example",
  "Contrasting ideas": "contrast", "Comparing ideas": "contrast", "Expressing opinions": "opinion",
};

const topicHints: Array<{ ids: string[]; hints: HintId[] }> = [
  { ids: ["hobby", "future-trip", "change"], hints: ["because", "if", "gerund", "could"] },
  { ids: ["friend", "influential-person", "friendship", "trust-leadership"], hints: ["relative", "because", "example", "feeling"] },
  { ids: ["weekend", "day-highlight", "holiday", "meal", "helped-someone", "surprise", "week-memory"], hints: ["when", "after", "feeling", "pastContinuous"] },
  { ids: ["challenge", "small-success", "decision"], hints: ["pastPerfect", "because", "although", "result"] },
  { ids: ["today-plan", "weekend-plan"], hints: ["after", "could", "sequence", "because"] },
  { ids: ["breakfast", "morning", "weeknight", "learning-routine"], hints: ["frequency", "after", "sequence", "gerund"] },
  { ids: ["month", "learned", "advice"], hints: ["relativeThing", "because"] },
  { ids: ["place", "better-neighborhood", "local-park", "future-cities"], hints: ["relativePlace", "could"] },
  { ids: ["book", "music", "project", "family-tradition"], hints: ["relativeThing", "because"] },
  { ids: ["improve", "learning-failure", "daily-challenge"], hints: ["could", "if"] },
  { ids: ["corruption-impact", "social-media", "technology", "money-happiness", "ai-society"], hints: ["contrast", "might", "example", "result"] },
  { ids: ["corruption-prevention", "education-future", "school-skills", "protect-nature"], hints: ["should", "could", "example", "conclude"] },
  { ids: ["environment-waste", "air-quality", "public-transport", "fair-opportunities"], hints: ["should", "relativeThing"] },
  { ids: ["online-information", "community-disagreement", "health-habits"], hints: ["should", "because"] },
  { ids: ["meaningful-work", "life-success", "free-time", "volunteering"], hints: ["relativeThing", "contrast"] },
  { ids: ["cultural-traditions"], hints: ["could", "compare"] },
];

export function writingHintsFor(prompt: PersonalPrompt): WritingHint[] {
  const main = primary[prompt.grammar];
  const extras: HintId[] = topicHints.find(group => group.ids.includes(prompt.id))?.hints ?? ["opinion", "example"];
  return [...new Set([main, ...extras])].filter((id): id is HintId => Boolean(id)).map(id => hints[id]);
}
