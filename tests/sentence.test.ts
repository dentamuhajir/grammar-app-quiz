import assert from "node:assert/strict";
import test from "node:test";
import { conjugateNominal, conjugatePassive, conjugateVerbal } from "../src/grammar/engine";
import { implicitContextCue, sentenceGuide } from "../src/grammar/explanations";
import { checkAnswer } from "../src/grammar/check";
import { VERBS } from "../src/grammar/data/verbs";
import { INDEFINITE_PERSONS, SUBJECTS } from "../src/grammar/data/subjects";
import { COMPLEMENTS } from "../src/grammar/data/complements";
import { TIME_SIGNALS } from "../src/grammar/data/timeSignals";
import { WRITING_PACKS } from "../src/grammar/writingPacks";
import { TOPIC_WRITING_LESSONS } from "../src/grammar/topicWriting";
import { changeExplorerQuestion, EXPLORER_VERBS, EXPLORER_COMPLEMENTS, explorerRestriction, initialExplorerQuestion } from "../src/grammar/explorer";
import { sentenceReading } from "../src/grammar/sentenceReadings";
import { DEFAULT_FILTER, DEFAULT_MULTI_FILTER, createQuestionCycle, quizCombinations, generateQuestion, generateStativeTrap, subjectFitsForm, type MultiQuizFilter } from "../src/grammar/generator";
import { TENSE_LABELS, TENSE_ORDER } from "../src/grammar/labels";
import type { Mode, Question, SentenceForm, Subject, Tense } from "../src/grammar/types";
import { sentenceTranslation, checkTranslationAnswer } from "../src/grammar/translation";
import { loadPracticeMode, savePracticeMode } from "../src/grammar/practiceMode";
import { buildRelativeQuestion } from "../src/grammar/relativeSentences";
import { buildReasonQuestion } from "../src/grammar/reasonSentences";
import { FOCUS_PATTERNS } from "../src/grammar/focusedSentences";
import { buildStructureQuestion, STRUCTURE_ITEMS, STRUCTURE_PATTERNS, type StructureFocus } from "../src/grammar/structureSentences";
import { normalize } from "../src/grammar/check/normalize";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.browser";
import { SentencePractice } from "../src/ui/SentencePractice";
import { SentenceFilters } from "../src/ui/SentenceFilters";
import { SentenceExplanation } from "../src/ui/SentenceExplanation";
import { buildFrequencyQuestion, FREQUENCY_ADVERBS, FREQUENCY_TENSES } from "../src/grammar/frequencySentences";
import { buildModalQuestion, MODAL_PATTERNS, MODAL_FUNCTIONS, MODAL_TIMES, modalForms, modalPatterns, modalSummary } from "../src/grammar/modalSentences";

test("structure filters only generate selected patterns, tenses, modes and forms", () => {
  for (const focus of Object.keys(STRUCTURE_PATTERNS) as StructureFocus[]) {
    for (const { value: focusPattern } of STRUCTURE_PATTERNS[focus]) {
      const filter: MultiQuizFilter = { ...DEFAULT_MULTI_FILTER, focus, focusPattern };
      const combinations = quizCombinations(filter);
      assert.ok(combinations.length, focusPattern);
      const cycle = createQuestionCycle(filter);
      for (let i = 0; i < combinations.length * 4; i++) {
        const q = cycle();
        assert.ok(STRUCTURE_ITEMS.some(item => item.focus === focus && item.pattern === focusPattern && item.answer === q.answer));
        assert.ok(filter.tenses.includes(q.tense));
        assert.ok(filter.modes.includes(q.mode));
        assert.ok(filter.forms.includes(q.form));
        assert.ok(q.focused?.rows.every(row => row.detail.includes(TENSE_LABELS[q.tense])));
        assert.equal(checkAnswer(q, q.answer).correct, true, q.answer);
      }
      for (const combination of combinations) {
        const narrowed: MultiQuizFilter = { ...filter, tenses: [combination.tense], modes: [combination.mode], forms: [combination.form] };
        assert.equal(quizCombinations(narrowed).length, 1);
        const q = createQuestionCycle(narrowed)();
        assert.equal(q.tense, combination.tense);
        assert.equal(q.mode, combination.mode);
        assert.equal(q.form, combination.form);
      }
      assert.equal(quizCombinations({ ...filter, tenses: ["futurePerfect"] }).length, 0);
      assert.equal(quizCombinations({ ...filter, modes: ["passive"] }).length, 0);
      assert.equal(quizCombinations({ ...filter, forms: ["whQuestion"] }).length, 0);
      if (focus === "sentenceStructure" || focus === "thereIt") assert.equal(quizCombinations({ ...filter, focusPattern: "must" }).length, 0);
    }
  }
});

