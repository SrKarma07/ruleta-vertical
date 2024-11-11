// main.js

document.addEventListener('DOMContentLoaded', function() {
    // Variables y elementos del DOM
    const rouletteSelection = document.getElementById('roulette-selection');
    const rouletteConfiguration = document.getElementById('roulette-configuration');
    const rouletteInterface = document.getElementById('roulette-interface');

    const selectCircularRouletteBtn = document.getElementById('selectCircularRoulette');
    const selectVerticalRouletteBtn = document.getElementById('selectVerticalRoulette');
    const startRaffleBtn = document.getElementById('startRaffleBtn');

    const spinOverlay = document.getElementById('spinOverlay');
    const overlay = document.getElementById('overlay');
    const winnerDiv = document.getElementById('winner');
    const winnerText = document.getElementById('winnerText');
    const closeButton = document.getElementById('closeButton');

    const newRaffleBtn = document.getElementById('newRaffleBtn');
    const spinAgainBtn = document.getElementById('spinAgainBtn');

    const numWinnersSelect = document.getElementById('numWinners');

    const startSpinBtn = document.getElementById('startSpinBtn');

    // Variables
    let currentRoulette = ''; // 'circular' o 'vertical'

    // Inicializar
    updateNamesList();

    // Eventos de botones
    selectCircularRouletteBtn.addEventListener('click', () => selectRoulette('circular'));
    selectVerticalRouletteBtn.addEventListener('click', () => selectRoulette('vertical'));
    startRaffleBtn.addEventListener('click', goToRouletteInterface);

    spinAgainBtn.addEventListener('click', spinAgain);
    newRaffleBtn.addEventListener('click', resetApplication);
    closeButton.addEventListener('click', closeOverlay);
    startSpinBtn.addEventListener('click', startSpin);

    // Función para seleccionar el tipo de ruleta
    function selectRoulette(type) {
        currentRoulette = type;
        rouletteSelection.classList.add('d-none');
        rouletteConfiguration.classList.remove('d-none');
    }

    // Función para ir a la interfaz de la ruleta
    function goToRouletteInterface() {
        const items = dataManager.getItems();
        if (items.length === 0) {
            alert('Por favor, agregue participantes antes de continuar.');
            return;
        }
        rouletteConfiguration.classList.add('d-none');
        rouletteInterface.classList.remove('d-none');
        if (currentRoulette === 'circular') {
            document.getElementById('circular-roulette').classList.remove('d-none');
            document.getElementById('vertical-roulette').classList.add('d-none');

            ruletaCircular.init(
                document.getElementById("canvas"),
                document.getElementById('canvasBig'),
                dataManager.getItems(),
                dataManager.getColors(),
                numWinnersSelect,
                overlay,
                spinOverlay,
                winnerDiv,
                closeButton,
                winnerText
            );
        } else {
            document.getElementById('circular-roulette').classList.add('d-none');
            document.getElementById('vertical-roulette').classList.remove('d-none');

            ruletaVertical.init(
                document.getElementById('ruletaCanvas'),
                document.getElementById('ruletaCanvasBig'),
                dataManager.getItems(),
                dataManager.getColors(),
                numWinnersSelect,
                overlay,
                spinOverlay,
                winnerDiv,
                closeButton,
                winnerText
            );
        }
    }

    // Función para iniciar el sorteo desde el overlay
    function startSpin() {
        if (currentRoulette === 'circular') {
            ruletaCircular.spin(parseInt(numWinnersSelect.value, 10));
        } else if (currentRoulette === 'vertical') {
            ruletaVertical.spin();
        }
    }

    // Función para girar de nuevo sin reiniciar todo
    function spinAgain() {
        overlay.classList.remove('visible');
        closeButton.classList.add('hidden');
        if (currentRoulette === 'circular') {
            ruletaCircular.spin(parseInt(numWinnersSelect.value, 10));
        } else if (currentRoulette === 'vertical') {
            ruletaVertical.spin();
        }
    }

    // Función para cerrar el overlay
    function closeOverlay() {
        overlay.classList.remove('visible');
        closeButton.classList.add('hidden');
        stopConfetti();
    }

    // Función para mostrar el ganador
    function showWinner(winnerName) {
        winnerDiv.textContent = `Ganador: ${winnerName}`;
        overlay.classList.add('visible');
        spinOverlay.classList.remove('active');

        setTimeout(() => {
            startConfetti(); // Iniciar el confetti después de hacer visible el overlay
        }, 500); // Asegurarnos de que el overlay esté visible antes de empezar el confetti

        setTimeout(() => {
            closeButton.classList.remove('hidden');
        }, 3000);
    }

    // Función para mostrar el overlay de giro
    function showSpinOverlay(type) {
        overlay.classList.remove('visible');
        closeButton.classList.add('hidden');
        spinOverlay.classList.add('active'); // Activar el overlay

        if (type === 'circular') {
            // Mostrar spinOverlayCircular y ocultar spinOverlayVertical
            document.getElementById('spinOverlayCircular').classList.add('active');
            document.getElementById('spinOverlayVertical').classList.remove('active');
            // Mostrar canvasBig y ocultar ruletaCanvasBig
            document.getElementById('canvasBig').style.display = 'block';
            document.getElementById('ruletaCanvasBig').style.display = 'none';
            // Mostrar triangleBig y ocultar triángulos laterales
            document.getElementById('triangleBig').style.display = 'block';
            document.querySelectorAll('.triangle-side').forEach(triangle => {
                triangle.style.display = 'none';
            });
        } else if (type === 'vertical') {
            // Mostrar spinOverlayVertical y ocultar spinOverlayCircular
            document.getElementById('spinOverlayVertical').classList.add('active');
            document.getElementById('spinOverlayCircular').classList.remove('active');
            // Mostrar ruletaCanvasBig y ocultar canvasBig
            document.getElementById('ruletaCanvasBig').style.display = 'block';
            document.getElementById('canvasBig').style.display = 'none';
            // Mostrar triángulos laterales y ocultar triangleBig
            document.getElementById('triangleBig').style.display = 'none';
            document.querySelectorAll('.triangle-side').forEach(triangle => {
                triangle.style.display = 'block';
            });
        }
    }

    // Función para reiniciar la aplicación
    function resetApplication() {
        location.reload();
    }

    // Exponer funciones globalmente para que las ruletas puedan llamarlas
    window.showWinner = showWinner;
    window.showSpinOverlay = showSpinOverlay;
});
