export async function getShapes(): Promise<any[]> {
   
    const response = await fetch("http://localhost:3000/shapes");

    if (!response.ok) {
        throw new Error ("Couldn't get shapes");
    }
    const data = await response.json();
    return data;
};

//Måste skriva interface för shapes och typa upp funktionen