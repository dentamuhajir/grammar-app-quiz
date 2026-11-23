import assert from "node:assert/strict";
import test from "node:test";
import { BASICS_POOL, BASICS_TOPIC_GUIDES, checkBasicsAnswer, completedSentence, createDeck, mistakeHint, NO_WORD, type BasicsTopic } from "../src/grammar/basics/engine";
import { BASICS_LABELS } from "../src/grammar/labels";
import { checkAnswer } from "../src/grammar/check";
import { DEFAULT_FILTER, generateQuestion } from "../src/grammar/generator";
import { FOR_SINCE, FOR_SINCE_LESSONS, checkForSinceWriting, referenceSentence } from "../src/grammar/forSince";
import { dueReviews, reviewLesson, saveAttempt } from "../src/grammar/writingReview";
import { INTERESTED_IN, INTEREST_LESSONS, checkInterestWriting } from "../src/grammar/interestedIn";
import { packForLesson, WRITING_PACKS } from "../src/grammar/writingPacks";
import { ARTICLE_WRITING, ARTICLE_LESSONS, checkArticleWriting } from "../src/grammar/articleWriting";
import { TOPIC_WRITING_LESSONS, checkTopicWriting } from "../src/grammar/topicWriting";
import { normalize } from "../src/grammar/check/normalize";

test("writing applies the rule to a new sentence and rejects copying the recognition answer", () => {
  for (const pack of WRITING_PACKS) for (const lesson of pack.lessons) {
    const source = question(lesson.id);
    const previous = completedSentence(source).replace(/\([^)]*\)/g, "").trim();
    assert.notEqual(normalize(lesson.reference), normalize(previous), lesson.id);
    assert.equal(lesson.check(previous).status, "retry", lesson.id);
    assert.equal(lesson.check(lesson.reference).status, "correct", lesson.id);
  }
  const pack = packForLesson("write-collocations-decision");
  const lesson = pack.lessons.find(item => item.id === "write-collocations-decision")!;
  assert.equal(lesson.reference, "Olivia needs to make a decision before Friday.");
  assert.equal(question(lesson.id).prompt, "We need to ___ a decision.");
  assert.equal(lesson.check("Olivia need to make a decision before Friday.").status, "retry");
  assert.match(lesson.explanation, /needs/);
});

test("guided topics link their writing situations to blank questions and accept curated alternatives", () => {
  assert.equal(TOPIC_WRITING_LESSONS.length, 92);
  const topics = new Set(TOPIC_WRITING_LESSONS.map(lesson => lesson.topic));
  assert.equal(topics.size, 13);
  for (const topic of topics) {
    assert.ok(TOPIC_WRITING_LESSONS.filter(lesson => lesson.topic === topic).length >= 3);
  }
  for (const lesson of TOPIC_WRITING_LESSONS) {
    const q = question(lesson.id);
    assert.equal(q.topic, lesson.topic);
    assert.equal(checkBasicsAnswer(q, lesson.answer), "correct");
    assert.equal(packForLesson(lesson.id).skill, q.skillId);
    assert.ok(createDeck(lesson.topic).some(item => item.id === lesson.id));
    for (const variant of lesson.variants) {
      assert.equal(checkTopicWriting(lesson, "  " + variant.toUpperCase() + "! ").status, "correct", variant);
      assert.equal(checkTopicWriting(lesson, variant + " not").status, "retry");
    }
    assert.equal(checkTopicWriting(lesson, "").status, "empty");
    assert.equal(checkTopicWriting(lesson, "I like apples").status, "retry");
  }
});

