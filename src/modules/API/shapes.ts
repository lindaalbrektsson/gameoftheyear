import type { ColorType } from "./instructions";

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
        throw new Error ("Couldn't get shapes");
    }
    const data = await response.json();
    return data;
};

export async function getBlankShape(difficultyLevel: number): Promise<Shape> {
    const allShapes = await getAllShapes();
    const currentBlankShapes = allShapes.filter(
        (shape) => shape.color === "blank" && shape.difficultyLevel <= difficultyLevel
    );
    const randomIndex = Math.floor(Math.random() * currentBlankShapes.length);
    return currentBlankShapes[randomIndex];
}

export async function getCurrentShapes(difficultyLevel: number): Promise<Shape[]> {
    const allShapes = await getAllShapes();
    const currentShapes = allShapes.filter(
        (shape) => shape.color != "blank" && shape.difficultyLevel <= difficultyLevel
    );
    return currentShapes;
}

//Måste skriva interface för shapes och typa upp funktionen