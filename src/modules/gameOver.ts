import { getGames, type Game } from "./API/games";
import { findPlayerByName, getPlayers, type Player } from "./API/players";
import { renderActivePlayerStartPage } from "./activePlayerStartPage";
import { initGameFlow, state } from "./inGameLogic";
import {
  buildGlobalHighscoreEntries,
  createEmptyGlobalHighscoreState,
  createEmptyHistoryState,
  formatGameDate,
  sortGamesByNewest,
  type GlobalHighscoreEntry,
} from "./highscore";
import { getStoredActivePlayerName } from "./localStorage";
import { renderStartPage } from "./startPage";

const mainContainer = document.querySelector("main");

export async function renderGameOver(isNewRecord = false): Promise<void> {
  if (!mainContainer) {
    return;
  }

  const headerMenu = document.querySelector(".header-menu");
  headerMenu?.replaceChildren();
  const activePlayerName = getStoredActivePlayerName();

  const activePlayerInfo = document.createElement("li");
  const endGameLi = document.createElement("li");
  const endGameBtn = document.createElement("button");
  const homepageIcon = document.createElement("i");

  if (activePlayerName) {
    activePlayerInfo.classList.add("active-player-info");
    activePlayerInfo.textContent = `Playing as: ${activePlayerName}`;
    headerMenu?.append(activePlayerInfo);
  }

  headerMenu?.append(endGameLi);

  endGameBtn.type = "button";
  endGameBtn.classList.add("game-btn", "end-game-btn");

  homepageIcon.classList.add("fa-regular", "fa-house");
  endGameBtn.textContent = "";
  endGameBtn.appendChild(homepageIcon);
  endGameLi.appendChild(endGameBtn);

  endGameBtn.addEventListener("click", (event) => {
    event.preventDefault();

    if (activePlayerName) {
      void renderActivePlayerStartPage();
      return;
    }

    void renderStartPage();
  });

  mainContainer.replaceChildren();

  const gameOverContainer = document.createElement("div");
  gameOverContainer.className = "game-over-container";

  let players: Player[] = [];
  let games: Game[] = [];

  try {
    [players, games] = await Promise.all([getPlayers(), getGames()]);
  } catch (error) {
    console.error("Failed to load game over data:", error);
  }

  const activePlayer = activePlayerName
    ? findPlayerByName(players, activePlayerName)
    : undefined;

  const finalScoreThisRound = state.score;

  let recentGames: Game[] = [];
  if (activePlayer) {
    const playerGames = games.filter(
      (game) => String(game.playerId) === String(activePlayer.id),
    );
    recentGames = sortGamesByNewest(playerGames);
  }

  const latestSavedGame =
    finalScoreThisRound > 0 &&
    recentGames[0] &&
    recentGames[0].score === finalScoreThisRound &&
    recentGames[0].level === state.level
      ? recentGames[0]
      : null;

  const globalHighscoreEntries = buildGlobalHighscoreEntries(players, games);

  const leftColumn = document.createElement("div");
  leftColumn.className = "column left-column";

  const rightColumn = document.createElement("div");
  rightColumn.className = "column right-column";

  if (isNewRecord) {
    rightColumn.classList.add("has-high-score-notice");
  }

  const scoreContainer = document.createElement("section");
  scoreContainer.className = "score-container";

  const scoreTitle = document.createElement("h2");
  scoreTitle.className = "panel-title";
  scoreTitle.textContent = "Your Score This Round";

  const scoreValue = document.createElement("p");
  scoreValue.className = "highscore-value";
  scoreValue.textContent = `${finalScoreThisRound} points`;

  scoreContainer.append(scoreTitle, scoreValue);

  const restartGameBtn = document.createElement("button");
  restartGameBtn.className = "game-btn restart-game-btn";
  restartGameBtn.type = "button";
  restartGameBtn.textContent = "Play Again!";

  restartGameBtn.addEventListener("click", (event) => {
    event.preventDefault();
    initGameFlow();
  });

  const recentGamesScoreboard = document.createElement("section");
  recentGamesScoreboard.className =
    "recent-games-scoreboard player-recent-games";
  recentGamesScoreboard.dataset.collapsedRows = "8";
  recentGamesScoreboard.dataset.collapsedRowsDesktop = "11";

  const recentGamesTitle = document.createElement("h2");
  recentGamesTitle.className = "panel-title";
  recentGamesTitle.textContent = "Your Game History";

  const recentGamesSubtitle = document.createElement("p");
  recentGamesSubtitle.className = "panel-subtitle";
  recentGamesSubtitle.textContent = "Your latest sessions";

  recentGamesScoreboard.append(recentGamesTitle, recentGamesSubtitle);

  if (recentGames.length === 0) {
    recentGamesScoreboard.append(createEmptyHistoryState());
  } else {
    const recentGamesTable = createRecentGamesTable(recentGames);
    recentGamesScoreboard.append(recentGamesTable);
  }

  const globalHighScoreList = document.createElement("section");
  globalHighScoreList.className = "global-high-score-list global-highscore";

  const globalHighScoreTitle = document.createElement("h2");
  globalHighScoreTitle.className = "panel-title";
  globalHighScoreTitle.textContent = "Global Highscore";

  globalHighScoreList.append(globalHighScoreTitle);

  if (globalHighscoreEntries.length === 0) {
    globalHighScoreList.append(createEmptyGlobalHighscoreState());
  } else {
    const globalHighScoreTable = createGlobalHighscoreTable(
      globalHighscoreEntries,
      activePlayerName,
      latestSavedGame,
      isNewRecord,
    );
    globalHighScoreList.append(globalHighScoreTable);
  }

  leftColumn.append(scoreContainer, restartGameBtn, globalHighScoreList);

  if (isNewRecord) {
    const highScoreNotice = document.createElement("div");
    highScoreNotice.className = "high-score-notice";
    highScoreNotice.textContent = "New Personal Best!";
    rightColumn.append(highScoreNotice);
  }

  rightColumn.append(recentGamesScoreboard);

  gameOverContainer.append(leftColumn, rightColumn);
  mainContainer.append(gameOverContainer);
  gameOverContainer.classList.add("fade-in");
}