test("guided writing rejects mistakes in grammar and meaning while accepting contractions", () => {
  const cases = [
    ["write-plurals-books", "Emma has three book"],
    ["write-pronouns-her", "This is she bicycle"],
    ["write-quantifiers-many", "How much notebooks do you need"],
    ["write-comparatives-taller", "James is tallest than Daniel"],
    ["write-adjectives-carefully", "He walks careful"],
    ["write-relatives-who", "The man who work at the library is a teacher"],
    ["write-modals-rest", "He should to rest"],
    ["write-conjunctions-because", "She stayed home so she was tired"],
    ["write-conditionals-rain", "If it will rain Emma will take the bus"],
    ["write-collocations-decision", "Olivia needs to do a decision before Friday"],
  ];
  for (const [id, input] of cases) {
    const lesson = TOPIC_WRITING_LESSONS.find(item => item.id === id)!;
    assert.equal(checkTopicWriting(lesson, input).status, "retry", input);
  }
  for (const [id, input] of [
    ["write-quantifiers-much", "I don't have much money."],
    ["write-conditionals-rich", "If he were rich, he'd buy a house."],
    ["write-conditionals-rain", "Emma will take the bus if it rains."],
  ]) {
    const lesson = TOPIC_WRITING_LESSONS.find(item => item.id === id)!;
    assert.equal(checkTopicWriting(lesson, input).status, "correct", input);
  }
});

test("expanded practice includes question formation and 110 writing situations without duplicate IDs", () => {
  assert.equal(BASICS_POOL.filter(q => q.topic === "questions").length, 12);
  const writing = WRITING_PACKS.flatMap(pack => pack.lessons);
  assert.equal(writing.length, 110);
  assert.equal(new Set(writing.map(lesson => lesson.id)).size, writing.length);
  for (const topic of Object.keys(BASICS_LABELS)) {
    assert.ok(BASICS_POOL.some(q => q.topic === topic));
  }
});

test("expanded patterns reject grammar mistakes and changes to the requested meaning", () => {
  const mistakes = [
    ["write-gerunds-remember-memory", "I remember to meet Ana"],
    ["write-gerunds-remember-task", "Please remember calling Ana later"],
    ["write-gerunds-stop-purpose", "I stopped eating lunch"],
    ["write-gerunds-try-method", "Try to read a book"],
    ["write-phrasalVerbs-figure", "We finally figured out it"],
    ["write-causatives-get-person", "I will get a mechanic check my car"],
    ["write-causatives-have-thing", "I had my bike repair yesterday"],
    ["write-collocations-mind", "Would you mind to close the door?"],
    ["write-gerunds-enjoy", "They enjoy to cook dinner"],
    ["write-gerunds-want", "She wants visiting London"],
    ["write-gerunds-avoid", "I avoid to drive at night"],
    ["write-gerunds-decide", "We decided staying home"],
    ["write-gerunds-finish", "She finished to clean the kitchen yesterday"],
    ["write-gerunds-hope", "I hope visiting you soon"],
    ["write-quantifiers-a-few", "We have few questions"],
    ["write-quantifiers-few", "A few students understood the lesson"],
    ["write-quantifiers-a-little", "She has little money left"],
    ["write-quantifiers-little", "There is a little water left"],
    ["write-pronouns-his", "This is him notebook"],
    ["write-pronouns-hers", "This bicycle is her"],
    ["write-pronouns-ours", "These seats are our"],
    ["write-pronouns-him", "We invited he yesterday"],
    ["write-modals-could", "I could rode a bike when I was seven"],
    ["write-modals-may", "They may arrives late"],
    ["write-modals-must-not", "You do not have to park here"],
    ["write-modals-cannot", "She can reach the shelf"],
    ["write-conditionals-third", "If she left earlier she would catch the bus"],
    ["write-conditionals-third-negative", "If I had set the alarm I would have been late"],
    ["write-conditionals-first-negative", "If we will not hurry we will miss the bus"],
    ["write-conditionals-second-negative", "If I were you I will not eat that food"],
    ["write-comparatives-as", "This room is as larger as that one"],
    ["write-comparatives-less", "This coat is least expensive than that jacket"],
    ["write-relatives-whose", "The woman who dog is brown is my neighbor"],
    ["write-relatives-which", "The train which leave at nine goes to London"],
    ["write-conjunctions-although", "Although she was nervous but she gave the presentation"],
    ["write-conjunctions-unless", "I will stay home unless the weather does not improve"],
    ["write-plurals-uncountable", "This advice are useful"],
    ["write-collocations-attention", "Please pay attention the teacher"],
  ];
  for (const [id, input] of mistakes) {
    const lesson = TOPIC_WRITING_LESSONS.find(item => item.id === id)!;
    assert.equal(checkTopicWriting(lesson, input).status, "retry", input);
  }
  for (const [id, input] of [
    ["write-modals-must-not", "You mustn't park here."],
    ["write-causatives-have-person", "I'll have a mechanic check my car."],
    ["write-causatives-help", "Ana helped me to carry the bag yesterday."],
    ["write-modals-cannot", "She can't reach the shelf."],
    ["write-conditionals-third", "She'd have caught the bus if she'd left earlier."],
    ["write-conditionals-third-negative", "If I'd set the alarm, I wouldn't have been late."],
    ["write-conditionals-first-negative", "We'll miss the bus if we don't hurry."],
    ["write-conditionals-second-negative", "If I were you, I wouldn't eat that food."],
  ]) {
    const lesson = TOPIC_WRITING_LESSONS.find(item => item.id === id)!;
    assert.equal(checkTopicWriting(lesson, input).status, "correct", input);
  }
});

