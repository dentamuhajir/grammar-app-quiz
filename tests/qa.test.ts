import assert from "node:assert/strict";
import test from "node:test";
import { checkQA, QA_POOL, qaDeck, type QAQuestion } from "../src/grammar/qa/engine";
import { DIALOGUE_SCENARIOS, evaluateDialogueTurn, verifyDialogueGrammar } from "../src/grammar/qa/dialogue";
import { computeMiniLmIntentScoresAsync, computeMiniLmSimilarityAsync } from "../src/grammar/story/minilm-client";
import { Script } from "node:vm";

test("shared worker batches intent examples, has valid source, and rejects on worker failure", async () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalWorker = Object.getOwnPropertyDescriptor(globalThis, "Worker");
  let worker: FakeWorker;
  let sourceUrl = "";
  class FakeWorker {
    onmessage?: (event: { data: unknown }) => void;
    onerror?: () => void;
    messages: Array<{ id: number; anchors: string[]; userText: string }> = [];
    constructor(url: string) { worker = this; sourceUrl = url; }
    postMessage(message: { id: number; anchors: string[]; userText: string }) { this.messages.push(message); }
    terminate() {}
  }
  const revoke = URL.revokeObjectURL;
  let source: Promise<string> | undefined;
  URL.revokeObjectURL = url => { source = fetch(url).then(res => res.text()).finally(() => revoke(url)); };
  Object.defineProperty(globalThis, "window", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "Worker", { configurable: true, value: FakeWorker });
  try {
    const scores = computeMiniLmIntentScoresAsync("test", [{ id: "a", examples: ["A1", "A2"] }, { id: "b", examples: ["B1"] }], "reply");
    assert.ok(sourceUrl.startsWith("blob:"));
    new Script(await source!, { filename: "minilm-worker.js" });
    assert.equal(worker!.messages.length, 1);
    assert.deepEqual(worker!.messages[0].anchors, ["A1", "A2", "B1"]);
    worker!.onmessage!({ data: { type: "result", id: worker!.messages[0].id, rawCosine: 0.8, anchorSimilarities: [0.8, 0.6, 0.2] } });
    const result = await scores;
    assert.ok(Math.abs(result.branchCosines.a - 0.74) < 0.00001);
    assert.equal(result.branchCosines.b, 0.2);
    const failed = computeMiniLmSimilarityAsync("failure", ["anchor"], "reply");
    worker!.onerror!();
    await assert.rejects(failed, /worker failed/);
  } finally {
    URL.revokeObjectURL = revoke;
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow); else Reflect.deleteProperty(globalThis, "window");
    if (originalWorker) Object.defineProperty(globalThis, "Worker", originalWorker); else Reflect.deleteProperty(globalThis, "Worker");
  }
});

const meeting = DIALOGUE_SCENARIOS[0];
const interview = DIALOGUE_SCENARIOS[1];

test("dialogue banks have valid reachable transitions and detectable example structures", () => {
  for (const scenario of DIALOGUE_SCENARIOS) {
    const reachable = new Set<string>();
    function visit(id: string, path: string[] = []) {
      assert.ok(!path.includes(id), `cycle: ${id}`);
      if (reachable.has(id)) return;
      reachable.add(id);
      const node = scenario.nodes[id];
      assert.ok(node, id);
      assert.equal(node.id, id);
      assert.equal(new Set(node.branches.map(b => b.id)).size, node.branches.length);
      for (const branch of node.branches) {
        assert.ok(branch.examples.length >= 3);
        for (const example of branch.examples) {
          assert.ok(verifyDialogueGrammar(node, example).passed, `${id}: ${example}`);
        }
        if (branch.nextNodeId) visit(branch.nextNodeId, [...path, id]);
      }
    }
    visit(scenario.initialNodeId);
    assert.equal(reachable.size, Object.keys(scenario.nodes).length);
  }
});

