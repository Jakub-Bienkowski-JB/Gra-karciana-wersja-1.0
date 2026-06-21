const STORAGE_KEY = "gra-karciana-v1-online-room";

export function createMultiplayerClient({ onEvent, getState, setState }) {
  return {
    ws: null,
    connected: false,
    roomId: null,
    player: null,
    token: null,
    players: [],
    lastError: "",
    applyingRemote: false,

    connect() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      this.ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      this.ws.addEventListener("open", () => {
        this.connected = true;
        this.lastError = "";
        onEvent({ type: "connection_changed" });
      });
      this.ws.addEventListener("close", () => {
        this.connected = false;
        onEvent({ type: "connection_changed" });
      });
      this.ws.addEventListener("error", () => {
        this.lastError = "Nie można połączyć się z serwerem multiplayer.";
        onEvent({ type: "connection_changed" });
      });
      this.ws.addEventListener("message", (event) => this.handleMessage(JSON.parse(event.data)));
    },

    createRoom() {
      this.connect();
      this.sendWhenReady({ type: "create_room" });
    },

    joinRoom(roomId) {
      this.connect();
      const saved = loadRoom();
      this.sendWhenReady({
        type: "join_room",
        roomId,
        token: saved?.roomId === roomId ? saved.token : null,
      });
    },

    publishState(action = null) {
      if (!this.roomId || this.applyingRemote) return;
      this.send({
        type: "state_update",
        state: getState(),
        action,
      });
    },

    canControl(turnPlayer) {
      return this.roomId === null || this.player === turnPlayer;
    },

    handleMessage(message) {
      if (message.type === "room_created" || message.type === "room_joined") {
        this.roomId = message.roomId;
        this.player = message.player;
        this.token = message.token;
        this.players = message.players || [];
        saveRoom({ roomId: this.roomId, token: this.token });
        if (message.state) {
          this.applyingRemote = true;
          setState(message.state);
          this.applyingRemote = false;
        }
        onEvent({ type: message.type, message });
        return;
      }

      if (message.type === "state") {
        this.players = message.players || this.players;
        if (message.player !== this.player && message.state) {
          this.applyingRemote = true;
          setState(message.state);
          this.applyingRemote = false;
        }
        onEvent({ type: "remote_state", message });
        return;
      }

      if (message.type === "peer_joined" || message.type === "peer_left") {
        this.players = message.players || [];
        onEvent({ type: message.type, message });
        return;
      }

      if (message.type === "join_rejected" || message.type === "state_rejected" || message.type === "error") {
        this.lastError = message.reason || "Błąd multiplayer.";
        onEvent({ type: "multiplayer_error", message });
        return;
      }

      onEvent({ type: message.type, message });
    },

    sendWhenReady(message) {
      const send = () => this.send(message);
      if (this.ws?.readyState === WebSocket.OPEN) send();
      else this.ws?.addEventListener("open", send, { once: true });
    },

    send(message) {
      if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(message));
    },
  };
}

function saveRoom(room) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(room));
}

function loadRoom() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}
