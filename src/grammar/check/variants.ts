import type { Question } from "../types";
import { normalize } from "./normalize";

/** Only allow a complete known time adjunct to move to the front of a statement.
 * No arbitrary token reordering; duration/"yet" phrases are intentionally excluded.
 */
export function sentenceVariants(q: Question): string[] {
  const canonical = normalize(q.answer);
  const variants = [canonical];
  if (!q.timeSignal || !["positive", "negative"].includes(q.form)) return variants;
  const time = normalize(q.timeSignal);
  if (!/^(?:yesterday|today|tomorrow|tonight|right now|at |on |in |by |before |when |last |next |this |every |(?:two|three) days ago)/.test(time)) return variants;
  if (canonical.endsWith(` ${time}`)) variants.push(`${time} ${canonical.slice(0, -time.length - 1)}`);
  return variants;
}
