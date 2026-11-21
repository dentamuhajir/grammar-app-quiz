import assert from "node:assert/strict";
import test from "node:test";
import { conjugateNominal, conjugatePassive, conjugateVerbal } from "../src/grammar/engine";
import { implicitContextCue, sentenceGuide } from "../src/grammar/explanations";
import { checkAnswer } from "../src/grammar/check";
import { VERBS } from "../src/grammar/data/verbs";
import { SUBJECTS } from "../src/grammar/data/subjects";
import { COMPLEMENTS } from "../src/grammar/data/complements";
import { TIME_SIGNALS } from "../src/grammar/data/timeSignals";
import { WRITING_PACKS } from "../src/grammar/writingPacks";
import { sentenceReading } from "../src/grammar/sentenceReadings";
import { DEFAULT_FILTER, generateQuestion, generateStativeTrap } from "../src/grammar/generator";
import { TENSE_LABELS, TENSE_ORDER } from "../src/grammar/labels";
import type { Mode, Question, SentenceForm, Subject, Tense } from "../src/grammar/types";

const she: Subject = { text: "she", person: 3, number: "singular", entity: "person", objectForm: "her" };
const work = { ...VERBS.find(v => v.base === "work")!, object: "" };
function verbal(tense: Tense, form: SentenceForm, timeSignal?: string): Question {
  return { tense, form, mode: "verbal", subject: she, verb: work, timeSignal,
    answer: conjugateVerbal(tense, she, work, form, { tail: timeSignal }) };
}

test("offline reading guide covers sentence vocabulary, inflections, time expressions and guided packs", () => {
  const corpus = [
    ...VERBS.flatMap(v => [v.base, v.past, v.participle, v.thirdSingular, v.ing, v.object]),
    ...SUBJECTS.flatMap(s => [s.text, s.objectForm ?? ""]),
    ...COMPLEMENTS.flatMap(c => [c.text, c.plural ?? ""]),
    ...Object.values(TIME_SIGNALS).flatMap(groups => [...groups.action, ...groups.role, ...groups.state].map(s => s.text)),
    ...WRITING_PACKS.flatMap(p => p.lessons.map(q => q.reference)),
  ];
  for (const text of corpus.filter(Boolean)) assert.ok(sentenceReading(text), text);
});

test("learner spellings preserve stress, context, contractions and clock abbreviations", () => {
  assert.equal(sentenceReading("I usually do not"), "ai YUU-zhu-e-li duu nat");
  assert.equal(sentenceReading("Sustainability!"), "se-stéi-ne-BIL-e-ti!");
  assert.equal(sentenceReading("We’ve worked since 7 a.m."), "wiiv werkt sins SÉ-ven ÉI-ÉM");
  assert.equal(sentenceReading("the umbrella, the uniform"), "dhii am-BRÉL-e, dhe YU-ne-form");
  assert.equal(sentenceReading("read", verbal("pastSimple", "positive")), "réd");
  assert.equal(sentenceReading("read", verbal("presentPerfect", "negative")), "réd");
  assert.equal(sentenceReading("read", verbal("pastSimple", "yesNoQuestion")), "riid");
  assert.equal(sentenceReading("constructor"), null);
});

test("guides cover every generated tense, mode and sentence form without losing words", () => {
  for (const tense of TENSE_ORDER) for (const mode of ["verbal", "nominal", "passive"] as Mode[]) {
    for (const form of ["positive", "negative", "yesNoQuestion", "whQuestion"] as SentenceForm[]) {
      const q = generateQuestion({ ...DEFAULT_FILTER, tense, mode, form });
      const guide = sentenceGuide(q);
      assert.ok(guide.formula.length > 5, `${tense}/${mode}/${form}`);
      assert.ok(!guide.formula.includes("undefined"));
      assert.equal(guide.parts.map(part => part.text).join(" "), q.answer);
      assert.ok(guide.parts.every(part => part.role !== "Bagian kalimat"), `${q.answer}: ${JSON.stringify(guide.parts)}`);
      assert.ok(guide.reasons.length >= 2);
      assert.equal(checkAnswer(q, q.answer).correct, true);
    }
  }
});

