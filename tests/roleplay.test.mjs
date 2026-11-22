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
  explanation: "Saat bercerita tentang kemarin, bentuk lampau juga dipakai pada kata kerja lain. Contohnya “I walked home yesterday.”",
  nextQuestion: "How did you get here after missing the bus?",
};

async function submit(body, key = "test-key", groqKey) {
  const req = { method: "POST", body, headers: { "content-type": "application/json" } };
  const res = {
    writeHead(status) { this.status = status; },
    end(value) { this.body = JSON.parse(value); },
  };
  await handleRoleplay(req, res, key, groqKey);
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
  const next = { feedback: "Jawaban sudah jelas.", correction: "", explanation: "", nextQuestion: "Where did the taxi drop you off?" };
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

test("missing extra detail still delivers the correction and next question", async t => {
  const { explanation, branch, ...shortFeedback } = feedback;
  t.mock.method(globalThis, "fetch", async () => Response.json({
    candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(shortFeedback) }] } }],
  }));
  const response = await submit({ ...turn, mode: "conversation" });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { ...shortFeedback, explanation: "" });
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

function groqTurn(tutor) {
  return Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(tutor) } }] });
}

test("Groq answers directly with a strict schema for guided and open roleplay", async t => {
  const provider = t.mock.method(globalThis, "fetch", async () => groqTurn(feedback));
  for (const input of [turn, { ...turn, mode: "conversation" }]) {
    const response = await submit(input, input.mode ? "" : "gemini-primary-test", "groq-primary-test");
    assert.equal(response.status, 200);
    assert.equal(response.body.nextQuestion, feedback.nextQuestion);
    const [url, options] = provider.mock.calls.at(-1).arguments;
    assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(options.headers.Authorization, "Bearer groq-primary-test");
    const payload = JSON.parse(options.body);
    assert.equal(payload.model, "openai/gpt-oss-20b");
    assert.equal(payload.messages[0].role, "system");
    assert.equal(JSON.parse(payload.messages[1].content).answer, input.answer);
    const { strict, schema } = payload.response_format.json_schema;
    assert.equal(strict, true);
    assert.equal(schema.additionalProperties, false);
    assert.deepEqual(schema.required, Object.keys(schema.properties));
    if (input.mode) assert.ok(!("branch" in schema.properties));
    else assert.deepEqual(schema.properties.branch, { type: "string", enum: ["clarify", "traffic"] });
  }
  assert.equal(provider.mock.callCount(), 2);
  assert.equal((await submit({ ...turn, answer: "" }, "gemini", "groq")).status, 400);
  assert.equal(provider.mock.callCount(), 2);
});

test("Groq failures continue the same conversation once through Gemini", async t => {
  const input = { ...turn, mode: "conversation", history: [{ question: turn.question, answer: turn.answer }],
    question: feedback.nextQuestion, answer: "I took a taxi." };
  const provider = t.mock.method(globalThis, "fetch");
  const realTimeout = AbortSignal.timeout.bind(AbortSignal);
  const deadlines = t.mock.method(AbortSignal, "timeout", ms => realTimeout(ms === 8000 ? 1 : ms));
  const failures = [
    () => new Response(null, { status: 429 }),
    () => new Response(null, { status: 503 }),
    () => { throw new TypeError("network failure"); },
    () => groqTurn({ ...feedback, nextQuestion: "" }),
    () => Response.json({ choices: [{ finish_reason: "length" }] }),
    async signal => {
      // Keep the event loop alive until Node's unref'ed abort timer fires.
      const keepAlive = setTimeout(() => {}, 1000);
      try {
        await new Promise((_, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true }));
      } finally {
        clearTimeout(keepAlive);
      }
    },
  ];
  for (const fail of failures) {
    provider.mock.resetCalls();
    deadlines.mock.resetCalls();
    provider.mock.mockImplementation(async (url, options) => {
      if (url.includes("api.groq.com")) return fail(options.signal);
      return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(feedback) }] } }] });
    });
    const response = await submit(input, "gemini-fallback-test", "groq-fallback-test");
    assert.equal(response.status, 200);
    assert.equal(response.body.feedback, feedback.feedback);
    assert.equal(provider.mock.callCount(), 2);
    const [first, second] = provider.mock.calls.map(call => call.arguments);
    assert.match(first[0], /api\.groq\.com/);
    assert.match(second[0], /generativelanguage\.googleapis\.com/);
    const context = JSON.parse(JSON.parse(first[1].body).messages[1].content);
    assert.deepEqual(context.history, input.history);
    assert.equal(context.question, input.question);
    assert.equal(context.answer, input.answer);
    assert.deepEqual(JSON.parse(JSON.parse(second[1].body).contents[0].parts[0].text), context);
    assert.deepEqual(deadlines.mock.calls.map(call => call.arguments[0]), [8000, 12000]);
  }
});

test("both providers return quota immediately, skip cooldowns, and recover", async t => {
  let now = Date.now();
  t.mock.method(Date, "now", () => now);
  const provider = t.mock.method(globalThis, "fetch", async url => url.includes("api.groq.com")
    ? new Response(null, { status: 429, headers: { "retry-after": "5" } })
    : Response.json({ error: { details: [{ "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "10s" }] } }, { status: 429 }));
  const next = () => submit(turn, "gemini-cooldown-test", "groq-cooldown-test");
  assert.equal((await next()).status, 429);
  assert.equal(provider.mock.callCount(), 2);
  now += 1000;
  assert.match((await next()).body.message, /9 detik/);
  assert.equal(provider.mock.callCount(), 2);
  now += 4000;
  provider.mock.mockImplementation(async () => groqTurn(feedback));
  assert.equal((await next()).status, 200);
  assert.equal(provider.mock.callCount(), 3);
});
