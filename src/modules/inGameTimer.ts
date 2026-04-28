import {updateUI} from "./inGameUI";
import {state, startNewRound} from "./inGameLogic";

let timerIntervalId: number | null = null;

export function startRoundTimer(): void {
  stopRoundTimer(); // Stop any existing timer before starting a new one

  timerIntervalId = window.setInterval(() => {
    state.timeLeft--;
    updateUI();

    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      stopRoundTimer();
      state.lives--;
      updateUI();

      if (state.lives > 0) {
        setTimeout(() => {
          startNewRound();
        }, 600);
      } else {
        console.log("No lives left. Game over!");
      }
    }
  }, 1000);
}

export function stopRoundTimer(): void {
  if (timerIntervalId !== null) {
    window.clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}
