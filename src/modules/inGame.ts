


export function renderInGame (): void {
    renderHeaderMenu();
    const main = document.querySelector("main");
    if (!main) {
        throw new Error("Can't find main element")
    }
    main.innerHTML = "";
    const gameboard = document.createElement("div");
    gameboard.classList.add("gameboard");

    const restartLevelScoreDiv = renderRestartLevelScore();
    const timerAndLivesDiv = renderTimerAndLives();

    //Skapar bara tomma behållare för shape och instruction. I renderfunktion för shape och instruction skapar vi div för shape och typ p för instruction och lägger till i denna behållare
    const shapeAndInstructionDiv = document.createElement("div");
    shapeAndInstructionDiv.classList.add("shape-and-instruction-div");
    
    //Shapes-diven är också bara tom, men vid rendering av shapes läggs de i denna
    const shapesDiv = document.createElement("div");
    shapesDiv.classList.add("shapes-div");
    
    gameboard.append(restartLevelScoreDiv, timerAndLivesDiv, shapeAndInstructionDiv, shapesDiv);
    main.appendChild(gameboard);

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
    restartBtn.classList.add("restartBtn");
    const restartIcon = document.createElement("i");
    restartIcon.classList.add("fa-solid", "fa-arrow-rotate-left");
    restartBtn.textContent = "Restart ";
    restartBtn.appendChild(restartIcon);

    const levelAndScoreDiv = document.createElement("div");
    levelAndScoreDiv.classList.add("level-and-score-div")
    const level = document.createElement("p");
    level.textContent = "Level: "
    const levelCounter = document.createElement("span");
    levelCounter.classList.add("level-counter");
    levelCounter.textContent = "1";
    level.appendChild(levelCounter);

    const score = document.createElement("p");
    score.textContent = "Score: ";
    const scoreCounter = document.createElement("span");
    scoreCounter.textContent = "0";
    score.appendChild(scoreCounter);

    levelAndScoreDiv.append(level, score);
    restartLevelScoreDiv.append(restartBtn, levelAndScoreDiv);
    return restartLevelScoreDiv;
}

function renderTimerAndLives (): HTMLDivElement {
    const timerAndLivesDiv = document.createElement("div");
    timerAndLivesDiv.classList.add("timer-and-lives-div")
    const timer = document.createElement("p");
    timer.classList.add("timer");
    timer.textContent = "00:00"; // Vi kommer behöva lägga in någon funktion här för nedräkningen som uppdaterar denna text
    const lives = document.createElement("p");
    lives.classList.add("lives");
    lives.textContent = "❤️❤️❤️";
    timerAndLivesDiv.append(timer, lives);
    return timerAndLivesDiv;
}


