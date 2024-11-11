// ruletaCircular.js

// Variables específicas de la ruleta circular
// Asegúrate de que estas variables no entren en conflicto con las de main.js
// Si ya están definidas en main.js, puedes omitirlas aquí
// let currentDeg = 0;
// let isSpinning = false;
// let step = 0;
// let centerX, centerY, radius;
// let speed = 0;
// let winners = [];
// let items = []; // Lista de participantes
// let colors = {}; // Colores asociados a cada participante

const canvasCircular = document.getElementById("canvas");
const ctxCircular = canvasCircular.getContext("2d");

function setCanvasSize() {
    const scale = window.devicePixelRatio || 1;
    canvasCircular.width = canvasCircular.offsetWidth * scale;
    canvasCircular.height = canvasCircular.offsetHeight * scale;
    ctxCircular.setTransform(scale, 0, 0, scale, 0, 0);
    centerX = canvasCircular.offsetWidth / 2;
    centerY = canvasCircular.offsetHeight / 2;
    radius = Math.min(centerX, centerY) - 10; // Ajuste para evitar cortes
    createWheel();
}

function createWheel() {
    if (items.length === 0) {
        ctxCircular.clearRect(0, 0, canvasCircular.width, canvasCircular.height);
        return;
    }
    step = 360 / items.length;
    drawWheel();
}

// Corrección en la función drawWheel() para aplicar la rotación correctamente
function drawWheel() {
    ctxCircular.clearRect(0, 0, canvasCircular.width, canvasCircular.height);

    ctxCircular.save();
    ctxCircular.translate(centerX, centerY);
    ctxCircular.rotate(toRad(currentDeg));
    ctxCircular.translate(-centerX, -centerY);

    let startDeg = 0;
    items.forEach((item, index) => {
        const endDeg = startDeg + step;
        const color = colors[item] || getNextColor(index, items.length);
        colors[item] = color;

        ctxCircular.beginPath();
        ctxCircular.moveTo(centerX, centerY);
        ctxCircular.arc(centerX, centerY, radius, toRad(startDeg), toRad(endDeg));
        ctxCircular.closePath();
        ctxCircular.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
        ctxCircular.fill();

        // Dibujar texto
        ctxCircular.save();
        ctxCircular.translate(centerX, centerY);
        ctxCircular.rotate(toRad((startDeg + endDeg) / 2));
        ctxCircular.textAlign = "right";
        ctxCircular.fillStyle = getContrastColor(color);
        ctxCircular.font = `${Math.min(radius / 10, 16)}px sans-serif`;
        ctxCircular.fillText(item.length > 15 ? `${item.slice(0, 13)}...` : item, radius - 10, 0);
        ctxCircular.restore();

        startDeg += step;
    });

    ctxCircular.restore();

    // Dibujar triángulo indicador
    ctxCircular.beginPath();
    ctxCircular.moveTo(centerX - 10, centerY - radius + 5);
    ctxCircular.lineTo(centerX + 10, centerY - radius + 5);
    ctxCircular.lineTo(centerX, centerY - radius - 15);
    ctxCircular.fillStyle = '#d32f2f';
    ctxCircular.fill();
}

function spinCircular() {
    if (isSpinning || items.length === 0) return;

    const numWinners = parseInt(numWinnersSelect.value, 10);
    winners = [];
    let spinsRemaining = numWinners;

    function spinAndSelect() {
        if (spinsRemaining > 0 && items.length > 0) {
            const randomTurns = Math.floor(Math.random() * 4) + 4;
            const winnerIndex = Math.floor(Math.random() * items.length);
            const degreesPerItem = 360 / items.length;
            const winnerAngle = winnerIndex * degreesPerItem;
            const finalRotation = randomTurns * 360 + (360 - winnerAngle - degreesPerItem / 2);

            isSpinning = true;

            const duration = 5000;
            const startTime = performance.now();

            function animateSpin(currentTime) {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const easedProgress = easeOutQuart(progress);
                currentDeg = finalRotation * easedProgress;

                drawWheel();

                if (progress < 1) {
                    requestAnimationFrame(animateSpin);
                } else {
                    isSpinning = false;
                    updateWinner(numWinners);
                    spinsRemaining--;
                    if (spinsRemaining > 0) {
                        items.splice(winnerIndex, 1);
                        createWheel();
                        updateNamesList();
                        spinAndSelect();
                    }
                }
            }

            requestAnimationFrame(animateSpin);
        }
    }

    spinAndSelect();
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

function updateWinner(numWinners) {
    const totalDeg = currentDeg % 360;
    const adjustedDeg = (360 - totalDeg + step / 2) % 360;
    const winnerIndex = Math.floor(adjustedDeg / step) % items.length;
    const winnerName = items[winnerIndex];

    if (!winners.includes(winnerName)) {
        winners.push(winnerName);
        winnerText.textContent = `Ganador${winners.length > 1 ? 'es' : ''}: ${winners.join(', ')}`;
        showWinner(winners.join(', '));
    }
}

// Funciones auxiliares
function toRad(deg) {
    return deg * (Math.PI / 180);
}

function getNextColor(index, total) {
    const hue = (index * (360 / total)) % 360;
    return hslToRgb(hue, 70, 50);
}

function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;

    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);
    return {
        r: Math.round(255 * f(0)),
        g: Math.round(255 * f(8)),
        b: Math.round(255 * f(4))
    };
}

function getContrastColor({ r, g, b }) {
    return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#000" : "#fff";
}

function showWinner(winnerName) {
    winnerDiv.textContent = `Ganador: ${winnerName}`;
    overlay.classList.add('visible');
    spinOverlay.classList.remove('visible');
    startConfetti();

    setTimeout(() => {
        closeButton.classList.remove('hidden');
    }, 3000);
}
