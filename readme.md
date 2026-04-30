# README

# 🎮🧩 Tile Tracker

## Spelidé

Spelet går ut på att följa instruktionen som dyker upp gällande vilken eller vilka symboler spelaren ska klicka på. Under visas ett antal olika symboler, och det gäller att klicka på rätt symbol/symboler innan tiden går ut. Spelaren har tre liv, som man förlorar vid feltryck eller att tiden gått ut. Spelet pågår med nya instruktioner, så länge spelaren har liv kvar.

## Mappstruktur

GAMEOFTHEYEAR

│ index.html

SRC
│ main.ts
│ styles.scss

├── Modules
│ ├── API
│ └── \games.ts
│ └── \instructions.ts
│ └── \players.ts
│ └── \shapes.ts
│ ├── activePlayerStartPage.ts
│ ├── gameOver.ts
│ ├── highscore.ts
│ ├── howToPlay.ts
│ ├── inGameLogic.ts
│ ├── inGameTimer.ts
│ ├── inGameUI.ts
│ ├── localStorage.ts
│ ├── startPage.ts

├── SASS
│ ├── Abstracts
│ └── \_variables.scss
│ └── \_mixins.scss
│ ├── Base
│ └── \_base.scss
│ ├── Components
│ └── \_buttons.scss
│ └── \_highscore.scss
│ └── \_shapes.scss
│ ├── Layout
│ └── \_header.scss
│ ├── Pages
│ └── \_activePlayerStart.scss
│ └── \_gameOver.scss
│ └── \_inGame.scss
│ └── \_startPage.scss

## Funktioner/variabler

- Typescript: camelCase (t.ex. `loadGame`)
- SASS/HTML: gemener, bindestreck (t.ex. `game-section`)

## Namngivning

Views: – `startPage`, `activePlayerStartPage`, `inGame`, `gameOver`

- Player
- Game
- Highscore, Score
- Shape
- Instruction
- Round
- RoundState
- Tile
- ActivePlayer
- GameHistory
- Leaderboard eller GlobalHighscoreEntry
- HowToPlay
- LocalStorage

## Konvention kring kommentering

Bör inte behövas så mycket kommentarer, om man är noggrann med tydlig namngivning samt uppdelad kod (tydligt indenterad, och inte för långa kodblock). Man bör kommentera vid extra komplicerade/ovanliga funktioner. Vi gör pull requests och kodgranskar och ger varandra feedback, inkluderar även kommentarer och namngivning. Bra att kommentera titlar på kodblock/funktioner samt hellre för tydligt än för otydligt.

## Information om hur projektet byggs och körs

Klona repot:
https://github.com/lindaalbrektsson/gameoftheyear.git

Kör Vite, Typescript och SASS:
npm install
npm run dev

Öppna en till terminal och kör Json:
npm run server
