import { describe, it, expect, beforeEach, vi } from "vitest";
import { gameState } from "../../lib/stores/game-state.svelte";
import { get } from "svelte/store";

// Mock sound and tts modules to prevent side effects
vi.mock("../../lib/utils/sound", () => ({
  playSuccess: vi.fn(),
  playError: vi.fn(),
  playClick: vi.fn(),
}));

vi.mock("../../lib/utils/tts", () => ({
  speakBuildA: vi.fn(),
  speakAddB: vi.fn(),
  speakChooseAnswer: vi.fn(),
  speakCorrect: vi.fn(),
  speakWrong: vi.fn(),
}));

describe("GameState Logic", () => {
  beforeEach(() => {
    gameState.startRound();
  });

  it("should initialize with a valid round", () => {
    expect(gameState.round.a).toBeGreaterThanOrEqual(1);
    expect(gameState.round.b).toBeGreaterThanOrEqual(1);
    expect(gameState.round.builtA).toBe(0);
    expect(gameState.round.addedB).toBe(0);
    expect(gameState.state).toBe("BUILD_A");
  });

  it("should increment builtA when adding a car to group A", () => {
    const initialA = gameState.round.builtA;
    gameState.addCar();
    expect(gameState.round.builtA).toBe(initialA + 1);
  });

  it("should transition to ADD_B when group A is full", () => {
    // Fill A
    const targetA = gameState.round.a;
    for (let i = 0; i < targetA; i++) {
      gameState.addCar();
    }
    expect(gameState.state).toBe("ADD_B");
  });

  it("should transition to CHOOSE_ANSWER when group B is full", () => {
    // Fill A
    const targetA = gameState.round.a;
    for (let i = 0; i < targetA; i++) {
      gameState.addCar();
    }

    // Fill B
    const targetB = gameState.round.b;
    for (let i = 0; i < targetB; i++) {
      gameState.addCar();
    }

    expect(gameState.state).toBe("CHOOSE_ANSWER");
  });

  it("should handle correct answer", () => {
    // Setup state to CHOOSE_ANSWER
    const targetA = gameState.round.a;
    const targetB = gameState.round.b;
    for (let i = 0; i < targetA; i++) gameState.addCar();
    for (let i = 0; i < targetB; i++) gameState.addCar();

    const correctAnswer = targetA + targetB;
    gameState.selectAnswer(correctAnswer);

    expect(gameState.state).toBe("FEEDBACK_CORRECT");
  });

  it("should handle wrong answer", () => {
    // Setup state to CHOOSE_ANSWER
    const targetA = gameState.round.a;
    const targetB = gameState.round.b;
    for (let i = 0; i < targetA; i++) gameState.addCar();
    for (let i = 0; i < targetB; i++) gameState.addCar();

    const wrongAnswer = targetA + targetB + 1; // Ensure wrong
    gameState.selectAnswer(wrongAnswer);

    expect(gameState.state).toBe("FEEDBACK_WRONG");
  });
});
