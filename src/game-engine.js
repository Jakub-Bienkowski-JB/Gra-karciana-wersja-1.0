import { evaluateRoundWinner, moveCardToPrivateZone, opponent, playerName, shuffle } from "./rules.js";

export function createMatchState({ botEnabled, deckDraft, starter }) {
  return {
    screen: "game",
    matchRound: 1,
    roundTurn: 0,
    turnPlayer: starter,
    starter,
    roundStarter: 0,
    scores: [0, 0],
    logs: [],
    actions: [],
    actionSeq: 0,
    botEnabled,
    players: [createMatchPlayerState(deckDraft[0]), createMatchPlayerState(deckDraft[1])],
  };
}

export function createMatchPlayerState(draft) {
  return {
    mainIds: [...draft.main],
    extraPool: [...draft.extra],
    deck: [],
    hand: [],
    grave: [],
    locations: [[], [], []],
    locBonus: [0, 0, 0],
    playsLeft: 1,
    nextTurnExtra: 0,
    nextThresholdBonus: 0,
    destroyedThisTurn: 0,
    servantUsed: false,
    flamethrowerUsed: false,
    drawsThisTurn: 0,
  };
}

export function ensureReplayState(game) {
  game.actions ??= [];
  game.actionSeq ??= game.actions.length;
  return game;
}

export function recordGameAction(game, action) {
  ensureReplayState(game);
  const entry = {
    seq: ++game.actionSeq,
    matchRound: game.matchRound,
    roundTurn: game.roundTurn,
    turnPlayer: game.turnPlayer,
    ...action,
  };
  game.actions.push(entry);
  return entry;
}

export function appendGameLog(game, text, action = null) {
  game.logs.unshift(text);
  game.logs = game.logs.slice(0, 80);
  if (action) recordGameAction(game, action);
}

export function trimReplay(game, limit = 500) {
  ensureReplayState(game);
  if (game.actions.length > limit) game.actions = game.actions.slice(-limit);
}

export function startRoundState(game, { cardsById, cloneCard, drawCard }) {
  game.roundTurn = 1;
  game.turnPlayer = game.matchRound % 2 === 1 ? game.starter : opponent(game.starter);
  game.roundStarter = game.turnPlayer;
  recordGameAction(game, {
    type: "start_round",
    starter: game.roundStarter,
  });
  game.players.forEach((player, index) => {
    resetPlayerForRound(player);
    player.deck = shuffle(player.mainIds.map((id) => cloneCard(cardsById.get(id), index)));
    for (let i = 0; i < 3; i++) drawCard(index, false);
  });
}

export function resetPlayerForRound(player) {
  player.hand = [];
  player.grave = [];
  player.locations = [[], [], []];
  player.locBonus = [0, 0, 0];
  player.playsLeft = 1;
  player.nextTurnExtra = 0;
  player.nextThresholdBonus = 0;
  player.destroyedThisTurn = 0;
  player.servantUsed = false;
  player.flamethrowerUsed = false;
  player.drawsThisTurn = 0;
}

export function beginTurnState(game) {
  const player = game.players[game.turnPlayer];
  player.playsLeft = 1 + player.nextTurnExtra;
  player.nextTurnExtra = 0;
  player.drawsThisTurn = 0;
  player.destroyedThisTurn = 0;
  player.servantUsed = false;
  player.flamethrowerUsed = false;
  recordGameAction(game, {
    type: "begin_turn",
    player: game.turnPlayer,
    playsLeft: player.playsLeft,
  });
}

export function placeCardFromHandState(game, { player, card, targetPlayer, loc, lowered }) {
  const activePlayer = game.players[player];
  activePlayer.hand = activePlayer.hand.filter((item) => item.uid !== card.uid);
  card.owner = targetPlayer;
  card.controller = targetPlayer;
  game.players[targetPlayer].locations[loc].push(card);
  activePlayer.playsLeft--;
  if (activePlayer.nextThresholdBonus) activePlayer.nextThresholdBonus = 0;
  recordGameAction(game, {
    type: "play_card",
    player,
    cardUid: card.uid,
    cardId: card.defId,
    cardName: card.name,
    targetPlayer,
    loc,
    lowered: Boolean(lowered),
  });
}

export function advanceTurnState(game) {
  if (game.turnPlayer === opponent(game.roundStarter)) game.roundTurn++;
  if (game.roundTurn > 6) {
    recordGameAction(game, { type: "round_should_finish" });
    return { roundFinished: true };
  }
  game.turnPlayer = opponent(game.turnPlayer);
  recordGameAction(game, {
    type: "end_turn",
    nextPlayer: game.turnPlayer,
    nextRoundTurn: game.roundTurn,
  });
  return { roundFinished: false };
}

export function resolveRoundState(game, { locationPower, allBoardCards }) {
  const powersA = [0, 1, 2].map((loc) => locationPower(0, loc));
  const powersB = [0, 1, 2].map((loc) => locationPower(1, loc));
  const winner = evaluateRoundWinner(powersA, powersB, allBoardCards(0).length, allBoardCards(1).length);
  if (winner !== null) game.scores[winner]++;
  recordGameAction(game, {
    type: "finish_round",
    winner,
    powers: [powersA, powersB],
    scores: [...game.scores],
  });
  return { winner, powersA, powersB };
}

export function shouldFinishMatch(game) {
  return game.scores[0] >= 3 || game.scores[1] >= 3 || game.matchRound >= 4;
}

export function promoteExtraCardState(game, player, selected) {
  const state = game.players[player];
  state.extraPool = state.extraPool.filter((id) => id !== selected.id);
  state.mainIds.push(selected.id);
  recordGameAction(game, {
    type: "promote_extra",
    player,
    cardId: selected.id,
    cardName: selected.name,
  });
}

export function drawCardState(game, player, { countForTurn = true } = {}) {
  const state = game.players[player];
  const card = state.deck.shift();
  if (!card) return null;
  state.hand.push(moveCardToPrivateZone(card, player));
  if (countForTurn) state.drawsThisTurn++;
  recordGameAction(game, {
    type: "draw_card",
    player,
    cardUid: card.uid,
    cardId: card.defId,
    countForTurn,
  });
  return card;
}

export function matchResultText(game) {
  if (game.scores[0] === game.scores[1]) return "Mecz kończy się remisem.";
  return `${playerName(game.scores[0] > game.scores[1] ? 0 : 1)} wygrywa mecz.`;
}
