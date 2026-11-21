const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";
export const isText = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max;

function reply(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

async function replyGeminiError(res, upstream) {
  const status = upstream.status;
  const body = await upstream.json().catch(() => null);
  const details = Array.isArray(body?.error?.details) ? body.error.details : [];
  let error = "request_rejected";
  let message = "Google menolak permintaan tutor.";
  if (status === 429) {
    error = "quota";
    message = "Batas penggunaan Gemini tercapai.";
    const retry = details.find(item => item?.["@type"] === "type.googleapis.com/google.rpc.RetryInfo")?.retryDelay;
    if (typeof retry === "string" && /^\d{1,7}(\.\d+)?s$/.test(retry)) {
      message += ` Coba lagi setelah ${Math.ceil(parseFloat(retry))} detik.`;
    }
  } else if (status === 401 || details.some(item => item?.reason === "API_KEY_INVALID")) {
    error = "invalid_key";
    message = "Google menolak API key. Periksa key proyek di Google AI Studio.";
  } else if (status === 403) {
    error = "access_denied";
    message = "Google menolak akses. Periksa status dan izin API key di Google AI Studio.";
  } else if (status === 404) {
    error = "model_unavailable";
    message = "Model tutor tidak tersedia pada endpoint Gemini ini.";
  } else if (status >= 500) {
    error = "service_unavailable";
    message = "Layanan Gemini mengalami gangguan. Coba lagi sebentar.";
  }
  return reply(res, status === 429 ? 429 : 503, { error, upstreamStatus: status, message });
}

// Vite supplies a request stream; Vercel may supply a parsed body.
export function createTutorHandler(prepare) {
  return async function handleTutor(req, res, apiKey) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return reply(res, 405, { error: "method" });
    }
    if (!req.headers["content-type"]?.startsWith("application/json") || req.headers["sec-fetch-site"] === "cross-site") {
      return reply(res, 403, { error: "request" });
    }
    if (!apiKey) return reply(res, 503, { error: "unconfigured" });

    let exercise;
    try {
      let data = req.body;
      if (data === undefined) {
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 48_000) return reply(res, 413, { error: "size" });
          chunks.push(chunk);
        }
        data = Buffer.concat(chunks).toString("utf8");
      }
      if (typeof data === "string") data = JSON.parse(data);
      exercise = prepare(data);
      if (!exercise) return reply(res, 400, { error: "input" });
    } catch {
      return reply(res, 400, { error: "input" });
    }

    try {
      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        signal: AbortSignal.timeout(20_000),
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
      if (!upstream.ok) return await replyGeminiError(res, upstream);
      const result = await upstream.json();
      const candidate = result.candidates?.[0];
      if (candidate?.finishReason !== "STOP") throw new Error("Incomplete tutor response");
      const resultText = candidate.content.parts.filter(p => !p.thought).map(p => p.text).join("");
      return reply(res, 200, exercise.parse(JSON.parse(resultText)));
    } catch {
      return reply(res, 503, { error: "unavailable" });
    }
  };
}
