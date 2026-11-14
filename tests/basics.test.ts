import assert from "node:assert/strict";
import test from "node:test";
import { BASICS_POOL, checkBasicsAnswer, completedSentence, createDeck, mistakeHint, NO_WORD } from "../src/grammar/basics/engine";
import { BASICS_LABELS } from "../src/grammar/labels";
import { checkAnswer } from "../src/grammar/check";
import { DEFAULT_FILTER, generateQuestion } from "../src/grammar/generator";

function question(id: string) {
  const result = BASICS_POOL.find((q) => q.id === id);
  assert.ok(result, id);
  return result;
}

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
});

test("existing sentence generator and checker still agree", () => {
  for (let i = 0; i < 100; i++) {
    const q = generateQuestion(DEFAULT_FILTER);
    assert.equal(checkAnswer(q, q.answer).correct, true, q.answer);
  }
});
