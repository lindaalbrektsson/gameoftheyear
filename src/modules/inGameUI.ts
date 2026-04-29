import { type Shape } from "./API/shapes";
import { renderActivePlayerStartPage } from "./activePlayerStartPage";
import { type Instruction } from "./API/instructions";
import { stopRoundTimer } from "./inGameTimer";
import {
  startNewRound,
  resetState,
  state,
  handleTileClick,
} from "./inGameLogic";
import { getStoredActivePlayerName } from "./localStorage";

// Declares variables needed across the in-game UI functions.
let gameboard: HTMLDivElement;
let shapeAndInstructionDiv: HTMLDivElement;
let shapesDiv: HTMLDivElement;
let timerAndLivesDiv: HTMLDivElement;
let levelCounter: HTMLSpanElement;
let scoreCounter: HTMLSpanElement;
let timer: HTMLSpanElement;
let lives: HTMLParagraphElement;

export function renderInGame() {
  renderHeaderMenu();
  const main = document.querySelector("main");
  if (!main) {
    throw new Error("Can't find main element");
  }
  main.innerHTML = "";
  const inGameContainer = document.createElement("div");
  inGameContainer.classList.add("in-game-container");

  const restartLevelScoreDiv = renderRestartLevelScore();
  const timerAndLivesDiv = renderTimerAndLives();

  gameboard = document.createElement("div");
  gameboard.classList.add("gameboard");

  inGameContainer.append(restartLevelScoreDiv, timerAndLivesDiv, gameboard);
  main.appendChild(inGameContainer);
  inGameContainer.classList.add("fade-in");
}

function renderHeaderMenu() {
  const headerMenu = document.querySelector(".header-menu");
  headerMenu?.classList.add("header-menu");
  if (!headerMenu) {
    throw new Error("Can't find UL in header");
  }
  headerMenu.innerHTML = "";

  const activePlayerName = getStoredActivePlayerName();
  const activePlayerInfo = document.createElement("li");
  activePlayerInfo.classList.add("active-player-info");
  activePlayerInfo.textContent = activePlayerName
    ? `Playing as: ${activePlayerName}`
    : "Playing as: Unknown player";

  const endGameLi = document.createElement("li");
  const endGameBtn = document.createElement("button");
  endGameBtn.classList.add("game-btn", "end-game-btn");
  const homepageIcon = document.createElement("i");
  homepageIcon.classList.add("fa-regular", "fa-house");
  endGameBtn.textContent = "End Game";
  endGameBtn.appendChild(homepageIcon);
  endGameBtn.addEventListener("click", () => {
    stopRoundTimer();
    resetState();
    void renderActivePlayerStartPage();
  });
  endGameLi.appendChild(endGameBtn);
  headerMenu.append(activePlayerInfo, endGameLi);
}

function renderRestartLevelScore(): HTMLDivElement {
  const restartLevelScoreDiv = document.createElement("div");
  restartLevelScoreDiv.classList.add("restart-level-score-div");
  const restartBtn = document.createElement("button");
  restartBtn.classList.add("game-btn", "restart-btn");
  const restartIcon = document.createElement("i");
  restartIcon.classList.add("fa-solid", "fa-arrow-rotate-left");
  restartBtn.textContent = "Restart";
  restartBtn.appendChild(restartIcon);
  restartBtn.addEventListener("click", () => {
    stopRoundTimer();
    resetState();
    updateUI();
    startCountdown();
  });

  const levelAndScoreDiv = document.createElement("div");
  levelAndScoreDiv.classList.add("level-and-score-div");
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
  timerAndLivesDiv = document.createElement("div");
  timerAndLivesDiv.classList.add("timer-and-lives-div");
  const timeLeft = document.createElement("p");
  timeLeft.classList.add("time-left");
  timer = document.createElement("span");
  timer.classList.add("timer");
  timeLeft.textContent = "Time left: ";
  timeLeft.appendChild(timer);
  lives = document.createElement("p");
  lives.classList.add("lives");
  timerAndLivesDiv.append(timeLeft, lives);
  return timerAndLivesDiv;
}

