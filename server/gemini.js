import { ProviderError } from "./tutor.js";

const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

async function geminiError(upstream) {
  const status = upstream.status;
  const body = await upstream.json().catch(() => null);
  const details = Array.isArray(body?.error?.details) ? body.error.details : [];
  if (status === 429) {
    const retry = details.find(item => item?.["@type"] === "type.googleapis.com/google.rpc.RetryInfo")?.retryDelay;
    const seconds = typeof retry === "string" && /^\d{1,7}(\.\d+)?s$/.test(retry) ? Math.ceil(parseFloat(retry)) : 0;
    return new ProviderError("quota", status, "Batas penggunaan Gemini tercapai.", seconds);
  }
  if (status === 401 || details.some(item => item?.reason === "API_KEY_INVALID")) {
    return new ProviderError("invalid_key", status, "Google menolak API key. Periksa key proyek di Google AI Studio.");
  }
  if (status === 403) return new ProviderError("access_denied", status, "Google menolak akses. Periksa izin API key di Google AI Studio.");
  if (status === 404) return new ProviderError("model_unavailable", status, "Model tutor tidak tersedia pada endpoint Gemini ini.");
  if (status >= 500) return new ProviderError("service_unavailable", status, "Layanan Gemini mengalami gangguan. Coba lagi sebentar.");
  return new ProviderError("request_rejected", status, "Google menolak permintaan tutor.");
}

async function generate(exercise, apiKey, signal) {
  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: exercise.instructions }] },
      contents: [{ role: "user", parts: [{ text: JSON.stringify(exercise.context) }] }],
      generationConfig: {
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
        responseSchema: exercise.schema,
      },
    }),
  });
  if (!upstream.ok) throw await geminiError(upstream);
  const result = await upstream.json();
  const candidate = result.candidates?.[0];
  if (candidate?.finishReason !== "STOP") throw new Error("Incomplete tutor response");
  return JSON.parse(candidate.content.parts.filter(p => !p.thought).map(p => p.text).join(""));
}

export function geminiProvider(key, timeoutMs = 20_000) {
  return { name: "Gemini", key, timeoutMs, generate };
}
