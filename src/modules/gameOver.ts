import { renderActivePlayerStartPage } from "./activePlayerStartPage";
import { initGameFlow, state, resetState } from "./inGameLogic";
import {
  formatGameDate,
  sortGamesByNewest,
  buildGlobalHighscoreEntries,
  type PlayerRecord,
  type GameRecord,
} from "./highscore";
import { getStoredActivePlayerName } from "./localStorage";
import { renderStartPage } from "./startPage";

const mainContainer = document.querySelector("main");

type Player = PlayerRecord & { bestScore: number };
type Game = GameRecord;

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

  const gameOverContainer = document.createElement("div");
  gameOverContainer.className = "game-over-container";

  // Hämta data för att kunna matcha spelare och uppdatera poäng
  const players = await fetchPlayers();
  const activePlayer = activePlayerName
    ? players.find(
        (player) =>
          player.playerName.toLowerCase() === activePlayerName.toLowerCase(),
      )
    : undefined;

  const finalScoreThisRound = state.score;
  let isNewRecord = false;

  if (activePlayer && state.score > 0) {
    try {
      //  UTC+2 (svensk tid)
      const now = new Date();
      const localOffset = now.getTimezoneOffset() * 60000;
      const localTime = new Date(now.getTime() - localOffset);

      const newGame = {
        gameDate: localTime.toISOString().substring(0, 19),
        score: state.score,
        level: state.level,
        playerId: activePlayer.id,
      };

      // POST: Spara rundan i historiken
      await fetch(`${API_URL}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGame),
      });

      // PUT:uppdatera bestscore om score > bestscore
      const currentBest = activePlayer.bestScore || 0;
      if (state.score > currentBest) {
        isNewRecord = true;
        const updatedPlayer = {
          ...activePlayer,
          bestScore: state.score,
        };

        await fetch(`${API_URL}/players/${activePlayer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPlayer),
        });
      }

      // efter att vi sparat nollställver vi state
      resetState();
    } catch (error) {
      console.error("Failed to save game data:", error);
    }
  }

  // hämta spelen igen med den nysparade rundan i listorna
  const games = await fetchGames();

  let recentGames: Game[] = [];
  if (activePlayer) {
    const playerGames = games.filter(
      (game) => String(game.playerId) === String(activePlayer.id),
    );
    recentGames = sortGamesByNewest(playerGames).slice(0, 10);
  }

  // globala topplistan från highscore.ts
  const globalHighscoreEntries = buildGlobalHighscoreEntries(
    players,
    games,
  ).slice(0, 5);

  const leftColumn = document.createElement("div");
  leftColumn.className = "column left-column";

  const rightColumn = document.createElement("div");
  rightColumn.className = "column right-column";

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
  recentGamesSubtitle.textContent = "Your latest sessions";

  const recentGamesTable = createRecentGamesTable(recentGames);
  recentGamesScoreboard.append(
    recentGamesTitle,
    recentGamesSubtitle,
    recentGamesTable,
  );

  leftColumn.append(scoreContainer, restartGameBtn, recentGamesScoreboard);

  // visa bara om isnewrecord alltså score > bestscore
  if (isNewRecord) {
    const highScoreNotice = document.createElement("div");
    highScoreNotice.className = "high-score-notice";
    highScoreNotice.textContent = "New Personal Best!";
    rightColumn.append(highScoreNotice);
  }

  const globalHighScoreList = document.createElement("section");
  globalHighScoreList.className = "global-high-score-list global-highscore";

  const globalHighScoreTitle = document.createElement("h2");
  globalHighScoreTitle.className = "panel-title";
  globalHighScoreTitle.textContent = "Global Highscore";

  const globalHighScoreTable = createGlobalHighscoreTable(
    globalHighscoreEntries,
    activePlayerName, // för att visa var i global highscore spelaren hamnat
  );
  globalHighScoreList.append(globalHighScoreTitle, globalHighScoreTable);

  rightColumn.append(globalHighScoreList);

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

  headerRow.append(dateHeader, levelHeader, scoreHeader);
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

    scoreRow.append(gameDate, gameLevel, gameScore);
    scoreTable.append(scoreRow);
  });

  return scoreTable;
}

function createGlobalHighscoreTable(
  rows: GlobalHighscoreEntry[],
  activePlayerName: string | null,
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
  scoreHeader.textContent = "Points";

  headerRow.append(nameHeader, levelHeader, scoreHeader);
  scoreTable.append(headerRow);

  rows.forEach((row, index) => {
    const scoreRow = document.createElement("div");
    scoreRow.className = "score-row";

    // Highlighta raden (bestscore)
    if (
      activePlayerName &&
      row.playerName.toLowerCase() === activePlayerName.toLowerCase()
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
