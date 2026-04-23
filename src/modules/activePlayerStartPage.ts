import { initGameFlow } from "./inGame";
import { renderStartPage } from "./startPage";

type Player = {
  id: string;
  playerName: string;
};

type Game = {
  id: string;
  gameDate: string;
  score: number;
  level: number;
  playerId: string;
};

type GlobalHighscoreEntry = {
  playerName: string;
  level: number;
  score: number;
};

export function renderActivePlayerStartPage(): void {
  const main = document.querySelector("main");
  const headerMenu = document.querySelector(".header-menu");
  headerMenu?.replaceChildren();

  if (!main) {
    throw new Error("Could not find main element");
  }

  const activePlayerName = localStorage.getItem("activePlayer");

  if (!activePlayerName) {
    throw new Error("No active player found");
  }

  // Tillfällig mockdata för players
  // TODO: Byt till players från data.json / json-server
  const players: Player[] = [
    { id: "p1", playerName: activePlayerName },
    { id: "p2", playerName: "Player2" },
    { id: "p3", playerName: "Player3" },
  ];

  const activePlayer = players.find(
    (player) => player.playerName === activePlayerName
  );

  if (!activePlayer) {
    throw new Error("Active player not found in players");
  }

  // Tillfällig mockdata för games
  // TODO: Byt till games från data.json när spelet sparar riktiga game-objekt
  const games: Game[] = [
    {
      id: "g1",
      gameDate: "2026-04-21",
      score: 80,
      level: 5,
      playerId: activePlayer.id,
    },
    {
      id: "g2",
      gameDate: "2026-04-20",
      score: 70,
      level: 4,
      playerId: activePlayer.id,
    },
    {
      id: "g3",
      gameDate: "2026-04-19",
      score: 60,
      level: 3,
      playerId: activePlayer.id,
    },
    {
      id: "g4",
      gameDate: "2026-04-19",
      score: 60,
      level: 3,
      playerId: activePlayer.id,
    },
    {
      id: "g5",
      gameDate: "2026-04-19",
      score: 60,
      level: 3,
      playerId: activePlayer.id,
    },
    {
      id: "g6",
      gameDate: "2026-04-19",
      score: 60,
      level: 3,
      playerId: activePlayer.id,
    },
    {
      id: "g7",
      gameDate: "2026-04-19",
      score: 60,
      level: 3,
      playerId: activePlayer.id,
    },
  ];

  const playerGames = games.filter((game) => game.playerId === activePlayer.id);

  const playerHighscoreValue =
    playerGames.length > 0
      ? Math.max(...playerGames.map((game) => game.score))
      : 0;

  // Tillfällig data för global highscore
  // TODO: Byt till riktig sammanställning från players + games
  const globalHighscoreEntries: GlobalHighscoreEntry[] = [
    { playerName: "Player1", level: 10, score: 1000 },
    { playerName: "Player2", level: 9, score: 900 },
    { playerName: "Player3", level: 8, score: 800 },
    { playerName: "Player4", level: 7, score: 700 },
    { playerName: "Player5", level: 6, score: 600 },
    { playerName: "Player6", level: 5, score: 500 },
  ];

  let isShowingHowToPlay = false;

  const activePlayerStartPage = document.createElement("section");
  activePlayerStartPage.classList.add("active-player-start-page");

  const leftSection = document.createElement("section");
  leftSection.classList.add("left-section");

  const playerHighscoreSection = createPlayerHighscore(playerHighscoreValue);

  const bottomPanelContainer = document.createElement("div");
  bottomPanelContainer.classList.add("bottom-panel-container");

  const howToPlayBtn = document.createElement("button");
  howToPlayBtn.classList.add("game-btn", "how-to-play-btn");
  howToPlayBtn.type = "button";
  howToPlayBtn.textContent = "How to play";

  function showPlayerGameHistory(): void {
    bottomPanelContainer.replaceChildren(
      createPlayerGameHistorySection(playerGames)
    );
    howToPlayBtn.textContent = "How to play";
  }

  function showHowToPlayPanel(): void {
    bottomPanelContainer.replaceChildren(createHowToPlayPanel());
    howToPlayBtn.textContent = "Your game history";
  }

  function toggleHowToPlayPanel(): void {
    if (isShowingHowToPlay) {
      showPlayerGameHistory();
      isShowingHowToPlay = false;
      return;
    }

    showHowToPlayPanel();
    isShowingHowToPlay = true;
  }

  howToPlayBtn.addEventListener("click", toggleHowToPlayPanel);

  showPlayerGameHistory();

  leftSection.append(playerHighscoreSection, bottomPanelContainer);

  const rightSection = createRightSection(
    activePlayer.playerName,
    globalHighscoreEntries,
    howToPlayBtn
  );

  activePlayerStartPage.append(leftSection, rightSection);
  main.replaceChildren(activePlayerStartPage);
}

