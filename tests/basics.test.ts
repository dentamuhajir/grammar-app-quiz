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

test("guided topics link their writing situations to blank questions and accept curated alternatives", () => {
  assert.equal(TOPIC_WRITING_LESSONS.length, 60);
  const topics = new Set(TOPIC_WRITING_LESSONS.map(lesson => lesson.topic));
  assert.equal(topics.size, 11);
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
    ["write-plurals-books", "I have two book"],
    ["write-pronouns-her", "This is she bag"],
    ["write-quantifiers-many", "How much apples do you need"],
    ["write-comparatives-taller", "Maya is tallest than Rina"],
    ["write-adjectives-carefully", "She drives careful"],
    ["write-relatives-who", "The woman who live next door is a doctor"],
    ["write-modals-rest", "You should to rest"],
    ["write-conjunctions-because", "I stayed home so I was sick"],
    ["write-conditionals-rain", "If it will rain I will stay home"],
    ["write-collocations-decision", "We need to do a decision"],
  ];
  for (const [id, input] of cases) {
    const lesson = TOPIC_WRITING_LESSONS.find(item => item.id === id)!;
    assert.equal(checkTopicWriting(lesson, input).status, "retry", input);
  }
  for (const [id, input] of [
    ["write-quantifiers-much", "I don't have much time."],
    ["write-conditionals-rich", "If I were rich, I'd travel the world."],
    ["write-conditionals-rain", "I'll stay home if it rains."],
  ]) {
    const lesson = TOPIC_WRITING_LESSONS.find(item => item.id === id)!;
    assert.equal(checkTopicWriting(lesson, input).status, "correct", input);
  }
});

test("expanded practice covers 371 blanks and 78 writing situations without duplicate IDs", () => {
  assert.equal(BASICS_POOL.length, 371);
  const writing = WRITING_PACKS.flatMap(pack => pack.lessons);
  assert.equal(writing.length, 78);
  assert.equal(new Set(writing.map(lesson => lesson.id)).size, writing.length);
  for (const topic of Object.keys(BASICS_LABELS)) {
    assert.ok(BASICS_POOL.some(q => q.topic === topic && q.skillId));
  }
});

test("expanded patterns reject grammar mistakes and changes to the requested meaning", () => {
  const mistakes = [
    ["write-gerunds-enjoy", "She enjoys to read books"],
    ["write-gerunds-want", "I want learning English"],
    ["write-gerunds-avoid", "We avoid to talk during meetings"],
    ["write-gerunds-decide", "They decided leaving early"],
    ["write-gerunds-finish", "I finished to write the report yesterday"],
    ["write-gerunds-hope", "We hope seeing you soon"],
    ["write-quantifiers-a-few", "I have few friends here"],
    ["write-quantifiers-few", "I have a few friends here"],
    ["write-quantifiers-a-little", "We have little time left"],
    ["write-quantifiers-little", "We have a little time left"],
    ["write-pronouns-his", "This is him jacket"],
    ["write-pronouns-hers", "This jacket is her"],
    ["write-pronouns-ours", "This house is our"],
    ["write-pronouns-him", "I will help he"],
    ["write-modals-could", "She could swam when she was five"],
    ["write-modals-may", "He may comes tomorrow"],
    ["write-modals-must-not", "You do not have to touch this wire"],
    ["write-modals-cannot", "I can open this jar"],
    ["write-conditionals-third", "If I studied harder I would pass the exam"],
    ["write-conditionals-third-negative", "If we had left earlier we would have missed the train"],
    ["write-conditionals-first-negative", "If it will not rain we will go outside"],
    ["write-conditionals-second-negative", "If I were you I will not buy that car"],
    ["write-comparatives-as", "Rina is as taller as Maya"],
    ["write-comparatives-less", "This bag is least expensive than that one"],
    ["write-relatives-whose", "The boy who bike is red is my brother"],
    ["write-relatives-which", "The bus which stop here goes to the station"],
    ["write-conjunctions-although", "Although it was raining but we went outside"],
    ["write-conjunctions-unless", "You will miss the bus unless you do not hurry"],
    ["write-plurals-uncountable", "This information are useful"],
    ["write-collocations-attention", "Please pay attention the instructions"],
  ];
  for (const [id, input] of mistakes) {
    const lesson = TOPIC_WRITING_LESSONS.find(item => item.id === id)!;
    assert.equal(checkTopicWriting(lesson, input).status, "retry", input);
  }
  for (const [id, input] of [
    ["write-modals-must-not", "You mustn't touch this wire."],
    ["write-modals-cannot", "I can't open this jar."],
    ["write-conditionals-third", "I'd have passed the exam if I'd studied harder."],
    ["write-conditionals-third-negative", "If we'd left earlier, we wouldn't have missed the train."],
    ["write-conditionals-first-negative", "We'll go outside if it doesn't rain."],
    ["write-conditionals-second-negative", "If I were you, I wouldn't buy that car."],
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
