import { renderActivePlayerStartPage } from "./activePlayerStartPage";
import { initGameFlow } from "./inGameLogic";
import { setStoredActivePlayerName } from "./localStorage";

type Player = {
  id?: string;
  playerName: string;
  bestScore: number;
};

export async function renderStartPage(): Promise<void> {
  const main = document.querySelector("main");
  const headerMenu = document.querySelector(".header-menu");
  headerMenu?.replaceChildren();

  if (!main) {
    throw new Error("Could not find main element");
  }

  let existingPlayers: Player[] = [];
  let couldNotFetchPlayers = false;

  try {
    existingPlayers = await fetchPlayers();
    console.log("Fetched players from API", existingPlayers);
  } catch (error) {
    couldNotFetchPlayers = true;
    console.error("Error fetching players:", error);
  }

  const startPage = document.createElement("div");
  startPage.classList.add("start-page");

  const howToPlaySection = document.createElement("section");
  howToPlaySection.classList.add("how-to-play");

  const howToPlayTitle = document.createElement("h2");
  howToPlayTitle.classList.add("how-to-play-title");
  howToPlayTitle.textContent = "How to Play";

  const howToPlayList = document.createElement("ul");
  howToPlayList.classList.add("how-to-play-list");

  const steps = [
    "Enter your name and start a new game",
    "Click on the correct tiles based on the given rule",
    "Complete the round before the timer runs out",
    "You have three lives, so avoid mistakes to keep playing",
    "Each succesful round gives you score",
    "A failed round costs you a life and decreases your score",
    "Advance through levels as difficulty increases",
    "Try to beat your previous highscore",
    "Compete for a spot on the global leaderboard",
  ];

  steps.forEach((step) => {
    const listItem = document.createElement("li");
    listItem.textContent = step;
    howToPlayList.appendChild(listItem);
  });

  howToPlaySection.appendChild(howToPlayTitle);
  howToPlaySection.appendChild(howToPlayList);

  const playerFormSection = document.createElement("section");
  playerFormSection.classList.add("player-form");

  const playerNameInput = document.createElement("input");
  playerNameInput.type = "text";
  playerNameInput.classList.add("player-name-input");
  playerNameInput.placeholder = "Enter your name";

  const startGameBtn = document.createElement("button");
  startGameBtn.classList.add("game-btn", "start-game-btn");
  startGameBtn.type = "button";
  startGameBtn.textContent = "Start Game";
  startGameBtn.disabled = true;

  function updateStartButtonState(): void {
    const playerName = playerNameInput.value.trim();
    startGameBtn.disabled = playerName === "";
  }

  startGameBtn.addEventListener("click", async () => {
    const playerName = playerNameInput.value.trim();

    if (couldNotFetchPlayers) {
      alert("Could not load existing players. Please try again.");
      return;
    }

    const existingPlayer = existingPlayers.find(
      (player) => player.playerName.toLowerCase() === playerName.toLowerCase()
    );

    if (existingPlayer) {
      showExistingPlayerPopup(
        existingPlayer.playerName,
        () => {
          setStoredActivePlayerName(existingPlayer.playerName);
          renderActivePlayerStartPage();
        },
        () => {
          playerNameInput.value = "";
          updateStartButtonState();
          playerNameInput.focus();
        }
      );

      return;
    }

    const newPlayer = createPlayer(playerName);
    const createdPlayer = await savePlayer(newPlayer);

    console.log("Created player from API", createdPlayer);

    setStoredActivePlayerName(createdPlayer.playerName);
    initGameFlow();
  });

  playerNameInput.addEventListener("input", updateStartButtonState);

  playerNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      startGameBtn.click();
    }
  });

  playerFormSection.appendChild(playerNameInput);
  playerFormSection.appendChild(startGameBtn);

  startPage.appendChild(howToPlaySection);
  startPage.appendChild(playerFormSection);

  main.replaceChildren(startPage);
  requestAnimationFrame(() => {
    startPage.classList.add("fade-in");
  });
}

function showExistingPlayerPopup(
  playerName: string,
  onContinue: () => void,
  onCancel: () => void
): void {
  const popupOverlay = document.createElement("div");
  popupOverlay.classList.add("existing-player-popup-overlay");

  const popup = document.createElement("div");
  popup.classList.add("existing-player-popup");

  const popupTitle = document.createElement("h2");
  popupTitle.classList.add("existing-player-popup-title");
  popupTitle.textContent = "Player Already Exists";

  const popupText = document.createElement("p");
  popupText.classList.add("existing-player-popup-text");
  popupText.textContent = `The user "${playerName}" already exists. Do you want to continue playing as this user?`;

  const btnWrapper = document.createElement("div");
  btnWrapper.classList.add("existing-popup-btn-wrapper");

  const continueBtn = document.createElement("button");
  continueBtn.type = "button";
  continueBtn.classList.add("game-btn", "existing-player-popup-btn");
  continueBtn.textContent = "Yes";

  const createNewBtn = document.createElement("button");
  createNewBtn.type = "button";
  createNewBtn.classList.add("game-btn", "existing-player-popup-btn");
  createNewBtn.textContent = "No";

  btnWrapper.appendChild(continueBtn);
  btnWrapper.appendChild(createNewBtn);
  popup.appendChild(popupTitle);
  popup.appendChild(popupText);
  popup.appendChild(btnWrapper);
  popupOverlay.appendChild(popup);
  document.body.appendChild(popupOverlay);

  continueBtn.addEventListener("click", () => {
    popupOverlay.remove();
    onContinue();
  });

  createNewBtn.addEventListener("click", () => {
    popupOverlay.remove();
    onCancel();
  });
}

function createPlayer(playerName: string): Player {
  return {
    playerName,
    bestScore: 0,
  };
}

async function savePlayer(player: Player): Promise<Player> {
  const response = await fetch("http://localhost:3000/players", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(player),
  });

  if (!response.ok) {
    throw new Error("Failed to save player");
  }

  return response.json();
}

async function fetchPlayers(): Promise<Player[]> {
  const response = await fetch("http://localhost:3000/players");

  if (!response.ok) {
    throw new Error("Failed to fetch players");
  }

  return response.json();
}
