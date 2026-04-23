const mainContainer = document.querySelector("main");
let currentScore = "#####";
// temporär currentscore bara för att visa något, vi får hämta in från data när den väl finns

type RecentGame = {
  playerName: string;
  level: number;
  score: number;
};

type GlobalHighscoreEntry = {
  playerName: string;
  level: number;
  score: number;
};

export async function renderGameOver(): Promise<void> {
  if (!mainContainer) {
    return;
  }

  const headerMenu = document.querySelector(".header-menu");
  headerMenu?.replaceChildren();

  mainContainer.replaceChildren();
  mainContainer.className = "main";

  const recentGames: RecentGame[] = [
    { playerName: "PlayerOne", level: 5, score: 80 },
    { playerName: "PlayerOne", level: 4, score: 70 },
    { playerName: "PlayerOne", level: 3, score: 60 },
    { playerName: "PlayerOne", level: 2, score: 50 },
  ];

  const globalHighscoreEntries: GlobalHighscoreEntry[] = [
    { playerName: "Player1", level: 10, score: 1000 },
    { playerName: "Player2", level: 9, score: 900 },
    { playerName: "Player3", level: 8, score: 800 },
    { playerName: "Player4", level: 7, score: 700 },
    { playerName: "Player5", level: 6, score: 600 },
  ];

  const leftColumn = document.createElement("div");
  leftColumn.className = "column";

  const rightColumn = document.createElement("div");
  rightColumn.className = "column";

  const scoreContainer = document.createElement("section");
  scoreContainer.className = "score-container";

  const scoreTitle = document.createElement("h2");
  scoreTitle.className = "panel-title";
  scoreTitle.textContent = "Your Score This Round";

  const scoreValue = document.createElement("p");
  scoreValue.className = "highscore-value";
  scoreValue.textContent = `${currentScore} points`;

  scoreContainer.append(scoreTitle, scoreValue);

  const restartGameBtn = document.createElement("button");
  restartGameBtn.className = "game-btn restart-game-btn";
  restartGameBtn.type = "button";
  restartGameBtn.textContent = "Restart Game";

  const recentGamesScoreboard = document.createElement("section");
  recentGamesScoreboard.className = "recent-games-scoreboard";

  const recentGamesTitle = document.createElement("h2");
  recentGamesTitle.className = "panel-title";
  recentGamesTitle.textContent = "Your Recent Games";

  const recentGamesSubtitle = document.createElement("p");
  recentGamesSubtitle.className = "panel-subtitle";
  recentGamesSubtitle.textContent = "Latest scores";

  const recentGamesTable = createRecentGamesTable(recentGames);

  recentGamesScoreboard.append(
    recentGamesTitle,
    recentGamesSubtitle,
    recentGamesTable,
  );

  leftColumn.append(scoreContainer, restartGameBtn, recentGamesScoreboard);

  const highScoreNotice = document.createElement("div");
  highScoreNotice.className = "high-score-notice";
  highScoreNotice.textContent = "You made it to the highscore list!";

  const globalHighScoreList = document.createElement("section");
  globalHighScoreList.className = "global-high-score-list";

  const globalHighScoreTitle = document.createElement("h2");
  globalHighScoreTitle.className = "panel-title";
  globalHighScoreTitle.textContent = "Global Highscore";

  const globalHighScoreTable = createGlobalHighscoreTable(
    globalHighscoreEntries,
  );

  globalHighScoreList.append(globalHighScoreTitle, globalHighScoreTable);

  rightColumn.append(highScoreNotice, globalHighScoreList);

  mainContainer.append(leftColumn, rightColumn);
}

function createRecentGamesTable(rows: RecentGame[]): HTMLElement {
  const scoreTable = document.createElement("div");
  scoreTable.className = "score-table";

  const headerRow = document.createElement("div");
  headerRow.className = "score-row score-header";

  const nameHeader = document.createElement("span");
  nameHeader.className = "score-cell score-name";
  nameHeader.textContent = "Name";

  const levelHeader = document.createElement("span");
  levelHeader.className = "score-cell score-level";
  levelHeader.textContent = "Level";

  const scoreHeader = document.createElement("span");
  scoreHeader.className = "score-cell score-points";
  scoreHeader.textContent = "Points";

  headerRow.append(nameHeader, levelHeader, scoreHeader);
  scoreTable.append(headerRow);

  rows.forEach((row) => {
    const scoreRow = document.createElement("div");
    scoreRow.className = "score-row";

    const name = document.createElement("span");
    name.className = "score-cell score-name";
    name.textContent = row.playerName;

    const level = document.createElement("span");
    level.className = "score-cell score-level";
    level.textContent = String(row.level);

    const score = document.createElement("span");
    score.className = "score-cell score-points";
    score.textContent = String(row.score);

    scoreRow.append(name, level, score);
    scoreTable.append(scoreRow);
  });

  return scoreTable;
}

function createGlobalHighscoreTable(rows: GlobalHighscoreEntry[]): HTMLElement {
  const scoreTable = document.createElement("div");
  scoreTable.className = "score-table";

  const headerRow = document.createElement("div");
  headerRow.className = "score-row score-header";

  const nameHeader = document.createElement("span");
  nameHeader.className = "score-cell score-name";
  nameHeader.textContent = "Name";

  const levelHeader = document.createElement("span");
  levelHeader.className = "score-cell score-level";
  levelHeader.textContent = "Level";

  const scoreHeader = document.createElement("span");
  scoreHeader.className = "score-cell score-points";
  scoreHeader.textContent = "Points";

  headerRow.append(nameHeader, levelHeader, scoreHeader);
  scoreTable.append(headerRow);

  rows.forEach((row, index) => {
    const scoreRow = document.createElement("div");
    scoreRow.className = "score-row";

    const name = document.createElement("span");
    name.className = "score-cell score-name";

    if (index === 0) {
      name.textContent = `🥇 ${row.playerName}`;
      scoreRow.classList.add("gold-rank");
    } else if (index === 1) {
      name.textContent = `🥈 ${row.playerName}`;
      scoreRow.classList.add("silver-rank");
    } else if (index === 2) {
      name.textContent = `🥉 ${row.playerName}`;
      scoreRow.classList.add("bronze-rank");
    } else {
      name.textContent = row.playerName;
    }

    const level = document.createElement("span");
    level.className = "score-cell score-level";
    level.textContent = String(row.level);

    const score = document.createElement("span");
    score.className = "score-cell score-points";
    score.textContent = String(row.score);

    scoreRow.append(name, level, score);
    scoreTable.append(scoreRow);
  });

  return scoreTable;
}
