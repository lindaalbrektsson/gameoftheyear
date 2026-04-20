type ScoreEntry = {
  name: string;
  level: string;
  points: string;
};

type ActivePlayer = {
  name: string;
  highscore: string;
};

export function renderActivePlayerStartPage(): void {
  const main = document.querySelector("main");

  if (!main) {
    throw new Error("Could not find main element");
  }

  const activePlayer: ActivePlayer = {
    name: "PlayerOne",
    highscore: "80 points",
  };

  const recentGames: ScoreEntry[] = [
    { name: "PlayerOne", level: "5", points: "80" },
    { name: "PlayerOne", level: "4", points: "70" },
    { name: "PlayerOne", level: "3", points: "60" },
    { name: "PlayerOne", level: "2", points: "50" },
  ];

  const globalHighscore: ScoreEntry[] = [
    { name: "Player1", level: "10", points: "1000" },
    { name: "Player2", level: "9", points: "900" },
    { name: "Player3", level: "8", points: "800" },
    { name: "Player4", level: "7", points: "700" },
    { name: "Player5", level: "6", points: "600" },
    { name: "Player6", level: "5", points: "500" },
    { name: "Player7", level: "4", points: "400" },
    { name: "Player8", level: "3", points: "300" },
    { name: "Player9", level: "2", points: "200" },
    { name: "Player10", level: "1", points: "100" },
  ];

  const activePlayerStartPage = document.createElement("section");
  activePlayerStartPage.classList.add("active-player-start-page");

  const leftSection = createLeftSection(activePlayer.highscore, recentGames);
  const rightSection = createRightSection(activePlayer.name, globalHighscore);

  activePlayerStartPage.append(leftSection, rightSection);
  main.replaceChildren(activePlayerStartPage);
}

function createLeftSection(
  highscore: string,
  recentGames: ScoreEntry[]
): HTMLElement {
  const leftSection = document.createElement("section");
  leftSection.classList.add("left-section");

  const playerHighscore = createPlayerHighscore(highscore);
  const playerRecentGames = createPlayerRecentGames(recentGames);

  leftSection.append(playerHighscore, playerRecentGames);

  return leftSection;
}

function createPlayerHighscore(highscore: string): HTMLElement {
  const playerHighscore = document.createElement("section");
  playerHighscore.classList.add("player-highscore");

  const highscoreTitle = document.createElement("h2");
  highscoreTitle.classList.add("panel-title");
  highscoreTitle.textContent = "Your Highscore";

  const highscoreValue = document.createElement("p");
  highscoreValue.classList.add("highscore-value");
  highscoreValue.textContent = highscore;

  playerHighscore.append(highscoreTitle, highscoreValue);

  return playerHighscore;
}

function createPlayerRecentGames(recentGames: ScoreEntry[]): HTMLElement {
  const playerRecentGames = document.createElement("section");
  playerRecentGames.classList.add("player-recent-games");

  const recentGamesTitle = document.createElement("h2");
  recentGamesTitle.classList.add("panel-title");
  recentGamesTitle.textContent = "Your recent games";

  const recentGamesSubtitle = document.createElement("p");
  recentGamesSubtitle.classList.add("panel-subtitle");
  recentGamesSubtitle.textContent = "Top 10 latest games";

  const scoreTable = createScoreTable(recentGames);

  playerRecentGames.append(
    recentGamesTitle,
    recentGamesSubtitle,
    scoreTable
  );

  return playerRecentGames;
}

function createRightSection(
  playerName: string,
  globalHighscoreRows: ScoreEntry[]
): HTMLElement {
  const rightSection = document.createElement("section");
  rightSection.classList.add("right-section");

  const welcomePlayer = createWelcomePlayer(playerName);
  const buttonRow = createButtonRow();
  const howToPlayBtn = createHowToPlayBtn();
  const globalHighscore = createGlobalHighscore(globalHighscoreRows);

  rightSection.append(
    welcomePlayer,
    buttonRow,
    howToPlayBtn,
    globalHighscore
  );

  return rightSection;
}

