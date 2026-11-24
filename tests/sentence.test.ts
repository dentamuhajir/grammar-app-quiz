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
import { TOPIC_WRITING_LESSONS } from "../src/grammar/topicWriting";
import { changeExplorerQuestion, EXPLORER_VERBS, EXPLORER_COMPLEMENTS, explorerRestriction, initialExplorerQuestion } from "../src/grammar/explorer";
import { sentenceReading } from "../src/grammar/sentenceReadings";
import { DEFAULT_FILTER, DEFAULT_MULTI_FILTER, createQuestionCycle, quizCombinations, generateQuestion, generateStativeTrap, type MultiQuizFilter } from "../src/grammar/generator";
import { TENSE_LABELS, TENSE_ORDER } from "../src/grammar/labels";
import type { Mode, Question, SentenceForm, Subject, Tense } from "../src/grammar/types";
import { sentenceTranslation, checkTranslationAnswer } from "../src/grammar/translation";
import { loadPracticeMode, savePracticeMode } from "../src/grammar/practiceMode";

const she: Subject = { text: "she", person: 3, number: "singular", entity: "person", objectForm: "her" };
const work = { ...VERBS.find(v => v.base === "work")!, object: "" };

test("Indonesian prompts cover the full sentence vocabulary and every generated time expression", () => {
  const base: Question = {...verbal("presentSimple", "positive")};
  for (const verb of VERBS) {
    for (const mode of ["verbal", ...(verb.transitive && !verb.oddPassive && !verb.stative ? ["passive"] : [])] as Mode[]) {
      const translated = sentenceTranslation({...base, verb, mode});
      assert.ok(translated, mode + "/" + verb.base);
      assert.ok(!translated.text.includes("undefined"));
    }
  }
  for (const subject of SUBJECTS) {
    assert.ok(sentenceTranslation({...base, subject}), subject.text);
    for (const complement of COMPLEMENTS) {
      assert.ok(sentenceTranslation({...base,subject,complement,mode:"nominal"}), subject.text + "/" + complement.text);
    }
  }
  for (const tense of TENSE_ORDER) {
    for (const signal of Object.values(TIME_SIGNALS[tense]).flat()) {
      assert.ok(sentenceTranslation({...base,tense,timeSignal:signal.text}), signal.text);
    }
    for (const mode of ["verbal","nominal","passive"] as Mode[]) {
      for (const form of ["positive","negative","yesNoQuestion","whQuestion"] as SentenceForm[]) {
        const q = generateQuestion({...DEFAULT_FILTER,tense,mode,form});
        const translated = sentenceTranslation(q);
        assert.ok(translated,q.answer);
        assert.ok(translated.context.length > 10);
        assert.equal(translated.text.endsWith("?"),form === "yesNoQuestion" || form === "whQuestion");
      }
    }
  }
  for (const object of ["a noise","heat","smoothly"]) {
    assert.ok(sentenceTranslation({...base,verb:{...work,object}}));
  }
});

test("translation preserves question meaning and accepts only compatible lexical alternatives", () => {
  const subject = SUBJECTS.find(s=>s.text==="he")!;
  const verb = VERBS.find(v=>v.base==="prepare")!;
  const q: Question = {subject,verb,tense:"futureSimple",mode:"verbal",form:"yesNoQuestion",
    answer:"Will he prepare the meal?"};
  assert.equal(sentenceTranslation(q)?.text,"Apakah dia laki-laki akan menyiapkan makanan itu?");
  assert.equal(sentenceTranslation({...q,form:"negative"})?.text,"Dia laki-laki tidak akan menyiapkan makanan itu.");
  assert.equal(sentenceTranslation({...q,form:"whQuestion",whWord:"What"})?.text,"Apa yang akan disiapkan oleh dia laki-laki?");
  assert.equal(checkTranslationAnswer(q,"Will he prepare the food?").correct,true);
  assert.equal(checkTranslationAnswer(q,"Will he get the meal ready?").correct,true);
  assert.equal(checkTranslationAnswer(q,"Will he get the food ready?").correct,true);
  for (const answer of ["Did he get the meal ready?", "Will she get the meal ready?", "Will he not get the meal ready?", "Will he gets the meal ready?"]) {
    assert.equal(checkTranslationAnswer(q,answer).correct,false,answer);
  }

  assert.equal(checkTranslationAnswer(q,"Did he prepare the food?").correct,false);
  assert.equal(checkTranslationAnswer(q,"Will she prepare the food?").correct,false);
  assert.equal(checkTranslationAnswer(q,"Will he not prepare the food?").correct,false);
  const nominal: Question = {...q,mode:"nominal",tense:"presentSimple",form:"whQuestion",
    whWord:"Where",complement:{text:"at home",kind:"adverb"}};
  assert.equal(sentenceTranslation(nominal)?.text,"Di mana dia laki-laki?");
  assert.match(sentenceTranslation({...nominal,whWord:"What",complement:{text:"a teacher",kind:"noun",plural:"teachers"}})!.text,/profesi atau peran/);
});

