// Author: Jeremy David Torres Páez 
// Last Modified: 2024-10-14

// Configurar la ruta del worker de pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

let items = [];
let colors = {};
let currentDeg = 0;
let step = 0;
let speed = 0;
let isSpinning = false;
let extractedNames = [];
let winners = [];

// Canvas y contexto de la ruleta
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Configurar tamaño inicial del canvas
setCanvasSize();

// Eventos de botones
document.getElementById("spin-btn").addEventListener("click", spin);
document.getElementById("addStudentBtn").addEventListener("click", addStudent);
document.querySelectorAll('#ranges button[data-range]').forEach(button => {
    button.addEventListener('click', handleRangeButtonClick);
});
document.getElementById('add-custom-range').addEventListener('click', handleCustomRangeButtonClick);
document.getElementById('btnRangos').addEventListener('click', () => showSection('ranges'));
document.getElementById('btnIntroduceNombres').addEventListener('click', () => showSection('inputSection'));
document.getElementById('btnAddList').addEventListener('click', showUploadSection);
document.getElementById('uploadBtn').addEventListener('click', handleFileUpload);
document.getElementById('addFromFileBtn').addEventListener('click', addExtractedNamesToWheel);
document.getElementById('clearWheelBtn').addEventListener('click', () => {
    clearWheel();
    setCanvasSize();
});
document.getElementById('newWheelBtn').addEventListener('click', () => {
    resetApplication();
    setCanvasSize();
});

window.addEventListener('resize', resizeCanvas);

// Configurar el tamaño del canvas para asegurar calidad y nitidez
function setCanvasSize() {
    const scale = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * scale;
    canvas.height = canvas.offsetHeight * scale;
    ctx.scale(scale, scale);
    centerX = canvas.offsetWidth / 2;
    centerY = canvas.offsetHeight / 2;
    radius = Math.min(centerX, centerY);
    createWheel();
}

// Redimensiona el canvas cuando se cambia el tamaño de la ventana
function resizeCanvas() {
    setCanvasSize();
}

function addStudent() {
    const input = document.getElementById("studentName");
    const name = input.value.trim();
    if (!name) {
        alert("Por favor, ingrese un nombre.");
        return;
    }
    if (items.includes(name)) {
        alert("Este nombre ya está en la ruleta.");
        return;
    }
    items.push(name);
    colors[name] = getNextColor(items.length - 1);
    input.value = "";
    createWheel();
    updateNamesList();
}

function handleRangeButtonClick(event) {
    const range = parseInt(event.target.getAttribute('data-range'), 10);
    if (!isNaN(range)) {
        items = Array.from({ length: range }, (_, i) => (i + 1).toString());
        items.forEach((item, index) => {
            colors[item] = getNextColor(index);
        });
        createWheel();
        updateNamesList();
    }
}

function handleCustomRangeButtonClick() {
    const customRangeInput = document.getElementById('custom-range');
    const customRange = parseInt(customRangeInput.value, 10);
    if (isNaN(customRange) || customRange <= 0) {
        alert('Por favor, ingrese un rango válido.');
        return;
    }
    items = Array.from({ length: customRange }, (_, i) => (i + 1).toString());
    items.forEach((item, index) => {
        colors[item] = getNextColor(index);
    });
    createWheel();
    updateNamesList();
}

function showSection(sectionId) {
    document.getElementById('ranges').classList.add('d-none');
    document.getElementById('inputSection').classList.add('d-none');
    document.getElementById('uploadSection').classList.add('d-none');
    document.getElementById(sectionId).classList.remove('d-none');
    items = [];
    colors = {};
    createWheel();
    updateNamesList();
}

function showUploadSection() {
    showSection('uploadSection');
    document.getElementById('addFromFileBtn').classList.add('d-none');
    document.getElementById('fileInput').value = '';
}

function createWheel() {
    if (items.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    step = 360 / items.length;
    drawWheel();
}

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#212121';
    ctx.fill();

    let startDeg = currentDeg;
    items.forEach((item) => {
        const endDeg = startDeg + step;
        const color = colors[item];
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, toRad(startDeg), toRad(endDeg));
        ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(toRad((startDeg + endDeg) / 2));
        ctx.textAlign = "center";
        ctx.fillStyle = getContrastColor(color);
        ctx.font = `${Math.min(radius / 10, 16)}px sans-serif`;
        ctx.translate(radius - 40, 0);
        ctx.rotate(-toRad((startDeg + endDeg) / 2));
        ctx.fillText(item.length > 15 ? `${item.slice(0, 13)}...` : item, 0, 0);
        ctx.restore();

        startDeg += step;
    });
}

function spin() {
    if (isSpinning || items.length === 0) return;

    const numWinners = parseInt(document.getElementById('numWinners').value, 10);
    winners = []; // Reiniciamos la lista de ganadores
    let spinsRemaining = numWinners;

    function spinAndSelect() {
        if (spinsRemaining > 0 && items.length > 0) {
            const randomTurns = Math.floor(Math.random() * 11) + 10;
            const winnerIndex = Math.floor(Math.random() * items.length);
            const degreesPerItem = 360 / items.length;
            const winnerAngle = winnerIndex * degreesPerItem;
            const finalRotation = randomTurns * 360 + (360 - winnerAngle - degreesPerItem / 2);

            isSpinning = true;
            speed = finalRotation / (7 * 60);

            animateSpin(() => {
                updateWinner(numWinners);
                spinsRemaining--;
                if (spinsRemaining > 0) {
                    spinAndSelect();
                } else {
                    isSpinning = false;
                }
            }, finalRotation);
        }
    }

    spinAndSelect();
}