function question(id: string) {
  const result = BASICS_POOL.find((q) => q.id === id);
  assert.ok(result, id);
  return result;
}

test("the six for/since blanks each link to a writing situation and give a meaning hint before the answer", () => {
  const deck = createDeck(FOR_SINCE);
  assert.equal(deck.length, 6);
  assert.deepEqual(new Set(deck.map(q => q.id)), new Set(FOR_SINCE_LESSONS.map(item => item.id)));
  for (const lesson of FOR_SINCE_LESSONS) {
    const blank = question(lesson.id);
    assert.equal(blank.skillId, FOR_SINCE);
    assert.equal(checkBasicsAnswer(blank, lesson.preposition), "correct");
    assert.doesNotMatch(blank.hint, /\b(for|since)\b/i);
    assert.equal(checkForSinceWriting(lesson, referenceSentence(lesson)).status, "correct");
    assert.equal(checkForSinceWriting(lesson, referenceSentence(lesson).replace(lesson.preposition, lesson.preposition === "for" ? "since" : "for")).status, "retry");
    assert.equal(checkForSinceWriting(lesson, " ").status, "empty");
  }
});

test("writing accepts natural variants and preserves duration, polarity, subject, and stative meaning", () => {
  const [work, live, know, study] = FOR_SINCE_LESSONS;
  for (const answer of ["I’ve worked here for 3 years.", "For three years, I have been working here.", "I've worked here for the past three years."]) {
    assert.equal(checkForSinceWriting(work, answer).status, "correct", answer);
  }
  for (const answer of ["I haven't worked here for three years.", "I have worked here for two years.", "We have worked here for three years."]) {
    assert.equal(checkForSinceWriting(work, answer).status, "retry", answer);
  }
  assert.equal(checkForSinceWriting(live, "Ever since 2021, I've been living in Bandung.").status, "correct");
  assert.equal(checkForSinceWriting(study, "She's studied English since January.").status, "correct");
  assert.equal(checkForSinceWriting(know, "I've been knowing Rina for two years.").status, "retry");
});

test("interest pack links six blanks to six guided sentences and keeps both original topic entries", () => {
  const deck = createDeck(INTERESTED_IN);
  assert.equal(deck.length, 6);
  const pack = packForLesson("prep-adj-interested-in");
  assert.deepEqual(new Set(deck.map(q => q.id)), new Set(pack.lessons.map(q => q.id)));
  assert.equal(question("prep-adj-interested-in").topic, "prepositions");
  assert.equal(question("gerund-prep-in-learn").topic, "gerunds");
  for (const lesson of pack.lessons) {
    const blank = question(lesson.id);
    assert.equal(checkBasicsAnswer(blank, blank.answer), "correct");
    assert.ok(!blank.hint.toLowerCase().split(/\W+/).includes(blank.answer));
    assert.equal(lesson.check(lesson.reference).status, "correct");
    assert.equal(lesson.check(" ").status, "empty");
  }
});

