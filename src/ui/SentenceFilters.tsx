import { GERUND_TENSES } from "../grammar/gerundSentences";
import { useState } from "react";
import { quizCombinations, REASON_TENSES, type MultiQuizFilter } from "../grammar/generator";
import { FORM_LABELS, MODE_LABELS, TENSE_LABELS, TENSE_ORDER } from "../grammar/labels";
import type { Mode, SentenceForm, Tense } from "../grammar/types";
import { BottomSheet } from "./BottomSheet";
import type { SentencePracticeMode } from "../grammar/practiceMode";
import { PracticeModePicker } from "./PracticeModePicker";
import { FOCUSED_FORMS, FOCUS_PATTERNS, QUANTIFIER_TENSES, supportsQuantifier, type FocusPattern } from "../grammar/focusedSentences";
import { FREQUENCY_ADVERBS, FREQUENCY_FORMS, FREQUENCY_MODES, FREQUENCY_TENSES } from "../grammar/frequencySentences";
import { MODAL_FUNCTIONS, MODAL_TIMES, modalForms, modalPatterns, type ModalSelection } from "../grammar/modalSentences";
import { STRUCTURE_PATTERNS, structureItems, usesStructureBank, type StructureFocus, type StructurePattern } from "../grammar/structureSentences";

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
  const [draft, setDraft] = useState<MultiQuizFilter>({ ...(filter.focus === "gerundInfinitive" || filter.focus === "quantifiers" || filter.focus === "conditionals" || filter.focus === "frequencyAdverbs" || filter.focus === "modals" || usesStructureBank(filter.focus, filter.focusPattern) ? filter : generalFilter), focus: filter.focus, focusPattern: filter.focusPattern });
  const [mode, setMode] = useState(practiceMode);
  const [reasonTenses, setReasonTenses] = useState<Tense[] | undefined>(
    filter.focus === "reasonClause" ? filter.tenses : undefined);
  const compatible = REASON_TENSES.filter(tense => draft.tenses.includes(tense));
  const reasonFocus = mode === "arrange" && draft.focus === "reasonClause" && !usesStructureBank(draft.focus, draft.focusPattern);
  const patternFocus = mode === "arrange" && (draft.focus === "gerundInfinitive" || draft.focus === "quantifiers" || draft.focus === "conditionals");
  const gerundFocus = mode === "arrange" && draft.focus === "gerundInfinitive";
  const quantifierFocus = mode === "arrange" && draft.focus === "quantifiers";
  const conditionalFocus = mode === "arrange" && draft.focus === "conditionals";
  const frequencyFocus = mode === "arrange" && draft.focus === "frequencyAdverbs";
  const modalFocus = mode === "arrange" && draft.focus === "modals";
  const structureFocus = mode === "arrange" && usesStructureBank(draft.focus, draft.focusPattern);
  const structurePool = structureFocus ? structureItems(draft.focus as StructureFocus, draft.focusPattern) : [];
  const limitedForms = patternFocus || frequencyFocus || modalFocus || structureFocus;
  const availableForms = structureFocus ? [...new Set(structurePool.map(item => item.form))] : modalFocus ? modalForms(draft)
    : quantifierFocus ? FOCUSED_FORMS.filter(form => !draft.modes.length || draft.modes.some(mode => supportsQuantifier(draft.focusPattern, mode, form)))
    : limitedForms ? FOCUSED_FORMS : ["positive", "negative", "yesNoQuestion", "whQuestion"] as SentenceForm[];
  function changeStructure(focus: StructureFocus, pattern?: StructurePattern) {
    const pool = structureItems(focus, pattern);
    const tenses = [...new Set(pool.map(item => item.tense))];
    const modes = [...new Set(pool.map(item => item.mode))];
    const forms = [...new Set(pool.map(item => item.form))];
    const retainedTenses = draft.tenses.filter(t => tenses.includes(t));
    const retainedForms = draft.forms.filter(f => forms.includes(f));
    setDraft({ ...draft, focus, focusPattern: pattern, tenses: retainedTenses.length ? retainedTenses : tenses,
      modes, forms: retainedForms.length ? retainedForms : forms });
  }
  function changeModal(selection: ModalSelection) {
    const next = { ...draft, ...selection };
    const supportedForms = modalForms(next);
    const retained = draft.forms.filter(f => supportedForms.includes(f));
    setDraft({ ...next, focusPattern: undefined, forms: retained.length ? retained : supportedForms });
  }
  const activeDraft: MultiQuizFilter = reasonFocus
    ? { ...draft, tenses: reasonTenses ?? (compatible.length ? compatible : [...REASON_TENSES]), modes: ["verbal"], forms: ["positive"] }
    : { ...draft, focus: mode === "arrange" ? draft.focus : undefined, focusPattern: mode === "arrange" ? draft.focusPattern : undefined };
  const availableTenses: readonly Tense[] = structureFocus ? [...new Set(structurePool.map(item => item.tense))] : reasonFocus ? REASON_TENSES : gerundFocus ? GERUND_TENSES : quantifierFocus ? QUANTIFIER_TENSES : frequencyFocus ? FREQUENCY_TENSES : TENSE_ORDER;
  const availableModes: Mode[] = structureFocus ? [...new Set(structurePool.map(item => item.mode))] : gerundFocus ? ["verbal"] : frequencyFocus ? FREQUENCY_MODES
    : quantifierFocus ? (["verbal", "nominal", "passive"] as Mode[]).filter(mode => !draft.forms.length || draft.forms.some(form => supportsQuantifier(draft.focusPattern, mode, form)))
    : ["verbal", "nominal", "passive"];
  function setForms(forms: SentenceForm[]) {
    const modes = quantifierFocus && forms.length
      ? draft.modes.filter(mode => forms.some(form => supportsQuantifier(draft.focusPattern, mode, form))) : draft.modes;
    setDraft({ ...draft, forms, modes });
  }
  function setModes(modes: Mode[]) {
    const forms = quantifierFocus && modes.length
      ? draft.forms.filter(form => modes.some(mode => supportsQuantifier(draft.focusPattern, mode, form))) : draft.forms;
    setDraft({ ...draft, modes, forms });
  }
  function setPattern(focusPattern?: FocusPattern) {
    const modes = quantifierFocus && focusPattern === "some" && draft.forms.length
      && draft.forms.every(form => form === "negative") && draft.modes.length ? ["verbal"] as Mode[] : draft.modes;
    setDraft({ ...draft, focusPattern, modes });
  }
  const allTenses = availableTenses.every(tense => activeDraft.tenses.includes(tense));
  function setTenses(tenses: Tense[]) {
    if (reasonFocus) setReasonTenses(tenses);
    else setDraft({ ...draft, tenses });
  }
  const empty = (!conditionalFocus && !modalFocus && !activeDraft.tenses.length) || !activeDraft.modes.length || !activeDraft.forms.length;
  const supported = quizCombinations(activeDraft).length;

  return <BottomSheet open closeButtonOnly onClose={onClose} title="Filter Sentence Practice">
    <div className="sheet-form">
      <PracticeModePicker value={mode} onChange={setMode} />
      {mode === "arrange" && <fieldset className="sentence-filter-group">
        <legend>Fokus latihan</legend>
        <div className="tenses-pill-row">
          <button type="button" aria-pressed={!draft.focus} className={`tenses-option-pill ${!draft.focus ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: undefined, focusPattern: undefined })}>Latihan umum</button>
          <button type="button" aria-pressed={structureFocus && draft.focus === "sentenceStructure"}
            className={`tenses-option-pill ${structureFocus && draft.focus === "sentenceStructure" ? "active" : ""}`}
            onClick={() => changeStructure("sentenceStructure")}>Struktur & Urutan Kalimat</button>
          <button type="button" aria-pressed={structureFocus && draft.focus === "thereIt"}
            className={`tenses-option-pill ${structureFocus && draft.focus === "thereIt" ? "active" : ""}`}
            onClick={() => changeStructure("thereIt")}>There & It</button>
          <button type="button" aria-pressed={draft.focus === "relativeClause"}
            className={`tenses-option-pill ${draft.focus === "relativeClause" ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: "relativeClause", focusPattern: undefined })}>Relative clause</button>
          <button type="button" aria-pressed={frequencyFocus} className={`tenses-option-pill ${frequencyFocus ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: "frequencyAdverbs", focusPattern: undefined,
              tenses: draft.tenses.some(t => FREQUENCY_TENSES.includes(t)) ? draft.tenses.filter(t => FREQUENCY_TENSES.includes(t)) : ["presentSimple"],
              modes: draft.modes.some(m => FREQUENCY_MODES.includes(m)) ? draft.modes.filter(m => FREQUENCY_MODES.includes(m)) : [...FREQUENCY_MODES],
              forms: draft.forms.some(f => FREQUENCY_FORMS.includes(f)) ? draft.forms.filter(f => FREQUENCY_FORMS.includes(f)) : [...FREQUENCY_FORMS] })}>Adverbs of Frequency</button>
          <button type="button" aria-pressed={draft.focus === "reasonClause"} className={`tenses-option-pill ${draft.focus === "reasonClause" ? "active" : ""}`}
            onClick={() => changeStructure("reasonClause", "because")}>Penghubung antarklausa</button>
          <button type="button" aria-pressed={modalFocus} className={`tenses-option-pill ${modalFocus ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: "modals", focusPattern: undefined, modalFunction: "ability", modalTime: "present", modalPattern: undefined, modes: ["verbal"],
              forms: draft.forms.some(f => FOCUSED_FORMS.includes(f)) ? draft.forms.filter(f => FOCUSED_FORMS.includes(f)) : [...FOCUSED_FORMS] })}>Modals</button>
          <button type="button" aria-pressed={gerundFocus} className={`tenses-option-pill ${gerundFocus ? "active" : ""}`}
            onClick={() => setDraft({ ...draft, focus: "gerundInfinitive", focusPattern: undefined, modes: ["verbal"],
              tenses: draft.tenses.some(t => GERUND_TENSES.includes(t)) ? draft.tenses.filter(t => GERUND_TENSES.includes(t)) : [...GERUND_TENSES],
              forms: draft.forms.some(f => FOCUSED_FORMS.includes(f)) ? draft.forms.filter(f => FOCUSED_FORMS.includes(f)) : [...FOCUSED_FORMS] })}>Gerund &amp; Infinitive</button>
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
              onClick={() => setDraft({ ...(structureFocus ? generalFilter : draft), focus: "relativeClause", focusPattern: value })}>{label === "Semua" ? "Sisipan berkoma · semua" : label}</button>)}
          {STRUCTURE_PATTERNS.relativeClause.map(item => <button key={item.value} type="button"
            aria-pressed={draft.focusPattern === item.value} className={`tenses-option-pill ${draft.focusPattern === item.value ? "active" : ""}`}
            onClick={() => changeStructure("relativeClause", item.value)}>{item.label}</button>)}
        </div>}
        {reasonFocus && <small>Pilih Present Simple, Past Simple, atau keduanya. Klausa utama memakai bentuk verbal positif.</small>}
      </fieldset>}
      {structureFocus && draft.focus !== "relativeClause" && <fieldset className="sentence-filter-group">
        <legend>Pola latihan</legend>
        <div className="tenses-pill-row" aria-label="Pola struktur kalimat">
          {draft.focus !== "reasonClause" && <button type="button" aria-pressed={!draft.focusPattern} className={`tenses-option-pill ${!draft.focusPattern ? "active" : ""}`}
            onClick={() => changeStructure(draft.focus as StructureFocus)}>Semua pola</button>}
          {STRUCTURE_PATTERNS[draft.focus as StructureFocus].map(item => <button key={item.value} type="button"
            aria-pressed={draft.focusPattern === item.value} className={`tenses-option-pill ${draft.focusPattern === item.value ? "active" : ""}`}
            onClick={() => changeStructure(draft.focus as StructureFocus, item.value)}>{item.label}</button>)}
        </div>
        <small>{draft.focus === "thereIt" ? "Present/Past Simple dengan be; positif, negatif, dan pertanyaan yes/no."
          : draft.focus === "reasonClause" ? "Present/Past Simple. Bentuk positif, negatif, atau Yes/No berlaku pada klausa utama; klausa penghubung tetap positif."
          : "Latihan pernyataan positif. Tense dan jenis mengikuti pola yang dipilih."}</small>
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
      {modalFocus && <>
      <fieldset className="sentence-filter-group">
        <legend>Fungsi modal</legend>
        <div className="tenses-pill-row">
          <button type="button" aria-pressed={!draft.modalFunction} className={`tenses-option-pill ${!draft.modalFunction ? "active" : ""}`}
            onClick={() => changeModal({ modalFunction: undefined, modalPattern: undefined })}>Semua fungsi</button>
          {MODAL_FUNCTIONS.map(item => <button key={item.value} type="button" aria-pressed={draft.modalFunction === item.value}
            className={`tenses-option-pill ${draft.modalFunction === item.value ? "active" : ""}`}
            onClick={() => changeModal({ modalFunction: item.value, modalPattern: undefined,
              modalTime: modalPatterns({ modalFunction: item.value, modalTime: draft.modalTime }).length ? draft.modalTime : "present" })}>{item.label}</button>)}
        </div>
      </fieldset>
      <fieldset className="sentence-filter-group">
        <legend>Waktu / konteks</legend>
        <div className="tenses-pill-row">
          <button type="button" aria-pressed={!draft.modalTime} className={`tenses-option-pill ${!draft.modalTime ? "active" : ""}`}
            onClick={() => changeModal({ modalTime: undefined, modalPattern: undefined })}>Semua waktu</button>
          {MODAL_TIMES.map(item => <button key={item.value} type="button" aria-pressed={draft.modalTime === item.value}
            disabled={!modalPatterns({ modalFunction: draft.modalFunction, modalTime: item.value }).length}
            className={`tenses-option-pill ${draft.modalTime === item.value ? "active" : ""}`}
            onClick={() => changeModal({ modalTime: item.value, modalPattern: undefined })}>{item.label}</button>)}
        </div>
        <small>Waktu mengikuti makna modal. Kewajiban masa lalu memakai had to; must have + V3 menyatakan kesimpulan.</small>
      </fieldset>
      <fieldset className="sentence-filter-group">
        <legend>Pola latihan</legend>
        <div className="tenses-pill-row" aria-label="Modal">
          <button type="button" aria-pressed={!draft.modalPattern} className={`tenses-option-pill ${!draft.modalPattern ? "active" : ""}`}
            onClick={() => changeModal({ modalPattern: undefined })}>Semua pola</button>
          {modalPatterns({ ...draft, modalPattern: undefined }).map(item => <button key={item.value} type="button" aria-pressed={draft.modalPattern === item.value}
            className={`tenses-option-pill ${draft.modalPattern === item.value ? "active" : ""}`}
            onClick={() => changeModal({ modalPattern: item.value })}>{item.label}</button>)}
        </div>
        <small>Susun sesuai pola yang dipilih. Must not berarti tidak boleh; do not have to berarti tidak perlu.</small>
      </fieldset>
      </>}
      {patternFocus && <fieldset className="sentence-filter-group">
        <legend>Pola latihan</legend>
        <div className="tenses-pill-row">
          <button type="button" className={`tenses-option-pill ${!draft.focusPattern ? "active" : ""}`}
            aria-pressed={!draft.focusPattern} onClick={() => setPattern()}>Semua pola</button>
          {FOCUS_PATTERNS[draft.focus as "gerundInfinitive" | "quantifiers" | "conditionals"].map(item =>
            <button key={item.value} type="button" aria-pressed={draft.focusPattern === item.value}
              className={`tenses-option-pill ${draft.focusPattern === item.value ? "active" : ""}`}
              onClick={() => setPattern(item.value as FocusPattern)}>{item.label}</button>)}
        </div>
        {conditionalFocus && <small>Jenis conditional menentukan kombinasi tense pada syarat dan hasil.</small>}
        {gerundFocus && <small>Enjoy/avoid diikuti V-ing; want diikuti to + V1. Tense dan bentuk berlaku pada verb utama.</small>}
      </fieldset>}
      {!conditionalFocus && !modalFocus && <>
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
      {quantifierFocus && <p className="note">Quantifiers mendukung Present, Past, dan Future Simple. Some / any negatif tersedia untuk jenis Verbal agar any tetap menjadi objek.</p>}
      <fieldset className="sentence-filter-group" disabled={reasonFocus || conditionalFocus || modalFocus || gerundFocus}>
        <legend>Jenis kalimat</legend>
        {!reasonFocus && !conditionalFocus && !modalFocus && !gerundFocus && <button type="button" className="inline-popup-link"
          onClick={() => setModes(availableModes.every(m => draft.modes.includes(m)) ? [] : [...availableModes])}>
          {availableModes.every(m => draft.modes.includes(m)) ? "Kosongkan pilihan jenis" : "Pilih semua jenis"}</button>}
        <div className="tenses-pill-row">
          {(["verbal", "nominal", "passive"] as Mode[]).map(mode =>
            <button key={mode} type="button" disabled={!availableModes.includes(mode)} aria-pressed={activeDraft.modes.includes(mode)}
              className={`tenses-option-pill ${activeDraft.modes.includes(mode) ? "active" : ""}`}
              onClick={() => setModes(toggle(draft.modes, mode))}>
              {MODE_LABELS[mode].replace(/\s*\(.*\)/, "")}
            </button>)}
        </div>
      </fieldset>
      {conditionalFocus && <small>Latihan ini menggunakan klausa hasil verbal.</small>}
      {gerundFocus && <small>Latihan verbal dengan Present, Past, atau Future Simple. Bentuk kegiatan mengikuti pola verb utama.</small>}
      {modalFocus && <small>Modals menggunakan tindakan verbal, termasuk pola be able to dan be allowed to.</small>}
      <fieldset className="sentence-filter-group" disabled={reasonFocus}>
        <legend>Bentuk kalimat</legend>
        {!reasonFocus && <button type="button" className="inline-popup-link" onClick={() => {
          const forms = availableForms;
          setForms(forms.every(form => draft.forms.includes(form)) ? [] : [...forms]);
        }}>{availableForms.every(form => draft.forms.includes(form)) ? "Kosongkan pilihan bentuk" : "Pilih semua bentuk"}</button>}
        <div className="tenses-pill-row">
          {(["positive", "negative", "yesNoQuestion", "whQuestion"] as SentenceForm[]).map(form =>
            <button key={form} type="button" disabled={!availableForms.includes(form)} aria-pressed={activeDraft.forms.includes(form)}
              className={`tenses-option-pill ${activeDraft.forms.includes(form) ? "active" : ""}`}
              onClick={() => setForms(toggle(draft.forms, form))}>
              {FORM_LABELS[form]}
            </button>)}
        </div>
      </fieldset>
      {limitedForms && <small>WH-question belum tersedia untuk fokus ini.</small>}
      {modalFocus && <small>Bentuk yang tidak sesuai fungsi/pola dinonaktifkan. Latihan kemungkinan dan kesimpulan memakai pernyataan.</small>}

      <div aria-live="polite">
        {empty ? <p className="hint">{modalFocus ? "Pilih minimal satu bentuk kalimat." : reasonFocus ? "Pilih minimal satu tense." : "Pilih minimal satu tense, satu jenis, dan satu bentuk kalimat."}</p>
          : !supported ? <p className="hint">
            {modalFocus ? "Kombinasi fungsi, waktu, pola, dan bentuk ini belum didukung. Sesuaikan pilihan untuk melanjutkan."
              : "Kombinasi ini belum didukung. Pilih tense atau jenis kalimat lain untuk melanjutkan."}
          </p> : null}
      </div>
      <button type="button" className="btn btn-primary" disabled={empty || !supported}
        onClick={() => onApply(activeDraft, mode, patternFocus || frequencyFocus || modalFocus || structureFocus ? generalFilter : { ...draft, focus: undefined })}>Terapkan Filter</button>
    </div>
  </BottomSheet>;
}
