import type { Game } from "./API/games";
import type { Player } from "./API/players";

export type EntityId = string | number;

export type PlayerRecord = Player;

export type GameRecord = Game;

export type GlobalHighscoreEntry = {
  playerName: string;
  level: number;
  score: number;
};

const GLOBAL_HIGHSCORE_LIMIT = 5;
const DEFAULT_COLLAPSED_HISTORY_ROW_COUNT = GLOBAL_HIGHSCORE_LIMIT + 1;
const HISTORY_PANEL_SELECTOR = ".player-recent-games";
const HISTORY_TABLE_SELECTOR = ".player-score-table";
const HISTORY_ROW_SELECTOR = ".score-row:not(.score-header)";
const HISTORY_TOGGLE_CLASS = "history-panel-toggle";
const HISTORY_EXPANDED_CLASS = "is-expanded";
const HISTORY_HAS_TOGGLE_CLASS = "has-history-toggle";
const DESKTOP_HISTORY_BREAKPOINT = 900;
const ACTIVE_PLAYER_HISTORY_PANEL_SELECTOR =
  ".active-player-start-page .player-recent-games";
const ACTIVE_PLAYER_GLOBAL_PANEL_SELECTOR =
  ".active-player-start-page .global-highscore";
const ACTIVE_PLAYER_GLOBAL_SCORE_ROW_SELECTOR =
  `${ACTIVE_PLAYER_GLOBAL_PANEL_SELECTOR} .score-row:not(.score-header)`;
const ACTIVE_PLAYER_HISTORY_BOTTOM_OFFSET = 20;
const ACTIVE_PLAYER_HISTORY_SYNC_BREAKPOINT = 900;

function parseCollapsedRowsValue(value: string | undefined): number | null {
  const parsedValue = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return null;
  }

  return parsedValue;
}

function getCollapsedHistoryRowCount(panel: HTMLElement): number {
  if (typeof window !== "undefined" && window.innerWidth > DESKTOP_HISTORY_BREAKPOINT) {
    const desktopCollapsedRowsValue = parseCollapsedRowsValue(
      panel.dataset.collapsedRowsDesktop
    );

    if (desktopCollapsedRowsValue !== null) {
      return desktopCollapsedRowsValue;
    }
  }

  const collapsedRowsValue = parseCollapsedRowsValue(panel.dataset.collapsedRows);

  return collapsedRowsValue ?? DEFAULT_COLLAPSED_HISTORY_ROW_COUNT;
}

function applyCollapsedHistoryVisibility(
  panel: HTMLElement,
  dataRows: HTMLElement[],
  collapsedHistoryRowCount: number
): void {
  const isExpanded = panel.classList.contains(HISTORY_EXPANDED_CLASS);

  dataRows.forEach((row, index) => {
    row.style.display =
      !isExpanded && index >= collapsedHistoryRowCount ? "none" : "";
  });
}

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

  const dataRows = Array.from(
    scoreTable.querySelectorAll<HTMLElement>(HISTORY_ROW_SELECTOR)
  );
  const collapsedHistoryRowCount = getCollapsedHistoryRowCount(panel);
  const existingToggleButton = panel.querySelector<HTMLButtonElement>(
    `.${HISTORY_TOGGLE_CLASS}`
  );

  if (dataRows.length <= collapsedHistoryRowCount) {
    panel.classList.remove(HISTORY_HAS_TOGGLE_CLASS, HISTORY_EXPANDED_CLASS);
    applyCollapsedHistoryVisibility(panel, dataRows, collapsedHistoryRowCount);
    existingToggleButton?.remove();
    return;
  }

  panel.classList.add(HISTORY_HAS_TOGGLE_CLASS);
  applyCollapsedHistoryVisibility(panel, dataRows, collapsedHistoryRowCount);

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
    applyCollapsedHistoryVisibility(panel, dataRows, collapsedHistoryRowCount);
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

  if (!historyPanel || !historyTable) {
    return;
  }

  if (window.innerWidth <= ACTIVE_PLAYER_HISTORY_SYNC_BREAKPOINT) {
    historyPanel.style.height = "";
    historyPanel.style.minHeight = "";
    historyPanel.style.maxHeight = "";

    historyTable.style.maxHeight = historyPanel.classList.contains(HISTORY_EXPANDED_CLASS)
      ? "55vh"
      : "";

    return;
  }

  if (globalScoreRows.length === 0) {
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
