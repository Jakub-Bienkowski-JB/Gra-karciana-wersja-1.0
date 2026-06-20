import test from "node:test";
import assert from "node:assert/strict";

import { CARDS } from "../src/cards.js";
import {
  cardsWithKeyword,
  keywordLabelsForCard,
  keywordsForCard,
  missingEffectDefinitions,
} from "../src/effects.js";

test("every card has effect keyword metadata", () => {
  assert.deepEqual(missingEffectDefinitions(CARDS), []);
});

test("keyword helpers expose card mechanics for future deck tools", () => {
  const drawCards = cardsWithKeyword(CARDS, "draw");
  const goblin = CARDS.find((card) => card.id === 1);

  assert.ok(drawCards.some((card) => card.id === 1));
  assert.deepEqual(keywordsForCard(goblin), ["draw"]);
  assert.deepEqual(keywordLabelsForCard(goblin), ["Dobieranie"]);
});
