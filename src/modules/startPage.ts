export function renderStartPage() {
    const startPage = document.createElement('div');
    startPage.classList.add('start-page');

    const howToPlay = document.createElement('p');
    howToPlay.classList.add('how-to-play');

    const howToPlayText = document.createElement('p');
    howToPlayText.textContent = "HOW TO PLAY?";
    howToPlay.appendChild(howToPlayText);

    const playerForm = document.createElement('p');
    playerForm.classList.add('player-form');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Enter your name';
    playerForm.appendChild(nameInput);

    const startButton = document.createElement('button');
    startButton.classList.add('start-button');
    startButton.textContent = 'Start Game';
    playerForm.appendChild(startButton);

    startPage.appendChild(howToPlay);
    startPage.appendChild(playerForm);

    return startPage;
}