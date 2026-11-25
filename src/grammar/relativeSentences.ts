import { VERBS } from "./data/verbs";
import { conjugateNominal, conjugatePassive, conjugateVerbal } from "./engine";
import { isContinuous, isRarePassive } from "./labels";
import type { Mode, Question, SentenceForm, Subject, Tense } from "./types";

const people = ["my brother", "Emma", "Daniel", "the teacher"];
const things = ["my phone", "my laptop", "the computer", "my bike", "the car"];
const descriptions = [
  { tense: "presentSimple", clause: "who lives next door", meaning: "yang tinggal di sebelah", cues: { verb: "live", complement: "next door" } },
  { tense: "presentSimple", clause: "who works at the library", meaning: "yang bekerja di perpustakaan", cues: { verb: "work", complement: "at the library" } },
  { tense: "presentSimple", clause: "who loves music", meaning: "yang suka musik", cues: { verb: "love", complement: "music" } },
  { tense: "pastSimple", clause: "who helped me yesterday", meaning: "yang membantu saya kemarin", cues: { verb: "help", complement: "me", time: "yesterday" } },
  { tense: "pastSimple", clause: "who called me last night", meaning: "yang menelepon saya tadi malam", cues: { verb: "call", complement: "me", time: "last night" } },
] as const;
const agents = [
  { text: "Dad", meaning: "Ayah" }, { text: "Mom", meaning: "Ibu" },
  { text: "my sister", meaning: "saudara perempuan saya" },
];
const events = [
  { tense: "pastSimple", base: "repair", time: "yesterday", timeId: "kemarin", passiveId: "diperbaiki" },
  { tense: "pastSimple", base: "buy", time: "last year", timeId: "tahun lalu", passiveId: "dibeli" },
  { tense: "pastSimple", base: "test", time: "last week", timeId: "minggu lalu", passiveId: "diuji" },
  { tense: "presentSimple", base: "use", time: "every morning", timeId: "setiap pagi", passiveId: "digunakan" },
  { tense: "presentSimple", base: "clean", time: "every week", timeId: "setiap minggu", passiveId: "dibersihkan" },
] as const;

const anchors: Partial<Record<Tense, string>> = {
  pastSimple: "last week", pastContinuous: "at that moment", pastPerfect: "by then",
  futureContinuous: "this time next week", futurePerfect: "by tomorrow",
  presentPerfectContinuous: "for two hours", pastPerfectContinuous: "all morning",
  futurePerfectContinuous: "for a week by Friday",
};

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function verb(base: string) {
  return VERBS.find(v => v.base === base)!;
}

export function buildRelativeQuestion(tense: Tense, mode: Mode, form: SentenceForm, previous?: string, pronoun?: "who" | "which"): Question {
  // Only people can be "being careful". All other patterns work with either pool.
  const candidates = pronoun === "who" || (mode === "nominal" && isContinuous(tense)) ? people : pronoun === "which" ? things : [...people, ...things];
  const noun = pick(candidates.filter(text => text !== previous));
  const person = people.includes(noun);
  const head: Subject = { text: noun, number: "singular", person: 3, entity: person ? "person" : "thing" };
  const q: Question = { subject: head, tense, mode, form, answer: "", timeSignal: anchors[tense],
    whWord: form === "whQuestion" ? "Why" : undefined };
  const opts = { wh: q.whWord, tail: q.timeSignal };
  if (mode === "verbal") {
    q.verb = person ? verb(pick(["cook", "read", "help"])) : { ...verb("work"), object: pick(["again", "well"]) };
    q.answer = conjugateVerbal(tense, head, q.verb, form, opts);
  } else if (mode === "nominal") {
    const being = isContinuous(tense);
    q.complement = { kind: "adjective", text: being ? "careful" : pick(["ready", person ? "happy" : "noisy"]), behavioral: being };
    q.answer = conjugateNominal(tense, head, q.complement, form, { ...opts, being });
  } else {
    q.subject = { ...head, text: "the engineer", entity: "person" };
    q.rare = isRarePassive(tense);
    q.verb = { ...verb(person ? "help" : "use"), object: noun, objectNumber: "singular" };
    q.answer = conjugatePassive(tense, head, q.verb, form, { ...opts, byAgent: q.subject.text });
    q.activePrompt = conjugateVerbal(tense, q.subject, q.verb, "positive");
  }

  const mainSentence = q.answer;
  let relative: NonNullable<Question["relativeClause"]>;
  if (person) {
    const d = pick(descriptions);
    relative = { pronoun: "who", tense: d.tense, antecedent: noun, mainSentence, clause: d.clause, meaning: d.meaning,
      cues: d.cues, alternatives: [] };
  } else {
    const agent = pick(agents);
    const event = pick(events.filter(item => item.time !== q.timeSignal));
    const action = verb(event.base);
    const past = event.tense === "pastSimple";
    const clause = `which ${agent.text} ${past ? action.past : action.thirdSingular} ${event.time}`;
    const passive = `which ${past ? "was" : "is"} ${action.participle}`;
    relative = { pronoun: "which", tense: event.tense, antecedent: noun, mainSentence, clause,
      meaning: `yang ${event.passiveId} ${agent.meaning} ${event.timeId}`,
      cues: { subject: agent.text, verb: action.base, time: event.time },
      alternatives: [
        `${passive} by ${agent.text} ${event.time}`,
        `${passive} ${event.time} by ${agent.text}`,
      ] };
  }
  const end = mainSentence.toLowerCase().indexOf(noun.toLowerCase()) + noun.length;
  q.answer = mainSentence.slice(0, end) + ", " + relative.clause + "," + mainSentence.slice(end);
  q.relativeClause = relative;
  return q;
}