test("structure answer checking and anatomy cover every reference and supported alternative", () => {
  for (const item of STRUCTURE_ITEMS) {
    const base = buildStructureQuestion(item.focus, item.pattern, item.tense, item.mode, item.form);
    const q: Question = { ...base, answer: item.answer, focused: { ...base.focused!,
      alternatives: item.alternatives ?? [], analysis: { parts: item.parts }, explanation: item.explanation } };
    for (const answer of [item.answer, ...(item.alternatives ?? [])]) {
      const result = checkAnswer(q, answer);
      assert.equal(result.correct, true, answer);
      const guide = sentenceGuide({ ...q, answer: result.normalizedAnswer });
      assert.equal(normalize(guide.parts.map(part => part.text).join(" ")), normalize(answer));
      assert.ok(guide.formula.length > 0);
      assert.equal(guide.reasons[0], item.explanation);
      assert.ok(guide.parts.every(part => part.role !== "Penghubung / preposisi" || part.text === "to"), answer);
    }
    assert.equal(checkAnswer(q, "").empty, true);
    assert.equal(checkAnswer(q, "Some unrelated words").correct, false);
  }
});

test("structure drills reject wrong agreement, dummy subjects and targeted adverb order", () => {
  const there = buildStructureQuestion("thereIt", "existence", "presentSimple", "nominal", "positive");
  const wrongAgreement = there.answer.includes(" is ") ? there.answer.replace(" is ", " are ") : there.answer.replace(" are ", " is ");
  assert.equal(checkAnswer(there, wrongAgreement).correct, false);
  assert.equal(checkAnswer(there, there.answer.replace("There", "It")).correct, false);
  const weather = buildStructureQuestion("thereIt", "weather", "pastSimple", "nominal", "negative");
  assert.equal(checkAnswer(weather, "It wasn't cold.").correct, true);
  const evaluation = buildStructureQuestion("thereIt", "evaluation", "presentSimple", "nominal", "positive");
  assert.equal(checkAnswer(evaluation, "It's important to practice every day.").correct, true);
  assert.equal(checkAnswer(evaluation, "It is important practise every day.").correct, false);
  const order = buildStructureQuestion("sentenceStructure", "adverbOrder", "presentSimple", "verbal", "positive");
  assert.equal(checkAnswer(order, "Every morning, Maya works quietly at home.").correct, false);
  const time = buildStructureQuestion("sentenceStructure", "timePosition", "pastSimple", "verbal", "positive");
  assert.equal(checkAnswer(time, "Yesterday they visited the museum.").correct, true);
  const clause = buildStructureQuestion("sentenceStructure", "timeClause", "pastSimple", "verbal", "positive");
  assert.deepEqual(clause.focused!.rows.map(row => row.label), ["Waktu", "Kejadian utama"]);
  assert.equal(checkAnswer(clause, "We stopped talking when the film started.").correct, true);
  assert.equal(checkAnswer(clause, "When the film started, we stopped to talk.").correct, false);
  const doubleObject = buildStructureQuestion("sentenceStructure", "svoo", "presentSimple", "verbal", "positive");
  const alternative = checkAnswer(doubleObject, "Maya gives some books to her brother.");
  assert.deepEqual(sentenceGuide({ ...doubleObject, answer: alternative.normalizedAnswer }).parts.map(part => part.role),
    ["Subjek", "Verb", "Objek langsung", "Penghubung / preposisi", "Penerima"]);
});

test("defining relative clauses distinguish optional objects from required subjects", () => {
  const object = buildStructureQuestion("relativeClause", "definingObject", "pastSimple", "nominal", "positive");
  for (const answer of ["The book that I bought was expensive.", "The book which I bought was expensive.", "The book I bought was expensive."]) {
    assert.equal(checkAnswer(object, answer).correct, true, answer);
  }
  assert.equal(checkAnswer(object, "The book bought was expensive.").correct, false);
  const subject = buildStructureQuestion("relativeClause", "definingSubject", "presentSimple", "verbal", "positive");
  assert.equal(checkAnswer(subject, "The woman calls me lives next door.").correct, false);
  assert.equal(checkAnswer(subject, "The woman that calls me lives next door.").correct, true);
  const nonDefining = buildRelativeQuestion("presentSimple", "nominal", "positive", undefined, "which");
  assert.equal(checkAnswer(nonDefining, nonDefining.answer.replace("which ", "")).correct, false);
});

