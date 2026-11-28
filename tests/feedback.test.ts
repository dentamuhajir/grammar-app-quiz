import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.browser";
import { DiffView } from "../src/ui/DiffView";
import { SuccessBadge } from "../src/ui/FeedbackIcons";
import { checkAnswer } from "../src/grammar/check";
import type { Question } from "../src/grammar/types";

test("correction immediately shows both the user answer and the complete reference", () => {
  const q: Question = { tense: "presentContinuous", mode: "nominal", form: "negative",
    subject: { text: "the children", number: "plural", person: 3, entity: "person" },
    complement: { text: "careful", kind: "adjective" }, answer: "The children are not being careful right now." };
  const result = checkAnswer(q, "the children being care right now");
  assert.equal(result.correct, false);
  const markup = renderToStaticMarkup(createElement(DiffView, { diff: result.diff }));
  assert.match(markup, /Jawabanmu/);
  assert.match(markup, /Acuan/);
  assert.match(markup, /care: periksa kata ini/);
  for (const word of ["are", "not", "careful"]) assert.ok(markup.includes(`>${word}</span>`), markup);
  assert.doesNotMatch(markup, /Ada kata yang kurang|diff-legend|dw-gap/);
  assert.match(markup, /dw-match">the/);
});

test("success trophy is decorative", () => {
  const icon = renderToStaticMarkup(createElement(SuccessBadge));
  assert.match(icon, /success-trophy/);
  assert.match(icon, /aria-hidden="true"/);
});

