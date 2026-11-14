import assert from "node:assert/strict";
import test from "node:test";
import {
  ARTICLE_POOL,
  ARTICLE_TITLES,
  checkBreakdownAnswer,
  checkFindFixCorrection,
  createArticleDeck,
  findFixMistakeHint,
  findFixSpanFeedback,
  spotTapFeedback,
  type ArticleId,
} from "../src/grammar/articles/engine";

function byId(id: string) {
  const q = ARTICLE_POOL.find((item) => item.id === id);
  assert.ok(q, id);
  return q;
}

test("all article questions have valid segments, hints, explanations, and unique IDs", () => {
  assert.equal(new Set(ARTICLE_POOL.map((q) => q.id)).size, ARTICLE_POOL.length);

  for (const q of ARTICLE_POOL) {
    assert.ok(q.hint.length > 15, q.id);
    assert.ok(q.explanation.length > 20, q.id);
    assert.ok(q.spokenSentence.trim().length > 10, q.id);

    const spanIds = q.segments
      .map((s) => s.spanId)
      .filter((s): s is string => Boolean(s));

    if (q.kind === "diagnose") {
      assert.ok(spanIds.includes(q.targetSpanId), q.id);
      assert.ok(q.options && q.options.length === 4, q.id);
      assert.ok(q.options.includes(q.answer), q.id);
      assert.equal(checkBreakdownAnswer(q, q.answer), "correct", q.id);
    } else if (q.kind === "spot") {
      assert.ok(spanIds.includes(q.targetSpanId), q.id);
      assert.ok(spanIds.length >= 3, q.id);
      assert.equal(checkBreakdownAnswer(q, q.targetSpanId), "correct", q.id);
      for (const extra of q.acceptedSpanIds ?? []) {
        assert.ok(spanIds.includes(extra), q.id);
        assert.equal(checkBreakdownAnswer(q, extra), "correct", q.id);
      }
    } else {
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
  assert.ok(bdDeck.every((q) => q.kind !== "findFix"));

  const ffDeck = createArticleDeck({ mode: "findFix", articleId: "all" });
  assert.ok(ffDeck.length > 0);
  assert.ok(ffDeck.every((q) => q.kind === "findFix"));

  for (const articleId of Object.keys(ARTICLE_TITLES) as ArticleId[]) {
    const deck = createArticleDeck({ mode: "all", articleId });
    assert.ok(deck.length >= 4, articleId);
    assert.ok(deck.every((q) => q.articleId === articleId), articleId);
    for (let i = 0; i < 15; i++) {
      assert.notEqual(
        createArticleDeck({ mode: "all", articleId }, deck[0].id)[0].id,
        deck[0].id,
      );
    }
  }
});

test("bali breakdown and find-fix questions provide accurate feedback", () => {
  const passive = byId("bali-bd-passive");
  assert.equal(passive.kind, "diagnose");
  assert.equal(checkBreakdownAnswer(passive, "Present Simple Passive"), "correct");
  assert.equal(checkBreakdownAnswer(passive, "Present Continuous"), "incorrect");

  const spotModalPassive = byId("bali-spot-modal-passive");
  assert.equal(spotModalPassive.kind, "spot");
  assert.equal(checkBreakdownAnswer(spotModalPassive, "found"), "correct");
  assert.equal(checkBreakdownAnswer(spotModalPassive, "growing"), "incorrect");
  assert.match(spotTapFeedback(spotModalPassive, "growing"), /Present Continuous/);

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

