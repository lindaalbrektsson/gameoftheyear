export function renderStartPage() {
    const startPage = document.createElement('div');
    startPage.classList.add('start-page');

    const howToPlay = document.createElement('section');
    howToPlay.classList.add('how-to-play');

    const howToPlayText = document.createElement('p');
    howToPlayText.textContent = "HOW TOP PLAY?";
    howToPlay.appendChild(howToPlayText);

    startPage.appendChild(howToPlay);

    return startPage;
}