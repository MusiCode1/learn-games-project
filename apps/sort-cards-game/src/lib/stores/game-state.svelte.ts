/**
 * State Machine לניהול משחק מיון הכרטיסים
 */

import type { GameState, RoundData, ActiveCard, RoundDefinition, ContentPack } from "$lib/types";
import { settings } from "$lib/stores/settings.svelte";
import { getPackById, getDefaultPack } from "$lib/data/content-packs";
import { playSuccess, playError } from "$lib/utils/sound";
import { speakCorrect, speakWrong } from "$lib/utils/tts";
import { get } from "svelte/store";
import { boosterService } from "learn-booster-kit";

/**
 * ערבוב מערך (Fisher-Yates)
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

class GameStateStore {
  state = $state<GameState>("INIT");

  // נתוני סיבוב נוכחי
  round = $state<RoundData | null>(null);

  // חבילת תוכן נוכחית
  currentPack = $state<ContentPack | null>(null);

  // רשימת סיבובים לשחק
  roundQueue = $state<RoundDefinition[]>([]);
  currentRoundIndex = $state(0);

  // סטטיסטיקות
  roundNumber = $state(0);
  correctCount = $state(0);
  totalWrong = $state(0);
  winsSinceLastReward = $state(0);

  // cooldown
  cooldownUntilTs = $state(0);

  get isOnCooldown(): boolean {
    return Date.now() < this.cooldownUntilTs;
  }

  /** הכרטיס הנוכחי */
  get currentCard(): ActiveCard | null {
    if (!this.round) return null;
    return this.round.cards[this.round.currentCardIndex] ?? null;
  }

  /** כמה כרטיסים נותרו */
  get remainingCards(): number {
    if (!this.round) return 0;
    return this.round.cards.filter((c) => c.status === "pending" || c.status === "active").length;
  }

  /** סה״כ כרטיסים בסיבוב */
  get totalCardsInRound(): number {
    return this.round?.cards.length ?? 0;
  }

  /** כמה כרטיסים מוינו בסיבוב */
  get sortedCardsInRound(): number {
    if (!this.round) return 0;
    return this.round.cards.filter((c) => c.status === "sorted").length;
  }

  /** כמה כרטיסים מוינו לכל קטגוריה */
  getSortedCount(categoryId: string): number {
    if (!this.round) return 0;
    return this.round.cards.filter(
      (c) => c.status === "sorted" && c.categoryId === categoryId,
    ).length;
  }

  /**
   * התחלת משחק חדש
   */
  startGame(): void {
    const pack = getPackById(settings.contentPackId) ?? getDefaultPack();
    this.currentPack = pack;

    let rounds = [...pack.rounds];
    if (settings.shuffleRounds) {
      rounds = shuffle(rounds);
    }

    this.roundQueue = rounds;
    this.currentRoundIndex = 0;
    this.roundNumber = 0;
    this.correctCount = 0;
    this.totalWrong = 0;
    this.winsSinceLastReward = 0;

    this.startRound();
  }

  /**
   * התחלת סיבוב
   */
  startRound(): void {
    const def = this.roundQueue[this.currentRoundIndex];
    if (!def) {
      this.state = "GAME_COMPLETE";
      return;
    }

    let cards = [...def.cards];
    if (settings.shuffleCards) {
      cards = shuffle(cards);
    }

    // חיתוך לפי הגדרת cardsPerRound
    const limit = Math.min(settings.cardsPerRound, cards.length);
    cards = cards.slice(0, limit);

    const activeCards: ActiveCard[] = cards.map((c, i) => ({
      ...c,
      status: i === 0 ? "active" : "pending",
    }));

    this.round = {
      definition: def,
      cards: activeCards,
      currentCardIndex: 0,
      correctCount: 0,
      wrongCount: 0,
    };

    this.roundNumber++;
    this.state = "PLAYING";
  }

  /**
   * שליחת כרטיס לארגז
   */
  submitCard(cardId: string, categoryId: string): void {
    if (this.state !== "PLAYING" || !this.round) return;
    if (this.isOnCooldown) {
      if (settings.resetCooldownOnTap) {
        this.cooldownUntilTs = Date.now() + settings.cooldownMs;
        playError();
      }
      return;
    }

    const card = this.round.cards.find((c) => c.id === cardId);
    if (!card || card.status !== "active") return;

    if (card.categoryId === categoryId) {
      // נכון!
      card.status = "sorted";
      this.round.correctCount++;
      this.correctCount++;
      this.winsSinceLastReward++;
      this.state = "FEEDBACK_CORRECT";

      playSuccess();
      if (settings.voiceEnabled) {
        const category = this.round.definition.categories.find((c) => c.id === categoryId);
        const cardText = card.ttsText || card.content || undefined;
        speakCorrect(category?.name, cardText);
      }

      setTimeout(() => {
        this.advanceToNextCard();
      }, 800);
    } else {
      // טעות
      this.round.wrongCount++;
      this.totalWrong++;
      this.state = "FEEDBACK_WRONG";
      this.cooldownUntilTs = Date.now() + settings.cooldownMs;

      playError();
      if (settings.voiceEnabled) speakWrong();

      setTimeout(() => {
        if (this.state === "FEEDBACK_WRONG") {
          this.state = "PLAYING";
        }
      }, settings.cooldownMs);
    }
  }

  /**
   * מעבר לכרטיס הבא
   */
  private advanceToNextCard(): void {
    if (!this.round) return;

    // מציאת כרטיס pending הבא
    const nextIndex = this.round.cards.findIndex(
      (c, i) => i > this.round!.currentCardIndex && c.status === "pending",
    );

    if (nextIndex !== -1) {
      this.round.cards[nextIndex].status = "active";
      this.round.currentCardIndex = nextIndex;
      this.state = "PLAYING";
    } else {
      // כל הכרטיסים מוינו
      this.handleRoundComplete();
    }
  }

  /**
   * טיפול בסיום סיבוב
   */
  private handleRoundComplete(): void {
    const config = get(boosterService.config);
    const turnsForReward = config ? config.turnsPerReward : 3;

    if (settings.boosterEnabled && this.winsSinceLastReward >= turnsForReward) {
      this.state = "REWARD_TIME";
    } else {
      this.state = "ROUND_COMPLETE";
    }
  }

  /**
   * סיום פרס
   */
  completeReward(): void {
    this.winsSinceLastReward = 0;
    this.state = "ROUND_COMPLETE";
  }

  /**
   * מעבר לסיבוב הבא
   */
  nextRound(): void {
    this.currentRoundIndex++;
    if (this.currentRoundIndex >= this.roundQueue.length) {
      // חזרה להתחלה אם רוצים להמשיך
      if (settings.gameMode === "continuous") {
        this.currentRoundIndex = 0;
      } else {
        this.state = "GAME_COMPLETE";
        return;
      }
    }
    this.startRound();
  }

  /**
   * איפוס המשחק
   */
  reset(): void {
    this.state = "INIT";
    this.round = null;
    this.currentPack = null;
    this.roundQueue = [];
    this.currentRoundIndex = 0;
    this.roundNumber = 0;
    this.correctCount = 0;
    this.totalWrong = 0;
    this.winsSinceLastReward = 0;
    this.cooldownUntilTs = 0;
  }
}

// ייצוא singleton
export const gameState = new GameStateStore();
