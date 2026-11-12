# Grammar App Quiz

An interactive English grammar drill. The app shows a random **subject + cue**
(e.g. `She + work`) tagged with a **tense**, **type**, and **sentence form**.
You **type the full sentence**, and the app checks it word-by-word, celebrates
correct answers, and pinpoints exactly what went wrong when you miss.

Built with **React + Vite + TypeScript**. Fully static — no backend, no API
keys. All answer checking runs locally in the browser.

## Answer checking

- **Type and check**: enter the full sentence; press Enter to check, Enter
  again to advance.
- **Tolerant matching**: capitalization, spacing, punctuation, and contractions
  are all accepted (`don't` = `do not`, `she's been` = `she has been`).
- **Word-level diff**: wrong answers are shown with each word colored
  (correct / wrong / missing / extra) against the correct sentence.
- **Targeted hints**: rule-based hints point at the real mistake ("third-person
  singular uses *does*", "this tense needs the past participle (V3)"), derived
  from the question context — no LLM, no network call.
- Correct answers trigger a confetti burst (respects `prefers-reduced-motion`).

## What it covers

- **All 12 tenses** (present / past / future × simple / continuous / perfect / perfect continuous)
- **Three types**: Verbal (action verb), Nominal (to be + complement), Passive voice
- **Four forms**: Positive (+), Negative (−), Yes/No question (?), WH-question
- **80 verbs** with explicit V1/V2/V3/-ing/3rd-singular forms (regular + irregular)
- Subject-verb agreement across every person/number (I, he, the students, a pilot, ...)

Grammar rules enforced by the engine:

- **Passive** is built from the active sentence: the object becomes the subject
  and the doer moves to a `by ...` phrase (*The teacher explains the lesson* →
  *The lesson is explained by the teacher*). Supports + / − / ? / WH.
- **Continuous** tenses exclude **stative** verbs (no `-ing`).
- The "being" nominal form (temporary behavior) is used only with **behavioral
  adjectives** (rude, careful), never state adjectives (happy, tired).
- Perfect-continuous has **no true nominal**; it falls back to the perfect
  `been` form, with an on-screen note explaining the shift.
- Subjects are matched to verbs/complements by **entity** (a dog never becomes
  a teacher) and plural subjects get plural nouns (*they are doctors*).
- **Time signals** per tense (yesterday, for 2 hours, by 2028, ...) keep
  otherwise-identical tenses distinguishable.
- Rare-but-valid forms (e.g. `will be being`, perfect-continuous passive) and
  stative-verb traps are hidden from the random pool behind a toggle.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # type-check + static build into dist/
npm run preview    # preview the production build locally
```

## Deploy to GitHub Pages

1. Create a GitHub repo named **`grammar-app-quiz`** (the name must match
   `base` in `vite.config.ts`). To use a different name, update `base`.
2. Push to the `main` branch.
3. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) builds and publishes
   automatically on every push to `main`.

Live URL: `https://<your-username>.github.io/grammar-app-quiz/`

## Project structure

```
src/
  grammar/
    types.ts            domain types
    engine.ts           conjugation for all 12 tenses (verbal/nominal/passive)
    generator.ts        random question generator + filters + grammar rules
    labels.ts           display labels and tense ordering
    data/
      subjects.ts       subjects across person/number
      verbs.ts          80 verbs with explicit forms
      complements.ts    complements for nominal sentences
  App.tsx               UI
  index.css             styles
```

## Grammar Basics

Switch between **Sentence Practice** (the original full-sentence drill) and
**Grammar Basics** using the buttons below the title.

Grammar Basics combines curated patterns with compatible vocabulary:

- **Articles**: a/an by sound, the for an identified referent, and no article
  for general languages or plural nouns. Context is supplied where needed.
- **Prepositions**: in/on/at for time and explicit spatial contexts, plus
  expressions such as “next Monday” that need no preposition.
- **Verb Agreement**: present-simple positive, negative, and question patterns
  with varied subjects and verbs, including has, studies, and goes.
- **Singular & Plural**: counts, regular endings, and irregular/unchanged plurals.

Choose a topic or a mixed deck. Each generated variation appears once per cycle;
changing topics starts a fresh deck. Articles and prepositions use radio options
(including **∅ Tanpa kata**, an explicit no-word answer). Other topics accept a
single typed word. Feedback explains the rule in Indonesian. Revealing an answer
also shows its explanation and lets you move to the next question.

The patterns, vocabulary, and explanations live in
`src/grammar/basics/engine.ts`; topic names live in `src/grammar/labels.ts`.
New combinations should carry enough context to give an unambiguous answer.

Run `npm test` for generated-question invariants, deck coverage, targeted grammar
cases, answer normalization, and a regression check of the original sentence
checker. Run `npm run build` for TypeScript validation and the production build.

## Question & Answer

The third practice mode has two stages:

1. **Pahami pertanyaan**: identify the requested information and tense/function.
2. **Latih jawaban**: respond with a short yes/no answer or a complete positive
   sentence using the verb in the question. The answer content is your choice.

The initial generator includes 105 combinations: present simple, present
continuous, and past simple; yes/no, where, when, why, what, who (with whom), and
how (transport); and five speaker/subject perspectives. Present continuous can
also describe an arranged future activity. Filters start a fresh deck; each
question appears once per cycle. Moving from comprehension to answering keeps
the same question.

The checker in `src/grammar/qa/engine.ts` separately reports **core pattern** and
**response relevance**. It accepts recognized phrase families rather than one
exact answer: for “Where did she work?”, both “She worked at a restaurant” and
“She worked in Jakarta” pass. “She worked yesterday” has the expected core
pattern but does not supply a place. Yes/no answers must use the correct speaker
perspective, auxiliary, and polarity.

This is deliberately a bounded rule-based exercise, not a general English
proofreader. Unrecognized locations, clauses, alternative structures, or extra
sentences receive **not fully verified**, never an automatic success. A natural
fragment such as “At home” is recognized as relevant but prompts the learner to
practice a full sentence. Unknown grammar is not asserted to be wrong. Examples
are explicitly labeled as one possible answer. No user text is sent to an API.

`npm test` also checks every generated Q&A example, variable answers, malformed
patterns, ambiguous/unsupported replies, contractions, perspective, relevance,
and deck coverage.

## Sentence Practice explanations

Sentence Practice now includes Indonesian instructions, targeted feedback, and
an optional **Lihat pola & bantuan** panel. The formula uses the same auxiliary
clusters as the sentence engine, accounting for tense, positive/negative/question
form, verbal/nominal/passive mode, and the actual subject (the receiver in passive
sentences). V1/V2/V3/-ing terminology is explained in the panel.

After a correct or revealed answer, **Mengapa bentuknya begitu?** explains the
selected forms. An expandable table labels the reference sentence's subject,
auxiliaries, verb, object/complement, time phrase, and passive agent. Nominal and
stative fallback exercises explicitly explain the effective tense instead of
presenting a misleading continuous formula.

Hints use the affected grammatical slot: an object or time-expression error no
longer automatically triggers a generic tense or question-order hint. Supported
complete time phrases can move from the end to the beginning of statements
(e.g. “Yesterday, she worked …”). This is limited variation, not arbitrary word
reordering; duration phrases and mid-position adverbs are not freely moved.
Corrections also work when the learner uses a supported fronted time phrase.
