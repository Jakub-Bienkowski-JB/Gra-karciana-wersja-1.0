export const EFFECT_KEYWORDS = {
  draw: "Dobieranie",
  tutor: "Wybór z talii",
  destroy: "Niszczenie",
  discard: "Odrzucanie",
  summon: "Przyzwanie",
  bounce: "Cofanie",
  silence: "Wyciszenie",
  buff: "Wzmocnienie",
  debuff: "Osłabienie",
  threshold: "Próg",
  extraPlay: "Dodatkowe zagranie",
  inspect: "Podgląd",
  exchange: "Wymiana",
  repeat: "Powtórzenie",
  graveyard: "Cmentarz",
  locationBonus: "Bonus lokacji",
  space: "Miejsca w lokacji",
};

export const CARD_EFFECTS = {
  1: ["draw"],
  2: ["bounce"],
  3: ["threshold"],
  4: ["locationBonus"],
  5: ["summon"],
  6: ["draw", "extraPlay"],
  7: ["destroy"],
  8: ["summon"],
  9: ["discard", "draw"],
  10: ["tutor"],
  11: ["destroy"],
  12: ["graveyard", "draw"],
  13: ["summon"],
  14: ["space"],
  15: ["buff"],
  16: ["destroy", "extraPlay"],
  17: ["exchange"],
  18: ["threshold"],
  19: ["repeat"],
  20: ["threshold"],
  21: ["extraPlay"],
  22: ["buff"],
  23: ["tutor", "discard"],
  24: ["draw"],
  25: ["debuff"],
  26: ["destroy"],
  27: ["destroy", "extraPlay"],
  28: ["inspect"],
  29: ["bounce"],
  30: ["locationBonus"],
  31: ["graveyard"],
  32: ["silence"],
  33: ["discard", "summon"],
  34: ["destroy", "summon"],
  35: ["threshold", "extraPlay"],
  36: ["discard", "draw"],
  37: ["discard", "buff"],
  38: ["discard"],
  39: ["discard", "buff"],
  40: ["discard", "locationBonus", "graveyard"],
  41: ["destroy"],
  42: ["buff"],
  43: ["discard", "summon"],
  44: ["buff"],
  45: ["destroy"],
  46: ["extraPlay"],
  47: ["destroy", "buff"],
  48: ["graveyard", "destroy"],
  49: ["summon"],
  50: ["debuff"],
};

export function keywordsForCard(card) {
  return CARD_EFFECTS[card.id] || [];
}

export function keywordLabelsForCard(card) {
  return keywordsForCard(card).map((keyword) => EFFECT_KEYWORDS[keyword] || keyword);
}

export function cardsWithKeyword(cards, keyword) {
  return cards.filter((card) => keywordsForCard(card).includes(keyword));
}

export function missingEffectDefinitions(cards) {
  return cards.filter((card) => !CARD_EFFECTS[card.id]).map((card) => card.id);
}
