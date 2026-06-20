import test from "node:test";
import assert from "node:assert/strict";

import { CARDS, CARD_IMAGES } from "../src/cards.js";
import {
  cardImagePath,
  createCardInstance,
  evaluateRoundWinner,
  filterAndSortCards,
  hasSpaceForCard,
  moveCardToPrivateZone,
  resetCardEffects,
  shuffle,
} from "../src/rules.js";

test("filterAndSortCards filters by text and tag", () => {
  const result = filterAndSortCards(CARDS, { query: "dobierz", tag: "play", sort: "threshold" });

  assert.ok(result.length > 0);
  assert.ok(result.every((card) => card.tags.includes("play")));
  assert.ok(result.every((card) => `${card.name} ${card.text}`.toLowerCase().includes("dobierz")));
  assert.equal(result[0].threshold <= result.at(-1).threshold, true);
});

test("cardImagePath encodes localized file names", () => {
  assert.equal(cardImagePath(1, CARD_IMAGES), "ikony/S%C5%82odki%20Goblin.png");
});

test("hasSpaceForCard respects four slots and giant cards", () => {
  const giant = createCardInstance(CARDS.find((card) => card.id === 14), 0, 1);
  const small = createCardInstance(CARDS.find((card) => card.id === 1), 0, 2);

  assert.equal(hasSpaceForCard([], giant), true);
  assert.equal(hasSpaceForCard([small], giant), false);
  assert.equal(hasSpaceForCard([small, small, small], small), true);
  assert.equal(hasSpaceForCard([small, small, small, small], small), false);
});

test("resetCardEffects clears temporary board modifiers", () => {
  const card = createCardInstance(CARDS[0], 0, 1);
  card.powerMod = 3;
  card.thresholdMod = -1;
  card.silenced = true;

  resetCardEffects(card);

  assert.equal(card.powerMod, 0);
  assert.equal(card.thresholdMod, 0);
  assert.equal(card.silenced, false);
});

test("moveCardToPrivateZone resets control and owner", () => {
  const card = createCardInstance(CARDS[0], 0, 1);
  card.controller = 1;
  card.powerMod = 2;

  moveCardToPrivateZone(card, 1);

  assert.equal(card.owner, 1);
  assert.equal(card.controller, 1);
  assert.equal(card.powerMod, 0);
});

test("evaluateRoundWinner uses locations, then total power, then fewer cards", () => {
  assert.equal(evaluateRoundWinner([5, 2, 1], [1, 3, 0], 5, 5), 0);
  assert.equal(evaluateRoundWinner([2, 2, 2], [2, 2, 2], 4, 6), 0);
  assert.equal(evaluateRoundWinner([2, 2, 2], [2, 2, 2], 5, 5), null);
});

test("shuffle can be deterministic for tests", () => {
  const result = shuffle([1, 2, 3], () => 0);

  assert.deepEqual(result, [2, 3, 1]);
});
