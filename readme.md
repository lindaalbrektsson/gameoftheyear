# README

# 🎮🧩 Tile Tracker

## Spelidé

Spelet går ut på att följa instruktionen som dyker upp gällande vilken eller vilka symboler spelaren ska klicka på. Under visas ett antal olika symboler, och det gäller att klicka på rätt symbol innan tiden går ut. Spelaren har tre liv, som man förlorar vid feltryck eller att tiden gått ut. Spelet pågår med nya instruktioner, så länge spelaren har liv kvar.

## Mappstruktur

GAMEOFTHEYEAR

│ index.html

SRC
│ main.ts
│ styles.scss

├── Modules
│ ├── startGame.ts
│ ├── endGame.ts
│ ├── restartGame.ts

├── SCSS
│ ├── Base
│ └── \_base.scss
│ ├── Abstracts
│ └── \_variables.scss
│ └── \_mixins.scss
│ ├── Layout
│ └── \_header.scss
│ ├── Components
│ └── \_buttons.scss
│ └── \_highscore.scss

## Funktioner/variabler

- Typescript: camelCase (t.ex. `loadGame`)
- SASS/HTML: gemener, bindestreck (t.ex. `game-section`)

## Namngivning

Views: – `startPage`, `activePlayerStartPage`, `inGamePage`, `gameOverPage`

- Player – `playerName`, `playerID`, `playerScore`, `playerLives`
- Game – `startGame`, `endGame`, `restartGame`,
- Highscore, Score (inte points)
- Shape
- Instruction

## Konvention kring kommentering

Bör inte behövas så mycket kommentarer, om man är noggrann med tydlig namngivning samt uppdelad kod (tydligt indenterad, och inte för långa kodblock). Man bör kommentera vid extra komplicerade/ovanliga funktioner. Vi gör pull requests och kodgranskar och ger varandra feedback, inkluderar även kommentarer och namngivning. Bra att kommentera titlar på kodblock/funktioner samt hellre för tydligt än för otydligt.

## Information om hur projektet byggs och körs

Klona repot:
https://github.com/lindaalbrektsson/gameoftheyear.git

Kör:
npm install
npm run dev
