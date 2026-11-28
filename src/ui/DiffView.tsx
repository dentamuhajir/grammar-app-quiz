import type { DiffToken } from "../grammar/check";

// Show the user's answer and the reference together.
export function DiffView({ diff }: { diff: DiffToken[] }) {
  const userRow = diff.filter(d => d.op !== "missing");
  const correctRow = diff.filter(d => d.op !== "extra");
  return (
    <div className="diff">
      <div className="diff-row">
        <span className="diff-label">Jawabanmu</span>
        <span className="diff-words" lang="en">
          {!userRow.some(d => d.user) && <em className="diff-empty">(kosong)</em>}
          {userRow.map((d, i) => (
            <span key={i} className={`dw dw-${d.op}`}
              aria-label={d.op === "wrong" ? `${d.user}: periksa kata ini`
                : d.op === "extra" ? `${d.user}: periksa apakah kata ini diperlukan` : undefined}>
              {d.user}
            </span>
          ))}
        </span>
      </div>
      <div className="diff-row">
        <span className="diff-label">Acuan</span>
        <span className="diff-words" lang="en">
          {correctRow.map((d, i) => <span key={i} className={`dw ${d.op === "match" ? "dw-match" : "dw-fix"}`}>
            {d.correct}
          </span>)}
        </span>
      </div>
    </div>
  );
}
