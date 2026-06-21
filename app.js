import { CARDS, TOKENS, OPTIMIZED_CARD_IMAGES, TAG_LABELS } from './src/cards.js';
import {
  cardPowerPreview as botCardPowerPreview,
  chooseBotCard,
  chooseBotExtra as chooseBestBotExtra,
  chooseBotTarget,
} from './src/bot.js';
import {
  advanceTurnState,
  appendGameLog,
  beginTurnState,
  createMatchState,
  drawCardState,
  ensureReplayState,
  matchResultText,
  placeCardFromHandState,
  promoteExtraCardState,
  recordGameAction,
  resolveRoundState,
  shouldFinishMatch,
  startRoundState,
  trimReplay,
} from './src/game-engine.js';
import { createMultiplayerClient } from './src/multiplayer-client.js';
import {
  BOT_PLAYER,
  cardImagePath,
  createCardInstance,
  filterAndSortCards,
  hasSpaceForCard,
  moveCardToPrivateZone,
  opponent,
  playerName,
  primaryTag,
  resetCardEffects,
  serializeDeckDraft as serializeDeckDraftState,
  shuffle,
} from './src/rules.js';

const app = document.querySelector("#app");
const modal = document.querySelector("#modal");
const STORAGE_KEY = "gra-karciana-v1-state";
let uid = 1;
let selectedBuilderPlayer = 0;
let botEnabledDraft = true;
let selectedHandUid = null;
let game = null;
let onlineMode = false;
let pendingOnlineCreate = false;
let botActing = false;
let botTurnQueued = false;
let musicEnabled = true;
let sfxEnabled = true;
let audioContext = null;
let musicTimer = null;
let musicStep = 0;
const activeFx = {
  cards: new Map(),
  locs: new Map(),
  hands: new Map(),
};
let builderFilters = {
  query: "",
  tag: "all",
  sort: "id",
};

const deckDraft = [
  { main: new Set(), extra: new Set() },
  { main: new Set(), extra: new Set() },
];

const multiplayer = createMultiplayerClient({
  getState: () => game,
  setState: (state) => {
    game = state;
    selectedHandUid = null;
    onlineMode = Boolean(multiplayer.roomId);
    if (game?.screen === "game") renderGame();
    else if (game?.screen === "matchEnd") showMatchEnd(false);
  },
  onEvent: () => {
    if (pendingOnlineCreate && multiplayer.roomId && multiplayer.player === 0) {
      pendingOnlineCreate = false;
      startMatch({ online: true, botEnabled: false });
      multiplayer.publishState({ type: "initial_state" });
      return;
    }
    if (onlineMode && !game) renderOnline();
    else if (game?.screen === "game") renderGame();
  },
});

function cloneDef(def, owner) {
  return createCardInstance(def, owner, uid++);
}

function cardImage(id) {
  return cardImagePath(id, OPTIMIZED_CARD_IMAGES, "ikony-opt");
}
function retryCardImage(img) {
  const retryCount = Number(img.dataset.retryCount || 0);
  if (retryCount >= 1) {
    img.replaceWith(Object.assign(document.createElement("div"), {
      className: img.className + " placeholder",
      textContent: img.alt.slice(0, 1),
    }));
    return;
  }
  img.dataset.retryCount = String(retryCount + 1);
  const separator = img.src.includes("?") ? "&" : "?";
  img.src = `${img.src}${separator}retry=${Date.now()}`;
}

window.retryCardImage = retryCardImage;

function renderCardArt(id, name, size = "large") {
  const src = cardImage(id);
  if (!src) return `<div class="card-art card-art-${size} placeholder">${name.slice(0, 1)}</div>`;
  return `<img class="card-art card-art-${size}" src="${src}" alt="${name}" loading="lazy" onerror="retryCardImage(this)" />`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderTagBadge(card) {
  const tag = primaryTag(card);
  return `<span class="tag tag-${tag}">${TAG_LABELS[tag] || "Efekt"}</span>`;
}

function filteredCards() {
  return filterAndSortCards(CARDS, builderFilters);
}
function cardsFromSet(set) {
  return [...set].map((id) => CARDS.find((card) => card.id === id)).filter(Boolean);
}

function renderMenu() {
  stopMusic();
  app.innerHTML = `
    <section class="screen menu-screen">
      <div class="menu-shell">
        <div class="menu-title">
          <span class="meta">Prototyp lokalnej gry 1v1</span>
          <h1>Gra karciana wersja 1.0</h1>
          <p>Buduj talie, walcz o przewagę w trzech lokacjach i korzystaj z efektów kart we właściwym momencie.</p>
        </div>
        <nav class="menu-actions" aria-label="Menu główne">
          <button id="menuPlay" class="primary">Rozgrywka</button>
          <button id="menuOnline">Online</button>
          <button id="menuRules">Instrukcja</button>
          <button id="menuCredits">Creditsy</button>
        </nav>
      </div>
    </section>
  `;
  app.querySelector("#menuPlay").addEventListener("click", renderBuilder);
  app.querySelector("#menuOnline").addEventListener("click", renderOnline);
  app.querySelector("#menuRules").addEventListener("click", renderInstructions);
  app.querySelector("#menuCredits").addEventListener("click", renderCredits);
}

function renderOnline() {
  stopMusic();
  onlineMode = true;
  app.innerHTML = `
    <section class="screen">
      <div class="topbar">
        <div class="brand">
          <h1>Online</h1>
          <span>Gra przez lokalny serwer i Cloudflare Quick Tunnel</span>
        </div>
        <button class="backMenu">Menu główne</button>
      </div>
      <section class="online-layout">
        <article class="panel">
          <h2>Utwórz pokój</h2>
          <p class="hint">Utworzenie pokoju uruchomi szybki mecz z taliami testowymi. Ty grasz jako Gracz A, kolega dołącza jako Gracz B.</p>
          <button id="createRoom" class="primary">Utwórz pokój</button>
          ${multiplayer.roomId ? `<p>Kod pokoju: <strong>${multiplayer.roomId}</strong></p>` : ""}
        </article>
        <article class="panel">
          <h2>Dołącz</h2>
          <label>
            Kod pokoju
            <input id="roomCode" maxlength="8" autocomplete="off" placeholder="np. A1B2C3" />
          </label>
          <button id="joinRoom">Dołącz do pokoju</button>
        </article>
        <article class="panel">
          <h2>Status</h2>
          <p>${multiplayer.connected ? "Połączono z serwerem." : "Brak połączenia z serwerem multiplayer."}</p>
          ${multiplayer.lastError ? `<p class="danger">${escapeHtml(multiplayer.lastError)}</p>` : ""}
          <p class="hint">Do gry z internetu uruchom serwer przez npm.cmd start, a potem tunel Cloudflare.</p>
        </article>
      </section>
    </section>
  `;
  app.querySelector(".backMenu").addEventListener("click", () => {
    onlineMode = false;
    renderMenu();
  });
  app.querySelector("#createRoom").addEventListener("click", createOnlineRoom);
  app.querySelector("#joinRoom").addEventListener("click", () => {
    const roomId = app.querySelector("#roomCode").value.trim().toUpperCase();
    if (roomId) multiplayer.joinRoom(roomId);
  });
}

function renderInstructions() {
  stopMusic();
  app.innerHTML = `
    <section class="screen">
      <div class="topbar">
        <div class="brand">
          <h1>Instrukcja</h1>
          <span>Zasady rozgrywki w skrócie</span>
        </div>
        <button class="backMenu">Menu główne</button>
      </div>
      <section class="rules-grid">
        <article class="panel rule-panel">
          <h2>Cel gry</h2>
          <p>Gracze rywalizują w trzech lokacjach. Na koniec partii porównywana jest moc w każdej lokacji. Wygrywa ten, kto prowadzi w większej liczbie lokacji.</p>
        </article>
        <article class="panel rule-panel">
          <h2>Tury i progi</h2>
          <p>Partia trwa do 6 tur. Karta może zostać zagrana, gdy aktualna tura jest równa lub wyższa od jej progu. Niektóre efekty obniżają próg albo dają dodatkowe zagrania.</p>
        </article>
        <article class="panel rule-panel">
          <h2>Lokacje</h2>
          <p>Każda strona lokacji ma ograniczoną liczbę miejsc. Karty dokładają moc do swojej strony, a część z nich wzmacnia, osłabia, niszczy lub cofa inne karty.</p>
        </article>
        <article class="panel rule-panel">
          <h2>Efekty kart</h2>
          <p>Zagranie działa po wyłożeniu karty. Pasywka działa, gdy karta jest na stole. Zniszczenie uruchamia się przy zniszczeniu. Odrzucenie działa, gdy karta zostanie odrzucona z ręki.</p>
        </article>
        <article class="panel rule-panel">
          <h2>Mecz</h2>
          <p>Po partii zwycięzca dostaje punkt. Przed kolejną partią gracze mogą dodać kartę z talii dodatkowej. Mecz kończy się po osiągnięciu warunku zwycięstwa albo po ostatniej partii.</p>
        </article>
        <article class="panel rule-panel">
          <h2>Bot</h2>
          <p>Bot może grać jako Gracz B. W czasie jego tury wykonuje legalne akcje automatycznie, ale wybory należące do Gracza A nadal pojawiają się w oknach wyboru.</p>
        </article>
      </section>
    </section>
  `;
  app.querySelector(".backMenu").addEventListener("click", renderMenu);
}

function renderCredits() {
  stopMusic();
  app.innerHTML = `
    <section class="screen">
      <div class="topbar">
        <div class="brand">
          <h1>Creditsy</h1>
          <span>Autorzy gry</span>
        </div>
        <button class="backMenu">Menu główne</button>
      </div>
      <section class="credits-panel panel">
        <div>
          <span class="meta">Game Master</span>
          <h2>Rafał Kozioł</h2>
        </div>
        <div>
          <span class="meta">Programista</span>
          <h2>Jakub Bieńkowski</h2>
        </div>
      </section>
    </section>
  `;
  app.querySelector(".backMenu").addEventListener("click", renderMenu);
}

function startMusic() {
  if (!musicEnabled || musicTimer) return;
  if (!ensureAudio()) return;
  musicStep = 0;
  playMusicStep();
  musicTimer = window.setInterval(playMusicStep, 430);
}

function ensureAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  audioContext ??= new AudioContextClass();
  audioContext.resume?.();
  return true;
}

