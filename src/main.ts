import "./styles.scss";
import { renderInGame } from "./modules/inGame";
import { startCountdown } from "./modules/countdown";
import { renderStartPage } from "./modules/startPage";
import { renderActivePlayerStartPage } from "./modules/activePlayerStartPage";

// const activePlayer = localStorage.getItem("activePlayer");

// if (activePlayer) {
//   renderActivePlayerStartPage();
// } else {
//   renderStartPage();
// }

renderInGame();
startCountdown();