function createRecentGamesTable(rows: Game[]): HTMLElement {
  const scoreTable = document.createElement("div");
  scoreTable.className = "score-table player-score-table";

  const headerRow = document.createElement("div");
  headerRow.className = "score-row score-header";

  const dateHeader = document.createElement("span");
  dateHeader.className = "score-cell score-date";
  dateHeader.textContent = "Date";

  const levelHeader = document.createElement("span");
  levelHeader.className = "score-cell score-level";
  levelHeader.textContent = "Level";

  const scoreHeader = document.createElement("span");
  scoreHeader.className = "score-cell score-points";
  scoreHeader.textContent = "Score";

  headerRow.append(dateHeader, levelHeader, scoreHeader);
  scoreTable.append(headerRow);

  rows.forEach((game) => {
    const scoreRow = document.createElement("div");
    scoreRow.className = "score-row";

    const gameDate = document.createElement("span");
    gameDate.className = "score-cell score-date";
    gameDate.textContent = formatGameDate(game.gameDate);

    const gameLevel = document.createElement("span");
    gameLevel.className = "score-cell score-level";
    gameLevel.textContent = String(game.level);

    const gameScore = document.createElement("span");
    gameScore.className = "score-cell score-points";
    gameScore.textContent = String(game.score);

    scoreRow.append(gameDate, gameLevel, gameScore);
    scoreTable.append(scoreRow);
  });

  return scoreTable;
}

function createGlobalHighscoreTable(
  rows: GlobalHighscoreEntry[],
  activePlayerName: string | null,
  latestSavedGame: Game | null,
  isNewRecord: boolean,
): HTMLElement {
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
  scoreHeader.textContent = "Score";

  headerRow.append(nameHeader, levelHeader, scoreHeader);
  scoreTable.append(headerRow);

  rows.forEach((row, index) => {
    const scoreRow = document.createElement("div");
    scoreRow.className = "score-row";

    if (
      activePlayerName &&
      row.playerName.toLowerCase() === activePlayerName.toLowerCase()
    ) {
      scoreRow.classList.add("player-score-highlight");
    }

    if (
      isNewRecord &&
      latestSavedGame &&
      String(row.playerId) === String(latestSavedGame.playerId) &&
      row.gameDate === latestSavedGame.gameDate
    ) {
      scoreRow.classList.add("active-player-highlight");
    }

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
      name.textContent = `${index + 1}. ${row.playerName}`;
    }

    if (index === 0) {
      name.textContent = `\u{1F947} ${row.playerName}`;
    } else if (index === 1) {
      name.textContent = `\u{1F948} ${row.playerName}`;
    } else if (index === 2) {
      name.textContent = `\u{1F949} ${row.playerName}`;
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
