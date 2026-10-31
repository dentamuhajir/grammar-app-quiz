import { isContinuous, isPerfect as isPerfectTense } from "../labels";
import type { Question } from "../types";
import type { DiffToken } from "./diff";

/**
 * Produce a single, targeted hint from the question context and the first
 * meaningful difference. Rules mirror the PDF material. We intentionally return
 * ONE focused hint (the most relevant) rather than a wall of text.
 */

const DO_AUX = new Set(["do", "does", "did"]);
const BE_AUX = new Set(["am", "is", "are", "was", "were", "be", "being", "been"]);
const HAVE_AUX = new Set(["have", "has", "had"]);
const MODAL = new Set(["will"]);

function firstIssue(diff: DiffToken[]): DiffToken | undefined {
  return diff.find((d) => d.op !== "match");
}

function classifyWord(w: string): "do" | "be" | "have" | "modal" | "not" | "other" {
  if (DO_AUX.has(w)) return "do";
  if (BE_AUX.has(w)) return "be";
  if (HAVE_AUX.has(w)) return "have";
  if (MODAL.has(w)) return "modal";
  if (w === "not") return "not";
  return "other";
}

/**
 * Returns a human-friendly hint string, or a generic nudge if nothing specific
 * applies. `diff` is user-vs-correct at the token level.
 */
export function buildHint(q: Question, diff: DiffToken[]): string {
  const issue = firstIssue(diff);
  if (!issue) return "Looks right.";

  const correctWord = issue.correct ?? "";
  const userWord = issue.user ?? "";
  const kind = classifyWord(correctWord || userWord);

  // --- auxiliary agreement (do/does/did) ---
  if (DO_AUX.has(correctWord) || DO_AUX.has(userWord)) {
    if (correctWord === "does") {
      return 'Third-person singular (he/she/it) uses "does" in the present simple.';
    }
    if (correctWord === "do") {
      return 'Use "do" with I/you/we/they in the present simple.';
    }
    if (correctWord === "did") {
      return 'The past simple question/negative uses "did" — and the main verb goes back to its base form (V1).';
    }
  }

  // --- present simple -s/-es on the main verb ---
  if (
    q.tense === "presentSimple" &&
    q.form === "positive" &&
    q.subject.number === "singular" &&
    q.subject.person === 3 &&
    q.verb &&
    (correctWord === q.verb.thirdSingular || userWord === q.verb.base)
  ) {
    return `Third-person singular adds -s/-es: "${q.verb.thirdSingular}", not "${q.verb.base}".`;
  }

  // --- be agreement (am/is/are/was/were) ---
  if (BE_AUX.has(correctWord)) {
    if (["am", "is", "are"].includes(correctWord)) {
      return `Check the "to be" form. For this subject it should be "${correctWord}".`;
    }
    if (["was", "were"].includes(correctWord)) {
      return `Past "to be": use "${correctWord}" with this subject.`;
    }
    if (correctWord === "been") {
      return 'Perfect tenses use "been" (the V3 of "be") after have/has/had.';
    }
    if (correctWord === "being") {
      return 'Continuous passive / temporary behavior uses "being".';
    }
    if (correctWord === "be") {
      return 'After a modal like "will", use the bare "be".';
    }
  }

  // --- have/has in perfect ---
  if (HAVE_AUX.has(correctWord)) {
    if (correctWord === "has") return 'Third-person singular uses "has" in the perfect.';
    if (correctWord === "have") return 'Use "have" with I/you/we/they in the perfect.';
    if (correctWord === "had") return 'The past perfect uses "had" for every subject.';
  }

  // --- verb form (V1 / V2 / V3 / -ing) ---
  // When the issue is on the main verb, explain the form the TENSE expects.
  // We use the tense (not just string identity) because for regular verbs
  // V2 and V3 are spelled the same ("cooked").
  if (q.verb) {
    const { base, past, participle, ing } = q.verb;
    const forms = new Set([base, past, participle, ing]);
    const onMainVerb = forms.has(correctWord) || forms.has(userWord);
    if (onMainVerb && correctWord !== userWord) {
      if (correctWord === ing) {
        return `Continuous tenses use the -ing form: "${ing}".`;
      }
      if (isPerfectTense(q.tense) && correctWord === participle) {
        return `This tense needs the past participle (V3): "${participle}".`;
      }
      if (q.tense === "pastSimple" && q.form === "positive" && correctWord === past) {
        return `Past simple positive uses V2: "${past}".`;
      }
      if (correctWord === participle) {
        return `This tense needs the past participle (V3): "${participle}".`;
      }
      if (correctWord === past) {
        return `This form uses V2: "${past}".`;
      }
      if (correctWord === base) {
        return `After the auxiliary, the main verb returns to its base form (V1): "${base}".`;
      }
    }
  }

  // --- negation placement ---
  if (kind === "not" || correctWord === "not" || userWord === "not") {
    return 'Place "not" right after the (first) auxiliary.';
  }

  // --- word order for questions ---
  if (q.form === "yesNoQuestion" || q.form === "whQuestion") {
    if (issue.op === "wrong" || issue.op === "missing") {
      return "In questions, the auxiliary comes before the subject.";
    }
  }

  // --- missing / extra words ---
  if (issue.op === "missing") {
    return `You're missing a word: "${issue.correct}".`;
  }
  if (issue.op === "extra") {
    return `Remove the extra word: "${issue.user}".`;
  }

  // --- tense-family fallbacks ---
  if (isContinuous(q.tense)) {
    return "Remember the continuous pattern: be + verb-ing.";
  }
  if (isPerfectTense(q.tense)) {
    return "Remember the perfect pattern: have/has/had + V3.";
  }

  return `Check this word: you wrote "${userWord || "—"}", expected "${correctWord || "—"}".`;
}