test("practice mode defaults safely and persists valid choices when storage is available", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis,"localStorage");
  let stored: string | null = null;
  Object.defineProperty(globalThis,"localStorage",{configurable:true,value:{
    getItem:()=>stored,setItem:(_key:string,value:string)=>{stored=value;},
  }});
  try {
    assert.equal(loadPracticeMode(),"arrange");
    savePracticeMode("translate");
    assert.equal(loadPracticeMode(),"translate");
    stored="invalid";
    assert.equal(loadPracticeMode(),"arrange");
    Object.defineProperty(globalThis,"localStorage",{configurable:true,get(){throw new Error("blocked");}});
    assert.equal(loadPracticeMode(),"arrange");
    assert.doesNotThrow(()=>savePracticeMode("context"));
  } finally {
    if(original)Object.defineProperty(globalThis,"localStorage",original);
    else Reflect.deleteProperty(globalThis,"localStorage");
  }
});

test("multi-filter cycles cover exactly the selected supported combinations and avoid boundary repeats", () => {
  const filter: MultiQuizFilter = {
    tenses: ["presentSimple", "pastSimple"],
    modes: ["verbal", "nominal"], forms: ["yesNoQuestion", "whQuestion"], includeRare: false,
  };
  const combinations = quizCombinations(filter);
  assert.equal(combinations.length, 8);
  const cycle = createQuestionCycle(filter);
  let previous = "";
  for (let round = 0; round < 4; round++) {
    const seen = new Set<string>();
    for (let index = 0; index < combinations.length; index++) {
      const q = cycle();
      const key = [q.tense, q.mode, q.form].join("/");
      if (index === 0 && previous) assert.notEqual(key, previous);
      seen.add(key);
      assert.ok(filter.tenses.includes(q.tense));
      assert.ok(filter.modes.includes(q.mode));
      assert.ok(filter.forms.includes(q.form));
      assert.equal(checkAnswer(q, q.answer).correct, true);
      previous = key;
    }
    assert.equal(seen.size, combinations.length);
  }
});

test("multi-filter blocks unsupported nominal and rare passive combinations without unrelated fallback questions", () => {
  const unsupported: MultiQuizFilter = {
    tenses: ["futureContinuous", "presentPerfectContinuous"],
    modes: ["nominal"], forms: ["positive"], includeRare: false,
  };
  assert.equal(quizCombinations(unsupported).length, 0);
  assert.throws(() => createQuestionCycle(unsupported), RangeError);
  for (const key of ["tenses", "modes", "forms"] as const) {
    assert.equal(quizCombinations({...DEFAULT_MULTI_FILTER, [key]: []}).length, 0);
  }
  const rare: MultiQuizFilter = {
    tenses: ["presentPerfectContinuous"], modes: ["passive"],
    forms: ["negative", "whQuestion"], includeRare: false,
  };
  assert.equal(quizCombinations(rare).length, 0);
  rare.includeRare = true;
  assert.equal(quizCombinations(rare).length, 2);
  const cycle = createQuestionCycle(rare);
  for (let i = 0; i < 4; i++) {
    const q = cycle();
    assert.equal(q.mode, "passive");
    assert.equal(q.tense, "presentPerfectContinuous");
    assert.equal(q.rare, true);
  }
  const all = createQuestionCycle(DEFAULT_MULTI_FILTER);
  for (let i = 0; i < quizCombinations(DEFAULT_MULTI_FILTER).length; i++) {
    const q = all();
    assert.equal(sentenceGuide(q).notes.length, 0, q.answer);
    assert.ok(sentenceReading(q.answer), q.answer);
  }
});

