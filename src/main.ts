import "./styles.scss";
// import { renderStartPage } from "./modules/startPage";
// import { renderActivePlayerStartPage } from "./modules/activePlayerStartPage";

// const activePlayer = localStorage.getItem("activePlayer");

// if (activePlayer) {
//   renderActivePlayerStartPage();
// } else {
//   renderStartPage();
// }

import { renderInGame, updateUI, startGame } from "./modules/inGame";

renderInGame();
updateUI();
startGame();
