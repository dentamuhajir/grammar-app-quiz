import { ProviderError } from "./tutor.js";

const url = "https://api.groq.com/openai/v1/chat/completions";

async function generate(exercise, apiKey, signal) {
  // Roleplay has a flat object of string fields and an optional branch enum.
  const properties = Object.fromEntries(Object.entries(exercise.schema.properties)
    .map(([name, field]) => [name, { ...field, type: "string" }]));
  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    signal,
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: exercise.instructions },
        { role: "user", content: JSON.stringify(exercise.context) },
      ],
      max_completion_tokens: 1024,
      reasoning_effort: "low",
      response_format: { type: "json_schema", json_schema: { name: "roleplay_turn", strict: true,
        schema: { type: "object", properties, required: exercise.schema.required, additionalProperties: false } } },
    }),
  });
  if (!upstream.ok) {
    const status = upstream.status;
    if (status === 429) {
      const retry = Number(upstream.headers.get("retry-after"));
      const seconds = Number.isFinite(retry) && retry > 0 ? Math.ceil(retry) : 0;
      throw new ProviderError("quota", status, "Batas penggunaan Groq tercapai.", seconds);
    }
    const body = await upstream.json().catch(() => null);
    if (body?.error?.code === "content_policy_violation") {
      throw new ProviderError("content_blocked", status, "Tutor tidak dapat memproses jawaban ini.");
    }
    throw new ProviderError("request_rejected", status, "Groq tidak dapat memproses permintaan tutor.");
  }
  const result = await upstream.json();
  const choice = result.choices?.[0];
  if (choice?.message?.refusal || choice?.finish_reason === "content_filter") {
    throw new ProviderError("content_blocked", upstream.status, "Tutor tidak dapat memproses jawaban ini.");
  }
  if (choice?.finish_reason !== "stop") throw new Error("Incomplete tutor response");
  return JSON.parse(choice.message.content);
}

export function groqProvider(key) {
  return { name: "Groq", key, timeoutMs: 8_000, generate };
}
