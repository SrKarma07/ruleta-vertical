var ruletaCircular = (function() {
    let canvasCircular, ctxCircular;
    let canvasBig, ctxBig;

    let names = [];
    let colorsCircular = [];
    let angle = 0; // Ángulo actual de rotación en radianes
    let isAnimating = false;
    let startTime = null;
    let totalDuration = 5000 + Math.random() * 2000;
    let initialAngularSpeed = 0.0;
    let decelerationDuration = 2000;
    let animationFrame = null;

    let items = [];
    let colors = {};
    let overlay, spinOverlay, winnerDiv, closeButton;
    let numWinnersSelect;

    function init(canvas, canvasBigElement, itemsList, colorsMap, numWinnersSelectElement, overlayElement, spinOverlayElement, winnerDivElement, closeButtonElement) {
        canvasCircular = canvas;
        ctxCircular = canvas.getContext("2d");
        canvasBig = canvasBigElement;
        ctxBig = canvasBig.getContext('2d');
        items = itemsList;
        colors = colorsMap;
        numWinnersSelect = numWinnersSelectElement;
        overlay = overlayElement;
        spinOverlay = spinOverlayElement;
        winnerDiv = winnerDivElement;
        closeButton = closeButtonElement;

        adjustCanvasSize();
        names = [...items];
        colorsCircular = names.map((_, index) => {
            const colorObj = getNextColor(index, names.length);
            return `rgb(${colorObj.r},${colorObj.g},${colorObj.b})`;
        });
        draw(ctxCircular, canvasCircular, angle);
        draw(ctxBig, canvasBig, angle);
        window.addEventListener('resize', adjustCanvasSize);
    }

    function adjustCanvasSize() {
        const numItems = items.length;
        const containerWidth = canvasCircular.parentElement.clientWidth;
        const containerHeight = canvasCircular.parentElement.clientHeight;
        const newCanvasSize = Math.min(400, containerWidth, containerHeight);

        // Establecer un tamaño fijo para el canvas grande
        const newCanvasBigSize = 550;

        // Ajustar tamaño del canvas circular
        canvasCircular.width = newCanvasSize;
        canvasCircular.height = newCanvasSize;

        // Ajustar tamaño del canvas grande
        canvasBig.width = newCanvasBigSize;
        canvasBig.height = newCanvasBigSize;

        // Actualizar estilos de tamaño
        canvasCircular.style.width = newCanvasSize + 'px';
        canvasCircular.style.height = newCanvasSize + 'px';
        canvasBig.style.width = newCanvasBigSize + 'px';
        canvasBig.style.height = newCanvasBigSize + 'px';

        // Redibujar en ambos canvas
        draw(ctxCircular, canvasCircular, angle);
        draw(ctxBig, canvasBig, angle);
    }

    function draw(context, canvasElement, currentAngle) {
        const numItems = names.length;
        const radius = canvasElement.width / 2 - 10; // Margen de 10px
        const centerX = canvasElement.width / 2;
        const centerY = canvasElement.height / 2;
        const itemAngle = (2 * Math.PI) / numItems;

        context.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Dibujar cada segmento
        for (let i = 0; i < numItems; i++) {
            const startAngle = currentAngle + i * itemAngle;
            const endAngle = startAngle + itemAngle;

            // Dibujar segmento
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.arc(centerX, centerY, radius, startAngle, endAngle);
            context.closePath();
            context.fillStyle = colorsCircular[i];
            context.fill();
            context.strokeStyle = '#fff';
            context.stroke();

            // Dibujar texto
            context.save();
            context.translate(centerX, centerY);
            context.rotate(startAngle + itemAngle / 2);
            context.textAlign = "right";
            context.fillStyle = "#000";
            context.font = '16px Arial';
            context.fillText(names[i], radius - 10, 10);
            context.restore();
        }
    }

    function spin(numWinners = 1) {
        if (isAnimating || names.length === 0) {
            alert('Por favor, añade al menos un nombre antes de iniciar la ruleta.');
            return;
        }
        isAnimating = true;
        startTime = null;
        totalDuration = 5000 + Math.random() * 2000;

        // Establecer la duración de desaceleración al 70% del tiempo total
        decelerationDuration = totalDuration * 0.7;

        initialAngularSpeed = 0.5; // Velocidad angular inicial en radianes por frame

        // Calcular giros extra para mayor aleatoriedad
        const extraRotations = Math.floor(Math.random() * names.length * 5) + names.length * 5;
        angle -= extraRotations * ((2 * Math.PI) / names.length);

        animationFrame = requestAnimationFrame(animate);
    }

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        let elapsed = timestamp - startTime;

        if (elapsed < totalDuration - decelerationDuration) {
            angle -= initialAngularSpeed;
        } else if (elapsed < totalDuration) {
            let t = (elapsed - (totalDuration - decelerationDuration)) / decelerationDuration;
            let deceleratedSpeed = initialAngularSpeed * easeOutCubic(1 - t);
            angle -= deceleratedSpeed;
        } else {
            finalizeStop();
            return;
        }

        draw(ctxCircular, canvasCircular, angle);
        draw(ctxBig, canvasBig, angle);

        // Actualizar el color de la flecha
        updateIndicatorColor();

        animationFrame = requestAnimationFrame(animate);
    }

    function finalizeStop() {
        isAnimating = false;

        const numWinners = parseInt(numWinnersSelect.value, 10) || 1;
        const totalAngle = 2 * Math.PI;
        const normalizedAngle = angle % totalAngle;
        const winnerIndices = [];

        for (let w = 0; w < numWinners; w++) {
            const currentAngle = normalizedAngle + w * (totalAngle / numWinners);
            const adjustedAngle = (totalAngle - currentAngle + ((totalAngle) / names.length) / 2) % totalAngle;
            const winnerIndex = Math.floor(adjustedAngle / ((2 * Math.PI) / names.length)) % names.length;
            winnerIndices.push(winnerIndex);
        }

        // Alinear el ángulo para que el ganador quede alineado con el indicador
        angle = -winnerIndices[0] * ((2 * Math.PI) / names.length);

        draw(ctxCircular, canvasCircular, angle);
        draw(ctxBig, canvasBig, angle);

        // Actualizar el color de la flecha
        updateIndicatorColor();

        // Mostrar los ganadores
        winnerIndices.forEach(index => {
            window.showWinner(names[index]);
        });
    }

    function updateIndicatorColor() {
        const totalAngle = 2 * Math.PI;
        const normalizedAngle = (totalAngle - (angle % totalAngle)) % totalAngle;
        const segmentAngle = totalAngle / names.length;
        const adjustedAngle = (normalizedAngle + segmentAngle / 2) % totalAngle;
        const segmentIndex = Math.floor(adjustedAngle / segmentAngle) % names.length;
        const currentColor = colorsCircular[segmentIndex];
    
        // Actualizar el color del triángulo
        document.getElementById('triangleBig').style.borderRightColor = currentColor;
    
        // Si lo anterior no funciona, utiliza esta alternativa:
        // document.getElementById('triangleBig').style.borderRight = `50px solid ${currentColor}`;
    
        // Actualizar el color del rectángulo
        document.getElementById('rectangleBig').style.backgroundColor = currentColor;
    }
    
    

    // Función de easing (cúbica)
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Función para obtener el siguiente color (puedes personalizarla)
    function getNextColor(index, total) {
        const hue = index * (360 / total);
        // Generar colores vibrantes usando HSL
        return hslToRgb(hue, 70, 50);
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
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    // Exponer funciones públicas
    return {
        init: init,
        spin: spin
    };
})();
