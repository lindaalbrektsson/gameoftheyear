const headerMenu = document.querySelector(".header-menu") as HTMLUListElement;


export function renderInGamePage (): void {
    if (headerMenu) {
        const activePlayerInfo = document.createElement("li");
        activePlayerInfo.textContent = `Logged in as: ` //Lägg till spelarens namn, hämta från local storage? db?
        const endGameLi = document.createElement("li");
        const endGameBtn = document.createElement("button");
        endGameBtn.textContent = "End game"
        endGameLi.appendChild(endGameBtn);
        headerMenu.append(activePlayerInfo, endGameLi);
    }
    
}

