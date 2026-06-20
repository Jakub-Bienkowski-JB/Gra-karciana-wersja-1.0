export const BOT_PLAYER = 1;
export const MAX_LOCATION_SLOTS = 4;

export function opponent(index) {
  return index === 0 ? 1 : 0;
}

export function playerName(index) {
  return index === 0 ? "Gracz A" : "Gracz B";
}

export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createCardInstance(def, owner, uid) {
  return {
    uid,
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

export function resetCardEffects(card) {
  card.powerMod = 0;
  card.thresholdMod = 0;
  card.silenced = false;
  return card;
}

export function moveCardToPrivateZone(card, player) {
  resetCardEffects(card);
  card.owner = player;
  card.controller = player;
  return card;
}

export function cardImagePath(id, images, basePath = "ikony") {
  const file = images[id];
  return file ? `${basePath}/${encodeURIComponent(file)}` : "";
}

export function primaryTag(card) {
  return card.tags.find((tag) => tag !== "hand") || card.tags[0] || "special";
}

export function filterAndSortCards(cards, filters) {
  const query = filters.query.trim().toLowerCase();
  return cards.filter((card) => {
    const matchesQuery = !query || `${card.name} ${card.text}`.toLowerCase().includes(query);
    const matchesTag = filters.tag === "all" || card.tags.includes(filters.tag);
    return matchesQuery && matchesTag;
  }).sort((a, b) => compareCards(a, b, filters.sort));
}

export function compareCards(a, b, sort) {
  if (sort === "threshold") return a.threshold - b.threshold || a.id - b.id;
  if (sort === "power") return b.power - a.power || a.id - b.id;
  if (sort === "name") return a.name.localeCompare(b.name, "pl");
  return a.id - b.id;
}

export function slotCost(card) {
  return card.defId === 14 && !card.silenced ? MAX_LOCATION_SLOTS : 1;
}

export function usedLocationSlots(cards) {
  return cards.reduce((sum, card) => sum + slotCost(card), 0);
}

export function hasSpaceForCard(cards, card) {
  return usedLocationSlots(cards) + slotCost(card) <= MAX_LOCATION_SLOTS;
}

export function evaluateRoundWinner(powersA, powersB, cardsA = 0, cardsB = 0) {
  let winsA = 0;
  let winsB = 0;
  powersA.forEach((power, loc) => {
    if (power > powersB[loc]) winsA++;
    if (power < powersB[loc]) winsB++;
  });
  if (winsA > winsB) return 0;
  if (winsB > winsA) return 1;

  const totalA = powersA.reduce((a, b) => a + b, 0);
  const totalB = powersB.reduce((a, b) => a + b, 0);
  if (totalA > totalB) return 0;
  if (totalB > totalA) return 1;
  if (cardsA < cardsB) return 0;
  if (cardsB < cardsA) return 1;
  return null;
}

export function serializeDeckDraft(deckDraft) {
  return deckDraft.map((draft) => ({
    main: [...draft.main],
    extra: [...draft.extra],
  }));
}
