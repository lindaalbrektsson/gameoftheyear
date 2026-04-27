//Måste skriva interface för shapes och typa upp funktionen

//LINDA: Jag gjorde ett interface, kolla om du vill ändra något, jag behövde den för min testfil så att den inte skulle tycka att shapes är any[] hela tiden.
export interface Shape {
    id: string;
    type: "triangle" | "square" | "circle" | "star";
    color: "blue" | "red" | "yellow" | "green" | "orange" | "purple" | "blank";
    difficultyLevel: number;
}

export async function getShapes(): Promise<Shape[]> {
    const response = await fetch("http://localhost:3000/shapes");

    if (!response.ok) {
        throw new Error("Couldn't get shapes");
    }

    const data = await response.json();
    return data;
}
