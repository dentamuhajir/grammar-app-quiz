export const PRACTICE_MODE_LABELS = {
  arrange: "Susun",
  context: "Konteks",
  translate: "Terjemahkan",
};

export type SentencePracticeMode = keyof typeof PRACTICE_MODE_LABELS;
const STORAGE_KEY = "grammar-drill.sentence-practice-mode.v1";

export function loadPracticeMode(): SentencePracticeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "arrange" || saved === "context" || saved === "translate") return saved;
  } catch { /* Practice remains available when storage is restricted. */ }
  return "arrange";
}

export function savePracticeMode(mode: SentencePracticeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch { /* The selection still applies to the current session. */ }
}
