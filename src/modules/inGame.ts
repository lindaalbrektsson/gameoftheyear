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
let timer: HTMLSpanElement;
let lives: HTMLParagraphElement;

//Denna bör ligga i en egen modul (som hanterar data) och importeras dit man behöver dem. 
// Vi kan fylla på med fler variabler om vi behöver. detta hänger med och uppdateras under spelet.
//Vi får fundera på vad "spelomgångstimern" ska stå på när countdown körs. 00:00 eller rätt antal sekunder.
export const state = {
    // activePlayer: kanske kan vara en funktion som hämtar namnet från localstorage? eller sätts det på något annat sätt
    //activePlayerId? 
    level: 1,
    score: 0,
    timeLeft: 0,
    lives: 3,
    difficultyLevel: 1
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
    activePlayerInfo.classList.add("active-player-info");
    activePlayerInfo.textContent = `Playing as: ` //Lägg till spelarens namn, hämta från local storage? db?
    
    const endGameLi = document.createElement("li");
    const endGameBtn = document.createElement("button");
    endGameBtn.classList.add("end-game-btn");
    const homepageIcon = document.createElement("i");
    homepageIcon.classList.add("fa-regular", "fa-house");
    endGameBtn.textContent = "End Game";
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
    const timeLeft = document.createElement("p");
    timer = document.createElement("span");
    timer.classList.add("timer");
    timeLeft.textContent = "Time left: "
    timeLeft.appendChild(timer)
    lives = document.createElement("p");
    lives.classList.add("lives");
    timerAndLivesDiv.append(timeLeft, lives);
    return timerAndLivesDiv;
}

export function startCountdown() {
    const countdown = document.createElement("p");
    countdown.classList.add("pulse");
    countdown.classList.add("countdown");
    gameboard.innerHTML = "";
    gameboard.appendChild(countdown);

    let counter = 5;

    const countdownIntervalId = setInterval(() => {
        countdown.textContent = counter.toString();
        counter--;

        if (counter === 0){
            clearInterval(countdownIntervalId);
            setTimeout(() => {
                changeGameboard();
                startNewRound()}
                , 1000);
        }
    }, 1000)
}

function resetGame() {
    state.level = 1;
    state.score = 0;
    state.timeLeft = 30;
    state.lives = 3;
    state.difficultyLevel = 1;
}

export function updateUI () {
    // activePlayerInfo.textContent = state.activePlayer;
    levelCounter.textContent = state.level.toString();
    scoreCounter.textContent = state.score.toString();
    timer.textContent = state.timeLeft.toString();
    lives.textContent = "❤️".repeat(state.lives);
}

function startNewRound() {
    resetAnimationClasses();
    //Funktioner för att hämta instruktioner och shapes
    gameboard.classList.add("fade-in");
    renderInstruction();
    renderShapes();
    //Kolla var och när man ska ta bort fade-in klassen?
}

function changeGameboard () {
    gameboard.innerHTML ="";
    const shapeAndInstructionDiv = document.createElement("div");
    shapeAndInstructionDiv.classList.add("shape-and-instruction-div");
    shapesDiv = document.createElement("div");
    shapesDiv.classList.add("shapes-div");
    gameboard.append(shapeAndInstructionDiv, shapesDiv);
    
}
async function renderShapes () {
    const shapes = await getShapes();

shapes.forEach(shape => {
    const shapeItem = document.createElement("div");
    shapeItem.classList.add(`${shape.type}`, "shape-item")
    shapesDiv.appendChild(shapeItem);

    shapeItem.addEventListener("click", () => {
        shapeItem.classList.add("incorrect");
        state.level++;
        
        updateLevelUI();
    })
});
}

function renderInstruction () {
const shapeAndInstructionDiv = document.querySelector(".shape-and-instruction-div") as HTMLDivElement;

const instruction = document.createElement("p");
instruction.classList.add("instruction");
instruction.textContent = "Blå";
const shape = document.createElement("div");
shape.classList.add("triangle");
shapeAndInstructionDiv.append(shape, instruction);
};

function updateLevelUI () {
    levelCounter.textContent = state.level.toString();
    levelCounter.classList.add("jump");
}

function resetAnimationClasses() {
    levelCounter.classList.remove("jump");
    scoreCounter.classList.remove("jump");
}
