import { SUBJECTS } from "./data/subjects";
import { VERBS } from "./data/verbs";
import { conjugateNominal, conjugateVerbal } from "./engine";
import type { Question, Verb } from "./types";

const stay: Verb = {
  base: "stay", thirdSingular: "stays", past: "stayed", participle: "stayed", ing: "staying",
  object: "home", transitive: false, stative: false, objectNumber: "singular", oddPassive: false,
};
const feel: Verb = {
  base: "feel", thirdSingular: "feels", past: "felt", participle: "felt", ing: "feeling",
  object: "sick", transitive: false, stative: true, objectNumber: "singular", oddPassive: false,
};

const situations = [
  { action: stay, reason: "sick", sameSubject: true },
  { action: VERBS.find(v => v.base === "wear")!, reason: "cold outside", sameSubject: false },
  { action: VERBS.find(v => v.base === "close")!, reason: "noisy outside", sameSubject: false },
  { action: VERBS.find(v => v.base === "cook")!, reason: "hungry", sameSubject: true },
];
const subjects = SUBJECTS.filter(s => ["I", "we", "she", "he", "they"].includes(s.text));
const it = SUBJECTS.find(s => s.text === "it")!;

export function buildReasonQuestion(tense: "presentSimple" | "pastSimple", previousVerb?: string): Question {
  const pool = situations.filter(s => s.action.base !== previousVerb);
  const situation = pool[Math.floor(Math.random() * pool.length)];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const reasonSubject = situation.sameSubject ? subject : it;
  const main = conjugateVerbal(tense, subject, situation.action, "positive");
  const reasonVerb = situation.sameSubject ? feel.base : "be";
  const reason = situation.sameSubject
    ? conjugateVerbal(tense, reasonSubject, { ...feel, object: situation.reason }, "positive")
    : conjugateNominal(tense, reasonSubject, { kind: "adjective", text: situation.reason }, "positive");
  // Restore the original subject's case when embedding a sentence after a conjunction or comma.
  const clause = reasonSubject.text + reason.slice(reasonSubject.text.length, -1);
  return {
    mode: "verbal", form: "positive", tense, subject, verb: situation.action,
    answer: `${main.slice(0, -1)} because ${clause}.`,
    reasonClause: {
      clause, cues: { subject: reasonSubject.text, verb: reasonVerb, complement: situation.reason },
      frontedAnswer: `Because ${clause}, ${subject.text}${main.slice(subject.text.length)}`,
    },
  };
}
