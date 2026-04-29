const API_URL = "http://localhost:3000";

export type Player = {
  id: string;
  playerName: string;
  bestScore: number;
};

function formatLocalGameDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Spara spelet, bestScore uppdaterar vi sen och bara om score > bestscore
export async function saveGameResult(
  playerName: string,
  score: number,
  level: number,
): Promise<void> {
  try {
    // Hämta activeplayer och dess ID
    const playersRes = await fetch(`${API_URL}/players`);
    const players: Player[] = await playersRes.json();
    const activePlayer = players.find((p) => p.playerName === playerName);

    if (!activePlayer) {
      console.error("Could not save game: Player not found.");
      return;
    }

    // skapa spelet för historik
    const newGame = {
      id: `g${Date.now()}`,
      gameDate: formatLocalGameDate(new Date()),
      score: score,
      level: level,
      playerId: activePlayer.id,
    };

    // POSTA spelet till databasen
    await fetch(`${API_URL}/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGame),
    });

    // if activeplayer sore = higher than currentBest, data PUT bestScore
    const currentBest = activePlayer.bestScore || 0;
    if (score > currentBest) {
      // vi vill inte ersätta allt bara uppdatera bestScore
      const updatedPlayer: Player = {
        ...activePlayer,
        bestScore: score,
      };

      await fetch(`${API_URL}/players/${activePlayer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlayer),
      });
      console.log(`New best score saved for ${playerName}: ${score} via PUT!`);
    }
  } catch (error) {
    console.error("Failed to save game result:", error);
  }
}

// ta bort ett spel( gameId) från historiken
export async function deleteGameRecord(gameId: string): Promise<void> {
  const response = await fetch(`${API_URL}/games/${gameId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete the game");
  }
}
