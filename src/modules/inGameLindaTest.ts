/*
LINDA:
Det här är Lindas körbara testkopia av inGame.ts.
Här är regel-logiken aktiv i koden så att den går att testa visuellt,
medan vanliga inGame.ts får vara kvar som den vanliga versionen.
*/

import { getShapes, type Shape } from "./API/shapes";
import { renderActivePlayerStartPage } from "./activePlayerStartPage";
import { getRandomInstruction } from "./API/instructions";

/*
LINDA:
Jag har valt att lägga hela testlogiken i den här filen,
så att Hanna och de andra kan läsa allt på ett ställe.
Shape-typen återanvänder jag nu direkt från shapes.ts,
så att testfilen bygger vidare på samma shape-struktur som API-filen.
*/

type BaseInstruction = Awaited<ReturnType<typeof getRandomInstruction>>;
type RoundInstruction = BaseInstruction;

// LINDA:
// Den här typen beskriver vad ett klick betyder i rundan.
// Jag använder den för att skilja på:
// - fel klick
// - rätt klick
// - sista rätta klicket som avslutar rundan
// - klick på en shape som redan klickats rätt
type ClickOutcome =
    | "wrong-click"
    | "correct-click"
    | "round-complete"
    | "already-clicked";

//Denna kan köras från startsidorna och endgame
export function initGameFlow () {
    resetState();
    renderInGame();
    updateUI();
    startCountdown();
}

//Deklarerar dessa variabler för att kunna använda dem i funktioner
let gameboard: HTMLDivElement;
let shapeAndInstructionDiv: HTMLDivElement;
let shapesDiv: HTMLDivElement;
let levelCounter: HTMLSpanElement;
let scoreCounter: HTMLSpanElement;
let timer: HTMLSpanElement;
let lives: HTMLParagraphElement;

// LINDA:
// Jag har lagt till round-state här för att samma runda ska kunna dela:
// - en vald instruktion
// - samma preview-shape bredvid instruktionen
// - samma shapes på spelplanen
// - samma lista med rätta svar
// - information om rundan redan är avgjord eller inte
let currentInstruction: RoundInstruction | null = null;
let currentInstructionShape: Shape | null = null;
let currentRoundShapes: Shape[] = [];
let validAnswerIds: string[] = [];
let clickedCorrectIds = new Set<string>();
let roundResolved = false;

//Denna bör ligga i en egen modul (som hanterar data) och importeras dit man behöver dem.
// Vi kan fylla på med fler variabler om vi behöver. detta hänger med och uppdateras under spelet.
export const state = {
    //Vi får fundera på om activeplayer ska ligga här eller om vi sätter en global funktion för hämtning av spelare+id
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
    headerMenu.innerHTML ="";
    const activePlayerInfo = document.createElement("li");
    activePlayerInfo.classList.add("active-player-info");
    activePlayerInfo.textContent = `Playing as: ` //Lägg till spelarens namn, hämta från local storage? db?

    const endGameLi = document.createElement("li");
    const endGameBtn = document.createElement("button");
    endGameBtn.classList.add("game-btn", "end-game-btn");
    const homepageIcon = document.createElement("i");
    homepageIcon.classList.add("fa-regular", "fa-house");
    endGameBtn.textContent = "End Game";
    endGameBtn.appendChild(homepageIcon);
    endGameBtn.addEventListener("click", () => {
        //Stoppa spel-timer?
        resetState();
        renderActivePlayerStartPage();
    })
    endGameLi.appendChild(endGameBtn);
    headerMenu.append(activePlayerInfo, endGameLi);
}

function renderRestartLevelScore (): HTMLDivElement {
    const restartLevelScoreDiv = document.createElement("div");
    restartLevelScoreDiv.classList.add("restart-level-score-div");
    const restartBtn = document.createElement("button");
    restartBtn.classList.add("game-btn", "restart-btn");
    const restartIcon = document.createElement("i");
    restartIcon.classList.add("fa-solid", "fa-arrow-rotate-left");
    restartBtn.textContent = "Restart";
    restartBtn.appendChild(restartIcon);
    restartBtn.addEventListener("click", () => {
        resetState();
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
                void startNewRound();
            }, 1000);
        }
    }, 1000)
}

function resetState() {
    state.level = 1;
    state.score = 0;
    state.timeLeft = 30;
    state.lives = 3;
    state.difficultyLevel = 1;
    currentInstruction = null;
    currentInstructionShape = null;
    currentRoundShapes = [];
    validAnswerIds = [];
    clickedCorrectIds.clear();
    roundResolved = false;
}

