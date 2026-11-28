import { copySentenceFilter, matchingSentencePreset, selectSentenceFocus, SENTENCE_FOCUS_GROUPS, SENTENCE_PRESETS } from "../grammar/sentenceSettings";
import { TIME_PREPOSITION_TENSES } from "../grammar/timePrepositionSentences";
import { COMPARISON_TENSES } from "../grammar/comparisonSentences";
import { GERUND_TENSES } from "../grammar/gerundSentences";
import { useState } from "react";
import { quizCombinations, REASON_TENSES, type MultiQuizFilter } from "../grammar/generator";
import { FORM_LABELS, MODE_LABELS, TENSE_LABELS, TENSE_ORDER } from "../grammar/labels";
import type { Mode, SentenceForm, Tense } from "../grammar/types";
import { BottomSheet } from "./BottomSheet";
import type { SentencePracticeMode } from "../grammar/practiceMode";
import { PracticeModePicker } from "./PracticeModePicker";
import { FOCUSED_FORMS, FOCUS_PATTERNS, QUANTIFIER_TENSES, supportsQuantifier, type FocusPattern } from "../grammar/focusedSentences";
import { FREQUENCY_ADVERBS, FREQUENCY_MODES, FREQUENCY_TENSES } from "../grammar/frequencySentences";
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
  const [draft, setDraft] = useState<MultiQuizFilter>(() => copySentenceFilter(filter));
  const [mode, setMode] = useState(practiceMode);
  const [generalDraft, setGeneralDraft] = useState(filter.focus ? generalFilter : filter);
  function chooseFocus(focus: MultiQuizFilter["focus"]) {
    const general = draft.focus ? generalDraft : { ...draft, focus: undefined, focusPattern: undefined };
    setGeneralDraft(general);
    setDraft(selectSentenceFocus(draft, general, focus));
    setMode("arrange");
    setReasonTenses(undefined);
  }

  const [reasonTenses, setReasonTenses] = useState<Tense[] | undefined>(
    filter.focus === "reasonClause" ? filter.tenses : undefined);
  const compatible = REASON_TENSES.filter(tense => draft.tenses.includes(tense));
  const reasonFocus = mode === "arrange" && draft.focus === "reasonClause" && !usesStructureBank(draft.focus, draft.focusPattern);
  const patternFocus = mode === "arrange" && (draft.focus === "timePrepositions" || draft.focus === "comparisons" || draft.focus === "gerundInfinitive" || draft.focus === "quantifiers" || draft.focus === "conditionals");
  const timePrepositionFocus = mode === "arrange" && draft.focus === "timePrepositions";
  const comparisonFocus = mode === "arrange" && draft.focus === "comparisons";
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
  const availableTenses: readonly Tense[] = structureFocus ? [...new Set(structurePool.map(item => item.tense))] : reasonFocus ? REASON_TENSES : timePrepositionFocus ? TIME_PREPOSITION_TENSES : comparisonFocus ? COMPARISON_TENSES : gerundFocus ? GERUND_TENSES : quantifierFocus ? QUANTIFIER_TENSES : frequencyFocus ? FREQUENCY_TENSES : TENSE_ORDER;
  const availableModes: Mode[] = structureFocus ? [...new Set(structurePool.map(item => item.mode))] : timePrepositionFocus ? ["verbal"] : comparisonFocus ? ["nominal"] : gerundFocus ? ["verbal"] : frequencyFocus ? FREQUENCY_MODES
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

  return <BottomSheet open closeButtonOnly onClose={onClose} title="Pengaturan latihan">
    <div className="sheet-form">
      <fieldset className="sentence-filter-group">
        <legend>Fokus latihan</legend>
        <div className="sentence-focus-groups">
          {SENTENCE_FOCUS_GROUPS.map(group => {
            const selected = group.items.find(item => item.value === draft.focus);
            return <details key={group.label} className="sentence-focus-group" open={Boolean(selected)}>
              <summary><strong>{group.label}</strong>{selected && <span>{selected.label}</span>}</summary>
              <div className="tenses-pill-row" role="group" aria-label={group.label}>
                {group.items.map(item => <button key={item.value ?? "general"} type="button"
                  aria-pressed={draft.focus === item.value}
                  className={`tenses-option-pill ${draft.focus === item.value ? "active" : ""}`}
                  onClick={() => chooseFocus(item.value)}>{item.label}</button>)}
              </div>
            </details>;
          })}
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
      </fieldset>
      {!draft.focus && <fieldset className="sentence-filter-group">
        <legend>Paket latihan</legend>
        <div className="sentence-preset-grid">
          {SENTENCE_PRESETS.map(preset => <button key={preset.id} type="button"
            aria-pressed={matchingSentencePreset(draft)?.id === preset.id}
            className={`sentence-preset ${matchingSentencePreset(draft)?.id === preset.id ? "active" : ""}`}
            onClick={() => { setDraft(copySentenceFilter(preset.filter)); setReasonTenses(undefined); }}>
            <strong>{preset.label}</strong><small>{preset.description}</small>
          </button>)}
        </div>
        {!matchingSentencePreset(draft) && <small>Pilihan kustom. Atur tense, jenis, dan bentuk di bawah.</small>}
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
          {FOCUS_PATTERNS[draft.focus as "timePrepositions" | "comparisons" | "gerundInfinitive" | "quantifiers" | "conditionals"].map(item =>
            <button key={item.value} type="button" aria-pressed={draft.focusPattern === item.value}
              className={`tenses-option-pill ${draft.focusPattern === item.value ? "active" : ""}`}
              onClick={() => setPattern(item.value as FocusPattern)}>{item.label}</button>)}
        </div>
        {conditionalFocus && <small>Jenis conditional menentukan kombinasi tense pada syarat dan hasil.</small>}
        {gerundFocus && <small>Enjoy/avoid diikuti V-ing; want diikuti to + V1. Tense dan bentuk berlaku pada verb utama.</small>}
        {comparisonFocus && <small>Pilih perbandingan dua hal atau anggota dalam kelompok. Data dan subjek target menentukan arah jawaban.</small>}
        {timePrepositionFocus && <small>Bahan waktu belum berisi jawaban. Tentukan at, on, in, atau tanpa preposisi; perhatikan perbedaan Monday dan next Monday.</small>}
      </fieldset>}
      {!conditionalFocus && !modalFocus && <>
      <details className="sentence-tense-picker">
        <summary>Tense · {reasonFocus && activeDraft.tenses.length === 1 ? TENSE_LABELS[activeDraft.tenses[0]] :
          !reasonFocus && allTenses ? "Semua tense" : `${activeDraft.tenses.length} tense dipilih`}</summary>
        <fieldset className="sentence-filter-group" aria-label="Tense">
          <button type="button" className="inline-popup-link" onClick={() => setTenses(allTenses ? [] : [...availableTenses])}>
            {allTenses ? "Kosongkan pilihan tense" : "Pilih semua tense"}</button>
          {(["present", "past", "future"] as const).filter(time => availableTenses.some(tense => tense.startsWith(time))).map(time => <div key={time} className="sentence-tense-options">
            <strong>{time === "present" ? "Present" : time === "past" ? "Past" : "Future"}</strong>
            {availableTenses.filter(tense => tense.startsWith(time)).map(tense =>
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
      <fieldset className="sentence-filter-group" disabled={reasonFocus || conditionalFocus || modalFocus || gerundFocus || comparisonFocus || timePrepositionFocus}>
        <legend>Jenis kalimat</legend>
        {!reasonFocus && !conditionalFocus && !modalFocus && !gerundFocus && !comparisonFocus && !timePrepositionFocus && <button type="button" className="inline-popup-link"
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
      {comparisonFocus && <small>Latihan nominal dengan be dalam Present, Past, atau Future Simple. Positif, negatif, dan Yes/No tersedia.</small>}
      {timePrepositionFocus && <small>Present, Past, dan Future Simple verbal; positif, negatif, dan Yes/No. Bahan waktu mengikuti tense yang dipilih.</small>}
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

      {!draft.focus && <details className="sentence-extra-settings" open={mode !== "arrange"}>
        <summary>Bantuan &amp; latihan lainnya</summary>
        <PracticeModePicker value={mode} onChange={setMode} />
      </details>}

      <div aria-live="polite">
        {empty ? <p className="hint">{modalFocus ? "Pilih minimal satu bentuk kalimat." : reasonFocus ? "Pilih minimal satu tense." : "Pilih minimal satu tense, satu jenis, dan satu bentuk kalimat."}</p>
          : !supported ? <p className="hint">
            {modalFocus ? "Kombinasi fungsi, waktu, pola, dan bentuk ini belum didukung. Sesuaikan pilihan untuk melanjutkan."
              : "Kombinasi ini belum didukung. Pilih tense atau jenis kalimat lain untuk melanjutkan."}
          </p> : null}
      </div>
      <button type="button" className="btn btn-primary" disabled={empty || !supported}
        onClick={() => onApply(activeDraft, mode, draft.focus ? generalDraft : { ...activeDraft, focus: undefined, focusPattern: undefined })}>Terapkan pengaturan</button>
    </div>
  </BottomSheet>;
}