test("interest feedback covers subject, preposition and activity form while accepting contractions and equivalents", () => {
  const [japanese, chess, birds, bread] = INTEREST_LESSONS;
  for (const input of ["I’m interested in learning Japanese.", "I am really interested in learning Japanese."]) {
    assert.equal(checkInterestWriting(japanese, input).status, "correct");
  }
  assert.equal(checkInterestWriting(chess, "She's interested in joining the chess club.").status, "correct");
  assert.equal(checkInterestWriting(bread, "Rina’s interested in baking her own bread.").status, "correct");
  const alternate = checkInterestWriting(birds, "We're interested in photographing birds.");
  assert.equal(alternate.status, "correct");
  assert.match(alternate.message, /photographing birds/);
  for (const input of ["She is interested in learning Japanese.", "I am not interested in learning Japanese.",
    "I am interesting in learning Japanese.", "I am interested on learning Japanese.", "I am interested in learn Japanese.",
    "I am interested in learning Korean."]) assert.equal(checkInterestWriting(japanese, input).status, "retry", input);
  assert.match(checkInterestWriting(japanese, "I'm interested in learn Japanese.").message, /kegiatan/);
});

test("article pack links existing recognition items to two-sentence writing in the same review group", () => {
  const deck = createDeck(ARTICLE_WRITING);
  assert.equal(deck.length, 6);
  assert.deepEqual(deck.map(q => q.answer).sort(), ["a", "a", "an", "an", "the", "the"]);
  for (const blank of deck) {
    assert.equal(blank.topic, "articles");
    assert.ok(blank.context);
    assert.doesNotMatch(blank.hint, /\b(a|an|the)\b/i);
    const pack = packForLesson(blank.id);
    assert.equal(pack.skill, ARTICLE_WRITING);
    const lesson = pack.lessons.find(q => q.id === blank.id)!;
    assert.equal(lesson.check(lesson.reference).status, "correct");
    assert.equal(lesson.check(" ").status, "empty");
    const review = reviewLesson({ activity: "basics", lessonId: blank.id, practicedId: blank.id, dueAt: 0 });
    assert.notEqual(review.id, blank.id);
    assert.equal(review.group, lesson.group);
    assert.equal(packForLesson(review.id).skill, ARTICLE_WRITING);
  }
});

test("article checker accepts guided alternatives and identifies the sentence needing revision", () => {
  const [cat, uniform, umbrella, box, man, bike] = ARTICLE_LESSONS;
  assert.equal(checkArticleWriting(cat, "Yesterday, I saw a cat. The cat was asleep.").status, "correct");
  assert.equal(checkArticleWriting(box, "I opened a box.\nThe box turned out to be empty.").status, "correct");
  assert.equal(checkArticleWriting(bike, "WE RENTED A BICYCLE\nThe bike was red").status, "correct");
  assert.match(checkArticleWriting(uniform, "I bought an uniform. The uniform was blue.").message, /bunyi/);
  assert.match(checkArticleWriting(man, "I met a honest man. The man helped me.").message, /bunyi/);
  assert.match(checkArticleWriting(umbrella, "I found the umbrella. The umbrella was wet.").message, /memperkenalkan/);
  assert.match(checkArticleWriting(cat, "I saw a cat. A cat was sleeping.").message, /sebelumnya/);
  assert.match(checkArticleWriting(cat, "I saw a cat. It was sleeping.").message, /Kata ganti/);
  assert.equal(checkArticleWriting(cat, "I saw a cat. The cat was not sleeping.").status, "retry");
  assert.equal(checkArticleWriting(cat, "I saw a cat.").status, "retry");
});

