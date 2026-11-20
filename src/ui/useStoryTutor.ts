import { useEffect, useRef, useState } from "react";
import type { StoryScenario } from "../grammar/story/engine";

interface StoryReview {
  strength: string;
  focus: "correction" | "mission" | "complete";
  revision: string;
  feedback: string;
  explanation: string;
}

export function useStoryTutor(onUnavailable: () => void) {
  const pending = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<StoryReview | null>(null);
  const [notice, setNotice] = useState("");

  function cancel() {
    pending.current?.abort();
    pending.current = null;
  }

  useEffect(() => cancel, []);

  function clear() {
    cancel();
    setBusy(false);
    setReview(null);
    setNotice("");
  }

  async function check(scenario: StoryScenario, story: string) {
    if (pending.current) return;
    clear();
    if (story.length > 8000) {
      setNotice("Hasil lokal tersedia. Untuk menerima masukan Gemini, periksa hingga 8.000 karakter sekaligus.");
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    let reason = "Tutor Gemini sedang tidak tersedia.";
    try {
      const response = await fetch("/api/story", {
        method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, scenario: scenario.scenarioPrompt,
          missions: scenario.missions.map(({ label, formula }) => ({ label, formula })) }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (typeof data.message === "string") reason = data.message;
        if (data.error === "unconfigured") reason = "Tutor Gemini belum diaktifkan oleh pengelola aplikasi.";
        throw new Error("Tutor unavailable");
      }
      if (!["correction", "mission", "complete"].includes(data.focus)
          || ![data.strength, data.feedback, data.explanation, data.revision].every(v => typeof v === "string")
          || !data.strength.trim()) throw new Error("Incomplete story review");
      if (pending.current === controller) setReview(data);
    } catch {
      if (pending.current === controller) {
        setNotice(reason + " Hasil pemeriksaan lokal tersedia di bawah.");
        onUnavailable();
      }
    } finally {
      window.clearTimeout(timeout);
      if (pending.current === controller) {
        pending.current = null;
        setBusy(false);
      }
    }
  }

  return { busy, review, notice, clear, check };
}
