import test from "node:test";
import assert from "node:assert/strict";
import { handleRoleplay } from "../api/roleplay.js";

const turn = {
  scenario: "Late for the meeting", speaker: "Manager", target: "Past Simple",
  question: "What happened?", answer: "I miss my bus.", history: [],
  branches: [{ id: "traffic", label: "Transport", nextTarget: "Past Simple" }],
};
const feedback = {
  branch: "traffic", correction: "I missed my bus.", feedback: "Gunakan bentuk lampau missed.",
  nextQuestion: "How did you get here after missing the bus?",
};

async function submit(body, key = "test-key") {
  const req = { method: "POST", body, headers: { "content-type": "application/json" } };
  const res = {
    writeHead(status) { this.status = status; },
    end(value) { this.body = JSON.parse(value); },
  };
  await handleRoleplay(req, res, key);
  return res;
}

test("one provider call returns a correction and a contextual follow-up", async t => {
  const provider = t.mock.method(globalThis, "fetch", async (_url, options) => {
    const payload = JSON.parse(options.body);
    assert.equal(JSON.parse(payload.contents[0].parts[0].text).answer, turn.answer);
    return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(feedback) }] } }] });
  });
  const response = await submit(turn);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, feedback);
  assert.equal(provider.mock.callCount(), 1);
});

test("quota, malformed responses and missing keys signal local fallback", async t => {
  const provider = t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 429 }));
  assert.equal((await submit(turn, "")).status, 503);
  assert.equal((await submit({ ...turn, answer: " " })).status, 400);
  assert.equal(provider.mock.callCount(), 0);
  assert.equal((await submit(turn)).status, 429);
  provider.mock.mockImplementation(async () => Response.json({ candidates: [] }));
  assert.equal((await submit(turn)).status, 503);
});

test("conversation continues from the latest reply without scripted branches", async t => {
  const { branches, ...input } = turn;
  const history = [{ question: input.question, answer: input.answer }];
  const next = { feedback: "Jawaban sudah jelas.", correction: "", nextQuestion: "Where did the taxi drop you off?" };
  const provider = t.mock.method(globalThis, "fetch", async (_url, options) => {
    const payload = JSON.parse(options.body);
    const context = JSON.parse(payload.contents[0].parts[0].text);
    assert.deepEqual(context.history, history);
    assert.equal(context.answer, "I took a taxi.");
    assert.ok(!("branches" in context));
    assert.ok(!("branch" in payload.generationConfig.responseSchema.properties));
    return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(next) }] } }] });
  });
  const response = await submit({ ...input, mode: "conversation", history, question: "How did you get here?", answer: "I took a taxi." });
  assert.equal(provider.mock.callCount(), 1);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, next);
});

test("Gemini rejection reports a safe reason and its actual HTTP status", async t => {
  const provider = t.mock.method(globalThis, "fetch", async () => Response.json({
    error: { message: "private detail", details: [{ reason: "API_KEY_INVALID" }] },
  }, { status: 400 }));
  const invalid = await submit(turn);
  assert.equal(invalid.body.error, "invalid_key");
  assert.equal(invalid.body.upstreamStatus, 400);
  assert.doesNotMatch(JSON.stringify(invalid.body), /private detail/);
  provider.mock.mockImplementation(async () => Response.json({
    error: { details: [{ "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "2.5s" }] },
  }, { status: 429 }));
  const quota = await submit(turn);
  assert.equal(quota.status, 429);
  assert.match(quota.body.message, /3 detik/);
});
