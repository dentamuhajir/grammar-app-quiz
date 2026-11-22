import { useState } from "react";
import { quizCombinations, type MultiQuizFilter } from "../grammar/generator";
import { FORM_LABELS, MODE_LABELS, TENSE_LABELS, TENSE_ORDER } from "../grammar/labels";
import type { Mode, SentenceForm, Tense } from "../grammar/types";
import { BottomSheet } from "./BottomSheet";
import type { SentencePracticeMode } from "../grammar/practiceMode";
import { PracticeModePicker } from "./PracticeModePicker";

function toggle<T>(selected: T[], value: T): T[] {
  return selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
}

export function SentenceFilters({ filter, practiceMode, onClose, onApply }: {
  filter: MultiQuizFilter;
  practiceMode: SentencePracticeMode;
  onClose: () => void;
  onApply: (filter: MultiQuizFilter, practiceMode: SentencePracticeMode) => void;
}) {
  const [draft, setDraft] = useState(filter);
  const [mode, setMode] = useState(practiceMode);
  const empty = !draft.tenses.length || !draft.modes.length || !draft.forms.length;
  const supported = quizCombinations(draft).length;
  const total = draft.tenses.length * draft.modes.length * draft.forms.length;

  return <BottomSheet open closeButtonOnly onClose={onClose} title="Filter Sentence Practice">
    <div className="sheet-form">
      <PracticeModePicker value={mode} onChange={setMode} />
      <details className="sentence-tense-picker">
        <summary>Tense · {draft.tenses.length === TENSE_ORDER.length ? "Semua tense" : `${draft.tenses.length} tense dipilih`}</summary>
        <fieldset className="sentence-filter-group" aria-label="Tense">
          <button type="button" className="inline-popup-link" onClick={() => setDraft({
            ...draft, tenses: draft.tenses.length === TENSE_ORDER.length ? [] : [...TENSE_ORDER],
          })}>{draft.tenses.length === TENSE_ORDER.length ? "Kosongkan pilihan tense" : "Pilih semua tense"}</button>
          {(["present", "past", "future"] as const).map(time => <div key={time} className="sentence-tense-options">
            <strong>{time === "present" ? "Present" : time === "past" ? "Past" : "Future"}</strong>
            {TENSE_ORDER.filter(tense => tense.startsWith(time)).map(tense =>
              <label key={tense} className="rare-toggle">
                <input type="checkbox" checked={draft.tenses.includes(tense)}
                  onChange={() => setDraft({...draft, tenses: toggle<Tense>(draft.tenses, tense)})} />
                <span>{TENSE_LABELS[tense]}</span>
              </label>)}
          </div>)}
        </fieldset>
      </details>

      <fieldset className="sentence-filter-group">
        <legend>Jenis kalimat</legend>
        <button type="button" className="inline-popup-link" onClick={() => setDraft({
          ...draft, modes: draft.modes.length === 3 ? [] : ["verbal", "nominal", "passive"],
        })}>{draft.modes.length === 3 ? "Kosongkan pilihan jenis" : "Pilih semua jenis"}</button>
        <div className="tenses-pill-row">
          {(["verbal", "nominal", "passive"] as Mode[]).map(mode =>
            <button key={mode} type="button" aria-pressed={draft.modes.includes(mode)}
              className={`tenses-option-pill ${draft.modes.includes(mode) ? "active" : ""}`}
              onClick={() => setDraft({...draft, modes: toggle(draft.modes, mode)})}>
              {MODE_LABELS[mode].replace(/\s*\(.*\)/, "")}
            </button>)}
        </div>
      </fieldset>

      <fieldset className="sentence-filter-group">
        <legend>Bentuk kalimat</legend>
        <button type="button" className="inline-popup-link" onClick={() => setDraft({
          ...draft, forms: draft.forms.length === 4 ? [] : ["positive", "negative", "yesNoQuestion", "whQuestion"],
        })}>{draft.forms.length === 4 ? "Kosongkan pilihan bentuk" : "Pilih semua bentuk"}</button>
        <div className="tenses-pill-row">
          {(["positive", "negative", "yesNoQuestion", "whQuestion"] as SentenceForm[]).map(form =>
            <button key={form} type="button" aria-pressed={draft.forms.includes(form)}
              className={`tenses-option-pill ${draft.forms.includes(form) ? "active" : ""}`}
              onClick={() => setDraft({...draft, forms: toggle(draft.forms, form)})}>
              {FORM_LABELS[form]}
            </button>)}
        </div>
      </fieldset>

      <label className="rare-toggle">
        <input type="checkbox" checked={draft.includeRare}
          onChange={event => setDraft({...draft, includeRare: event.target.checked})} />
        <span>Sertakan bentuk langka &amp; kata kerja keadaan</span>
      </label>
      <div aria-live="polite">
        {empty ? <p className="hint">Pilih minimal satu tense, satu jenis, dan satu bentuk kalimat.</p>
          : !supported ? <p className="hint">
            Kombinasi ini belum didukung. Untuk nominal, pilih Simple, Perfect, atau Present/Past Continuous.
            Untuk passive langka, aktifkan pilihan bentuk langka.
          </p> : supported < total ? <p className="note">
            Latihan memakai {supported} kombinasi yang didukung dari {total} pilihan.
            Nominal Future Continuous dan Perfect Continuous dibatasi. Passive langka mengikuti pengaturan bentuk langka.
          </p> : null}
      </div>
      <button type="button" className="btn btn-primary" disabled={empty || !supported}
        onClick={() => onApply(draft, mode)}>Terapkan Filter</button>
    </div>
  </BottomSheet>;
}