function createPlayerHighscore(highscoreValue: number): HTMLElement {
  const playerHighscoreSection = document.createElement("section");
  playerHighscoreSection.classList.add("player-highscore");

  const highscoreTitle = document.createElement("h2");
  highscoreTitle.classList.add("panel-title");
  highscoreTitle.textContent = "Your Highscore";

  const highscoreText = document.createElement("p");
  highscoreText.classList.add("highscore-value");
  highscoreText.textContent = `${highscoreValue} points`;

  playerHighscoreSection.append(highscoreTitle, highscoreText);

  return playerHighscoreSection;
}

function createPlayerGameHistorySection(playerGames: Game[]): HTMLElement {
  const playerGameHistorySection = document.createElement("section");
  playerGameHistorySection.classList.add("player-recent-games");

  const sectionTitle = document.createElement("h2");
  sectionTitle.classList.add("panel-title");
  sectionTitle.textContent = "Your Game History";

  const sectionSubtitle = document.createElement("p");
  sectionSubtitle.classList.add("panel-subtitle");
  sectionSubtitle.textContent = "Latest games";

  const latestEightGames = playerGames.slice(0, 8);
  const playerScoreTable = createPlayerScoreTable(latestEightGames);

  playerGameHistorySection.append(
    sectionTitle,
    sectionSubtitle,
    playerScoreTable
  );

  return playerGameHistorySection;
}

function createPlayerScoreTable(rows: Game[]): HTMLElement {
  const playerScoreTable = document.createElement("div");
  playerScoreTable.classList.add("score-table", "player-score-table");

  const headerRow = createPlayerScoreHeaderRow();
  playerScoreTable.append(headerRow);

  rows.forEach((game) => {
    const scoreRow = createPlayerScoreRow(game);
    playerScoreTable.append(scoreRow);
  });

  return playerScoreTable;
}

function createPlayerScoreHeaderRow(): HTMLElement {
  const headerRow = document.createElement("div");
  headerRow.classList.add("score-row", "score-header", "player-score-row");

  const dateHeader = document.createElement("span");
  dateHeader.classList.add("score-cell", "score-date");
  dateHeader.textContent = "Date";

  const levelHeader = document.createElement("span");
  levelHeader.classList.add("score-cell", "score-level");
  levelHeader.textContent = "Level";

  const scoreHeader = document.createElement("span");
  scoreHeader.classList.add("score-cell", "score-points");
  scoreHeader.textContent = "Score";

  const deleteHeader = document.createElement("span");
  deleteHeader.classList.add("score-cell", "score-delete");
  deleteHeader.textContent = "";

  headerRow.append(dateHeader, levelHeader, scoreHeader, deleteHeader);

  return headerRow;
}

function createPlayerScoreRow(game: Game): HTMLElement {
  const scoreRow = document.createElement("div");
  scoreRow.classList.add("score-row", "player-score-row");

  const gameDate = document.createElement("span");
  gameDate.classList.add("score-cell", "score-date");
  gameDate.textContent = game.gameDate;

  const gameLevel = document.createElement("span");
  gameLevel.classList.add("score-cell", "score-level");
  gameLevel.textContent = String(game.level);

  const gameScore = document.createElement("span");
  gameScore.classList.add("score-cell", "score-points");
  gameScore.textContent = String(game.score);

  const deleteCell = document.createElement("span");
  deleteCell.classList.add("score-cell", "score-delete");

  const deleteBtn = createDeleteButton(game, deleteCell);
  deleteCell.append(deleteBtn);

  scoreRow.append(gameDate, gameLevel, gameScore, deleteCell);

  return scoreRow;
}

