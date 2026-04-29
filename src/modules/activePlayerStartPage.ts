import { initGameFlow } from "./inGameLogic";
import { deleteGameRecord, getGames, type Game } from "./API/games";
import {
  findPlayerByName,
  getPlayers,
  type Player,
} from "./API/players";
import { renderStartPage } from "./startPage";
import {
  clearStoredActivePlayerName,
  getStoredActivePlayerName,
  setStoredActivePlayerName,
} from "./localStorage";
import {
  buildGlobalHighscoreEntries,
  formatGameDate,
  getBestGame,
  sortGamesByNewest,
  type EntityId,
  type GlobalHighscoreEntry,
} from "./highscore";

const ACTIVE_PLAYER_NOT_FOUND_ERROR = "ACTIVE_PLAYER_NOT_FOUND";

export async function renderActivePlayerStartPage(): Promise<void> {
  const main = document.querySelector("main");
  const headerMenu = document.querySelector(".header-menu");
  headerMenu?.replaceChildren();

  if (!main) {
    throw new Error("Could not find main element");
  }

  const activePlayerName = getStoredActivePlayerName();

  if (!activePlayerName) {
    renderMissingPlayerState(
      main,
      "No active player selected",
      "Choose a player from the start page to view the dashboard."
    );
    return;
  }

  main.replaceChildren(
    createStatusPanel("Loading player data...", "Fetching your latest stats.")
  );

  try {
    const { activePlayer, playerGames, globalHighscoreEntries } =
      await loadDashboardData(activePlayerName);

    renderDashboard(
      main,
      activePlayer.playerName,
      playerGames,
      globalHighscoreEntries
    );
  } catch (error) {
    console.error("Failed to load active player start page", error);

    if (
      error instanceof Error &&
      error.message === ACTIVE_PLAYER_NOT_FOUND_ERROR
    ) {
      renderMissingPlayerState(
        main,
        `Could not find "${activePlayerName}"`,
        "Go back to the start page and choose or create a player there."
      );
      return;
    }

    renderLoadError(main);
  }
}

async function loadDashboardData(activePlayerName: string): Promise<{
  activePlayer: Player;
  playerGames: Game[];
  globalHighscoreEntries: GlobalHighscoreEntry[];
}> {
  const [players, games] = await Promise.all([getPlayers(), getGames()]);
  const activePlayer = getActivePlayer(players, activePlayerName);

  const playerGames = sortGamesByNewest(
    games.filter((game) => String(game.playerId) === String(activePlayer.id))
  );

  const globalHighscoreEntries = buildGlobalHighscoreEntries(players, games);

  return {
    activePlayer,
    playerGames,
    globalHighscoreEntries,
  };
}

