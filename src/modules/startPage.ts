export function renderStartPage() {
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
  playerForm.appendChild(startGameBtn);

  startPage.appendChild(howToPlay);
  startPage.appendChild(playerForm);

  return startPage;
}