test("local review keeps the first attempt, waits three days, changes situation and clears only on unaided review", t => {
  const entries = new Map<string, string>();
  const storage = { getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value), removeItem: (key: string) => entries.delete(key) };
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  t.after(() => previous ? Object.defineProperty(globalThis, "localStorage", previous) : Reflect.deleteProperty(globalThis, "localStorage"));
  const slot = { lessonId: FOR_SINCE_LESSONS[0].id, activity: "basics" } as const;
  const threeDays = 3 * 86400000;
  saveAttempt(slot, "incorrect", "incorrect", false, undefined, 0);
  saveAttempt(slot, "incorrect", "correct", true, undefined, 1);
  const latest = JSON.parse([...entries].find(([key]) => key.endsWith(".last"))![1]);
  assert.equal(latest.first, "incorrect");
  assert.equal(latest.outcome, "correct");
  assert.equal(latest.hintUsed, true);
  assert.equal(dueReviews(threeDays - 1).length, 0);
  saveAttempt(slot, "correct", "correct", false, undefined, 2);
  const [due] = dueReviews(threeDays);
  const fresh = reviewLesson(due);
  assert.notEqual(fresh.id, slot.lessonId);
  assert.equal(fresh.group, FOR_SINCE_LESSONS[0].preposition);
  const writing = { lessonId: fresh.id, activity: "sentence" } as const;
  saveAttempt(writing, "correct", "correct", true, due, threeDays);
  assert.equal(dueReviews(threeDays).length, 0);
  const [again] = dueReviews(2 * threeDays);
  const next = reviewLesson(again);
  assert.notEqual(next.id, fresh.id);
  saveAttempt({ ...writing, lessonId: next.id }, "correct", "correct", false, again, 2 * threeDays);
  assert.equal(dueReviews(3 * threeDays).length, 0);

  // Existing for/since schedules and the second pack share a queue but retain independent storage keys.
  storage.setItem("grammar-drill.for_since.v1.basics." + slot.lessonId,
    JSON.stringify({ ...slot, practicedId: slot.lessonId, dueAt: threeDays }));
  const interest = { lessonId: INTEREST_LESSONS[0].id, activity: "basics" } as const;
  saveAttempt(interest, "revealed", "revealed", false, undefined, 1);
  const both = dueReviews(threeDays + 1);
  assert.deepEqual(both.map(row => row.lessonId), [slot.lessonId, interest.lessonId]);
  const otherInterest = reviewLesson(both[1]);
  assert.notEqual(otherInterest.id, interest.lessonId);
  assert.equal(packForLesson(otherInterest.id).skill, INTERESTED_IN);
  saveAttempt({ lessonId: otherInterest.id, activity: "sentence" }, "correct", "correct", false, both[1], threeDays + 2);
  assert.deepEqual(dueReviews(threeDays + 2).map(row => row.lessonId), [slot.lessonId]);
});

test("all generated questions have one blank, hints, and unique IDs", () => {
  assert.equal(new Set(BASICS_POOL.map((q) => q.id)).size, BASICS_POOL.length);
  for (const q of BASICS_POOL) {
    assert.equal(q.prompt.split("___").length, 2, q.id);
    assert.ok(q.explanation.length > 20, q.id);
    assert.ok(q.hint.length > 15, q.id);
    assert.ok(q.answer.trim(), q.id);
    assert.equal(checkBasicsAnswer(q, q.answer), "correct", q.id);
    if (q.answer === NO_WORD) {
      assert.equal(checkBasicsAnswer(q, "-"), "correct", q.id);
    }
    assert.ok(!completedSentence(q).includes("___"), q.id);
    assert.ok(!completedSentence(q).includes(NO_WORD), q.id);
  }
});

test("each topic deck covers its pool exactly once and avoids the previous boundary item", () => {
  for (const filter of ["all", ...Object.keys(BASICS_LABELS)] as const) {
    const typedFilter = filter as Parameters<typeof createDeck>[0];
    const deck = createDeck(typedFilter);
    const expected = BASICS_POOL.filter((q) => filter === "all" || q.topic === filter);
    assert.deepEqual(new Set(deck.map((q) => q.id)), new Set(expected.map((q) => q.id)));
    assert.equal(deck.length, expected.length);
    for (let i = 0; i < 20; i++) assert.notEqual(createDeck(typedFilter, deck[0].id)[0].id, deck[0].id);
  }
});