export function startCountdown() {
  const countdown = document.createElement("p");
  gameboard.innerHTML = "";
  gameboard.appendChild(countdown);
  countdown.classList.add("countdown");

  let counter = 5;

  const countdownIntervalId = setInterval(() => {
    countdown.textContent = counter.toString();
    counter--;

    if (counter === 0) {
      clearInterval(countdownIntervalId);
      setTimeout(() => {
        changeGameboard();
        void startNewRound();
      }, 1000);
    }
  }, 1000);
}

function changeGameboard() {
  gameboard.innerHTML = "";
  shapeAndInstructionDiv = document.createElement("div");
  shapeAndInstructionDiv.classList.add("shape-and-instruction-div");
  shapesDiv = document.createElement("div");
  shapesDiv.classList.add("shapes-div");
}

export async function renderShapes(shapes: Shape[]) {
  shapes.forEach((shape) => {
    const shapeItem = document.createElement("div");
    shapeItem.classList.add(`${shape.type}`, "shape-item");
    if (shape.type === "triangle") {
      shapeItem.style.borderBottomColor = `var(--${shape.color})`;
    } else {
      shapeItem.style.backgroundColor = `var(--${shape.color})`;
    }
    shapesDiv.appendChild(shapeItem);

    shapeItem.addEventListener("click", () => {
      handleTileClick(shape, shapeItem);
    });
  });
  gameboard.appendChild(shapesDiv);
  requestAnimationFrame(() => {
    gameboard.classList.add("fade-in");
  });
}

// Gets the instruction shape from the instruction's rule type.
export async function renderInstruction(
  newInstruction: Instruction,
  newInstructionShape: Shape,
) {
  const instruction = document.createElement("p");
  instruction.classList.add("instruction");
  instruction.textContent = newInstruction.info;
  const shape = document.createElement("div");
  shape.classList.add(`${newInstructionShape.type}`);

  if (newInstructionShape.type === "triangle") {
    shape.style.borderBottomColor = `var(--${newInstructionShape.color})`;
  } else {
    shape.style.backgroundColor = `var(--${newInstructionShape.color})`;
  }

  shapeAndInstructionDiv.append(shape, instruction);
  gameboard.appendChild(shapeAndInstructionDiv);
}

// UI updates based on state.
export function updateUI() {
  levelCounter.textContent = state.level.toString();
  scoreCounter.textContent = state.score.toString();
  timer.textContent = state.timeLeft.toString();
  lives.textContent = "❤️".repeat(state.lives);
}

export function updateTimerUI() {
  timer.textContent = state.timeLeft.toString();
}

export function updateLivesUI() {
  lives.textContent = "❤️".repeat(state.lives);
  lives.classList.add("highlight");
  setTimeout(() => {
    lives.classList.remove("highlight");
  }, 400);
}

export function updateLevelUI() {
  levelCounter.textContent = state.level.toString();
  levelCounter.classList.add("jump-level");
  setTimeout(() => {
    levelCounter.classList.remove("jump-level");
  }, 400);
}

export function updateScoreUI() {
  scoreCounter.textContent = state.score.toString();
  scoreCounter.classList.add("jump-score");
  setTimeout(() => {
    scoreCounter.classList.remove("jump-score");
  }, 400);
}

export function resetForNextRound() {
  gameboard.classList.remove("fade-in");
  gameboard.innerHTML = "";
  shapeAndInstructionDiv.innerHTML = "";
  shapesDiv.innerHTML = "";
}

export function renderGameOverMessage(): void {
  const gameoverMessage = document.createElement("p");
  gameoverMessage.classList.add("game-over");
  gameoverMessage.textContent = "Game Over!";
  timerAndLivesDiv.innerHTML = "";
  gameboard.replaceChildren(gameoverMessage);
}

export function renderErrorLoadingGame() {
  const errorLoadingGame = document.createElement("p");
  errorLoadingGame.classList.add("error-loading-game");
  errorLoadingGame.textContent = "Can't load gameboard. Try again!";
  gameboard.appendChild(errorLoadingGame);
}
