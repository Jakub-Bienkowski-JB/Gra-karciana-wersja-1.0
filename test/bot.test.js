import test from "node:test";
import assert from "node:assert/strict";

import { CARDS } from "../src/cards.js";
import { chooseBotCard, chooseBotExtra, chooseBotTarget } from "../src/bot.js";
import { createCardInstance } from "../src/rules.js";

function instance(id, uid = id) {
  return createCardInstance(CARDS.find((card) => card.id === id), 1, uid);
}

test("chooseBotCard values useful effects, not only raw power", () => {
  const drawCard = instance(1);
  const negativeCard = instance(21);

  const selected = chooseBotCard([negativeCard, drawCard], () => true, () => 1);

  assert.equal(selected.defId, 1);
});

test("chooseBotTarget prefers a location that can be flipped", () => {
  const card = instance(5);
  const target = chooseBotTarget(card, {
    player: 1,
    enemy: 0,
    locations: [0, 1, 2],
    canPlayOwn: () => true,
    canPlayEnemy: () => false,
    ownPower: (loc) => [0, 6, 1][loc],
    enemyPower: (loc) => [1, 2, 8][loc],
  });

  assert.equal(target.player, 1);
  assert.equal(target.loc, 0);
});

test("chooseBotTarget sends negative special cards to enemy locations", () => {
  const card = instance(25);
  const target = chooseBotTarget(card, {
    player: 1,
    enemy: 0,
    locations: [0],
    canPlayOwn: () => true,
    canPlayEnemy: () => true,
    ownPower: () => 0,
    enemyPower: () => 5,
  });

  assert.equal(target.player, 0);
});

test("chooseBotExtra considers effect value during upgrades", () => {
  const selected = chooseBotExtra([
    CARDS.find((card) => card.id === 21),
    CARDS.find((card) => card.id === 10),
  ]);

  assert.equal(selected.id, 10);
});
