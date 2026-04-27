import "./styles.scss";
import { renderStartPage } from "./modules/startPage";
import { renderActivePlayerStartPage } from "./modules/activePlayerStartPage";
import { initGameFlow } from "./modules/inGame";
import { renderGameOver } from "./modules/gameOver";

type ViewName = "start" | "active-player" | "in-game" | "game-over";

function getViewFromHash(): ViewName | null {
  const hash = window.location.hash.replace("#", "");

  if (
    hash === "start" ||
    hash === "active-player" ||
    hash === "in-game" ||
    hash === "game-over"
  ) {
    return hash;
  }

  return null;
}

async function renderView(view: ViewName): Promise<void> {
  if (view === "start") {
    localStorage.removeItem("activePlayer");
    renderStartPage();
    return;
  }

  if (view === "active-player") {
    if (!localStorage.getItem("activePlayer")) {
      localStorage.setItem("activePlayer", "Linda");
    }

    renderActivePlayerStartPage();
    return;
  }

  if (view === "in-game") {
    if (!localStorage.getItem("activePlayer")) {
      localStorage.setItem("activePlayer", "Linda");
    }

    initGameFlow();
    return;
  }

  await renderGameOver();
}

function updateActiveDevButton(view: ViewName): void {
  const devViewButtons =
    document.querySelectorAll<HTMLButtonElement>(".dev-view-btn");

  devViewButtons.forEach((button) => {
    const isActive = button.dataset.view === view;
    button.classList.toggle("is-active", isActive);
  });
}

function setupDevViewNav(): void {
  const devViewButtons =
    document.querySelectorAll<HTMLButtonElement>(".dev-view-btn");

  devViewButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const view = button.dataset.view as ViewName | undefined;

      if (!view) {
        return;
      }

      window.location.hash = view;
      updateActiveDevButton(view);
      await renderView(view);
    });
  });
}

async function init(): Promise<void> {
  setupDevViewNav();

  const hashView = getViewFromHash();
  const activePlayer = localStorage.getItem("activePlayer");

  if (hashView) {
    updateActiveDevButton(hashView);
    await renderView(hashView);
    return;
  }

  if (activePlayer) {
    updateActiveDevButton("active-player");
    await renderView("active-player");
    return;
  }

  updateActiveDevButton("start");
  await renderView("start");
}

void init();

export function clearHeaderMenu(): void {
  const headerMenu = document.querySelector(".header-menu");

  if (!headerMenu) {
    return;
  }

  headerMenu.replaceChildren();
}