function getActivePlayer(
  players: Player[],
  activePlayerName: string
): Player {
  const existingPlayer = findPlayerByName(players, activePlayerName);

  if (existingPlayer) {
    setStoredActivePlayerName(existingPlayer.playerName);
    return existingPlayer;
  }

  throw new Error(ACTIVE_PLAYER_NOT_FOUND_ERROR);
}
function renderDashboard(
  main: Element,
  activePlayerName: string,
  playerGames: Game[],
  globalHighscoreEntries: GlobalHighscoreEntry[]
): void {
  let isShowingHowToPlay = false;

  const activePlayerStartPage = document.createElement("section");
  activePlayerStartPage.classList.add("active-player-start-page");

  const leftSection = document.createElement("section");
  leftSection.classList.add("left-section");

  const playerBestGame = getBestGame(playerGames);
  const playerHighscoreSection = createPlayerHighscore(playerBestGame);

  const bottomPanelContainer = document.createElement("div");
  bottomPanelContainer.classList.add("bottom-panel-container");

  const howToPlayBtn = document.createElement("button");
  howToPlayBtn.classList.add("game-btn", "how-to-play-btn");
  howToPlayBtn.type = "button";
  howToPlayBtn.textContent = "How to play";

  function showPlayerGameHistory(): void {
    bottomPanelContainer.replaceChildren(
      createPlayerGameHistorySection(playerGames, async (gameId) => {
        await deleteGameRecord(String(gameId));
        await renderActivePlayerStartPage();
      })
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
    activePlayerName,
    globalHighscoreEntries,
    howToPlayBtn
  );

  activePlayerStartPage.append(leftSection, rightSection);
  main.replaceChildren(activePlayerStartPage);
  requestAnimationFrame(() => {
    activePlayerStartPage.classList.add("fade-in");
  });
}

function renderLoadError(main: Element): void {
  const errorPanel = createStatusPanel(
    "Could not load player data",
    "Start json-server and try again."
  );

  const actions = document.createElement("div");

  const retryBtn = document.createElement("button");
  retryBtn.classList.add("game-btn");
  retryBtn.type = "button";
  retryBtn.textContent = "Retry";
  retryBtn.addEventListener("click", () => {
    void renderActivePlayerStartPage();
  });

  const changePlayerBtn = document.createElement("button");
  changePlayerBtn.classList.add("game-btn");
  changePlayerBtn.type = "button";
  changePlayerBtn.textContent = "Change Player";
  changePlayerBtn.addEventListener("click", () => {
    clearStoredActivePlayerName();
    void renderStartPage();
  });

  actions.append(retryBtn, changePlayerBtn);
  errorPanel.append(actions);
  main.replaceChildren(errorPanel);
}

function renderMissingPlayerState(
  main: Element,
  titleText: string,
  bodyText: string
): void {
  const statePanel = createStatusPanel(titleText, bodyText);
  const actions = document.createElement("div");

  const goToStartPageBtn = document.createElement("button");
  goToStartPageBtn.classList.add("game-btn");
  goToStartPageBtn.type = "button";
  goToStartPageBtn.textContent = "Go to Start Page";
  goToStartPageBtn.addEventListener("click", () => {
    clearStoredActivePlayerName();
    void renderStartPage();
  });

  const retryBtn = document.createElement("button");
  retryBtn.classList.add("game-btn");
  retryBtn.type = "button";
  retryBtn.textContent = "Retry";
  retryBtn.addEventListener("click", () => {
    void renderActivePlayerStartPage();
  });

  actions.append(goToStartPageBtn, retryBtn);
  statePanel.append(actions);
  main.replaceChildren(statePanel);
}

function createStatusPanel(titleText: string, bodyText: string): HTMLElement {
  const panel = document.createElement("section");
  panel.classList.add("active-player-start-page");

  const title = document.createElement("h2");
  title.classList.add("panel-title");
  title.textContent = titleText;

  const body = document.createElement("p");
  body.classList.add("panel-subtitle");
  body.textContent = bodyText;

  panel.append(title, body);

  return panel;
}

function createPlayerHighscore(bestGame: Game | null): HTMLElement {
  const playerHighscoreSection = document.createElement("section");
  playerHighscoreSection.classList.add("player-highscore");

  const highscoreTitle = document.createElement("h2");
  highscoreTitle.classList.add("panel-title");
  highscoreTitle.textContent = "Your Highscore";

  const highscoreText = document.createElement("p");
  highscoreText.classList.add("highscore-value");
  highscoreText.textContent = `${bestGame?.score ?? 0} points`;

  playerHighscoreSection.append(highscoreTitle, highscoreText);

  return playerHighscoreSection;
}

function createPlayerGameHistorySection(
  playerGames: Game[],
  onDeleteGame: (gameId: EntityId) => Promise<void>
): HTMLElement {
  const playerGameHistorySection = document.createElement("section");
  playerGameHistorySection.classList.add("player-recent-games");

  const sectionTitle = document.createElement("h2");
  sectionTitle.classList.add("panel-title");
  sectionTitle.textContent = "Your Game History";

  const sectionSubtitle = document.createElement("p");
  sectionSubtitle.classList.add("panel-subtitle");
  sectionSubtitle.textContent = "Latest games";

  playerGameHistorySection.append(sectionTitle, sectionSubtitle);

  if (playerGames.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.classList.add("panel-subtitle");
    emptyState.textContent =
      "No saved games yet. Finished games will appear here once the game flow stores them.";
    playerGameHistorySection.append(emptyState);
    return playerGameHistorySection;
  }

  const playerScoreTable = createPlayerScoreTable(playerGames, onDeleteGame);

  playerGameHistorySection.append(playerScoreTable);

  return playerGameHistorySection;
}

function createPlayerScoreTable(
  rows: Game[],
  onDeleteGame: (gameId: EntityId) => Promise<void>
): HTMLElement {
  const playerScoreTable = document.createElement("div");
  playerScoreTable.classList.add("score-table", "player-score-table");

  const headerRow = createPlayerScoreHeaderRow();
  playerScoreTable.append(headerRow);

  rows.forEach((game) => {
    const scoreRow = createPlayerScoreRow(game, onDeleteGame);
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

function createPlayerScoreRow(
  game: Game,
  onDeleteGame: (gameId: EntityId) => Promise<void>
): HTMLElement {
  const scoreRow = document.createElement("div");
  scoreRow.classList.add("score-row", "player-score-row");

  const gameDate = document.createElement("span");
  gameDate.classList.add("score-cell", "score-date");
  gameDate.textContent = formatGameDate(game.gameDate);

  const gameLevel = document.createElement("span");
  gameLevel.classList.add("score-cell", "score-level");
  gameLevel.textContent = String(game.level);

  const gameScore = document.createElement("span");
  gameScore.classList.add("score-cell", "score-points");
  gameScore.textContent = String(game.score);

  const deleteCell = document.createElement("span");
  deleteCell.classList.add("score-cell", "score-delete");

  const deleteBtn = createDeleteButton(game, deleteCell, onDeleteGame);
  deleteCell.append(deleteBtn);

  scoreRow.append(gameDate, gameLevel, gameScore, deleteCell);

  return scoreRow;
}

function createDeleteButton(
  game: Game,
  deleteCell: HTMLElement,
  onDeleteGame: (gameId: EntityId) => Promise<void>
): HTMLButtonElement {
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-game-btn");
  deleteBtn.type = "button";
  deleteBtn.textContent = "X";
  deleteBtn.setAttribute("aria-label", "Delete game");

  deleteBtn.addEventListener("click", () => {
    const deleteConfirmation = createDeleteConfirmation(
      game,
      deleteCell,
      onDeleteGame
    );
    deleteCell.replaceChildren(deleteConfirmation);
  });

  return deleteBtn;
}

function createDeleteConfirmation(
  game: Game,
  deleteCell: HTMLElement,
  onDeleteGame: (gameId: EntityId) => Promise<void>
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

  confirmBtn.addEventListener("click", async () => {
    confirmBtn.disabled = true;
    cancelBtn.disabled = true;
    confirmationText.textContent = "Deleting...";

    try {
      await onDeleteGame(game.id);
    } catch (error) {
      console.error("Failed to delete game", error);
      confirmationText.textContent = "Delete failed";
      confirmBtn.disabled = false;
      cancelBtn.disabled = false;
    }
  });

  cancelBtn.addEventListener("click", () => {
    const deleteBtn = createDeleteButton(game, deleteCell, onDeleteGame);
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
    "Each successful round gives you score",
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
    setStoredActivePlayerName(activePlayerName);
    initGameFlow();
  });

  const changePlayerBtn = document.createElement("button");
  changePlayerBtn.classList.add("game-btn", "change-player-btn");
  changePlayerBtn.type = "button";
  changePlayerBtn.textContent = "Change Player";
  changePlayerBtn.addEventListener("click", () => {
    clearStoredActivePlayerName();
    void renderStartPage();
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

  if (topFive.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.classList.add("panel-subtitle");
    emptyState.textContent =
      "No highscores yet. Saved games from all players will appear here.";
    globalHighscoreSection.append(sectionTitle, emptyState);
    return globalHighscoreSection;
  }

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
  rank: number
): HTMLElement {
  const scoreRow = document.createElement("div");
  scoreRow.classList.add("score-row");

  const name = document.createElement("span");
  name.classList.add("score-cell", "score-name");
  name.textContent = `${rank + 1}. ${playerName}`;

  if (rank === 0) {
    scoreRow.classList.add("gold-rank");
  } else if (rank === 1) {
    scoreRow.classList.add("silver-rank");
  } else if (rank === 2) {
    scoreRow.classList.add("bronze-rank");
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

