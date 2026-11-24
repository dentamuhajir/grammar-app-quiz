import { SUBJECTS } from "./data/subjects";
import { VERBS } from "./data/verbs";
import { TIME_SIGNALS } from "./data/timeSignals";
import { conjugateNominal, conjugatePassive, conjugateVerbal } from "./engine";
import { effectiveTense } from "./explanations";
import { isContinuous, isPerfectContinuous, isRarePassive } from "./labels";
import type { Complement, Question, Tense, Verb, WhWord } from "./types";

export const EXPLORER_VERBS: Verb[] = [
  ...["write", "eat", "take"].map(base => VERBS.find(verb => verb.base === base)!),
  {
    base: "go", past: "went", participle: "gone", ing: "going", thirdSingular: "goes",
    object: "to school", objectNumber: "singular", transitive: false, stative: false, oddPassive: true,
  },
  VERBS.find(verb => verb.base === "work")!,
];

export const EXPLORER_COMPLEMENTS: Complement[] = [
  { text: "tired", kind: "adjective" },
  { text: "careful", kind: "adjective", behavioral: true },
  { text: "a teacher", plural: "teachers", kind: "noun" },
  { text: "at home", kind: "adverb" },
  { text: "ready", kind: "adjective" },
];

const DEFAULT_TIMES: Record<Tense, string> = {
  presentSimple: "every day", pastSimple: "yesterday", futureSimple: "tomorrow",
  presentContinuous: "right now", pastContinuous: "at 8 pm yesterday",
  futureContinuous: "at 8 pm tomorrow", presentPerfect: "today",
  pastPerfect: "before the class started", futurePerfect: "by 8 pm tomorrow",
  presentPerfectContinuous: "for two hours",
  pastPerfectContinuous: "for two hours when the class started",
  futurePerfectContinuous: "for two hours by 8 pm tomorrow",
};

export function explorerRestriction(q: Question, tense: Tense): string | undefined {
  if (q.mode === "nominal") {
    if (isPerfectContinuous(tense)) return "Perfect Continuous dengan be + pelengkap sangat jarang dipakai. Pelajari pola Perfect untuk keadaan di halaman ini.";
    if (tense === "futureContinuous") return "Future Continuous dengan be + pelengkap memerlukan konteks khusus. Gunakan Future Simple untuk keadaan masa depan di latihan ini.";
    if (isContinuous(tense) && !q.complement?.behavioral) return "Pilih pelengkap perilaku seperti careful untuk mempelajari be + being dalam konteks sementara.";
  }
  if (q.mode === "verbal" && q.verb?.stative && isContinuous(tense)) {
    return "Kata kerja keadaan ini dipelajari dengan pola Simple atau Perfect.";
  }
}

export function explorerWh(q: Question): WhWord {
  if (q.mode === "passive") return "Why";
  if (q.mode !== "nominal") return q.verb?.transitive && q.verb.object && !["him", "the children", "the guests", "the manager", "the team"].includes(q.verb.object) ? "What" : "Why";
  if (q.complement?.kind === "adverb") return "Where";
  if (q.complement?.kind === "noun" && q.tense.endsWith("Simple")) return "What";
  return "Why";
}

export function buildExplorerQuestion(input: Question): Question {
  const q = { ...input };
  const signal = Object.values(TIME_SIGNALS[q.tense]).flat().find(item => item.text === q.timeSignal);
  if (q.form !== "whQuestion") q.whWord = undefined;
  if (q.form === "whQuestion") q.whWord ??= explorerWh(q);
  if (q.whWord === "When" || q.whWord === "How long" && !signal?.anchor
      || signal?.forms && !signal.forms.includes(q.form)) q.timeSignal = undefined;
  const opts = {
    wh: q.whWord,
    mid: signal?.pos === "mid" ? q.timeSignal : undefined,
    tail: signal?.pos !== "mid" ? q.timeSignal : undefined,
  };
  if (q.mode === "nominal") {
    q.answer = conjugateNominal(q.tense, q.subject, q.complement!, q.form, {
      ...opts, being: isContinuous(q.tense),
    });
  } else if (q.mode === "passive") {
    q.answer = conjugatePassive(q.tense, {
      text: q.verb!.object, person: 3, number: q.verb!.objectNumber,
    }, q.verb!, q.form, { ...opts, byAgent: q.subject.objectForm ?? q.subject.text });
  } else {
    q.answer = conjugateVerbal(q.tense, q.subject, q.verb!, q.form, {
      ...opts, dropObject: q.whWord === "How" && ["fast", "well", "hard", "smoothly"].includes(q.verb!.object),
    });
  }
  return q;
}

export function initialExplorerQuestion(source?: Question): Question {
  if (source) {
    let tense = effectiveTense(source);
    if (explorerRestriction(source, tense)) tense = tense.replace("Continuous", "Simple") as Tense;
    const main = { ...source, tense };
    delete main.relativeClause;
    return buildExplorerQuestion(main);
  }
  return buildExplorerQuestion({
    mode: "verbal", tense: "presentSimple", form: "positive",
    subject: SUBJECTS.find(subject => subject.text === "Emma")!,
    verb: EXPLORER_VERBS[0], timeSignal: DEFAULT_TIMES.presentSimple, answer: "",
  });
}

export function changeExplorerQuestion(current: Question, patch: Partial<Question>): Question {
  const q = { ...current, ...patch };
  if (patch.mode && patch.mode !== current.mode) {
    q.verb = current.verb ?? EXPLORER_VERBS[0];
    q.complement = current.complement ?? EXPLORER_COMPLEMENTS[0];
  }
  if (q.mode === "nominal" && q.subject.entity === "thing" && q.complement?.kind === "noun") {
    q.complement = EXPLORER_COMPLEMENTS.find(comp => comp.text === "ready")!;
  }
  if (q.mode === "verbal" && q.subject.entity === "thing"
      && (patch.subject || patch.mode)) {
    q.verb = { ...EXPLORER_VERBS[4], object: "well" };
  }
  if (q.mode === "passive" && (!q.verb?.transitive || q.verb.oddPassive)) {
    q.verb = EXPLORER_VERBS[0];
  }
  q.rare = q.mode === "passive" && isRarePassive(q.tense);
  if (explorerRestriction(q, q.tense)) q.tense = initialExplorerQuestion(q).tense;
  if (patch.tense || patch.mode) {
    q.timeSignal = DEFAULT_TIMES[q.tense];
    if (q.mode === "nominal" && q.complement?.behavioral && isContinuous(q.tense)) {
      q.timeSignal = q.tense === "presentContinuous" ? "right now" : "at 8 pm yesterday";
    }
  }
  q.whWord = q.form === "whQuestion" ? explorerWh(q) : undefined;
  return buildExplorerQuestion(q);
}
