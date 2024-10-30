// main.js

// Variables y elementos del DOM
const canvas = document.getElementById('ruletaCanvas');
const ctx = canvas.getContext('2d');
const canvasBig = document.getElementById('ruletaCanvasBig');
const ctxBig = canvasBig.getContext('2d');
const overlay = document.getElementById('overlay');
const spinOverlay = document.getElementById('spinOverlay');
const winnerDiv = document.getElementById('winner');
const startButton = document.getElementById('startButton');
const addNameButton = document.getElementById('addNameButton');
const nameInput = document.getElementById('nameInput');
const closeButton = document.getElementById('closeButton');

let names = [];
let colors = []; // Colores asociados a cada nombre
let colorIndex = 0; // Índice para asignar colores predefinidos
let animationFrame = null;
let speed = 0;
let position = 0;
let isAnimating = false;

// Variables para el control de la animación
let startTime = null;
let totalDuration = 5000 + Math.random() * 2000; // Entre 5 y 7 segundos
let initialSpeed = 0;
let decelerationDuration = 2000; // Duración de la desaceleración en ms

let itemHeight = 60; // Altura de cada elemento
const maxCanvasHeight = 300; // Altura máxima del canvas pequeño
const maxCanvasBigHeight = 400; // Altura máxima del canvas grande

// Colores predefinidos para los nombres
const predefinedColors = [
    '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
];

// Función para ajustar el tamaño del canvas
function adjustCanvasSize() {
    const totalItemsHeight = names.length * itemHeight;
    const newCanvasHeight = Math.min(totalItemsHeight, maxCanvasHeight);
    const newCanvasBigHeight = Math.min(totalItemsHeight, maxCanvasBigHeight);

    canvas.height = newCanvasHeight;
    canvasBig.height = newCanvasBigHeight;

    // Ajustar el tamaño del elemento canvas en el DOM
    canvas.style.height = newCanvasHeight + 'px';
    canvasBig.style.height = newCanvasBigHeight + 'px';
}

// Función para dibujar la ruleta
function draw(context, canvasElement, posY) {
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
        let yPosition = ((posY + i * itemHeight) % totalHeight + totalHeight) % totalHeight;

        // Calcular opacidad y saturación basadas en la posición
        const centerY = canvasElement.height / 2;
        const distanceFromCenter = Math.abs(yPosition - centerY);
        const maxDistance = canvasElement.height / 2;

        let opacity = 1 - (distanceFromCenter / maxDistance);
        opacity = Math.max(0, Math.min(1, opacity));

        let saturation = opacity * 100; // Saturación del color

        // Usar el color asignado al nombre con saturación ajustada
        let color = adjustColorSaturation(colors[i], saturation);

        // Dibujar el rectángulo con opacidad ajustada
        context.fillStyle = color;
        context.globalAlpha = opacity;
        context.fillRect(50, yPosition - itemHeight / 2, canvasElement.width - 100, itemHeight - 10);

        // Dibujar el nombre
        context.fillStyle = '#000';
        context.fillText(names[i], canvasElement.width / 2, yPosition + 5);

        context.globalAlpha = 1; // Restablecer opacidad
    }
}

// Función para ajustar la saturación del color
function adjustColorSaturation(hex, saturation) {
    // Convertir HEX a HSL
    let hsl = hexToHSL(hex);
    hsl.s = saturation;
    // Convertir de vuelta a HEX
    return hslToHex(hsl);
}

// Convertir HEX a HSL
function hexToHSL(H) {
    // Convertir de hex a RGB
    let r = 0, g = 0, b = 0;
    if (H.length == 7) {
        r = parseInt(H.substring(1, 3), 16);
        g = parseInt(H.substring(3, 5), 16);
        b = parseInt(H.substring(5, 7), 16);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    // Encontrar el mínimo y máximo de RGB
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // Es un gris
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return {h: h * 360, s: s * 100, l: l * 100};
}

// Convertir HSL a HEX
function hslToHex(hsl) {
    let {h, s, l} = hsl;
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let hh = h / 60;
    let x = c * (1 - Math.abs(hh % 2 - 1));
    let r = 0, g = 0, b = 0;

    if (hh >= 0 && hh < 1) {
        r = c; g = x; b = 0;
    } else if (hh >= 1 && hh < 2) {
        r = x; g = c; b = 0;
    } else if (hh >= 2 && hh < 3) {
        r = 0; g = c; b = x;
    } else if (hh >= 3 && hh < 4) {
        r = 0; g = x; b = c;
    } else if (hh >= 4 && hh < 5) {
        r = x; g = 0; b = c;
    } else if (hh >= 5 && hh < 6) {
        r = c; g = 0; b = x;
    }

    let m = l - c/2;
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Dibujo inicial
adjustCanvasSize();
draw(ctx, canvas, position);

// Eventos de los botones
addNameButton.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name) {
        names.push(name);
        colors.push(predefinedColors[colorIndex % predefinedColors.length]); // Asignar color predefinido al nombre
        colorIndex++;
        nameInput.value = '';

        adjustCanvasSize(); // Ajustar el tamaño del canvas
        updatePosition(); // Actualizar posición al agregar un nuevo nombre
        draw(ctx, canvas, position);
    }
});

nameInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        addNameButton.click();
    }
});

startButton.addEventListener('click', () => {
    startAnimation();
});

closeButton.addEventListener('click', () => {
    overlay.classList.remove('visible');
    closeButton.classList.add('hidden');
    stopConfetti();
    // No reiniciar la posición de la ruleta para mantener el estado final
    // draw(ctx, canvas, position); // Ya está actualizada
});

// Actualizar posición al agregar nombres
function updatePosition() {
    const totalItemsHeight = names.length * itemHeight;
    const canvasHeight = canvas.height;

    if (totalItemsHeight > canvasHeight) {
        // Si los elementos exceden la altura del canvas, desplazar hacia arriba
        position -= itemHeight;
    } else {
        // Si caben en el canvas, centrar los elementos
        position = (canvasHeight - totalItemsHeight) / 2;
    }
}
