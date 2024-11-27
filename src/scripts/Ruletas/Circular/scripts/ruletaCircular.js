// ruletaCircular.js

var ruletaCircular = (function() {
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

    let spinResolve; // Resolver de la promesa

    function init(canvasBigElement, itemsList, colorsMap, numWinnersSelectElement, overlayElement, spinOverlayElement, winnerDivElement, closeButtonElement) {
        canvasBig = canvasBigElement;
        ctxBig = canvasBig.getContext('2d');
        items = itemsList;
        colors = colorsMap;
        numWinnersSelect = numWinnersSelectElement;
        overlay = overlayElement;
        spinOverlay = spinOverlayElement;
        winnerDiv = winnerDivElement;
        closeButton = closeButtonElement;

        names = [...items];
        colorsCircular = names.map((_, index) => {
            const colorObj = getNextColor(index, names.length);
            return `rgb(${colorObj.r},${colorObj.g},${colorObj.b})`;
        });

        // Ajustar el tamaño después de un pequeño retraso para asegurar que el canvas esté visible
        setTimeout(() => {
            adjustCanvasSize();
        }, 100);

        window.addEventListener('resize', adjustCanvasSize);
    }

    function adjustCanvasSize() {
        const parent = canvasBig.parentElement; // Parent is .roulette-wrapper
        const container = parent.parentElement; // .ruleta-container

        // Calcular el tamaño disponible teniendo en cuenta el espacio para el indicador
        const availableWidth = container.offsetWidth - parent.querySelector('#indicator').offsetWidth - 32; // 32px de padding/margen
        const availableHeight = window.innerHeight - container.offsetTop - 200; // Ajusta según el espacio del footer y otros elementos

        // Determinar el tamaño máximo que puede ocupar el canvas sin invadir el espacio del indicador
        const size = Math.min(parent.offsetWidth, availableHeight * 0.9, availableWidth * 1.0); // Ajusta el tamaño proporcionalmente

        if (size <= 0) return; // Evitar tamaños negativos o cero

        canvasBig.width = size * window.devicePixelRatio;
        canvasBig.height = size * window.devicePixelRatio;

        canvasBig.style.width = size + 'px';
        canvasBig.style.height = size + 'px';

        ctxBig.setTransform(1, 0, 0, 1, 0, 0); // Reset scaling
        ctxBig.scale(window.devicePixelRatio, window.devicePixelRatio);

        draw(ctxBig, canvasBig, angle);
    }

    function draw(context, canvasElement, currentAngle) {
        const numItems = names.length;
        const radius = canvasElement.width / (2 * window.devicePixelRatio) - 10; // Margen de 10px
        const centerX = canvasElement.width / (2 * window.devicePixelRatio);
        const centerY = canvasElement.height / (2 * window.devicePixelRatio);
        const itemAngle = (2 * Math.PI) / numItems;

        context.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Evitar radio negativo
        if (radius <= 0) return;

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
            context.font = `${Math.max(14, radius / 10)}px Arial`; // Ajusta el tamaño del texto proporcionalmente
            context.fillText(names[i], radius - 10, 10);
            context.restore();
        }
    }

    function spin() {
        return new Promise((resolve, reject) => {
            if (isAnimating || names.length === 0) {
                alert('Por favor, añade al menos un nombre antes de iniciar la ruleta.');
                reject('Animación en progreso o sin elementos.');
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

            spinResolve = resolve; // Guardar el resolver para usarlo en finalizeStop

            animationFrame = requestAnimationFrame(animate.bind(this));
        });
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

        draw(ctxBig, canvasBig, angle);

        // Actualizar el color del indicador
        updateIndicatorColor();

        animationFrame = requestAnimationFrame(animate.bind(this));
    }

    function finalizeStop() {
        isAnimating = false;

        const totalAngle = 2 * Math.PI;
        const normalizedAngle = angle % totalAngle;
        const itemAngle = totalAngle / names.length;

        // Compute the single winner
        const currentAngle = normalizedAngle;
        const adjustedAngle = (totalAngle - currentAngle + (itemAngle / 2)) % totalAngle;
        const winnerIndex = Math.floor(adjustedAngle / itemAngle) % names.length;

        // Alinear el ángulo para que el ganador quede alineado con el indicador
        angle = -winnerIndex * itemAngle;

        draw(ctxBig, canvasBig, angle);

        // Actualizar el color del indicador
        updateIndicatorColor();

        // Obtener el ganador
        const winner = names[winnerIndex];

        // Mostrar el ganador
        window.showWinner(winner);

        // Llamar al resolver de la promesa con el ganador
        if (typeof spinResolve === 'function') {
            spinResolve(winner);
        }
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
