import { renderInGame } from "./inGame";

type Player = {
  playerName: string;
};

export function renderStartPage(): void {
  const main = document.querySelector("main");

  if (!main) {
    throw new Error("Could not find main element");
  }

  // Tillfällig mockdata för befintliga användare
  // TODO: Byt till fetch från json-server när players finns där
  const existingPlayers: Player[] = [
    { playerName: "PlayerOne" },
    { playerName: "Linda" },
    { playerName: "Alex" },
  ];

  const startPage = document.createElement("div");
  startPage.classList.add("start-page");

  const howToPlay = document.createElement("section");
  howToPlay.classList.add("how-to-play");

  const howToPlayTitle = document.createElement("h2");
  howToPlayTitle.classList.add("how-to-play-title");
  howToPlayTitle.textContent = "How to Play";

  const howToPlayList = document.createElement("ul");
  howToPlayList.classList.add("how-to-play-list");

  const steps = [
    "Enter your name and start a new game",
    "Match the correct tiles based on the given rule",
    "Each correct move gives you points",
    "Advance through levels as difficulty increases",
    "Avoid mistakes to keep your score high",
    "Try to beat your previous highscore",
    "Compete for a spot on the global leaderboard",
  ];

  steps.forEach((step) => {
    const listItem = document.createElement("li");
    listItem.textContent = step;
    howToPlayList.appendChild(listItem);
  });

  howToPlay.appendChild(howToPlayTitle);
  howToPlay.appendChild(howToPlayList);

  const playerForm = document.createElement("section");
  playerForm.classList.add("player-form");

  const playerNameInput = document.createElement("input");
  playerNameInput.type = "text";
  playerNameInput.classList.add("player-name-input");
  playerNameInput.placeholder = "Enter your name";
  playerForm.appendChild(playerNameInput);

  const startGameBtn = document.createElement("button");
  startGameBtn.classList.add("start-game-btn");
  startGameBtn.textContent = "Start Game";

  startGameBtn.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();

    if (!playerName) {
      return;
    }

    const existingPlayer = existingPlayers.find(
      (player) => player.playerName.toLowerCase() === playerName.toLowerCase()
    );

    if (existingPlayer) {
      const continueAsExistingPlayer = window.confirm(
        `The user already exists. Do you want to continue playing as ${existingPlayer.playerName}?`
      );

      if (continueAsExistingPlayer) {
        localStorage.setItem("activePlayer", existingPlayer.playerName);
        renderInGame();
        return;
      }

      playerNameInput.value = "";
      playerNameInput.focus();
      return;
    }

    localStorage.setItem("activePlayer", playerName);
    renderInGame();
  });

  playerNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      startGameBtn.click();
    }
  });

  playerForm.appendChild(startGameBtn);

  startPage.appendChild(howToPlay);
  startPage.appendChild(playerForm);

  main.replaceChildren(startPage);
}
