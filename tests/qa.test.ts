import assert from "node:assert/strict";
import test from "node:test";
import { checkQA, QA_POOL, qaDeck, type QAQuestion } from "../src/grammar/qa/engine";

function q(id: string): QAQuestion {
  const found = QA_POOL.find(question => question.id === id);
  assert.ok(found, id);
  return found;
}
const where = q("pastSimple-where-she");

test("every generated question has an accepted example, unique ID and supported filter deck", () => {
  assert.ok(QA_POOL.length >= 250);
  assert.equal(new Set(QA_POOL.map(q => q.id)).size, QA_POOL.length);
  for (const question of QA_POOL) {
    assert.equal(checkQA(question, question.sample).status, "correct", `${question.id}: ${question.sample}`);
    const deck = qaDeck({ tense: question.tense, intent: question.intent }, question.id);
    assert.equal(deck.length, 5);
    assert.ok(deck.every(q => q.tense === question.tense && q.intent === question.intent));
    assert.equal(new Set(deck.map(q => q.id)).size, deck.length);
    assert.notEqual(deck[0].id, question.id);
  }
});

test("dynamic locations are accepted without matching one answer key", () => {
  for (const answer of ["She worked at a hospital.", "She worked at a Restaurant.", "She worked in Jakarta.", "  SHE  WORKED at home!", "She worked in an office."]) {
    assert.equal(checkQA(where, answer).status, "correct", answer);
  }
  for (const answer of ["She worked at Acme Labs.", "She worked in Yogyakarta.", "She worked near the old bridge."]) {
    const result = checkQA(where, answer);
    assert.equal(result.status, "partial", answer);
    assert.equal(result.grammar, "pass", answer);
    assert.equal(result.response, "unknown", answer);
  }
});

test("wrong forms and malformed location phrases are not passed", () => {
  for (const answer of ["She work at a restaurant.", "She did worked at a restaurant.", "She working at a hospital.", "She works at a restaurant.", "She worked at happy.", "She worked in a office.", "She worked at an restaurant."]) {
    assert.equal(checkQA(where, answer).status, "incorrect", answer);
  }
  assert.equal(checkQA(where, "She worked at a restaurant nonsense.").status, "partial");
  assert.equal(checkQA(where, "She worked at a restaurant. She go home.").status, "partial");
});

test("response relevance is separate from core grammar", () => {
  const result = checkQA(where, "She worked yesterday.");
  assert.equal(result.grammar, "pass");
  assert.equal(result.response, "fail");
  assert.equal(result.status, "incorrect");
  assert.equal(checkQA(where, "Yes, she did.").response, "fail");
  assert.equal(checkQA(where, "She worked.").response, "fail");
  const fragment = checkQA(where, "At a hospital.");
  assert.equal(fragment.response, "pass");
  assert.equal(fragment.status, "partial");
  assert.equal(checkQA(where, "She did work at a hospital.").status, "partial");
  assert.equal(checkQA(where, "She didn't work at a hospital.").status, "partial");
});

test("short replies follow speaker perspective, agreement, tense and polarity", () => {
  const cases = [
    ["presentSimple-yesNo-you", "Yes, I do.", "correct"],
    ["presentSimple-yesNo-I", "No, you don't.", "correct"],
    ["presentSimple-yesNo-she", "No, she doesn’t.", "correct"],
    ["presentContinuous-yesNo-you", "Yes, I am.", "correct"],
    ["presentContinuous-yesNo-you", "Yes, I'm.", "incorrect"],
    ["presentContinuous-yesNo-she", "Yes, she's.", "incorrect"],
    ["presentContinuous-yesNo-you", "No, I'm not.", "correct"],
    ["presentContinuous-yesNo-they", "No, they aren't.", "correct"],
    ["pastSimple-yesNo-she", "Yes, she did.", "correct"],
    ["pastSimple-yesNo-she", "No, she did.", "incorrect"],
    ["pastSimple-yesNo-she", "Yes, she didn't.", "incorrect"],
    ["presentSimple-yesNo-you", "Yes, you do.", "incorrect"],
    ["pastSimple-yesNo-she", "Yes, she does.", "incorrect"],
  ];
  for (const [id, answer, expected] of cases) assert.equal(checkQA(q(id), answer).status, expected, `${id}: ${answer}`);
});

test("different information families and tense signals are checked conservatively", () => {
  const cases = [
    ["presentSimple-when-she", "She works every morning.", "correct"],
    ["pastSimple-when-she", "She worked on Monday.", "correct"],
    ["pastSimple-when-she", "She worked tomorrow.", "incorrect"],
    ["presentContinuous-when-you", "I'm working yesterday.", "incorrect"],
    ["presentContinuous-where-you", "I'm working at home.", "correct"],
    ["presentContinuous-where-she", "She's working at home.", "correct"],
    ["presentSimple-what-you", "I study mathematics.", "correct"],
    ["pastSimple-who-she", "She worked with my sister.", "correct"],
    ["pastSimple-how-you", "I traveled by bus.", "correct"],
    ["presentContinuous-how-you", "I'm traveling on foot.", "correct"],
    ["pastSimple-why-she", "She worked because the team needed help.", "correct"],
    ["pastSimple-why-she", "She worked because she need money.", "partial"],
    ["pastSimple-why-she", "She worked because she needed money.", "correct"],
    ["presentSimple-when-you", "I work at 9:30 am.", "correct"],
    ["presentSimple-when-you", "I work at 99:99.", "partial"],
    // New tenses, nominal, howLong (for vs since), howOften, and purpose infinitive
    ["presentPerfect-yesNo-you", "Yes, I have.", "correct"],
    ["presentPerfect-yesNo-she", "No, she hasn't.", "correct"],
    ["presentPerfect-howLong-she", "She has lived here for five years.", "correct"],
    ["presentPerfect-howLong-she", "She's lived here since 2020.", "correct"],
    ["presentPerfect-howLong-she", "She has lived here for 2020.", "incorrect"],
    ["presentPerfect-howLong-she", "She has lived here since five years.", "incorrect"],
    ["futureSimple-yesNo-they", "No, they won't.", "correct"],
    ["futureSimple-when-you", "I'll work tomorrow.", "correct"],
    ["futureSimple-when-you", "I will work yesterday.", "incorrect"],
    ["modal-yesNo-you", "No, I can't.", "correct"],
    ["modal-where-she", "She can work at home.", "correct"],
    ["modal-where-she", "She can works at home.", "incorrect"],
    ["nominal-yesNo-you", "Yes, I am.", "correct"],
    ["nominal-where-she", "She was at a hospital.", "correct"],
    ["nominal-why-he", "He is late because the bus was late.", "correct"],
    ["presentSimple-howOften-you", "I exercise twice a week.", "correct"],
    ["presentSimple-howOften-she", "She usually exercises.", "correct"],
    ["presentSimple-why-you", "I work to earn money.", "correct"],
    ["presentSimple-yesNo-you", "Yes, I work here.", "correct"],
  ];
  for (const [id, answer, expected] of cases) assert.equal(checkQA(q(id), answer).status, expected, `${id}: ${answer}`);
  assert.equal(checkQA(where, "   ").status, "empty");
});
