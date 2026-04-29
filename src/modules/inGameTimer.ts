import { saveGameResult } from "./API/games";
import { renderGameOver } from "./gameOver";
import {
  renderGameOverMessage,
  updateLivesUI,
  updateTimerUI,
} from "./inGameUI";
import { state, startNewRound } from "./inGameLogic";
import { getStoredActivePlayerName } from "./localStorage";

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
        const finalScore = state.score;
        const finalLevel = state.level;
        setTimeout(async () => {
          const activePlayerName = getStoredActivePlayerName();
          const isNewRecord =
            activePlayerName && finalScore > 0
              ? await saveGameResult(activePlayerName, finalScore, finalLevel)
              : false;
          await renderGameOver(isNewRecord);
        }, 2500);
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
