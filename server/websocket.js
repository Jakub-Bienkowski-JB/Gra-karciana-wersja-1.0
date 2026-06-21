import crypto from "node:crypto";

const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

export function acceptWebSocket(request, socket, onConnection) {
  const key = request.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }

  const accept = crypto.createHash("sha1").update(`${key}${WS_GUID}`).digest("base64");
  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "",
    "",
  ].join("\r\n"));

  const connection = createConnection(socket);
  onConnection(connection, request);
}

function createConnection(socket) {
  const connection = {
    socket,
    alive: true,
    data: {},
    send(payload) {
      if (socket.destroyed) return;
      const text = JSON.stringify(payload);
      socket.write(encodeFrame(Buffer.from(text)));
    },
    close() {
      if (!socket.destroyed) socket.end();
    },
    onMessage: null,
    onClose: null,
  };

  let buffer = Buffer.alloc(0);

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length) {
      const parsed = decodeFrame(buffer);
      if (!parsed) break;
      buffer = buffer.subarray(parsed.bytes);
      if (parsed.opcode === 0x8) {
        connection.close();
        return;
      }
      if (parsed.opcode === 0x9) {
        socket.write(encodeFrame(parsed.payload, 0xA));
        continue;
      }
      if (parsed.opcode !== 0x1) continue;
      try {
        connection.onMessage?.(JSON.parse(parsed.payload.toString("utf8")));
      } catch {
        connection.send({ type: "error", reason: "invalid_json" });
      }
    }
  });

  socket.on("close", () => connection.onClose?.());
  socket.on("error", () => connection.onClose?.());

  return connection;
}

function decodeFrame(buffer) {
  if (buffer.length < 2) return null;

  const first = buffer[0];
  const second = buffer[1];
  const opcode = first & 0x0f;
  const masked = Boolean(second & 0x80);
  let length = second & 0x7f;
  let offset = 2;

  if (length === 126) {
    if (buffer.length < offset + 2) return null;
    length = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    if (buffer.length < offset + 8) return null;
    const high = buffer.readUInt32BE(offset);
    const low = buffer.readUInt32BE(offset + 4);
    length = high * 2 ** 32 + low;
    offset += 8;
  }

  let mask = null;
  if (masked) {
    if (buffer.length < offset + 4) return null;
    mask = buffer.subarray(offset, offset + 4);
    offset += 4;
  }

  if (buffer.length < offset + length) return null;
  const payload = Buffer.from(buffer.subarray(offset, offset + length));
  if (mask) {
    for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
  }

  return { opcode, payload, bytes: offset + length };
}

function encodeFrame(payload, opcode = 0x1) {
  const length = payload.length;
  let header;

  if (length < 126) {
    header = Buffer.alloc(2);
    header[1] = length;
  } else if (length < 65536) {
    header = Buffer.alloc(4);
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 127;
    header.writeUInt32BE(0, 2);
    header.writeUInt32BE(length, 6);
  }

  header[0] = 0x80 | opcode;
  return Buffer.concat([header, payload]);
}
