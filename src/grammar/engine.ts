import type {
  Complement,
  SentenceForm,
  Subject,
  Tense,
  Verb,
  WhWord,
} from "./types";

// ---------- agreement helpers ----------

type NumberAgreement = { person: 1 | 2 | 3; number: "singular" | "plural" };

function beNow(a: NumberAgreement): string {
  if (a.person === 1 && a.number === "singular") return "am";
  if (a.number === "singular" && a.person === 3) return "is";
  return "are";
}

function bePast(a: NumberAgreement): string {
  if (a.number === "singular" && (a.person === 1 || a.person === 3)) return "was";
  return "were";
}

function doNow(a: NumberAgreement): string {
  return a.number === "singular" && a.person === 3 ? "does" : "do";
}

function haveNow(a: NumberAgreement): string {
  return a.number === "singular" && a.person === 3 ? "has" : "have";
}

function presentVerb(a: NumberAgreement, verb: Verb): string {
  return a.number === "singular" && a.person === 3 ? verb.thirdSingular : verb.base;
}

// ---------- sentence assembly ----------

function cap(sentence: string): string {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/** Join non-empty parts, collapse spaces, capitalize first word, add punctuation. */
function build(parts: Array<string | undefined>, punctuation: "." | "?"): string {
  const text = parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  // A statement ending in an abbreviation ("by 9 p.m.") keeps that single period.
  if (punctuation === "." && text.endsWith(".")) {
    return cap(text);
  }
  // A question ending in an abbreviation keeps its period: "by 9 p.m.?"
  return cap(text) + punctuation;
}

interface RenderParts {
  /** words between subject and the rest, positive form */
  positiveCluster: string;
  /** auxiliary that fronts in questions and carries negation */
  aux: string;
  /** words after the aux (and after "not") in -/?/wh forms */
  afterAux: string;
  /** object/complement/time that trails the clause */
  tail?: string;
  /**
   * Mid-position adverb (usually, already, just). It goes after the first
   * auxiliary or "be"; when there is no auxiliary (present/past simple
   * positive), it goes right before the main verb.
   */
  mid?: string;
  /** true when positiveCluster is a bare main verb (no auxiliary in front) */
  midBeforeCluster?: boolean;
}

/** Split "has been" -> ["has", "been"]; "is" -> ["is", ""]. */
function splitFirst(cluster: string): [string, string] {
  const i = cluster.indexOf(" ");
  return i === -1 ? [cluster, ""] : [cluster.slice(0, i), cluster.slice(i + 1)];
}

/**
 * Generic renderer. The caller supplies the clusters; this applies the
 * +/-/?/wh structure uniformly, including the mid-adverb slot:
 *   +   She usually cooks / She has just cooked / She is usually happy
 *   -   She does not usually cook / She is not usually happy
 *   ?   Does she usually cook / Has she just cooked
 *   wh  Why does she usually cook
 */
function render(
  subject: string,
  form: SentenceForm,
  wh: WhWord | undefined,
  p: RenderParts,
): string {
  switch (form) {
    case "positive": {
      if (!p.mid) return build([subject, p.positiveCluster, p.tail], ".");
      if (p.midBeforeCluster) {
        return build([subject, p.mid, p.positiveCluster, p.tail], ".");
      }
      const [first, rest] = splitFirst(p.positiveCluster);
      return build([subject, first, p.mid, rest, p.tail], ".");
    }
    case "negative":
      return build([subject, p.aux, "not", p.mid, p.afterAux, p.tail], ".");
    case "yesNoQuestion":
      return build([p.aux, subject, p.mid, p.afterAux, p.tail], "?");
    case "whQuestion":
      return build([wh, p.aux, subject, p.mid, p.afterAux, p.tail], "?");
  }
}

// ---------- per-tense cluster definitions ----------

interface Clusters {
  /** words between subject and the rest, positive form */
  positiveCluster: string;
  /** auxiliary that fronts/negates */
  aux: string;
  /** words after the aux in -/?/wh */
  afterAux: string;
}

/** Verbal clusters for a given tense (main verb supplied by caller). */
function verbalClusters(tense: Tense, a: NumberAgreement, verb: Verb): Clusters {
  const V1 = verb.base;
  const ING = verb.ing;
  const V3 = verb.participle;
  switch (tense) {
    case "presentSimple":
      return { positiveCluster: presentVerb(a, verb), aux: doNow(a), afterAux: V1 };
    case "pastSimple":
      return { positiveCluster: verb.past, aux: "did", afterAux: V1 };
    case "futureSimple":
      return { positiveCluster: `will ${V1}`, aux: "will", afterAux: V1 };
    case "presentContinuous":
      return { positiveCluster: `${beNow(a)} ${ING}`, aux: beNow(a), afterAux: ING };
    case "pastContinuous":
      return { positiveCluster: `${bePast(a)} ${ING}`, aux: bePast(a), afterAux: ING };
    case "futureContinuous":
      return { positiveCluster: `will be ${ING}`, aux: "will", afterAux: `be ${ING}` };
    case "presentPerfect":
      return { positiveCluster: `${haveNow(a)} ${V3}`, aux: haveNow(a), afterAux: V3 };
    case "pastPerfect":
      return { positiveCluster: `had ${V3}`, aux: "had", afterAux: V3 };
    case "futurePerfect":
      return { positiveCluster: `will have ${V3}`, aux: "will", afterAux: `have ${V3}` };
    case "presentPerfectContinuous":
      return { positiveCluster: `${haveNow(a)} been ${ING}`, aux: haveNow(a), afterAux: `been ${ING}` };
    case "pastPerfectContinuous":
      return { positiveCluster: `had been ${ING}`, aux: "had", afterAux: `been ${ING}` };
    case "futurePerfectContinuous":
      return { positiveCluster: `will have been ${ING}`, aux: "will", afterAux: `have been ${ING}` };
  }
}

/**
 * Nominal clusters. `beWord` is the surface of "be" for simple tenses.
 * For continuous nominal (temporary behavior) the caller sets `being=true`.
 */
function nominalClusters(
  tense: Tense,
  a: NumberAgreement,
  being: boolean,
): Clusters {
  switch (tense) {
    case "presentSimple":
      return { positiveCluster: beNow(a), aux: beNow(a), afterAux: "" };
    case "pastSimple":
      return { positiveCluster: bePast(a), aux: bePast(a), afterAux: "" };
    case "futureSimple":
      return { positiveCluster: "will be", aux: "will", afterAux: "be" };
    case "presentContinuous": {
      const be = beNow(a);
      return being
        ? { positiveCluster: `${be} being`, aux: be, afterAux: "being" }
        : { positiveCluster: be, aux: be, afterAux: "" };
    }
    case "pastContinuous": {
      const be = bePast(a);
      return being
        ? { positiveCluster: `${be} being`, aux: be, afterAux: "being" }
        : { positiveCluster: be, aux: be, afterAux: "" };
    }
    case "futureContinuous":
      return { positiveCluster: "will be", aux: "will", afterAux: "be" };
    case "presentPerfect":
      return { positiveCluster: `${haveNow(a)} been`, aux: haveNow(a), afterAux: "been" };
    case "pastPerfect":
      return { positiveCluster: "had been", aux: "had", afterAux: "been" };
    case "futurePerfect":
      return { positiveCluster: "will have been", aux: "will", afterAux: "have been" };
    // Perfect-continuous nominal falls back to the perfect "been" form.
    case "presentPerfectContinuous":
      return { positiveCluster: `${haveNow(a)} been`, aux: haveNow(a), afterAux: "been" };
    case "pastPerfectContinuous":
      return { positiveCluster: "had been", aux: "had", afterAux: "been" };
    case "futurePerfectContinuous":
      return { positiveCluster: "will have been", aux: "will", afterAux: "have been" };
  }
}

/** Passive clusters: the be/aux chain that precedes the V3. */
function passiveClusters(tense: Tense, a: NumberAgreement): Clusters {
  switch (tense) {
    case "presentSimple":
      return { positiveCluster: beNow(a), aux: beNow(a), afterAux: "" };
    case "pastSimple":
      return { positiveCluster: bePast(a), aux: bePast(a), afterAux: "" };
    case "futureSimple":
      return { positiveCluster: "will be", aux: "will", afterAux: "be" };
    case "presentContinuous":
      return { positiveCluster: `${beNow(a)} being`, aux: beNow(a), afterAux: "being" };
    case "pastContinuous":
      return { positiveCluster: `${bePast(a)} being`, aux: bePast(a), afterAux: "being" };
    case "futureContinuous":
      return { positiveCluster: "will be being", aux: "will", afterAux: "be being" };
    case "presentPerfect":
      return { positiveCluster: `${haveNow(a)} been`, aux: haveNow(a), afterAux: "been" };
    case "pastPerfect":
      return { positiveCluster: "had been", aux: "had", afterAux: "been" };
    case "futurePerfect":
      return { positiveCluster: "will have been", aux: "will", afterAux: "have been" };
    case "presentPerfectContinuous":
      return { positiveCluster: `${haveNow(a)} been being`, aux: haveNow(a), afterAux: "been being" };
    case "pastPerfectContinuous":
      return { positiveCluster: "had been being", aux: "had", afterAux: "been being" };
    case "futurePerfectContinuous":
      return { positiveCluster: "will have been being", aux: "will", afterAux: "have been being" };
  }
}

// ---------- public API ----------

export interface TimeOpts {
  /** mid-position adverb (usually, already, just) */
  mid?: string;
  /** end-position time phrase (yesterday, for two hours) */
  tail?: string;
}

export function conjugateVerbal(
  tense: Tense,
  s: Subject,
  verb: Verb,
  form: SentenceForm,
  opts: TimeOpts & { wh?: WhWord; dropObject?: boolean } = {},
): string {
  const c = verbalClusters(tense, s, verb);
  // "What" replaces the object; "How" replaces a manner adverb (run fast -> How does he run?).
  const dropObject = opts.wh === "What" || Boolean(opts.dropObject);
  const tail = [dropObject ? undefined : verb.object, opts.tail].filter(Boolean).join(" ");
  // Present/past simple positive has no auxiliary: the adverb goes before the verb.
  const midBeforeCluster =
    form === "positive" && (tense === "presentSimple" || tense === "pastSimple");
  return render(s.text, form, opts.wh, { ...c, tail, mid: opts.mid, midBeforeCluster });
}

export function conjugateNominal(
  tense: Tense,
  s: Subject,
  comp: Complement,
  form: SentenceForm,
  opts: TimeOpts & { wh?: WhWord; being?: boolean } = {},
): string {
  const c = nominalClusters(tense, s, Boolean(opts.being));
  const text =
    s.number === "plural" && comp.kind === "noun" && comp.plural
      ? comp.plural
      : comp.text;
  // WH "What/Where/How" can replace the complement.
  const replacesComp =
    opts.wh === "What" || opts.wh === "Where" || opts.wh === "How";
  const tail = [replacesComp ? undefined : text, opts.tail].filter(Boolean).join(" ");
  return render(s.text, form, opts.wh, { ...c, tail, mid: opts.mid });
}

/**
 * Passive. The passive subject (the thing acted on) is passed as `subject`;
 * callers derive it from the active verb's object. An optional "by <agent>"
 * phrase names the original doer. Time phrases go after the agent:
 * "The boxes are usually carried by me." / "Dinner was cooked by her yesterday."
 */
export function conjugatePassive(
  tense: Tense,
  passiveSubject: { text: string } & NumberAgreement,
  verb: Verb,
  form: SentenceForm,
  opts: TimeOpts & { wh?: WhWord; byAgent?: string } = {},
): string {
  const c = passiveClusters(tense, passiveSubject);
  const by = opts.byAgent ? `by ${opts.byAgent}` : undefined;
  const tail = [verb.participle, by, opts.tail].filter(Boolean).join(" ");
  return render(passiveSubject.text, form, opts.wh, { ...c, tail, mid: opts.mid });
}