function stopMusic() {
  if (!musicTimer) return;
  window.clearInterval(musicTimer);
  musicTimer = null;
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  if (musicEnabled && game) startMusic();
  else stopMusic();
  saveState();
  if (game) renderGame();
}

function toggleSfx() {
  sfxEnabled = !sfxEnabled;
  saveState();
  if (game) renderGame();
}

function playMusicStep() {
  if (!audioContext || audioContext.state === "closed") return;
  const melody = [220, 261.63, 293.66, 329.63, 392, 329.63, 293.66, 261.63, 196, 246.94, 293.66, 349.23, 392, 349.23, 293.66, 246.94];
  const bass = [110, 110, 98, 98, 130.81, 130.81, 146.83, 146.83];
  const now = audioContext.currentTime;
  const note = melody[musicStep % melody.length];
  const root = bass[Math.floor(musicStep / 2) % bass.length];
  playTone(note, now, 0.24, "triangle", 0.035);
  if (musicStep % 2 === 0) playTone(root, now, 0.38, "sine", 0.025);
  musicStep++;
}

function playTone(frequency, start, duration, type, volume) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(audioContext.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function triggerEffect(type, target = {}) {
  playSfx(type);
  markFx(type, target);
}

function markFx(type, target) {
  const token = `${type}-${Date.now()}-${Math.random()}`;
  if (target.cardUid) activeFx.cards.set(target.cardUid, { type, token });
  if (target.player !== undefined && target.loc !== undefined) activeFx.locs.set(`${target.player}-${target.loc}`, { type, token });
  if (target.player !== undefined) activeFx.hands.set(target.player, { type, token });
  window.setTimeout(() => {
    for (const map of [activeFx.cards, activeFx.locs, activeFx.hands]) {
      for (const [key, value] of map.entries()) {
        if (value.token === token) map.delete(key);
      }
    }
  }, 650);
}

function fxClass(kind, key) {
  const item = activeFx[kind].get(key);
  return item ? `fx-${item.type}` : "";
}

function playSfx(type) {
  if (!sfxEnabled || !ensureAudio()) return;
  const now = audioContext.currentTime;
  switch (type) {
    case "play":
      playTone(440, now, 0.08, "triangle", 0.04);
      playTone(660, now + 0.05, 0.09, "square", 0.018);
      break;
    case "draw":
      playTone(740, now, 0.06, "triangle", 0.028);
      playTone(980, now + 0.055, 0.07, "triangle", 0.02);
      break;
    case "destroy":
      playTone(120, now, 0.12, "sawtooth", 0.045);
      playTone(80, now + 0.05, 0.16, "square", 0.026);
      break;
    case "discard":
      playTone(180, now, 0.08, "square", 0.028);
      break;
    case "bounce":
      playTone(520, now, 0.08, "triangle", 0.025);
      playTone(310, now + 0.06, 0.1, "triangle", 0.022);
      break;
    case "silence":
      playTone(165, now, 0.18, "sine", 0.03);
      break;
    case "buff":
      playTone(392, now, 0.08, "triangle", 0.026);
      playTone(493.88, now + 0.07, 0.08, "triangle", 0.026);
      playTone(587.33, now + 0.14, 0.1, "triangle", 0.026);
      break;
    case "turn":
      playTone(220, now, 0.18, "sine", 0.025);
      playTone(440, now + 0.12, 0.16, "sine", 0.018);
      break;
    case "win":
      playTone(392, now, 0.12, "triangle", 0.03);
      playTone(523.25, now + 0.1, 0.12, "triangle", 0.03);
      playTone(659.25, now + 0.2, 0.18, "triangle", 0.03);
      break;
  }
}

function renderBuilder() {
  stopMusic();
  const p = deckDraft[selectedBuilderPlayer];
  const validA = deckDraft[0].main.size === 12 && deckDraft[0].extra.size === 3;
  const validB = deckDraft[1].main.size === 12 && deckDraft[1].extra.size === 3;
  const visibleCards = filteredCards();
  app.innerHTML = `
    <section class="screen">
      <div class="topbar">
        <div class="brand">
          <h1>Gra karciana wersja 1.0</h1>
          <span>Prototyp lokalnej gry 1v1</span>
        </div>
        <div class="actions">
          <button id="mainMenu">Menu</button>
          <button id="quickMatch">Szybki mecz</button>
          <button id="startGame" class="primary" ${validA && validB ? "" : "disabled"}>Rozpocznij mecz</button>
        </div>
      </div>
      <div class="builder">
        <aside class="builder-side">
          <div class="player-tabs">
            <button class="${selectedBuilderPlayer === 0 ? "active" : ""}" data-player="0">Gracz A</button>
            <button class="${selectedBuilderPlayer === 1 ? "active" : ""}" data-player="1">Gracz B</button>
          </div>
          <div class="counts">
            <div class="meter"><progress max="12" value="${p.main.size}"></progress><strong>${p.main.size}/12 podstawowych</strong></div>
            <div class="meter"><progress max="3" value="${p.extra.size}"></progress><strong>${p.extra.size}/3 dodatkowe</strong></div>
          </div>
          <p class="hint">Każda karta może być w talii danego gracza tylko raz. Karty dodatkowe są dokładane po partiach.</p>
          <div class="actions">
            <button id="sampleDecks">Szybkie talie testowe</button>
            <button id="clearDeck">Wyczyść gracza</button>
          </div>
          <label class="toggle-row">
            <input id="botToggle" type="checkbox" ${botEnabledDraft ? "checked" : ""} />
            Bot gra jako Gracz B
          </label>
          <section class="deck-preview">
            <h2>Aktualna talia</h2>
            ${renderDeckSection("Podstawowe", cardsFromSet(p.main), 12)}
            ${renderDeckSection("Dodatkowe", cardsFromSet(p.extra), 3)}
          </section>
        </aside>
        <section class="library-wrap">
          <div class="filters panel">
            <label>
              Szukaj
              <input id="cardSearch" type="search" value="${escapeHtml(builderFilters.query)}" placeholder="Nazwa lub opis karty" />
            </label>
            <label>
              Efekt
              <select id="tagFilter">
                ${Object.entries(TAG_LABELS).map(([value, label]) => `<option value="${value}" ${builderFilters.tag === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>
              Sortuj
              <select id="sortCards">
                <option value="id" ${builderFilters.sort === "id" ? "selected" : ""}>Numer</option>
                <option value="threshold" ${builderFilters.sort === "threshold" ? "selected" : ""}>Najniższy próg</option>
                <option value="power" ${builderFilters.sort === "power" ? "selected" : ""}>Największa moc</option>
                <option value="name" ${builderFilters.sort === "name" ? "selected" : ""}>Nazwa</option>
              </select>
            </label>
            <span class="meta">${visibleCards.length} / ${CARDS.length} kart</span>
          </div>
          <section class="library">
            ${visibleCards.map((card) => renderLibraryCard(card, p)).join("") || "<p class='hint'>Brak kart dla wybranych filtrów.</p>"}
          </section>
        </section>
      </div>
    </section>
  `;
  app.querySelector("#mainMenu").addEventListener("click", renderMenu);
  app.querySelectorAll("[data-player]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedBuilderPlayer = Number(btn.dataset.player);
      renderBuilder();
    });
  });
  app.querySelectorAll("[data-add-main]").forEach((btn) => btn.addEventListener("click", () => toggleDeckCard(Number(btn.dataset.addMain), "main")));
  app.querySelectorAll("[data-add-extra]").forEach((btn) => btn.addEventListener("click", () => toggleDeckCard(Number(btn.dataset.addExtra), "extra")));
  app.querySelectorAll("[data-remove-card]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.removeCard);
      deckDraft[selectedBuilderPlayer].main.delete(id);
      deckDraft[selectedBuilderPlayer].extra.delete(id);
      saveState();
      renderBuilder();
    });
  });
  app.querySelector("#clearDeck").addEventListener("click", () => {
    deckDraft[selectedBuilderPlayer].main.clear();
    deckDraft[selectedBuilderPlayer].extra.clear();
    saveState();
    renderBuilder();
  });
  app.querySelector("#sampleDecks").addEventListener("click", () => makeSampleDecks(false));
  app.querySelector("#quickMatch").addEventListener("click", () => makeSampleDecks(true));
  app.querySelector("#startGame").addEventListener("click", startMatch);
  app.querySelector("#botToggle").addEventListener("change", (event) => {
    botEnabledDraft = event.target.checked;
    saveState();
  });
  app.querySelector("#cardSearch").addEventListener("input", (event) => {
    const query = event.target.value;
    builderFilters.query = query;
    renderBuilder();
    const input = app.querySelector("#cardSearch");
    input.focus();
    input.setSelectionRange(query.length, query.length);
  });
  app.querySelector("#tagFilter").addEventListener("change", (event) => {
    builderFilters.tag = event.target.value;
    renderBuilder();
  });
  app.querySelector("#sortCards").addEventListener("change", (event) => {
    builderFilters.sort = event.target.value;
    renderBuilder();
  });
}

function renderDeckSection(title, cards, max) {
  return `
    <div class="deck-section">
      <strong>${title} <span class="meta">${cards.length}/${max}</span></strong>
      <div class="deck-list">
        ${cards.map((card) => `<button data-remove-card="${card.id}" title="Usuń z talii">${card.name}</button>`).join("") || "<span class='hint'>Brak kart.</span>"}
      </div>
    </div>
  `;
}

function renderLibraryCard(card, draft) {
  const inMain = draft.main.has(card.id);
  const inExtra = draft.extra.has(card.id);
  const blockedMain = !inMain && (draft.main.size >= 12 || inExtra);
  const blockedExtra = !inExtra && (draft.extra.size >= 3 || inMain);
  return `
    <article class="card ${inMain || inExtra ? "selected" : ""}">
      ${renderCardArt(card.id, card.name)}
      <div class="card-heading">
        <h3>${card.id}. ${card.name}</h3>
        ${renderTagBadge(card)}
      </div>
      <div class="stats">
        <span class="pill threshold">Próg ${card.threshold}</span>
        <span class="pill power">Moc ${card.power}</span>
      </div>
      <p>${card.text}</p>
      <div class="card-actions">
        <button data-add-main="${card.id}" ${blockedMain ? "disabled" : ""}>${inMain ? "Usuń z 12" : "Do 12"}</button>
        <button data-add-extra="${card.id}" ${blockedExtra ? "disabled" : ""}>${inExtra ? "Usuń z 3" : "Do 3"}</button>
      </div>
    </article>
  `;
}

function toggleDeckCard(id, type) {
  const draft = deckDraft[selectedBuilderPlayer];
  const set = draft[type];
  if (set.has(id)) set.delete(id);
  else set.add(id);
  saveState();
  renderBuilder();
}

function makeSampleDecks(startImmediately = false) {
  deckDraft[0].main = new Set([1, 3, 5, 6, 10, 12, 16, 20, 22, 29, 34, 44]);
  deckDraft[0].extra = new Set([14, 42, 49]);
  deckDraft[1].main = new Set([2, 7, 11, 15, 17, 21, 25, 26, 30, 32, 37, 43]);
  deckDraft[1].extra = new Set([8, 39, 50]);
  saveState();
  if (startImmediately) {
    startMatch();
    return;
  }
  renderBuilder();
}

function createOnlineRoom() {
  makeSampleDecks(false);
  botEnabledDraft = false;
  pendingOnlineCreate = true;
  multiplayer.createRoom();
}

function startMatch(options = {}) {
  localStorage.removeItem(STORAGE_KEY);
  onlineMode = Boolean(options.online || onlineMode);
  const botEnabled = options.botEnabled ?? app.querySelector("#botToggle")?.checked ?? botEnabledDraft;
  botEnabledDraft = botEnabled;
  game = createMatchState({
    botEnabled,
    deckDraft,
    starter: Math.random() < 0.5 ? 0 : 1,
  });
  recordGameAction(game, { type: "start_match", starter: game.starter, botEnabled });
  startMusic();
  startRound();
}

function startRound() {
  selectedHandUid = null;
  const cardsById = new Map(CARDS.map((card) => [card.id, card]));
  startRoundState(game, {
    cardsById,
    cloneCard: cloneDef,
    drawCard,
  });
  log(`Partia ${game.matchRound}. Zaczyna ${playerName(game.turnPlayer)}.`);
  beginTurn();
}

function beginTurn() {
  selectedHandUid = null;
  beginTurnState(game);
  drawCard(game.turnPlayer, true);
  if (isBotControlledTurn()) scheduleBotTurn(0);
  renderGame();
}
function currentHandCard() {
  if (!game || !selectedHandUid) return null;
  return game.players[game.turnPlayer].hand.find((card) => card.uid === selectedHandUid) || null;
}

function canPlayTo(targetPlayer, loc, card = currentHandCard()) {
  if (!card || !canPlayCard(game.turnPlayer, card)) return false;
  if (targetPlayer !== game.turnPlayer && card.defId !== 25) return false;
  return hasSpace(targetPlayer, loc, card);
}

function isBotControlledTurn() {
  return Boolean(game?.screen === "game" && game.botEnabled && game.turnPlayer === BOT_PLAYER);
}

function isRemoteControlledTurn() {
  return Boolean(onlineMode && game?.screen === "game" && !multiplayer.canControl(game.turnPlayer));
}

function publishOnlineState(action) {
  if (onlineMode && multiplayer.roomId) multiplayer.publishState(action);
}

function playPreview() {
  const card = currentHandCard();
  if (!card) return `<p class="hint">Wybierz kartę z ręki, aby zobaczyć możliwe lokacje i podgląd zagrania.</p>`;
  if (!canPlayCard(game.turnPlayer, card)) {
    return `<p class="danger">${card.name} nie może zostać zagrana w tej turze. Wymagany próg: ${effectiveThreshold(game.turnPlayer, card)}, aktualna tura: ${game.roundTurn}.</p>`;
  }
  const ownTargets = [0, 1, 2].filter((loc) => canPlayTo(game.turnPlayer, loc, card)).map((loc) => `L${loc + 1}`).join(", ") || "brak";
  const enemyTargets = card.defId === 25 ? [0, 1, 2].filter((loc) => canPlayTo(opponent(game.turnPlayer), loc, card)).map((loc) => `L${loc + 1}`).join(", ") || "brak" : "niedostępne";
  return `
    <div class="preview-card">
      <strong>${card.name}</strong>
      <span class="meta">Próg ${effectiveThreshold(game.turnPlayer, card)} · Moc ${card.basePower} · ${TAG_LABELS[primaryTag(card)] || "Efekt"}</span>
      <p>${card.text}</p>
      <p><strong>Twoje lokacje:</strong> ${ownTargets}</p>
      ${card.defId === 25 ? `<p><strong>Lokacje przeciwnika:</strong> ${enemyTargets}</p>` : ""}
    </div>
  `;
}

function drawCard(player, countForTurn = true) {
  const p = game.players[player];
  const card = drawCardState(game, player, { countForTurn });
  if (!card) return null;
  if (countForTurn) triggerEffect("draw", { player });
  if (countForTurn) {
    if (p.drawsThisTurn === 2 && hasOnBoard(player, 6)) {
      p.playsLeft++;
      log(`${playerName(player)} aktywuje Pomnik Wielkiej Królowej: dodatkowe zagranie.`);
    }
  }
  return card;
}

function log(text, action = null) {
  appendGameLog(game, text, action);
  trimReplay(game);
}

function renderReplayLog(limit = 12) {
  const entries = [...(game.actions || [])].slice(-limit).reverse();
  if (!entries.length) return "<p class='hint'>Brak zapisanych akcji.</p>";
  return `<div class="log replay-log">${entries.map((entry) => `<code>${escapeHtml(JSON.stringify(entry))}</code>`).join("")}</div>`;
}

function renderGame() {
  const tp = game.players[game.turnPlayer];
  const playsLeft = tp.playsLeft;
  const botTurn = isBotControlledTurn();
  const remoteTurn = isRemoteControlledTurn();
  app.innerHTML = `
    <section class="screen">
      <div class="topbar gamebar">
        <div class="brand">
          <h1>Gra karciana wersja 1.0</h1>
          <span>Partia ${game.matchRound}/4, tura ${game.roundTurn}/6, ruch: ${playerName(game.turnPlayer)}</span>
          ${onlineMode ? `<span>Online: pokój ${multiplayer.roomId || "-"}, grasz jako ${playerName(multiplayer.player ?? 0)}</span>` : ""}
        </div>
        <div class="turn-strip">
          <span>Zagrania <strong>${playsLeft}</strong></span>
          <span>Talia <strong>${tp.deck.length}</strong></span>
          <span>Cmentarz <strong>${tp.grave.length}</strong></span>
        </div>
        <div class="actions">
          <button id="toggleMusic">${musicEnabled ? "Muzyka: wł." : "Muzyka: wył."}</button>
          <button id="toggleSfx">${sfxEnabled ? "Dźwięki: wł." : "Dźwięki: wył."}</button>
          <button id="endTurn" class="primary" ${botTurn || remoteTurn ? "disabled" : ""}>Zakończ turę</button>
          <button id="newMatch">Nowy mecz</button>
        </div>
      </div>
      <div class="board-layout">
        <div class="board">
          <div class="scorebar">
            ${[0, 1, 2].map((i) => renderScoreBox(i)).join("")}
          </div>
          <div class="battlefield">
            ${[0, 1, 2].map((i) => renderLocation(i)).join("")}
          </div>
          <section class="panel">
            <h2>Ręka: ${playerName(game.turnPlayer)} <span class="meta">Zagrania: ${playsLeft}, talia: ${tp.deck.length}, cmentarz: ${tp.grave.length}</span></h2>
            ${botTurn ? "<p class='hint'>Bot wykonuje turę. Poczekaj na rozpatrzenie akcji.</p>" : ""}
            ${remoteTurn ? "<p class='hint'>Ruch przeciwnika online. Poczekaj na synchronizację.</p>" : ""}
            <div class="hand ${fxClass("hands", game.turnPlayer)}">${tp.hand.map((card) => renderHandCard(card)).join("") || "<p class='hint'>Brak kart na ręce.</p>"}</div>
          </section>
        </div>
        <aside class="sidepanel">
          <section class="panel action-preview">
            <h3>Podgląd zagrania</h3>
            ${playPreview()}
          </section>
          <section class="panel">
            <h3>Wynik meczu</h3>
            <p>${playerName(0)}: <strong>${game.scores[0]}</strong></p>
            <p>${playerName(1)}: <strong>${game.scores[1]}</strong></p>
          </section>
          <section class="panel">
            <h3>Stosy</h3>
            <p>${playerName(0)}: talia ${game.players[0].deck.length}, ręka ${game.players[0].hand.length}, cmentarz ${game.players[0].grave.length}</p>
            <p>${playerName(1)}: talia ${game.players[1].deck.length}, ręka ${game.players[1].hand.length}, cmentarz ${game.players[1].grave.length}</p>
          </section>
          <section class="panel">
            <h3>Dziennik</h3>
            <div class="log">${game.logs.map((entry) => `<span>${entry}</span>`).join("")}</div>
          </section>
          <section class="panel">
            <h3>Replay</h3>
            ${renderReplayLog()}
          </section>
        </aside>
      </div>
    </section>
  `;
  app.querySelector("#toggleMusic").addEventListener("click", toggleMusic);
  app.querySelector("#toggleSfx").addEventListener("click", toggleSfx);
  if (!botTurn && !remoteTurn) app.querySelector("#endTurn").addEventListener("click", endTurn);
  app.querySelector("#newMatch").addEventListener("click", () => {
    game = null;
    onlineMode = false;
    localStorage.removeItem(STORAGE_KEY);
    stopMusic();
    renderBuilder();
  });
  app.querySelectorAll("[data-hand]").forEach((el) => {
    el.addEventListener("click", () => {
      if (isBotControlledTurn()) return;
      if (isRemoteControlledTurn()) return;
      selectedHandUid = Number(el.dataset.hand);
      renderGame();
    });
  });
  app.querySelectorAll("[data-drop]").forEach((el) => {
    el.addEventListener("click", () => {
      if (isBotControlledTurn()) return;
      if (isRemoteControlledTurn()) return;
      playSelected(Number(el.dataset.player), Number(el.dataset.drop));
    });
  });
  saveState();
  scheduleBotTurn();
}

function renderScoreBox(i) {
  const a = locationPower(0, i);
  const b = locationPower(1, i);
  const label = a === b ? "remis" : a > b ? "prowadzi A" : "prowadzi B";
  return `<div class="scorebox"><strong>Lokacja ${i + 1}</strong><span>A ${a} : ${b} B</span><span class="meta">${label}</span></div>`;
}

function renderLocation(i) {
  const a = locationPower(0, i);
  const b = locationPower(1, i);
  const leadClass = a === b ? "tie" : a > b ? "lead-a" : "lead-b";
  const canHumanTarget = !isBotControlledTurn();
  return `
    <section class="location ${leadClass}">
      <div class="zone ${fxClass("locs", `1-${i}`)} ${canHumanTarget && canPlayTo(1, i) ? "legal-target" : ""}" data-player="1" data-drop="${i}">${game.players[1].locations[i].map(renderBoardCard).join("")}</div>
      <div class="loc-title">
        <strong>Lokacja ${i + 1}</strong>
        <span>${a} : ${b}</span>
      </div>
      <div class="zone ${fxClass("locs", `0-${i}`)} ${canHumanTarget && canPlayTo(0, i) ? "legal-target" : ""}" data-player="0" data-drop="${i}">${game.players[0].locations[i].map(renderBoardCard).join("")}</div>
    </section>
  `;
}

function renderBoardCard(card) {
  return `
    <article class="mini-card ${card.silenced ? "silenced" : ""} ${fxClass("cards", card.uid)}">
      ${renderCardArt(card.defId, card.name, "board")}
      <h4>${card.name}</h4>
      <div class="stats">
        <span class="pill power">${cardPower(card)}</span>
        <span class="pill threshold">${card.baseThreshold}</span>
      </div>
      <p>${card.silenced ? "Wyciszona" : card.text}</p>
    </article>
  `;
}

function renderHandCard(card) {
  const playable = canPlayCard(game.turnPlayer, card);
  return `
    <article class="card ${playable ? "playable" : ""} ${selectedHandUid === card.uid ? "selected" : ""}" data-hand="${card.uid}">
      ${renderCardArt(card.defId, card.name)}
      <div class="card-heading">
        <h3>${card.name}</h3>
        ${renderTagBadge(card)}
      </div>
      <div class="stats">
        <span class="pill threshold">Próg ${displayThreshold(game.turnPlayer, card)}</span>
        <span class="pill power">Moc ${card.basePower}</span>
      </div>
      <p>${card.text}</p>
    </article>
  `;
}

function locationPower(player, loc) {
  return game.players[player].locBonus[loc] + game.players[player].locations[loc].reduce((sum, card) => sum + cardPower(card), 0);
}

function cardPower(card) {
  if (card.silenced) return card.basePower;
  let value = card.basePower + card.powerMod;
  const player = card.controller;
  const loc = findCardLocation(card.uid);
  if (!loc) return value;
  if (card.defId === 15) value += game.players[opponent(player)].locations[loc.loc].length * 2;
  game.players[player].locations[loc.loc].forEach((other) => {
    if (!other.silenced && other.uid !== card.uid && other.defId === 22) value += 2;
  });
  allBoardCards(player).forEach((other) => {
    if (other.silenced || other.uid === card.uid) return;
    if (other.defId === 42) value += 1;
    if (other.defId === 44 && card.baseThreshold === 1) value += 1;
    if (other.defId === 50) value -= 1;
  });
  return value;
}

function effectiveThreshold(player, card, options = {}) {
  let value = card.baseThreshold + card.thresholdMod;
  if (card.defId === 18) value -= allBoardCards(player).length;
  allBoardCards(player).forEach((boardCard) => {
    if (!boardCard.silenced && boardCard.defId === 3) value -= 1;
  });
  const useNextBonus = options.useNextBonus ?? selectedHandUid === card.uid;
  if (game.turnPlayer === player && game.players[player].nextThresholdBonus && useNextBonus) value -= game.players[player].nextThresholdBonus;
  return Math.max(1, value);
}

function displayThreshold(player, card) {
  const selectedValue = effectiveThreshold(player, card);
  const previewValue = effectiveThreshold(player, card, { useNextBonus: true });
  return Math.min(selectedValue, previewValue);
}

function canPlayCard(player, card) {
  return game.turnPlayer === player && game.players[player].playsLeft > 0 && displayThreshold(player, card) <= game.roundTurn;
}

async function playSelected(targetPlayer, loc) {
  if (isRemoteControlledTurn()) return;
  if (!selectedHandUid) return;
  const player = game.turnPlayer;
  const card = game.players[player].hand.find((c) => c.uid === selectedHandUid);
  await playCardFromHand(player, card, targetPlayer, loc);
}

async function playCardFromHand(player, card, targetPlayer, loc) {
  const p = game.players[player];
  if (!card || !canPlayCard(player, card)) return;
  if (!canPlayTo(targetPlayer, loc, card)) {
    log(`Brak miejsca w lokacji ${loc + 1}.`);
    renderGame();
    return;
  }
  const lowered = displayThreshold(player, card) < card.baseThreshold;
  placeCardFromHandState(game, { player, card, targetPlayer, loc, lowered });
  triggerEffect("play", { cardUid: card.uid, player: targetPlayer, loc });
  selectedHandUid = null;
  log(`${playerName(player)} zagrywa ${card.name} do lokacji ${loc + 1}.`);
  if (lowered && hasOnBoard(player, 35) && !p.flamethrowerUsed) {
    p.playsLeft++;
    p.flamethrowerUsed = true;
    log("Miotacz ognia daje dodatkowe zagranie.");
  }
  await resolvePlayEffect(card, loc, player);
  renderGame();
  publishOnlineState({
    type: "play_card",
    player,
    cardUid: card.uid,
    targetPlayer,
    loc,
  });
}

function hasSpace(player, loc, card) {
  const used = game.players[player].locations[loc].reduce((sum, c) => sum + (c.defId === 14 && !c.silenced ? 4 : 1), 0);
  const need = card.defId === 14 ? 4 : 1;
  return used + need <= 4;
}

function hasOnBoard(player, id) {
  return allBoardCards(player).some((c) => !c.silenced && c.defId === id);
}

function allBoardCards(player) {
  return game.players[player].locations.flat();
}

function findCardLocation(uidToFind) {
  for (let player = 0; player < 2; player++) {
    for (let loc = 0; loc < 3; loc++) {
      const index = game.players[player].locations[loc].findIndex((c) => c.uid === uidToFind);
      if (index >= 0) return { player, loc, index };
    }
  }
  return null;
}

async function resolvePlayEffect(card, loc, actor) {
  if (card.silenced) return;
  const p = game.players[actor];
  const enemy = opponent(actor);
  switch (card.defId) {
    case 1:
      drawCard(actor, true);
      break;
    case 2:
      await bounceCard(enemy, loc, "Wybierz kartę przeciwnika do cofnięcia.");
      break;
    case 4:
      if (!p.deck.length) {
        p.locBonus = p.locBonus.map((v) => v + 5);
        for (let l = 0; l < 3; l++) triggerEffect("buff", { player: actor, loc: l });
      }
      break;
    case 5:
      summon(actor, loc, cloneDef(TOKENS.horse, actor));
      break;
    case 7:
      await destroyChosen(actor, loc, "Wybierz inną swoją kartę do zniszczenia.", (c) => c.uid !== card.uid);
      await destroyChosen(enemy, loc, "Wybierz kartę przeciwnika do zniszczenia.");
      break;
    case 8:
      for (let l = 0; l < 3; l++) while (hasSpace(actor, l, TOKENS.totem)) summon(actor, l, cloneDef(TOKENS.totem, actor));
      break;
    case 10:
      await tutor(actor, 1);
      p.deck = shuffle(p.deck);
      break;
    case 11:
      await destroyHighestPower(enemy, loc);
      break;
    case 17:
      await swapHandCards(actor, enemy);
      break;
    case 19:
      await repeatPlay(actor, loc, card.uid);
      break;
    case 20:
      p.nextThresholdBonus += 1;
      triggerEffect("buff", { cardUid: card.uid });
      break;
    case 21:
      p.nextTurnExtra++;
      break;
    case 23:
      await treacherousWish(actor);
      break;
    case 24:
      for (let i = 0; i < game.players[enemy].locations[loc].length; i++) drawCard(actor, true);
      break;
    case 26:
      await destroyChosen(enemy, null, "Zniszcz kartę przeciwnika z mocą 1 lub mniejszą.", (c) => cardPower(c) <= 1);
      break;
    case 28:
      await observer(actor, enemy);
      break;
    case 29:
      await bounceAnyOwn(actor, card.uid);
      break;
    case 31:
      p.deck = shuffle([...p.deck, ...p.grave].map((c) => moveCardToPrivateZone(c, actor)));
      p.grave = [];
      break;
    case 32:
      await silenceChosen(enemy, loc);
      break;
    case 39: {
      const discarded = [...p.hand];
      p.hand = [];
      for (const discardedCard of discarded) await discardCard(actor, discardedCard);
      card.powerMod += discarded.length * 2;
      triggerEffect("buff", { cardUid: card.uid });
      break;
    }
    case 41:
      await triggerDestroyAbility(actor, loc);
      break;
    case 43:
      await mirrorKnight(actor);
      break;
    case 46:
      if (game.players[actor].locations[loc].filter((c) => c.uid !== card.uid && c.baseThreshold === 1).length >= 3) p.playsLeft += 2;
      break;
    case 48:
      if (p.grave.length >= 6) {
        await destroyChosen(enemy, null, "Zniszcz pierwszą kartę przeciwnika.");
        await destroyChosen(enemy, null, "Zniszcz drugą kartę przeciwnika.");
      }
      break;
    case 49:
      await playTopDeck(actor);
      break;
  }
}

async function destroyChosen(player, loc, title, filter = () => true, chooserPlayer = game?.turnPlayer ?? 0) {
  const cards = collectBoardChoices(player, loc).filter(({ card }) => filter(card));
  if (!cards.length) return null;
  const choice = await choose(title, cards.map((item) => ({ label: `${item.card.name} (L${item.loc + 1})`, value: item })), true, chooserPlayer);
  if (choice) await destroyBoardCard(choice.card.uid);
  return choice;
}

async function destroyHighestPower(player, loc) {
  const cards = collectBoardChoices(player, loc);
  if (!cards.length) return null;
  const highest = Math.max(...cards.map(({ card }) => cardPower(card)));
  const strongest = cards.filter(({ card }) => cardPower(card) === highest);
  const choice = strongest.length === 1
    ? strongest[0]
    : await choose(
        "Zabójcza Strzała: wybierz jedną z kart o najwyższej mocy.",
        strongest.map((item) => ({ label: `${item.card.name} (${cardPower(item.card)} mocy)`, value: item })),
        false,
      );
  if (choice) await destroyBoardCard(choice.card.uid);
  return choice;
}

async function destroyBoardCard(cardUid) {
  const pos = findCardLocation(cardUid);
  if (!pos) return;
  const p = game.players[pos.player];
  const [card] = p.locations[pos.loc].splice(pos.index, 1);
  triggerEffect("destroy", { player: pos.player, loc: pos.loc });
  if (!card.silenced) await resolveDestroyEffect(card, pos.loc, pos.player);
  moveCardToPrivateZone(card, pos.player);
  game.players[pos.player].grave.unshift(card);
  game.players[game.turnPlayer].destroyedThisTurn++;
  if (hasOnBoard(game.turnPlayer, 16)) {
    const tp = game.players[game.turnPlayer];
    if (!tp.servantUsed) {
      tp.playsLeft++;
      tp.servantUsed = true;
      log("Wieczny Sługa daje dodatkowe zagranie.");
    }
  }
  log(`${card.name} trafia na cmentarz.`);
}

async function resolveDestroyEffect(card, loc, controller) {
  switch (card.defId) {
    case 9:
      await discardFromHand(controller, "Żywy Wulkan: odrzuć kartę.");
      drawCard(controller, true);
      drawCard(controller, true);
      break;
    case 12: {
      const bottom = game.players[controller].grave.pop();
      if (bottom) game.players[controller].hand.push(moveCardToPrivateZone(bottom, controller));
      break;
    }
    case 13:
      summon(controller, loc, cloneDef(TOKENS.yeti, controller));
      break;
    case 27:
      if (controller === game.turnPlayer) game.players[controller].playsLeft++;
      break;
    case 34:
      for (let l = 0; l < 3; l++) summon(controller, l, cloneDef(TOKENS.spider, controller));
      break;
    case 47:
      game.players[controller].locations[loc].forEach((c) => {
        if (!c.silenced) c.powerMod += 2;
        if (!c.silenced) triggerEffect("buff", { cardUid: c.uid, player: controller, loc });
      });
      break;
  }
}

function summon(player, loc, card) {
  if (!hasSpace(player, loc, card)) return false;
  card.controller = player;
  game.players[player].locations[loc].push(card);
  triggerEffect("play", { cardUid: card.uid, player, loc });
  log(`${playerName(player)} wykłada ${card.name} do lokacji ${loc + 1}.`);
  return true;
}

async function discardCard(player, card) {
  const p = game.players[player];
  p.hand = p.hand.filter((c) => c.uid !== card.uid);
  triggerEffect("discard", { player });
  log(`${playerName(player)} odrzuca ${card.name}.`);
  if (!card.silenced) {
    if (card.defId === 33) {
      const loc = await chooseLocation(player, "Krowi desant: wybierz lokację.", player, card);
      if (loc !== null) summon(player, loc, card);
      return;
    }
    if (card.defId === 36) drawCard(player, true);
    if (card.defId === 38) await discardFromHand(opponent(player), "Groźny byk: przeciwnik odrzuca kartę.");
    if (card.defId === 40) {
      p.locBonus = p.locBonus.map((v) => v + 1);
      for (let l = 0; l < 3; l++) triggerEffect("buff", { player, loc: l });
      p.deck.push(moveCardToPrivateZone(card, player));
      return;
    }
  }
  p.grave.unshift(moveCardToPrivateZone(card, player));
}

async function discardFromHand(player, title, chooserPlayer = player) {
  const p = game.players[player];
  if (!p.hand.length) return null;
  const card = await choose(title, p.hand.map((c) => ({ label: c.name, value: c })), true, chooserPlayer);
  if (card) await discardCard(player, card);
  return card;
}

async function bounceCard(player, loc, title, chooserPlayer = game?.turnPlayer ?? 0, filter = () => true) {
  const choices = collectBoardChoices(player, loc).filter(({ card }) => filter(card));
  if (!choices.length) return;
  const item = await choose(title, choices.map((x) => ({ label: `${x.card.name} (L${x.loc + 1})`, value: x })), true, chooserPlayer);
  if (!item) return;
  game.players[player].locations[item.loc] = game.players[player].locations[item.loc].filter((c) => c.uid !== item.card.uid);
  triggerEffect("bounce", { player, loc: item.loc });
  game.players[player].hand.push(moveCardToPrivateZone(item.card, player));
}

async function bounceAnyOwn(player, sourceUid = null) {
  await bounceCard(player, null, "Łowca dezerterów: wybierz swoją kartę do cofnięcia.", game.turnPlayer, (c) => c.uid !== sourceUid);
}

async function silenceChosen(player, loc) {
  const item = await choose("Wycisz kartę przeciwnika.", collectBoardChoices(player, loc).map((x) => ({ label: x.card.name, value: x })), true, game.turnPlayer);
  if (!item) return;
  item.card.silenced = true;
  item.card.powerMod = 0;
  item.card.thresholdMod = 0;
  triggerEffect("silence", { cardUid: item.card.uid, player, loc });
}

async function tutor(player, count) {
  const p = game.players[player];
  for (let i = 0; i < count; i++) {
    if (!p.deck.length) return;
    const card = await choose("Dobierz kartę z talii.", p.deck.map((c) => ({ label: c.name, value: c })), false, player);
    p.deck = p.deck.filter((c) => c.uid !== card.uid);
    p.hand.push(moveCardToPrivateZone(card, player));
  }
}

async function treacherousWish(player) {
  const p = game.players[player];
  if (!p.deck.length) return;
  const first = await choose("Zdradliwe życzenie: wybierz pierwszą kartę.", p.deck.map((c) => ({ label: c.name, value: c })), false, player);
  p.deck = p.deck.filter((c) => c.uid !== first.uid);
  if (!p.deck.length) {
    p.hand.push(moveCardToPrivateZone(first, player));
    return;
  }
  const second = await choose("Zdradliwe życzenie: wybierz drugą kartę.", p.deck.map((c) => ({ label: c.name, value: c })), false, player);
  p.deck = p.deck.filter((c) => c.uid !== second.uid);
  const keep = await choose("Którą kartę zachować?", [first, second].map((c) => ({ label: c.name, value: c })), false, player);
  const discard = keep.uid === first.uid ? second : first;
  p.hand.push(moveCardToPrivateZone(keep, player));
  await discardCard(player, discard);
}

async function swapHandCards(a, b) {
  if (!game.players[a].hand.length || !game.players[b].hand.length) return;
  const ca = await choose(`${playerName(a)} wybiera kartę do wymiany.`, game.players[a].hand.map((c) => ({ label: c.name, value: c })), false, a);
  const cb = await choose(`${playerName(b)} wybiera kartę do wymiany.`, game.players[b].hand.map((c) => ({ label: c.name, value: c })), false, b);
  game.players[a].hand = game.players[a].hand.filter((c) => c.uid !== ca.uid);
  game.players[b].hand = game.players[b].hand.filter((c) => c.uid !== cb.uid);
  game.players[a].hand.push(moveCardToPrivateZone(cb, a));
  game.players[b].hand.push(moveCardToPrivateZone(ca, b));
}

async function repeatPlay(player, loc, sourceUid) {
  const choices = game.players[player].locations[loc].filter((c) => c.uid !== sourceUid && !c.silenced && c.tags.includes("play"));
  if (!choices.length) return;
  const card = await choose("Miś Zwiadowca: wybierz Zagranie do powtórzenia.", choices.map((c) => ({ label: c.name, value: c })), true, player);
  if (card) await resolvePlayEffect(card, loc, player);
}

async function observer(actor, enemy) {
  const top = game.players[enemy].deck[0];
  if (!top) return;
  const action = await choose(`Górna karta przeciwnika: ${top.name}`, [
    { label: "Zostaw na górze", value: "top" },
    { label: "Przełóż na spód", value: "bottom" },
  ], false, actor);
  if (action === "bottom") game.players[enemy].deck.push(game.players[enemy].deck.shift());
}

async function triggerDestroyAbility(player, loc) {
  const choices = game.players[player].locations[loc].filter((c) => c.tags.includes("destroy") && !c.silenced);
  if (!choices.length) return;
  const card = await choose("Aktywuj Zniszczenie swojej karty.", choices.map((c) => ({ label: c.name, value: c })), true, player);
  if (card) await resolveDestroyEffect(card, loc, player);
}

async function mirrorKnight(player) {
  const card = await discardFromHand(player, "Lustrzany Rycerz: odrzuć kartę.");
  if (card && card.baseThreshold === 1) {
    const loc = await chooseLocation(player, "Wyłóż odrzuconą kartę do lokacji.", player, card);
    const graveIndex = game.players[player].grave.findIndex((c) => c.uid === card.uid);
    if (loc !== null && graveIndex >= 0) {
      const [fromGrave] = game.players[player].grave.splice(graveIndex, 1);
      summon(player, loc, fromGrave);
    }
  }
}

async function playTopDeck(player) {
  const card = game.players[player].deck.shift();
  if (!card) return;
  resetCardEffects(card);
  card.owner = player;
  card.controller = player;
  const loc = await chooseLocation(player, `Dzwonnik zwycięstwa wykłada: ${card.name}. Wybierz lokację.`, player, card);
  if (loc !== null && summon(player, loc, card)) return;
  game.players[player].grave.unshift(moveCardToPrivateZone(card, player));
}

function collectBoardChoices(player, loc) {
  const result = [];
  const locs = loc === null ? [0, 1, 2] : [loc];
  locs.forEach((l) => game.players[player].locations[l].forEach((card) => result.push({ player, loc: l, card })));
  return result;
}

function chooseLocation(player, title, chooserPlayer = player, card = { defId: 0 }) {
  const choices = [0, 1, 2]
    .filter((loc) => hasSpace(player, loc, card))
    .map((loc) => ({ label: `Lokacja ${loc + 1}`, value: loc }));
  return choose(title, choices, false, chooserPlayer);
}

function choose(title, choices, allowCancel, chooserPlayer = game?.turnPlayer ?? 0) {
  return new Promise((resolve) => {
    if (!choices.length) {
      resolve(null);
      return;
    }
    if (game?.botEnabled && chooserPlayer === BOT_PLAYER) {
      resolve(choices[0]?.value ?? null);
      return;
    }
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="dialog">
        <h2>${title}</h2>
        <div class="choice-grid">
          ${choices.map((choice, index) => `<button class="${choiceCard(choice) ? "choice-card-button" : ""}" data-choice="${index}">${renderChoice(choice)}</button>`).join("")}
        </div>
      </div>
    `;
    modal.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        modal.classList.add("hidden");
        resolve(choices[Number(button.dataset.choice)].value);
      });
    });
  });
}

