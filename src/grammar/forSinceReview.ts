import { FOR_SINCE, FOR_SINCE_LESSONS } from "./forSince";

type Activity = "basics" | "sentence";
export type Outcome = "incorrect" | "correct" | "revealed";
export interface ReviewSlot { lessonId: string; activity: Activity }
export interface ScheduledReview extends ReviewSlot {
  practicedId: string;
  dueAt: number;
}

const key = (slot: ReviewSlot) => `grammar-drill.for_since.v1.${slot.activity}.${slot.lessonId}`;
const threeDays = 3 * 24 * 60 * 60 * 1000;

export function saveAttempt(practice: ReviewSlot, first: Outcome, outcome: Outcome, hintUsed: boolean, review?: ReviewSlot, now = Date.now()) {
  const source = review ?? practice;
  const queueKey = key(source);
  try {
    localStorage.setItem(key(practice) + ".last", JSON.stringify({
      ...practice, skillId: FOR_SINCE, first, outcome, hintUsed, attemptedAt: now,
    }));
    if (first !== "correct" || hintUsed) {
      if (review || !localStorage.getItem(queueKey)) {
        const scheduled: ScheduledReview = { lessonId: source.lessonId, activity: source.activity,
          practicedId: practice.lessonId, dueAt: now + threeDays };
        localStorage.setItem(queueKey, JSON.stringify(scheduled));
      }
    } else if (review) {
      localStorage.removeItem(queueKey);
    }
  } catch { /* Practice also works without storage. */ }
}

export function dueReviews(now = Date.now()): ScheduledReview[] {
  const results: ScheduledReview[] = [];
  for (const lesson of FOR_SINCE_LESSONS) {
    for (const activity of ["basics", "sentence"] as const) {
      try {
        const raw = localStorage.getItem(key({ lessonId: lesson.id, activity }));
        if (!raw) continue;
        const row = JSON.parse(raw);
        if (row?.lessonId === lesson.id && row.activity === activity
          && typeof row.dueAt === "number" && row.dueAt <= now) results.push(row);
      } catch { /* An unreadable entry does not block the other reviews. */ }
    }
  }
  return results.sort((a, b) => a.dueAt - b.dueAt);
}

export function reviewLesson(review: ScheduledReview) {
  const source = FOR_SINCE_LESSONS.find(lesson => lesson.id === review.lessonId)!;
  const group = FOR_SINCE_LESSONS.filter(lesson => lesson.preposition === source.preposition);
  const last = group.findIndex(lesson => lesson.id === review.practicedId);
  return group[(last + 1) % group.length];
}
