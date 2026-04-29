const API_URL = "http://localhost:3000";

export type Player = {
  id: string;
  playerName: string;
  bestScore: number;
};

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
      gameDate: new Date().toISOString().substring(0, 19), // ändra formatet? blir UTC tid i spelhistoriken i gameover
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
