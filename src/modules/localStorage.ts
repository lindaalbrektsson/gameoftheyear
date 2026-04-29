const ACTIVE_PLAYER_KEY = "activePlayer";

function trimPlayerName(playerName: string): string {
  return playerName.trim();
}

export function getStoredActivePlayerName(): string | null {
  const storedPlayerName = localStorage.getItem(ACTIVE_PLAYER_KEY);

  if (!storedPlayerName) {
    return null;
  }

  const trimmedPlayerName = trimPlayerName(storedPlayerName);

  return trimmedPlayerName === "" ? null : trimmedPlayerName;
}

export function setStoredActivePlayerName(playerName: string): void {
  const trimmedPlayerName = trimPlayerName(playerName);

  if (trimmedPlayerName === "") {
    clearStoredActivePlayerName();
    return;
  }

  localStorage.setItem(ACTIVE_PLAYER_KEY, trimmedPlayerName);
}

export function clearStoredActivePlayerName(): void {
  localStorage.removeItem(ACTIVE_PLAYER_KEY);
}
