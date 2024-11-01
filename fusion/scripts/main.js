// main.js

document.addEventListener('DOMContentLoaded', function() {
    // Variables y elementos del DOM
    const rouletteSelection = document.getElementById('roulette-selection');
    const rouletteConfiguration = document.getElementById('roulette-configuration');
    const rouletteInterface = document.getElementById('roulette-interface');

    const selectCircularRouletteBtn = document.getElementById('selectCircularRoulette');
    const selectVerticalRouletteBtn = document.getElementById('selectVerticalRoulette');
    const startRaffleBtn = document.getElementById('startRaffleBtn');

    const canvasCircular = document.getElementById("canvas");
    const ctxCircular = canvasCircular.getContext("2d");
    const canvasBigCircular = document.getElementById('canvasBig');
    const ctxBigCircular = canvasBigCircular.getContext('2d');

    const canvasVertical = document.getElementById('ruletaCanvas');
    const ctxVertical = canvasVertical.getContext('2d');
    const canvasBigVertical = document.getElementById('ruletaCanvasBig');
    const ctxBigVertical = canvasBigVertical.getContext('2d');

    const spinOverlay = document.getElementById('spinOverlay');
    const overlay = document.getElementById('overlay');
    const winnerDiv = document.getElementById('winner');
    const winnerText = document.getElementById('winnerText');
    const closeButton = document.getElementById('closeButton');

    const newRaffleBtn = document.getElementById('newRaffleBtn');
    const spinAgainBtn = document.getElementById('spinAgainBtn');

    const arrowLeft = document.getElementById('arrowLeft');
    const arrowRight = document.getElementById('arrowRight');
    const triangleBig = document.getElementById('triangleBig');

    const numWinnersSelect = document.getElementById('numWinners');

    // Variables generales
    let currentRoulette = ''; // 'circular' o 'vertical'
    let isSpinning = false;

    // Variables para la ruleta circular
    let currentDeg = 0;
    let step = 0;
    let speed = 0;
    let winners = [];
    let centerX, centerY, radius;

    // Variables para la ruleta vertical
    let names = [];
    let colorsVertical = [];
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

    // Inicializar
    updateNamesList();

    // Eventos de botones
    selectCircularRouletteBtn.addEventListener('click', () => selectRoulette('circular'));
    selectVerticalRouletteBtn.addEventListener('click', () => selectRoulette('vertical'));
    startRaffleBtn.addEventListener('click', goToRouletteInterface);

    spinAgainBtn.addEventListener('click', spinAgain);
    newRaffleBtn.addEventListener('click', resetApplication);
    closeButton.addEventListener('click', closeOverlay);

    window.addEventListener('resize', resizeCanvas);

    // Función para seleccionar el tipo de ruleta
    function selectRoulette(type) {
        currentRoulette = type;
        rouletteSelection.classList.add('d-none');
        rouletteConfiguration.classList.remove('d-none');
    }

    // Función para ir a la interfaz de la ruleta
    function goToRouletteInterface() {
        if (items.length === 0) {
            alert('Por favor, agregue participantes antes de continuar.');
            return;
        }
        rouletteConfiguration.classList.add('d-none');
        rouletteInterface.classList.remove('d-none');
        if (currentRoulette === 'circular') {
            document.getElementById('circular-roulette').classList.remove('d-none');
            document.getElementById('vertical-roulette').classList.add('d-none');
            setCanvasSize();
            createWheel();
        } else {
            document.getElementById('circular-roulette').classList.add('d-none');
            document.getElementById('vertical-roulette').classList.remove('d-none');
            adjustCanvasSize();
            names = [...items];
            colorsVertical = names.map((_, index) => {
                const colorObj = getNextColor(index, names.length);
                return `rgb(${colorObj.r},${colorObj.g},${colorObj.b})`;
            });
            draw(ctxVertical, canvasVertical, position);
        }
    }

    // Función para girar de nuevo sin reiniciar todo
    function spinAgain() {
        overlay.classList.remove('visible');
        closeButton.classList.add('hidden');
        winners = [];
        winnerText.textContent = 'Ganador';
        if (currentRoulette === 'circular') {
            spinCircular();
        } else if (currentRoulette === 'vertical') {
            spinVertical();
        }
    }

    // Función para cerrar el overlay
    function closeOverlay() {
        overlay.classList.remove('visible');
        closeButton.classList.add('hidden');
        stopConfetti();
    }

    // Funciones para la ruleta circular
    function setCanvasSize() {
        const scale = window.devicePixelRatio || 1;
        canvasCircular.width = canvasCircular.offsetWidth * scale;
        canvasCircular.height = canvasCircular.offsetHeight * scale;
        ctxCircular.scale(scale, scale);
        centerX = canvasCircular.offsetWidth / 2;
        centerY = canvasCircular.offsetHeight / 2;
        radius = Math.min(centerX, centerY);
        createWheel();
    }

    function resizeCanvas() {
        if (currentRoulette === 'circular') {
            setCanvasSize();
        } else if (currentRoulette === 'vertical') {
            adjustCanvasSize();
        }
    }

    function createWheel() {
        if (currentRoulette !== 'circular') return;
        if (items.length === 0) {
            ctxCircular.clearRect(0, 0, canvasCircular.width, canvasCircular.height);
            return;
        }
        step = 360 / items.length;
        drawWheel();
    }

    function drawWheel() {
        if (currentRoulette !== 'circular') return;
        ctxCircular.clearRect(0, 0, canvasCircular.width, canvasCircular.height);
        ctxCircular.beginPath();
        ctxCircular.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctxCircular.fillStyle = '#212121';
        ctxCircular.fill();

        let startDeg = 0;
        items.forEach((item, index) => {
            const endDeg = startDeg + step;
            const color = colors[item];
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

                let currentRotation = 0;
                const totalFrames = 100;
                const easeOutQuad = t => t * (2 - t);

                showSpinOverlay('circular');

                function animateSpinCircular(frame) {
                    const progress = easeOutQuad(frame / totalFrames);
                    currentDeg = finalRotation * progress;
                    drawWheelBig();
                    if (frame < totalFrames) {
                        requestAnimationFrame(() => animateSpinCircular(frame + 1));
                    } else {
                        isSpinning = false;
                        updateWinner(numWinners);
                        spinsRemaining--;
                        if (spinsRemaining > 0) {
                            items.splice(winnerIndex, 1);
                            createWheel();
                            updateNamesList();
                            spinAndSelect();
                        } else {
                            spinOverlay.classList.remove('visible');
                        }
                    }
                }

                animateSpinCircular(0);
            }
        }

        spinAndSelect();
    }

    function drawWheelBig() {
        ctxBigCircular.clearRect(0, 0, canvasBigCircular.width, canvasBigCircular.height);
        ctxBigCircular.save();
        ctxBigCircular.translate(canvasBigCircular.width / 2, canvasBigCircular.height / 2);
        ctxBigCircular.rotate(toRad(currentDeg));
        ctxBigCircular.drawImage(canvasCircular, -canvasBigCircular.width / 2, -canvasBigCircular.height / 2, canvasBigCircular.width, canvasBigCircular.height);
        ctxBigCircular.restore();
    }

    function updateWinner(numWinners) {
        const totalDeg = currentDeg % 360;
        const winnerIndex = Math.floor((360 - totalDeg) / step) % items.length;
        const winnerName = items[winnerIndex];

        if (!winners.includes(winnerName)) {
            winners.push(winnerName);
            winnerText.textContent = `Ganador${winners.length > 1 ? 'es' : ''}: ${winners.join(', ')}`;
            showWinner(winners.join(', '));
        }
    }

    function toRad(deg) {
        return deg * (Math.PI / 180);
    }

    // Funciones para la ruleta vertical
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

        if (names.length === 0) {
            context.fillStyle = '#000';
            context.fillText('No hay nombres agregados', canvasElement.width / 2, canvasElement.height / 2);
            return;
        }

        const totalHeight = names.length * itemHeight;

        for (let i = 0; i < names.length; i++) {
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

            let color = adjustColorSaturation(colorsVertical[i], saturation);

            context.fillStyle = color;
            context.globalAlpha = opacity;
            context.fillRect(50, yPosition, canvasElement.width - 100, itemHeight - 10);

            context.fillStyle = '#000';
            context.fillText(names[i], canvasElement.width / 2, yPosition + itemHeight / 2 + 5);

            context.globalAlpha = 1;
        }
    }

    function spinVertical() {
        if (isAnimating || names.length === 0) {
            alert('Por favor, añade al menos un nombre antes de iniciar la ruleta.');
            return;
        }
        isAnimating = true;
        startTime = null;
        totalDuration = 5000 + Math.random() * 2000;
        initialSpeed = 50;
        speed = initialSpeed;

        const extraRotations = Math.floor(Math.random() * names.length * 5) + names.length * 5;
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

        const totalHeight = names.length * itemHeight;
        let winnerIndex = Math.floor((-position + canvasBigVertical.height / 2) / itemHeight) % names.length;
        if (winnerIndex < 0) winnerIndex += names.length;

        position = -((winnerIndex * itemHeight) - canvasBigVertical.height / 2 + itemHeight / 2);

        draw(ctxBigVertical, canvasBigVertical, position);

        setTimeout(() => {
            showWinner(names[winnerIndex]);
        }, 1000);
    }

    // Función para mostrar el overlay de giro
    function showSpinOverlay(type) {
        overlay.classList.remove('visible');
        closeButton.classList.add('hidden');
        spinOverlay.classList.add('visible');
        if (type === 'circular') {
            canvasBigCircular.style.display = 'block';
            triangleBig.style.display = 'block';
            canvasBigVertical.style.display = 'none';
            arrowLeft.style.display = 'none';
            arrowRight.style.display = 'none';
        } else if (type === 'vertical') {
            canvasBigVertical.style.display = 'block';
            arrowLeft.style.display = 'block';
            arrowRight.style.display = 'block';
            canvasBigCircular.style.display = 'none';
            triangleBig.style.display = 'none';
        }
    }

    // Función para mostrar el ganador
    function showWinner(winnerName) {
        winnerDiv.textContent = `Ganador: ${winnerName}`;
        overlay.classList.add('visible');
        spinOverlay.classList.remove('visible');
        startConfetti();

        setTimeout(() => {
            closeButton.classList.remove('hidden');
        }, 3000);
    }

    // Funciones auxiliares
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function adjustColorSaturation(rgbString, saturation) {
        const rgbValues = rgbString.match(/\d+/g).map(Number);
        let hsl = rgbToHSL(rgbValues[0], rgbValues[1], rgbValues[2]);
        hsl.s = saturation;
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
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
});
