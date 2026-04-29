export type EntityId = string | number;

export type PlayerRecord = {
  id: EntityId;
  playerName: string;
};

export type GameRecord = {
  id: EntityId;
  gameDate: string;
  score: number;
  level: number;
  playerId: EntityId;
};

export type GlobalHighscoreEntry = {
  playerName: string;
  level: number;
  score: number;
};

export function formatGameDate(gameDate: string): string {
  const parsedDate = new Date(gameDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return gameDate;
  }

  return parsedDate.toLocaleString("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sortGamesByNewest<T extends GameRecord>(games: T[]): T[] {
  return [...games].sort((left, right) => {
    const dateDifference =
      new Date(right.gameDate).getTime() - new Date(left.gameDate).getTime();

    if (dateDifference !== 0) {
      return dateDifference;
    }

    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return right.level - left.level;
  });
}

export function getLatestGame<T extends GameRecord>(games: T[]): T | null {
  const [latestGame] = sortGamesByNewest(games);
  return latestGame ?? null;
}

export function getBestGame<T extends GameRecord>(games: T[]): T | null {
  const [bestGame] = [...games].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (right.level !== left.level) {
      return right.level - left.level;
    }

    return new Date(right.gameDate).getTime() - new Date(left.gameDate).getTime();
  });

  return bestGame ?? null;
}

export function buildGlobalHighscoreEntries(
  players: PlayerRecord[],
  games: GameRecord[]
): GlobalHighscoreEntry[] {
  const playerNamesById = new Map(
    players.map((player) => [String(player.id), player.playerName])
  );
  const bestGameByPlayerId = new Map<string, GlobalHighscoreEntry>();

  games.forEach((game) => {
    const playerId = String(game.playerId);
    const playerName = playerNamesById.get(playerId);

    if (!playerName) {
      return;
    }

    const existingBest = bestGameByPlayerId.get(playerId);
    const isBetterScore =
      !existingBest ||
      game.score > existingBest.score ||
      (game.score === existingBest.score && game.level > existingBest.level);

    if (isBetterScore) {
      bestGameByPlayerId.set(playerId, {
        playerName,
        level: game.level,
        score: game.score,
      });
    }
  });

  return [...bestGameByPlayerId.values()].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (right.level !== left.level) {
      return right.level - left.level;
    }

    return left.playerName.localeCompare(right.playerName);
  });
}
