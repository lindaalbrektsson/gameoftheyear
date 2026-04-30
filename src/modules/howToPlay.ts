const HOW_TO_PLAY_STEPS = [
  "Click on the correct tiles based on the given instruction",
  "Complete the round before the timer runs out",
  "You have three lives, so avoid mistakes to keep playing",
  "Each successful click increases your score",
  "A failed click costs you a life and decreases your score",
  "Advance through levels as difficulty increases",
  "Try to beat your previous highscore",
  "Compete for a spot on the global leaderboard",
];

function createHowToPlayList(): HTMLUListElement {
  const howToPlayList = document.createElement("ul");
  howToPlayList.classList.add("how-to-play-list");

  HOW_TO_PLAY_STEPS.forEach((step) => {
    const listItem = document.createElement("li");
    listItem.textContent = step;
    howToPlayList.appendChild(listItem);
  });

  return howToPlayList;
}

export function createHowToPlaySection(): HTMLElement {
  const howToPlaySection = document.createElement("section");
  howToPlaySection.classList.add("how-to-play");

  const howToPlayTitle = document.createElement("h2");
  howToPlayTitle.classList.add("how-to-play-title");
  howToPlayTitle.textContent = "How to Play";

  howToPlaySection.append(howToPlayTitle, createHowToPlayList());

  return howToPlaySection;
}

export function createHowToPlayPanel(): HTMLElement {
  const howToPlayPanel = document.createElement("section");
  howToPlayPanel.classList.add("how-to-play-panel");

  const title = document.createElement("h2");
  title.classList.add("panel-title");
  title.textContent = "How to play";

  howToPlayPanel.append(title, createHowToPlayList());

  return howToPlayPanel;
}
