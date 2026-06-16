const CARDS = [
  { id: 1, name: "Słodki Goblin", threshold: 1, power: 2, text: "Zagranie: Dobierz kartę.", tags: ["play"] },
  { id: 2, name: "Pojmany Ork", threshold: 4, power: 4, text: "Zagranie: Cofnij kartę przeciwnika z tej lokacji do jego ręki.", tags: ["play"] },
  { id: 3, name: "Wielofunkcyjny Robot", threshold: 2, power: 3, text: "Pasywka: Twoje karty mają obniżony próg o 1.", tags: ["passive"] },
  { id: 4, name: "Obsydianowy Król", threshold: 6, power: 0, text: "Zagranie: Jeżeli nie masz kart w talii, daj wszystkim twoim lokacjom +5 mocy.", tags: ["play"] },
  { id: 5, name: "Rogata Bestia", threshold: 1, power: 2, text: "Zagranie: Przyzwij Bojowego Konia z mocą 1 w tej lokacji.", tags: ["play"] },
  { id: 6, name: "Pomnik Wielkiej Królowej", threshold: 2, power: 1, text: "Pasywka: Gdy dobierzesz dwie karty podczas jednej tury, możesz zagrać dodatkową kartę w tej turze.", tags: ["passive"] },
  { id: 7, name: "Elektryczny Smok", threshold: 3, power: 3, text: "Zagranie: Zniszcz inną swoją kartę i kartę przeciwnika w tej lokacji.", tags: ["play"] },
  { id: 8, name: "Szmaragdowy Druid", threshold: 6, power: 0, text: "Zagranie: Zapełnij wszystkie miejsca w twoich lokacjach totemami z mocą 1.", tags: ["play"] },
  { id: 9, name: "Żywy Wulkan", threshold: 4, power: 3, text: "Zniszczenie: Odrzuć dowolną kartę. Dobierz dwie karty z talii.", tags: ["destroy"] },
  { id: 10, name: "Oszalały Górnik", threshold: 3, power: 2, text: "Zagranie: Dobierz dowolną kartę z twojej talii. Następnie ją przetasuj.", tags: ["play"] },
  { id: 11, name: "Zabójcza Strzała", threshold: 4, power: 3, text: "Zagranie: Zniszcz kartę przeciwnika z naprzeciwka.", tags: ["play"] },
  { id: 12, name: "Ożywieniec", threshold: 1, power: 3, text: "Zniszczenie: Dobierz kartę ze spodu cmentarza.", tags: ["destroy"] },
  { id: 13, name: "Radosny Pingwin", threshold: 5, power: 1, text: "Zniszczenie: Przyzwij w tej lokacji wściekłego Yeti z mocą 10.", tags: ["destroy"] },
  { id: 14, name: "Słoneczny Gigant", threshold: 5, power: 10, text: "Pasywka: Zajmuje wszystkie cztery miejsca w lokacji.", tags: ["passive"] },
  { id: 15, name: "Kwiat Pustki", threshold: 3, power: 0, text: "Pasywka: Otrzymuje +2 do mocy za każdą kartę przeciwnika w tej lokacji.", tags: ["passive"] },
  { id: 16, name: "Wieczny Sługa", threshold: 2, power: 1, text: "Pasywka: Gdy zniszczysz kartę w tej turze, możesz zagrać dodatkową kartę (raz na turę).", tags: ["passive"] },
  { id: 17, name: "Szalony Błazen", threshold: 3, power: 4, text: "Zagranie: Każdy gracz wybiera po jednej karcie ze swojej ręki. Wymieniacie się tymi kartami.", tags: ["play"] },
  { id: 18, name: "Maszyna Wojenna", threshold: 10, power: 8, text: "Próg tej karty zmniejsza się o 1 za każdą twoją kartę na polu bitwy.", tags: ["hand"] },
  { id: 19, name: "Miś Zwiadowca", threshold: 4, power: 2, text: "Zagranie: Powtórz Zagranie wybranej twojej karty z tej lokacji.", tags: ["play"] },
  { id: 20, name: "Tik-Tak", threshold: 1, power: 1, text: "Zagranie: Twoja kolejna zagrana karta ma próg obniżony o 1.", tags: ["play"] },
  { id: 21, name: "Złodziej Kart", threshold: 2, power: -2, text: "Zagranie: W kolejnej turze możesz zagrać dodatkową kartę.", tags: ["play"] },
  { id: 22, name: "Mroźny Kowal", threshold: 3, power: 2, text: "Pasywka: Twoje inne karty w tej lokacji mają +2 mocy.", tags: ["passive"] },
  { id: 23, name: "Zdradliwe życzenie", threshold: 4, power: 4, text: "Zagranie: Dobierz dwie dowolne karty z twojej talii. Jedną zachowaj, drugą odrzuć.", tags: ["play"] },
  { id: 24, name: "Oświecony ilustrator", threshold: 5, power: 3, text: "Zagranie: Dobierz kartę za każdą kartę przeciwnika w tej lokacji.", tags: ["play"] },
  { id: 25, name: "Złośliwy chochlik", threshold: 3, power: -3, text: "Ta karta może zostać zagrana do lokacji przeciwnika.", tags: ["special"] },
  { id: 26, name: "Kusznik wyborowy", threshold: 2, power: 2, text: "Zagranie: Zniszcz kartę przeciwnika z mocą 1 lub mniejszą.", tags: ["play"] },
  { id: 27, name: "Zagubiona dusza", threshold: 1, power: -1, text: "Zniszczenie: Gdy ta karta zostanie zniszczona podczas twojej tury, możesz zagrać dodatkową kartę.", tags: ["destroy"] },
  { id: 28, name: "Obserwator", threshold: 1, power: 3, text: "Zagranie: Spójrz na górną kartę przeciwnika z jego talii. Możesz ją zostawić lub przełożyć na spód.", tags: ["play"] },
  { id: 29, name: "Łowca dezerterów", threshold: 1, power: 2, text: "Zagranie: Cofnij swoją kartę do ręki z dowolnej lokacji.", tags: ["play"] },
  { id: 30, name: "Ogromna armata", threshold: 2, power: 2, text: "Pasywka: Na koniec tury daj losowej lokacji +1 do mocy.", tags: ["passive"] },
  { id: 31, name: "Hiena cmentarna", threshold: 2, power: 0, text: "Zagranie: Przełóż swój cmentarz do swojej talii, a następnie ją przetasuj.", tags: ["play"] },
  { id: 32, name: "Szalony alchemik", threshold: 1, power: -2, text: "Zagranie: Wycisz kartę przeciwnika w tej lokacji.", tags: ["play"] },
  { id: 33, name: "Krowi desant", threshold: 2, power: 3, text: "Gdy ta karta zostanie odrzucona, wyłóż ją do dowolnej twojej lokacji.", tags: ["discard"] },
  { id: 34, name: "Pajęczy kokon", threshold: 1, power: 1, text: "Zniszczenie: Do każdej twojej lokacji przyzwij jednego pająka o mocy 2.", tags: ["destroy"] },
  { id: 35, name: "Miotacz ognia", threshold: 2, power: 3, text: "Pasywka: Gdy zagrasz kartę o obniżonym progu, w tej turze możesz zagrać dodatkową kartę (raz na turę).", tags: ["passive"] },
  { id: 36, name: "Zapracowany farmer", threshold: 1, power: 1, text: "Gdy ta karta zostanie odrzucona, dobierz kartę.", tags: ["discard"] },
  { id: 37, name: "Przenośna niszczarka", threshold: 3, power: 0, text: "Pasywka: Na koniec tury odrzuć dowolną kartę. Za każdą odrzuconą kartę otrzymuje +1 do mocy.", tags: ["passive"] },
  { id: 38, name: "Groźny byk", threshold: 3, power: 4, text: "Gdy ta karta zostanie odrzucona, przeciwnik odrzuca kartę.", tags: ["discard"] },
  { id: 39, name: "Cyklamenowa Kostucha", threshold: 6, power: 0, text: "Zagranie: Odrzuć każdą kartę w ręku. Za każdą otrzymuje +2 do mocy.", tags: ["play"] },
  { id: 40, name: "Napędzany chomik", threshold: 2, power: 2, text: "Gdy ta karta zostanie odrzucona, daj wszystkim twoim lokacjom +1 do mocy i włóż ją na spód twojej talii.", tags: ["discard"] },
  { id: 41, name: "Cierpliwy Mnich", threshold: 4, power: 2, text: "Zagranie: Aktywuj Zniszczenie twojej karty w tej lokacji.", tags: ["play"] },
  { id: 42, name: "Hojny Baron", threshold: 6, power: 1, text: "Pasywka: Wszystkie inne twoje karty na polu bitwy mają +1 do mocy.", tags: ["passive"] },
  { id: 43, name: "Lustrzany Rycerz", threshold: 3, power: 4, text: "Zagranie: Odrzuć kartę. Jeżeli to karta o progu 1, wyłóż ją do dowolnej lokacji.", tags: ["play"] },
  { id: 44, name: "Mag wiecznej zimy", threshold: 1, power: 0, text: "Pasywka: Twoje inne karty na polu bitwy o progu 1 mają +1 do mocy.", tags: ["passive"] },
  { id: 45, name: "Armia \"Zimowe uderzenie\"", threshold: 1, power: 4, text: "Pasywka: Na koniec tury zniszcz wszystkie twoje karty w tej lokacji, które nie mają progu 1.", tags: ["passive"] },
  { id: 46, name: "Zimowa Kawaleria", threshold: 1, power: -1, text: "Zagranie: Jeżeli posiadasz w tej lokacji trzy inne karty o progu 1, możesz zagrać dwie dodatkowe karty w tej turze.", tags: ["play"] },
  { id: 47, name: "Obozowy kucharz", threshold: 3, power: 3, text: "Zniszczenie: Daj twoim kartom w tej lokacji +2 do mocy.", tags: ["destroy"] },
  { id: 48, name: "Siewca śmierci", threshold: 6, power: -2, text: "Zagranie: Jeżeli w twoim stosie kart zniszczonych jest co najmniej 6 kart, zniszcz dwie karty przeciwnika na polu bitwy.", tags: ["play"] },
  { id: 49, name: "Dzwonnik zwycięstwa", threshold: 5, power: 4, text: "Zagranie: Wyłóż kartę z wierzchu twojej talii do dowolnej lokacji.", tags: ["play"] },
  { id: 50, name: "Wilkołak z Wiśniowego Lasu", threshold: 4, power: 10, text: "Pasywka: Twoje karty na polu bitwy mają -1 do mocy.", tags: ["passive"] },
];

