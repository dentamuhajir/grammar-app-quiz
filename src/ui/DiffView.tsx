import type { DiffToken } from "../grammar/check";

/**
 * Shows the learner's answer with each word colored by correctness, plus the
 * correct sentence underneath with missing words highlighted. Reading the two
 * rows together makes the exact mistake obvious.
 */
export function DiffView({ diff }: { diff: DiffToken[] }) {
  const userRow = diff.filter((d) => d.op !== "missing");
  const correctRow = diff.filter((d) => d.op !== "extra");

  return (
    <div className="diff">
      <div className="diff-row">
        <span className="diff-label">You wrote</span>
        <span className="diff-words">
          {userRow.length === 0 && <em className="diff-empty">(empty)</em>}
          {userRow.map((d, i) => (
            <span key={i} className={`dw dw-${d.op}`}>
              {d.user}
            </span>
          ))}
        </span>
      </div>
      <div className="diff-row">
        <span className="diff-label">Correct</span>
        <span className="diff-words">
          {correctRow.map((d, i) => (
            <span
              key={i}
              className={`dw ${d.op === "match" ? "dw-match" : "dw-fix"}`}
            >
              {d.correct}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
