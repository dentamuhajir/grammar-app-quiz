import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ALL_STORY_SCENARIOS,
  evaluateStorySubmission,
  filterStoryScenarios,
} from "../src/grammar/story/engine";

describe("Story Challenge Engine", () => {
  it("loads all built-in and custom scenarios and validates every sampleStory passes 3/3 missions", () => {
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
});