function animateSpin(callback) {
    if (speed > 0) {
        currentDeg = (currentDeg + speed) % 360;
        speed *= 0.985;
        if (speed < 0.2) {
            speed = 0;
            callback();
        } else {
            drawWheel();
            requestAnimationFrame(() => animateSpin(callback));
        }
    }
}

function updateWinner(numWinners) {
    const totalDeg = currentDeg % 360;
    const winnerIndex = Math.floor((360 - totalDeg) / step) % items.length;
    const winnerName = items[winnerIndex];

    if (!winners.includes(winnerName)) {
        winners.push(winnerName);
        document.getElementById('winner').textContent = `Ganador${winners.length > 1 ? 'es' : ''}: ${winners.join(', ')}`;
        if (numWinners > 1) {
            items.splice(winnerIndex, 1);
            createWheel();
            updateNamesList();
        }
    }
}

function getNextColor(index) {
    const hue = (index * 137.5) % 360;
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

function toRad(deg) {
    return deg * (Math.PI / 180);
}

function getContrastColor({ r, g, b }) {
    return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#000" : "#fff";
}

// Control de la carga de archivos

function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Por favor, seleccione un archivo.');
        return;
    }

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        readExcelFile(file);
    } else if (fileName.endsWith('.pdf')) {
        readPDFFile(file);
    } else {
        alert('Por favor, cargue un archivo Excel (.xlsx, .xls) o PDF (.pdf).');
    }
}

function readExcelFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
        extractedNames = extractNamesFromData(jsonData);
        alert(`${extractedNames.length} nombres extraídos. Presione "Agregar" para añadirlos a la ruleta.`);
        document.getElementById('addFromFileBtn').classList.remove('d-none');
    };
    reader.readAsArrayBuffer(file);
}

function readPDFFile(file) {
    const reader = new FileReader();
    reader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        extractedNames = [];
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items;

            // Concatenamos todos los textos de la página
            const pageText = textItems.map(item => item.str).join(' ');
            fullText += pageText + ' ';
        }

        // Procesar el texto completo para extraer los nombres
        // Eliminar espacios adicionales
        fullText = fullText.replace(/\s+/g, ' ').trim();

        // Utilizar expresión regular para dividir el texto en nombres
        // Basado en el patrón de números seguidos de punto y espacio
        const namePattern = /\d+\.\s*/g;
        const splitText = fullText.split(namePattern).filter(s => s.trim() !== '');

        splitText.forEach(name => {
            // Eliminar números y puntos que puedan quedar al inicio
            name = name.replace(/^\d+\.\s*/, '').trim();
            const formattedName = formatName(name);
            if (isName(formattedName)) {
                extractedNames.push(formattedName);
            }
        });

        alert(`${extractedNames.length} nombres extraídos. Presione "Agregar" para añadirlos a la ruleta.`);
        document.getElementById('addFromFileBtn').classList.remove('d-none');
    };
    reader.readAsArrayBuffer(file);
}

function addExtractedNamesToWheel() {
    addNamesToWheel(extractedNames);
    document.getElementById('addFromFileBtn').classList.add('d-none');
}

function extractNamesFromData(data) {
    const names = [];
    data.forEach((row) => {
        row.forEach((cell) => {
            if (typeof cell === 'string') {
                const cellContent = cell.trim();
                if (cellContent) {
                    const nameParts = cellContent.split(/\r?\n/);
                    nameParts.forEach(part => {
                        const formattedName = formatName(part);
                        if (isName(formattedName)) {
                            names.push(formattedName);
                        }
                    });
                }
            }
        });
    });
    return names;
}

function isName(text) {
    // Permite letras, espacios, tildes, diéresis y la letra ñ
    return /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(text) && text.trim().length > 1;
}

function formatName(text) {
    // Elimina espacios extra y pone en mayúscula la primera letra de cada palabra
    return text
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function addNamesToWheel(names) {
    names.forEach((name) => {
        if (!items.includes(name)) {
            items.push(name);
            colors[name] = getNextColor(items.length - 1);
        }
    });
    createWheel();
    updateNamesList();
    alert(`${names.length} nombres añadidos a la ruleta.`);
}

function updateNamesList() {
    const namesList = document.getElementById('namesList');
    namesList.innerHTML = '';

    if (items.length > 0) {
        items.forEach(name => {
            const nameItem = document.createElement('div');
            nameItem.className = 'name-item';
            nameItem.textContent = name;

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'X';
            removeBtn.className = 'remove-btn';
            removeBtn.onclick = () => {
                items = items.filter(n => n !== name);
                createWheel();
                updateNamesList();
            };

            nameItem.appendChild(removeBtn);
            namesList.appendChild(nameItem);
        });

        namesList.classList.remove('d-none');
    } else {
        namesList.classList.add('d-none');
    }
}

function clearWheel() {
    if (confirm('¿Está seguro de que desea limpiar la ruleta?')) {
        items = [];
        colors = {};
        createWheel();
        updateNamesList();
        document.getElementById('winner').textContent = 'Ganador: ';
    }
}

function resetApplication() {
    location.reload();
}