const TOKENS = {
  horse: { id: "token-horse", name: "Bojowy Koń", threshold: 1, power: 1, text: "Token.", tags: [] },
  totem: { id: "token-totem", name: "Totem", threshold: 1, power: 1, text: "Token.", tags: [] },
  yeti: { id: "token-yeti", name: "Wściekły Yeti", threshold: 1, power: 10, text: "Token.", tags: [] },
  spider: { id: "token-spider", name: "Pająk", threshold: 1, power: 2, text: "Token.", tags: [] },
};

const CARD_IMAGES = {
  1: "Słodki Goblin.png",
  2: "Pojmany Ork.png",
  3: "Wielofunkcyjny Robot.png",
  4: "Obsydianowy Król.png",
  5: "Rogata Bestia.png",
  6: "Pomnik Wielkiej Królowej.png",
  7: "Elektryczny Smok.png",
  8: "Szmaragdowy Druid.png",
  9: "Ożywiony Wulkan.png",
  10: "Oszalały Górnik.png",
  11: "Zabójcza Strzała.png",
  12: "Ożywieniec.png",
  13: "Radosny Pingwin.png",
  14: "Słoneczny Gigant.png",
  15: "Kwiat Pustki.png",
  16: "Wieczny Sługa.png",
  17: "Szalony Błazen.png",
  18: "Maszyna Wojenna.png",
  19: "Miś Zwiadowca.png",
  20: "Tik-Tak.png",
  21: "Złodziej Kart.png",
  22: "Mroźny Kowal.png",
  "token-horse": "Minion Rogatej Bestii.png",
  "token-totem": "Minion Szmaragdowego Druida.png",
  "token-yeti": "Minion Radosnego Pingwinka.png",
};