test("conjunction drills preserve timing and meaning in both clause orders", () => {
  for (const { value: pattern } of STRUCTURE_PATTERNS.reasonClause) {
    const q = buildStructureQuestion("reasonClause", pattern, "pastSimple", "verbal", "positive");
    assert.equal(q.focused!.rows.length, 2);
    for (const answer of q.focused!.alternatives) assert.equal(checkAnswer(q, answer).correct, true, answer);
    const wrongConnector = pattern === "before" ? "after" : "before";
    assert.equal(checkAnswer(q, q.answer.replace(pattern, wrongConnector)).correct, false);
    if (pattern === "although") assert.equal(checkAnswer(q, "Although it rained, but Maya went out.").correct, false);
  }
});

test("new focus screens render meaningful chips, active filters and anatomy", () => {
  for (const focus of Object.keys(STRUCTURE_PATTERNS) as StructureFocus[]) {
    for (const { value: focusPattern } of STRUCTURE_PATTERNS[focus]) {
      const filter: MultiQuizFilter = { ...DEFAULT_MULTI_FILTER, focus, focusPattern };
      const screen = renderToStaticMarkup(createElement(SentencePractice, { initialFilter: filter, onExplore: () => {} }));
      assert.match(screen, /Buka materi fokus latihan/);
      assert.match(screen, /Bahan kalimat/);
      assert.doesNotMatch(screen, /undefined/);
      const filters = renderToStaticMarkup(createElement(SentenceFilters, { filter, generalFilter: DEFAULT_MULTI_FILTER,
        practiceMode: "arrange", onApply: () => {}, onClose: () => {} }));
      assert.match(filters, /aria-pressed="true"/);
      assert.doesNotMatch(filters, /Kombinasi ini belum didukung/);
      const q = createQuestionCycle(filter)();
      const explanation = renderToStaticMarkup(createElement(SentenceExplanation, { question: q, solved: true, onExplore: () => {} }));
      assert.match(explanation, /Bagian kalimat/);
      assert.doesNotMatch(explanation, /Buka di Tenses Explorer/);
    }
  }
  const doubleObject = renderToStaticMarkup(createElement(SentencePractice, {
    initialFilter: { ...DEFAULT_MULTI_FILTER, focus: "sentenceStructure", focusPattern: "svoo", tenses: ["presentSimple"] }, onExplore: () => {},
  }));
  assert.match(doubleObject, />her brother<\/span>/);
  assert.match(doubleObject, />some books<\/span>/);
  assert.doesNotMatch(doubleObject, /her brother · some books/);
});

test("modal focus uses the selected pattern and forms without a tense selector", () => {
  for (const { value: modal } of MODAL_PATTERNS.filter(p => ["can", "should", "must"].includes(p.value))) {
    const filter: MultiQuizFilter = { ...DEFAULT_MULTI_FILTER, focus: "modals", focusPattern: modal, tenses: [] };
    assert.equal(quizCombinations(filter).length, 3);
    assert.equal(quizCombinations({ ...filter, modes: ["nominal", "passive"] }).length, 0);
    assert.equal(quizCombinations({ ...filter, forms: ["whQuestion"] }).length, 0);
    const cycle = createQuestionCycle(filter);
    const forms = new Set<string>();
    const answers = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const q = cycle();
      forms.add(q.form);
      answers.add(q.answer);
      assert.equal(q.mode, "verbal");
      assert.equal(q.focused!.rows[0].cues.modal, modal);
      assert.equal(q.focused!.rows[0].cues.verb, q.verb!.base);
      assert.equal(q.focused!.rows[0].cues.complement, q.verb!.object);
      assert.ok(!q.focused!.rows[0].detail.includes("Present Simple"));
      assert.equal(checkAnswer(q, q.answer).correct, true);
      assert.equal(checkAnswer(q, q.answer.replace(q.verb!.base, `to ${q.verb!.base}`)).correct, false);
      assert.equal(checkAnswer(q, q.answer.replace(q.verb!.base, q.verb!.thirdSingular)).correct, false);
      if (q.form === "negative") {
        const contracted = q.answer.replace("cannot", "can't").replace("should not", "shouldn't").replace("must not", "mustn't");
        assert.equal(checkAnswer(q, contracted).correct, true);
      }
    }
    assert.equal(forms.size, 3);
    assert.ok(answers.size > 10);
  }
});

