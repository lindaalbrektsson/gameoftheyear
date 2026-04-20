/* import "./styles.scss";
import { renderStartPage } from "./modules/startPage";
import { renderActivePlayerStartPage } from "./modules/activePlayerStartPage";
import { renderInGame } from "./modules/inGame";
import { renderGameOver } from "./modules/gameOver";

const activePlayer = localStorage.getItem("activePlayer");

if (activePlayer) {
  renderActivePlayerStartPage();
} else {
  renderStartPage();
} */

  import "./styles.scss";
import { renderActivePlayerStartPage } from "./modules/activePlayerStartPage";

renderActivePlayerStartPage();