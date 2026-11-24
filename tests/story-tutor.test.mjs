import test from "node:test";
import assert from "node:assert/strict";
import { handleStory } from "../api/story.js";
import { personalSentences } from "../src/grammar/story/personalSentences.js";

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

async function submit(body = exercise, key = "test-key", groqKey = "") {
  const req = { method: "POST", headers: { "content-type": "application/json" }, body };
  const res = {
    writeHead(status) { this.status = status; },
    end(json) { this.body = JSON.parse(json); },
  };
  await handleStory(req, res, key, groqKey);
  return res;
}

test("story tutor prefers Groq and falls back to Gemini", async t => {
  const provider = t.mock.method(globalThis, "fetch", async url => {
    if (String(url).includes("groq.com")) {
      return Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(mission) } }] });
    }
    return gemini(mission);
  });
  assert.equal((await submit(exercise, "test-key", "groq-test-key")).status, 200);
  assert.match(String(provider.mock.calls[0].arguments[0]), /groq/);
  provider.mock.mockImplementation(async url => String(url).includes("groq.com")
    ? new Response(null, { status: 503 }) : gemini(mission));
  const fallback = await submit(exercise, "test-key", "groq-test-key");
  assert.equal(fallback.status, 200);
  assert.deepEqual(fallback.body, mission);
});

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

test("personal reflection accepts one optional grammar suggestion", async t => {
  const personal = {
    mode: "personal", story: "I read a book.", scenario: "What did you do last weekend?",
    missions: [{ label: "Past Simple", formula: "Past events" }],
  };
  t.mock.method(globalThis, "fetch", async (_, options) => {
    const payload = JSON.parse(options.body);
    assert.match(JSON.stringify(payload), /grammar focus is optional/i);
    return gemini({ strength: "Kegiatanmu jelas.", sentences: [{ number: 1, revision: "", feedback: "" }], nextStep: "" });
  });
  const result = await submit(personal);
  assert.equal(result.status, 200);
  assert.equal(result.body.focus, "complete");
  assert.deepEqual(result.body.sentences, [{ original: personal.story, revision: "", feedback: "" }]);
  assert.equal((await submit({ ...personal, mode: undefined })).status, 400);
});

test("free writing reviews every sentence of the reported draft and retries an incomplete review", async t => {
  const originals = [
    "I would like to consist in learning machine learning.",
    "If i had more time, i would practice after work office.",
    "The problem is that I had overtime in previous week.",
  ];
  const personal = { mode: "personal", story: originals.join(" "), scenario: "What would you change in your routine?",
    missions: [{ label: "Would like to", formula: "would like to + verb" }] };
  const sentences = [
    { number: 1, revision: "I would like to study machine learning more consistently.", feedback: "Gunakan consistently untuk menyatakan keinginan belajar secara rutin." },
    { number: 2, revision: "If I had more time, I would practice after work.", feedback: "Tulis I dengan huruf kapital. After work sudah berarti sepulang kerja." },
    { number: 3, revision: "The problem is that I worked overtime last week.", feedback: "Gunakan worked overtime untuk kegiatan lembur dan last week untuk minggu lalu." },
  ];
  const review = { strength: "Kamu menjelaskan tujuan dan hambatannya.", sentences, nextStep: "" };
  const provider = t.mock.method(globalThis, "fetch", async (url, options) => {
    const payload = JSON.parse(options.body);
    if (String(url).includes("groq.com")) {
      const schema = payload.response_format.json_schema.schema.properties.sentences;
      assert.equal(schema.type, "array");
      assert.equal(schema.items.additionalProperties, false);
      assert.equal(schema.items.properties.number.type, "integer");
      const partial = { ...review, sentences: sentences.slice(0, 1) };
      return Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(partial) } }] });
    }
    const context = JSON.parse(payload.contents[0].parts[0].text);
    assert.deepEqual(context.sentences, originals.map((text, index) => ({ number: index + 1, text })));
    return gemini(review);
  });
  const result = await submit(personal, "test-key", "groq-test-key");
  assert.equal(provider.mock.callCount(), 2);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.sentences, sentences.map(({ revision, feedback }, index) => ({
    original: originals[index], revision, feedback,
  })));
  for (const invalid of [sentences.slice(0, 1), [sentences[1], sentences[1], sentences[2]]]) {
    provider.mock.mockImplementation(async () => gemini({ ...review, sentences: invalid }));
    assert.equal((await submit(personal)).status, 503);
  }
});

test("personal writing keeps lowercase starts, quoted endings, abbreviations and decimals with their sentences", () => {
  assert.deepEqual(personalSentences('Dr. Lee paid 3.50. she asked “Why?” I answered'), [
    "Dr. Lee paid 3.50.", "she asked “Why?”", "I answered",
  ]);
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
