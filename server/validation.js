import { hasSpaceForCard, opponent } from "../src/rules.js";

const ACCEPTED_ACTIONS = new Set([
  "initial_state",
  "play_card",
  "end_turn",
  "finish_round",
  "finish_match",
]);

export function validateStateUpdate({ room, connection, state, action }) {
  if (!state || typeof state !== "object") return reject("invalid_state");
  if (!action || !ACCEPTED_ACTIONS.has(action.type)) return reject("invalid_action");
  if (!Number.isInteger(connection.data.player)) return reject("not_in_room");

  const player = connection.data.player;
  if (action.type === "initial_state") return validateInitialState({ room, player, state });
  if (!room.state) return reject("missing_initial_state");

  if (action.type === "play_card") return validatePlayCard({ previous: room.state, next: state, action, player });
  if (action.type === "end_turn") return validateEndTurn({ previous: room.state, next: state, player });
  if (action.type === "finish_round") return validateFinishRound({ previous: room.state, next: state, player });
  if (action.type === "finish_match") return validateFinishMatch({ previous: room.state, next: state, player });
  return reject("invalid_action");
}

function validateInitialState({ room, player, state }) {
  if (room.state) return reject("room_already_started");
  if (player !== 0) return reject("only_host_can_start");
  if (state.screen !== "game") return reject("invalid_initial_screen");
  if (state.botEnabled) return reject("online_bot_disabled");
  if (!Array.isArray(state.players) || state.players.length !== 2) return reject("invalid_players");
  return accept();
}

function validatePlayCard({ previous, next, action, player }) {
  if (previous.screen !== "game" || next.screen !== "game") return reject("game_not_active");
  if (previous.turnPlayer !== player) return reject("not_your_turn");
  if (action.player !== player) return reject("wrong_action_player");
  if (!Number.isInteger(action.cardUid) || !Number.isInteger(action.targetPlayer) || !Number.isInteger(action.loc)) {
    return reject("invalid_play_payload");
  }
  if (action.loc < 0 || action.loc > 2) return reject("invalid_location");
  if (action.targetPlayer !== player && action.targetPlayer !== opponent(player)) return reject("invalid_target_player");

  const actingPlayer = previous.players?.[player];
  const targetState = previous.players?.[action.targetPlayer];
  if (!actingPlayer || !targetState) return reject("invalid_players");
  if (actingPlayer.playsLeft <= 0) return reject("no_plays_left");

  const card = actingPlayer.hand?.find((item) => item.uid === action.cardUid);
  if (!card) return reject("card_not_in_hand");
  if (action.targetPlayer !== player && card.defId !== 25) return reject("enemy_target_not_allowed");
  if (!hasSpaceForCard(targetState.locations?.[action.loc] || [], card)) return reject("location_full");
  if (effectiveThreshold(previous, player, card) > previous.roundTurn) return reject("threshold_not_met");

  const nextActionSeq = Number(next.actionSeq || 0);
  const previousActionSeq = Number(previous.actionSeq || 0);
  if (nextActionSeq <= previousActionSeq) return reject("replay_not_advanced");
  return accept();
}

function validateEndTurn({ previous, next, player }) {
  if (previous.screen !== "game" || next.screen !== "game") return reject("game_not_active");
  if (previous.turnPlayer !== player) return reject("not_your_turn");
  if (next.turnPlayer === previous.turnPlayer && next.roundTurn <= previous.roundTurn) return reject("turn_not_advanced");
  return accept();
}

function validateFinishRound({ previous, next, player }) {
  if (previous.screen !== "game") return reject("game_not_active");
  if (previous.turnPlayer !== player) return reject("not_your_turn");
  if (next.screen !== "game") return reject("invalid_finish_round_state");
  if (next.matchRound <= previous.matchRound) return reject("round_not_advanced");
  return accept();
}

function validateFinishMatch({ previous, next, player }) {
  if (previous.screen !== "game") return reject("game_not_active");
  if (previous.turnPlayer !== player) return reject("not_your_turn");
  if (next.screen !== "matchEnd") return reject("match_not_finished");
  return accept();
}

function effectiveThreshold(game, player, card) {
  let value = card.baseThreshold + card.thresholdMod;
  if (card.defId === 18) value -= allBoardCards(game, player).length;
  for (const boardCard of allBoardCards(game, player)) {
    if (!boardCard.silenced && boardCard.defId === 3) value -= 1;
  }
  if (game.turnPlayer === player && game.players[player].nextThresholdBonus) {
    value -= game.players[player].nextThresholdBonus;
  }
  return Math.max(1, value);
}

function allBoardCards(game, player) {
  return game.players?.[player]?.locations?.flat() || [];
}

function accept() {
  return { ok: true };
}

function reject(reason) {
  return { ok: false, reason };
}
