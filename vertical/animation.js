// animation.js

// Función de desaceleración suave (cúbica)
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Animación de la ruleta
function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    let elapsed = timestamp - startTime;

    if (elapsed < totalDuration - decelerationDuration) {
        // Fase de velocidad constante
        position -= speed;
    } else if (elapsed < totalDuration) {
        // Fase de desaceleración suave
        let t = (elapsed - (totalDuration - decelerationDuration)) / decelerationDuration;
        let deceleratedSpeed = initialSpeed * easeOutCubic(1 - t);
        position -= deceleratedSpeed;
    } else {
        // Finalizar animación
        finalizeStop();
        return;
    }

    draw(ctxBig, canvasBig, position);

    animationFrame = requestAnimationFrame(animate);
}

// Iniciar animación
function startAnimation() {
    if (names.length === 0) {
        alert('Por favor, añade al menos un nombre antes de iniciar la ruleta.');
        return;
    }
    if (isAnimating) {
        return;
    }
    isAnimating = true;
    startTime = null;
    totalDuration = 5000 + Math.random() * 2000; // Entre 5 y 7 segundos
    initialSpeed = 50; // Velocidad inicial
    speed = initialSpeed;

    // Añadir rotación extra aleatoria
    const extraRotations = Math.floor(Math.random() * names.length * 5) + names.length * 5;
    position -= extraRotations * itemHeight;

    overlay.classList.remove('visible'); // Ocultar overlay
    closeButton.classList.add('hidden'); // Ocultar botón de cerrar
    spinOverlay.classList.add('visible'); // Mostrar overlay de giro
    draw(ctxBig, canvasBig, position); // Dibujo inicial en canvas grande
    animationFrame = requestAnimationFrame(animate);
}

// Finalizar la detención y mostrar ganador
function finalizeStop() {
    isAnimating = false;

    // Alinear perfectamente el nombre ganador entre las flechas
    const totalHeight = names.length * itemHeight;
    let winnerIndex = Math.floor((-position + canvasBig.height / 2) / itemHeight) % names.length;
    if (winnerIndex < 0) winnerIndex += names.length;

    // Calcular la posición exacta para centrar el nombre ganador
    position = -((winnerIndex * itemHeight) - canvasBig.height / 2 + itemHeight / 2);

    draw(ctxBig, canvasBig, position);

    // Actualizar el canvas pequeño con la posición final
    draw(ctx, canvas, position);

    // Esperar 2 segundos antes de mostrar al ganador
    setTimeout(() => {
        showWinner(names[winnerIndex]);
    }, 2000);
}

// Mostrar ganador y confeti
function showWinner(winner) {
    winnerDiv.textContent = winner;
    // No reiniciar el spinOverlay para mantener la ruleta en el estado final
    spinOverlay.classList.remove('visible'); // Ocultar overlay de giro
    overlay.classList.add('visible'); // Mostrar overlay del ganador
    startConfetti();

    // Mostrar botón de cerrar después de 5 segundos
    setTimeout(() => {
        closeButton.classList.remove('hidden');
        closeButton.classList.add('visible');
    }, 3000);
}
