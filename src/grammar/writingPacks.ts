import { FOR_SINCE, FOR_SINCE_LESSONS, checkForSinceWriting, referenceSentence, timeExplanation, timeHint } from "./forSince";
import { INTERESTED_IN, INTEREST_LESSONS, activityHint, checkInterestWriting, interestExplanation } from "./interestedIn";
import { ARTICLE_WRITING, ARTICLE_LESSONS, checkArticleWriting, knownHint, soundHint } from "./articleWriting";

export type WritingSkill = typeof FOR_SINCE | typeof INTERESTED_IN | typeof ARTICLE_WRITING;
export interface WritingResult { status: "empty" | "correct" | "retry"; message: string }
interface WritingLesson {
  id: string;
  group: string;
  situation: string;
  cues: string;
  reference: string;
  hint: string;
  explanation: string;
  check: (input: string) => WritingResult;
}
interface WritingPack { skill: WritingSkill; label: string; instruction: string; multiline?: boolean; lessons: WritingLesson[] }

export const WRITING_PACKS: WritingPack[] = [
  {
    skill: FOR_SINCE, label: "For / since", instruction: "Tulis satu kalimat dengan for atau since",
    lessons: FOR_SINCE_LESSONS.map(q => ({
      id: q.id, group: q.preposition, situation: q.situation, cues: q.cues, reference: referenceSentence(q),
      hint: timeHint(q.time), explanation: timeExplanation(q.preposition, q.time), check: input => checkForSinceWriting(q, input),
    })),
  },
  {
    skill: INTERESTED_IN, label: "Interested in + -ing", instruction: "Tulis satu kalimat dengan pola be interested in + kata kerja -ing",
    lessons: INTEREST_LESSONS.map(q => ({
      id: q.id, group: q.answer === "in" ? "preposition" : "gerund", situation: q.situation, cues: q.cues,
      reference: `${q.subjectBe} interested in ${q.activities[0]}.`, hint: activityHint,
      explanation: interestExplanation(q.activities[0]), check: input => checkInterestWriting(q, input),
    })),
  },
  {
    skill: ARTICLE_WRITING, label: "A / an / the", multiline: true,
    instruction: "Tulis dua kalimat. Ulangi kata bendanya pada kalimat kedua. Gunakan artikel",
    lessons: ARTICLE_LESSONS.map(q => ({
      id: q.id, group: q.group, situation: q.situation, cues: q.cues,
      reference: `${q.first[0]}. ${q.second[0]}.`, hint: q.group === "known" ? knownHint : soundHint,
      explanation: q.explanation, check: input => checkArticleWriting(q, input),
    })),
  },
];

export function packForLesson(lessonId: string) {
  const pack = WRITING_PACKS.find(item => item.lessons.some(lesson => lesson.id === lessonId));
  if (!pack) throw new Error(`Unknown writing lesson: ${lessonId}`);
  return pack;
}
