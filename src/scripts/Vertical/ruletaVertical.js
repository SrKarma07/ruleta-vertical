var ruletaVertical = (function() {
    let canvasBigVertical, ctxBigVertical;
    let triangleLeftBig, triangleRightBig;

    let names = [];
    let colorsVertical = [];
    let position = 0;
    let isAnimating = false;
    let startTime = null;
    let totalDuration = 5000 + Math.random() * 2000;
    let initialSpeed = 0;
    let decelerationDuration = 2000;
    let itemHeight = 60;
    const maxCanvasBigHeight = 400;
    let animationFrame = null;

    let items = [];
    let colors = {};
    let overlay, spinOverlay, winnerDiv, closeButton;
    let numWinnersSelect;

    function init(canvasBig, itemsList, colorsMap, numWinnersSelectElement, overlayElement, spinOverlayElement, winnerDivElement, closeButtonElement) {
        canvasBigVertical = canvasBig;
        ctxBigVertical = canvasBig.getContext('2d');
        items = itemsList;
        colors = colorsMap;
        numWinnersSelect = numWinnersSelectElement;
        overlay = overlayElement;
        spinOverlay = spinOverlayElement;
        winnerDiv = winnerDivElement;
        closeButton = closeButtonElement;

        // Obtener referencias a los triángulos
        triangleLeftBig = document.getElementById('triangleLeftBig');
        triangleRightBig = document.getElementById('triangleRightBig');

        adjustCanvasSize();
        names = [...items];
        colorsVertical = names.map((_, index) => {
            const colorObj = getNextColor(index, names.length);
            return `rgb(${colorObj.r},${colorObj.g},${colorObj.b})`;
        });
        draw(ctxBigVertical, canvasBigVertical, position);
        window.addEventListener('resize', adjustCanvasSize);
    }

    function adjustCanvasSize() {
        const totalItemsHeight = items.length * itemHeight;
        const newCanvasBigHeight = Math.min(totalItemsHeight, maxCanvasBigHeight);

        canvasBigVertical.width = 400; // Aseguramos un ancho fijo
        canvasBigVertical.height = newCanvasBigHeight;
        canvasBigVertical.style.width = '400px';
        canvasBigVertical.style.height = newCanvasBigHeight + 'px';

        // Centrar los triángulos verticalmente dentro del contenedor
        triangleLeftBig.style.top = '52%';
        triangleRightBig.style.top = '37%';


        updatePosition();
        draw(ctxBigVertical, canvasBigVertical, position);
    }

    function updatePosition() {
        const totalItemsHeight = items.length * itemHeight;
        const canvasHeight = canvasBigVertical.height;

        if (totalItemsHeight > canvasHeight) {
            position -= itemHeight;
        } else {
            position = 0;
        }
    }

    function draw(context, canvasElement, posY) {
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
        context.font = '2.5vh Arial';
        context.textAlign = 'center';

        if (names.length === 0) {
            context.fillStyle = '#000';
            context.fillText('No hay nombres agregados', canvasElement.width / 2, canvasElement.height / 2);
            return;
        }

        const totalHeight = names.length * itemHeight;

        for (let i = 0; i < names.length; i++) {
            let yPosition = posY + i * itemHeight;

            // Ajustar para lista repetida
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

    function spin() {
        if (isAnimating || names.length === 0) {
            alert('Por favor, añade al menos un nombre antes de iniciar la ruleta.');
            return;
        }
        isAnimating = true;
        startTime = null;
        totalDuration = 5000 + Math.random() * 2000;
        initialSpeed = 50;

        const extraRotations = Math.floor(Math.random() * names.length * 5) + names.length * 5;
        position -= extraRotations * itemHeight;

        animationFrame = requestAnimationFrame(function(timestamp) {
            animate(timestamp, initialSpeed);
        });
    }

    function animate(timestamp, speed) {
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
        updateIndicatorColor(); // Actualizar el color de los triángulos

        animationFrame = requestAnimationFrame(function(timestamp) {
            animate(timestamp, speed);
        });
    }

    function finalizeStop() {
        isAnimating = false;

        const totalHeight = names.length * itemHeight;
        let winnerIndex = Math.floor((-position + canvasBigVertical.height / 2) / itemHeight) % names.length;
        if (winnerIndex < 0) winnerIndex += names.length;

        position = -((winnerIndex * itemHeight) - canvasBigVertical.height / 2 + itemHeight / 2);
        draw(ctxBigVertical, canvasBigVertical, position);

        updateIndicatorColor(); // Actualizar el color de los triángulos

        // Mostrar el ganador
        window.showWinner(names[winnerIndex]);
    }

    function updateIndicatorColor() {
        const totalItemsHeight = names.length * itemHeight;
        const normalizedPosition = (position % totalItemsHeight + totalItemsHeight) % totalItemsHeight;
        const index = Math.floor((normalizedPosition + canvasBigVertical.height / 2) / itemHeight) % names.length;
        const currentColor = colorsVertical[index];

        // Actualizar el color de los triángulos
        triangleLeftBig.style.borderRightColor = currentColor;
        triangleRightBig.style.borderLeftColor = currentColor;
    }

    // Función de easing (cúbica)
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Función para obtener el siguiente color
    function getNextColor(index, totalItems) {
        const hue = (index / totalItems) * 360;
        const { r, g, b } = hslToRgb(hue, 100, 50);
        return { r, g, b };
    }

    // Función para convertir HSL a RGB
    function hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // Tono gris
        } else {
            const hue2rgb = function(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    // Función para ajustar la saturación del color (si es necesario)
    function adjustColorSaturation(color, saturation) {
        // Implementa la lógica para ajustar la saturación si lo deseas
        return color; // Retorna el color sin cambios por defecto
    }

    // Exponer funciones públicas
    return {
        init: init,
        spin: spin
    };
})();
