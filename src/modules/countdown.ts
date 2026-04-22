
export function startCountdown() {
    const countdown = document.querySelector(".countdown");
    if (!countdown) {
        throw new Error("Can't find countdown-element");
    }

    let counter = 5;

    const counterInterval = setInterval(() => {
        countdown.textContent = counter.toString();
        counter--;

        if (counter === 0){
            clearInterval(counterInterval);
            // startGame();
        }
    }, 1000)


}