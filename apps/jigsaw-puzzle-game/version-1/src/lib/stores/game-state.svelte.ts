/**
 * State Machine לניהול משחק הפאזל
 */

import type { GamePhase, PuzzleImage, ImagePack } from "$lib/types";
import { GRID_PRESETS } from "$lib/types";
import { settings } from "$lib/stores/settings.svelte";
import { getPackById, getDefaultPack } from "$lib/data/image-packs";
import { playSnap, playSuccess } from "$lib/utils/sound";
import { speakComplete } from "$lib/utils/tts";
import { get } from "svelte/store";
import { boosterService } from "learn-booster-kit";

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

class GameStateStore {
  phase = $state<GamePhase>("INIT");

  // חבילת תמונות נוכחית
  currentPack = $state<ImagePack | null>(null);

  // תור תמונות לשחק
  imageQueue = $state<PuzzleImage[]>([]);
  currentImageIndex = $state(0);

  // התמונה הנוכחית
  currentImage = $state<PuzzleImage | null>(null);

  // סטטיסטיקות
  connectedPieces = $state(0);
  totalPieces = $state(0);
  puzzlesSolved = $state(0);
  winsSinceLastReward = $state(0);

  get currentGrid() {
    return GRID_PRESETS[settings.gridPresetIndex] ?? GRID_PRESETS[0];
  }

  /**
   * התחלת משחק חדש
   */
  startGame(): void {
    const pack = getPackById(settings.imagePackId) ?? getDefaultPack();
    this.currentPack = pack;

    let images = [...pack.images];
    if (settings.shuffleImages) {
      images = shuffle(images);
    }

    this.imageQueue = images;
    this.currentImageIndex = 0;
    this.puzzlesSolved = 0;
    this.winsSinceLastReward = 0;

    this.loadPuzzle();
  }

  /**
   * טעינת פאזל חדש מהתור
   */
  loadPuzzle(): void {
    const image = this.imageQueue[this.currentImageIndex];
    if (!image) {
      // חזרה להתחלה
      this.currentImageIndex = 0;
      this.loadPuzzle();
      return;
    }

    this.currentImage = image;
    this.connectedPieces = 0;
    this.totalPieces = this.currentGrid.columns * this.currentGrid.rows;
    this.phase = "LOADING";
  }

  /**
   * הפאזל מוכן למשחק
   */
  puzzleReady(): void {
    this.phase = "PLAYING";
  }

  /**
   * חלק התחבר
   */
  onPieceConnected(): void {
    this.connectedPieces++;
    this.phase = "PIECE_FEEDBACK";
    playSnap();

    setTimeout(() => {
      if (this.phase === "PIECE_FEEDBACK") {
        this.phase = "PLAYING";
      }
    }, 600);
  }

  /**
   * הפאזל הושלם
   */
  onPuzzleSolved(): void {
    this.puzzlesSolved++;
    this.winsSinceLastReward++;
    this.phase = "PUZZLE_COMPLETE";

    playSuccess();
    if (settings.voiceEnabled && this.currentImage) {
      speakComplete(this.currentImage.ttsText || this.currentImage.name);
    }
  }

  /**
   * מעבר מ-PUZZLE_COMPLETE → בדיקת פרס או פאזל הבא
   */
  nextPuzzle(): void {
    const config = get(boosterService.config);
    const turnsForReward = config ? config.turnsPerReward : 3;

    if (settings.boosterEnabled && this.winsSinceLastReward >= turnsForReward) {
      this.phase = "REWARD_TIME";
    } else {
      this.advanceToNextImage();
    }
  }

  /**
   * סיום פרס
   */
  completeReward(): void {
    this.winsSinceLastReward = 0;
    this.advanceToNextImage();
  }

  /**
   * מעבר לתמונה הבאה
   */
  private advanceToNextImage(): void {
    this.currentImageIndex++;
    if (this.currentImageIndex >= this.imageQueue.length) {
      this.currentImageIndex = 0;
    }
    this.loadPuzzle();
  }

  /**
   * איפוס
   */
  reset(): void {
    this.phase = "INIT";
    this.currentPack = null;
    this.imageQueue = [];
    this.currentImageIndex = 0;
    this.currentImage = null;
    this.connectedPieces = 0;
    this.totalPieces = 0;
    this.puzzlesSolved = 0;
    this.winsSinceLastReward = 0;
  }
}

export const gameState = new GameStateStore();
