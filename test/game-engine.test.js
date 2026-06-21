import test from "node:test";
import assert from "node:assert/strict";

import { CARDS } from "../src/cards.js";
import {
  advanceTurnState,
  appendGameLog,
  beginTurnState,
  createMatchState,
  drawCardState,
  placeCardFromHandState,
  promoteExtraCardState,
  resolveRoundState,
  startRoundState,
} from "../src/game-engine.js";
import { createCardInstance } from "../src/rules.js";

function sampleDraft() {
  return [
    { main: new Set([1, 2, 3]), extra: new Set([4]) },
    { main: new Set([5, 6, 7]), extra: new Set([8]) },
  ];
}

function cloneCard(def, owner) {
  return createCardInstance(def, owner, Number(`${owner}${def.id}`));
}

test("createMatchState creates multiplayer-friendly replay fields", () => {
  const game = createMatchState({ botEnabled: true, deckDraft: sampleDraft(), starter: 1 });

  assert.equal(game.turnPlayer, 1);
  assert.equal(game.starter, 1);
  assert.deepEqual(game.actions, []);
  assert.equal(game.actionSeq, 0);
});

test("startRoundState resets players, draws opening hands and records actions", () => {
  const game = createMatchState({ botEnabled: false, deckDraft: sampleDraft(), starter: 0 });
  const cardsById = new Map(CARDS.map((card) => [card.id, card]));

  startRoundState(game, {
    cardsById,
    cloneCard,
    drawCard: (player, countForTurn) => drawCardState(game, player, { countForTurn }),
  });

  assert.equal(game.roundTurn, 1);
  assert.equal(game.players[0].hand.length, 3);
  assert.equal(game.players[1].hand.length, 3);
  assert.equal(game.actions[0].type, "start_round");
  assert.equal(game.actions.filter((action) => action.type === "draw_card").length, 6);
});

test("placeCardFromHandState records a play_card action", () => {
  const game = createMatchState({ botEnabled: false, deckDraft: sampleDraft(), starter: 0 });
  const card = cloneCard(CARDS[0], 0);
  game.players[0].hand.push(card);
  game.roundTurn = 1;
  game.turnPlayer = 0;

  placeCardFromHandState(game, { player: 0, card, targetPlayer: 0, loc: 2, lowered: false });

  assert.equal(game.players[0].hand.length, 0);
  assert.equal(game.players[0].locations[2][0].uid, card.uid);
  assert.equal(game.players[0].playsLeft, 0);
  assert.deepEqual(game.actions.at(-1), {
    seq: 1,
    matchRound: 1,
    roundTurn: 1,
    turnPlayer: 0,
    type: "play_card",
    player: 0,
    cardUid: card.uid,
    cardId: card.defId,
    cardName: card.name,
    targetPlayer: 0,
    loc: 2,
    lowered: false,
  });
});

test("advanceTurnState increments round turn after both players act", () => {
  const game = createMatchState({ botEnabled: false, deckDraft: sampleDraft(), starter: 0 });
  game.roundTurn = 1;
  game.roundStarter = 0;
  game.turnPlayer = 0;

  assert.deepEqual(advanceTurnState(game), { roundFinished: false });
  assert.equal(game.turnPlayer, 1);
  assert.equal(game.roundTurn, 1);

  assert.deepEqual(advanceTurnState(game), { roundFinished: false });
  assert.equal(game.turnPlayer, 0);
  assert.equal(game.roundTurn, 2);
});

test("resolveRoundState scores the winner and records final powers", () => {
  const game = createMatchState({ botEnabled: false, deckDraft: sampleDraft(), starter: 0 });
  const result = resolveRoundState(game, {
    locationPower: (player, loc) => player === 0 ? [5, 4, 1][loc] : [1, 3, 9][loc],
    allBoardCards: () => [],
  });

  assert.equal(result.winner, 0);
  assert.deepEqual(game.scores, [1, 0]);
  assert.equal(game.actions.at(-1).type, "finish_round");
});

test("appendGameLog can attach structured replay actions to readable logs", () => {
  const game = createMatchState({ botEnabled: false, deckDraft: sampleDraft(), starter: 0 });

  appendGameLog(game, "Gracz A pasuje.", { type: "player_note", player: 0 });

  assert.equal(game.logs[0], "Gracz A pasuje.");
  assert.equal(game.actions.at(-1).type, "player_note");
});

test("promoteExtraCardState records deck upgrades", () => {
  const game = createMatchState({ botEnabled: false, deckDraft: sampleDraft(), starter: 0 });
  const selected = CARDS.find((card) => card.id === 4);

  promoteExtraCardState(game, 0, selected);

  assert.deepEqual(game.players[0].extraPool, []);
  assert.ok(game.players[0].mainIds.includes(4));
  assert.equal(game.actions.at(-1).type, "promote_extra");
});

test("beginTurnState resets transient turn counters", () => {
  const game = createMatchState({ botEnabled: false, deckDraft: sampleDraft(), starter: 0 });
  const player = game.players[0];
  player.nextTurnExtra = 2;
  player.destroyedThisTurn = 3;
  player.drawsThisTurn = 2;
  player.servantUsed = true;
  player.flamethrowerUsed = true;

  beginTurnState(game);

  assert.equal(player.playsLeft, 3);
  assert.equal(player.nextTurnExtra, 0);
  assert.equal(player.destroyedThisTurn, 0);
  assert.equal(player.drawsThisTurn, 0);
  assert.equal(player.servantUsed, false);
  assert.equal(player.flamethrowerUsed, false);
});
