/*
/*
LINDA:
Här är mina ändringar aktiva i koden så att den går att testa visuellt: http://localhost:5173/#in-game-linda-test
Den vanliga inGame.ts är oförändrad så att det går att jämföra och så att mina ändringar inte påverkar något.
*/

import { getShuffledShapes, getInstructionShape, type Shape } from "./API/shapes";
import { getRandomInstruction, type Instruction } from "./API/instructions";
import { startRoundTimer, stopRoundTimer } from "./inGameTimer";
import {
    renderInGame, startCountdown,
    renderShapes, renderInstruction,
    updateUI,
    updateScoreUI, updateLevelUI,
    resetForNextRound } from "./inGameUI";
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


// LINDA:
// Jag har lagt till round-state här för att samma runda ska kunna dela:
// - en vald instruktion
// - samma preview-shape bredvid instruktionen
// - samma shapes på spelplanen
// - samma lista med rätta svar
// - information om rundan redan är avgjord eller inte
let currentInstruction: Instruction | null = null;
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

export function resetState() {
    state.level = 1;
    state.score = 0;
    state.timeLeft = 10;
    state.lives = 3;
    state.difficultyLevel = 1;
    currentInstruction = null;
    currentInstructionShape = null;
    currentRoundShapes = [];
    validAnswerIds = [];
    clickedCorrectIds.clear();
    roundResolved = false;
}

export async function startNewRound() {
    resetForNextRound();

    // LINDA:
    // Jag har byggt om startNewRound så att hela rundan förbereds först.
    // Här väljs:
    // - Instruktionen som ska gälla för rundan
    // - Instruktions-shapen som ska visas bredvid texten i instruktionen
    // - vilka shapes på spelplanen som då ska räknas som rätta svar
    roundResolved = false;
    clickedCorrectIds.clear();

   currentRoundShapes = await getShuffledShapes(state.difficultyLevel);

    currentInstruction = await getRandomInstruction(state.difficultyLevel);
    currentInstructionShape = await getInstructionShape(currentInstruction, state.difficultyLevel);

    if (!currentInstructionShape) {
        return;
    }

    validAnswerIds = getValidAnswerIds(
        currentInstruction,
        currentInstructionShape,
        currentRoundShapes
    );

    renderInstruction(currentInstruction, currentInstructionShape);
    renderShapes(currentRoundShapes);

    setTimeout(()=> updateLevelUI(), 400);
    startRoundTimer();
}



// function renderShapes() {
//     // LINDA:
//     // Jag renderar de shapes som redan valts för rundan,
//     // så att spelplanen matchar den instruktion som också valts för samma runda.
//     currentRoundShapes.forEach(shape => {
//         const shapeItem = document.createElement("div");
//         shapeItem.classList.add(`${shape.type}`, "shape-item")
//         applyShapeColor(shapeItem, shape);
//         shapesDiv.appendChild(shapeItem);

//         shapeItem.addEventListener("click", () => {
//             handleTileClick(shape, shapeItem);
//         });
//     });
// };

// function renderInstruction() {
//     if (!currentInstruction || !currentInstructionShape) {
//         return;
//     }

//     const instruction = document.createElement("p");
//     instruction.classList.add("instruction");
//     instruction.textContent = currentInstruction.info;
//     const shape = document.createElement("div");

// // LINDA:
// // Här byggde jag vidare på Hannas påbörjade idé i renderInstruction:
// // - ruleType berättar HUR rundan ska rättas
// // - shape bredvid instruktionen hjälper till att visa VAD rundan ska rättas mot
// // För colorFillBlankShape visar shape formen,
// // medan texten / targetColor visar vilken färg som är rätt.
//     shape.classList.add(currentInstructionShape.type, "shape-item");
//     applyShapeColor(shape, currentInstructionShape);

//     shapeAndInstructionDiv.append(shape, instruction);
// };
// LINDA:
// Här utgår rättningen från:
// instruction.ruleType = hur vi ska jämföra
// instructionShape = vad spelaren ska jämföra mot
function isCorrectAnswer(
    instruction: Instruction,
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
    instruction: Instruction,
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
// Den här funktionen kopplar ihop ett klick i UI med regel-logiken här i filen
// och avgör om klicket var fel, rätt eller om hela rundan nu är klar.
export function handleTileClick(shape: Shape, shapeItem: HTMLDivElement): void {
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


