// Función de desaceleración suave
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Animación de la ruleta vertical
function animate(timestamp) {
    if (currentRoulette !== 'vertical') return;

    if (!startTime) startTime = timestamp;
    let elapsed = timestamp - startTime;

    if (elapsed < totalDuration - decelerationDuration) {
        position -= speed;
    } else if (elapsed < totalDuration) {
        let t = (elapsed - (totalDuration - decelerationDuration)) / decelerationDuration;
        let deceleratedSpeed = initialSpeed * easeOutCubic(1 - t);
        position -= deceleratedSpeed;
    } else {
        finalizeStop();
        return;
    }

    draw(ctxBig, canvasBig, position);
    requestAnimationFrame(animate);
}

// Finalizar y mostrar ganador en ruleta vertical
function finalizeStop() {
    isAnimating = false;
    const totalHeight = names.length * itemHeight;
    let winnerIndex = Math.floor((-position + canvasBig.height / 2) / itemHeight) % names.length;
    if (winnerIndex < 0) winnerIndex += names.length;

    position = -((winnerIndex * itemHeight) - canvasBig.height / 2 + itemHeight / 2);
    draw(ctxBig, canvasBig, position);

    setTimeout(() => {
        showWinner(names[winnerIndex]);
    }, 2000);
}