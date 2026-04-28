import type { ColorType, Instruction } from "./instructions";

export interface Shape {
    id: "string",
    type: ShapeType,
    color: ColorType,
    difficultyLevel: number
}

type ShapeType =
| "triangle"
| "square"
| "circle"
| "star";

async function getAllShapes(): Promise<Shape[]> {
    const response = await fetch("http://localhost:3000/shapes");

    if (!response.ok) {
        throw new Error("Couldn't get shapes");
    }

    const data = await response.json();
    return data;
};

//Returnerar endast en random färglös shape utifrån svårighetsgrad
export async function getBlankShape(difficultyLevel: number): Promise<Shape> {
    const allShapes = await getAllShapes();
    const currentBlankShapes = allShapes.filter(
        (shape) => shape.color === "blank" && shape.difficultyLevel <= difficultyLevel
    );
    const randomIndex = Math.floor(Math.random() * currentBlankShapes.length);
    return currentBlankShapes[randomIndex];
}

//Alla färgade shapes utifrån svårighetsgrad
export async function getCurrentShapes(difficultyLevel: number): Promise<Shape[]> {
    const allShapes = await getAllShapes();
    const currentShapes = allShapes.filter(
        (shape) => shape.color != "blank" && shape.difficultyLevel <= difficultyLevel
    );
    return currentShapes;
}

//Shapes som användaren kan trycka på - i mixad ordning och utifrån svårighetsgrad
export async function getShuffledShapes(difficultyLevel: number): Promise<Shape[]> {
    const shapes = await getCurrentShapes(difficultyLevel);
    shapes.sort(() => Math.random() - 0.5);
    console.log(shapes);
    return shapes;
}

export async function getInstructionShape(instruction: Instruction, difficultyLevel: number): Promise<Shape> {

    if (instruction.ruleType === "colorFillBlankShape") {
        const instructionShape = await getBlankShape(difficultyLevel);
        return instructionShape;
    }
    const currentShapes = await getCurrentShapes(difficultyLevel);
    const randomIndex = Math.floor(Math.random() * currentShapes.length);

    return currentShapes[randomIndex];
};
