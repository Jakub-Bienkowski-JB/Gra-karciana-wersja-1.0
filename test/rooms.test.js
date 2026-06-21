import test from "node:test";
import assert from "node:assert/strict";

import { RoomStore } from "../server/rooms.js";

function connection() {
  return {
    data: {},
    sent: [],
    send(message) {
      this.sent.push(message);
    },
  };
}

function gameState(overrides = {}) {
  return {
    screen: "game",
    matchRound: 1,
    roundTurn: 1,
    turnPlayer: 0,
    starter: 0,
    roundStarter: 0,
    scores: [0, 0],
    logs: [],
    actions: [],
    actionSeq: 1,
    botEnabled: false,
    players: [
      {
        hand: [{ uid: 10, defId: 1, baseThreshold: 1, thresholdMod: 0, silenced: false, name: "Test", powerMod: 0 }],
        deck: [],
        grave: [],
        locations: [[], [], []],
        locBonus: [0, 0, 0],
        playsLeft: 1,
        nextThresholdBonus: 0,
      },
      {
        hand: [],
        deck: [],
        grave: [],
        locations: [[], [], []],
        locBonus: [0, 0, 0],
        playsLeft: 1,
        nextThresholdBonus: 0,
      },
    ],
    ...overrides,
  };
}

test("RoomStore creates a room and assigns host as player A", () => {
  const rooms = new RoomStore();
  const host = connection();
  const result = rooms.createRoom(host);

  assert.equal(result.player, 0);
  assert.equal(result.room.id.length, 6);
  assert.equal(host.data.player, 0);
  assert.equal(host.data.roomId, result.room.id);
});

test("RoomStore lets second player join and receive player B", () => {
  const rooms = new RoomStore();
  const host = connection();
  const guest = connection();
  const created = rooms.createRoom(host);
  const joined = rooms.joinRoom(created.room.id, guest);

  assert.equal(joined.player, 1);
  assert.equal(guest.data.player, 1);
  assert.equal(rooms.playerPresence(created.room)[1].connected, true);
});

test("RoomStore rejects a third active player", () => {
  const rooms = new RoomStore();
  const host = connection();
  const guest = connection();
  const third = connection();
  const created = rooms.createRoom(host);
  rooms.joinRoom(created.room.id, guest);

  assert.deepEqual(rooms.joinRoom(created.room.id, third), { error: "room_full" });
});

test("RoomStore stores state updates and broadcasts them", () => {
  const rooms = new RoomStore();
  const host = connection();
  const guest = connection();
  const created = rooms.createRoom(host);
  rooms.joinRoom(created.room.id, guest);

  const result = rooms.setState(host, gameState(), { type: "initial_state" });

  assert.deepEqual(result, { ok: true });
  assert.equal(created.room.state.screen, "game");
  assert.equal(host.sent.at(-1).type, "state");
  assert.equal(guest.sent.at(-1).type, "state");
});

test("RoomStore rejects action before initial state", () => {
  const rooms = new RoomStore();
  const host = connection();
  rooms.createRoom(host);

  const result = rooms.setState(host, gameState({ turnPlayer: 1 }), { type: "end_turn" });

  assert.deepEqual(result, { error: "missing_initial_state" });
});

test("RoomStore rejects updates from the wrong turn player", () => {
  const rooms = new RoomStore();
  const host = connection();
  const guest = connection();
  const created = rooms.createRoom(host);
  rooms.joinRoom(created.room.id, guest);
  rooms.setState(host, gameState(), { type: "initial_state" });

  const result = rooms.setState(guest, gameState({ turnPlayer: 0 }), { type: "end_turn" });

  assert.deepEqual(result, { error: "not_your_turn" });
});

test("RoomStore accepts legal play_card updates", () => {
  const rooms = new RoomStore();
  const host = connection();
  const created = rooms.createRoom(host);
  rooms.setState(host, gameState(), { type: "initial_state" });

  const next = gameState({
    actionSeq: 2,
    players: [
      {
        ...gameState().players[0],
        hand: [],
        locations: [[{ uid: 10, defId: 1, baseThreshold: 1, thresholdMod: 0, silenced: false, name: "Test", powerMod: 0 }], [], []],
        playsLeft: 0,
      },
      gameState().players[1],
    ],
  });
  const result = rooms.setState(host, next, { type: "play_card", player: 0, cardUid: 10, targetPlayer: 0, loc: 0 });

  assert.deepEqual(result, { ok: true });
  assert.equal(created.room.state.actionSeq, 2);
});

test("RoomStore rejects illegal play_card target", () => {
  const rooms = new RoomStore();
  const host = connection();
  rooms.createRoom(host);
  rooms.setState(host, gameState(), { type: "initial_state" });

  const result = rooms.setState(host, gameState({ actionSeq: 2 }), {
    type: "play_card",
    player: 0,
    cardUid: 10,
    targetPlayer: 1,
    loc: 0,
  });

  assert.deepEqual(result, { error: "enemy_target_not_allowed" });
});

test("RoomStore reconnects a known token to the same player", () => {
  const rooms = new RoomStore();
  const host = connection();
  const created = rooms.createRoom(host);
  const replacement = connection();

  const result = rooms.joinRoom(created.room.id, replacement, created.token);

  assert.equal(result.reconnected, true);
  assert.equal(result.player, 0);
  assert.equal(replacement.data.player, 0);
});
