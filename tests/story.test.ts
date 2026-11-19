import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ALL_STORY_SCENARIOS,
  MINILM_LIMITATIONS_DISCLAIMER,
  evaluateStorySubmission,
  filterStoryScenarios,
} from "../src/grammar/story/engine";
import { Script } from "node:vm";
import { computeMiniLmSimilarityAsync, calibrateMiniLmCosine } from "../src/grammar/story/minilm-client";

describe("Story Challenge Engine", () => {
  it("loads all built-in and custom scenarios and validates every sampleStory passes 3/3 missions, explicit checks, and high relevance", () => {
    assert.ok(
      ALL_STORY_SCENARIOS.length >= 10,
      `Expected at least 10 scenarios, got ${ALL_STORY_SCENARIOS.length}`,
    );

    for (const scenario of ALL_STORY_SCENARIOS) {
      const res = evaluateStorySubmission(scenario, scenario.sampleStory);
      assert.equal(
        res.status,
        "complete",
        `Scenario "${scenario.id}" sampleStory failed missions: ${res.missions
          .filter((m) => !m.passed)
          .map((m) => `${m.mission.id} (${m.mission.ruleId}): ${m.feedback}`)
          .join(" | ")}`,
      );
      assert.equal(res.passedCount, 3);
      assert.equal(res.explicitChecks.allPassed, true, scenario.id);
      assert.equal(res.explicitChecks.targetStructures.passed, true, scenario.id);
      assert.equal(res.explicitChecks.minimumLength.passed, true, scenario.id);
      assert.equal(res.explicitChecks.format.passed, true, scenario.id);
      assert.equal(res.relevance.level, "high", scenario.id);
      assert.equal(
        res.relevance.limitationsDisclaimer,
        MINILM_LIMITATIONS_DISCLAIMER,
      );
    }
  });

  it("highlights exact spans [had left] (blue), [was left] (green), and [should have prepared] (purple) in the flagship scenario", () => {
    const lateScenario = ALL_STORY_SCENARIOS.find(
      (s) => s.id === "late-event",
    )!;
    const userParagraph =
      "I ran fast to the station, but the train had left before I arrived. I was panicking because my ticket was left on my desk at home. I should have prepared everything last night.";

    const res = evaluateStorySubmission(lateScenario, userParagraph);
    assert.equal(res.status, "complete");
    assert.equal(res.passedCount, 3);

    const highlighted = res.segments.filter((s) => Boolean(s.highlight));
    assert.equal(highlighted.length, 3);

    assert.equal(highlighted[0].text, "had left");
    assert.equal(highlighted[0].highlight?.color, "blue");

    assert.equal(highlighted[1].text, "was left");
    assert.equal(highlighted[1].highlight?.color, "green");

    assert.equal(highlighted[2].text, "should have prepared");
    assert.equal(highlighted[2].highlight?.color, "purple");
  });

  it("gives targeted active-to-passive coaching when user writes 'I left my ticket' instead of Passive Voice", () => {
    const lateScenario = ALL_STORY_SCENARIOS.find(
      (s) => s.id === "late-event",
    )!;
    const missingPassiveParagraph =
      "I ran fast to the station, but the train had left before I arrived. I left my ticket on my desk at home. I should have prepared everything last night.";

    const res = evaluateStorySubmission(lateScenario, missingPassiveParagraph);
    assert.equal(res.status, "incomplete");
    assert.equal(res.passedCount, 2);

    const passiveMission = res.missions[1];
    assert.equal(passiveMission.passed, false);
    assert.equal(passiveMission.isNearMiss, true);
    assert.match(passiveMission.feedback, /I left my ticket/i);
    assert.match(passiveMission.feedback, /My ticket was left/i);
  });

  it("detects near-miss verb forms for Past Perfect and Modal of Regret", () => {
    const lateScenario = ALL_STORY_SCENARIOS.find(
      (s) => s.id === "late-event",
    )!;
    const wrongFormParagraph =
      "The train had went before I arrived. My ticket was left at home. I should have prepare everything.";

    const res = evaluateStorySubmission(lateScenario, wrongFormParagraph);
    assert.equal(res.status, "incomplete");
    assert.equal(res.missions[0].passed, false);
    assert.equal(res.missions[0].isNearMiss, true);
    assert.match(res.missions[0].feedback, /had gone/i);

    assert.equal(res.missions[1].passed, true);

    assert.equal(res.missions[2].passed, false);
    assert.equal(res.missions[2].isNearMiss, true);
    assert.match(res.missions[2].feedback, /should have prepared/i);
  });

  it("filters scenarios by difficulty level and scenarioId", () => {
    const masterList = filterStoryScenarios({
      level: "master",
      scenarioId: "all",
    });
    assert.ok(masterList.length >= 3);
    assert.ok(masterList.every((s) => s.level === "master"));
  });

  it("13.5 recognizes semantic relevance for a 'late to a meeting' paraphrase story even without literal station/train/ticket keywords", () => {
    const lateScenario = ALL_STORY_SCENARIOS.find(
      (s) => s.id === "late-event",
    )!;
    // Paraphrase about being late for an office meeting (zero literal keywords from ["station", "train", "ticket", "desk", "home", "late"])
    const meetingStory =
      "I rushed to the office this morning, but the important meeting had started before I entered the room. My presentation folder was forgotten on the kitchen table. I should have set an earlier alarm clock.";

    const res = evaluateStorySubmission(lateScenario, meetingStory);
    assert.equal(res.matchedKeywords.length, 0);
    assert.equal(res.explicitChecks.allPassed, true);
    assert.equal(res.relevance.level, "high");
    assert.ok(res.relevance.percentage >= 65);
    assert.equal(res.relevance.matchedConcepts.length, 3);
  });

  it("13.5 separates explicit grammar success from low topic relevance and provides exploratory (non-definitive) suggestions", () => {
    const lateScenario = ALL_STORY_SCENARIOS.find(
      (s) => s.id === "late-event",
    )!;
    // Completely off-topic story (about a cat & fish) that satisfies all 3 grammar rules, length, and format
    const offTopicStory =
      "The hungry cat had eaten all the fresh fish before noon. A bowl of warm milk was spilled on the rug. I should have bought more pet food yesterday.";

    const res = evaluateStorySubmission(lateScenario, offTopicStory);
    // 1. Target structure & explicit rules still pass (not marked as grammar failure)
    assert.equal(res.status, "complete");
    assert.equal(res.explicitChecks.targetStructures.passed, true);
    assert.equal(res.explicitChecks.minimumLength.passed, true);
    assert.equal(res.explicitChecks.format.passed, true);

    // 2. Estimated relevance is low/ambiguous
    assert.equal(res.relevance.level, "low");
    assert.ok(res.relevance.percentage < 34);

    // 3. Suggestions are exploratory rather than definitive failure
    assert.ok(res.templateSuggestions.length >= 1);
    assert.ok(res.templateSuggestions.every((s) => s.isExploratory));
    assert.match(res.templateSuggestions[0].text, /Ide Eksplorasi/i);
  });

  it("13.5 checks explicit minimum length and sentence format rules independently", () => {
    const lateScenario = ALL_STORY_SCENARIOS.find(
      (s) => s.id === "late-event",
    )!;
    // Too short (only 1 sentence, lowercase start, no ending punctuation)
    const shortUnformatted = "the train had left and my ticket was left so I should have prepared";
    const res = evaluateStorySubmission(lateScenario, shortUnformatted);

    assert.equal(res.explicitChecks.targetStructures.passed, true);
    assert.equal(res.explicitChecks.minimumLength.passed, false);
    assert.equal(res.explicitChecks.format.passed, false);
    assert.equal(res.explicitChecks.allPassed, false);

    const categories = res.templateSuggestions.map((s) => s.category);
    assert.ok(categories.includes("length-format"));
  });

  it("13.5 integrates calibrated MiniLM cosine similarity scores and matches human-judgment benchmark cases", () => {
    const lateScenario = ALL_STORY_SCENARIOS.find(
      (s) => s.id === "late-event",
    )!;

    // Raw MiniLM cosine of 0.68 -> high calibrated score
    const highCalibrated = calibrateMiniLmCosine(0.68);
    assert.ok(highCalibrated >= 0.80);

    const hybridRes = evaluateStorySubmission(
      lateScenario,
      "I rushed to the morning meeting, but the session had started. My badge was left in my car. I should have woken up earlier.",
      {
        miniLmSimilarity: highCalibrated,
        rawMiniLmCosine: 0.68,
        latencyMs: 24,
      },
    );
    assert.equal(hybridRes.relevance.source, "minilm-hybrid");
    assert.equal(hybridRes.relevance.level, "high");
    assert.equal(hybridRes.relevance.latencyMs, 24);

    // Human-judgment benchmark validation matrix
    const humanBenchmark: Array<{
      scenarioId: string;
      text: string;
      expectedStructuresPassed: number;
      expectedRelevance: "high" | "medium" | "low";
    }> = [
      {
        scenarioId: "project-crisis",
        text: "Before the client meeting started, our main slide file had disappeared from the laptop. Thankfully, a backup copy was saved on the cloud server. Although I felt nervous, the presentation finished on time.",
        expectedStructuresPassed: 3,
        expectedRelevance: "high",
      },
      {
        scenarioId: "lost-wallet",
        text: "I was walking near the market when I noticed my wallet was missing. Fortunately, my wallet was found by an honest driver. After I thanked him, I went home.",
        expectedStructuresPassed: 3,
        expectedRelevance: "high",
      },
      {
        scenarioId: "special-dinner",
        text: "The rocket had launched into deep space before dawn. A new satellite was deployed by the astronauts. I should have watched the broadcast.",
        expectedStructuresPassed: 1, // only pastPassive matches special-dinner's [pastSimple, pastContinuous, pastPassive]
        expectedRelevance: "low",
      },
    ];

    for (const item of humanBenchmark) {
      const sc = ALL_STORY_SCENARIOS.find((s) => s.id === item.scenarioId)!;
      const evalRes = evaluateStorySubmission(sc, item.text);
      assert.equal(
        evalRes.passedCount,
        item.expectedStructuresPassed,
        `Benchmark structure mismatch for ${item.scenarioId}`,
      );
      assert.equal(
        evalRes.relevance.level,
        item.expectedRelevance,
        `Benchmark relevance mismatch for ${item.scenarioId}`,
      );
    }
  });
});

it("story worker compares anchors, has valid source, and rejects on worker failure", async () => {
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
    const scores = computeMiniLmSimilarityAsync("test", ["A1", "A2", "B1"], "reply");
    assert.ok(sourceUrl.startsWith("blob:"));
    new Script(await source!, { filename: "minilm-worker.js" });
    assert.equal(worker!.messages.length, 1);
    assert.deepEqual(worker!.messages[0].anchors, ["A1", "A2", "B1"]);
    worker!.onmessage!({ data: { type: "result", id: worker!.messages[0].id, rawCosine: 0.8, anchorSimilarities: [0.8, 0.6, 0.2] } });
    const result = await scores;
    assert.equal(result.rawCosine, 0.8);
    const failed = computeMiniLmSimilarityAsync("failure", ["anchor"], "reply");
    worker!.onerror!();
    await assert.rejects(failed, /worker failed/);
  } finally {
    URL.revokeObjectURL = revoke;
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow); else Reflect.deleteProperty(globalThis, "window");
    if (originalWorker) Object.defineProperty(globalThis, "Worker", originalWorker); else Reflect.deleteProperty(globalThis, "Worker");
  }
});
