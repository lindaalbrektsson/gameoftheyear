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

  // Tillfällig data för aktiv spelare
  const activePlayer: ActivePlayer = {
    name: "PlayerOne",
    highscore: "80 points",
  };

  // Tillfällig data för spelarens senaste resultat
  const recentGames: ScoreEntry[] = [
    { name: "PlayerOne", level: "5", points: "80" },
    { name: "PlayerOne", level: "4", points: "70" },
    { name: "PlayerOne", level: "3", points: "60" },
    { name: "PlayerOne", level: "2", points: "50" },
  ];

  // Tillfällig data för global highscore
  const globalHighscoreRows: ScoreEntry[] = [
    { name: "Player1", level: "10", points: "1000" },
    { name: "Player2", level: "9", points: "900" },
    { name: "Player3", level: "8", points: "800" },
    { name: "Player4", level: "7", points: "700" },
    { name: "Player5", level: "6", points: "600" },
    { name: "Player6", level: "5", points: "500" },
  ];

  // Håller koll på om How to play visas eller inte
  let isShowingHowToPlay = false;

  // Wrapper för hela vyn
  const activePlayerStartPage = document.createElement("section");
  activePlayerStartPage.classList.add("active-player-start-page");

  // Vänster kolumn
  const leftSection = document.createElement("section");
  leftSection.classList.add("left-section");

  // Övre vänstra panelen: spelarens highscore
  const playerHighscore = createPlayerHighscore(activePlayer.highscore);

  // Nedre vänstra panelen: här växlar vi mellan recent games och how to play
  const bottomPanelContainer = document.createElement("div");
  bottomPanelContainer.classList.add("bottom-panel-container");

  // Toggle-knappen som byter innehåll i nedre vänstra panelen
  const howToPlayBtn = document.createElement("button");
  howToPlayBtn.classList.add("game-button", "how-to-play-btn");
  howToPlayBtn.type = "button";
  howToPlayBtn.textContent = "How to play";

  // Visar spelarens senaste resultat
  function showRecentGames(): void {
    bottomPanelContainer.replaceChildren(createPlayerRecentGames(recentGames));
    howToPlayBtn.textContent = "How to play";
  }

  // Visar instruktioner för hur spelet fungerar
  function showHowToPlayPanel(): void {
    bottomPanelContainer.replaceChildren(createHowToPlayPanel());
    howToPlayBtn.textContent = "Your recent game scores";
  }

  // Växlar mellan recent games och how to play
  function toggleHowToPlayPanel(): void {
    if (isShowingHowToPlay) {
      showRecentGames();
      isShowingHowToPlay = false;
      return;
    }

    showHowToPlayPanel();
    isShowingHowToPlay = true;
  }

  // Kopplar toggle-funktionen till knappen
  howToPlayBtn.addEventListener("click", toggleHowToPlayPanel);

  // Standardläge när sidan laddas: recent games visas
  showRecentGames();

  leftSection.append(playerHighscore, bottomPanelContainer);

  // Höger kolumn
  const rightSection = createRightSection(
    activePlayer.name,
    globalHighscoreRows,
    howToPlayBtn
  );

  // Lägg in båda kolumnerna i huvudvyn
  activePlayerStartPage.append(leftSection, rightSection);
  main.replaceChildren(activePlayerStartPage);
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
  recentGamesTitle.textContent = "Your recent game scores";

  const recentGamesSubtitle = document.createElement("p");
  recentGamesSubtitle.classList.add("panel-subtitle");
  recentGamesSubtitle.textContent = "Latest scores";

  // Skapar tabellen utan medaljer/rank-ikoner
  const scoreTable = createScoreTable(recentGames, false);

  playerRecentGames.append(
    recentGamesTitle,
    recentGamesSubtitle,
    scoreTable
  );

  return playerRecentGames;
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
    "Match the correct tiles based on the given rule",
    "Each correct move gives you points",
    "Advance through levels as difficulty increases",
    "Avoid mistakes to keep your score high",
    "Try to beat your previous highscore",
    "Compete for a spot on the global leaderboard",
  ];

  // Skapar en punktlista med instruktioner
  steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    list.append(li);
  });

  howToPlayPanel.append(title, list);

  return howToPlayPanel;
}

function createRightSection(
  playerName: string,
  globalHighscoreRows: ScoreEntry[],
  howToPlayBtn: HTMLButtonElement
): HTMLElement {
  const rightSection = document.createElement("section");
  rightSection.classList.add("right-section");

  const welcomePlayer = createWelcomePlayer(playerName);
  const buttonRow = createButtonRow(playerName);
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

function createButtonRow(playerName: string): HTMLElement {
  const buttonRow = document.createElement("div");
  buttonRow.classList.add("button-row");

  const startGameBtn = document.createElement("button");
  startGameBtn.classList.add("game-button", "start-game-btn");
  startGameBtn.type = "button";
  startGameBtn.textContent = "Start Game";
  startGameBtn.addEventListener("click", () => {
    // Sparar aktiv spelare i localStorage
    localStorage.setItem("activePlayer", playerName);

    // TODO: Byt till renderInGame() när inGame-modulen finns
    console.log("Start game clicked");
  });

  const changePlayerBtn = document.createElement("button");
  changePlayerBtn.classList.add("game-button", "change-player-btn");
  changePlayerBtn.type = "button";
  changePlayerBtn.textContent = "Change Player";
  changePlayerBtn.addEventListener("click", () => {
    // TODO: Byt till logik för att gå tillbaka till startPage
    console.log("Change player clicked");
  });

  buttonRow.append(startGameBtn, changePlayerBtn);

  return buttonRow;
}

function createGlobalHighscore(globalHighscoreRows: ScoreEntry[]): HTMLElement {
  const globalHighscore = document.createElement("section");
  globalHighscore.classList.add("global-highscore");

  const globalHighscoreTitle = document.createElement("h2");
  globalHighscoreTitle.classList.add("panel-title");
  globalHighscoreTitle.textContent = "Global Highscore";

  // Visar bara topp 5 i global highscore
  const topFive = globalHighscoreRows.slice(0, 5);

  // Skapar tabellen med medaljer för topp 3
  const scoreTable = createScoreTable(topFive, true);

  globalHighscore.append(globalHighscoreTitle, scoreTable);

  return globalHighscore;
}

function createScoreTable(
  rows: ScoreEntry[],
  showRankIcons = false
): HTMLElement {
  const scoreTable = document.createElement("div");
  scoreTable.classList.add("score-table");

  const scoreHeaderRow = createScoreHeaderRow();
  scoreTable.append(scoreHeaderRow);

  // Skapar alla rader i tabellen
  rows.forEach((row, index) => {
    const rank = showRankIcons ? index : undefined;
    const scoreRow = createScoreRow(row.name, row.level, row.points, rank);
    scoreTable.append(scoreRow);
  });

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
  pointsValue: string,
  rank?: number
): HTMLElement {
  const scoreRow = document.createElement("div");
  scoreRow.classList.add("score-row");

  const name = document.createElement("span");
  name.classList.add("score-cell", "score-name");

  // Lägg till medalj för topp 3 i global highscore
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
  level.textContent = levelValue;

  const points = document.createElement("span");
  points.classList.add("score-cell", "score-points");
  points.textContent = pointsValue;

  scoreRow.append(name, level, points);

  return scoreRow;
}