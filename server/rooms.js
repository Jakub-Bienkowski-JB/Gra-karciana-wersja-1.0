import crypto from "node:crypto";

import { validateStateUpdate } from "./validation.js";

const ROOM_TTL_MS = 1000 * 60 * 60 * 6;

export class RoomStore {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(hostConnection) {
    const roomId = this.#createRoomId();
    const token = this.#token();
    const room = {
      id: roomId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      state: null,
      players: [
        { token, connection: hostConnection },
        { token: null, connection: null },
      ],
      spectators: new Set(),
    };
    hostConnection.data.roomId = roomId;
    hostConnection.data.player = 0;
    hostConnection.data.token = token;
    this.rooms.set(roomId, room);
    return { room, player: 0, token };
  }

  joinRoom(roomId, connection, requestedToken = null) {
    const room = this.rooms.get(normalizeRoomId(roomId));
    if (!room) return { error: "room_not_found" };

    const reconnectIndex = room.players.findIndex((player) => player.token && player.token === requestedToken);
    if (reconnectIndex >= 0) {
      room.players[reconnectIndex].connection = connection;
      connection.data.roomId = room.id;
      connection.data.player = reconnectIndex;
      connection.data.token = requestedToken;
      room.updatedAt = Date.now();
      return { room, player: reconnectIndex, token: requestedToken, reconnected: true };
    }

    const emptyIndex = room.players.findIndex((player) => !player.token);
    if (emptyIndex < 0) return { error: "room_full" };

    const token = this.#token();
    room.players[emptyIndex] = { token, connection };
    connection.data.roomId = room.id;
    connection.data.player = emptyIndex;
    connection.data.token = token;
    room.updatedAt = Date.now();
    return { room, player: emptyIndex, token };
  }

  leave(connection) {
    const room = this.rooms.get(connection.data.roomId);
    if (!room) return;
    const player = room.players[connection.data.player];
    if (player?.connection === connection) player.connection = null;
    room.spectators.delete(connection);
    room.updatedAt = Date.now();
    this.broadcast(room.id, {
      type: "peer_left",
      player: connection.data.player,
      players: this.playerPresence(room),
    });
  }

  setState(connection, state, action = null) {
    const room = this.rooms.get(connection.data.roomId);
    if (!room) return { error: "room_not_found" };
    if (!room.players[connection.data.player] || room.players[connection.data.player].token !== connection.data.token) {
      return { error: "not_in_room" };
    }
    const validation = validateStateUpdate({ room, connection, state, action });
    if (!validation.ok) return { error: validation.reason };
    room.state = state;
    room.updatedAt = Date.now();
    this.broadcast(room.id, {
      type: "state",
      roomId: room.id,
      player: connection.data.player,
      action,
      state,
      players: this.playerPresence(room),
    });
    return { ok: true };
  }

  broadcast(roomId, payload) {
    const room = this.rooms.get(normalizeRoomId(roomId));
    if (!room) return;
    for (const player of room.players) player.connection?.send(payload);
    for (const spectator of room.spectators) spectator.send(payload);
  }

  playerPresence(room) {
    return room.players.map((player, index) => ({
      player: index,
      joined: Boolean(player.token),
      connected: Boolean(player.connection),
    }));
  }

  cleanup() {
    const now = Date.now();
    for (const [roomId, room] of this.rooms) {
      const connected = room.players.some((player) => player.connection) || room.spectators.size > 0;
      if (!connected && now - room.updatedAt > ROOM_TTL_MS) this.rooms.delete(roomId);
    }
  }

  #createRoomId() {
    let roomId = "";
    do {
      roomId = crypto.randomBytes(3).toString("hex").toUpperCase();
    } while (this.rooms.has(roomId));
    return roomId;
  }

  #token() {
    return crypto.randomBytes(16).toString("hex");
  }
}

export function normalizeRoomId(roomId) {
  return String(roomId || "").trim().toUpperCase();
}