async function startNewRound() {
    resetForNextRound();

    // LINDA:
    // Jag har byggt om startNewRound så att hela rundan förbereds först.
    // Här väljs:
    // - instruktionen från API:t
    // - preview-shapen bredvid instruktionen
    // - vilka shapes på spelplanen som då ska räknas som rätta svar
    roundResolved = false;
    clickedCorrectIds.clear();

    const shapes = await getShapes();
    currentRoundShapes = shuffleShapes(
        shapes.filter(
            (shape) => shape.difficultyLevel <= state.difficultyLevel && shape.color !== "blank"
        )
    );

    if (currentRoundShapes.length === 0) {
        return;
    }

    currentInstruction = await getRandomInstruction(state.difficultyLevel);
    currentInstructionShape = getInstructionShape(
        currentInstruction,
        currentRoundShapes
    );

    if (!currentInstructionShape) {
        return;
    }

    validAnswerIds = getValidAnswerIds(
        currentInstruction,
        currentInstructionShape,
        currentRoundShapes
    );

    renderInstruction();
    renderShapes();
    requestAnimationFrame(() => {
        gameboard.classList.add("fade-in");
    });
    setTimeout(()=> updateLevelUI(), 400);
}

function changeGameboard() {
    gameboard.innerHTML ="";
    shapeAndInstructionDiv = document.createElement("div");
    shapeAndInstructionDiv.classList.add("shape-and-instruction-div");
    shapesDiv = document.createElement("div");
    shapesDiv.classList.add("shapes-div");
    gameboard.append(shapeAndInstructionDiv, shapesDiv);
}

function renderShapes() {
    // LINDA:
    // Jag renderar de shapes som redan valts för rundan,
    // så att spelplanen matchar den instruktion som också valts för samma runda.
    currentRoundShapes.forEach(shape => {
        const shapeItem = document.createElement("div");
        shapeItem.classList.add(`${shape.type}`, "shape-item")
        applyShapeColor(shapeItem, shape);
        shapesDiv.appendChild(shapeItem);

        shapeItem.addEventListener("click", () => {
            handleTileClick(shape, shapeItem);
        });
    });
};

function renderInstruction() {
    if (!currentInstruction || !currentInstructionShape) {
        return;
    }

    const instruction = document.createElement("p");
    instruction.classList.add("instruction");
    instruction.textContent = currentInstruction.info;
    const shape = document.createElement("div");

// LINDA:
// Här byggde jag vidare på Hannas påbörjade idé i renderInstruction:
// - ruleType berättar HUR rundan ska rättas
// - shape bredvid instruktionen hjälper till att visa VAD rundan ska rättas mot
// För colorFillBlankShape visar shape:n formen,
// medan texten / targetColor visar vilken färg som gäller.
    shape.classList.add(currentInstructionShape.type, "shape-item");
    applyShapeColor(shape, currentInstructionShape);

    shapeAndInstructionDiv.append(shape, instruction);
};

// LINDA:
// Följande hjälpfunktioner har jag lagt till för att rule flow ska kunna testas
// direkt i UI:t i den här testversionen.
function getInstructionShape(
    instruction: RoundInstruction,
    shapes: Shape[]
): Shape | null {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

    if (!randomShape) {
        return null;
    }

    // LINDA:
    // Här byggde jag vidare på Hannas skiss:
    // om instruktionen är colorFillBlankShape gör jag shape:n bredvid texten blank.
    // Då kommer shape-typen från shape:n, medan färgen i stället kommer från texten / targetColor.
    if (instruction.ruleType === "colorFillBlankShape") {
        return {
            ...randomShape,
            color: "blank" as const,
        };
    }

    return randomShape;
}

function shuffleShapes(shapes: Shape[]): Shape[] {
    const shuffledShapes = [...shapes];

    for (let currentIndex = shuffledShapes.length - 1; currentIndex > 0; currentIndex--) {
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        const temporaryShape = shuffledShapes[currentIndex];
        shuffledShapes[currentIndex] = shuffledShapes[randomIndex];
        shuffledShapes[randomIndex] = temporaryShape;
    }

    return shuffledShapes;
}

// LINDA:
// Den här funktionen avgör om en enskild shape är ett korrekt svar.
// Här utgår rättningen från:
// - instruction.ruleType = hur vi ska jämföra
// - instructionShape = vad spelaren ska jämföra mot
function isCorrectAnswer(
    instruction: RoundInstruction,
    instructionShape: Shape,
    shape: Shape
): boolean {
    switch (instruction.ruleType) {
        case "matchColor":
            return shape.color === instructionShape.color;

        case "matchShape":
            return shape.type === instructionShape.type;

        case "matchShapeAndColor":
            return (
                shape.type === instructionShape.type &&
                shape.color === instructionShape.color
            );

        case "colorFillBlankShape":
            return (
                shape.type === instructionShape.type &&
                shape.color === instruction.targetColor
            );

        default:
            return false;
    }
}

// LINDA:
// Den här funktionen samlar alla korrekta svar för rundan.
// Resultatet blir en lista med id för de shapes som ska räknas som rätt.
function getValidAnswerIds(
    instruction: RoundInstruction,
    instructionShape: Shape,
    shapes: Shape[]
): string[] {
    return shapes
        .filter((shape) => isCorrectAnswer(instruction, instructionShape, shape))
        .map((shape) => String(shape.id));
}

// LINDA:
// Den här funktionen kollar om spelaren nu har klickat alla korrekta svar i rundan.
function isRoundComplete(
    validAnswerIds: string[],
    clickedCorrectIds: Set<string>
): boolean {
    if (validAnswerIds.length === 0) {
        return false;
    }

    return validAnswerIds.every((id) => clickedCorrectIds.has(id));
}

