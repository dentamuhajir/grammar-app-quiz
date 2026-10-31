/**
 * Normalization for answer checking. The goal is that a learner is never
 * marked wrong for harmless style differences (capitalization, extra spaces,
 * contractions, curly apostrophes), only for real grammar/word differences.
 */

/** Contraction <-> expanded pairs. We expand everything to a canonical form. */
const CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bdon't\b/g, "do not"],
  [/\bdoesn't\b/g, "does not"],
  [/\bdidn't\b/g, "did not"],
  [/\bisn't\b/g, "is not"],
  [/\baren't\b/g, "are not"],
  [/\bwasn't\b/g, "was not"],
  [/\bweren't\b/g, "were not"],
  [/\bhasn't\b/g, "has not"],
  [/\bhaven't\b/g, "have not"],
  [/\bhadn't\b/g, "had not"],
  [/\bwon't\b/g, "will not"],
  [/\bwouldn't\b/g, "would not"],
  [/\bcan't\b/g, "cannot"],
  [/\bcannot\b/g, "can not"],
  [/\bcouldn't\b/g, "could not"],
  [/\bshouldn't\b/g, "should not"],
  [/\bmustn't\b/g, "must not"],
  // subject + auxiliary contractions
  [/\bi'm\b/g, "i am"],
  [/\b(he|she|it)'s\b/g, "$1 is"],
  [/\b(you|we|they)'re\b/g, "$1 are"],
  [/\b(i|you|we|they)'ve\b/g, "$1 have"],
  [/\b(he|she|it)'s\b/g, "$1 has"], // note: 's is ambiguous (is/has); handled below
  [/\b(i|you|we|they|he|she|it)'ll\b/g, "$1 will"],
  [/\b(i|you|we|they|he|she|it)'d\b/g, "$1 had"], // 'd ambiguous (had/would)
];

/**
 * The apostrophe-s and apostrophe-d contractions are ambiguous:
 *   "she's" = "she is" OR "she has"
 *   "he'd"  = "he had" OR "he would"
 * We expand to one canonical reading; the checker also accepts the alternate
 * reading by generating variants (see expandVariants).
 */

/** Lowercase, strip punctuation, collapse whitespace. */
export function normalize(input: string): string {
  let s = input.toLowerCase().trim();
  // unify apostrophes
  s = s.replace(/[\u2018\u2019\u02bc]/g, "'");
  // expand contractions
  for (const [re, rep] of CONTRACTIONS) s = s.replace(re, rep);
  // drop punctuation except internal apostrophes already expanded
  s = s.replace(/[.,!?;:"]/g, " ");
  // normalize common abbreviation spellings
  s = s.replace(/\bp\s*\.?\s*m\.?\b/g, "pm").replace(/\ba\s*\.?\s*m\.?\b/g, "am");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/** Split a normalized string into word tokens. */
export function tokenize(normalized: string): string[] {
  return normalized.length ? normalized.split(" ") : [];
}

/**
 * Because "'s" and "'d" are ambiguous, produce alternate canonical forms of the
 * user input so an answer using "she's been" (has) still matches "she has been".
 * Returns a de-duplicated list of normalized variants of the raw input.
 */
export function expandVariants(raw: string): string[] {
  const variants = new Set<string>();
  const base = raw.toLowerCase().replace(/[\u2018\u2019\u02bc]/g, "'");

  // 's and 'd attach to any subject word (pronoun or noun: "the lesson's").
  // variant A: 's -> is, 'd -> would
  const a = base
    .replace(/(\w)'s\b/g, "$1 is")
    .replace(/(\w)'d\b/g, "$1 would");
  // variant B: 's -> has, 'd -> had
  const b = base
    .replace(/(\w)'s\b/g, "$1 has")
    .replace(/(\w)'d\b/g, "$1 had");

  variants.add(normalize(a));
  variants.add(normalize(b));
  variants.add(normalize(raw));
  return [...variants];
}
