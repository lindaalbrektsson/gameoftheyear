import {
  findPlayerByName,
  getPlayers,
  updatePlayer,
  type Player,
} from "./players";

const API_URL = "http://localhost:3000";

export type Game = {
  id: string;
  gameDate: string;
  score: number;
  level: number;
  playerId: string;
};

export type NewGame = Omit<Game, "id">;

function formatLocalGameDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function createGameId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `g${Date.now()}`;
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path} with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();

  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}

export async function getGames(): Promise<Game[]> {
  return requestJson<Game[]>("/games");
}

export async function createGameRecord(game: NewGame): Promise<Game> {
  return requestJson<Game>("/games", {
    method: "POST",
    body: JSON.stringify({
      ...game,
      id: createGameId(),
    }),
  });
}

export async function deleteGameRecord(gameId: string): Promise<void> {
  await requestJson<void>(`/games/${gameId}`, {
    method: "DELETE",
  });
}

async function updatePlayerBestScoreIfNeeded(
  player: Player,
  score: number,
): Promise<boolean> {
  const currentBestScore = player.bestScore || 0;

  if (score <= currentBestScore) {
    return false;
  }

  await updatePlayer({
    ...player,
    bestScore: score,
  });

  return true;
}

export async function saveGameResult(
  playerName: string,
  score: number,
  level: number,
): Promise<boolean> {
  try {
    const players = await getPlayers();
    const activePlayer = findPlayerByName(players, playerName);

    if (!activePlayer) {
      console.error("Could not save game: Player not found.");
      return false;
    }

    await createGameRecord({
      gameDate: formatLocalGameDate(new Date()),
      score,
      level,
      playerId: activePlayer.id,
    });

    return await updatePlayerBestScoreIfNeeded(activePlayer, score);
  } catch (error) {
    console.error("Failed to save game result:", error);
    return false;
  }
}
