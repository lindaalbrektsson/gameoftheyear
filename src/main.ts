import "./styles.scss";
import { renderStartPage } from "./modules/startPage";
import { renderActivePlayerStartPage } from "./modules/activePlayerStartPage";
import { getStoredActivePlayerName } from "./modules/localStorage";

const activePlayer = getStoredActivePlayerName();

if (activePlayer) {
  renderActivePlayerStartPage();
} else {
  renderStartPage();
}
