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

const GLOBAL_HIGHSCORE_LIMIT = 5;
const COLLAPSED_HISTORY_ROW_COUNT = GLOBAL_HIGHSCORE_LIMIT + 1;
const HISTORY_PANEL_SELECTOR = ".player-recent-games:not(.recent-games-scoreboard)";
const HISTORY_TABLE_SELECTOR = ".player-score-table";
const HISTORY_ROW_SELECTOR = ".player-score-row:not(.score-header)";
const HISTORY_TOGGLE_CLASS = "history-panel-toggle";
const HISTORY_EXPANDED_CLASS = "is-expanded";
const HISTORY_HAS_TOGGLE_CLASS = "has-history-toggle";
const ACTIVE_PLAYER_HISTORY_PANEL_SELECTOR =
  ".active-player-start-page .player-recent-games:not(.recent-games-scoreboard)";
const ACTIVE_PLAYER_GLOBAL_PANEL_SELECTOR =
  ".active-player-start-page .global-highscore:not(.global-high-score-list)";
const ACTIVE_PLAYER_GLOBAL_SCORE_ROW_SELECTOR =
  `${ACTIVE_PLAYER_GLOBAL_PANEL_SELECTOR} .score-row:not(.score-header)`;
const ACTIVE_PLAYER_HISTORY_BOTTOM_OFFSET = 20;

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
  return games
    .map((game) => {
      const playerName = playerNamesById.get(String(game.playerId));

      if (!playerName) {
        return null;
      }

      return {
        playerName,
        level: game.level,
        score: game.score,
        gameDate: game.gameDate,
      };
    })
    .filter((entry): entry is GlobalHighscoreEntry & { gameDate: string } => entry !== null)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.level !== left.level) {
        return right.level - left.level;
      }

      return new Date(right.gameDate).getTime() - new Date(left.gameDate).getTime();
    })
    .slice(0, GLOBAL_HIGHSCORE_LIMIT)
    .map(({ playerName, level, score }) => ({
      playerName,
      level,
      score,
    }));
}

function updateHistoryToggleLabel(
  button: HTMLButtonElement,
  isExpanded: boolean
): void {
  const nextLabel = isExpanded ? "Show fewer games" : "View all games";
  const nextExpandedValue = String(isExpanded);

  if (button.textContent !== nextLabel) {
    button.textContent = nextLabel;
  }

  if (button.getAttribute("aria-expanded") !== nextExpandedValue) {
    button.setAttribute("aria-expanded", nextExpandedValue);
  }
}

function enhanceHistoryPanel(panel: HTMLElement): void {
  const scoreTable = panel.querySelector<HTMLElement>(HISTORY_TABLE_SELECTOR);

  if (!scoreTable) {
    return;
  }

  const dataRows = scoreTable.querySelectorAll(HISTORY_ROW_SELECTOR).length;
  const existingToggleButton = panel.querySelector<HTMLButtonElement>(
    `.${HISTORY_TOGGLE_CLASS}`
  );

  if (dataRows <= COLLAPSED_HISTORY_ROW_COUNT) {
    panel.classList.remove(HISTORY_HAS_TOGGLE_CLASS, HISTORY_EXPANDED_CLASS);
    existingToggleButton?.remove();
    return;
  }

  panel.classList.add(HISTORY_HAS_TOGGLE_CLASS);

  if (existingToggleButton) {
    updateHistoryToggleLabel(
      existingToggleButton,
      panel.classList.contains(HISTORY_EXPANDED_CLASS)
    );
    return;
  }

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.classList.add(HISTORY_TOGGLE_CLASS);
  updateHistoryToggleLabel(toggleButton, false);

  toggleButton.addEventListener("click", () => {
    const isExpanded = panel.classList.toggle(HISTORY_EXPANDED_CLASS);
    updateHistoryToggleLabel(toggleButton, isExpanded);
  });

  panel.append(toggleButton);
}

function enhanceHistoryPanels(): void {
  if (typeof document === "undefined") {
    return;
  }

  document
    .querySelectorAll<HTMLElement>(HISTORY_PANEL_SELECTOR)
    .forEach((panel) => enhanceHistoryPanel(panel));

  syncActivePlayerPanelHeight();
}

function syncActivePlayerPanelHeight(): void {
  if (typeof document === "undefined") {
    return;
  }

  const historyPanel = document.querySelector<HTMLElement>(
    ACTIVE_PLAYER_HISTORY_PANEL_SELECTOR
  );
  const historyTable = historyPanel?.querySelector<HTMLElement>(HISTORY_TABLE_SELECTOR);
  const historyToggleButton = historyPanel?.querySelector<HTMLElement>(
    `.${HISTORY_TOGGLE_CLASS}`
  );
  const globalScoreRows = document.querySelectorAll<HTMLElement>(
    ACTIVE_PLAYER_GLOBAL_SCORE_ROW_SELECTOR
  );

  if (!historyPanel || !historyTable || globalScoreRows.length === 0) {
    return;
  }

  const targetScoreRow =
    globalScoreRows[Math.min(GLOBAL_HIGHSCORE_LIMIT, globalScoreRows.length) - 1];
  const historyPanelRect = historyPanel.getBoundingClientRect();
  const historyTableRect = historyTable.getBoundingClientRect();
  const targetHeight = Math.ceil(
    targetScoreRow.getBoundingClientRect().bottom -
      historyPanelRect.top +
      ACTIVE_PLAYER_HISTORY_BOTTOM_OFFSET
  );

  if (targetHeight <= 0) {
    return;
  }

  const nextHeight = `${targetHeight}px`;

  if (historyPanel.style.height !== nextHeight) {
    historyPanel.style.height = nextHeight;
    historyPanel.style.minHeight = nextHeight;
    historyPanel.style.maxHeight = nextHeight;
  }

  const panelPaddingBottom =
    parseFloat(window.getComputedStyle(historyPanel).paddingBottom) || 0;
  const tableTopOffset = historyTableRect.top - historyPanelRect.top;

  const availableTableHeight = historyToggleButton
    ? historyToggleButton.getBoundingClientRect().top -
      historyPanelRect.top -
      tableTopOffset -
      (parseFloat(window.getComputedStyle(historyToggleButton).marginTop) || 0)
    : targetHeight - tableTopOffset - panelPaddingBottom;

  if (availableTableHeight > 0) {
    historyTable.style.maxHeight = `${Math.floor(availableTableHeight)}px`;
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const initializeHistoryEnhancements = (): void => {
    enhanceHistoryPanels();

    if ((window as Window & { __highscoreHistoryObserver?: boolean }).__highscoreHistoryObserver) {
      return;
    }

    const observer = new MutationObserver(() => {
      enhanceHistoryPanels();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    (window as Window & { __highscoreHistoryObserver?: boolean }).__highscoreHistoryObserver = true;

    if (!(window as Window & { __highscoreResizeListener?: boolean }).__highscoreResizeListener) {
      window.addEventListener("resize", enhanceHistoryPanels);
      (window as Window & { __highscoreResizeListener?: boolean }).__highscoreResizeListener = true;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeHistoryEnhancements, {
      once: true,
    });
  } else {
    initializeHistoryEnhancements();
  }
}