function choiceCard(choice) {
  const value = choice.value;
  if (!value) return null;
  if (value.card) return value.card;
  if (value.defId || value.defId === 0) return value;
  return null;
}

function renderChoice(choice) {
  const card = choiceCard(choice);
  if (!card) return escapeHtml(choice.label);
  return `
    <span class="choice-card">
      ${renderCardArt(card.defId, card.name, "small")}
      <span class="choice-card-body">
        <strong>${escapeHtml(choice.label)}</strong>
        <span class="stats">
          <span class="pill threshold">Próg ${card.baseThreshold}</span>
          <span class="pill power">Moc ${cardPowerForChoice(card)}</span>
        </span>
        <span>${escapeHtml(card.silenced ? "Wyciszona" : card.text)}</span>
      </span>
    </span>
  `;
}

function cardPowerForChoice(card) {
  return game && findCardLocation(card.uid) ? cardPower(card) : card.basePower + card.powerMod;
}

async function endTurn() {
  if (isRemoteControlledTurn()) return;
  if (game?.screen !== "game") return;
  triggerEffect("turn", {});
  await resolveEndTurnPassives(game.turnPlayer);
  const result = advanceTurnState(game);
  if (result.roundFinished) {
    await finishRound();
    return;
  }
  beginTurn();
  publishOnlineState({ type: "end_turn" });
}

