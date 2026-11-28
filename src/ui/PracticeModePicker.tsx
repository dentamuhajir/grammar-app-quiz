import { PRACTICE_MODE_LABELS, type SentencePracticeMode } from "../grammar/practiceMode";

export function PracticeModePicker({value, onChange}: {
  value: SentencePracticeMode;
  onChange: (mode: SentencePracticeMode) => void;
}) {
  return <fieldset className="sentence-filter-group">
    <legend>Petunjuk &amp; cara latihan</legend>
    <div className="tenses-pill-row">
      {(Object.keys(PRACTICE_MODE_LABELS) as SentencePracticeMode[]).map(mode =>
        <button type="button" key={mode} aria-pressed={mode === value}
          className={`tenses-option-pill ${mode === value ? "active" : ""}`} onClick={() => onChange(mode)}>
          {mode === "context" ? "Sembunyikan nama tense" : PRACTICE_MODE_LABELS[mode]}
        </button>)}
    </div>
    <small>{value === "context" ? "Situasi waktu menggantikan nama tense. Jenis dan bentuk kalimat tetap ditampilkan."
      : value === "translate" ? "Latihan terjemahan terarah untuk Latihan umum. Gunakan kata panduan yang tersedia."
      : "Susun kalimat dari bahan kata dengan petunjuk tense, jenis, dan bentuk."}</small>
  </fieldset>;
}