function createWelcomePlayer(playerName: string): HTMLElement {
  const welcomePlayer = document.createElement("div");
  welcomePlayer.classList.add("welcome-player");

  const welcomeText = document.createElement("h2");
  welcomeText.classList.add("welcome-text");
  welcomeText.textContent = `Welcome, ${playerName}`;

  welcomePlayer.append(welcomeText);

  return welcomePlayer;
}

function createButtonRow(): HTMLElement {
  const buttonRow = document.createElement("div");
  buttonRow.classList.add("button-row");

  const startGameBtn = document.createElement("button");
  startGameBtn.classList.add("game-button", "start-game-btn");
  startGameBtn.type = "button";
  startGameBtn.textContent = "Start Game";
  startGameBtn.addEventListener("click", () => {
    console.log("Start game clicked");
  });

  const changePlayerBtn = document.createElement("button");
  changePlayerBtn.classList.add("game-button", "change-player-btn");
  changePlayerBtn.type = "button";
  changePlayerBtn.textContent = "Change Player";
  changePlayerBtn.addEventListener("click", () => {
    console.log("Change player clicked");
  });

  buttonRow.append(startGameBtn, changePlayerBtn);

  return buttonRow;
}

function createHowToPlayBtn(): HTMLElement {
  const howToPlayBtn = document.createElement("button");
  howToPlayBtn.classList.add("game-button", "how-to-play-btn");
  howToPlayBtn.type = "button";
  howToPlayBtn.textContent = "How to play?";
  howToPlayBtn.addEventListener("click", () => {
    console.log("How to play clicked");
  });

  return howToPlayBtn;
}

function createGlobalHighscore(globalHighscoreRows: ScoreEntry[]): HTMLElement {
  const globalHighscore = document.createElement("section");
  globalHighscore.classList.add("global-highscore");

  const globalHighscoreTitle = document.createElement("h2");
  globalHighscoreTitle.classList.add("panel-title");
  globalHighscoreTitle.textContent = "Global Highscore";

  const topFive = globalHighscoreRows.slice(0, 5);
  const scoreTable = createScoreTable(topFive);

  globalHighscore.append(globalHighscoreTitle, scoreTable);

  return globalHighscore;
}

function createScoreTable(rows: ScoreEntry[]): HTMLElement {
  const scoreTable = document.createElement("div");
  scoreTable.classList.add("score-table");

  const scoreHeaderRow = createScoreHeaderRow();
  scoreTable.append(scoreHeaderRow);

  for (const row of rows) {
    const scoreRow = createScoreRow(row.name, row.level, row.points);
    scoreTable.append(scoreRow);
  }

  return scoreTable;
}

function createScoreHeaderRow(): HTMLElement {
  const scoreHeaderRow = document.createElement("div");
  scoreHeaderRow.classList.add("score-row", "score-header");

  const nameHeader = document.createElement("span");
  nameHeader.classList.add("score-cell", "score-name");
  nameHeader.textContent = "Name";

  const levelHeader = document.createElement("span");
  levelHeader.classList.add("score-cell", "score-level");
  levelHeader.textContent = "Level";

  const pointsHeader = document.createElement("span");
  pointsHeader.classList.add("score-cell", "score-points");
  pointsHeader.textContent = "Points";

  scoreHeaderRow.append(nameHeader, levelHeader, pointsHeader);

  return scoreHeaderRow;
}

function createScoreRow(
  playerName: string,
  levelValue: string,
  pointsValue: string
): HTMLElement {
  const scoreRow = document.createElement("div");
  scoreRow.classList.add("score-row");

  const name = document.createElement("span");
  name.classList.add("score-cell", "score-name");
  name.textContent = playerName;

  const level = document.createElement("span");
  level.classList.add("score-cell", "score-level");
  level.textContent = levelValue;

  const points = document.createElement("span");
  points.classList.add("score-cell", "score-points");
  points.textContent = pointsValue;

  scoreRow.append(name, level, points);

  return scoreRow;
}