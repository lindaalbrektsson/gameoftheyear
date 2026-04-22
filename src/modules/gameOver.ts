const mainContainer = document.querySelector("main");
let currentScore: string | number = "#####";
const activePlayer: string = "PlayerOne";

interface IRecentGame {
  gameId: string;
  playerName: string;
  score: number;
  gameDate: string;
  level: number;
}

// temporary array to display recent players games
const recentGames: IRecentGame[] = [
  {
    gameId: "G-101",
    playerName: activePlayer,
    score: 2500,
    gameDate: "2026-04-20",
    level: 10,
  },
  {
    gameId: "G-102",
    playerName: activePlayer,
    score: 3100,
    gameDate: "2026-04-21",
    level: 12,
  },
  {
    gameId: "G-103",
    playerName: activePlayer,
    score: 1800,
    gameDate: "2026-04-22",
    level: 8,
  },
  {
    gameId: "G-104",
    playerName: activePlayer,
    score: 1850,
    gameDate: "2026-04-23",
    level: 8,
  },
  {
    gameId: "G-105",
    playerName: activePlayer,
    score: 1770,
    gameDate: "2026-04-23",
    level: 7,
  },
  {
    gameId: "G-106",
    playerName: activePlayer,
    score: 1560,
    gameDate: "2026-04-23",
    level: 6,
  },
];

export async function renderGameOver() {
  if (!mainContainer) return;

  // empty
  mainContainer.innerHTML = "";

  // left and right columns
  const leftColumn = document.createElement("div");
  leftColumn.className = "column";

  const rightColumn = document.createElement("div");
  rightColumn.className = "column";

  // left column elements

  // Score container
  const scoreContainer = document.createElement("div");
  scoreContainer.className = "score-container";
  scoreContainer.textContent = "YOUR SCORE THIS ROUND: " + currentScore;

  // Restart game button
  const restartGameBtn = document.createElement("button");
  restartGameBtn.className = "restart-game-btn";
  restartGameBtn.textContent = "RESTART GAME";

  restartGameBtn.addEventListener("click", function (evt) {
    evt.preventDefault();
    console.log("restart game button pressed");
    // här kallar vi på countdown när den finns
    // här kallar vi på initGame funktion när countdown slår 0
  });

  // Your recent games/history
  const recentGamesScoreboard = document.createElement("div");
  recentGamesScoreboard.className = "recent-games-scoreboard";

  // mini-header inside recentgamesscoreboard for categories player, lvl, score & game-id
  const tableHeader = document.createElement("div");
  tableHeader.className = "scoreboard-header";
  tableHeader.innerHTML = `
    <span class="col-player"><i class="fa-solid fa-user"></i> PLAYER</span>
    <span class="col-lvl"><i class="fa-solid fa-layer-group"></i> LVL</span>
    <span class="col-score"><i class="fa-solid fa-star"></i> SCORE</span>
    <span class="col-id"><i class="fa-solid fa-hashtag"></i> ID</span>
  `;
  recentGamesScoreboard.appendChild(tableHeader);

  // ul for history of played games
  const gameListContainer = document.createElement("ul");
  gameListContainer.id = "recent-games-list";

  // loop through each recentgame and create li
  recentGames.forEach((game) => {
    const li = document.createElement("li");
    li.className = "recent-game-item";

    li.innerHTML = `
      <span class="col-player">${game.playerName}</span>
      <span class="col-lvl">${game.level}</span>
      <span class="col-score">${game.score}</span>
      <span class="col-id">${game.gameId}</span>
    `;

    gameListContainer.appendChild(li);
  });

  recentGamesScoreboard.appendChild(gameListContainer);

  // Appendchild to the left column
  leftColumn.appendChild(scoreContainer);
  leftColumn.appendChild(restartGameBtn);
  leftColumn.appendChild(recentGamesScoreboard);

  // right column elements

  // highscore
  const highScoreNotice = document.createElement("div");
  highScoreNotice.className = "highscore-notice";
  highScoreNotice.textContent = "YOU MADE IT TO THE HIGHSCORE LIST!";

  // Global HighScore list top 10
  const globalHighScoreList = document.createElement("div");
  globalHighScoreList.className = "global-highscore-list";
  globalHighScoreList.textContent = "HIGHSCORE LIST: TOP 10";

  // Append items to the right column
  rightColumn.appendChild(highScoreNotice);
  rightColumn.appendChild(globalHighScoreList);

  // Append both colummns to main
  mainContainer.appendChild(leftColumn);
  mainContainer.appendChild(rightColumn);
}
