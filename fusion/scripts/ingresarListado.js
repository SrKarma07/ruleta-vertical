// ingresarListado.js

// Variables para cargar archivos
let extractedNames = [];

// Funciones para cargar archivos (Excel y PDF)
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
            const pageText = textItems.map(item => item.str).join(' ');
            fullText += pageText + ' ';
        }

        fullText = fullText.replace(/\s+/g, ' ').trim();
        const namePattern = /\d+\.\s*/g;
        const splitText = fullText.split(namePattern).filter(s => s.trim() !== '');

        splitText.forEach(name => {
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
    return /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(text) && text.trim().length > 1;
}

function formatName(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