test("modal clauses keep V1, invert directly and distinguish inability, advice and prohibition", () => {
  const original = Math.random;
  Math.random = () => 0;
  try {
    assert.equal(buildModalQuestion("positive", "can").answer, "I can play football now.");
    const cannot = buildModalQuestion("negative", "can");
    assert.equal(cannot.answer, "I cannot play football now.");
    assert.equal(checkAnswer(cannot, "I can not play football now.").correct, true);
    assert.match(cannot.focused!.instruction, /Ketidakmampuan/);
    assert.equal(buildModalQuestion("yesNoQuestion", "can").answer, "Can I play football now?");
    const advice = buildModalQuestion("negative", "should");
    assert.equal(advice.answer, "I should not study English now.");
    assert.match(advice.focused!.instruction, /sebaiknya tidak/);
    const prohibition = buildModalQuestion("negative", "must");
    assert.equal(prohibition.answer, "I must not study English now.");
    assert.match(prohibition.focused!.instruction, /tidak boleh, bukan tidak perlu/);
    assert.equal(checkAnswer(prohibition, "I do not have to study English now.").correct, false);
    const question = buildModalQuestion("yesNoQuestion", "should");
    assert.equal(question.answer, "Should I study English now?");
    assert.equal(checkAnswer(question, "Do I should study English now?").correct, false);
    assert.equal(checkAnswer(question, "Must I study English now?").correct, false);
    assert.throws(() => buildModalQuestion("whQuestion", "can"), RangeError);
  } finally {
    Math.random = original;
  }
});

test("modal function/time filters cover only compatible patterns and cycle through all supported forms", () => {
  for (const fn of MODAL_FUNCTIONS) for (const time of MODAL_TIMES) {
    const selection = { modalFunction: fn.value, modalTime: time.value };
    const patterns = modalPatterns(selection);
    const filter: MultiQuizFilter = { ...DEFAULT_MULTI_FILTER, focus: "modals", ...selection };
    const combinations = quizCombinations(filter);
    assert.equal(combinations.length, patterns.reduce((n, p) => n + p.forms.length, 0));
    if (fn.value === "deduction" && time.value === "future") {
      assert.equal(combinations.length, 0);
      assert.throws(() => createQuestionCycle(filter), RangeError);
      continue;
    }
    assert.ok(combinations.length);
    const seen = new Set<string>();
    const cycle = createQuestionCycle(filter);
    for (let i = 0; i < combinations.length; i++) {
      const q = cycle();
      const detail = q.focused!.rows[0].detail;
      const p = patterns.find(item => detail.includes(` · ${item.label} · `))!;
      assert.ok(p, detail);
      assert.ok(p.forms.includes(q.form));
      assert.ok(detail.includes(fn.label) && detail.includes(time.label), detail);
      assert.equal(q.tense, time.value === "past" ? "pastSimple" : time.value === "future" ? "futureSimple" : "presentSimple");
      assert.equal(checkAnswer(q, q.answer).correct, true);
      seen.add(`${p.value}/${q.form}`);
    }
    assert.equal(seen.size, combinations.length);
  }
  for (const p of MODAL_PATTERNS) {
    const filter: MultiQuizFilter = { ...DEFAULT_MULTI_FILTER, focus: "modals", modalPattern: p.value };
    assert.equal(quizCombinations(filter).length, p.forms.length);
    for (const form of ["positive", "negative", "yesNoQuestion", "whQuestion"] as SentenceForm[]) {
      if (!p.forms.includes(form)) {
        assert.throws(() => buildModalQuestion(form, p.value), RangeError);
        assert.equal(quizCombinations({ ...filter, forms: [form] }).length, 0);
      } else {
        for (let i = 0; i < 8; i++) {
          const q = buildModalQuestion(form, p.value);
          assert.equal(checkAnswer(q, q.answer).correct, true);
          assert.equal(checkAnswer(q, q.answer.replace(q.timeSignal!, "last century")).correct, false);
        }
      }
    }
  }
  assert.deepEqual(modalForms({ modalPattern: "mustHave" }), ["positive"]);
  assert.deepEqual(modalForms({ modalPattern: "cannotHave" }), ["negative"]);
  assert.deepEqual(modalForms({ modalPattern: "couldPermission" }), ["yesNoQuestion"]);
  assert.equal(modalSummary({ modalFunction: "obligation", modalTime: "past", modalPattern: "hadTo" }), "Kewajiban · Masa lalu · had to");
});

