import { VERBS } from "../data/verbs";
import customStoriesJson from "./custom-stories.json";

export type StoryLevel = "starter" | "intermediate" | "master";

export type MissionColor = "blue" | "green" | "purple";

export type StoryRuleId =
  | "pastPerfect"
  | "pastPassive"
  | "modalRegret"
  | "pastContinuous"
  | "pastSimple"
  | "timeConnector"
  | "presentPerfect"
  | "anyPassive"
  | "conditionalType2"
  | "relativeClause"
  | "contrastConnector"
  | "futurePlan";

export interface StoryMission {
  id: string;
  ruleId: StoryRuleId;
  color: MissionColor;
  label: string;
  formula: string;
  example: string;
  tip: string;
}

export interface VerbHelperItem {
  base: string;
  past: string;
  participle: string;
  meaning: string;
}

export interface StoryScenario {
  id: string;
  title: string;
  level: StoryLevel;
  scenarioPrompt: string;
  contextHint: string;
  keywords: string[];
  verbHelpers: VerbHelperItem[];
  missions: [StoryMission, StoryMission, StoryMission];
  sampleStory: string;
  sampleTranslation: string;
}

export interface StoryFilter {
  level: StoryLevel | "all";
  scenarioId: string | "all";
}

export interface MissionMatchSpan {
  start: number;
  end: number;
  text: string;
}

export interface MissionEvaluation {
  mission: StoryMission;
  passed: boolean;
  match: MissionMatchSpan | null;
  feedback: string;
  isNearMiss: boolean;
}

export interface StoryTextSegment {
  text: string;
  highlight?: {
    color: MissionColor;
    missionId: string;
    missionLabel: string;
    ruleName: string;
  };
}

export interface StoryEvaluationResult {
  status: "empty" | "incomplete" | "complete";
  passedCount: number;
  totalCount: number;
  sentenceCount: number;
  matchedKeywords: string[];
  missions: MissionEvaluation[];
  segments: StoryTextSegment[];
}

export const STORY_LEVEL_LABELS: Record<StoryLevel, string> = {
  starter: "Starter (Dasar)",
  intermediate: "Intermediate (Menengah)",
  master: "Master (Lanjutan)",
};

export const RULE_SHORT_NAMES: Record<StoryRuleId, string> = {
  pastPerfect: "Past Perfect",
  pastPassive: "Passive Voice (Past)",
  modalRegret: "Modal of Regret",
  pastContinuous: "Past Continuous",
  pastSimple: "Past Simple",
  timeConnector: "Time Connector",
  presentPerfect: "Present Perfect",
  anyPassive: "Passive Voice",
  conditionalType2: "Conditional Type 2",
  relativeClause: "Relative Clause",
  contrastConnector: "Contrast Connector",
  futurePlan: "Future Plan",
};

interface ExtendedVerbEntry {
  base: string;
  past: string;
  participle: string;
  ing: string;
  transitive: boolean;
}

const EXTRA_STORY_VERBS: ExtendedVerbEntry[] = [
  { base: "arrive", past: "arrived", participle: "arrived", ing: "arriving", transitive: false },
  { base: "depart", past: "departed", participle: "departed", ing: "departing", transitive: false },
  { base: "forget", past: "forgot", participle: "forgotten", ing: "forgetting", transitive: true },
  { base: "lock", past: "locked", participle: "locked", ing: "locking", transitive: true },
  { base: "miss", past: "missed", participle: "missed", ing: "missing", transitive: true },
  { base: "delay", past: "delayed", participle: "delayed", ing: "delaying", transitive: true },
  { base: "cancel", past: "cancelled", participle: "cancelled", ing: "cancelling", transitive: true },
  { base: "cancel", past: "canceled", participle: "canceled", ing: "canceling", transitive: true },
  { base: "wake", past: "woke", participle: "woken", ing: "waking", transitive: true },
  { base: "break", past: "broke", participle: "broken", ing: "breaking", ing2: "breaking", transitive: true } as ExtendedVerbEntry,
  { base: "steal", past: "stole", participle: "stolen", ing: "stealing", transitive: true },
  { base: "burn", past: "burned", participle: "burned", ing: "burning", transitive: true },
  { base: "burn", past: "burnt", participle: "burnt", ing: "burning", transitive: true },
  { base: "spill", past: "spilled", participle: "spilled", ing: "spilling", transitive: true },
  { base: "book", past: "booked", participle: "booked", ing: "booking", transitive: true },
  { base: "pack", past: "packed", participle: "packed", ing: "packing", transitive: true },
  { base: "charge", past: "charged", participle: "charged", ing: "charging", transitive: true },
  { base: "check", past: "checked", participle: "checked", ing: "checking", transitive: true },
  { base: "warn", past: "warned", participle: "warned", ing: "warning", transitive: true },
  { base: "remind", past: "reminded", participle: "reminded", ing: "reminding", transitive: true },
  { base: "change", past: "changed", participle: "changed", ing: "changing", transitive: true },
  { base: "replace", past: "replaced", participle: "replaced", ing: "replacing", transitive: true },
  { base: "destroy", past: "destroyed", participle: "destroyed", ing: "destroying", transitive: true },
  { base: "damage", past: "damaged", participle: "damaged", ing: "damaging", transitive: true },
  { base: "deliver", past: "delivered", participle: "delivered", ing: "delivering", transitive: true },
  { base: "print", past: "printed", participle: "printed", ing: "printing", transitive: true },
  { base: "practice", past: "practiced", participle: "practiced", ing: "practicing", transitive: true },
  { base: "practise", past: "practised", participle: "practised", ing: "practising", transitive: true },
  { base: "park", past: " parked", participle: "parked", ing: "parking", transitive: true },
  { base: "hide", past: "hid", participle: "hidden", ing: "hiding", transitive: true },
  { base: "bite", past: "bit", participle: "bitten", ing: "biting", transitive: true },
  { base: "choose", past: "chose", participle: "chosen", ing: "choosing", transitive: true },
  { base: "fall", past: "fell", participle: "fallen", ing: "falling", transitive: false },
  { base: "feel", past: "felt", participle: "felt", ing: "feeling", transitive: false },
  { base: "hear", past: "heard", participle: "heard", ing: "hearing", transitive: true },
  { base: "see", past: "saw", participle: "seen", ing: "seeing", transitive: true },
  { base: "tell", past: "told", participle: "told", ing: "telling", transitive: true },
  { base: "go", past: "went", participle: "gone", ing: "going", transitive: false },
  { base: "come", past: "came", participle: "come", ing: "coming", transitive: false },
  { base: "do", past: "did", participle: "done", ing: "doing", transitive: true },
  { base: "say", past: "said", participle: "said", ing: "saying", transitive: true },
  { base: "get", past: "got", participle: "gotten", ing: "getting", transitive: true },
  { base: "get", past: "got", participle: "got", ing: "getting", transitive: true },
  { base: "put", past: "put", participle: "put", ing: "putting", transitive: true },
  { base: "set", past: "set", participle: "set", ing: "setting", transitive: true },
  { base: "hit", past: "hit", participle: "hit", ing: "hitting", transitive: true },
  { base: "hurt", past: "hurt", participle: "hurt", ing: "hurting", transitive: true },
  { base: "shut", past: "shut", participle: "shut", ing: "shutting", transitive: true },
  { base: "let", past: "let", participle: "let", ing: "letting", transitive: true },
  { base: "begin", past: "began", participle: "begun", ing: "beginning", transitive: true },
  { base: "ring", past: "rang", participle: "rung", ing: "ringing", transitive: true },
  { base: "sing", past: "sang", participle: "sung", ing: "singing", transitive: true },
  { base: "sink", past: "sank", participle: "sunk", ing: "sinking", transitive: false },
  { base: "sit", past: "sat", participle: "sat", ing: "sitting", transitive: false },
  { base: "stand", past: "stood", participle: "stood", ing: "standing", transitive: false },
  { base: "understand", past: "understood", participle: "understood", ing: "understanding", transitive: true },
  { base: "disappear", past: "disappeared", participle: "disappeared", ing: "disappearing", transitive: false },
  { base: "happen", past: "happened", participle: "happened", ing: "happening", transitive: false },
  { base: "walk", past: "walked", participle: "walked", ing: "walking", transitive: false },
  { base: "talk", past: "talked", participle: "talked", ing: "talking", transitive: false },
  { base: "stop", past: "stopped", participle: "stopped", ing: "stopping", transitive: true },
  { base: "drop", past: "dropped", participle: "dropped", ing: "dropping", transitive: true },
  { base: "panic", past: "panicked", participle: "panicked", ing: "panicking", transitive: false },
  { base: "search", past: "searched", participle: "searched", ing: "searching", transitive: true },
  { base: "thank", past: "thanked", participle: "thanked", ing: "thanking", transitive: true },
  { base: "promise", past: "promised", participle: "promised", ing: "promising", transitive: true },
  { base: "want", past: "wanted", participle: "wanted", ing: "wanting", transitive: true },
  { base: "need", past: "needed", participle: "needed", ing: "needing", transitive: true },
  { base: "enjoy", past: "enjoyed", participle: "enjoyed", ing: "enjoying", transitive: true },
  { base: "explore", past: "explored", participle: "explored", ing: "exploring", transitive: true },
  { base: "realize", past: "realized", participle: "realized", ing: "realizing", transitive: true },
  { base: "notice", past: "noticed", participle: "noticed", ing: "noticing", transitive: true },
  { base: "decide", past: "decided", participle: "decided", ing: "deciding", transitive: true },
  { base: "be", past: "was", participle: "been", ing: "being", transitive: false },
  { base: "have", past: "had", participle: "had", ing: "having", transitive: true },
];

