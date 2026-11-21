import { useRef } from "react";
import { saveAttempt, type Outcome, type ReviewSlot } from "../grammar/forSinceReview";

export function useForSinceAttempt() {
  const first = useRef<Outcome | null>(null);
  const hintUsed = useRef(false);

  function reset() {
    first.current = null;
    hintUsed.current = false;
  }

  function record(slot: ReviewSlot, outcome: Outcome, review?: ReviewSlot) {
    first.current ??= outcome;
    saveAttempt(slot, first.current, outcome, hintUsed.current, review);
    if (outcome === "incorrect") hintUsed.current = true;
  }

  return { reset, record, hint: () => { hintUsed.current = true; } };
}