test("Explorer compares irregular verbs and four forms with correct auxiliary agreement", () => {
  const initial = initialExplorerQuestion();
  assert.equal(initial.answer, "Emma writes a letter every day.");
  for (const verb of EXPLORER_VERBS) {
    for (const tense of TENSE_ORDER) {
      for (const form of ["positive", "negative", "yesNoQuestion", "whQuestion"] as SentenceForm[]) {
        const q = changeExplorerQuestion(initial, {verb, tense, form});
        assert.equal(checkAnswer(q, q.answer).correct, true);
        assert.ok(sentenceReading(q.answer), q.answer);
        assert.ok(!q.answer.includes("undefined"), q.answer);
      }
    }
  }
  const past = changeExplorerQuestion(initial, {tense: "pastSimple"});
  assert.equal(past.answer, "Emma wrote a letter yesterday.");
  assert.equal(changeExplorerQuestion(past, {form: "negative"}).answer, "Emma did not write a letter yesterday.");
  assert.equal(changeExplorerQuestion(past, {form: "yesNoQuestion"}).answer, "Did Emma write a letter yesterday?");
  assert.equal(changeExplorerQuestion(past, {form: "whQuestion"}).answer, "What did Emma write yesterday?");
});

test("Explorer preserves source context and offers suitable nominal patterns and questions", () => {
  const subject = SUBJECTS.find(s => s.text === "the students in this class")!;
  const source: Question = {
    subject, tense: "presentPerfect", mode: "nominal", form: "whQuestion",
    whWord: "How", complement: {text:"careful",kind:"adjective",behavioral:true},
    timeSignal: "recently", answer: "How have the students in this class been recently?",
  };
  assert.deepEqual(initialExplorerQuestion(source), source);
  let q = changeExplorerQuestion(initialExplorerQuestion(), {mode:"nominal"});
  assert.equal(q.answer, "Emma is tired every day.");
  q = changeExplorerQuestion(q, {form:"yesNoQuestion"});
  assert.equal(q.answer, "Is Emma tired every day?");
  q = changeExplorerQuestion(q, {form:"whQuestion"});
  assert.equal(q.answer, "Why is Emma tired every day?");
  q = changeExplorerQuestion(q, {complement:EXPLORER_COMPLEMENTS.find(c=>c.text==="at home")!});
  assert.equal(q.answer, "Where is Emma every day?");
  assert.ok(explorerRestriction(q, "presentContinuous"));
  q = changeExplorerQuestion(q, {complement:EXPLORER_COMPLEMENTS.find(c=>c.text==="careful")!, tense:"presentContinuous",form:"positive"});
  assert.equal(q.answer, "Emma is being careful right now.");
  assert.ok(explorerRestriction(q, "presentPerfectContinuous"));
  const unsupported = initialExplorerQuestion({...q,tense:"presentPerfectContinuous"});
  assert.equal(unsupported.tense,"presentPerfect");
  assert.ok(!unsupported.answer.includes("being"));
  for (const comp of EXPLORER_COMPLEMENTS) for (const tense of TENSE_ORDER) {
    const candidate = {...q,complement:comp};
    if (explorerRestriction(candidate,tense)) continue;
    for (const form of ["positive","negative","yesNoQuestion","whQuestion"] as SentenceForm[]) {
      const result = changeExplorerQuestion(candidate,{tense,form});
      assert.equal(result.tense,tense);
      assert.equal(checkAnswer(result,result.answer).correct,true);
    }
  }
});

