import { getShapes } from "./API/shapes";

//Denna kan köras från startsidorna och endgame
export function initGameFlow () {
    resetGame();
    renderInGame();
    updateUI();
    startCountdown();
}

//Deklarerar dessa variabler för att kunna använda dem i funktioner 
// let activePlayerInfo: HTMLLIElement;
let gameboard: HTMLDivElement;
let shapesDiv: HTMLDivElement;
let levelCounter: HTMLSpanElement;
let scoreCounter: HTMLSpanElement;
let timer: HTMLParagraphElement;
let lives: HTMLParagraphElement;

//Denna bör ligga i en egen modul (som hanterar data) och importeras dit man behöver dem. 
// Vi kan fylla på med fler variabler om vi behöver. detta hänger med och uppdateras under spelet.
//Vi får fundera på vad "spelomgångstimern" ska stå på när countdown körs. 00:00 eller rätt antal sekunder.
export const state = {
    // activePlayer: kanske kan vara en funktion som hämtar namnet från localstorage? eller sätts det på något annat sätt
    level: 1,
    score: 0,
    timeLeft: 0,
    lives: 3
};

export function renderInGame () {
    renderHeaderMenu();
    const main = document.querySelector("main");
    if (!main) {
        throw new Error("Can't find main element")
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
}

function renderHeaderMenu () {
    const headerMenu = document.querySelector(".header-menu");
    headerMenu?.classList.add("header-menu");
    if (!headerMenu) {
        throw new Error("Can't find UL in header")
    }
    const activePlayerInfo = document.createElement("li");
    activePlayerInfo.textContent = `Playing as: ` //Lägg till spelarens namn, hämta från local storage? db?
    const endGameLi = document.createElement("li");
    const endGameBtn = document.createElement("button");
    const homepageIcon = document.createElement("i");
    homepageIcon.classList.add("fa-regular", "fa-house");
    endGameBtn.textContent = "End Game "
    endGameBtn.appendChild(homepageIcon);
    
    endGameLi.appendChild(endGameBtn);
    headerMenu.append(activePlayerInfo, endGameLi);
}

function renderRestartLevelScore (): HTMLDivElement {
    const restartLevelScoreDiv = document.createElement("div");
    restartLevelScoreDiv.classList.add("restart-level-score-div");
    const restartBtn = document.createElement("button");
    restartBtn.classList.add("restart-btn");
    const restartIcon = document.createElement("i");
    restartIcon.classList.add("fa-solid", "fa-arrow-rotate-left");
    restartBtn.textContent = "Restart";
    restartBtn.appendChild(restartIcon);
    restartBtn.addEventListener("click", () => {
        resetGame();
        updateUI();
        startCountdown();
    })

    const levelAndScoreDiv = document.createElement("div");
    levelAndScoreDiv.classList.add("level-and-score-div")
    const level = document.createElement("p");
    level.textContent = "Level: "
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

function renderTimerAndLives (): HTMLDivElement {
    const timerAndLivesDiv = document.createElement("div");
    timerAndLivesDiv.classList.add("timer-and-lives-div")
    timer = document.createElement("p");
    timer.classList.add("timer");
    lives = document.createElement("p");
    lives.classList.add("lives");
    timerAndLivesDiv.append(timer, lives);
    return timerAndLivesDiv;
}

export function startCountdown() {
    const countdown = document.createElement("p");
    countdown.classList.add("countdown");
    gameboard.innerHTML = "";
    gameboard.appendChild(countdown);

    let counter = 5;

    const countdownIntervalId = setInterval(() => {
        countdown.textContent = counter.toString();
        counter--;

        if (counter === 0){
            clearInterval(countdownIntervalId);
            setTimeout(() => startGame(), 1000);
        }
    }, 1000)
}

function resetGame() {
    state.level = 1;
    state.score = 0;
    state.timeLeft = 0;
    state.lives = 3;
}

export function updateUI () {
    // activePlayerInfo.textContent = state.activePlayer;
    levelCounter.textContent = state.level.toString();
    scoreCounter.textContent = state.score.toString();
    timer.textContent = "00:00"
    lives.textContent = "❤️".repeat(state.lives);
}

function startGame() {
    changeGameboard();
    renderShapes();
}

function changeGameboard () {
      gameboard.innerHTML ="";
      const shapeAndInstructionDiv = document.createElement("div");
    shapeAndInstructionDiv.classList.add("shape-and-instruction-div");
        shapesDiv = document.createElement("div");
    shapesDiv.classList.add("shapes-div");
    gameboard.append(shapeAndInstructionDiv, shapesDiv)
}
async function renderShapes () {
    const shapes = await getShapes();

shapes.forEach(shape => {
    const shapeItem = document.createElement("div");
    shapeItem.classList.add(`${shape.type}`, "shape-item")
    shapesDiv.appendChild(shapeItem);

    shapeItem.addEventListener("click", () => {
        shapeItem.classList.add("correct");
    })
});
}