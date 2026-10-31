import type { Complement } from "../types";

/**
 * Complements for nominal (to be) sentences.
 * - Nouns carry a plural form for plural subjects (a doctor -> doctors).
 * - Adjectives are tagged behavioral vs state: only behavioral ones work with
 *   the continuous "being" form (PDF: "I am being happy" is wrong, but
 *   "he is being rude" is right).
 */
export const COMPLEMENTS: Complement[] = [
  // nouns (profession/identity) -> singular + plural
  { text: "a doctor", kind: "noun", plural: "doctors" },
  { text: "a teacher", kind: "noun", plural: "teachers" },
  { text: "an engineer", kind: "noun", plural: "engineers" },
  { text: "a student", kind: "noun", plural: "students" },
  { text: "a good leader", kind: "noun", plural: "good leaders" },

  // behavioral adjectives -> can use "being"
  { text: "careful", kind: "adjective", behavioral: true },
  { text: "rude", kind: "adjective", behavioral: true },
  { text: "noisy", kind: "adjective", behavioral: true },
  { text: "polite", kind: "adjective", behavioral: true },
  { text: "nice", kind: "adjective", behavioral: true },
  { text: "silly", kind: "adjective", behavioral: true },

  // state adjectives -> never use "being"
  { text: "happy", kind: "adjective", behavioral: false },
  { text: "tired", kind: "adjective", behavioral: false },
  { text: "busy", kind: "adjective", behavioral: false },
  { text: "sick", kind: "adjective", behavioral: false },

  // adverbs (place)
  { text: "at home", kind: "adverb" },
  { text: "in the office", kind: "adverb" },
  { text: "here", kind: "adverb" },
];

export const NOUN_COMPLEMENTS = COMPLEMENTS.filter((c) => c.kind === "noun");
export const ADJECTIVE_COMPLEMENTS = COMPLEMENTS.filter((c) => c.kind === "adjective");
export const BEHAVIORAL_ADJECTIVES = COMPLEMENTS.filter((c) => c.behavioral);
export const STATE_ADJECTIVES = COMPLEMENTS.filter(
  (c) => c.kind === "adjective" && !c.behavioral,
);
