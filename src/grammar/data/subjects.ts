import type { Subject } from "../types";

/**
 * Subjects spanning all person/number combinations so the engine exercises
 * every subject-verb agreement branch (I/you/we/they vs he/she/it, singular
 * vs plural nouns).
 */
export const SUBJECTS: Subject[] = [
  { text: "I", person: 1, number: "singular", objectForm: "me" },
  { text: "You", person: 2, number: "singular", objectForm: "you" },
  { text: "We", person: 1, number: "plural", objectForm: "us" },
  { text: "They", person: 3, number: "plural", objectForm: "them" },
  { text: "He", person: 3, number: "singular", objectForm: "him" },
  { text: "She", person: 3, number: "singular", objectForm: "her" },
  { text: "It", person: 3, number: "singular", objectForm: "it" },

  // Noun subjects -> all 3rd person
  { text: "A pilot", person: 3, number: "singular" },
  { text: "The teacher", person: 3, number: "singular" },
  { text: "My brother", person: 3, number: "singular" },
  { text: "The dog", person: 3, number: "singular" },
  { text: "The engineer", person: 3, number: "singular" },

  { text: "The students", person: 3, number: "plural" },
  { text: "The children", person: 3, number: "plural" },
  { text: "My parents", person: 3, number: "plural" },
  { text: "The workers", person: 3, number: "plural" },
];
