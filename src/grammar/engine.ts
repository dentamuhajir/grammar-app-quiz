import type {
  Complement,
  SentenceForm,
  Subject,
  Tense,
  Verb,
  WhWord,
} from "./types";

// ---------- small helpers ----------

/** "am" / "is" / "are" for present; "was" / "were" for past. */
function beNow(s: Subject): string {
  if (s.person === 1 && s.number === "singular") return "am";
  if (s.number === "singular" && s.person === 3) return "is";
  return "are";
}

function bePast(s: Subject): string {
  if (s.number === "singular" && (s.person === 1 || s.person === 3)) return "was";
  return "were";
}

/** "do" vs "does" for present simple auxiliary. */
function doNow(s: Subject): string {
  return s.number === "singular" && s.person === 3 ? "does" : "do";
}

/** "has" vs "have" for perfect tenses. */
function haveNow(s: Subject): string {
  return s.number === "singular" && s.person === 3 ? "has" : "have";
}

/** Present-simple main verb: 3rd-singular gets -s/-es. */
function presentVerb(s: Subject, verb: Verb): string {
  return s.number === "singular" && s.person === 3 ? verb.thirdSingular : verb.base;
}

/** Capitalize the first letter of a finished sentence. */
function cap(sentence: string): string {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/** Join non-empty parts with single spaces, then finalize the sentence. */
function build(parts: Array<string | undefined>, punctuation: "." | "?"): string {
  const text = parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return cap(text) + punctuation;
}

// ---------- sentence renderers ----------
// We centralize the structural patterns (auxiliary placement across +/-/?/wh)
// and let each tense plug in its verb/be clusters.

/**
 * Render a verbal (action) sentence. `pattern` describes how the auxiliary and
 * verb behave; this function applies the +/-/?/wh structure uniformly.
 */
function renderVerbal(
  s: Subject,
  form: SentenceForm,
  obj: string,
  wh: WhWord | undefined,
  p: {
    // positive: subject + positiveCluster
    positiveCluster: string;
    // auxiliary used in negative/question forms
    aux: string;
    // words after aux in negative/question (e.g. the bare verb or "been working")
    afterAux: string;
    // negation word, usually "not"
  },
): string {
  switch (form) {
    case "positive":
      return build([s.text, p.positiveCluster, obj], ".");
    case "negative":
      return build([s.text, p.aux, "not", p.afterAux, obj], ".");
    case "yesNoQuestion":
      return build([p.aux, s.text, p.afterAux, obj], "?");
    case "whQuestion":
      return build([wh, p.aux, s.text, p.afterAux, obj], "?");
  }
}

/** Render a nominal (to be + complement) sentence. */
function renderNominal(
  s: Subject,
  form: SentenceForm,
  comp: string,
  wh: WhWord | undefined,
  p: {
    // the be-cluster for positive, e.g. "is", "will be", "has been"
    positiveBe: string;
    // auxiliary that fronts in questions, e.g. "is", "will", "has", "do"/"does" (none here)
    frontAux: string;
    // the remainder after the fronted aux + subject, e.g. "been", "be", "" (for simple be)
    afterAux: string;
  },
): string {
  switch (form) {
    case "positive":
      return build([s.text, p.positiveBe, comp], ".");
    case "negative":
      return build([s.text, p.frontAux, "not", p.afterAux, comp], ".");
    case "yesNoQuestion":
      return build([p.frontAux, s.text, p.afterAux, comp], "?");
    case "whQuestion":
      return build([wh, p.frontAux, s.text, p.afterAux, comp], "?");
  }
}

/** Render a passive sentence (object as subject). Only + and - are produced. */
function renderPassive(
  s: Subject,
  form: SentenceForm,
  participle: string,
  p: { positiveCluster: string; aux: string; afterAux: string },
): string {
  // Passive questions are uncommon in the source material; we only build +/-.
  if (form === "negative") {
    return build([s.text, p.aux, "not", p.afterAux, participle], ".");
  }
  return build([s.text, p.positiveCluster, participle], ".");
}

// ---------- per-tense conjugation ----------

export function conjugateVerbal(
  tense: Tense,
  s: Subject,
  verb: Verb,
  form: SentenceForm,
  wh?: WhWord,
): string {
  const obj = verb.object;
  const V1 = verb.base;
  const ING = verb.ing;
  const V3 = verb.participle;

  switch (tense) {
    case "presentSimple":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: presentVerb(s, verb),
        aux: doNow(s),
        afterAux: V1,
      });
    case "pastSimple":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: verb.past,
        aux: "did",
        afterAux: V1,
      });
    case "futureSimple":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: `will ${V1}`,
        aux: "will",
        afterAux: V1,
      });

    case "presentContinuous":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: `${beNow(s)} ${ING}`,
        aux: beNow(s),
        afterAux: ING,
      });
    case "pastContinuous":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: `${bePast(s)} ${ING}`,
        aux: bePast(s),
        afterAux: ING,
      });
    case "futureContinuous":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: `will be ${ING}`,
        aux: "will",
        afterAux: `be ${ING}`,
      });

    case "presentPerfect":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: `${haveNow(s)} ${V3}`,
        aux: haveNow(s),
        afterAux: V3,
      });
    case "pastPerfect":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: `had ${V3}`,
        aux: "had",
        afterAux: V3,
      });
    case "futurePerfect":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: `will have ${V3}`,
        aux: "will",
        afterAux: `have ${V3}`,
      });

    case "presentPerfectContinuous":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: `${haveNow(s)} been ${ING}`,
        aux: haveNow(s),
        afterAux: `been ${ING}`,
      });
    case "pastPerfectContinuous":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: `had been ${ING}`,
        aux: "had",
        afterAux: `been ${ING}`,
      });
    case "futurePerfectContinuous":
      return renderVerbal(s, form, obj, wh, {
        positiveCluster: `will have been ${ING}`,
        aux: "will",
        afterAux: `have been ${ING}`,
      });
  }
}