test("modal time structures handle have to, be able/allowed to and perfect infinitives", () => {
  const original = Math.random;
  Math.random = () => 0;
  try {
    for (const [pattern, form, expected] of [
      ["hadTo", "positive", "I had to study English yesterday."],
      ["hadTo", "negative", "I did not have to study English yesterday."],
      ["hadTo", "yesNoQuestion", "Did I have to study English yesterday?"],
      ["willHaveTo", "negative", "I will not have to study English tomorrow."],
      ["willHaveTo", "yesNoQuestion", "Will I have to study English tomorrow?"],
      ["beAble", "positive", "I am able to play football now."],
      ["wasAble", "positive", "I was able to play football yesterday."],
      ["willAble", "negative", "I will not be able to play football tomorrow."],
      ["willAble", "yesNoQuestion", "Will I be able to play football tomorrow?"],
      ["wasAllowed", "positive", "I was allowed to open the door yesterday."],
      ["willAllowed", "negative", "I will not be allowed to open the door tomorrow."],
      ["couldPermission", "yesNoQuestion", "Could I open the door now?"],
      ["shouldHave", "positive", "I should have studied English yesterday."],
      ["shouldHave", "negative", "I should not have studied English yesterday."],
      ["shouldHave", "yesNoQuestion", "Should I have studied English yesterday?"],
      ["mustHave", "positive", "I must have known him yesterday."],
      ["cannotHave", "negative", "I cannot have known him yesterday."],
      ["mightHave", "negative", "I might not have known him yesterday."],
    ] as const) {
      const q = buildModalQuestion(form, pattern);
      assert.equal(q.answer, expected);
      assert.equal(checkAnswer(q, expected).correct, true);
    }
    const past = buildModalQuestion("positive", "mustHave");
    assert.equal(checkAnswer(past, "I must have knew him yesterday.").correct, false);
    assert.equal(checkAnswer(past, "I must has known him yesterday.").correct, false);
    assert.match(past.focused!.instruction, /kesimpulan kuat.*bukan kewajiban/);
    const unnecessary = buildModalQuestion("negative", "hadTo");
    assert.match(unnecessary.focused!.instruction, /tidak perlu, bukan tidak boleh/);
    assert.equal(checkAnswer(unnecessary, "I must not study English yesterday.").correct, false);
    assert.equal(checkAnswer(unnecessary, "I didn't have to study English yesterday.").correct, true);
    assert.equal(checkAnswer(unnecessary, "Yesterday, I didn't have to study English.").correct, true);
    const impossible = buildModalQuestion("negative", "cannotHave");
    assert.equal(checkAnswer(impossible, "I can't have known him yesterday.").correct, true);
    assert.equal(checkAnswer(impossible, "I might not have known him yesterday.").correct, false);
    assert.equal(checkAnswer(buildModalQuestion("negative", "mightHave"), "I mightn't have known him yesterday.").correct, true);
    assert.equal(checkAnswer(buildModalQuestion("positive", "mayHave"), "I must have known him yesterday.").correct, false);
    Math.random = () => 0.65;
    assert.match(buildModalQuestion("positive", "haveTo").answer, /^She has to /);
    assert.match(buildModalQuestion("negative", "haveTo").answer, /^She does not have to /);
    assert.match(buildModalQuestion("yesNoQuestion", "haveTo").answer, /^Does she have to /);
    assert.match(buildModalQuestion("positive", "wasAble").answer, /^She was able to /);
    Math.random = () => 0.3;
    assert.match(buildModalQuestion("positive", "wasAllowed").answer, /^We were allowed to /);
  } finally {
    Math.random = original;
  }
});

test("frequency focus honors supported filters and cycles through every combination", () => {
  const filter: MultiQuizFilter = { ...DEFAULT_MULTI_FILTER, focus: "frequencyAdverbs", focusPattern: "often" };
  const combinations = quizCombinations(filter);
  assert.equal(combinations.length, 36);
  assert.equal(quizCombinations({ ...filter, modes: ["passive"] }).length, 0);
  assert.equal(quizCombinations({ ...filter, forms: ["whQuestion"] }).length, 0);
  assert.equal(quizCombinations({ ...filter, tenses: ["presentContinuous"] }).length, 0);
  const cycle = createQuestionCycle(filter);
  const seen = new Set<string>();
  for (let i = 0; i < combinations.length; i++) {
    const q = cycle();
    seen.add(`${q.tense}/${q.mode}/${q.form}`);
    assert.ok(FREQUENCY_TENSES.includes(q.tense));
    assert.equal(q.focused?.rows[0].cues.time, "often");
    assert.match(q.focused!.rows[0].detail, new RegExp(TENSE_LABELS[q.tense]));
    assert.equal(checkAnswer(q, q.answer).correct, true);
    assert.equal(checkAnswer(q, q.answer.replace(/often/g, "always")).correct, false);
    assert.equal(checkAnswer(q, q.answer.replace(/often /g, "")).correct, false);
    for (const alternative of q.focused!.alternatives) assert.equal(checkAnswer(q, alternative).correct, true);
  }
  assert.equal(seen.size, 36);
});