test("negative verbal vs nominal and passive have distinct patterns", () => {
  const q = verbal("presentSimple", "negative");
  assert.equal(sentenceGuide(q).formula, "Subjek + does + not + V1");
  const nominal: Question = { ...q, mode: "nominal", verb: undefined,
    complement: { text: "happy", kind: "adjective" },
    answer: conjugateNominal("presentSimple", she, { text: "happy", kind: "adjective" }, "negative") };
  assert.equal(sentenceGuide(nominal).formula, "Subjek + is + not + Pelengkap");
  const verb = { ...VERBS.find(v => v.base === "write")!, object: "the letters", objectNumber: "plural" as const };
  const passive: Question = { ...q, mode: "passive", verb,
    answer: conjugatePassive("presentSimple", { text: verb.object, person: 3, number: "plural" }, verb, "negative", { byAgent: "her" }) };
  const guide = sentenceGuide(passive);
  assert.equal(guide.formula, "Subjek penerima tindakan + are + not + V3 + by + pelaku");
  assert.ok(guide.reasons.some(reason => reason.includes("the letters") && reason.includes("bukan pelaku")));
  assert.match(checkAnswer(passive, "The letters is not written by her.").hint, /the letters/);
});

test("hints target main verb, object, time, and passive V3 accurately", () => {
  assert.match(checkAnswer(verbal("presentSimple", "negative"), "She does not works.").hint, /V1/);
  assert.match(checkAnswer(verbal("presentSimple", "positive"), "She work.").hint, /orang ketiga tunggal/);
  const past = verbal("pastSimple", "positive", "yesterday");
  assert.match(checkAnswer(past, "She worked tomorrow.").hint, /keterangan/);
  const read = { ...VERBS.find(v => v.base === "read")!, object: "the book" };
  const question: Question = { ...past, form: "yesNoQuestion", verb: read, timeSignal: undefined,
    answer: conjugateVerbal("pastSimple", she, read, "yesNoQuestion") };
  const hint = checkAnswer(question, "Did she read the newspaper?").hint;
  assert.match(hint, /objek atau pelengkap/);
  assert.ok(!hint.includes("sebelum subjek"));
  const write = { ...VERBS.find(v => v.base === "write")!, object: "the letter" };
  const passive: Question = { ...past, mode: "passive", verb: write, timeSignal: undefined,
    answer: conjugatePassive("pastSimple", { text: "the letter", person: 3, number: "singular" }, write, "positive", { byAgent: "her" }) };
  assert.match(checkAnswer(passive, "The letter was wrote by her.").hint, /V3/);
});

test("complete time phrases can move safely; arbitrary word movement is rejected", () => {
  const q = verbal("pastSimple", "positive", "yesterday");
  const result = checkAnswer(q, "Yesterday, she worked.");
  assert.equal(result.correct, true);
  assert.equal(result.alternativeOrder, true);
  assert.equal(checkAnswer(q, "Yesterday, she work.").correct, false);
  assert.match(checkAnswer(q, "Yesterday, she work.").hint, /V2/);
  assert.equal(checkAnswer(q, "Worked she yesterday.").correct, false);
  const negative = verbal("pastSimple", "negative", "yesterday");
  assert.equal(checkAnswer(negative, "Yesterday, she didn't work.").correct, true);
  const mid: Question = { ...q, tense: "presentSimple", timeSignal: "usually", answer: "She usually works." };
  assert.equal(checkAnswer(mid, "Usually she works.").alternativeOrder, undefined);
});

test("fallback exercises explain the effective tense and main verb forms", () => {
  const nominal = generateQuestion({ ...DEFAULT_FILTER, tense: "presentPerfectContinuous", mode: "nominal", form: "positive" });
  const guide = sentenceGuide(nominal);
  assert.ok(guide.notes.some(note => note.includes("sebenarnya Present Perfect")));
  assert.ok(!guide.formula.includes("V-ing"));
  const trap = generateStativeTrap("presentPerfectContinuous");
  const trapGuide = sentenceGuide(trap);
  assert.ok(trapGuide.formula.includes("V3"));
  assert.ok(!trapGuide.formula.includes("V-ing"));
  assert.ok(trapGuide.notes.some(note => note.includes("menyatakan keadaan")));
  assert.match(checkAnswer(trap, `She is ${trap.verb!.ing} ${trap.verb!.object} for years.`).hint, /stative verb/);
  const yetQ: Question = {
    tense: "presentPerfect",
    form: "negative",
    mode: "verbal",
    subject: she,
    verb: work,
    timeSignal: "yet",
    answer: conjugateVerbal("presentPerfect", she, work, "negative", { tail: "yet" }),
  };
  assert.match(checkAnswer(yetQ, "She has not worked already.").hint, /yet/);
});

test("implicitContextCue provides situational context without leaking the tense label", () => {
  for (const tense of TENSE_ORDER) {
    const q = verbal(tense, "positive");
    const cue = implicitContextCue(q);
    assert.ok(cue.startsWith("Situasi:"), cue);
    assert.ok(!cue.includes(TENSE_LABELS[tense]), `Cue leaked tense label for ${tense}: ${cue}`);
  }
});