async function resolveEndTurnPassives(player) {
  for (const item of collectBoardChoices(player, null)) {
    const card = item.card;
    if (card.silenced) continue;
    if (card.defId === 30) {
      const loc = Math.floor(Math.random() * 3);
      game.players[player].locBonus[loc] += 1;
      triggerEffect("buff", { player, loc });
      log(`Ogromna armata wzmacnia lokację ${loc + 1}.`);
    }
    if (card.defId === 37 && game.players[player].hand.length) {
      const discarded = await discardFromHand(player, "Przenośna niszczarka: odrzuć kartę.");
      if (discarded) {
        card.powerMod += 1;
        triggerEffect("buff", { cardUid: card.uid, player, loc: item.loc });
      }
    }
    if (card.defId === 45) {
      const victims = [...game.players[player].locations[item.loc]].filter((c) => c.baseThreshold !== 1);
      for (const victim of victims) await destroyBoardCard(victim.uid);
    }
  }
}

function scheduleBotTurn(delay = 450) {
  if (game?.screen !== "game" || !game.botEnabled || game.turnPlayer !== BOT_PLAYER || botActing || botTurnQueued) return;
  botTurnQueued = true;
  window.setTimeout(async () => {
    botTurnQueued = false;
    await runBotTurn();
  }, delay);
}