test("frequency adverbs keep agreement, auxiliary placement and negative scope", () => {
  const original = Math.random;
  Math.random = () => 0;
  try {
    const make = (tense: Tense, mode: Mode, form: SentenceForm, adverb = "usually") => buildFrequencyQuestion(tense, mode, form, adverb);
    assert.equal(make("presentSimple", "verbal", "positive").answer, "I usually play football.");
    assert.equal(make("presentSimple", "nominal", "positive").answer, "I am usually careful.");
    assert.equal(make("presentPerfect", "verbal", "positive", "often").answer, "I have often played football.");
    assert.equal(make("pastSimple", "verbal", "yesNoQuestion").answer, "Did I usually play football?");
    assert.equal(make("futurePerfect", "verbal", "positive").answer, "I will usually have played football.");
    const negative = make("presentSimple", "verbal", "negative", "always");
    assert.equal(negative.answer, "I do not always play football.");
    assert.equal(checkAnswer(negative, "I don't always play football.").correct, true);
    assert.equal(checkAnswer(negative, "I always do not play football.").correct, false);
    const positive = make("presentSimple", "verbal", "positive");
    assert.equal(checkAnswer(positive, "Usually, I play football.").correct, true);
    assert.equal(checkAnswer(positive, "Usually, I plays football.").correct, false);
    const always = make("presentSimple", "verbal", "positive", "always");
    assert.equal(checkAnswer(always, "Always I play football.").correct, false);
    Math.random = () => 0.65;
    assert.equal(make("presentSimple", "verbal", "positive").answer, "She usually eats breakfast.");
    assert.equal(make("presentSimple", "verbal", "yesNoQuestion").answer, "Does she usually eat breakfast?");
    for (const adverb of FREQUENCY_ADVERBS) {
      assert.equal(make("pastPerfect", "nominal", "negative", adverb).focused!.rows[0].cues.time, adverb);
    }
  } finally {
    Math.random = original;
  }
});

test("indefinite person subjects use singular agreement and translate equivalent forms", () => {
  const work = VERBS.find(item => item.base === "work")!;
  const equivalents: Record<string, string> = {
    everyone: "everybody", everybody: "everyone", someone: "somebody", somebody: "someone",
    anyone: "anybody", anybody: "anyone", nobody: "no one", "no one": "nobody",
  };
  for (const text of INDEFINITE_PERSONS) {
    const subject = SUBJECTS.find(item => item.text === text)!;
    assert.equal(subject.number, "singular");
    assert.equal(subject.person, 3);
    const form = text === "anyone" || text === "anybody" ? "yesNoQuestion" : "positive";
    const answer = conjugateVerbal("presentSimple", subject, work, form);
    const q: Question = { subject, verb: work, tense: "presentSimple", mode: "verbal", form, answer };
    assert.match(answer, form === "yesNoQuestion" ? /^Does / : /works/i);
    assert.ok(sentenceTranslation(q));
    assert.ok(checkTranslationAnswer(q, answer.replace(new RegExp(text, "i"), equivalents[text])).correct);
    if (text === "nobody" || text === "no one") assert.equal(subjectFitsForm(subject, "negative"), false);
    if (text === "anyone" || text === "anybody") assert.equal(subjectFitsForm(subject, "positive"), false);
  }
  const everyone = SUBJECTS.find(subject => subject.text === "everyone")!;
  const negative: Question = { subject: everyone, verb: work, tense: "presentSimple", mode: "verbal",
    form: "negative", answer: conjugateVerbal("presentSimple", everyone, work, "negative") };
  assert.match(sentenceTranslation(negative)!.text, /^Tidak semua orang/);
});

test("focused quantifier and conditional cycles keep their pattern and accept supported answers", () => {
  for (const focus of ["quantifiers", "conditionals"] as const) {
    for (const pattern of FOCUS_PATTERNS[focus]) {
      const cycle = createQuestionCycle({ ...DEFAULT_MULTI_FILTER, focus, focusPattern: pattern.value });
      for (let i = 0; i < 12; i++) {
        const q = cycle();
        assert.ok(q.focused?.rows[0].detail.startsWith(pattern.value));
        assert.ok(checkAnswer(q, q.answer).correct);
        for (const alternative of q.focused?.alternatives ?? []) assert.ok(checkAnswer(q, alternative).correct);
        assert.equal(checkAnswer(q, "incorrect answer").correct, false);
      }
    }
  }
});

