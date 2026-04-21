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

  const howToPlayText = document.createElement("p");
  howToPlayText.textContent = "HOW TO PLAY?";
  howToPlay.appendChild(howToPlayText);

  const playerForm = document.createElement("section");
  playerForm.classList.add("player-form");

  const playerNameInput = document.createElement("input");
  playerNameInput.type = "text";
  playerNameInput.classList.add("player-name-input");
  playerNameInput.placeholder = "Enter your name";
  playerForm.appendChild(playerNameInput);

  const startGameBtn = document.createElement("button");
  startGameBtn.classList.add("start-game-button");
  startGameBtn.textContent = "Start Game";
  startGameBtn.disabled = true;

  function updateStartButtonState(): void {
    const playerName = playerNameInput.value.trim();
    startGameBtn.disabled = playerName === "";
  }

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
      updateStartButtonState();
      playerNameInput.focus();
      return;
    }

    localStorage.setItem("activePlayer", playerName);
    renderInGame();
  });

  playerNameInput.addEventListener("input", updateStartButtonState);

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