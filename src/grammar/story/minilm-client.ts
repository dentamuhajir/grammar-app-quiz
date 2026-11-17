/**
 * On-Device MiniLM-L6-v2 Embedding Client (Web Worker) for Story Challenge (13.5).
 *
 * Architecture:
 * - Runs `Xenova/all-MiniLM-L6-v2` (quantized `q8`, ~23 MB) inside a dedicated Web Worker
 *   so the main UI thread on mobile devices never freezes (stays 60 FPS).
 * - Lazily loads `@huggingface/transformers` on-demand inside the Worker only when activated,
 *   keeping the initial PWA bundle size at 0 KB extra and avoiding blocking initial install.
 * - Caches reference anchor embeddings per scenario ID in worker memory so each check only
 *   embeds the user's paragraph (~15-60 ms on mid-range phones).
 */

export type MiniLmModelStatus = "idle" | "loading" | "ready" | "error";

export interface MiniLmProgressEvent {
  status: MiniLmModelStatus;
  progress: number; // 0..100
  message: string;
}

export interface MiniLmSimilarityResult {
  rawCosine: number; // Raw cosine similarity from 384-dim normalized MiniLM vectors (-1..1)
  calibratedScore: number; // Calibrated relevance score (0..1)
  anchorSimilarities: number[];
  latencyMs: number;
}

type StatusListener = (event: MiniLmProgressEvent) => void;

let workerInstance: Worker | null = null;
let currentStatus: MiniLmProgressEvent = {
  status: "idle",
  progress: 0,
  message: "Mode hemat kuota aktif (Semantik Lokal). Klik untuk memuat model MiniLM-L6-v2 (~23 MB).",
};
const listeners = new Set<StatusListener>();
let requestCounter = 0;
const pendingRequests = new Map<
  number,
  {
    resolve: (res: MiniLmSimilarityResult) => void;
    reject: (err: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }
>();

function notifyListeners(next: MiniLmProgressEvent) {
  currentStatus = next;
  for (const fn of listeners) {
    fn(currentStatus);
  }
}

export function getMiniLmStatus(): MiniLmProgressEvent {
  return currentStatus;
}

export function subscribeMiniLmStatus(listener: StatusListener): () => void {
  listeners.add(listener);
  listener(currentStatus);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Calibrates raw MiniLM-L6-v2 cosine similarity into a [0, 1] topic relevance scale.
 * Empirically on 3-sentence paragraphs with `all-MiniLM-L6-v2`:
 * - Unrelated stories typically score 0.12 - 0.28
 * - Partially related / ambiguous stories score 0.30 - 0.48
 * - On-topic stories (even with different phrasing/synonyms) score 0.50 - 0.88+
 */
export function calibrateMiniLmCosine(rawCosine: number): number {
  if (!Number.isFinite(rawCosine)) return 0;
  const clamped = Math.max(0, Math.min(1, rawCosine));
  if (clamped <= 0.18) {
    return (clamped / 0.18) * 0.15;
  }
  if (clamped <= 0.32) {
    return 0.15 + ((clamped - 0.18) / (0.32 - 0.18)) * 0.25;
  }
  if (clamped <= 0.50) {
    return 0.40 + ((clamped - 0.32) / (0.50 - 0.32)) * 0.30;
  }
  return Math.min(1, 0.70 + ((clamped - 0.50) / (0.82 - 0.50)) * 0.30);
}

const WORKER_SOURCE = `
let extractor = null;
let pipelinePromise = null;
const anchorCache = new Map();

function cosineSim(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dot / denom : 0;
}

async function ensurePipeline() {
  if (extractor) return extractor;
  if (pipelinePromise) return pipelinePromise;
  pipelinePromise = loadPipeline().catch(err => { pipelinePromise = null; throw err; });
  return pipelinePromise;
}

async function loadPipeline() {
  self.postMessage({
    type: "status",
    status: "loading",
    progress: 8,
    message: "Memuat runtime ONNX & model MiniLM-L6-v2 (quantized q8)..."
  });

  const { pipeline, env } = await import(
    "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3/dist/transformers.min.js"
  );
  env.allowLocalModels = false;
  env.useBrowserCache = true;

  extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
    dtype: "q8",
    progress_callback: (info) => {
      if (info && typeof info.progress === "number") {
        const pct = Math.min(99, Math.max(10, Math.round(info.progress)));
        self.postMessage({
          type: "status",
          status: "loading",
          progress: pct,
          message: "Mengunduh & menyimpan model MiniLM-L6-v2 di cache HP (" + pct + "%)..."
        });
      }
    }
  });

  self.postMessage({
    type: "status",
    status: "ready",
    progress: 100,
    message: "MiniLM-L6-v2 (384-dim q8) siap di perangkat."
  });

  return extractor;
}

async function embedText(pipe, text) {
  const output = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

let queue = Promise.resolve();
self.onmessage = (event) => {
  queue = queue.then(() => handleMessage(event)).catch(() => {});
};
async function handleMessage(event) {
  const msg = event.data;
  if (!msg) return;

  if (msg.type === "init") {
    try {
      await ensurePipeline();
    } catch (err) {
      self.postMessage({
        type: "status",
        status: "error",
        progress: 0,
        message: "Gagal memuat MiniLM dari jaringan. Menggunakan estimasi semantik lokal."
      });
    }
    return;
  }

  if (msg.type === "compare") {
    const { id, scenarioId, anchors, userText } = msg;
    const t0 = performance.now();
    try {
      const pipe = await ensurePipeline();
      const cacheKey = JSON.stringify([scenarioId, anchors]);
      let anchorVectors = anchorCache.get(cacheKey);
      if (!anchorVectors) {
        anchorVectors = [];
        for (const anchor of anchors) {
          const vec = await embedText(pipe, anchor);
          anchorVectors.push(vec);
        }
        anchorCache.set(cacheKey, anchorVectors);
      }

      const userVec = await embedText(pipe, userText);
      const sims = anchorVectors.map((aVec) => cosineSim(userVec, aVec));
      const sorted = [...sims].sort((a, b) => b - a);
      const topSim = sorted.length >= 2
        ? sorted[0] * 0.7 + sorted[1] * 0.3
        : (sorted[0] ?? 0);

      const latencyMs = Math.round(performance.now() - t0);
      self.postMessage({
        type: "result",
        id,
        rawCosine: topSim,
        anchorSimilarities: sims,
        latencyMs
      });
    } catch (err) {
      self.postMessage({
        type: "error",
        id,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }
};
`;

function ensureWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return null;
  }
  if (workerInstance) return workerInstance;

  try {
    const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    workerInstance = new Worker(url, { type: "module" });

    workerInstance.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === "status") {
        notifyListeners({
          status: data.status,
          progress: data.progress ?? 0,
          message: data.message ?? "",
        });
        return;
      }

      if (data.type === "result") {
        const pending = pendingRequests.get(data.id);
        if (pending) {
          pendingRequests.delete(data.id);
          clearTimeout(pending.timer);
          const rawCosine = Number(data.rawCosine ?? 0);
          pending.resolve({
            rawCosine,
            calibratedScore: calibrateMiniLmCosine(rawCosine),
            anchorSimilarities: Array.isArray(data.anchorSimilarities)
              ? data.anchorSimilarities
              : [rawCosine],
            latencyMs: Number(data.latencyMs ?? 0),
          });
        }
        return;
      }

      if (data.type === "error") {
        const pending = pendingRequests.get(data.id);
        if (pending) {
          pendingRequests.delete(data.id);
          clearTimeout(pending.timer);
          pending.reject(new Error(data.error ?? "MiniLM worker error"));
        }
      }
    };

    workerInstance.onerror = () => {
      for (const pending of pendingRequests.values()) {
        clearTimeout(pending.timer);
        pending.reject(new Error("MiniLM worker failed"));
      }
      pendingRequests.clear();
      workerInstance?.terminate();
      workerInstance = null;
      notifyListeners({
        status: "error",
        progress: 0,
        message: "Worker MiniLM tidak dapat dijalankan di browser ini. Menggunakan semantik lokal.",
      });
    };

    URL.revokeObjectURL(url);

    return workerInstance;
  } catch {
    return null;
  }
}