test("relative clause focus respects the requested pronoun", () => {
  for (const pronoun of ["who", "which"] as const) {
    const cycle = createQuestionCycle({ ...DEFAULT_MULTI_FILTER, focus: "relativeClause", focusPattern: pronoun });
    for (let i = 0; i < 50; i++) {
      const question = cycle();
      assert.equal(question.relativeClause?.pronoun, pronoun);
      assert.ok(checkAnswer(question, question.answer).correct);
    }
  }
});

test("quantifier filters generate every supported tense, sentence type and form", () => {
  for (const tense of ["presentSimple", "pastSimple", "futureSimple"] as const) {
    for (const mode of ["verbal", "nominal", "passive"] as const) {
      for (const form of ["positive", "negative", "yesNoQuestion"] as const) {
        const cycle = createQuestionCycle({ ...DEFAULT_MULTI_FILTER, focus: "quantifiers", focusPattern: "many",
          tenses: [tense], modes: [mode], forms: [form] });
        const q = cycle();
        assert.equal(q.tense, tense);
        assert.equal(q.mode, mode);
        assert.equal(q.form, form);
        assert.match(q.answer, /many books/i);
        assert.equal(q.focused?.rows[0].cues.subject, mode === "verbal" ? q.subject.text : "many books");
        assert.ok(q.focused?.rows[0].cues.verb);
        assert.match(q.focused!.rows[0].detail, /Positive|Negative|Yes\/No/);
        assert.ok(checkAnswer(q, q.answer).correct);
        if (form === "negative") assert.match(q.answer, /\bnot\b/i);
        if (form === "yesNoQuestion") assert.ok(q.answer.endsWith("?"));
      }
    }
  }
  assert.equal(quizCombinations({ ...DEFAULT_MULTI_FILTER, focus: "quantifiers",
    tenses: ["presentContinuous"] }).length, 0);
});

test("conditional pattern and form filters keep both clause orders", () => {
  for (const pattern of ["zero", "first", "second", "third"] as const) {
    for (const form of ["positive", "negative", "yesNoQuestion"] as const) {
      const cycle = createQuestionCycle({ ...DEFAULT_MULTI_FILTER, focus: "conditionals",
        focusPattern: pattern, modes: ["verbal"], forms: [form] });
      const q = cycle();
      assert.equal(q.form, form);
      assert.equal(q.focused?.rows[0].detail, pattern);
      assert.deepEqual(q.focused?.rows.map(row => row.label), ["Syarat", "Hasil"]);
      assert.equal(q.focused?.rows[0].cues.wh, "if");
      assert.ok(q.focused?.rows.every(row => row.cues.subject && row.cues.verb));
      assert.ok(checkAnswer(q, q.answer).correct);
      for (const alternative of q.focused?.alternatives ?? []) assert.ok(checkAnswer(q, alternative).correct);
      if (form === "negative") assert.match(q.answer, /\bnot\b/i);
      if (form === "yesNoQuestion") assert.ok(q.answer.endsWith("?"));
    }
  }
});

test("reason practice accepts both clause orders and keeps the direction of the explanation", t => {
  const random = t.mock.method(Math, "random", () => 0);
  for (const tense of ["presentSimple", "pastSimple"] as const) {
    for (let scenario = 0; scenario < 4; scenario++) {
      for (let person = 0; person < 5; person++) {
        const picks = [scenario / 4, person / 5];
        random.mock.mockImplementation(() => picks.shift()!);
        const q = buildReasonQuestion(tense);
        const reason = q.reasonClause!;
        const resultFirst = q.answer.split(" because ")[0];
        assert.ok(checkAnswer(q, q.answer).correct);
        assert.ok(checkAnswer(q, reason.frontedAnswer).correct);
        assert.ok(!checkAnswer(q, resultFirst).correct);
        assert.ok(!checkAnswer(q, reason.clause + " because " + resultFirst).correct);
        assert.match(checkAnswer(q, q.answer.replace(" because ", " although ")).hint, /because/i);
        for (const answer of [q.answer, reason.frontedAnswer]) {
          assert.ok(sentenceReading(answer, q), answer);
          assert.ok(sentenceGuide({ ...q, answer }).parts.some(p => p.role === "Klausa alasan" && p.text.toLowerCase().startsWith("because ")));
        }
        assert.equal(initialExplorerQuestion(q).answer, resultFirst + ".");
        assert.equal(initialExplorerQuestion(q).reasonClause, undefined);
      }
    }
  }
});

