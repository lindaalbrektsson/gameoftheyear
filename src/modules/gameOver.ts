const mainContainer = document.querySelector("main");
let currentScore = "#####";
//temporär currentscore bara för att visa något, vi får hämta in från data när den väl finns

export async function renderGameOver() {
  if (!mainContainer) return;

  // empty
  mainContainer.innerHTML = "";
  mainContainer.className = "main";

  // left and right columns
  const leftColumn = document.createElement("div");
  leftColumn.className = "column";

  const rightColumn = document.createElement("div");
  rightColumn.className = "column";

  // left column elements

  // Score container
  const scoreContainer = document.createElement("div");
  scoreContainer.className = "scoreContainer";
  scoreContainer.textContent = "YOUR SCORE THIS ROUND: " + currentScore;

  // Restart game button
  const restartGameBtn = document.createElement("button");
  restartGameBtn.className = "restartGameBtn";
  restartGameBtn.textContent = "RESTART GAME";

  // Your recent games/history
  const recentGamesScoreboard = document.createElement("div");
  recentGamesScoreboard.className = "recentGamesScoreboard";
  recentGamesScoreboard.textContent = "YOUR RECENT GAMES";

  // Appendchild to the left column
  leftColumn.appendChild(scoreContainer);
  leftColumn.appendChild(restartGameBtn);
  leftColumn.appendChild(recentGamesScoreboard);

  // right column elements

  // highscore
  const highScoreNotice = document.createElement("div");
  highScoreNotice.className = "highScoreNotice";
  highScoreNotice.textContent = "YOU MADE IT TO THE HIGHSCORE LIST!";

  // Global HighScore list top 10
  const globalHighScoreList = document.createElement("div");
  globalHighScoreList.className = "globalHighScoreList";
  globalHighScoreList.textContent = "HIGHSCORE LIST: TOP 10";

  // Append items to the right column
  rightColumn.appendChild(highScoreNotice);
  rightColumn.appendChild(globalHighScoreList);

  // Append both colummns to main
  mainContainer.appendChild(leftColumn);
  mainContainer.appendChild(rightColumn);
}
