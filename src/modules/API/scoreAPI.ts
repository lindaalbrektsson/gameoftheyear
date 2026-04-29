const API_URL = "http://localhost:3000";

// ta bort ett spel (gameId) från historiken
export async function deleteGameRecord(gameId: string): Promise<void> {
  const response = await fetch(`${API_URL}/games/${gameId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete the game");
  }
}
