// Denna kan köras från startsidorna och endgame
export function initGameFlow(): void {
  resetGame();
  renderInGame();
  updateUI();
  startCountdown();
}

// Deklarerar dessa variabler för att kunna använda dem i funktioner
let gameboard: HTMLDivElement;
let levelCounter: HTMLSpanElement;
let scoreCounter: HTMLSpanElement;
let timer: HTMLParagraphElement;
let lives: HTMLParagraphElement;

// Denna bör ligga i en egen modul (som hanterar data) och importeras dit man behöver dem.
// Vi kan fylla på med fler variabler om vi behöver. detta hänger med och uppdateras under spelet.
// Vi får fundera på vad "spelomgångstimern" ska stå på när countdown körs. 00:00 eller rätt antal sekunder.
export const state = {
  level: 1,
  score: 0,
  timeLeft: 0,
  lives: 3,
};

export function renderInGame(): void {
  renderHeaderMenu();

  const main = document.querySelector("main");
  if (!main) {
    throw new Error("Can't find main element");
  }

  main.innerHTML = "";

  const inGameContainer = document.createElement("div");
  inGameContainer.classList.add("in-game-container");

  const gameTopBar = document.createElement("div");
  gameTopBar.classList.add("game-top-bar");

  const restartLevelScoreDiv = renderRestartLevelScore();
  const timerAndLivesDiv = renderTimerAndLives();

  gameTopBar.append(restartLevelScoreDiv, timerAndLivesDiv);

  gameboard = document.createElement("div");
  gameboard.classList.add("gameboard");

  inGameContainer.append(gameTopBar, gameboard);
  main.appendChild(inGameContainer);
}

function renderHeaderMenu(): void {
  const headerMenu = document.querySelector(".header-menu");
  if (!headerMenu) {
    throw new Error("Can't find UL in header");
  }

  headerMenu.innerHTML = "";

  const activePlayerName = localStorage.getItem("activePlayer") ?? "";

  const activePlayerInfo = document.createElement("li");
  activePlayerInfo.textContent = `Playing as: ${activePlayerName}`;

  const endGameLi = document.createElement("li");
  const endGameBtn = document.createElement("button");
  const homepageIcon = document.createElement("i");

  endGameBtn.type = "button";
  endGameBtn.classList.add("game-btn", "end-game-btn");

  homepageIcon.classList.add("fa-regular", "fa-house");
  endGameBtn.textContent = "End Game ";
  endGameBtn.appendChild(homepageIcon);

  endGameLi.appendChild(endGameBtn);
  headerMenu.append(activePlayerInfo, endGameLi);
}

function renderRestartLevelScore(): HTMLDivElement {
  const restartLevelScoreDiv = document.createElement("div");
  restartLevelScoreDiv.classList.add("restart-level-score");

  const restartBtn = document.createElement("button");
  restartBtn.type = "button";
  restartBtn.classList.add("game-btn", "restart-btn");

  const restartIcon = document.createElement("i");
  restartIcon.classList.add("fa-solid", "fa-arrow-rotate-left");

  restartBtn.textContent = "Restart ";
  restartBtn.appendChild(restartIcon);

  restartBtn.addEventListener("click", () => {
    resetGame();
    updateUI();
    startCountdown();
  });

  const levelAndScoreDiv = document.createElement("div");
  levelAndScoreDiv.classList.add("level-and-score");

  const level = document.createElement("p");
  level.textContent = "Level: ";

  levelCounter = document.createElement("span");
  levelCounter.classList.add("level-counter");
  level.appendChild(levelCounter);

  const score = document.createElement("p");
  score.textContent = "Score: ";

  scoreCounter = document.createElement("span");
  scoreCounter.classList.add("score-counter");
  score.appendChild(scoreCounter);

  levelAndScoreDiv.append(level, score);
  restartLevelScoreDiv.append(restartBtn, levelAndScoreDiv);

  return restartLevelScoreDiv;
}

function renderTimerAndLives(): HTMLDivElement {
  const timerAndLivesDiv = document.createElement("div");
  timerAndLivesDiv.classList.add("timer-and-lives");

  timer = document.createElement("p");
  timer.classList.add("timer");

  lives = document.createElement("p");
  lives.classList.add("lives");

  timerAndLivesDiv.append(timer, lives);
  return timerAndLivesDiv;
}

export function startCountdown(): void {
  const countdown = document.createElement("p");
  countdown.classList.add("countdown");

  gameboard.innerHTML = "";
  gameboard.appendChild(countdown);

  let counter = 5;

  const countdownIntervalId = setInterval(() => {
    countdown.textContent = counter.toString();
    counter--;

    if (counter === 0) {
      clearInterval(countdownIntervalId);
      // startGame();
    }
  }, 1000);
}

function resetGame(): void {
  state.level = 1;
  state.score = 0;
  state.timeLeft = 0;
  state.lives = 3;
}

export function updateUI(): void {
  levelCounter.textContent = state.level.toString();
  scoreCounter.textContent = state.score.toString();
  // timer.textContent = skriv kod för timer
  lives.textContent = "❤️".repeat(state.lives);
}