/**
 * Explicitly starts loading the quantized MiniLM model in the background Web Worker.
 */
export function initMiniLmModel(): void {
  const worker = ensureWorker();
  if (!worker) {
    notifyListeners({
      status: "error",
      progress: 0,
      message: "Web Worker tidak tersedia. Menggunakan estimasi semantik lokal.",
    });
    return;
  }
  worker.postMessage({ type: "init" });
}

/**
 * Computes semantic similarity using the on-device MiniLM Web Worker.
 */
export function computeMiniLmSimilarityAsync(
  scenarioId: string,
  anchors: string[],
  userText: string,
): Promise<MiniLmSimilarityResult> {
  return new Promise((resolve, reject) => {
    const worker = ensureWorker();
    if (!worker) {
      reject(new Error("Web Worker unavailable"));
      return;
    }
    const id = ++requestCounter;
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error("MiniLM request timed out; use local matching"));
    }, 60000);
    pendingRequests.set(id, { resolve, reject, timer });
    worker.postMessage({
      type: "compare",
      id,
      scenarioId,
      anchors,
      userText,
    });
  });
}

/**
 * Compares a user's Q&A reply against multiple intent branches (each with multiple example sentences)
 * using the shared on-device MiniLM Web Worker.
 */
export async function computeMiniLmIntentScoresAsync(
  nodeId: string,
  branches: ReadonlyArray<{ id: string; examples: readonly string[] }>,
  userText: string,
): Promise<{
  branchCosines: Record<string, number>;
  latencyMs: number;
}> {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const branchCosines: Record<string, number> = {};
  // One request embeds the reply once and compares it to all intent examples.
  const result = await computeMiniLmSimilarityAsync(
    `qa-${nodeId}`,
    branches.flatMap(branch => [...branch.examples]),
    userText,
  );
  let offset = 0;
  for (const branch of branches) {
    const scores = result.anchorSimilarities.slice(offset, offset + branch.examples.length).sort((a, b) => b - a);
    branchCosines[branch.id] = scores.length > 1 ? scores[0] * 0.7 + scores[1] * 0.3 : (scores[0] ?? 0);
    offset += branch.examples.length;
  }
  const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
  return {
    branchCosines,
    latencyMs: Math.max(1, Math.round(t1 - t0)),
  };
}
