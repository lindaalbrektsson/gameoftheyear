const mainContainer = document.querySelector("main");
let currentScore = 25;

export async function gameOver() {
  // score "container" & append current score
  const scoreContainer = document.createElement("div");
  scoreContainer.className = "scoreContainer";
  scoreContainer.textContent = "Your current score: " + currentScore;

  // restart game button
  const restartGameBtn = document.createElement("button");
  restartGameBtn.className = "restartGameBtn";
  restartGameBtn.textContent = "Restart Game";

  if (mainContainer) {
    mainContainer.appendChild(scoreContainer);
    mainContainer.appendChild(restartGameBtn);
  }
}
