import dictionary from "./data/sentenceReadings.json";
import type { Question } from "./types";

type ReadingContext = Pick<Question, "mode" | "tense" | "form">;
const words = new Map(Object.entries(dictionary));

/** Odd slots are words; even slots keep the sentence's spaces and punctuation. */
export function sentenceReading(sentence: string, context?: ReadingContext): string | null {
  const parts = sentence.toLowerCase().replace(/’/g, "'").split(/(\b[ap]\.m\.|[\p{L}\d]+(?:'[\p{L}]+)*)/gu);
  if (parts.length === 1) return null;
  for (let index = 1; index < parts.length; index += 2) {
    const key = parts[index];
    let reading = words.get(key);
    if (!reading) return null;
    if (key === "read" && context && (context.mode === "passive" || context.tense.endsWith("Perfect")
        || (context.tense === "pastSimple" && context.form === "positive"))) {
      reading = "réd";
    }
    if (key === "the") {
      const nextReading = words.get(parts[index + 2]);
      if (nextReading && /^[aeéiou]/i.test(nextReading)) reading = "dhii";
    }
    parts[index] = reading;
  }
  return parts.join("").replace(/\s+/g, " ").trim();
}