// LINDA:
// Den här funktionen tolkar ett klick utifrån rundans korrekta svar.
// Den returnerar både vad som hände och en uppdaterad lista över rätt klickade shapes.
function evaluateTileClick(
    shapeId: string,
    validAnswerIds: string[],
    clickedCorrectIds: Set<string>
): {
    outcome: ClickOutcome;
    nextClickedCorrectIds: Set<string>;
} {
    const nextClickedCorrectIds = new Set(clickedCorrectIds);

    if (!validAnswerIds.includes(shapeId)) {
        return {
            outcome: "wrong-click",
            nextClickedCorrectIds,
        };
    }

    if (nextClickedCorrectIds.has(shapeId)) {
        return {
            outcome: "already-clicked",
            nextClickedCorrectIds,
        };
    }

    nextClickedCorrectIds.add(shapeId);

    if (isRoundComplete(validAnswerIds, nextClickedCorrectIds)) {
        return {
            outcome: "round-complete",
            nextClickedCorrectIds,
        };
    }

    return {
        outcome: "correct-click",
        nextClickedCorrectIds,
    };
}

// LINDA:
// Den här funktionen kopplar ihop ett klick i UI:t med regel-logiken här i filen
// och avgör om klicket var fel, rätt eller om hela rundan nu är klar.
function handleTileClick(shape: Shape, shapeItem: HTMLDivElement): void {
    if (roundResolved) {
        return;
    }

    const result = evaluateTileClick(
        String(shape.id),
        validAnswerIds,
        clickedCorrectIds
    );

    clickedCorrectIds = result.nextClickedCorrectIds;

    if (result.outcome === "already-clicked") {
        return;
    }

    if (result.outcome === "wrong-click") {
        handleWrongClick(shapeItem);
        return;
    }

    handleCorrectClick(shapeItem);

    if (result.outcome === "round-complete") {
        roundResolved = true;
        handleRoundComplete();
    }
}

// LINDA:
// Det här händer när spelaren klickar rätt på en shape:
// rätt klass läggs på, samma shape går inte att klicka igen, och poängen ökar.
function handleCorrectClick(shapeItem: HTMLDivElement): void {
    shapeItem.classList.add("correct");
    shapeItem.style.pointerEvents = "none";
    state.score += 100;
    updateScoreUI();
}

// LINDA:
// Det här händer när alla korrekta svar i rundan är hittade:
// level höjs, difficulty uppdateras och en ny runda startar.
function handleRoundComplete(): void {
    state.level++;
    state.difficultyLevel = Math.min(5, Math.ceil(state.level / 2));
    updateUI();
    updateLevelUI();

    setTimeout(() => {
        void startNewRound();
    }, 600);
}

// LINDA:
// Det här händer när spelaren klickar fel:
// poäng dras av, ett liv försvinner, men samma runda fortsätter om liv finns kvar.
function handleWrongClick(shapeItem: HTMLDivElement): void {
    shapeItem.classList.add("incorrect");
    state.lives--;
    state.score = Math.max(0, state.score - 50);
    updateUI();
    updateScoreUI();

    setTimeout(() => {
        shapeItem.classList.remove("incorrect");
    }, 300);

    if (state.lives <= 0) {
        return;
    }
}

// LINDA:
// Jag använder den här funktionen för att visa shapes visuellt i testversionen.
// Själva border/outline-lösningen för blank shapes la jag till tillfälligt här,
// eftersom Hannas version ännu inte hade den delen färdig.
// Tanken var bara att göra blank-shapen synlig nog för att kunna testa logiken.
function applyShapeColor(shapeItem: HTMLDivElement, shape: Shape): void {
    if (shape.color === "blank") {
        if (shape.type === "triangle") {
            shapeItem.style.borderBottomColor = "rgba(255, 255, 255, 0.2)";
        } else {
            shapeItem.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
            shapeItem.style.outline = "2px dashed rgba(255, 255, 255, 0.8)";
            shapeItem.style.outlineOffset = "2px";
        }

        return;
    }

    if (shape.type === "triangle") {
        shapeItem.style.borderBottomColor = shape.color;
        return;
    }

    shapeItem.style.backgroundColor = shape.color;
}

//Funktioner som uppdaterar UI utifrån state
export function updateUI() {
    // activePlayerInfo.textContent = state.activePlayer;
    levelCounter.textContent = state.level.toString();
    scoreCounter.textContent = state.score.toString();
    timer.textContent = state.timeLeft.toString();
    lives.textContent = "❤️".repeat(state.lives);
}
function updateLevelUI() {
    levelCounter.textContent = state.level.toString();
    levelCounter.classList.add("jump-level");
}

function updateScoreUI() {
    scoreCounter.textContent = state.score.toString();
    scoreCounter.classList.add("jump-score");
};

function resetForNextRound() {
    gameboard.classList.remove("fade-in");
    levelCounter.classList.remove("jump-level");
    shapeAndInstructionDiv.innerHTML= "";
    shapesDiv.innerHTML = "";
    setTimeout(() => {
        scoreCounter.classList.remove("jump-score");
    }, 1000);
}
