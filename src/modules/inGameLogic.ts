import {
  getShuffledShapes,
  getInstructionShape,
  type Shape,
} from "./API/shapes";
import { saveGameResult } from "./API/games";
import { getRandomInstruction, type Instruction } from "./API/instructions";
import { startRoundTimer, stopRoundTimer } from "./inGameTimer";
import {
  renderInGame,
  startCountdown,
  renderShapes,
  renderInstruction,
  updateUI,
  updateScoreUI,
  updateLevelUI,
  resetForNextRound,
  updateTimerUI,
  renderGameOverMessage,
  updateLivesUI,
  renderErrorLoadingGame,
} from "./inGameUI";

import { renderGameOver } from "./gameOver";
import { getStoredActivePlayerName } from "./localStorage";

// Den här typen beskriver vad ett klick betyder i rundan.
type ClickOutcome =
  | "wrong-click"
  | "correct-click"
  | "round-complete"
  | "already-clicked";

//Denna kan köras från startsidorna och endgame
export function initGameFlow() {
  resetState();
  renderInGame();
  updateUI();
  startCountdown();
}

let currentInstruction: Instruction;
let currentInstructionShape: Shape;
let currentRoundShapes: Shape[];
let validAnswerIds: string[] = [];
let clickedCorrectIds = new Set<string>();
let roundResolved = false;

export const state = {
  level: 1,
  score: 0,
  timeLeft: 10,
  lives: 3,
  difficultyLevel: 1,
};

export function resetState() {
  state.level = 1;
  state.score = 0;
  state.timeLeft = 10;
  state.lives = 3;
  state.difficultyLevel = 1;
  validAnswerIds = [];
  clickedCorrectIds.clear();
  roundResolved = false;
}

export async function startNewRound() {
  resetForNextRound();
  state.timeLeft = 10;
  updateTimerUI();

  roundResolved = false;
  clickedCorrectIds.clear();
  try {
    currentRoundShapes = await getShuffledShapes(state.difficultyLevel);
    currentInstruction = await getRandomInstruction(state.difficultyLevel);
    currentInstructionShape = await getInstructionShape(
      currentInstruction,
      state.difficultyLevel,
    );
  } catch (error) {
    renderErrorLoadingGame();
    return;
  }

  validAnswerIds = getValidAnswerIds(
    currentInstruction,
    currentInstructionShape,
    currentRoundShapes,
  );

  renderInstruction(currentInstruction, currentInstructionShape);
  renderShapes(currentRoundShapes);

  setTimeout(updateLevelUI, 400);
  startRoundTimer();
}
//Rätt svar utifrån ruletype
function isCorrectAnswer(
  instruction: Instruction,
  instructionShape: Shape,
  shape: Shape,
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

// Den här funktionen samlar alla korrekta svar för rundan.
// Resultatet blir en lista med id för de shapes som ska räknas som rätt.
function getValidAnswerIds(
  instruction: Instruction,
  instructionShape: Shape,
  shapes: Shape[],
): string[] {
  return shapes
    .filter((shape) => isCorrectAnswer(instruction, instructionShape, shape))
    .map((shape) => String(shape.id));
}

// Den här funktionen kollar om spelaren nu har klickat alla korrekta svar i rundan.
function isRoundComplete(
  validAnswerIds: string[],
  clickedCorrectIds: Set<string>,
): boolean {
  if (validAnswerIds.length === 0) {
    return false;
  }
  return validAnswerIds.every((id) => clickedCorrectIds.has(id));
}

// Den här funktionen tolkar ett klick utifrån rundans korrekta svar.
// Den returnerar både vad som hände och en uppdaterad lista över rätt klickade shapes.
function evaluateTileClick(
  shapeId: string,
  validAnswerIds: string[],
  clickedCorrectIds: Set<string>,
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

// Den här funktionen kopplar ihop ett klick i UI med regel-logiken här i filen
// och avgör om klicket var fel, rätt eller om hela rundan nu är klar.
export function handleTileClick(shape: Shape, shapeItem: HTMLDivElement): void {
  if (roundResolved) {
    return;
  }
  const result = evaluateTileClick(
    String(shape.id),
    validAnswerIds,
    clickedCorrectIds,
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
// Det här händer när spelaren klickar rätt på en shape:
function handleCorrectClick(shapeItem: HTMLDivElement): void {
  shapeItem.classList.add("correct");
  shapeItem.style.pointerEvents = "none";
  state.score += 100;
  updateScoreUI();
}

// Det här händer när alla korrekta svar i rundan är hittade:
function handleRoundComplete(): void {
  stopRoundTimer();
  state.level++;
  state.difficultyLevel = Math.min(5, Math.ceil(state.level / 2));

  setTimeout(startNewRound, 800);
}

// Det här händer när spelaren klickar fel:
function handleWrongClick(shapeItem: HTMLDivElement): void {
  shapeItem.classList.add("incorrect");
  state.lives--;
  state.score = Math.max(0, state.score - 50);
  updateLivesUI();

  setTimeout(() => {
    shapeItem.classList.remove("incorrect");
  }, 300);

  if (state.lives <= 0) {
    stopRoundTimer();
    setTimeout(renderGameOverMessage, 1000);

    const activePlayerName = getStoredActivePlayerName();
    if (activePlayerName) {
      void saveGameResult(activePlayerName, state.score, state.level);
    }

    setTimeout(renderGameOver, 2500);
  }
}
