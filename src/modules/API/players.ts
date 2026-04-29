const API_URL = "http://localhost:3000";

export type Player = {
  id: string;
  playerName: string;
  bestScore: number;
};

export type NewPlayer = Omit<Player, "id">;

function normalizePlayerName(playerName: string): string {
  return playerName.trim().toLowerCase();
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

export function findPlayerByName(
  players: Player[],
  playerName: string,
): Player | undefined {
  const normalizedPlayerName = normalizePlayerName(playerName);

  return players.find(
    (player) => normalizePlayerName(player.playerName) === normalizedPlayerName,
  );
}

export async function getPlayers(): Promise<Player[]> {
  return requestJson<Player[]>("/players");
}

export async function createPlayer(player: NewPlayer): Promise<Player> {
  return requestJson<Player>("/players", {
    method: "POST",
    body: JSON.stringify(player),
  });
}

export async function updatePlayer(player: Player): Promise<Player> {
  return requestJson<Player>(`/players/${player.id}`, {
    method: "PUT",
    body: JSON.stringify(player),
  });
}