function createDeleteButton(
  game: Game,
  deleteCell: HTMLElement
): HTMLButtonElement {
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-game-btn");
  deleteBtn.type = "button";
  deleteBtn.textContent = "🗑";
  deleteBtn.setAttribute("aria-label", "Delete game");

  deleteBtn.addEventListener("click", () => {
    const deleteConfirmation = createDeleteConfirmation(game, deleteCell);
    deleteCell.replaceChildren(deleteConfirmation);
  });

  return deleteBtn;
}

function createDeleteConfirmation(
  game: Game,
  deleteCell: HTMLElement
): HTMLElement {
  const confirmationWrapper = document.createElement("div");
  confirmationWrapper.classList.add("delete-confirmation");

  const confirmationText = document.createElement("span");
  confirmationText.classList.add("delete-confirmation-text");
  confirmationText.textContent = "Delete game?";

  const buttonsWrapper = document.createElement("div");
  buttonsWrapper.classList.add("delete-confirmation-buttons");

  const confirmBtn = document.createElement("button");
  confirmBtn.classList.add("game-btn", "confirm-delete-btn");
  confirmBtn.type = "button";
  confirmBtn.textContent = "Yes";

  const cancelBtn = document.createElement("button");
  cancelBtn.classList.add("game-btn", "cancel-delete-btn");
  cancelBtn.type = "button";
  cancelBtn.textContent = "No";

  confirmBtn.addEventListener("click", () => {
    // TODO: DELETE game from json-server using game.id
    console.log(`Delete game with id: ${game.id}`);
  });

  cancelBtn.addEventListener("click", () => {
    const deleteBtn = createDeleteButton(game, deleteCell);
    deleteCell.replaceChildren(deleteBtn);
  });

  buttonsWrapper.append(confirmBtn, cancelBtn);
  confirmationWrapper.append(confirmationText, buttonsWrapper);

  return confirmationWrapper;
}

function createHowToPlayPanel(): HTMLElement {
  const howToPlayPanel = document.createElement("section");
  howToPlayPanel.classList.add("how-to-play-panel");

  const title = document.createElement("h2");
  title.classList.add("panel-title");
  title.textContent = "How to play";

  const list = document.createElement("ul");
  list.classList.add("how-to-play-list");

  const steps = [
    "Enter your name and start a new game",
    "Click on the correct tiles based on the given rule",
    "Complete the round before the timer runs out",
    "You have three lives, so avoid mistakes to keep playing",
    "Each succesful round gives you score",
    "A failed round costs you a life and decreases your score",
    "Advance through levels as difficulty increases",
    "Try to beat your previous highscore",
    "Compete for a spot on the global leaderboard",
  ];

  steps.forEach((step) => {
    const listItem = document.createElement("li");
    listItem.textContent = step;
    list.append(listItem);
  });

  howToPlayPanel.append(title, list);

  return howToPlayPanel;
}

function createRightSection(
  activePlayerName: string,
  globalHighscoreEntries: GlobalHighscoreEntry[],
  howToPlayBtn: HTMLButtonElement
): HTMLElement {
  const rightSection = document.createElement("section");
  rightSection.classList.add("right-section");

  const welcomePlayerSection = createWelcomePlayer(activePlayerName);
  const buttonRow = createButtonRow(activePlayerName);
  const globalHighscoreSection = createGlobalHighscore(globalHighscoreEntries);

  rightSection.append(
    welcomePlayerSection,
    buttonRow,
    howToPlayBtn,
    globalHighscoreSection
  );

  return rightSection;
}

function createWelcomePlayer(activePlayerName: string): HTMLElement {
  const welcomePlayer = document.createElement("div");
  welcomePlayer.classList.add("welcome-player");

  const welcomeText = document.createElement("h2");
  welcomeText.classList.add("welcome-text");
  welcomeText.textContent = `Hello ${activePlayerName}!`;

  welcomePlayer.append(welcomeText);

  return welcomePlayer;
}

