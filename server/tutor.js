export const isText = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max;

export class ProviderError extends Error {
  constructor(error, upstreamStatus, message, retrySeconds = 0) {
    super(message);
    this.details = { error, upstreamStatus, message };
    this.retrySeconds = retrySeconds;
  }
}

function reply(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

// Each running server remembers only the latest quota delay for each provider.
const cooldowns = new Map();

function quotaError(name, seconds) {
  return new ProviderError("quota", 429, `Batas penggunaan ${name} tercapai. Coba lagi setelah ${seconds} detik.`, seconds);
}

async function generateReview(exercise, generate, key, signal) {
  const review = async () => exercise.parse(await generate(exercise, key, signal));
  try {
    return await review();
  } catch (err) {
    if (signal.aborted || !exercise.retryableOutputErrors?.includes(err.details?.error)) throw err;
    return review();
  }
}

export function createTutorHandler(prepare, getProviders) {
  return async function handleTutor(req, res, ...keys) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return reply(res, 405, { error: "method" });
    }
    if (!req.headers["content-type"]?.startsWith("application/json") || req.headers["sec-fetch-site"] === "cross-site") {
      return reply(res, 403, { error: "request" });
    }
    const providers = getProviders(...keys).filter(provider => provider.key);
    if (!providers.length) return reply(res, 503, { error: "unconfigured" });

    let exercise;
    try {
      let data = req.body;
      // Vite supplies a request stream; Vercel may supply a parsed body.
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

    let failure;
    const disconnected = new AbortController();
    const onClose = () => disconnected.abort();
    res.once?.("close", onClose);
    try {
      for (const { name, key, timeoutMs, generate } of providers) {
        if (res.destroyed || disconnected.signal.aborted) return;
        const cooldown = cooldowns.get(name);
        if (cooldown?.key === key && cooldown.until > Date.now()) {
          failure = quotaError(name, Math.ceil((cooldown.until - Date.now()) / 1000)).details;
          continue;
        }

        const start = Date.now();
        const timeout = AbortSignal.timeout(exercise.timeoutMs?.[name] ?? timeoutMs);
        const signal = AbortSignal.any([timeout, disconnected.signal]);
        try {
          const review = await generateReview(exercise, generate, key, signal);
          return reply(res, 200, review);
        } catch (err) {
          if (disconnected.signal.aborted) return;
          failure = timeout.aborted ? { error: "timeout", message: "Waktu analisis habis. Coba lagi." }
            : err instanceof ProviderError ? err.details : { error: "unavailable" };
          if (failure.error === "quota" && err.retrySeconds > 0) {
            const until = Date.now() + err.retrySeconds * 1000;
            const current = cooldowns.get(name);
            if (current?.key !== key || current.until < until) cooldowns.set(name, { key, until });
            failure = quotaError(name, err.retrySeconds).details;
          }
          console.warn("Tutor request failed", { provider: name, reason: failure.error,
            status: failure.upstreamStatus, durationMs: Date.now() - start });
          if (failure.error === "content_blocked") break;
        }
      }
      return reply(res, failure.error === "quota" ? 429 : 503, failure);
    } finally {
      res.off?.("close", onClose);
    }
  };
}
