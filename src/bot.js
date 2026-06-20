import { CARD_EFFECTS } from "./effects.js";

const KEYWORD_SCORE = {
  destroy: 2.2,
  tutor: 1.8,
  draw: 1.4,
  extraPlay: 1.3,
  summon: 1.1,
  buff: 1,
  silence: 0.9,
  bounce: 0.8,
  discard: 0.7,
  threshold: 0.6,
  locationBonus: 0.6,
  graveyard: 0.4,
  inspect: 0.2,
  exchange: 0.2,
  repeat: 0.2,
  debuff: 0,
  space: -0.5,
};

export function cardPowerPreview(card) {
  return card.basePower + card.powerMod;
}

export function cardKeywordScore(card) {
  return (CARD_EFFECTS[card.defId] || []).reduce((score, keyword) => score + (KEYWORD_SCORE[keyword] || 0), 0);
}

export function botCardScore(card, threshold) {
  const power = cardPowerPreview(card);
  const ownNegativePenalty = card.defId === 25 ? 0 : Math.max(0, -power) * 1.8;
  const highThresholdPenalty = threshold * 0.35;
  return power + cardKeywordScore(card) - highThresholdPenalty - ownNegativePenalty;
}

export function chooseBotCard(hand, canPlay, thresholdForCard) {
  return hand
    .filter(canPlay)
    .sort((a, b) => botCardScore(b, thresholdForCard(b)) - botCardScore(a, thresholdForCard(a)))[0] || null;
}

export function chooseBotTarget(card, context) {
  const targets = [];
  const preview = cardPowerPreview(card);

  for (const loc of context.locations) {
    if (context.canPlayOwn(loc)) {
      const own = context.ownPower(loc);
      const enemy = context.enemyPower(loc);
      const gap = enemy - own;
      const flipsLocation = own <= enemy && own + preview > enemy;
      const protectsLead = own > enemy && preview > 0;
      targets.push({
        player: context.player,
        loc,
        score: preview + gap * 0.65 + (flipsLocation ? 4 : 0) + (protectsLead ? 1.5 : 0) + cardKeywordScore(card),
      });
    }

    if (card.defId === 25 && context.canPlayEnemy(loc)) {
      const enemy = context.enemyPower(loc);
      targets.push({
        player: context.enemy,
        loc,
        score: Math.abs(preview) + enemy * 0.35 + 2,
      });
    }
  }

  return targets.sort((a, b) => b.score - a.score)[0] || null;
}

export function chooseBotExtra(options) {
  return [...options].sort((a, b) => {
    const scoreA = a.power + cardKeywordScore({ defId: a.id }) - a.threshold * 0.3;
    const scoreB = b.power + cardKeywordScore({ defId: b.id }) - b.threshold * 0.3;
    return scoreB - scoreA;
  })[0] || null;
}
