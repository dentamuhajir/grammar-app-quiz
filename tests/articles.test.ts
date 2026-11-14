import assert from "node:assert/strict";
import test from "node:test";
import {
  ARTICLE_POOL,
  ARTICLE_TITLES,
  checkFindFixCorrection,
  checkParagraphBreakdown,
  createArticleDeck,
  findFixMistakeHint,
  findFixSpanFeedback,
  type ArticleId,
} from "../src/grammar/articles/engine";

function byId(id: string) {
  const q = ARTICLE_POOL.find((item) => item.id === id);
  assert.ok(q, id);
  return q;
}

test("all article questions have valid structure, hints, explanations, and unique IDs", () => {
  assert.equal(new Set(ARTICLE_POOL.map((q) => q.id)).size, ARTICLE_POOL.length);

  for (const q of ARTICLE_POOL) {
    assert.ok(q.hint.length > 15, q.id);
    assert.ok(q.explanation.length > 20, q.id);
    assert.ok(q.spokenSentence.trim().length > 10, q.id);

    if (q.kind === "breakdown") {
      assert.ok(q.sentences.length >= 2, q.id);
      assert.ok(q.tagBank.length >= 6, q.id);
      const exactSelections: Record<string, readonly string[]> = {};
      for (const s of q.sentences) {
        assert.ok(s.expectedTags.length >= 1, `${q.id}:${s.id}`);
        assert.equal(s.evidence.length, s.expectedTags.length, `${q.id}:${s.id}`);
        for (const tag of s.expectedTags) {
          assert.ok(q.tagBank.includes(tag), `${q.id} missing tag ${tag} in bank`);
        }
        exactSelections[s.id] = [...s.expectedTags].reverse();
      }
      const res = checkParagraphBreakdown(q, exactSelections);
      assert.equal(res.status, "correct", q.id);
    } else {
      const spanIds = q.segments
        .map((s) => s.spanId)
        .filter((s): s is string => Boolean(s));
      assert.ok(spanIds.includes(q.errorSpanId), q.id);
      assert.ok(spanIds.length >= 3, q.id);
      const errSeg = q.segments.find((s) => s.spanId === q.errorSpanId);
      assert.equal(errSeg?.text, q.wrongText, q.id);
      assert.equal(checkFindFixCorrection(q, q.correction), "correct", q.id);
      assert.equal(checkFindFixCorrection(q, q.wrongText), "incorrect", q.id);
    }
  }
});

test("article deck filters by mode and articleId without repeating boundary item", () => {
  const allDeck = createArticleDeck({ mode: "all", articleId: "all" });
  assert.equal(allDeck.length, ARTICLE_POOL.length);

  const bdDeck = createArticleDeck({ mode: "breakdown", articleId: "all" });
  assert.ok(bdDeck.length > 0);
  assert.ok(bdDeck.every((q) => q.kind === "breakdown"));

  const ffDeck = createArticleDeck({ mode: "findFix", articleId: "all" });
  assert.ok(ffDeck.length > 0);
  assert.ok(ffDeck.every((q) => q.kind === "findFix"));

  for (const articleId of Object.keys(ARTICLE_TITLES) as ArticleId[]) {
    const deck = createArticleDeck({ mode: "all", articleId });
    assert.ok(deck.length >= 3, articleId);
    assert.ok(deck.every((q) => q.articleId === articleId), articleId);
    for (let i = 0; i < 15; i++) {
      assert.notEqual(
        createArticleDeck({ mode: "all", articleId }, deck[0].id)[0].id,
        deck[0].id,
      );
    }
  }
});

test("dynamic error rotation mutates only one span per card in the same paragraph", () => {
  const passiveCard = byId("bali-ff-passive");
  const growingCard = byId("bali-ff-growing");
  assert.equal(passiveCard.kind, "findFix");
  assert.equal(growingCard.kind, "findFix");

  // On passiveCard, span "err" is wrong ("can be find") while "ok1" is clean ("are growing")
  assert.equal(
    passiveCard.segments.find((s) => s.spanId === "err")?.text,
    "can be find",
  );
  assert.equal(
    passiveCard.segments.find((s) => s.spanId === "ok1")?.text,
    "are growing",
  );

  // On growingCard (same paragraph!), span "err" is clean ("can be found") while "ok1" is mutated ("are grow")
  assert.equal(
    growingCard.segments.find((s) => s.spanId === "err")?.text,
    "can be found",
  );
  assert.equal(
    growingCard.segments.find((s) => s.spanId === "ok1")?.text,
    "are grow",
  );
});

test("paragraph tag breakdown and find-fix questions provide targeted trap feedback", () => {
  const baliBd = byId("bali-bd-1");
  assert.equal(baliBd.kind, "breakdown");

  // Incomplete check when a sentence is missing tags
  const incomplete = checkParagraphBreakdown(baliBd, {
    s1: ["Present Simple Nominal"],
  });
  assert.equal(incomplete.status, "incomplete");

  // Wrong trap tag on sentence 3 ("Present Continuous" instead of "Verb + Gerund")
  const trapRes = checkParagraphBreakdown(baliBd, {
    s1: ["Present Simple Nominal", "Superlative"],
    s2: ["Present Simple Passive"],
    s3: ["Modal + V1 (Active)", "Present Continuous"],
  });
  assert.equal(trapRes.status, "incorrect");
  assert.equal(trapRes.perSentence.s1.correct, true);
  assert.equal(trapRes.perSentence.s2.correct, true);
  assert.equal(trapRes.perSentence.s3.correct, false);
  assert.match(trapRes.message, /Verb \+ Gerund/);

  const baliFix = byId("bali-ff-passive");
  assert.equal(baliFix.kind, "findFix");
  assert.equal(checkFindFixCorrection(baliFix, "  "), "empty");
  assert.equal(checkFindFixCorrection(baliFix, "  CAN  BE  FOUND "), "correct");
  assert.match(findFixSpanFeedback(baliFix, "ok1"), /sudah benar/);
  assert.match(findFixMistakeHint(baliFix, "can be find"), /masih salah/);

  const agreementFix = byId("bali-ff-agreement");
  assert.equal(agreementFix.kind, "findFix");
  assert.equal(checkFindFixCorrection(agreementFix, "tourists want"), "correct");
  assert.equal(checkFindFixCorrection(agreementFix, "tourist wants"), "correct");
});