function bestBotCard(player) {
  return chooseBotCard(
    game.players[player].hand,
    (card) => canPlayCard(player, card),
    (card) => displayThreshold(player, card),
  );
}

function cardPowerPreview(card) {
  return botCardPowerPreview(card);
}

function bestBotTarget(player, card) {
  const enemy = opponent(player);
  return chooseBotTarget(card, {
    player,
    enemy,
    locations: [0, 1, 2],
    canPlayOwn: (loc) => canPlayTo(player, loc, card),
    canPlayEnemy: (loc) => canPlayTo(enemy, loc, card),
    ownPower: (loc) => locationPower(player, loc),
    enemyPower: (loc) => locationPower(enemy, loc),
  });
}
async function runBotTurn() {
  if (game?.screen !== "game" || !game.botEnabled || game.turnPlayer !== BOT_PLAYER || botActing) return;
  botActing = true;
  try {
    let guard = 0;
    let playedAny = false;
    while (game?.screen === "game" && game.turnPlayer === BOT_PLAYER && game.players[BOT_PLAYER].playsLeft > 0 && guard < 5) {
      guard++;
      const card = bestBotCard(BOT_PLAYER);
      if (!card) break;
      const target = bestBotTarget(BOT_PLAYER, card);
      if (!target) break;
      await playCardFromHand(BOT_PLAYER, card, target.player, target.loc);
      playedAny = true;
      await wait(220);
    }
    if (!playedAny && game?.screen === "game" && game.turnPlayer === BOT_PLAYER) log("Bot pasuje: brak możliwego zagrania.");
    if (game?.screen === "game" && game.turnPlayer === BOT_PLAYER) await endTurn();
  } finally {
    botActing = false;
    if (game?.screen === "game" && game.botEnabled && game.turnPlayer === BOT_PLAYER && !botTurnQueued) scheduleBotTurn(0);
  }
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function finishRound() {
  const { winner, powersA, powersB } = resolveRoundState(game, { locationPower, allBoardCards });
  if (winner === null) {
    log("Partia zakończona remisem. Powtarzamy bez punktu.");
  } else {
    log(`${playerName(winner)} wygrywa partię ${game.matchRound}.`);
    triggerEffect("win", {});
  }
  await showRoundSummary(winner, powersA, powersB);
  if (shouldFinishMatch(game)) {
    showMatchEnd();
    publishOnlineState({ type: "finish_match" });
    return;
  }
  await promoteExtraCards();
  game.matchRound++;
  startRound();
  publishOnlineState({ type: "finish_round" });
}

function showRoundSummary(winner, powersA, powersB) {
  return new Promise((resolve) => {
    const result = winner === null ? "Remis w partii" : `${playerName(winner)} wygrywa partię`;
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="dialog round-summary">
        <h2>Końcowy stan stołu</h2>
        <p class="meta">Partia ${game.matchRound}: ${result}. Wynik meczu ${game.scores[0]} - ${game.scores[1]}.</p>
        <div class="scorebar">
          ${[0, 1, 2].map((loc) => `
            <div class="scorebox">
              <strong>Lokacja ${loc + 1}</strong>
              <span>A ${powersA[loc]} : ${powersB[loc]} B</span>
              <span class="meta">${powersA[loc] === powersB[loc] ? "remis" : powersA[loc] > powersB[loc] ? "prowadzi A" : "prowadzi B"}</span>
            </div>
          `).join("")}
        </div>
        <div class="battlefield summary-board">
          ${[0, 1, 2].map((loc) => renderLocation(loc)).join("")}
        </div>
        <div class="actions">
          <button id="continueAfterRound" class="primary">Dalej</button>
        </div>
      </div>
    `;
    modal.querySelector("#continueAfterRound").addEventListener("click", () => {
      modal.classList.add("hidden");
      resolve();
    });
  });
}

async function promoteExtraCards() {
  const nextRound = game.matchRound + 1;
  for (const player of [0, 1]) {
    const p = game.players[player];
    if (!p.extraPool.length) continue;
    const options = p.extraPool
      .map((id) => CARDS.find((card) => card.id === id))
      .filter(Boolean);
    let selected = null;
    if (player === BOT_PLAYER && game.botEnabled) {
      selected = chooseBotExtra(options);
    } else {
      const wasBotActing = botActing;
      botActing = false;
      selected = await choose(`Przed partią ${nextRound}: ${playerName(player)} wybiera kartę dodatkową.`, options.map((card) => ({
        label: `${card.name} · próg ${card.threshold}, moc ${card.power}`,
        value: card,
      })), false, player);
      botActing = wasBotActing;
    }
    if (!selected) continue;
    promoteExtraCardState(game, player, selected);
    log(`${playerName(player)} dodaje ${selected.name} do talii podstawowej.`);
  }
}

function chooseBotExtra(options) {
  return chooseBestBotExtra(options);
}

function showMatchEnd(recordAction = true) {
  game.screen = "matchEnd";
  botTurnQueued = false;
  const result = matchResultText(game);
  if (recordAction) recordGameAction(game, { type: "finish_match", scores: [...game.scores], result });
  localStorage.removeItem(STORAGE_KEY);
  stopMusic();
  app.innerHTML = `
    <section class="screen">
      <div class="topbar">
        <div class="brand">
          <h1>${result}</h1>
          <span>Wynik: ${game.scores[0]} - ${game.scores[1]}</span>
        </div>
        <div class="actions">
          <button id="backMenu">Menu główne</button>
          <button id="backBuilder">Wróć do budowania talii</button>
        </div>
      </div>
      <section class="panel">
        <h2>Dziennik meczu</h2>
        <div class="log">${game.logs.map((entry) => `<span>${entry}</span>`).join("")}</div>
      </section>
      <section class="panel">
        <h2>Replay akcji</h2>
        ${renderReplayLog(40)}
      </section>
    </section>
  `;
  app.querySelector("#backMenu").addEventListener("click", renderMenu);
  app.querySelector("#backBuilder").addEventListener("click", renderBuilder);
}

function saveState() {
  const payload = {
    uid,
    selectedBuilderPlayer,
    botEnabledDraft,
    musicEnabled,
    sfxEnabled,
    builderFilters,
    deckDraft: serializeDeckDraftState(deckDraft),
    game,
    selectedHandUid,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function restoreState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const state = JSON.parse(raw);
    uid = state.uid || 1;
    selectedBuilderPlayer = state.selectedBuilderPlayer || 0;
    botEnabledDraft = state.botEnabledDraft ?? true;
    musicEnabled = state.musicEnabled ?? true;
    sfxEnabled = state.sfxEnabled ?? true;
    selectedHandUid = state.selectedHandUid || null;
    builderFilters = { ...builderFilters, ...(state.builderFilters || {}) };
    if (Array.isArray(state.deckDraft)) {
      state.deckDraft.forEach((draft, index) => {
        deckDraft[index].main = new Set(draft.main || []);
        deckDraft[index].extra = new Set(draft.extra || []);
      });
    }
    game = state.game || null;
    if (game) {
      ensureReplayState(game);
      game.roundStarter ??= game.turnPlayer ?? game.starter ?? 0;
      game.botEnabled ??= true;
      game.players?.forEach((player, index) => {
        player.extraPool ??= [...(player.extraIds || deckDraft[index].extra || [])];
        delete player.extraIds;
      });
    }
    return true;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

if (restoreState() && game) renderGame();
else renderMenu();