test("dialogue follows distinct local branches through complete meeting and interview paths", () => {
  for (const [node, answer, branch] of [
    [meeting.nodes.turn1_reason, "My car broke down on the highway.", "traffic_transport"],
    [meeting.nodes.turn1_reason, "I overslept because my alarm did not ring.", "overslept_alarm"],
    [meeting.nodes.turn1_reason, "I forgot my laptop at home.", "forgot_item_home"],
    [meeting.nodes.turn2_traffic, "I took a taxi to the office.", "took_ride"],
    [meeting.nodes.turn2_overslept, "Yes, I finished all the slides last night.", "slides_finished"],
    [meeting.nodes.turn2_overslept, "No, I did not finish the slides last night.", "slides_unfinished"],
    [meeting.nodes.turn3_closing, "I will prepare my bag and laptop tonight.", "plan_prepare_materials"],
    [interview.nodes.turn1_background, "I have studied computer science for four years at university.", "study_education"],
    [interview.nodes.turn2_study_project, "I built a mobile application for local small businesses.", "built_app_website"],
    [interview.nodes.turn3_contribution, "I can communicate fluently with international clients in English.", "communication_teamwork"],
  ] as const) {
    const result = evaluateDialogueTurn(node, answer);
    assert.equal(result.status, "advance", `${answer}: ${JSON.stringify(result.intentRankings)}`);
    assert.equal(result.matchedBranch?.id, branch, answer);
    assert.equal(result.criticalTrap, undefined, answer);
  }
});

test("dialogue separates unknown topics from grammar and allows retries", () => {
  assert.equal(evaluateDialogueTurn(meeting.nodes.turn1_reason, "  ").status, "empty");
  const unrelated = evaluateDialogueTurn(meeting.nodes.turn1_reason, "I cooked noodles with tomatoes yesterday.");
  assert.ok(unrelated.grammar.passed);
  assert.equal(unrelated.status, "clarification_needed");
  assert.equal(unrelated.matchedBranch, null);
  for (const answer of ["I miss the bus.", "I did went home.", "I didn't finished the slides.", "I were late.", "Traffic delayed.", "I was cook noodles."]) {
    assert.equal(evaluateDialogueTurn(meeting.nodes.turn1_reason, answer).status, "grammar_retry", answer);
  }
  for (const answer of ["I will banana tomorrow.", "I will took a train.", "I am going to prepared my bag."]) {
    assert.equal(verifyDialogueGrammar(meeting.nodes.turn3_closing, answer).passed, false, answer);
  }
  assert.equal(verifyDialogueGrammar(interview.nodes.turn3_contribution, "I can built websites.").passed, false);
});

test("high model similarity cannot bypass polarity, time and critical meaning guards", () => {
  const node = meeting.nodes.turn2_overslept;
  const negative = evaluateDialogueTurn(node, "No, I did not finish the slides last night.", { miniLmBranchCosines: { slides_finished: 0.99, slides_unfinished: 0.85 } });
  assert.notEqual(negative.matchedBranch?.id, "slides_finished");
  const future = evaluateDialogueTurn(meeting.nodes.turn1_reason, "The traffic was terrible tomorrow.", { miniLmBranchCosines: { traffic_transport: 0.99 } });
  assert.notEqual(future.status, "advance");
  const reverse = evaluateDialogueTurn(meeting.nodes.turn1_reason, "The traffic was smooth and I arrived early.", { miniLmBranchCosines: { traffic_transport: 0.99 } });
  assert.notEqual(reverse.matchedBranch?.id, "traffic_transport");
  const deniedDelay = evaluateDialogueTurn(meeting.nodes.turn1_reason, "I did not miss the morning bus at the station.", { miniLmBranchCosines: { traffic_transport: 0.99 } });
  assert.notEqual(deniedDelay.status, "advance");
  const otherPerson = evaluateDialogueTurn(node, "My manager finished all the slides last night.", { miniLmBranchCosines: { slides_finished: 0.99 } });
  assert.notEqual(otherPerson.status, "advance");
  const ambiguous = evaluateDialogueTurn(meeting.nodes.turn1_reason, "My car broke down and I overslept after my alarm failed.");
  assert.equal(ambiguous.status, "clarification_needed");
});

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