export function conjugateNominal(
  tense: Tense,
  s: Subject,
  comp: Complement,
  form: SentenceForm,
  wh?: WhWord,
): string {
  const c = comp.text;

  switch (tense) {
    case "presentSimple":
      return renderNominal(s, form, c, wh, {
        positiveBe: beNow(s),
        frontAux: beNow(s),
        afterAux: "",
      });
    case "pastSimple":
      return renderNominal(s, form, c, wh, {
        positiveBe: bePast(s),
        frontAux: bePast(s),
        afterAux: "",
      });
    case "futureSimple":
      return renderNominal(s, form, c, wh, {
        positiveBe: "will be",
        frontAux: "will",
        afterAux: "be",
      });

    // Continuous nominal = temporary behavior: "being + adjective"
    case "presentContinuous":
      return renderNominal(s, form, c, wh, {
        positiveBe: `${beNow(s)} being`,
        frontAux: beNow(s),
        afterAux: "being",
      });
    case "pastContinuous":
      return renderNominal(s, form, c, wh, {
        positiveBe: `${bePast(s)} being`,
        frontAux: bePast(s),
        afterAux: "being",
      });
    case "futureContinuous":
      return renderNominal(s, form, c, wh, {
        positiveBe: "will be",
        frontAux: "will",
        afterAux: "be",
      });

    case "presentPerfect":
      return renderNominal(s, form, c, wh, {
        positiveBe: `${haveNow(s)} been`,
        frontAux: haveNow(s),
        afterAux: "been",
      });
    case "pastPerfect":
      return renderNominal(s, form, c, wh, {
        positiveBe: "had been",
        frontAux: "had",
        afterAux: "been",
      });
    case "futurePerfect":
      return renderNominal(s, form, c, wh, {
        positiveBe: "will have been",
        frontAux: "will",
        afterAux: "have been",
      });

    // Perfect-continuous stative rule: nominal falls back to perfect "been".
    case "presentPerfectContinuous":
      return renderNominal(s, form, c, wh, {
        positiveBe: `${haveNow(s)} been`,
        frontAux: haveNow(s),
        afterAux: "been",
      });
    case "pastPerfectContinuous":
      return renderNominal(s, form, c, wh, {
        positiveBe: "had been",
        frontAux: "had",
        afterAux: "been",
      });
    case "futurePerfectContinuous":
      return renderNominal(s, form, c, wh, {
        positiveBe: "will have been",
        frontAux: "will",
        afterAux: "have been",
      });
  }
}

export function conjugatePassive(
  tense: Tense,
  s: Subject,
  verb: Verb,
  form: SentenceForm,
): string {
  const V3 = verb.participle;

  switch (tense) {
    case "presentSimple":
      return renderPassive(s, form, V3, {
        positiveCluster: `${beNow(s)}`,
        aux: beNow(s),
        afterAux: "",
      });
    case "pastSimple":
      return renderPassive(s, form, V3, {
        positiveCluster: `${bePast(s)}`,
        aux: bePast(s),
        afterAux: "",
      });
    case "futureSimple":
      return renderPassive(s, form, V3, {
        positiveCluster: "will be",
        aux: "will",
        afterAux: "be",
      });

    case "presentContinuous":
      return renderPassive(s, form, V3, {
        positiveCluster: `${beNow(s)} being`,
        aux: beNow(s),
        afterAux: "being",
      });
    case "pastContinuous":
      return renderPassive(s, form, V3, {
        positiveCluster: `${bePast(s)} being`,
        aux: bePast(s),
        afterAux: "being",
      });
    case "futureContinuous":
      return renderPassive(s, form, V3, {
        positiveCluster: "will be being",
        aux: "will",
        afterAux: "be being",
      });

    case "presentPerfect":
      return renderPassive(s, form, V3, {
        positiveCluster: `${haveNow(s)} been`,
        aux: haveNow(s),
        afterAux: "been",
      });
    case "pastPerfect":
      return renderPassive(s, form, V3, {
        positiveCluster: "had been",
        aux: "had",
        afterAux: "been",
      });
    case "futurePerfect":
      return renderPassive(s, form, V3, {
        positiveCluster: "will have been",
        aux: "will",
        afterAux: "have been",
      });

    case "presentPerfectContinuous":
      return renderPassive(s, form, V3, {
        positiveCluster: `${haveNow(s)} been being`,
        aux: haveNow(s),
        afterAux: "been being",
      });
    case "pastPerfectContinuous":
      return renderPassive(s, form, V3, {
        positiveCluster: "had been being",
        aux: "had",
        afterAux: "been being",
      });
    case "futurePerfectContinuous":
      return renderPassive(s, form, V3, {
        positiveCluster: "will have been being",
        aux: "will",
        afterAux: "have been being",
      });
  }
}