test("no word must be selected explicitly; whitespace and case are tolerated", () => {
  const q = question("article-language-English");
  assert.equal(checkBasicsAnswer(q, "  "), "empty");
  assert.equal(checkBasicsAnswer(q, NO_WORD), "correct");
  assert.equal(checkBasicsAnswer(q, "the"), "incorrect");
  assert.equal(completedSentence(q), "We speak English at home.");
  const general = question("article-general-Cats");
  assert.equal(completedSentence(general), "Cats need water.");
  assert.equal(checkBasicsAnswer(question("plural-child-two"), "  CHILDREN  "), "correct");
});

test("sound rules, irregulars, and time expressions have accurate keys", () => {
  const cases = {
    "article-role-Maya-university student": "a",
    "article-role-Maya-honest person": "an",
    "article-known-book": "the",
    "article-unique-sun": "the",
    "plural-child-two": "children",
    "plural-baby-three": "babies",
    "plural-toy-two": "toys",
    "plural-sheep-five": "sheep",
    "plural-book-one": "book",
    "prep-time-Monday": "on",
    "prep-time-July": "in",
    "prep-time-noon": "at",
    "prep-time-next Monday": NO_WORD,
    "prep-point-bus-stop": "at",
    "pronoun-obj-me": "me",
    "pronoun-posadj-my": "my",
    "pronoun-pospro-mine": "mine",
    "pronoun-refl-myself": "myself",
    "quant-much-water": "much",
    "quant-many-books": "many",
    "quant-some-milk": "some",
    "quant-any-bread": "any",
    "quant-afew-minutes": "a few",
    "quant-alittle-salt": "a little",
    "comp-comp-taller": "taller",
    "comp-comp-heavier": "heavier",
    "comp-comp-expensive": "more expensive",
    "comp-sup-interesting": "most interesting",
    "comp-comp-better": "better",
    "comp-sup-worst": "worst",
    "adjadv-adv-fluently": "fluently",
    "adjadv-irreg-well": "well",
    "adjadv-irreg-hard": "hard",
    "adjadv-ed-bored": "bored",
    "adjadv-ing-boring": "boring",
    "gerund-subject-swim": "swimming",
    "gerund-prep-without-say": "saying",
    "gerund-verb-enjoy-read": "reading",
    "infinitive-verb-decide-buy": "to buy",
    "rel-nondef-which-laptop": "which",
    "rel-that-only-best-movie": "that",
    "rel-def-thing-book": "that",
    "rel-who-doctor": "who",
    "rel-whose-student": "whose",
    "rel-where-cafe": "where",
    "modal-ability-now-swim": "can",
    "modal-ability-past-run": "could",
    "modal-advice-rest": "should",
    "modal-obligation-seatbelt": "must",
    "modal-prohibition-smoke": "must not",
    "modal-possibility-rain": "might",
    "conj-contrast-but": "but",
    "conj-contrast-although-front": "although",
    "conj-reason-because": "because",
    "conj-result-so": "so",
    "conj-condition-if": "if",
    "conj-condition-unless": "unless",
    "conj-time-until": "until",
    "conj-time-while": "while",
    "prep-dur-for-hours": "for",
    "prep-dur-since-2022": "since",
    "prep-adj-interested-in": "in",
    "prep-adj-good-at": "at",
    "prep-used-to-past": "used to",
    "prep-be-used-to-ing": "am used to",
    "cond-zero-boil": "boils",
    "cond-first-study": "will study",
    "cond-second-money": "would buy",
    "cond-third-study": "would have passed",
    "cond-mixed-sleep": "would not be",
    "colloc-give-feedback": "give",
    "colloc-make-decision": "make",
    "colloc-make-progress": "make",
    "colloc-pay-attention": "pay",
    "colloc-gain-experience": "gain",
    "colloc-take-responsibility": "take",
  };
  for (const [id, answer] of Object.entries(cases)) assert.equal(question(id).answer, answer, id);
  // Defining relative clauses accept both that and which; non-defining comma clauses require which
  assert.equal(checkBasicsAnswer(question("rel-def-thing-book"), "which"), "correct");
  assert.equal(checkBasicsAnswer(question("rel-def-thing-book"), "that"), "correct");
  assert.equal(checkBasicsAnswer(question("rel-nondef-which-laptop"), "that"), "incorrect");
  assert.match(mistakeHint(question("rel-nondef-which-laptop"), "that"), /koma/);
  assert.match(mistakeHint(question("rel-where-cafe"), "which"), /where/);
  assert.equal(checkBasicsAnswer(question("infinitive-verb-decide-buy"), "  to   buy "), "correct");
  assert.match(mistakeHint(question("infinitive-verb-decide-buy"), "buying"), /to-infinitive/);
  // Pronouns, Quantifiers, Comparatives, Adjectives/Adverbs
  assert.match(mistakeHint(question("pronoun-pospro-mine"), "my"), /mine/);
  assert.match(mistakeHint(question("pronoun-posadj-my"), "mine"), /my/);
  assert.match(mistakeHint(question("quant-much-water"), "many"), /much/);
  assert.match(mistakeHint(question("quant-any-bread"), "some"), /any/);
  assert.match(mistakeHint(question("comp-comp-taller"), "more tall"), /taller/);
  assert.match(mistakeHint(question("comp-comp-better"), "gooder"), /better/);
  assert.match(mistakeHint(question("adjadv-ed-bored"), "boring"), /bored/);
  assert.match(mistakeHint(question("adjadv-irreg-hard"), "hardly"), /hard/);
  // Modals & Conjunctions
  assert.equal(checkBasicsAnswer(question("modal-prohibition-smoke"), "mustn't"), "correct");
  assert.equal(checkBasicsAnswer(question("modal-possibility-rain"), "may"), "correct");
  assert.match(mistakeHint(question("modal-ability-past-run"), "can"), /could/);
  assert.equal(checkBasicsAnswer(question("conj-contrast-although-front"), "even though"), "correct");
  assert.match(mistakeHint(question("conj-contrast-although-front"), "but"), /although/);
  assert.match(mistakeHint(question("conj-condition-unless"), "if"), /unless/);
  // Expanded Prepositions, Conditionals, Collocations
  assert.match(mistakeHint(question("prep-dur-for-hours"), "since"), /for/);
  assert.match(mistakeHint(question("prep-dur-since-2022"), "for"), /since/);
  assert.match(mistakeHint(question("cond-first-rain"), "will rain"), /rains/);
  assert.match(mistakeHint(question("cond-third-study"), "would pass"), /would have passed/);
  assert.match(mistakeHint(question("colloc-make-decision"), "do"), /make a decision/);
});

test("existing sentence generator and checker still agree", () => {
  for (let i = 0; i < 100; i++) {
    const q = generateQuestion(DEFAULT_FILTER);
    assert.equal(checkAnswer(q, q.answer).correct, true, q.answer);
  }
});

test("every basics topic has a complete topic guide and questions avoid spoiler contexts", () => {
  for (const topic of Object.keys(BASICS_LABELS) as BasicsTopic[]) {
    const guide = BASICS_TOPIC_GUIDES[topic];
    assert.ok(guide, `missing guide for ${topic}`);
    assert.ok(guide.summary.length > 20, topic);
    assert.ok(guide.rules.length >= 3, topic);
    assert.ok(guide.examples.length >= 3, topic);
  }
  for (const q of BASICS_POOL) {
    if (q.topic === "conditionals" || q.topic === "quantifiers" || q.topic === "modals" || q.topic === "prepositions") {
      assert.equal(q.context, undefined, `unexpected spoiler context on ${q.id}`);
    }
  }
});