const app = document.querySelector("#app");
const modal = document.querySelector("#modal");
const STORAGE_KEY = "gra-karciana-v1-state";
let uid = 1;
let selectedBuilderPlayer = 0;
let selectedHandUid = null;
let game = null;
let builderFilters = {
  query: "",
  tag: "all",
  sort: "id",
};

const deckDraft = [
  { main: new Set(), extra: new Set() },
  { main: new Set(), extra: new Set() },
];

const TAG_LABELS = {
  all: "Wszystkie",
  play: "Zagranie",
  passive: "Pasywka",
  destroy: "Zniszczenie",
  discard: "Odrzucenie",
  hand: "Ręka",
  special: "Specjalne",
};

const LOCATION_RULES = {
  academy: {
    name: "Akademia Progu",
    text: "Karty o progu 1 mają tutaj +1 mocy.",
    bonus(card) {
      return card.baseThreshold === 1 ? 1 : 0;
    },
  },
  foundry: {
    name: "Kuźnia Kolosów",
    text: "Karty o mocy bazowej 4 lub większej mają tutaj +1 mocy.",
    bonus(card) {
      return card.basePower >= 4 ? 1 : 0;
    },
  },
  ruins: {
    name: "Ciche Ruiny",
    text: "Wyciszone karty nie tracą tutaj mocy bazowej, ale nie dostają premii.",
    bonus() {
      return 0;
    },
  },
  grove: {
    name: "Szmaragdowy Gaj",
    text: "Tokeny mają tutaj +1 mocy.",
    bonus(card) {
      return card.token ? 1 : 0;
    },
  },
  arena: {
    name: "Arena Królowej",
    text: "Pierwsza karta każdego gracza w tej lokacji ma +2 mocy.",
    bonus(card, locationCards) {
      return locationCards[0]?.uid === card.uid ? 2 : 0;
    },
  },
};

