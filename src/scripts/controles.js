// Variables y elementos del DOM
const numWinnersSelect = document.getElementById('numWinners');
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
document.getElementById('clearWheelBtn').addEventListener('click', clearWheel);
document.getElementById('newWheelBtn').addEventListener('click', resetApplication);

// Variables generales
let extractedNames = [];

// Funciones para controles
function addStudent() {
    const input = document.getElementById("studentName");
    const name = input.value.trim();
    if (!name) {
        alert("Por favor, ingrese un nombre.");
        return;
    }
    const items = dataManager.getItems();
    if (items.includes(name)) {
        alert("Este nombre ya está en la ruleta.");
        return;
    }
    dataManager.addItem(name);
    const colors = dataManager.getColors();
    colors[name] = getNextColor(items.length - 1, items.length);
    dataManager.setColors(colors);
    input.value = "";
    updateNamesList();
}

function handleRangeButtonClick(event) {
    const range = parseInt(event.target.getAttribute('data-range'), 10);
    if (!isNaN(range)) {
        const items = Array.from({ length: range }, (_, i) => (i + 1).toString());
        dataManager.clearData(); // Limpia datos existentes
        items.forEach((item, index) => {
            dataManager.addItem(item);
        });
        const colors = {};
        items.forEach((item, index) => {
            colors[item] = getNextColor(index, items.length);
        });
        dataManager.setColors(colors);
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
    const items = Array.from({ length: customRange }, (_, i) => (i + 1).toString());
    dataManager.clearData(); // Limpia datos existentes
    items.forEach((item, index) => {
        dataManager.addItem(item);
    });
    const colors = {};
    items.forEach((item, index) => {
        colors[item] = getNextColor(index, items.length);
    });
    dataManager.setColors(colors);
    updateNamesList();
}

function showSection(sectionId) {
    // Limpia datos existentes al cambiar de sección
    dataManager.clearData();
    document.getElementById('ranges').classList.add('d-none');
    document.getElementById('inputSection').classList.add('d-none');
    document.getElementById('uploadSection').classList.add('d-none');
    document.getElementById(sectionId).classList.remove('d-none');
    updateNamesList();
}

function showUploadSection() {
    showSection('uploadSection');
    document.getElementById('addFromFileBtn').classList.add('d-none');
    document.getElementById('fileInput').value = '';
}

function updateNamesList() {
    const namesList = document.getElementById('namesList');
    namesList.innerHTML = '';
    const items = dataManager.getItems();

    if (items.length > 0) {
        items.forEach((name, index) => {
            const nameItem = document.createElement('div');
            nameItem.className = 'name-item';
            nameItem.textContent = name;

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'X';
            removeBtn.className = 'remove-btn';
            removeBtn.onclick = () => {
                dataManager.removeItem(name);
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

function addNamesToWheel(namesArray) {
    const items = dataManager.getItems();
    const colors = dataManager.getColors();
    namesArray.forEach((name) => {
        if (!items.includes(name)) {
            dataManager.addItem(name);
            colors[name] = getNextColor(items.length - 1, items.length);
        }
    });
    dataManager.setColors(colors);
    updateNamesList();
    alert(`${namesArray.length} nombres añadidos a la ruleta.`);
}
function clearWheel() {
    if (confirm('¿Está seguro de que desea limpiar la ruleta?')) {
        dataManager.clearData();
        updateNamesList();
        winnerText.textContent = 'Ganador: ';
    }
}

function resetApplication() {
    location.reload();
}

window.updateNamesList = updateNamesList;