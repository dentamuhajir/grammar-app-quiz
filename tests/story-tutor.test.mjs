import test from "node:test";
import assert from "node:assert/strict";
import { handleStory } from "../api/story.js";

const exercise = {
  scenario: "Describe missing a train.", story: "I missed my train.",
  missions: [
    { label: "Past Perfect", formula: "had + V3" },
    { label: "Past Passive", formula: "was/were + V3" },
    { label: "Modal of Regret", formula: "should have + V3" },
  ],
};
const mission = {
  focus: "mission", strength: "“I missed my train” menyampaikan kejadiannya dengan jelas.",
  revision: "", feedback: "Tambahkan apa yang sudah terjadi sebelum Anda tiba.",
  explanation: "Contohnya “The train had left before I arrived.” Kereta berangkat lebih dulu.",
};

async function submit(body = exercise, key = "test-key") {
  const req = { method: "POST", headers: { "content-type": "application/json" }, body };
  const res = {
    writeHead(status) { this.status = status; },
    end(json) { this.body = JSON.parse(json); },
  };
  await handleStory(req, res, key);
  return res;
}

function gemini(review) {
  return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(review) }] } }] });
}

test("story tutor receives the story and missions and distinguishes a missing mission from a correction", async t => {
  const provider = t.mock.method(globalThis, "fetch", async (_, options) => {
    const payload = JSON.parse(options.body);
    assert.deepEqual(JSON.parse(payload.contents[0].parts[0].text), exercise);
    return gemini({ ...mission, revision: "An unnecessary rewrite." });
  });
  const result = await submit();
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, mission);
  assert.equal(provider.mock.callCount(), 1);
});

test("corrections include a revision and complete stories receive only the strength", async t => {
  const correction = { ...mission, focus: "correction", revision: "I missed my train.", feedback: "Gunakan missed untuk kejadian lampau." };
  const provider = t.mock.method(globalThis, "fetch", async () => gemini(correction));
  assert.deepEqual((await submit({ ...exercise, story: "I miss my train yesterday." })).body, correction);
  provider.mock.mockImplementation(async () => gemini({ ...mission, focus: "complete" }));
  assert.deepEqual((await submit()).body, { ...mission, focus: "complete", feedback: "", explanation: "" });
});

test("empty or oversized drafts stay local and unusable tutor responses allow fallback", async t => {
  const provider = t.mock.method(globalThis, "fetch", async () => gemini({ ...mission, focus: "correction" }));
  assert.equal((await submit({ ...exercise, story: " " })).status, 400);
  assert.equal((await submit({ ...exercise, story: "x".repeat(8001) })).status, 400);
  assert.equal((await submit(exercise, "")).body.error, "unconfigured");
  assert.equal(provider.mock.callCount(), 0);
  assert.equal((await submit()).body.error, "unavailable");
  provider.mock.mockImplementation(async () => new Response(null, { status: 429 }));
  assert.equal((await submit()).body.error, "quota");
});
