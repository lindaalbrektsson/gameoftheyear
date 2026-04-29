export interface Instruction {
  id: string;
  info: string;
  ruleType: RuleType;
  targetColor?: ColorType;
  difficultyLevel: number;
}

export type RuleType =
  | "colorFillBlankShape"
  | "matchColor"
  | "matchShapeAndColor"
  | "matchShape";

export type ColorType =
  | "blue"
  | "red"
  | "yellow"
  | "green"
  | "orange"
  | "purple"
  | "blank";

async function getInstructions(): Promise<Instruction[]> {
  const response = await fetch("http://localhost:3000/instructions");

  if (!response.ok) {
    throw new Error("Couldn't get instructions");
  }
  const data = await response.json();
  return data;
}

export async function getRandomInstruction(
  difficultyLevel: number,
): Promise<Instruction> {
  const instructions = await getInstructions();
  const currentInstructions = instructions.filter(
    (instruction) => instruction.difficultyLevel <= difficultyLevel,
  );

  const randomIndex = Math.floor(Math.random() * currentInstructions.length);
  return currentInstructions[randomIndex];
}
