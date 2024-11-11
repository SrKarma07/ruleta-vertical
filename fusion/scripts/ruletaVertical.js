// ruletaVertical.js

// Variables específicas de la ruleta vertical
let position = 0;
let isAnimating = false;
let startTime = null;
let totalDuration = 5000 + Math.random() * 2000;
let initialSpeed = 0;
let decelerationDuration = 2000;
let itemHeight = 60;
const maxCanvasHeight = 300;
const maxCanvasBigHeight = 400;
let animationFrame = null;

const canvasVertical = document.getElementById('ruletaCanvas');
const ctxVertical = canvasVertical.getContext('2d');
const canvasBigVertical = document.getElementById('ruletaCanvasBig');
const ctxBigVertical = canvasBigVertical.getContext('2d');
const arrowLeft = document.getElementById('arrowLeft');
const arrowRight = document.getElementById('arrowRight');

function adjustCanvasSize() {
    if (currentRoulette !== 'vertical') return;

    const totalItemsHeight = items.length * itemHeight;
    const newCanvasHeight = Math.min(totalItemsHeight, maxCanvasHeight);
    const newCanvasBigHeight = Math.min(totalItemsHeight, maxCanvasBigHeight);

    canvasVertical.height = newCanvasHeight;
    canvasBigVertical.height = newCanvasBigHeight;

    canvasVertical.style.height = newCanvasHeight + 'px';
    canvasBigVertical.style.height = newCanvasBigHeight + 'px';

    updatePosition();
    draw(ctxVertical, canvasVertical, position);
}

function initializeVerticalRoulette() {
    colors = {};
    items.forEach((item, index) => {
        colors[item] = getNextColor(index, items.length);
    });
    draw(ctxVertical, canvasVertical, position);
}

function updatePosition() {
    const totalItemsHeight = items.length * itemHeight;
    const canvasHeight = canvasVertical.height;

    if (totalItemsHeight > canvasHeight) {
        position -= itemHeight;
    } else {
        position = 0;
    }
}

function draw(context, canvasElement, posY) {
    if (currentRoulette !== 'vertical') return;
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    context.font = '20px Arial';
    context.textAlign = 'center';

    if (items.length === 0) {
        context.fillStyle = '#000';
        context.fillText('No hay nombres agregados', canvasElement.width / 2, canvasElement.height / 2);
        return;
    }

    const totalHeight = items.length * itemHeight;

    for (let i = 0; i < items.length; i++) {
        let yPosition = posY + i * itemHeight;

        // Ajuste para repetir la lista de nombres
        while (yPosition + itemHeight < 0) {
            yPosition += totalHeight;
        }
        while (yPosition > canvasElement.height) {
            yPosition -= totalHeight;
        }

        const centerY = canvasElement.height / 2;
        const distanceFromCenter = Math.abs(yPosition + itemHeight / 2 - centerY);
        const maxDistance = canvasElement.height / 2;

        let opacity = 1 - (distanceFromCenter / maxDistance);
        opacity = Math.max(0, Math.min(1, opacity));

        let saturation = opacity * 100;

        let color = adjustColorSaturation(colors[items[i]], saturation);

        context.fillStyle = color;
        context.globalAlpha = opacity;
        context.fillRect(50, yPosition, canvasElement.width - 100, itemHeight - 10);

        context.fillStyle = '#000';
        context.fillText(items[i], canvasElement.width / 2, yPosition + itemHeight / 2 + 5);

        context.globalAlpha = 1;
    }
}

function spinVertical() {
    if (isAnimating || items.length === 0) {
        alert('Por favor, añade al menos un nombre antes de iniciar la ruleta.');
        return;
    }
    isAnimating = true;
    startTime = null;
    totalDuration = 5000 + Math.random() * 2000;
    initialSpeed = 50;
    speed = initialSpeed;

    const extraRotations = Math.floor(Math.random() * items.length * 5) + items.length * 5;
    position -= extraRotations * itemHeight;

    showSpinOverlay('vertical');
    animationFrame = requestAnimationFrame(animate);
}

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

    draw(ctxBigVertical, canvasBigVertical, position);
    animationFrame = requestAnimationFrame(animate);
}

function finalizeStop() {
    isAnimating = false;

    const totalHeight = items.length * itemHeight;
    let winnerIndex = Math.floor((-position + canvasBigVertical.height / 2) / itemHeight) % items.length;
    if (winnerIndex < 0) winnerIndex += items.length;

    position = -((winnerIndex * itemHeight) - canvasBigVertical.height / 2 + itemHeight / 2);

    draw(ctxBigVertical, canvasBigVertical, position);

    setTimeout(() => {
        showWinner(items[winnerIndex]);
    }, 1000);
}

// Funciones auxiliares
function adjustColorSaturation(colorObj, saturation) {
    const rgb = colorObj;
    let hsl = rgbToHSL(rgb.r, rgb.g, rgb.b);
    hsl.s = saturation;
    const adjustedRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return `rgb(${adjustedRgb.r},${adjustedRgb.g},${adjustedRgb.b})`;
}

function rgbToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
                break;
            case g:
                h = ((b - r) / d + 2) * 60;
                break;
            case b:
                h = ((r - g) / d + 4) * 60;
                break;
        }
    }
    return {h, s: s * 100, l: l * 100};
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

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function getNextColor(index, total) {
    const hue = (index * (360 / total)) % 360;
    return hslToRgb(hue, 70, 50);
}

function showSpinOverlay(type) {
    overlay.classList.remove('visible');
    closeButton.classList.add('hidden');
    spinOverlay.classList.add('visible');
    if (type === 'vertical') {
        canvasBigVertical.style.display = 'block';
        arrowLeft.style.display = 'block';
        arrowRight.style.display = 'block';
        canvasBigCircular.style.display = 'none';
        triangleBig.style.display = 'none';
    }
}

function showWinner(winnerName) {
    winnerDiv.textContent = `Ganador: ${winnerName}`;
    overlay.classList.add('visible');
    spinOverlay.classList.remove('visible');
    startConfetti(); // Si tienes una función para iniciar el confeti

    setTimeout(() => {
        closeButton.classList.remove('hidden');
    }, 3000);
}
