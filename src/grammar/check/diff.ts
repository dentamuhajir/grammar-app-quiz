/**
 * Word-level diff using the Longest Common Subsequence (LCS). This aligns the
 * user's tokens against the correct tokens so we can tell, per word, whether it
 * matches, was changed, is missing, or is extra, even when a word is inserted
 * or dropped mid-sentence (naive index comparison can't do that).
 */

export type DiffOp = "match" | "wrong" | "missing" | "extra";

export interface DiffToken {
  op: DiffOp;
  /** token from the user's answer (undefined for "missing") */
  user?: string;
  /** token from the correct answer (undefined for "extra") */
  correct?: string;
  /** index into the correct-token array, when applicable */
  correctIndex?: number;
}

/** Build the LCS table for two token arrays. */
function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return dp;
}

/**
 * Diff user tokens against correct tokens.
 * - "match": same word in sequence
 * - "wrong": a user word aligned to a correct word but different
 * - "missing": a correct word the user omitted
 * - "extra": a user word with no counterpart
 *
 * We first compute the LCS (the correctly-placed words), then walk both
 * sequences, pairing non-matching runs as substitutions where possible and
 * labeling leftovers as missing/extra.
 */
export function diffTokens(user: string[], correct: string[]): DiffToken[] {
  const dp = lcsTable(user, correct);
  const out: DiffToken[] = [];
  let i = 0;
  let j = 0;

  // Walk the LCS path, collecting "gaps" (non-matching runs) between anchors.
  const emitGap = (uGap: string[], cGap: string[], cStart: number) => {
    const common = Math.min(uGap.length, cGap.length);
    for (let k = 0; k < common; k++) {
      out.push({
        op: "wrong",
        user: uGap[k],
        correct: cGap[k],
        correctIndex: cStart + k,
      });
    }
    // leftover correct words -> missing
    for (let k = common; k < cGap.length; k++) {
      out.push({ op: "missing", correct: cGap[k], correctIndex: cStart + k });
    }
    // leftover user words -> extra
    for (let k = common; k < uGap.length; k++) {
      out.push({ op: "extra", user: uGap[k] });
    }
  };

  let uGap: string[] = [];
  let cGap: string[] = [];
  let cGapStart = 0;

  while (i < user.length && j < correct.length) {
    if (user[i] === correct[j]) {
      if (uGap.length || cGap.length) {
        emitGap(uGap, cGap, cGapStart);
        uGap = [];
        cGap = [];
      }
      out.push({ op: "match", user: user[i], correct: correct[j], correctIndex: j });
      i++;
      j++;
      cGapStart = j;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      // advancing i drops user[i] -> part of a gap on the user side
      if (!uGap.length && !cGap.length) cGapStart = j;
      uGap.push(user[i]);
      i++;
    } else {
      if (!uGap.length && !cGap.length) cGapStart = j;
      cGap.push(correct[j]);
      j++;
    }
  }
  // trailing
  while (i < user.length) {
    if (!uGap.length && !cGap.length) cGapStart = j;
    uGap.push(user[i]);
    i++;
  }
  while (j < correct.length) {
    if (!uGap.length && !cGap.length) cGapStart = j;
    cGap.push(correct[j]);
    j++;
  }
  if (uGap.length || cGap.length) emitGap(uGap, cGap, cGapStart);

  return out;
}

/** True when every correct token is matched and there are no extras. */
export function isPerfect(diff: DiffToken[]): boolean {
  return diff.every((d) => d.op === "match");
}
