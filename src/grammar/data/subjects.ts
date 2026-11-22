import type { Subject } from "../types";

/**
 * Subjects spanning every person/number so the engine exercises all
 * subject-verb agreement branches. `entity` prevents nonsense pairings
 * (e.g. a dog becoming a teacher). Text preserves proper names so the
 * renderer can capitalize only the first word of a sentence.
 */
export const SUBJECTS: Subject[] = [
  { text: "I", person: 1, number: "singular", entity: "person", objectForm: "me" },
  { text: "you", person: 2, number: "singular", entity: "person", objectForm: "you" },
  { text: "we", person: 1, number: "plural", entity: "person", objectForm: "us" },
  { text: "they", person: 3, number: "plural", entity: "person", objectForm: "them" },
  { text: "he", person: 3, number: "singular", entity: "person", objectForm: "him" },
  { text: "she", person: 3, number: "singular", entity: "person", objectForm: "her" },
  { text: "it", person: 3, number: "singular", entity: "thing", objectForm: "it" },

  // Noun subjects -> all 3rd person
  { text: "a pilot", person: 3, number: "singular", entity: "person" },
  { text: "the teacher", person: 3, number: "singular", entity: "person" },
  { text: "my brother", person: 3, number: "singular", entity: "person" },
  { text: "the engineer", person: 3, number: "singular", entity: "person" },
  { text: "the dog", person: 3, number: "singular", entity: "animal" },

  { text: "the students", person: 3, number: "plural", entity: "person" },
  { text: "the children", person: 3, number: "plural", entity: "person" },
  { text: "my parents", person: 3, number: "plural", entity: "person" },
  { text: "the workers", person: 3, number: "plural", entity: "person" },

  { text: "Emma", person: 3, number: "singular", entity: "person" },
  { text: "James", person: 3, number: "singular", entity: "person" },
  { text: "Olivia", person: 3, number: "singular", entity: "person" },
  { text: "Daniel", person: 3, number: "singular", entity: "person" },
  { text: "Emma and James", person: 3, number: "plural", entity: "person" },
  { text: "Olivia and Daniel", person: 3, number: "plural", entity: "person" },
  { text: "James and Olivia", person: 3, number: "plural", entity: "person" },

  { text: "the boy with two dogs", head: "boy", person: 3, number: "singular", entity: "person" },
  { text: "the teacher near the windows", head: "teacher", person: 3, number: "singular", entity: "person" },
  { text: "the girl with the red bag", head: "girl", person: 3, number: "singular", entity: "person" },
  { text: "the students in this class", head: "students", person: 3, number: "plural", entity: "person" },
  { text: "the children near the door", head: "children", person: 3, number: "plural", entity: "person" },
  { text: "the workers in the office", head: "workers", person: 3, number: "plural", entity: "person" },

  { text: "the phone", person: 3, number: "singular", entity: "thing" },
  { text: "the computer", person: 3, number: "singular", entity: "thing" },
  { text: "the machines", person: 3, number: "plural", entity: "thing" },
];

/** Person subjects only (used for passive "by ..." agents). */
export const PERSON_SUBJECTS = SUBJECTS.filter((s) => s.entity === "person");