const LOCATION_POOL = Object.keys(LOCATION_RULES);

function cloneDef(def, owner) {
  return {
    uid: uid++,
    defId: def.id,
    token: typeof def.id === "string",
    name: def.name,
    baseThreshold: def.threshold,
    basePower: def.power,
    text: def.text,
    tags: [...def.tags],
    owner,
    controller: owner,
    powerMod: 0,
    thresholdMod: 0,
    silenced: false,
  };
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function playerName(index) {
  return index === 0 ? "Gracz A" : "Gracz B";
}

function cardImage(id) {
  const file = CARD_IMAGES[id];
  return file ? `ikony/${encodeURIComponent(file)}` : "";
}

function renderCardArt(id, name, size = "large") {
  const src = cardImage(id);
  if (!src) return `<div class="card-art card-art-${size} placeholder">${name.slice(0, 1)}</div>`;
  return `<img class="card-art card-art-${size}" src="${src}" alt="${name}" loading="lazy" />`;
}

function opponent(index) {
  return index === 0 ? 1 : 0;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function primaryTag(card) {
  return card.tags.find((tag) => tag !== "hand") || card.tags[0] || "special";
}

function renderTagBadge(card) {
  const tag = primaryTag(card);
  return `<span class="tag tag-${tag}">${TAG_LABELS[tag] || "Efekt"}</span>`;
}

function filteredCards() {
  const query = builderFilters.query.trim().toLowerCase();
  return CARDS.filter((card) => {
    const matchesQuery = !query || `${card.name} ${card.text}`.toLowerCase().includes(query);
    const matchesTag = builderFilters.tag === "all" || card.tags.includes(builderFilters.tag);
    return matchesQuery && matchesTag;
  }).sort((a, b) => {
    if (builderFilters.sort === "threshold") return a.threshold - b.threshold || a.id - b.id;
    if (builderFilters.sort === "power") return b.power - a.power || a.id - b.id;
    if (builderFilters.sort === "name") return a.name.localeCompare(b.name, "pl");
    return a.id - b.id;
  });
}

function cardsFromSet(set) {
  return [...set].map((id) => CARDS.find((card) => card.id === id)).filter(Boolean);
}

function renderBuilder() {
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

function startMatch() {
  localStorage.removeItem(STORAGE_KEY);
  game = {
    screen: "game",
    matchRound: 1,
    roundTurn: 0,
    turnPlayer: Math.random() < 0.5 ? 0 : 1,
    starter: 0,
    scores: [0, 0],
    logs: [],
    locations: [],
    players: [createMatchPlayer(0), createMatchPlayer(1)],
  };
  game.starter = game.turnPlayer;
  startRound();
}

function createMatchPlayer(index) {
  return {
    mainIds: [...deckDraft[index].main],
    extraIds: [...deckDraft[index].extra],
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

function startRound() {
  selectedHandUid = null;
  game.roundTurn = 1;
  game.locations = shuffle(LOCATION_POOL).slice(0, 3);
  game.turnPlayer = game.matchRound === 1 ? game.starter : opponent(game.starter);
  if (game.matchRound % 2 === 1) game.turnPlayer = game.starter;
  else game.turnPlayer = opponent(game.starter);
  game.players.forEach((p, index) => {
    const activeIds = [...p.mainIds, ...p.extraIds.slice(0, Math.max(0, game.matchRound - 1))];
    p.deck = shuffle(activeIds.map((id) => cloneDef(CARDS.find((c) => c.id === id), index)));
    p.hand = [];
    p.grave = [];
    p.locations = [[], [], []];
    p.locBonus = [0, 0, 0];
    p.playsLeft = 1;
    p.nextTurnExtra = 0;
    p.nextThresholdBonus = 0;
    for (let i = 0; i < 3; i++) drawCard(index, false);
  });
  log(`Partia ${game.matchRound}. Zaczyna ${playerName(game.turnPlayer)}.`);
  beginTurn();
}

function beginTurn() {
  const p = game.players[game.turnPlayer];
  p.playsLeft = 1 + p.nextTurnExtra;
  p.nextTurnExtra = 0;
  p.destroyedThisTurn = 0;
  p.servantUsed = false;
  p.flamethrowerUsed = false;
  p.drawsThisTurn = 0;
  drawCard(game.turnPlayer, true);
  renderGame();
}

function currentHandCard() {
  if (!game || !selectedHandUid) return null;
  return game.players[game.turnPlayer].hand.find((card) => card.uid === selectedHandUid) || null;
}

function locationRule(loc) {
  return LOCATION_RULES[game.locations?.[loc]] || { name: `Lokacja ${loc + 1}`, text: "Brak specjalnej reguły.", bonus: () => 0 };
}

function canPlayTo(targetPlayer, loc, card = currentHandCard()) {
  if (!card || !canPlayCard(game.turnPlayer, card)) return false;
  if (targetPlayer !== game.turnPlayer && card.defId !== 25) return false;
  return hasSpace(targetPlayer, loc, card);
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
  if (!p.deck.length) return null;
  const card = p.deck.shift();
  p.hand.push(card);
  if (countForTurn) {
    p.drawsThisTurn++;
    if (p.drawsThisTurn === 2 && hasOnBoard(player, 6)) {
      p.playsLeft++;
      log(`${playerName(player)} aktywuje Pomnik Wielkiej Królowej: dodatkowe zagranie.`);
    }
  }
  return card;
}

function log(text) {
  game.logs.unshift(text);
  game.logs = game.logs.slice(0, 80);
}

function renderGame() {
  const tp = game.players[game.turnPlayer];
  const playsLeft = tp.playsLeft;
  app.innerHTML = `
    <section class="screen">
      <div class="topbar gamebar">
        <div class="brand">
          <h1>Gra karciana wersja 1.0</h1>
          <span>Partia ${game.matchRound}/4, tura ${game.roundTurn}/6, ruch: ${playerName(game.turnPlayer)}</span>
        </div>
        <div class="turn-strip">
          <span>Zagrania <strong>${playsLeft}</strong></span>
          <span>Talia <strong>${tp.deck.length}</strong></span>
          <span>Cmentarz <strong>${tp.grave.length}</strong></span>
        </div>
        <div class="actions">
          <button id="endTurn" class="primary">Zakończ turę</button>
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
            <div class="hand">${tp.hand.map((card) => renderHandCard(card)).join("") || "<p class='hint'>Brak kart na ręce.</p>"}</div>
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
        </aside>
      </div>
    </section>
  `;
  app.querySelector("#endTurn").addEventListener("click", endTurn);
  app.querySelector("#newMatch").addEventListener("click", () => {
    game = null;
    localStorage.removeItem(STORAGE_KEY);
    renderBuilder();
  });
  app.querySelectorAll("[data-hand]").forEach((el) => {
    el.addEventListener("click", () => {
      selectedHandUid = Number(el.dataset.hand);
      renderGame();
    });
  });
  app.querySelectorAll("[data-drop]").forEach((el) => {
    el.addEventListener("click", () => playSelected(Number(el.dataset.player), Number(el.dataset.drop)));
  });
  saveState();
}

function renderScoreBox(i) {
  const a = locationPower(0, i);
  const b = locationPower(1, i);
  const label = a === b ? "remis" : a > b ? "prowadzi A" : "prowadzi B";
  return `<div class="scorebox"><strong>Lokacja ${i + 1}</strong><span>A ${a} : ${b} B</span><span class="meta">${label}</span></div>`;
}

function renderLocation(i) {
  const rule = locationRule(i);
  const a = locationPower(0, i);
  const b = locationPower(1, i);
  const leadClass = a === b ? "tie" : a > b ? "lead-a" : "lead-b";
  return `
    <section class="location ${leadClass}">
      <div class="zone ${canPlayTo(1, i) ? "legal-target" : ""}" data-player="1" data-drop="${i}">${game.players[1].locations[i].map(renderBoardCard).join("")}</div>
      <div class="loc-title">
        <strong>${rule.name}</strong>
        <span>${rule.text}</span>
      </div>
      <div class="zone ${canPlayTo(0, i) ? "legal-target" : ""}" data-player="0" data-drop="${i}">${game.players[0].locations[i].map(renderBoardCard).join("")}</div>
    </section>
  `;
}

function renderBoardCard(card) {
  return `
    <article class="mini-card ${card.silenced ? "silenced" : ""}">
      ${renderCardArt(card.defId, card.name, "small")}
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
        <span class="pill threshold">Próg ${effectiveThreshold(game.turnPlayer, card)}</span>
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
  value += locationRule(loc.loc).bonus(card, game.players[player].locations[loc.loc]);
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

function effectiveThreshold(player, card) {
  let value = card.baseThreshold + card.thresholdMod;
  if (card.defId === 18) value -= allBoardCards(player).length;
  allBoardCards(player).forEach((boardCard) => {
    if (!boardCard.silenced && boardCard.defId === 3) value -= 1;
  });
  if (game.turnPlayer === player && game.players[player].nextThresholdBonus && selectedHandUid === card.uid) value -= game.players[player].nextThresholdBonus;
  return Math.max(1, value);
}

function canPlayCard(player, card) {
  return game.turnPlayer === player && game.players[player].playsLeft > 0 && effectiveThreshold(player, card) <= game.roundTurn;
}

async function playSelected(targetPlayer, loc) {
  if (!selectedHandUid) return;
  const player = game.turnPlayer;
  const p = game.players[player];
  const card = p.hand.find((c) => c.uid === selectedHandUid);
  if (!card || !canPlayCard(player, card)) return;
  if (!canPlayTo(targetPlayer, loc, card)) {
    log(`Brak miejsca w lokacji ${loc + 1}.`);
    renderGame();
    return;
  }
  const lowered = effectiveThreshold(player, card) < card.baseThreshold;
  p.hand = p.hand.filter((c) => c.uid !== card.uid);
  card.controller = targetPlayer;
  game.players[targetPlayer].locations[loc].push(card);
  p.playsLeft--;
  selectedHandUid = null;
  log(`${playerName(player)} zagrywa ${card.name} do lokacji ${loc + 1}.`);
  if (lowered && hasOnBoard(player, 35) && !p.flamethrowerUsed) {
    p.playsLeft++;
    p.flamethrowerUsed = true;
    log("Miotacz ognia daje dodatkowe zagranie.");
  }
  if (p.nextThresholdBonus) p.nextThresholdBonus = 0;
  await resolvePlayEffect(card, loc, player);
  renderGame();
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
      if (!p.deck.length) p.locBonus = p.locBonus.map((v) => v + 5);
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
      await destroyChosen(enemy, loc, "Wybierz kartę przeciwnika z naprzeciwka.");
      break;
    case 17:
      await swapHandCards(actor, enemy);
      break;
    case 19:
      await repeatPlay(actor, loc, card.uid);
      break;
    case 20:
      p.nextThresholdBonus += 1;
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
      await bounceAnyOwn(actor);
      break;
    case 31:
      p.deck = shuffle([...p.deck, ...p.grave]);
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

async function destroyChosen(player, loc, title, filter = () => true) {
  const cards = collectBoardChoices(player, loc).filter(({ card }) => filter(card));
  if (!cards.length) return null;
  const choice = await choose(title, cards.map((item) => ({ label: `${item.card.name} (L${item.loc + 1})`, value: item })), true);
  if (choice) await destroyBoardCard(choice.card.uid);
  return choice;
}

async function destroyBoardCard(cardUid) {
  const pos = findCardLocation(cardUid);
  if (!pos) return;
  const p = game.players[pos.player];
  const [card] = p.locations[pos.loc].splice(pos.index, 1);
  if (!card.silenced) await resolveDestroyEffect(card, pos.loc, pos.player);
  card.powerMod = 0;
  card.thresholdMod = 0;
  card.silenced = false;
  game.players[card.owner].grave.unshift(card);
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
      if (bottom) game.players[controller].hand.push(bottom);
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
      });
      break;
  }
}

function summon(player, loc, card) {
  if (!hasSpace(player, loc, card)) return false;
  card.controller = player;
  game.players[player].locations[loc].push(card);
  log(`${playerName(player)} wykłada ${card.name} do lokacji ${loc + 1}.`);
  return true;
}

async function discardCard(player, card) {
  const p = game.players[player];
  p.hand = p.hand.filter((c) => c.uid !== card.uid);
  log(`${playerName(player)} odrzuca ${card.name}.`);
  if (!card.silenced) {
    if (card.defId === 33) {
      const loc = await chooseLocation(player, "Krowi desant: wybierz lokację.");
      if (loc !== null) summon(player, loc, card);
      return;
    }
    if (card.defId === 36) drawCard(player, true);
    if (card.defId === 38) await discardFromHand(opponent(player), "Groźny byk: przeciwnik odrzuca kartę.");
    if (card.defId === 40) {
      p.locBonus = p.locBonus.map((v) => v + 1);
      p.deck.push(card);
      return;
    }
  }
  p.grave.unshift(card);
}

async function discardFromHand(player, title) {
  const p = game.players[player];
  if (!p.hand.length) return null;
  const card = await choose(title, p.hand.map((c) => ({ label: c.name, value: c })), true);
  if (card) await discardCard(player, card);
  return card;
}

async function bounceCard(player, loc, title) {
  const choices = collectBoardChoices(player, loc);
  if (!choices.length) return;
  const item = await choose(title, choices.map((x) => ({ label: `${x.card.name} (L${x.loc + 1})`, value: x })), true);
  if (!item) return;
  game.players[player].locations[item.loc] = game.players[player].locations[item.loc].filter((c) => c.uid !== item.card.uid);
  item.card.controller = item.card.owner;
  game.players[item.card.owner].hand.push(item.card);
}

async function bounceAnyOwn(player) {
  await bounceCard(player, null, "Łowca dezerterów: wybierz swoją kartę do cofnięcia.");
}

async function silenceChosen(player, loc) {
  const item = await choose("Wycisz kartę przeciwnika.", collectBoardChoices(player, loc).map((x) => ({ label: x.card.name, value: x })), true);
  if (!item) return;
  item.card.silenced = true;
  item.card.powerMod = 0;
  item.card.thresholdMod = 0;
}

async function tutor(player, count) {
  const p = game.players[player];
  for (let i = 0; i < count; i++) {
    if (!p.deck.length) return;
    const card = await choose("Dobierz kartę z talii.", p.deck.map((c) => ({ label: c.name, value: c })), false);
    p.deck = p.deck.filter((c) => c.uid !== card.uid);
    p.hand.push(card);
  }
}

async function treacherousWish(player) {
  const p = game.players[player];
  if (!p.deck.length) return;
  const first = await choose("Zdradliwe życzenie: wybierz pierwszą kartę.", p.deck.map((c) => ({ label: c.name, value: c })), false);
  p.deck = p.deck.filter((c) => c.uid !== first.uid);
  if (!p.deck.length) {
    p.hand.push(first);
    return;
  }
  const second = await choose("Zdradliwe życzenie: wybierz drugą kartę.", p.deck.map((c) => ({ label: c.name, value: c })), false);
  p.deck = p.deck.filter((c) => c.uid !== second.uid);
  const keep = await choose("Którą kartę zachować?", [first, second].map((c) => ({ label: c.name, value: c })), false);
  const discard = keep.uid === first.uid ? second : first;
  p.hand.push(keep);
  await discardCard(player, discard);
}

async function swapHandCards(a, b) {
  if (!game.players[a].hand.length || !game.players[b].hand.length) return;
  const ca = await choose(`${playerName(a)} wybiera kartę do wymiany.`, game.players[a].hand.map((c) => ({ label: c.name, value: c })), false);
  const cb = await choose(`${playerName(b)} wybiera kartę do wymiany.`, game.players[b].hand.map((c) => ({ label: c.name, value: c })), false);
  game.players[a].hand = game.players[a].hand.filter((c) => c.uid !== ca.uid);
  game.players[b].hand = game.players[b].hand.filter((c) => c.uid !== cb.uid);
  ca.owner = b;
  cb.owner = a;
  game.players[a].hand.push(cb);
  game.players[b].hand.push(ca);
}

async function repeatPlay(player, loc, sourceUid) {
  const choices = game.players[player].locations[loc].filter((c) => c.uid !== sourceUid && !c.silenced && c.tags.includes("play"));
  if (!choices.length) return;
  const card = await choose("Miś Zwiadowca: wybierz Zagranie do powtórzenia.", choices.map((c) => ({ label: c.name, value: c })), true);
  if (card) await resolvePlayEffect(card, loc, player);
}

async function observer(actor, enemy) {
  const top = game.players[enemy].deck[0];
  if (!top) return;
  const action = await choose(`Górna karta przeciwnika: ${top.name}`, [
    { label: "Zostaw na górze", value: "top" },
    { label: "Przełóż na spód", value: "bottom" },
  ], false);
  if (action === "bottom") game.players[enemy].deck.push(game.players[enemy].deck.shift());
}

async function triggerDestroyAbility(player, loc) {
  const choices = game.players[player].locations[loc].filter((c) => c.tags.includes("destroy") && !c.silenced);
  if (!choices.length) return;
  const card = await choose("Aktywuj Zniszczenie swojej karty.", choices.map((c) => ({ label: c.name, value: c })), true);
  if (card) await resolveDestroyEffect(card, loc, player);
}

async function mirrorKnight(player) {
  const card = await discardFromHand(player, "Lustrzany Rycerz: odrzuć kartę.");
  if (card && card.baseThreshold === 1) {
    const loc = await chooseLocation(player, "Wyłóż odrzuconą kartę do lokacji.");
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
  const loc = await chooseLocation(player, "Dzwonnik zwycięstwa: wybierz lokację.");
  if (loc !== null && summon(player, loc, card)) return;
  game.players[player].grave.unshift(card);
}

function collectBoardChoices(player, loc) {
  const result = [];
  const locs = loc === null ? [0, 1, 2] : [loc];
  locs.forEach((l) => game.players[player].locations[l].forEach((card) => result.push({ player, loc: l, card })));
  return result;
}

function chooseLocation(player, title) {
  const choices = [0, 1, 2]
    .filter((loc) => hasSpace(player, loc, { defId: 0 }))
    .map((loc) => ({ label: `Lokacja ${loc + 1}`, value: loc }));
  return choose(title, choices, true);
}

function choose(title, choices, allowCancel) {
  return new Promise((resolve) => {
    modal.classList.remove("hidden");
    modal.innerHTML = `
      <div class="dialog">
        <h2>${title}</h2>
        <div class="choice-grid">
          ${choices.map((choice, index) => `<button data-choice="${index}">${choice.label}</button>`).join("")}
          ${allowCancel ? `<button data-cancel="1">Pomiń</button>` : ""}
        </div>
      </div>
    `;
    modal.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        modal.classList.add("hidden");
        resolve(choices[Number(button.dataset.choice)].value);
      });
    });
    const cancel = modal.querySelector("[data-cancel]");
    if (cancel) cancel.addEventListener("click", () => {
      modal.classList.add("hidden");
      resolve(null);
    });
  });
}

async function endTurn() {
  await resolveEndTurnPassives(game.turnPlayer);
  if (game.turnPlayer === opponent(game.starter)) game.roundTurn++;
  if (game.roundTurn > 6) {
    finishRound();
    return;
  }
  game.turnPlayer = opponent(game.turnPlayer);
  beginTurn();
}

async function resolveEndTurnPassives(player) {
  for (const item of collectBoardChoices(player, null)) {
    const card = item.card;
    if (card.silenced) continue;
    if (card.defId === 30) {
      const loc = Math.floor(Math.random() * 3);
      game.players[player].locBonus[loc] += 1;
      log(`Ogromna armata wzmacnia lokację ${loc + 1}.`);
    }
    if (card.defId === 37 && game.players[player].hand.length) {
      const discarded = await discardFromHand(player, "Przenośna niszczarka: odrzuć kartę.");
      if (discarded) card.powerMod += 1;
    }
    if (card.defId === 45) {
      const victims = [...game.players[player].locations[item.loc]].filter((c) => c.baseThreshold !== 1);
      for (const victim of victims) await destroyBoardCard(victim.uid);
    }
  }
}

function finishRound() {
  const powersA = [0, 1, 2].map((loc) => locationPower(0, loc));
  const powersB = [0, 1, 2].map((loc) => locationPower(1, loc));
  let winsA = 0;
  let winsB = 0;
  powersA.forEach((power, loc) => {
    if (power > powersB[loc]) winsA++;
    if (power < powersB[loc]) winsB++;
  });
  let winner = null;
  if (winsA > winsB) winner = 0;
  else if (winsB > winsA) winner = 1;
  else {
    const totalA = powersA.reduce((a, b) => a + b, 0);
    const totalB = powersB.reduce((a, b) => a + b, 0);
    if (totalA > totalB) winner = 0;
    else if (totalB > totalA) winner = 1;
    else {
      const cardsA = allBoardCards(0).length;
      const cardsB = allBoardCards(1).length;
      if (cardsA < cardsB) winner = 0;
      else if (cardsB < cardsA) winner = 1;
    }
  }
  if (winner === null) {
    log("Partia zakończona remisem. Powtarzamy bez punktu.");
  } else {
    game.scores[winner]++;
    log(`${playerName(winner)} wygrywa partię ${game.matchRound}.`);
  }
  if (game.scores[0] >= 3 || game.scores[1] >= 3 || game.matchRound >= 4) {
    showMatchEnd();
    return;
  }
  game.matchRound++;
  startRound();
}

function showMatchEnd() {
  const result = game.scores[0] === game.scores[1] ? "Mecz kończy się remisem." : `${playerName(game.scores[0] > game.scores[1] ? 0 : 1)} wygrywa mecz.`;
  localStorage.removeItem(STORAGE_KEY);
  app.innerHTML = `
    <section class="screen">
      <div class="topbar">
        <div class="brand">
          <h1>${result}</h1>
          <span>Wynik: ${game.scores[0]} - ${game.scores[1]}</span>
        </div>
        <button id="backBuilder">Wróć do budowania talii</button>
      </div>
      <section class="panel">
        <h2>Dziennik meczu</h2>
        <div class="log">${game.logs.map((entry) => `<span>${entry}</span>`).join("")}</div>
      </section>
    </section>
  `;
  app.querySelector("#backBuilder").addEventListener("click", renderBuilder);
}

function serializeDeckDraft() {
  return deckDraft.map((draft) => ({
    main: [...draft.main],
    extra: [...draft.extra],
  }));
}

function saveState() {
  const payload = {
    uid,
    selectedBuilderPlayer,
    builderFilters,
    deckDraft: serializeDeckDraft(),
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
    selectedHandUid = state.selectedHandUid || null;
    builderFilters = { ...builderFilters, ...(state.builderFilters || {}) };
    if (Array.isArray(state.deckDraft)) {
      state.deckDraft.forEach((draft, index) => {
        deckDraft[index].main = new Set(draft.main || []);
        deckDraft[index].extra = new Set(draft.extra || []);
      });
    }
    game = state.game || null;
    return true;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

if (restoreState() && game) renderGame();
else renderBuilder();
