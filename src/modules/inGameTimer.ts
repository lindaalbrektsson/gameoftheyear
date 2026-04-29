import { renderGameOver } from "./gameOver";
import {
  renderGameOverMessage,
  updateLivesUI,
  updateTimerUI,
} from "./inGameUI";
import { state, startNewRound } from "./inGameLogic";
import { saveGameResult } from "./API/scoreAPI";

let timerIntervalId: number | null = null;

export function startRoundTimer(): void {
  stopRoundTimer(); // Stop any existing timer before starting a new one

  timerIntervalId = window.setInterval(() => {
    state.timeLeft--;
    updateTimerUI();

    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      stopRoundTimer();
      state.lives--;
      updateLivesUI();
      updateTimerUI();

      if (state.lives > 0) {
        setTimeout(() => {
          void startNewRound();
        }, 600);
      } else {
        renderGameOverMessage();
        // spara score innan vi byter till gameover vy
        const activePlayerName = localStorage.getItem("activePlayer");
        if (activePlayerName) {
          void saveGameResult(activePlayerName, state.score, state.level);
        }
        setTimeout(() => {
          void renderGameOver();
        }, 1200);
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
