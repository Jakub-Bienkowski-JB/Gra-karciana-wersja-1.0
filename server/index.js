import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { RoomStore } from "./rooms.js";
import { acceptWebSocket } from "./websocket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 3000);
const rooms = new RoomStore();

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const filePath = resolveStaticPath(url.pathname);
  if (!filePath) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "content-type": contentType(filePath),
      "cache-control": "no-cache",
    });
    response.end(data);
  });
});

server.on("upgrade", (request, socket) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname !== "/ws") {
    socket.destroy();
    return;
  }
  acceptWebSocket(request, socket, (connection) => {
    connection.onMessage = (message) => handleMessage(connection, message);
    connection.onClose = () => rooms.leave(connection);
    connection.send({ type: "hello" });
  });
});

setInterval(() => rooms.cleanup(), 1000 * 60 * 10).unref();

server.listen(port, "0.0.0.0", () => {
  console.log(`Card game server listening on http://127.0.0.1:${port}`);
  console.log("For internet play, run: cloudflared tunnel --url http://localhost:" + port);
});

function handleMessage(connection, message) {
  if (message.type === "create_room") {
    const { room, player, token } = rooms.createRoom(connection);
    connection.send({
      type: "room_created",
      roomId: room.id,
      player,
      token,
      players: rooms.playerPresence(room),
    });
    return;
  }

  if (message.type === "join_room") {
    const result = rooms.joinRoom(message.roomId, connection, message.token);
    if (result.error) {
      connection.send({ type: "join_rejected", reason: result.error });
      return;
    }
    connection.send({
      type: "room_joined",
      roomId: result.room.id,
      player: result.player,
      token: result.token,
      state: result.room.state,
      players: rooms.playerPresence(result.room),
      reconnected: Boolean(result.reconnected),
    });
    rooms.broadcast(result.room.id, {
      type: "peer_joined",
      player: result.player,
      players: rooms.playerPresence(result.room),
    });
    return;
  }

  if (message.type === "state_update") {
    const result = rooms.setState(connection, message.state, message.action || null);
    if (result.error) connection.send({ type: "state_rejected", reason: result.error });
    return;
  }

  connection.send({ type: "error", reason: "unknown_message" });
}

function resolveStaticPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const relativePath = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const fullPath = path.resolve(rootDir, relativePath);
  if (!fullPath.startsWith(rootDir)) return null;
  return fullPath;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
  }[ext] || "application/octet-stream";
}
