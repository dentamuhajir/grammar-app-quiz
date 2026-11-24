import { useState } from "react";
import { quizCombinations, REASON_TENSES, type MultiQuizFilter } from "../grammar/generator";
import { FORM_LABELS, MODE_LABELS, TENSE_LABELS, TENSE_ORDER } from "../grammar/labels";
import type { Mode, SentenceForm, Tense } from "../grammar/types";
import { BottomSheet } from "./BottomSheet";
import type { SentencePracticeMode } from "../grammar/practiceMode";
import { PracticeModePicker } from "./PracticeModePicker";

function toggle<T>(selected: T[], value: T): T[] {
  return selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
}

export function SentenceFilters({ filter, generalFilter, practiceMode, onClose, onApply }: {
  filter: MultiQuizFilter;
  generalFilter: MultiQuizFilter;
  practiceMode: SentencePracticeMode;
  onClose: () => void;
  onApply: (filter: MultiQuizFilter, practiceMode: SentencePracticeMode, generalFilter: MultiQuizFilter) => void;
}) {
  const [draft, setDraft] = useState({ ...generalFilter, focus: filter.focus });
  const [mode, setMode] = useState(practiceMode);
  const [reasonTenses, setReasonTenses] = useState<Tense[] | undefined>(
    filter.focus === "reasonClause" ? filter.tenses : undefined);
  const compatible = REASON_TENSES.filter(tense => draft.tenses.includes(tense));
  const reasonFocus = mode === "arrange" && draft.focus === "reasonClause";
  const activeDraft: MultiQuizFilter = reasonFocus
    ? { ...draft, tenses: reasonTenses ?? (compatible.length ? compatible : [...REASON_TENSES]), modes: ["verbal"], forms: ["positive"] }
    : { ...draft, focus: mode === "arrange" ? draft.focus : undefined };
  const availableTenses: readonly Tense[] = reasonFocus ? REASON_TENSES : TENSE_ORDER;
  const allTenses = activeDraft.tenses.length === availableTenses.length;
  function setTenses(tenses: Tense[]) {
    if (reasonFocus) setReasonTenses(tenses);
    else setDraft({ ...draft, tenses });
  }
  const empty = !activeDraft.tenses.length || !activeDraft.modes.length || !activeDraft.forms.length;
  const supported = quizCombinations(activeDraft).length;

  return <BottomSheet open closeButtonOnly onClose={onClose} title="Filter Sentence Practice">
    <div className="sheet-form">
      <PracticeModePicker value={mode} onChange={setMode} />
      {mode === "arrange" && <fieldset className="sentence-filter-group">
        <legend>Fokus latihan</legend>
        <div className="tenses-pill-row">
          <button type="button" aria-pressed={!draft.focus} className={`tenses-option-pill ${!draft.focus ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: undefined })}>Latihan umum</button>
          <button type="button" aria-pressed={draft.focus === "relativeClause"}
            className={`tenses-option-pill ${draft.focus === "relativeClause" ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: "relativeClause" })}>Relative clause</button>
          <button type="button" aria-pressed={reasonFocus} className={`tenses-option-pill ${reasonFocus ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: "reasonClause" })}>Sebab dan alasan</button>
        </div>
        {draft.focus === "relativeClause" && <small>Tense yang dipilih berlaku untuk kalimat utama.</small>}
        {reasonFocus && <small>Pilih Present Simple, Past Simple, atau keduanya. Klausa utama memakai bentuk verbal positif.</small>}
      </fieldset>}
      <details className="sentence-tense-picker">
        <summary>Tense · {reasonFocus && activeDraft.tenses.length === 1 ? TENSE_LABELS[activeDraft.tenses[0]] :
          !reasonFocus && allTenses ? "Semua tense" : `${activeDraft.tenses.length} tense dipilih`}</summary>
        <fieldset className="sentence-filter-group" aria-label="Tense">
          <button type="button" className="inline-popup-link" onClick={() => setTenses(allTenses ? [] : [...availableTenses])}>
            {allTenses ? "Kosongkan pilihan tense" : "Pilih semua tense"}</button>
          {(["present", "past", "future"] as const).map(time => <div key={time} className="sentence-tense-options">
            <strong>{time === "present" ? "Present" : time === "past" ? "Past" : "Future"}</strong>
            {TENSE_ORDER.filter(tense => tense.startsWith(time)).map(tense =>
              <label key={tense} className="rare-toggle">
                <input type="checkbox" disabled={!availableTenses.includes(tense)} checked={activeDraft.tenses.includes(tense)}
                  onChange={() => setTenses(toggle(activeDraft.tenses, tense))} />
                <span>{TENSE_LABELS[tense]}</span>
              </label>)}
          </div>)}
        </fieldset>
      </details>

      <fieldset className="sentence-filter-group" disabled={reasonFocus}>
        <legend>Jenis kalimat</legend>
        {!reasonFocus && <button type="button" className="inline-popup-link" onClick={() => setDraft({
          ...draft, modes: draft.modes.length === 3 ? [] : ["verbal", "nominal", "passive"],
        })}>{draft.modes.length === 3 ? "Kosongkan pilihan jenis" : "Pilih semua jenis"}</button>}
        <div className="tenses-pill-row">
          {(["verbal", "nominal", "passive"] as Mode[]).map(mode =>
            <button key={mode} type="button" aria-pressed={activeDraft.modes.includes(mode)}
              className={`tenses-option-pill ${activeDraft.modes.includes(mode) ? "active" : ""}`}
              onClick={() => setDraft({...draft, modes: toggle(draft.modes, mode)})}>
              {MODE_LABELS[mode].replace(/\s*\(.*\)/, "")}
            </button>)}
        </div>
      </fieldset>

      <fieldset className="sentence-filter-group" disabled={reasonFocus}>
        <legend>Bentuk kalimat</legend>
        {!reasonFocus && <button type="button" className="inline-popup-link" onClick={() => setDraft({
          ...draft, forms: draft.forms.length === 4 ? [] : ["positive", "negative", "yesNoQuestion", "whQuestion"],
        })}>{draft.forms.length === 4 ? "Kosongkan pilihan bentuk" : "Pilih semua bentuk"}</button>}
        <div className="tenses-pill-row">
          {(["positive", "negative", "yesNoQuestion", "whQuestion"] as SentenceForm[]).map(form =>
            <button key={form} type="button" aria-pressed={activeDraft.forms.includes(form)}
              className={`tenses-option-pill ${activeDraft.forms.includes(form) ? "active" : ""}`}
              onClick={() => setDraft({...draft, forms: toggle(draft.forms, form)})}>
              {FORM_LABELS[form]}
            </button>)}
        </div>
      </fieldset>

      <div aria-live="polite">
        {empty ? <p className="hint">{reasonFocus ? "Pilih minimal satu tense." : "Pilih minimal satu tense, satu jenis, dan satu bentuk kalimat."}</p>
          : !supported ? <p className="hint">
            Kombinasi ini belum didukung. Pilih tense atau jenis kalimat lain untuk melanjutkan.
          </p> : null}
      </div>
      <button type="button" className="btn btn-primary" disabled={empty || !supported}
        onClick={() => onApply(activeDraft, mode, { ...draft, focus: undefined })}>Terapkan Filter</button>
    </div>
  </BottomSheet>;
}
