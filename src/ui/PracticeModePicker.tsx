import { PRACTICE_MODE_LABELS, type SentencePracticeMode } from "../grammar/practiceMode";

export function PracticeModePicker({value, onChange}: {
  value: SentencePracticeMode;
  onChange: (mode: SentencePracticeMode) => void;
}) {
  return <fieldset className="sentence-filter-group">
    <legend>Mode latihan</legend>
    <div className="tenses-pill-row">
      {(Object.keys(PRACTICE_MODE_LABELS) as SentencePracticeMode[]).map(mode =>
        <button type="button" key={mode} aria-pressed={mode === value}
          className={`tenses-option-pill ${mode === value ? "active" : ""}`} onClick={() => onChange(mode)}>
          {PRACTICE_MODE_LABELS[mode]}
        </button>)}
    </div>
  </fieldset>;
}