const ALL_VERBS: ExtendedVerbEntry[] = [
  ...VERBS.map((v) => ({
    base: v.base.toLowerCase(),
    past: v.past.toLowerCase(),
    participle: v.participle.toLowerCase(),
    ing: v.ing.toLowerCase(),
    transitive: v.transitive,
  })),
  ...EXTRA_STORY_VERBS.map((v) => ({
    base: v.base.trim().toLowerCase(),
    past: v.past.trim().toLowerCase(),
    participle: v.participle.trim().toLowerCase(),
    ing: v.ing.trim().toLowerCase(),
    transitive: v.transitive,
  })),
];

const V1_MAP = new Map<string, ExtendedVerbEntry>();
const V2_MAP = new Map<string, ExtendedVerbEntry>();
const V3_SET = new Set<string>();
const TRANSITIVE_V3_SET = new Set<string>();

for (const entry of ALL_VERBS) {
  if (!V1_MAP.has(entry.base)) V1_MAP.set(entry.base, entry);
  if (!V2_MAP.has(entry.past)) V2_MAP.set(entry.past, entry);
  V3_SET.add(entry.participle);
  if (entry.transitive) {
    TRANSITIVE_V3_SET.add(entry.participle);
  }
}

/** Words ending in -ed that are NOT past/participle verbs. */
const NON_ED_VERBS = new Set([
  "red",
  "bed",
  "fed",
  "led",
  "shed",
  "sled",
  "wed",
  "need",
  "seed",
  "feed",
  "weed",
  "speed",
  "bleed",
  "breed",
  "greed",
  "deed",
  "steed",
  "hundred",
  "sacred",
  "wicked",
  "naked",
]);

/** Pure feeling/state adjectives ending in -ed that should not count as passive action verbs unless followed by "by". */
const PURE_FEELING_ED = new Set([
  "tired",
  "bored",
  "excited",
  "worried",
  "nervous",
  "scared",
  "pleased",
  "relaxed",
  "ashamed",
  "interested",
  "crowded",
  "married",
]);

/** Purely intransitive verbs whose V3 cannot form a valid passive voice. */
const INTRANSITIVE_ONLY_V3 = new Set([
  "arrived",
  "departed",
  "gone",
  "come",
  "been",
  "fallen",
  "slept",
  "run",
  "swum",
  "waited",
  "walked",
  "talked",
  "happened",
  "disappeared",
  "sat",
  "stood",
  "sunk",
  "panicked",
]);

function isRegularEdVerb(word: string): boolean {
  const w = word.toLowerCase();
  if (w.length < 4 || !w.endsWith("ed")) return false;
  if (NON_ED_VERBS.has(w)) return false;
  return true;
}

export function isValidV3(word: string): boolean {
  const w = word.toLowerCase();
  return V3_SET.has(w) || isRegularEdVerb(w);
}

export function isValidPassiveV3(word: string, followedByBy: boolean): boolean {
  const w = word.toLowerCase();
  if (INTRANSITIVE_ONLY_V3.has(w)) return false;
  if (PURE_FEELING_ED.has(w) && !followedByBy) return false;
  return TRANSITIVE_V3_SET.has(w) || isRegularEdVerb(w);
}

export function isValidV2(word: string): boolean {
  const w = word.toLowerCase();
  if (w === "was" || w === "were" || w === "had" || w === "did") return true;
  return V2_MAP.has(w) || isRegularEdVerb(w);
}

/** If a word is V1 or V2 (and NOT V3), returns its corrected V3 form. */
function suggestV3ForNonV3(word: string): string | null {
  const w = word.toLowerCase();
  if (isValidV3(w)) return null;
  const fromV1 = V1_MAP.get(w);
  if (fromV1) return fromV1.participle;
  const fromV2 = V2_MAP.get(w);
  if (fromV2) return fromV2.participle;
  return null;
}

function spansOverlap(a: MissionMatchSpan, b: MissionMatchSpan): boolean {
  return a.start < b.end && b.start < a.end;
}

function findRegexMatch(
  text: string,
  regex: RegExp,
  claimed: MissionMatchSpan[],
  validator?: (match: RegExpExecArray) => boolean,
): MissionMatchSpan | null {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  const re = new RegExp(regex.source, flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (validator && !validator(m)) continue;
    const candidate: MissionMatchSpan = {
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
    };
    if (!claimed.some((c) => spansOverlap(c, candidate))) {
      return candidate;
    }
  }
  return null;
}