test("Explorer handles imported mid-adverbs, it and passive questions", () => {
  const source: Question = {...verbal("presentPerfect","positive"),timeSignal:"already",
    answer:"She has already worked."};
  assert.equal(initialExplorerQuestion(source).answer,source.answer);
  assert.equal(changeExplorerQuestion(source,{form:"negative"}).answer,"She has not worked.");
  const it = SUBJECTS.find(s=>s.text==="it")!;
  assert.equal(changeExplorerQuestion(initialExplorerQuestion(),{subject:it}).answer,"It works well every day.");
  const passive: Question = {...initialExplorerQuestion(),mode:"passive"};
  const p = changeExplorerQuestion(passive,{form:"whQuestion"});
  assert.equal(p.answer,"Why is a letter written by Emma every day?");
  const active = changeExplorerQuestion(p,{mode:"verbal",verb:EXPLORER_VERBS[3]});
  assert.equal(changeExplorerQuestion(active,{mode:"passive"}).verb?.base,"write");
});
function verbal(tense: Tense, form: SentenceForm, timeSignal?: string): Question {
  return { tense, form, mode: "verbal", subject: she, verb: work, timeSignal,
    answer: conjugateVerbal(tense, she, work, form, { tail: timeSignal }) };
}

test("names, coordinated names and modified subjects keep singular and plural agreement", () => {
  for (const [text, positive, question, perfect, nominal] of [
    ["Emma", "Emma works.", "Does Emma work?", "Emma has worked.", "Emma is ready."],
    ["Emma and James", "Emma and James work.", "Do Emma and James work?", "Emma and James have worked.", "Emma and James are ready."],
    ["the boy with two dogs", "The boy with two dogs works.", "Does the boy with two dogs work?", "The boy with two dogs has worked.", "The boy with two dogs is ready."],
    ["the students in this class", "The students in this class work.", "Do the students in this class work?", "The students in this class have worked.", "The students in this class are ready."],
  ]) {
    const subject = SUBJECTS.find(item => item.text === text)!;
    assert.ok(subject);
    assert.equal(conjugateVerbal("presentSimple", subject, work, "positive"), positive);
    assert.equal(conjugateVerbal("presentSimple", subject, work, "yesNoQuestion"), question);
    assert.equal(conjugateVerbal("presentPerfect", subject, work, "positive"), perfect);
    assert.equal(conjugateNominal("presentSimple", subject, {text: "ready", kind: "adjective"}, "positive"), nominal);
    const q: Question = {...verbal("presentSimple", "positive"), subject, answer: positive};
    assert.equal(checkAnswer(q, positive).correct, true);
    if (subject.head) assert.ok(sentenceGuide(q).reasons.some(reason => reason.includes(subject.head!)));
  }
});

test("generator exposes new subjects and uses suitable device actions across every tense", () => {
  const originalRandom = Math.random;
  let seed = 91825;
  Math.random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const seen = new Set<string>();
  const itActions = new Set<string>();
  try {
    for (const tense of TENSE_ORDER) {
      for (const form of ["positive", "negative", "yesNoQuestion", "whQuestion"] as SentenceForm[]) {
        for (let i = 0; i < 35; i++) {
          const q = generateQuestion({...DEFAULT_FILTER, mode: "verbal", tense, form});
          seen.add(q.subject.text);
          assert.ok(sentenceReading(q.answer), q.answer);
          assert.equal(checkAnswer(q, q.answer).correct, true);
          if (q.subject.entity === "thing") {
            assert.ok(["work", "run", "make", "produce", "show"].includes(q.verb!.base));
            if (q.subject.text === "it") itActions.add(q.verb!.base);
          }
          if (q.whWord === "How") {
            assert.doesNotMatch(sentenceGuide(q).formula, /Objek/);
          }
        }
      }
    }
    for (const subject of SUBJECTS) assert.ok(seen.has(subject.text), subject.text);
    assert.equal(itActions.size, 5);
  } finally {
    Math.random = originalRandom;
  }
});

test("offline reading guide covers sentence vocabulary, inflections, time expressions and guided packs", () => {
  const corpus = [
    ...VERBS.flatMap(v => [v.base, v.past, v.participle, v.thirdSingular, v.ing, v.object]),
    ...SUBJECTS.flatMap(s => [s.text, s.objectForm ?? ""]),
    ...COMPLEMENTS.flatMap(c => [c.text, c.plural ?? ""]),
    ...Object.values(TIME_SIGNALS).flatMap(groups => [...groups.action, ...groups.role, ...groups.state].map(s => s.text)),
    ...WRITING_PACKS.flatMap(p => p.lessons.map(q => q.reference)),
    ...TOPIC_WRITING_LESSONS.flatMap(lesson => lesson.variants),
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
