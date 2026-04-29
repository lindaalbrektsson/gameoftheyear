import { renderActivePlayerStartPage } from "./activePlayerStartPage";
import { initGameFlow } from "./inGameLogic";
import { formatGameDate } from "./highscore";
import { getStoredActivePlayerName } from "./localStorage";
import { renderStartPage } from "./startPage";

const mainContainer = document.querySelector("main");

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

const API_URL = "http://localhost:3000";

async function fetchPlayers(): Promise<Player[]> {
  try {
    const res = await fetch(`${API_URL}/players`);
    if (!res.ok) throw new Error("Failed to fetch players");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function fetchGames(): Promise<Game[]> {
  try {
    const res = await fetch(`${API_URL}/games`);
    if (!res.ok) throw new Error("Failed to fetch games");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function renderGameOver(): Promise<void> {
  if (!mainContainer) {
    return;
  }

  const headerMenu = document.querySelector(".header-menu");
  headerMenu?.replaceChildren();
  const activePlayerName = getStoredActivePlayerName();

  // endGame "hem" knapp
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
  endGameBtn.textContent = ""; // ingen text så bara hemikonen syns
  endGameBtn.appendChild(homepageIcon);
  endGameLi.appendChild(endGameBtn);

  endGameBtn.addEventListener("click", function (evt) {
    evt.preventDefault();
    if (activePlayerName) {
      void renderActivePlayerStartPage();
      return;
    }

    void renderStartPage();
  });

  mainContainer.replaceChildren();

  // gameovercontainer för att ha egen styling istället för "main" som påverkar alla
  const gameOverContainer = document.createElement("div");
  gameOverContainer.className = "game-over-container";

  // Fetch data från json
  const players = await fetchPlayers();
  const games = await fetchGames();

  const activePlayer = activePlayerName
    ? players.find(
        (player) =>
          player.playerName.toLowerCase() === activePlayerName.toLowerCase(),
      )
    : undefined;

  let recentGames: Game[] = [];
  let latestScore = 0; // Håller senaste rundans poäng

  if (activePlayer) {
    const playerGames = games.filter(
      (game) => game.playerId === activePlayer.id,
    );

    // hämta det senaste spelet baserat på datum
    // pusha score i inGame när rundan är över precis innan vi byter vy till gameover?
    const sortedByDate = [...playerGames].sort((a, b) => {
      return new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime();
    });

    if (sortedByDate.length > 0) {
      latestScore = sortedByDate[0].score;
    }

    recentGames = playerGames
      .sort((a, b) => {
        // sortera spelhistorik med level först
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        // Sortera på score efter
        return b.score - a.score;
      })
      .slice(0, 10); // hämta top 10 historik
  }

  // globala toopplistan och varje spelar-id mappas till rätt namn
  const globalHighscoreEntries: GlobalHighscoreEntry[] = games
    .map((game) => {
      const player = players.find((p) => p.id === game.playerId);
      return {
        playerName: player ? player.playerName : "Unknown",
        level: game.level,
        score: game.score,
      };
    })
    .sort((a, b) => b.score - a.score) // sortera från högst score till lägst
    .slice(0, 5); // hämta top 5

  const leftColumn = document.createElement("div");
  leftColumn.className = "column left-column";

  const rightColumn = document.createElement("div");
  rightColumn.className = "column right-column";

  const scoreContainer = document.createElement("section");
  scoreContainer.className = "score-container";

  const scoreTitle = document.createElement("h2");
  scoreTitle.className = "panel-title";
  scoreTitle.textContent = "Your Score Last Round";

  const scoreValue = document.createElement("p");
  scoreValue.className = "highscore-value";
  scoreValue.textContent = `${latestScore} points`;

  scoreContainer.append(scoreTitle, scoreValue);

  const restartGameBtn = document.createElement("button");
  restartGameBtn.className = "game-btn restart-game-btn";
  restartGameBtn.type = "button";
  restartGameBtn.textContent = "Play Again!";

  restartGameBtn.addEventListener("click", function (evt) {
    evt.preventDefault();
    initGameFlow();
  });

  const recentGamesScoreboard = document.createElement("section");
  recentGamesScoreboard.className =
    "recent-games-scoreboard player-recent-games";

  const recentGamesTitle = document.createElement("h2");
  recentGamesTitle.className = "panel-title";
  recentGamesTitle.textContent = "Your Recent Games";

  const recentGamesSubtitle = document.createElement("p");
  recentGamesSubtitle.className = "panel-subtitle";
  recentGamesSubtitle.textContent = "Manage your history";

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
  globalHighScoreList.className = "global-high-score-list global-highscore";

  const globalHighScoreTitle = document.createElement("h2");
  globalHighScoreTitle.className = "panel-title";
  globalHighScoreTitle.textContent = "Global Highscore";

  const globalHighScoreTable = createGlobalHighscoreTable(
    globalHighscoreEntries,
  );

  globalHighScoreList.append(globalHighScoreTitle, globalHighScoreTable);

  rightColumn.append(highScoreNotice, globalHighScoreList);

  gameOverContainer.append(leftColumn, rightColumn);
  mainContainer.append(gameOverContainer);
}

function createRecentGamesTable(rows: Game[]): HTMLElement {
  const scoreTable = document.createElement("div");
  scoreTable.className = "score-table player-score-table";

  const headerRow = document.createElement("div");
  headerRow.className = "score-row score-header player-score-row";

  const dateHeader = document.createElement("span");
  dateHeader.className = "score-cell score-date";
  dateHeader.textContent = "Date";

  const levelHeader = document.createElement("span");
  levelHeader.className = "score-cell score-level";
  levelHeader.textContent = "Level";

  const scoreHeader = document.createElement("span");
  scoreHeader.className = "score-cell score-points";
  scoreHeader.textContent = "Score";

  const deleteHeader = document.createElement("span");
  deleteHeader.classList.add("score-cell", "score-delete");
  deleteHeader.textContent = "";

  headerRow.append(dateHeader, levelHeader, scoreHeader, deleteHeader);
  scoreTable.append(headerRow);

  rows.forEach((game) => {
    const scoreRow = document.createElement("div");
    scoreRow.className = "score-row player-score-row";

    const gameDate = document.createElement("span");
    gameDate.className = "score-cell score-date";
    gameDate.textContent = formatGameDate(game.gameDate);

    const gameLevel = document.createElement("span");
    gameLevel.className = "score-cell score-level";
    gameLevel.textContent = String(game.level);

    const gameScore = document.createElement("span");
    gameScore.className = "score-cell score-points";
    gameScore.textContent = String(game.score);

    const deleteCell = document.createElement("span");
    deleteCell.classList.add("score-cell", "score-delete");

    const deleteBtn = createDeleteButton(game, deleteCell, scoreRow);
    deleteCell.append(deleteBtn);

    scoreRow.append(gameDate, gameLevel, gameScore, deleteCell);
    scoreTable.append(scoreRow);
  });

  return scoreTable;
}

// ta bort från spelarhistorik
function createDeleteButton(
  game: Game,
  deleteCell: HTMLElement,
  scoreRow: HTMLElement,
): HTMLButtonElement {
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-game-btn");
  deleteBtn.type = "button";
  deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  deleteBtn.setAttribute("aria-label", "Delete game");

  deleteBtn.addEventListener("click", () => {
    const deleteConfirmation = createDeleteConfirmation(
      game,
      deleteCell,
      scoreRow,
    );
    deleteCell.replaceChildren(deleteConfirmation);
  });

  return deleteBtn;
}

// bekräfta borttagning av spelhistorik
function createDeleteConfirmation(
  game: Game,
  deleteCell: HTMLElement,
  scoreRow: HTMLElement,
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
    try {
      // JSON Server DELETE
      const response = await fetch(`${API_URL}/games/${game.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete the game");

      // om vi lyckas ta bort spelhistorik från db, ta bort visuellt också
      scoreRow.remove();
    } catch (error) {
      console.error(`Failed to delete game with id: ${game.id}`, error);
      // Om vi inte lyckas ta bort spelhistoriken från db, lägg tillbaka delete knapp
      const deleteBtn = createDeleteButton(game, deleteCell, scoreRow);
      deleteCell.replaceChildren(deleteBtn);
    }
  });

  cancelBtn.addEventListener("click", () => {
    const deleteBtn = createDeleteButton(game, deleteCell, scoreRow);
    deleteCell.replaceChildren(deleteBtn);
  });

  buttonsWrapper.append(confirmBtn, cancelBtn);
  confirmationWrapper.append(confirmationText, buttonsWrapper);

  return confirmationWrapper;
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