function createButtonRow(activePlayerName: string): HTMLElement {
  const buttonRow = document.createElement("div");
  buttonRow.classList.add("button-row");

  const startGameBtn = document.createElement("button");
  startGameBtn.classList.add("game-btn", "start-game-btn");
  startGameBtn.type = "button";
  startGameBtn.textContent = "Start Game";
  startGameBtn.addEventListener("click", () => {
    localStorage.setItem("activePlayer", activePlayerName);
    initGameFlow();
  });

  const changePlayerBtn = document.createElement("button");
  changePlayerBtn.classList.add("game-btn", "change-player-btn");
  changePlayerBtn.type = "button";
  changePlayerBtn.textContent = "Change Player";
  changePlayerBtn.addEventListener("click", () => {
    localStorage.removeItem("activePlayer");
    renderStartPage();
  });

  buttonRow.append(startGameBtn, changePlayerBtn);

  return buttonRow;
}

function createGlobalHighscore(
  globalHighscoreEntries: GlobalHighscoreEntry[]
): HTMLElement {
  const globalHighscoreSection = document.createElement("section");
  globalHighscoreSection.classList.add("global-highscore");

  const sectionTitle = document.createElement("h2");
  sectionTitle.classList.add("panel-title");
  sectionTitle.textContent = "Global Highscore";

  const topFive = globalHighscoreEntries.slice(0, 5);
  const globalHighscoreTable = createGlobalHighscoreTable(topFive);

  globalHighscoreSection.append(sectionTitle, globalHighscoreTable);

  return globalHighscoreSection;
}

function createGlobalHighscoreTable(
  rows: GlobalHighscoreEntry[]
): HTMLElement {
  const globalHighscoreTable = document.createElement("div");
  globalHighscoreTable.classList.add("score-table");

  const headerRow = createGlobalHighscoreHeaderRow();
  globalHighscoreTable.append(headerRow);

  rows.forEach((row, index) => {
    const scoreRow = createGlobalHighscoreRow(
      row.playerName,
      row.level,
      row.score,
      index
    );
    globalHighscoreTable.append(scoreRow);
  });

  return globalHighscoreTable;
}

function createGlobalHighscoreHeaderRow(): HTMLElement {
  const headerRow = document.createElement("div");
  headerRow.classList.add("score-row", "score-header");

  const nameHeader = document.createElement("span");
  nameHeader.classList.add("score-cell", "score-name");
  nameHeader.textContent = "Name";

  const levelHeader = document.createElement("span");
  levelHeader.classList.add("score-cell", "score-level");
  levelHeader.textContent = "Level";

  const scoreHeader = document.createElement("span");
  scoreHeader.classList.add("score-cell", "score-points");
  scoreHeader.textContent = "Score";

  headerRow.append(nameHeader, levelHeader, scoreHeader);

  return headerRow;
}

function createGlobalHighscoreRow(
  playerName: string,
  levelValue: number,
  scoreValue: number,
  rank?: number
): HTMLElement {
  const scoreRow = document.createElement("div");
  scoreRow.classList.add("score-row");

  const name = document.createElement("span");
  name.classList.add("score-cell", "score-name");

  if (rank === 0) {
    name.textContent = `🥇 ${playerName}`;
    scoreRow.classList.add("gold-rank");
  } else if (rank === 1) {
    name.textContent = `🥈 ${playerName}`;
    scoreRow.classList.add("silver-rank");
  } else if (rank === 2) {
    name.textContent = `🥉 ${playerName}`;
    scoreRow.classList.add("bronze-rank");
  } else {
    name.textContent = playerName;
  }

  const level = document.createElement("span");
  level.classList.add("score-cell", "score-level");
  level.textContent = String(levelValue);

  const score = document.createElement("span");
  score.classList.add("score-cell", "score-points");
  score.textContent = String(scoreValue);

  scoreRow.append(name, level, score);

  return scoreRow;
}