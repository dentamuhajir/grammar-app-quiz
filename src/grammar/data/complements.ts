import type { Complement } from "../types";

/**
 * Complements for nominal (to be) sentences. Adjectives can also feed the
 * "being + adjective" temporary-behavior form used by continuous tenses.
 */
export const COMPLEMENTS: Complement[] = [
  { text: "a doctor", kind: "noun" },
  { text: "a teacher", kind: "noun" },
  { text: "an engineer", kind: "noun" },
  { text: "a student", kind: "noun" },
  { text: "a good leader", kind: "noun" },

  { text: "happy", kind: "adjective" },
  { text: "tired", kind: "adjective" },
  { text: "busy", kind: "adjective" },
  { text: "careful", kind: "adjective" },
  { text: "rude", kind: "adjective" },
  { text: "noisy", kind: "adjective" },
  { text: "polite", kind: "adjective" },

  { text: "at home", kind: "adverb" },
  { text: "in the office", kind: "adverb" },
  { text: "here", kind: "adverb" },
];
