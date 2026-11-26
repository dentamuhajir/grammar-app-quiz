import { useState } from "react";
import { quizCombinations, REASON_TENSES, type MultiQuizFilter } from "../grammar/generator";
import { FORM_LABELS, MODE_LABELS, TENSE_LABELS, TENSE_ORDER } from "../grammar/labels";
import type { Mode, SentenceForm, Tense } from "../grammar/types";
import { BottomSheet } from "./BottomSheet";
import type { SentencePracticeMode } from "../grammar/practiceMode";
import { PracticeModePicker } from "./PracticeModePicker";
import { FOCUSED_FORMS, FOCUS_PATTERNS, QUANTIFIER_TENSES, type FocusPattern } from "../grammar/focusedSentences";
import { FREQUENCY_ADVERBS, FREQUENCY_FORMS, FREQUENCY_MODES, FREQUENCY_TENSES } from "../grammar/frequencySentences";

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
  const [draft, setDraft] = useState({ ...(filter.focus === "quantifiers" || filter.focus === "conditionals" || filter.focus === "frequencyAdverbs" ? filter : generalFilter), focus: filter.focus, focusPattern: filter.focusPattern });
  const [mode, setMode] = useState(practiceMode);
  const [reasonTenses, setReasonTenses] = useState<Tense[] | undefined>(
    filter.focus === "reasonClause" ? filter.tenses : undefined);
  const compatible = REASON_TENSES.filter(tense => draft.tenses.includes(tense));
  const reasonFocus = mode === "arrange" && draft.focus === "reasonClause";
  const patternFocus = mode === "arrange" && (draft.focus === "quantifiers" || draft.focus === "conditionals");
  const quantifierFocus = mode === "arrange" && draft.focus === "quantifiers";
  const conditionalFocus = mode === "arrange" && draft.focus === "conditionals";
  const frequencyFocus = mode === "arrange" && draft.focus === "frequencyAdverbs";
  const limitedForms = patternFocus || frequencyFocus;
  const activeDraft: MultiQuizFilter = reasonFocus
    ? { ...draft, tenses: reasonTenses ?? (compatible.length ? compatible : [...REASON_TENSES]), modes: ["verbal"], forms: ["positive"] }
    : { ...draft, focus: mode === "arrange" ? draft.focus : undefined, focusPattern: mode === "arrange" ? draft.focusPattern : undefined };
  const availableTenses: readonly Tense[] = reasonFocus ? REASON_TENSES : quantifierFocus ? QUANTIFIER_TENSES : frequencyFocus ? FREQUENCY_TENSES : TENSE_ORDER;
  const availableModes: Mode[] = frequencyFocus ? FREQUENCY_MODES : ["verbal", "nominal", "passive"];
  const allTenses = availableTenses.every(tense => activeDraft.tenses.includes(tense));
  function setTenses(tenses: Tense[]) {
    if (reasonFocus) setReasonTenses(tenses);
    else setDraft({ ...draft, tenses });
  }
  const empty = (!conditionalFocus && !activeDraft.tenses.length) || !activeDraft.modes.length || !activeDraft.forms.length;
  const supported = quizCombinations(activeDraft).length;

  return <BottomSheet open closeButtonOnly onClose={onClose} title="Filter Sentence Practice">
    <div className="sheet-form">
      <PracticeModePicker value={mode} onChange={setMode} />
      {mode === "arrange" && <fieldset className="sentence-filter-group">
        <legend>Fokus latihan</legend>
        <div className="tenses-pill-row">
          <button type="button" aria-pressed={!draft.focus} className={`tenses-option-pill ${!draft.focus ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: undefined, focusPattern: undefined })}>Latihan umum</button>
          <button type="button" aria-pressed={draft.focus === "relativeClause"}
            className={`tenses-option-pill ${draft.focus === "relativeClause" ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: "relativeClause", focusPattern: undefined })}>Relative clause</button>
          <button type="button" aria-pressed={frequencyFocus} className={`tenses-option-pill ${frequencyFocus ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: "frequencyAdverbs", focusPattern: undefined,
              tenses: draft.tenses.some(t => FREQUENCY_TENSES.includes(t)) ? draft.tenses.filter(t => FREQUENCY_TENSES.includes(t)) : ["presentSimple"],
              modes: draft.modes.some(m => FREQUENCY_MODES.includes(m)) ? draft.modes.filter(m => FREQUENCY_MODES.includes(m)) : [...FREQUENCY_MODES],
              forms: draft.forms.some(f => FREQUENCY_FORMS.includes(f)) ? draft.forms.filter(f => FREQUENCY_FORMS.includes(f)) : [...FREQUENCY_FORMS] })}>Adverbs of Frequency</button>
          <button type="button" aria-pressed={reasonFocus} className={`tenses-option-pill ${reasonFocus ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: "reasonClause", focusPattern: undefined })}>Sebab dan alasan</button>
          <button type="button" aria-pressed={draft.focus === "quantifiers"} className={`tenses-option-pill ${draft.focus === "quantifiers" ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: "quantifiers", focusPattern: undefined,
              tenses: draft.tenses.some(t => QUANTIFIER_TENSES.includes(t)) ? draft.tenses.filter(t => QUANTIFIER_TENSES.includes(t)) : [...QUANTIFIER_TENSES],
              forms: draft.forms.some(f => FOCUSED_FORMS.includes(f)) ? draft.forms.filter(f => FOCUSED_FORMS.includes(f)) : [...FOCUSED_FORMS] })}>Quantifiers</button>
          <button type="button" aria-pressed={draft.focus === "conditionals"} className={`tenses-option-pill ${draft.focus === "conditionals" ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: "conditionals", focusPattern: undefined, modes: ["verbal"],
              forms: draft.forms.some(f => FOCUSED_FORMS.includes(f)) ? draft.forms.filter(f => FOCUSED_FORMS.includes(f)) : [...FOCUSED_FORMS] })}>If / Conditionals</button>
        </div>
        {draft.focus === "relativeClause" && <small>Tense yang dipilih berlaku untuk kalimat utama.</small>}
        {draft.focus === "relativeClause" && <div className="tenses-pill-row" aria-label="Kata penghubung">
          {([["Semua", undefined], ["who", "who"], ["which", "which"]] as const).map(([label, value]) =>
            <button key={label} type="button" aria-pressed={draft.focusPattern === value}
              className={`tenses-option-pill ${draft.focusPattern === value ? "active" : ""}`}
              onClick={() => setDraft({ ...draft, focusPattern: value })}>{label}</button>)}
        </div>}
        {reasonFocus && <small>Pilih Present Simple, Past Simple, atau keduanya. Klausa utama memakai bentuk verbal positif.</small>}
      </fieldset>}
      {frequencyFocus && <fieldset className="sentence-filter-group">
          <legend>Pola latihan</legend>
          <div className="tenses-pill-row" aria-label="Adverb frekuensi">
            <button type="button" aria-pressed={!draft.focusPattern} className={`tenses-option-pill ${!draft.focusPattern ? "active" : ""}`}
              onClick={() => setDraft({ ...draft, focusPattern: undefined })}>Semua pola</button>
            {FREQUENCY_ADVERBS.map(adverb => <button key={adverb} type="button" aria-pressed={draft.focusPattern === adverb}
              className={`tenses-option-pill ${draft.focusPattern === adverb ? "active" : ""}`}
              onClick={() => setDraft({ ...draft, focusPattern: adverb })}>{adverb}</button>)}
          </div>
          <small>Simple dan Perfect Simple; verbal dan nominal. Pada bentuk negatif, adverb ditempatkan setelah not.</small>
      </fieldset>}
      {patternFocus && <fieldset className="sentence-filter-group">
        <legend>Pola latihan</legend>
        <div className="tenses-pill-row">
          <button type="button" className={`tenses-option-pill ${!draft.focusPattern ? "active" : ""}`}
            aria-pressed={!draft.focusPattern} onClick={() => setDraft({ ...draft, focusPattern: undefined })}>Semua pola</button>
          {FOCUS_PATTERNS[draft.focus as "quantifiers" | "conditionals"].map(item =>
            <button key={item.value} type="button" aria-pressed={draft.focusPattern === item.value}
              className={`tenses-option-pill ${draft.focusPattern === item.value ? "active" : ""}`}
              onClick={() => setDraft({ ...draft, focusPattern: item.value as FocusPattern })}>{item.label}</button>)}
        </div>
        {conditionalFocus && <small>Jenis conditional menentukan kombinasi tense pada syarat dan hasil.</small>}
      </fieldset>}
      {!conditionalFocus && <>
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
      </>}
      {quantifierFocus && <p className="note">Saat ini Quantifiers mendukung Present, Past, dan Future Simple.</p>}
      <fieldset className="sentence-filter-group" disabled={reasonFocus || conditionalFocus}>
        <legend>Jenis kalimat</legend>
        {!reasonFocus && !conditionalFocus && <button type="button" className="inline-popup-link" onClick={() => setDraft({
          ...draft, modes: availableModes.every(m => draft.modes.includes(m)) ? [] : [...availableModes],
        })}>{availableModes.every(m => draft.modes.includes(m)) ? "Kosongkan pilihan jenis" : "Pilih semua jenis"}</button>}
        <div className="tenses-pill-row">
          {(["verbal", "nominal", "passive"] as Mode[]).map(mode =>
            <button key={mode} type="button" disabled={!availableModes.includes(mode)} aria-pressed={activeDraft.modes.includes(mode)}
              className={`tenses-option-pill ${activeDraft.modes.includes(mode) ? "active" : ""}`}
              onClick={() => setDraft({...draft, modes: toggle(draft.modes, mode)})}>
              {MODE_LABELS[mode].replace(/\s*\(.*\)/, "")}
            </button>)}
        </div>
      </fieldset>
      {conditionalFocus && <small>Latihan ini menggunakan klausa hasil verbal.</small>}
      <fieldset className="sentence-filter-group" disabled={reasonFocus}>
        <legend>Bentuk kalimat</legend>
        {!reasonFocus && <button type="button" className="inline-popup-link" onClick={() => {
          const forms = limitedForms ? FOCUSED_FORMS : ["positive", "negative", "yesNoQuestion", "whQuestion"] as SentenceForm[];
          setDraft({ ...draft, forms: forms.every(form => draft.forms.includes(form)) ? [] : [...forms] });
        }}>{(limitedForms ? FOCUSED_FORMS : ["positive", "negative", "yesNoQuestion", "whQuestion"]).every(form => draft.forms.includes(form as SentenceForm)) ? "Kosongkan pilihan bentuk" : "Pilih semua bentuk"}</button>}
        <div className="tenses-pill-row">
          {(["positive", "negative", "yesNoQuestion", "whQuestion"] as SentenceForm[]).map(form =>
            <button key={form} type="button" disabled={limitedForms && !FOCUSED_FORMS.includes(form)} aria-pressed={activeDraft.forms.includes(form)}
              className={`tenses-option-pill ${activeDraft.forms.includes(form) ? "active" : ""}`}
              onClick={() => setDraft({...draft, forms: toggle(draft.forms, form)})}>
              {FORM_LABELS[form]}
            </button>)}
        </div>
      </fieldset>
      {limitedForms && <small>WH-question belum tersedia untuk fokus ini.</small>}

      <div aria-live="polite">
        {empty ? <p className="hint">{reasonFocus ? "Pilih minimal satu tense." : "Pilih minimal satu tense, satu jenis, dan satu bentuk kalimat."}</p>
          : !supported ? <p className="hint">
            Kombinasi ini belum didukung. Pilih tense atau jenis kalimat lain untuk melanjutkan.
          </p> : null}
      </div>
      <button type="button" className="btn btn-primary" disabled={empty || !supported}
        onClick={() => onApply(activeDraft, mode, patternFocus || frequencyFocus ? generalFilter : { ...draft, focus: undefined })}>Terapkan Filter</button>
    </div>
  </BottomSheet>;
}