test("cause practice cycles both tenses without repeating adjacent situations", () => {
  const next = createQuestionCycle({ ...DEFAULT_MULTI_FILTER, focus: "reasonClause" });
  let previous: Question | undefined;
  for (let i = 0; i < 12; i++) {
    const q = next();
    assert.ok(q.reasonClause);
    assert.notEqual(q.verb!.base, previous?.verb?.base);
    assert.notEqual(q.tense, previous?.tense);
    previous = q;
  }
});

test("reason practice only generates the chosen supported combinations", () => {
  const filter: MultiQuizFilter = { ...DEFAULT_MULTI_FILTER, focus: "reasonClause", tenses: ["pastSimple", "futureSimple"] };
  assert.deepEqual(quizCombinations(filter), [{ tense: "pastSimple", mode: "verbal", form: "positive" }]);
  const next = createQuestionCycle(filter);
  for (let i = 0; i < 4; i++) assert.equal(next().tense, "pastSimple");
  assert.deepEqual(quizCombinations({ ...filter, tenses: [] }), []);
  assert.deepEqual(quizCombinations({ ...filter, forms: ["negative"] }), []);
  assert.deepEqual(quizCombinations({ ...filter, modes: ["passive"] }), []);
});

test("relative focus keeps the selected main grammar and attaches a grounded who/which clause", () => {
  const filter: MultiQuizFilter = { ...DEFAULT_MULTI_FILTER, focus: "relativeClause" };
  const combinations = quizCombinations(filter);
  const cycle = createQuestionCycle(filter);
  const seen = new Set<string>();
  let previous: string | undefined;
  for (const _combination of combinations) {
    const q = cycle();
    const r = q.relativeClause!;
    assert.notEqual(r.antecedent, previous);
    previous = r.antecedent;
    seen.add([q.tense, q.mode, q.form].join("/"));
    assert.equal(q.answer.replace(`, ${r.clause},`, ""), r.mainSentence);
    assert.ok(sentenceTranslation(q)?.text.includes(r.meaning), q.answer);
    assert.ok(sentenceGuide(q).parts.some(part => part.role === "Klausa relatif"));
    assert.ok(checkAnswer(q, q.answer).correct);
    assert.ok(sentenceReading(q.answer, q), q.answer);
    assert.ok(!checkAnswer(q, r.mainSentence).correct);
    assert.equal(initialExplorerQuestion(q).answer, r.mainSentence);
    for (const alternative of r.alternatives) {
      assert.ok(checkAnswer(q, q.answer.replace(r.clause, alternative)).correct);
    }
  }
  assert.equal(seen.size, combinations.length);
});

test("person and thing clauses each have present and past prompts and pronoun-specific feedback", t => {
  let choices: number[] = [];
  t.mock.method(Math, "random", () => choices.shift()!);
  for (const sample of [
    { noun: 0, event: 0, pronoun: "who", tense: "presentSimple" },
    { noun: 0, event: .99, pronoun: "who", tense: "pastSimple" },
    { noun: .99, event: 0, pronoun: "which", tense: "pastSimple" },
    { noun: .99, event: .99, pronoun: "which", tense: "presentSimple" },
  ]) {
    choices = [sample.noun, sample.event, sample.event, sample.event];
    const q = buildRelativeQuestion("presentSimple", "nominal", "positive");
    const r = q.relativeClause!;
    assert.equal(r.pronoun, sample.pronoun);
    assert.equal(r.tense, sample.tense);
    assert.doesNotMatch(Object.values(r.cues).join(" "), /\b(who|which)\b/i);
    const wrong = checkAnswer(q, q.answer.replace(r.pronoun, "that"));
    assert.equal(wrong.correct, false);
    assert.match(wrong.hint, /That/);
    assert.ok(wrong.hint.includes(r.antecedent));
    for (const clause of r.alternatives) {
      assert.ok(checkAnswer(q, q.answer.replace(r.clause, clause)).correct);
    }
  }
});

test("relative questions accept active and passive descriptions but still require the pronoun, agreement and tense", t => {
  t.mock.method(Math, "random", () => 0.58);
  const q = buildRelativeQuestion("presentSimple", "verbal", "positive");
  const r = q.relativeClause!;
  assert.equal(r.pronoun, "which");
  assert.ok(checkAnswer(q, q.answer.replace(r.clause, r.alternatives[0])).correct);
  assert.ok(!checkAnswer(q, q.answer.replace("which", "who")).correct);
  assert.ok(!checkAnswer(q, q.answer.replace("works", "work")).correct);
  assert.ok(!checkAnswer(q, q.answer.replace("works", "worked")).correct);
  assert.ok(!checkAnswer(q, q.answer.replace(r.clause + ",", r.clause + " it,")).correct);
});

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