function matchMissionRule(
  ruleId: StoryRuleId,
  text: string,
  claimed: MissionMatchSpan[],
): MissionMatchSpan | null {
  switch (ruleId) {
    case "pastPerfect": {
      const re =
        /\bhad(?:\s+not|n't)?(?:\s+(?:already|just|never|always|ever|even|finally|completely|totally|suddenly))?\s+([a-zA-Z]+)\b/gi;
      return findRegexMatch(text, re, claimed, (m) => {
        const verb = m[1].toLowerCase();
        if (verb === "to" || verb === "a" || verb === "an" || verb === "the") {
          return false;
        }
        return isValidV3(verb);
      });
    }

    case "pastPassive": {
      const re =
        /\b(?:was|were)(?:\s+not|n't)?(?:\s+(?:already|just|never|completely|accidentally|finally|suddenly|quickly|carefully|warmly|honestly|still))?\s+([a-zA-Z]+)\b/gi;
      return findRegexMatch(text, re, claimed, (m) => {
        const verb = m[1].toLowerCase();
        if (verb.endsWith("ing")) return false;
        const afterText = text.slice(m.index + m[0].length);
        const followedByBy = /^\s+by\b/i.test(afterText);
        return isValidPassiveV3(verb, followedByBy);
      });
    }

    case "anyPassive": {
      const re =
        /\b(?:was|were|is|are|am|has\s+been|have\s+been)(?:\s+not|n't)?(?:\s+(?:already|just|never|completely|accidentally|finally|suddenly|quickly|still|often|always|widely))?\s+([a-zA-Z]+)\b/gi;
      return findRegexMatch(text, re, claimed, (m) => {
        const verb = m[1].toLowerCase();
        if (verb.endsWith("ing")) return false;
        const afterText = text.slice(m.index + m[0].length);
        const followedByBy = /^\s+by\b/i.test(afterText);
        return isValidPassiveV3(verb, followedByBy);
      });
    }

    case "modalRegret": {
      const re =
        /\b(?:should|could|would|must|might)(?:\s+not|n't)?\s+have(?:\s+(?:just|never|already|even))?\s+([a-zA-Z]+)\b/gi;
      return findRegexMatch(text, re, claimed, (m) => {
        const verb = m[1].toLowerCase();
        return isValidV3(verb);
      });
    }

    case "pastContinuous": {
      const re =
        /\b(?:was|were)(?:\s+not|n't)?(?:\s+(?:still|just|already|quietly|fast|quickly|slowly|carefully))?\s+([a-zA-Z]+ing)\b/gi;
      return findRegexMatch(text, re, claimed, (m) => {
        const word = m[1].toLowerCase();
        return word.length >= 5 && word !== "thing" && word !== "bring" && word !== "spring" && word !== "string" && word !== "ring" && word !== "sing" && word !== "king" && word !== "wing";
      });
    }

    case "presentPerfect": {
      const re =
        /\b(?:have|has)(?:\s+not|n't)?(?:\s+(?:already|just|never|ever|recently|finally|always|also))?\s+([a-zA-Z]+)\b/gi;
      return findRegexMatch(text, re, claimed, (m) => {
        const verb = m[1].toLowerCase();
        if (verb === "to" || verb === "a" || verb === "an" || verb === "the") {
          return false;
        }
        // Reject if preceded by a modal (e.g., "should have V3", "will have V3")
        const before = text.slice(Math.max(0, m.index - 15), m.index);
        if (/\b(?:should|could|would|must|might|may|will|can)(?:\s+not|n't)?\s+$/i.test(before)) {
          return false;
        }
        return isValidV3(verb);
      });
    }

    case "pastSimple": {
      const re = /\b([a-zA-Z]+)\b/g;
      return findRegexMatch(text, re, claimed, (m) => {
        const word = m[1].toLowerCase();
        if (!isValidV2(word)) return false;
        // Ensure it's not part of Perfect or Passive or Continuous auxiliary
        const before = text.slice(Math.max(0, m.index - 22), m.index);
        if (
          /\b(?:had|have|has|was|were|is|are|am|be|been|to|will|would|should|could|can|did|didn't)(?:\s+not|n't)?(?:\s+\w+)?\s+$/i.test(
            before,
          )
        ) {
          return false;
        }
        // If word is "was/were/had", ensure it's not followed by V3 or V-ing
        if (word === "was" || word === "were" || word === "had") {
          const after = text.slice(m.index + m[0].length);
          const nextWordMatch = /^\s+(?:not\s+|n't\s+)?([a-zA-Z]+)/.exec(after);
          if (nextWordMatch) {
            const nextW = nextWordMatch[1].toLowerCase();
            if (nextW.endsWith("ing") || isValidV3(nextW)) return false;
          }
        }
        return true;
      });
    }

    case "timeConnector": {
      const re = /\b(?:when|while|before|after|as soon as|until)\b/gi;
      return findRegexMatch(text, re, claimed);
    }

    case "contrastConnector": {
      const re = /\b(?:although|even though|though|however|despite|in spite of)\b/gi;
      return findRegexMatch(text, re, claimed);
    }

    case "relativeClause": {
      const re = /\b(?:who|which|where|whose)\s+[a-zA-Z]+/gi;
      return findRegexMatch(text, re, claimed, (m) => {
        // Not a question at the very start of a sentence ending with ?
        const after = text.slice(m.index);
        const sentenceEnd = after.search(/[.!?]/);
        if (sentenceEnd !== -1 && after[sentenceEnd] === "?") return false;
        return true;
      });
    }

    case "conditionalType2": {
      const re =
        /\bif\s+[a-zA-Z]+[^.!?]{1,50}\b(?:would|could)(?:\s+not|n't)?\s+[a-zA-Z]+\b|\b(?:would|could)(?:\s+not|n't)?\s+[a-zA-Z]+[^.!?]{1,50}\bif\s+[a-zA-Z]+/gi;
      return findRegexMatch(text, re, claimed);
    }

    case "futurePlan": {
      const re =
        /\b(?:will(?:\s+not)?|won't|(?:am|is|are)(?:\s+not)?\s+going\s+to)\s+[a-zA-Z]+\b/gi;
      return findRegexMatch(text, re, claimed);
    }
  }
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Generates targeted diagnostic coaching when a mission is NOT yet fulfilled.
 * Checks if the user made a near-miss attempt (wrong verb form, active instead of passive, etc.).
 */
function buildMissionDiagnostic(
  mission: StoryMission,
  text: string,
): { feedback: string; isNearMiss: boolean } {
  const { ruleId } = mission;

  if (ruleId === "pastPerfect") {
    // Near-miss 1: "had to + V1"
    const hadToMatch = /\b(had\s+to\s+[a-zA-Z]+)\b/i.exec(text);
    if (hadToMatch) {
      return {
        isNearMiss: true,
        feedback: `Misi belum selesai: Anda menulis "${hadToMatch[1]}" (keharusan/obligation), bukan Past Perfect. Gunakan rumus "had + V3" (contoh: "${mission.example}").`,
      };
    }
    // Near-miss 2: "had + V1/V2 (not V3)" e.g. "had leave", "had went", "had forgot"
    const hadVerbMatch =
      /\bhad(?:\s+not|n't)?(?:\s+(?:already|just|never))?\s+([a-zA-Z]+)\b/i.exec(
        text,
      );
    if (hadVerbMatch) {
      const v3 = suggestV3ForNonV3(hadVerbMatch[1]);
      if (v3) {
        return {
          isNearMiss: true,
          feedback: `Hampir tepat! Anda menulis "${hadVerbMatch[0]}", tetapi setelah "had" wajib memakai V3 (Past Participle). Ubah "${hadVerbMatch[1]}" menjadi "${v3}" ("had ${v3}").`,
        };
      }
    }
    return {
      isNearMiss: false,
      feedback: `Misi belum selesai: Anda belum memasukkan kalimat Past Perfect (had + V3). Contoh: "${mission.example}"`,
    };
  }

  if (ruleId === "pastPassive" || ruleId === "anyPassive") {
    // Near-miss 1: "was/were + V1/V2_not_V3" e.g. "was leave", "was stole", "were forgot"
    const wasVerbMatch = /\b(was|were)(?:\s+not|n't)?\s+([a-zA-Z]+)\b/i.exec(text);
    if (wasVerbMatch) {
      const v3 = suggestV3ForNonV3(wasVerbMatch[2]);
      if (v3) {
        return {
          isNearMiss: true,
          feedback: `Hampir tepat! Anda menulis "${wasVerbMatch[0]}", tetapi kalimat pasif wajib memakai V3 setelah "${wasVerbMatch[1]}". Ubah menjadi "${wasVerbMatch[1]} ${v3}".`,
        };
      }
    }
    // Near-miss 2: User wrote Present Passive "is/are + V3" when Past Passive was required
    if (ruleId === "pastPassive") {
      const presPassive = /\b(is|are)\s+([a-zA-Z]+)\b/i.exec(text);
      if (presPassive && isValidPassiveV3(presPassive[2], false)) {
        const pastAux = presPassive[1].toLowerCase() === "is" ? "was" : "were";
        return {
          isNearMiss: true,
          feedback: `Hampir tepat! Anda menulis "${presPassive[0]}" (Present Passive). Karena cerita ini di masa lampau, ubah menjadi "${pastAux} ${presPassive[2]}".`,
        };
      }
    }
    // Near-miss 3: User wrote an ACTIVE clause with a transitive verb + object (e.g. "I left my ticket")
    const activeRe =
      /\b(I|we|they|he|she|someone|somebody)\s+([a-zA-Z]+)\s+((?:my|our|the|his|her|a|an)\s+[a-zA-Z]+)\b/gi;
    let m: RegExpExecArray | null;
    while ((m = activeRe.exec(text)) !== null) {
      const verbWord = m[2].toLowerCase();
      const entry = V1_MAP.get(verbWord) ?? V2_MAP.get(verbWord);
      if (entry && entry.transitive) {
        const objPhrase = m[3];
        const objNoun = objPhrase.split(/\s+/).pop()?.toLowerCase() ?? "";
        const isPluralObj = objNoun.endsWith("s") && !objNoun.endsWith("ss");
        const aux = isPluralObj ? "were" : "was";
        return {
          isNearMiss: true,
          feedback: `Misi belum selesai: Anda melupakan kalimat Passive Voice. Coba ubah kalimat "${m[0]}" menjadi "${capitalize(objPhrase)} ${aux} ${entry.participle}".`,
        };
      }
    }
    return {
      isNearMiss: false,
      feedback: `Misi belum selesai: Anda belum memasukkan kalimat Passive Voice (${mission.formula}). Contoh: "${mission.example}"`,
    };
  }

  if (ruleId === "modalRegret") {
    // Near-miss 1: "should/could/would have + V1/V2_not_V3" e.g. "should have prepare"
    const modalHaveMatch =
      /\b(should|could|would|must|might)(?:\s+not|n't)?\s+have\s+([a-zA-Z]+)\b/i.exec(
        text,
      );
    if (modalHaveMatch) {
      const v3 = suggestV3ForNonV3(modalHaveMatch[2]);
      if (v3) {
        return {
          isNearMiss: true,
          feedback: `Hampir tepat! Anda menulis "${modalHaveMatch[0]}", tetapi setelah "have" wajib diikuti V3. Ubah menjadi "${modalHaveMatch[1]} have ${v3}".`,
        };
      }
    }
    // Near-miss 2: "should/could + V1" without "have" e.g. "I should prepare"
    const modalSimpleMatch =
      /\b(should|could|would)(?:\s+not|n't)?\s+([a-zA-Z]+)\b/i.exec(text);
    if (modalSimpleMatch && modalSimpleMatch[2].toLowerCase() !== "have") {
      const rawVerb = modalSimpleMatch[2].toLowerCase();
      const entry = V1_MAP.get(rawVerb) ?? V2_MAP.get(rawVerb);
      const v3 = entry
        ? entry.participle
        : isValidV3(rawVerb)
          ? rawVerb
          : `${rawVerb}ed`;
      return {
        isNearMiss: true,
        feedback: `Hampir tepat! Anda menulis "${modalSimpleMatch[0]}" (saran masa kini). Untuk penyesalan masa lampau (Modal of Regret), gunakan "${modalSimpleMatch[1]} have ${v3}".`,
      };
    }
    return {
      isNearMiss: false,
      feedback: `Misi belum selesai: Anda belum memasukkan Modal of Regret (should have + V3). Contoh: "${mission.example}"`,
    };
  }

  if (ruleId === "pastContinuous") {
    const presCont = /\b(am|is|are)\s+([a-zA-Z]+ing)\b/i.exec(text);
    if (presCont) {
      const pastAux = presCont[1].toLowerCase() === "are" ? "were" : "was";
      return {
        isNearMiss: true,
        feedback: `Hampir tepat! Anda menulis "${presCont[0]}" (Present Continuous). Untuk kejadian di masa lampau, ubah menjadi "${pastAux} ${presCont[2]}".`,
      };
    }
    return {
      isNearMiss: false,
      feedback: `Misi belum selesai: Tambahkan 1 kalimat Past Continuous (was/were + V-ing). Contoh: "${mission.example}"`,
    };
  }

  if (ruleId === "presentPerfect") {
    const haveVerb = /\b(have|has)(?:\s+not|n't)?\s+([a-zA-Z]+)\b/i.exec(text);
    if (haveVerb) {
      const v3 = suggestV3ForNonV3(haveVerb[2]);
      if (v3) {
        return {
          isNearMiss: true,
          feedback: `Hampir tepat! Anda menulis "${haveVerb[0]}", tetapi setelah "${haveVerb[1]}" wajib diikuti V3. Ubah menjadi "${haveVerb[1]} ${v3}".`,
        };
      }
    }
    return {
      isNearMiss: false,
      feedback: `Misi belum selesai: Tambahkan 1 kalimat Present Perfect (have/has + V3). Contoh: "${mission.example}"`,
    };
  }

  if (ruleId === "conditionalType2") {
    const condType1 = /\bif\b[^.!?]+\bwill\s+([a-zA-Z]+)\b/i.exec(text);
    if (condType1) {
      return {
        isNearMiss: true,
        feedback: `Hampir tepat! Anda menggunakan "will ${condType1[1]}" (Conditional Type 1). Untuk pengandaian Conditional Type 2, gunakan "If + Past Simple, ... would ${condType1[1]}".`,
      };
    }
  }

  return {
    isNearMiss: false,
    feedback: `Misi belum selesai: Tambahkan ${mission.label}. Contoh: "${mission.example}"`,
  };
}

export function buildHighlightedSegments(
  text: string,
  evaluations: MissionEvaluation[],
): StoryTextSegment[] {
  const matchedItems = evaluations
    .filter((e): e is MissionEvaluation & { match: MissionMatchSpan } => e.passed && e.match !== null)
    .sort((a, b) => a.match.start - b.match.start);

  if (matchedItems.length === 0) {
    return [{ text }];
  }

  const segments: StoryTextSegment[] = [];
  let cursor = 0;

  for (const item of matchedItems) {
    const { start, end } = item.match;
    if (start < cursor) continue;
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start) });
    }
    segments.push({
      text: text.slice(start, end),
      highlight: {
        color: item.mission.color,
        missionId: item.mission.id,
        missionLabel: item.mission.label,
        ruleName: RULE_SHORT_NAMES[item.mission.ruleId],
      },
    });
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }

  return segments;
}

export function evaluateStorySubmission(
  scenario: StoryScenario,
  rawText: string,
): StoryEvaluationResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      status: "empty",
      passedCount: 0,
      totalCount: scenario.missions.length,
      sentenceCount: 0,
      matchedKeywords: [],
      missions: scenario.missions.map((mission) => ({
        mission,
        passed: false,
        match: null,
        feedback: `Belum ada cerita yang ditulis untuk misi: ${mission.label}.`,
        isNearMiss: false,
      })),
      segments: [],
    };
  }

  const sentences = trimmed
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const lowerText = trimmed.toLowerCase();
  const matchedKeywords = scenario.keywords.filter((kw) =>
    lowerText.includes(kw.toLowerCase()),
  );

  const claimedSpans: MissionMatchSpan[] = [];
  const evaluations: MissionEvaluation[] = [];

  for (const mission of scenario.missions) {
    const match = matchMissionRule(mission.ruleId, trimmed, claimedSpans);
    if (match) {
      claimedSpans.push(match);
      evaluations.push({
        mission,
        passed: true,
        match,
        feedback: `Tepat! Frasa "${match.text}" memenuhi syarat ${RULE_SHORT_NAMES[mission.ruleId]}.`,
        isNearMiss: false,
      });
    } else {
      const diag = buildMissionDiagnostic(mission, trimmed);
      evaluations.push({
        mission,
        passed: false,
        match: null,
        feedback: diag.feedback,
        isNearMiss: diag.isNearMiss,
      });
    }
  }

  const passedCount = evaluations.filter((e) => e.passed).length;
  const totalCount = scenario.missions.length;
  const segments = buildHighlightedSegments(trimmed, evaluations);

  return {
    status: passedCount === totalCount ? "complete" : "incomplete",
    passedCount,
    totalCount,
    sentenceCount: sentences.length,
    matchedKeywords,
    missions: evaluations,
    segments,
  };
}

// ============================================================================
// Curated Built-in Story Challenge Scenarios (Starter, Intermediate, Master)
// ============================================================================

const BUILTIN_SCENARIOS: StoryScenario[] = [
  {
    id: "late-event",
    title: "Terlambat ke Acara Penting (Late for an Event)",
    level: "master",
    scenarioPrompt:
      "Ceritakan pengalaman saat Anda terlambat datang ke sebuah acara penting atau ketinggalan kereta/bus.",
    contextHint:
      "Ceritakan apa yang sudah terjadi saat Anda tiba di stasiun/lokasi, barang apa yang tertinggal, dan penyesalan Anda.",
    keywords: ["station", "train", "ticket", "desk", "home", "late"],
    verbHelpers: [
      { base: "leave", past: "left", participle: "left", meaning: "berangkat / tertinggal" },
      { base: "prepare", past: "prepared", participle: "prepared", meaning: "menyiapkan" },
      { base: "arrive", past: "arrived", participle: "arrived", meaning: "tiba" },
      { base: "forget", past: "forgot", participle: "forgotten", meaning: "melupakan" },
    ],
    missions: [
      {
        id: "m1",
        ruleId: "pastPerfect",
        color: "blue",
        label: "1 kalimat memakai Past Perfect (had + V3)",
        formula: "Subject + had + V3 (Past Participle)",
        example: "The train had left before I arrived.",
        tip: "Gunakan untuk kejadian yang sudah selesai sebelum Anda tiba (misal: the train had left).",
      },
      {
        id: "m2",
        ruleId: "pastPassive",
        color: "green",
        label: "1 kalimat memakai Passive Voice - Past (was/were + V3)",
        formula: "Object + was/were + V3",
        example: "My ticket was left on my desk at home.",
        tip: "Ubah objek menjadi subjek kalimat (misal: my ticket was left / the gate was closed).",
      },
      {
        id: "m3",
        ruleId: "modalRegret",
        color: "purple",
        label: "1 kalimat memakai Modal of Regret (should have + V3)",
        formula: "Subject + should have + V3",
        example: "I should have prepared everything last night.",
        tip: "Gunakan untuk menyatakan penyesalan atas hal yang seharusnya dilakukan sebelumnya.",
      },
    ],
    sampleStory:
      "I ran fast to the station, but the train had left before I arrived. I was panicking because my ticket was left on my desk at home. I should have prepared everything last night.",
    sampleTranslation:
      "Saya berlari cepat ke stasiun, tetapi keretanya sudah berangkat sebelum saya tiba. Saya panik karena tiket saya tertinggal di meja di rumah. Seharusnya saya menyiapkan semuanya tadi malam.",
  },
  {
    id: "ruined-trip",
    title: "Liburan yang Tak Sesuai Rencana (A Ruined Trip)",
    level: "master",
    scenarioPrompt:
      "Ceritakan pengalaman liburan saat cuaca buruk atau kendala teknis mengacaukan jadwal perjalanan Anda.",
    contextHint:
      "Ceritakan kondisi saat Anda sampai di bandara/hotel, jadwal yang dibatalkan, dan apa yang seharusnya Anda cek lebih dulu.",
    keywords: ["airport", "flight", "storm", "hotel", "schedule", "weather"],
    verbHelpers: [
      { base: "depart", past: "departed", participle: "departed", meaning: "berangkat" },
      { base: "cancel", past: "cancelled", participle: "cancelled", meaning: "membatalkan / dibatalkan" },
      { base: "check", past: "checked", participle: "checked", meaning: "memeriksa" },
      { base: "book", past: "booked", participle: "booked", meaning: "memesan" },
    ],
    missions: [
      {
        id: "m1",
        ruleId: "pastPerfect",
        color: "blue",
        label: "1 kalimat memakai Past Perfect (had + V3)",
        formula: "Subject + had + V3",
        example: "The first bus had departed when we reached the terminal.",
        tip: "Gunakan untuk kejadian yang sudah terjadi sebelum Anda tiba.",
      },
      {
        id: "m2",
        ruleId: "pastPassive",
        color: "green",
        label: "1 kalimat memakai Passive Voice - Past (was/were + V3)",
        formula: "Object + was/were + V3",
        example: "Our flight was cancelled due to a heavy storm.",
        tip: "Misalnya: the flight was cancelled / our luggage was delayed.",
      },
      {
        id: "m3",
        ruleId: "modalRegret",
        color: "purple",
        label: "1 kalimat memakai Modal of Regret (should/could have + V3)",
        formula: "Subject + should/could have + V3",
        example: "We should have checked the weather forecast earlier.",
        tip: "Ungkapkan hal yang seharusnya dicek sebelum berangkat.",
      },
    ],
    sampleStory:
      "We arrived at the airport early, but our morning bus had departed ten minutes before. Later, our flight was cancelled due to a heavy storm. We should have checked the weather forecast before leaving the hotel.",
    sampleTranslation:
      "Kami tiba di bandara lebih awal, tetapi bus pagi kami sudah berangkat sepuluh menit sebelumnya. Kemudian, penerbangan kami dibatalkan karena badai besar. Seharusnya kami memeriksa prakiraan cuaca sebelum meninggalkan hotel.",
  },
  {
    id: "project-crisis",
    title: "Kejutan Saat Presentasi (A Presentation Crisis)",
    level: "master",
    scenarioPrompt:
      "Ceritakan momen ketika Anda mengalami kendala teknis mendadak saat hendak mempresentasikan proyek penting.",
    contextHint:
      "Ceritakan file atau alat yang bermasalah sebelum rapat dimulai, bagaimana masalah itu diselamatkan, dan hasil akhirnya.",
    keywords: ["laptop", "meeting", "file", "backup", "server", "presentation"],
    verbHelpers: [
      { base: "disappear", past: "disappeared", participle: "disappeared", meaning: "menghilang" },
      { base: "save", past: "saved", participle: "saved", meaning: "menyimpan / disimpan" },
      { base: "repair", past: "repaired", participle: "repaired", meaning: "memperbaiki / diperbaiki" },
      { base: "finish", past: "finished", participle: "finished", meaning: "menyelesaikan" },
    ],
    missions: [
      {
        id: "m1",
        ruleId: "pastPerfect",
        color: "blue",
        label: "1 kalimat memakai Past Perfect (had + V3)",
        formula: "Subject + had + V3",
        example: "The main file had disappeared from my laptop folder.",
        tip: "Ceritakan apa yang sudah terjadi pada file/perangkat sebelum rapat dimulai.",
      },
      {
        id: "m2",
        ruleId: "pastPassive",
        color: "green",
        label: "1 kalimat memakai Passive Voice - Past (was/were + V3)",
        formula: "Object + was/were + V3",
        example: "A backup copy was saved on our cloud server.",
        tip: "Misalnya: a backup copy was saved / the projector was repaired.",
      },
      {
        id: "m3",
        ruleId: "contrastConnector",
        color: "purple",
        label: "1 kalimat memakai Contrast Connector (although / however / even though)",
        formula: "Although / Even though / However + Clause",
        example: "Although I panicked at first, the meeting went smoothly.",
        tip: "Gunakan kata penghubung pertentangan untuk menutup cerita dengan kontras.",
      },
    ],
    sampleStory:
      "I opened my laptop for the client meeting, but the final slide had disappeared from my folder. Fortunately, a backup copy was saved on our cloud server by my teammate. Although I was nervous at first, the presentation finished smoothly.",
    sampleTranslation:
      "Saya membuka laptop untuk rapat klien, tetapi salindia terakhir sudah menghilang dari folder saya. Untungnya, salinan cadangan disimpan di server cloud kami oleh rekan setim saya. Meskipun awalnya saya gugup, presentasi tersebut selesai dengan lancar.",
  },
  {
    id: "hometown-change",
    title: "Perubahan Kotaku (How My Hometown Changed)",
    level: "intermediate",
    scenarioPrompt:
      "Ceritakan bagaimana kota atau lingkungan tempat tinggal Anda berubah dibanding beberapa tahun lalu.",
    contextHint:
      "Bandingkan perkembangan kota hingga saat ini, bangunan apa yang dibangun/diganti, dan tempat favorit Anda.",
    keywords: ["city", "hometown", "park", "building", "modern", "library"],
    verbHelpers: [
      { base: "grow", past: "grew", participle: "grown", meaning: "berkembang / tumbuh" },
      { base: "build", past: "built", participle: "built", meaning: "membangun / dibangun" },
      { base: "replace", past: "replaced", participle: "replaced", meaning: "mengganti / digantikan" },
      { base: "protect", past: "protected", participle: "protected", meaning: "melindungi / dilindungi" },
    ],
    missions: [
      {
        id: "m1",
        ruleId: "presentPerfect",
        color: "blue",
        label: "1 kalimat memakai Present Perfect (have/has + V3)",
        formula: "Subject + have/has + V3",
        example: "My hometown has grown rapidly over the last five years.",
        tip: "Gunakan untuk perubahan yang dimulai di masa lalu dan masih terasa sekarang.",
      },
      {
        id: "m2",
        ruleId: "anyPassive",
        color: "green",
        label: "1 kalimat memakai Passive Voice (was/were/is/are + V3)",
        formula: "Object + was/were/is/are + V3",
        example: "Many old parks were replaced by modern shopping malls.",
        tip: "Misalnya: new roads were built / the old park is protected.",
      },
      {
        id: "m3",
        ruleId: "relativeClause",
        color: "purple",
        label: "1 kalimat memakai Relative Clause (who / which / where)",
        formula: "Noun + who / which / where + Clause",
        example: "I still visit the small park where I played as a child.",
        tip: "Gunakan who (orang), which (benda), atau where (tempat) untuk menerangkan kata benda.",
      },
    ],
    sampleStory:
      "My hometown has grown rapidly over the last five years. Many old fields were replaced by modern cafes and apartments. Even so, the public library where I studied every afternoon is still protected by the local community.",
    sampleTranslation:
      "Kota kelahiran saya telah berkembang pesat selama lima tahun terakhir. Banyak lahan tua digantikan oleh kafe dan apartemen modern. Meski begitu, perpustakaan umum tempat saya belajar setiap sore masih dilindungi oleh komunitas warga.",
  },
  {
    id: "lost-wallet",
    title: "Kehilangan Barang Berharga (Losing Something Valuable)",
    level: "intermediate",
    scenarioPrompt:
      "Ceritakan pengalaman saat dompet, kunci, atau ponsel Anda hilang lalu akhirnya ditemukan kembali.",
    contextHint:
      "Ceritakan apa yang sedang Anda lakukan saat sadar barang itu hilang, dan oleh siapa barang itu ditemukan.",
    keywords: ["wallet", "phone", "keys", "market", "pocket", "found"],
    verbHelpers: [
      { base: "walk", past: "walked", participle: "walked", meaning: "berjalan" },
      { base: "find", past: "found", participle: "found", meaning: "menemukan / ditemukan" },
      { base: "return", past: "returned", participle: "returned", meaning: "mengembalikan / dikembalikan" },
      { base: "lose", past: "lost", participle: "lost", meaning: "kehilangan" },
    ],
    missions: [
      {
        id: "m1",
        ruleId: "pastContinuous",
        color: "blue",
        label: "1 kalimat memakai Past Continuous (was/were + V-ing)",
        formula: "Subject + was/were + V-ing",
        example: "I was walking home from the market.",
        tip: "Gunakan untuk aktivitas yang sedang berlangsung saat kejadian terjadi.",
      },
      {
        id: "m2",
        ruleId: "pastPassive",
        color: "green",
        label: "1 kalimat memakai Passive Voice - Past (was/were + V3)",
        formula: "Object + was/were + V3",
        example: "My wallet was found by a kind shopkeeper.",
        tip: "Fokus pada barang yang ditemukan (was found) atau dikembalikan (was returned).",
      },
      {
        id: "m3",
        ruleId: "timeConnector",
        color: "purple",
        label: "1 kalimat memakai Time Connector (when / while / before / after)",
        formula: "when / while / before / after + Clause",
        example: "After I thanked him warmly, I went home happily.",
        tip: "Gunakan kata penghubung waktu untuk mengaitkan urutan kejadian.",
      },
    ],
    sampleStory:
      "I was walking home from the night market when I realized my wallet was missing. I searched everywhere, and thankfully my wallet was found by a kind shopkeeper near the gate. After I thanked him warmly, I promised to be more careful.",
    sampleTranslation:
      "Saya sedang berjalan pulang dari pasar malam ketika saya sadar dompet saya hilang. Saya mencari ke mana-mana, dan syukurlah dompet saya ditemukan oleh seorang pemilik toko yang baik di dekat gerbang. Setelah saya berterima kasih dengan hangat kepadanya, saya berjanji untuk lebih berhati-hati.",
  },
  {
    id: "dream-skill",
    title: "Andai Punya Waktu Lebih (A Dream Skill)",
    level: "intermediate",
    scenarioPrompt:
      "Ceritakan satu keterampilan atau bahasa yang ingin Anda kuasai dan apa yang akan Anda lakukan jika punya waktu luang lebih banyak.",
    contextHint:
      "Ceritakan sudah berapa lama Anda tertarik pada hal itu, pengandaian jika punya waktu luang, dan usaha rutin Anda.",
    keywords: ["learn", "language", "time", "practice", "schedule", "fluent"],
    verbHelpers: [
      { base: "want", past: "wanted", participle: "wanted", meaning: "menginginkan" },
      { base: "learn", past: "learned", participle: "learned", meaning: "mempelajari" },
      { base: "practice", past: "practiced", participle: "practiced", meaning: "berlatih" },
      { base: "speak", past: "spoke", participle: "spoken", meaning: "berbicara" },
    ],
    missions: [
      {
        id: "m1",
        ruleId: "presentPerfect",
        color: "blue",
        label: "1 kalimat memakai Present Perfect (have/has + V3)",
        formula: "Subject + have/has + V3",
        example: "I have learned English grammar for several months.",
        tip: "Gunakan untuk keinginan atau proses belajar yang sudah dimulai sejak dulu hingga kini.",
      },
      {
        id: "m2",
        ruleId: "conditionalType2",
        color: "green",
        label: "1 kalimat memakai Conditional Type 2 (If + Past, would + V1)",
        formula: "If + Subject + V2/were, Subject + would/could + V1",
        example: "If I had more free time, I would practice every evening.",
        tip: "Gunakan untuk berandai-andai tentang situasi saat ini.",
      },
      {
        id: "m3",
        ruleId: "contrastConnector",
        color: "purple",
        label: "1 kalimat memakai Contrast Connector (although / even though / however)",
        formula: "Although / Even though / However + Clause",
        example: "Although my schedule is busy, I still read every night.",
        tip: "Tunjukkan semangat belajar Anda meskipun ada tantangan.",
      },
    ],
    sampleStory:
      "I have wanted to speak fluent English since I graduated from college. If I had more free time every afternoon, I would join an international speaking club. Although my daily schedule is busy, I still practice ten new sentences every night.",
    sampleTranslation:
      "Saya sudah ingin berbicara bahasa Inggris dengan lancar sejak lulus kuliah. Jika saya punya lebih banyak waktu luang setiap sore, saya akan bergabung dengan klub berbicara internasional. Meskipun jadwal harian saya padat, saya tetap melatih sepuluh kalimat baru setiap malam.",
  },
  {
    id: "rainy-day",
    title: "Sore Hujan yang Tak Terlupakan (A Memorable Rainy Day)",
    level: "starter",
    scenarioPrompt:
      "Ceritakan kejadian singkat saat hujan turun deras kemarin dan apa yang sedang Anda lakukan saat itu.",
    contextHint:
      "Ceritakan ke mana Anda pergi kemarin, apa yang sedang Anda lakukan saat hujan turun, dan bagaimana Anda berteduh.",
    keywords: ["rain", "coffee", "umbrella", "friend", "yesterday", "wait"],
    verbHelpers: [
      { base: "walk", past: "walked", participle: "walked", meaning: "berjalan" },
      { base: "wait", past: "waited", participle: "waited", meaning: "menunggu" },
      { base: "drink", past: "drank", participle: "drunk", meaning: "minum" },
      { base: "fall", past: "fell", participle: "fallen", meaning: "turun / jatuh" },
    ],
    missions: [
      {
        id: "m1",
        ruleId: "pastSimple",
        color: "blue",
        label: "1 kalimat memakai Past Simple (V2)",
        formula: "Subject + V2 (Past Verb)",
        example: "Yesterday afternoon, I walked to the coffee shop.",
        tip: "Gunakan kata kerja bentuk kedua (walked, went, drank, fell).",
      },
      {
        id: "m2",
        ruleId: "pastContinuous",
        color: "green",
        label: "1 kalimat memakai Past Continuous (was/were + V-ing)",
        formula: "Subject + was/were + V-ing",
        example: "I was waiting for my friend outside the cafe.",
        tip: "Gunakan was/were + V-ing untuk aktivitas yang sedang berlangsung.",
      },
      {
        id: "m3",
        ruleId: "timeConnector",
        color: "purple",
        label: "1 kalimat memakai Time Connector (when / while / until)",
        formula: "when / while / until + Clause",
        example: "While I was waiting outside, heavy rain fell.",
        tip: "Hubungkan kejadian yang sedang berlangsung dengan turunnya hujan.",
      },
    ],
    sampleStory:
      "Yesterday afternoon, I walked to a small coffee shop near my house. While I was waiting for my friend outside, heavy rain suddenly fell. We drank warm tea inside the cafe until the rain stopped.",
    sampleTranslation:
      "Kemarin sore, saya berjalan ke sebuah kedai kopi kecil di dekat rumah saya. Sementara saya sedang menunggu teman saya di luar, hujan deras tiba-tiba turun. Kami minum teh hangat di dalam kafe sampai hujannya berhenti.",
  },
  {
    id: "special-dinner",
    title: "Masak Makan Malam Spesial (Cooking a Special Dinner)",
    level: "starter",
    scenarioPrompt:
      "Ceritakan pengalaman menyiapkan makan malam bersama keluarga atau teman di rumah.",
    contextHint:
      "Ceritakan apa yang Anda masak tadi malam, apa yang sedang dilakukan di dapur, dan hidangan yang disajikan.",
    keywords: ["dinner", "kitchen", "soup", "family", "delicious", "cook"],
    verbHelpers: [
      { base: "cook", past: "cooked", participle: "cooked", meaning: "memasak" },
      { base: "cut", past: "cut", participle: "cut", meaning: "memotong" },
      { base: "prepare", past: "prepared", participle: "prepared", meaning: "menyiapkan / disiapkan" },
      { base: "enjoy", past: "enjoyed", participle: "enjoyed", meaning: "menikmati" },
    ],
    missions: [
      {
        id: "m1",
        ruleId: "pastSimple",
        color: "blue",
        label: "1 kalimat memakai Past Simple (V2)",
        formula: "Subject + V2",
        example: "Last night, we cooked a special dinner for our parents.",
        tip: "Gunakan kata kerja lampau seperti cooked, helped, atau enjoyed.",
      },
      {
        id: "m2",
        ruleId: "pastContinuous",
        color: "green",
        label: "1 kalimat memakai Past Continuous (was/were + V-ing)",
        formula: "Subject + was/were + V-ing",
        example: "I was cutting the vegetables in the kitchen.",
        tip: "Ceritakan aktivitas yang sedang dilakukan di dapur.",
      },
      {
        id: "m3",
        ruleId: "pastPassive",
        color: "purple",
        label: "1 kalimat memakai Passive Voice - Past (was/were + V3)",
        formula: "Object + was/were + V3",
        example: "The delicious soup was prepared by my sister.",
        tip: "Misalnya: the soup was prepared / the table was cleaned.",
      },
    ],
    sampleStory:
      "Last night, my sister and I cooked a special dinner for our family. While I was cutting the vegetables, the warm soup was prepared by my sister. Everyone enjoyed the delicious meal together.",
    sampleTranslation:
      "Tadi malam, kakak perempuan saya dan saya memasak makan malam spesial untuk keluarga kami. Sementara saya sedang memotong sayuran, sup hangat disiapkan oleh kakak saya. Semua orang menikmati hidangan lezat itu bersama-sama.",
  },
  {
    id: "weekend-plan",
    title: "Rencana Akhir Pekan Ini (Weekend Plans)",
    level: "starter",
    scenarioPrompt:
      "Ceritakan rencana kegiatan yang akan Anda lakukan bersama teman atau keluarga akhir pekan nanti.",
    contextHint:
      "Ceritakan tempat yang akan dikunjungi, persiapan yang sudah selesai sekarang, dan kegiatan setelahnya.",
    keywords: ["weekend", "museum", "tickets", "friends", "lunch", "visit"],
    verbHelpers: [
      { base: "visit", past: "visited", participle: "visited", meaning: "mengunjungi" },
      { base: "buy", past: "bought", participle: "bought", meaning: "membeli" },
      { base: "eat", past: "ate", participle: "eaten", meaning: "makan" },
      { base: "explore", past: "explored", participle: "explored", meaning: "menjelajahi" },
    ],
    missions: [
      {
        id: "m1",
        ruleId: "futurePlan",
        color: "blue",
        label: "1 kalimat memakai Future Plan (will / be going to + V1)",
        formula: "Subject + will / am/is/are going to + V1",
        example: "This weekend, we are going to visit the city museum.",
        tip: "Gunakan will + V1 atau am/is/are going to + V1 untuk rencana Anda.",
      },
      {
        id: "m2",
        ruleId: "presentPerfect",
        color: "green",
        label: "1 kalimat memakai Present Perfect (have/has + V3)",
        formula: "Subject + have/has + V3",
        example: "I have bought the entrance tickets online.",
        tip: "Ceritakan persiapan yang sudah selesai Anda lakukan (misal: have bought / have booked).",
      },
      {
        id: "m3",
        ruleId: "timeConnector",
        color: "purple",
        label: "1 kalimat memakai Time Connector (after / before / when)",
        formula: "after / before / when + Clause",
        example: "After we explore the museum, we will eat lunch together.",
        tip: "Hubungkan urutan rencana kegiatan Anda.",
      },
    ],
    sampleStory:
      "This weekend, my friends and I are going to visit the national museum. I have bought the entrance tickets online so we do not need to wait in line. After we explore the exhibition, we will eat lunch at our favorite noodle shop.",
    sampleTranslation:
      "Akhir pekan ini, teman-teman dan saya akan mengunjungi museum nasional. Saya sudah membeli tiket masuknya secara daring sehingga kami tidak perlu mengantre. Setelah kami menjelajahi pameran, kami akan makan siang di kedai mi favorit kami.",
  },
];

const CUSTOM_SCENARIOS = (customStoriesJson as StoryScenario[]).filter(
  (s) => s && typeof s.id === "string" && Array.isArray(s.missions) && s.missions.length === 3,
);

export const ALL_STORY_SCENARIOS: StoryScenario[] = [
  ...BUILTIN_SCENARIOS,
  ...CUSTOM_SCENARIOS.filter(
    (custom) => !BUILTIN_SCENARIOS.some((b) => b.id === custom.id),
  ),
];

export const STORY_SCENARIO_TITLES: Record<string, string> = Object.fromEntries(
  ALL_STORY_SCENARIOS.map((s) => [s.id, s.title]),
);

export function filterStoryScenarios(filter: StoryFilter): StoryScenario[] {
  const matched = ALL_STORY_SCENARIOS.filter((s) => {
    if (filter.level !== "all" && s.level !== filter.level) return false;
    if (filter.scenarioId !== "all" && s.id !== filter.scenarioId) return false;
    return true;
  });
  return matched.length > 0 ? matched : ALL_STORY_SCENARIOS;
}

