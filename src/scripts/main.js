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
    const closeButton = document.getElementById('closeButton');

    const newRaffleBtn = document.getElementById('newRaffleBtn');
    const spinAgainBtn = document.getElementById('spinAgainBtn');

    const numWinnersSelect = document.getElementById('numWinners');

    // Obtener ambos botones de inicio de sorteo
    const startSpinBtnCircular = document.getElementById('startSpinBtnCircular');
    const startSpinBtnVertical = document.getElementById('startSpinBtnVertical');

    // Variables
    let currentRoulette = ''; // 'circular' o 'vertical'

    // Inicializar
    updateNamesList(); // Asegúrate de que esta función esté definida en tus scripts

    // Eventos de botones
    selectCircularRouletteBtn.addEventListener('click', () => selectRoulette('circular'));
    selectVerticalRouletteBtn.addEventListener('click', () => selectRoulette('vertical'));
    startRaffleBtn.addEventListener('click', goToRouletteInterface);

    spinAgainBtn.addEventListener('click', spinAgain);
    newRaffleBtn.addEventListener('click', resetApplication);
    closeButton.addEventListener('click', closeOverlay);
    startSpinBtnCircular.addEventListener('click', startSpin);
    startSpinBtnVertical.addEventListener('click', startSpin);

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
                closeButton
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
                closeButton
            );
        }
        showSpinOverlay(currentRoulette);
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
        overlay.classList.add('d-none');
        overlay.classList.remove('d-flex');
        closeButton.classList.add('hidden');
        stopConfetti(); // Asegúrate de que esta función esté definida en tus scripts
        showSpinOverlay(currentRoulette);
    }

    // Función para cerrar el overlay
    function closeOverlay() {
        overlay.classList.add('d-none');
        overlay.classList.remove('d-flex');
        closeButton.classList.add('hidden');
        stopConfetti(); // Asegúrate de que esta función esté definida en tus scripts
    }

    // Función para mostrar el ganador
    function showWinner(winnerName) {
        console.log("showWinner called with:", winnerName); // Depuración
        winnerDiv.textContent = `${winnerName}`;
        overlay.classList.remove('d-none');
        overlay.classList.add('d-flex');
        spinOverlay.classList.add('d-none');

        // Mostrar las ruletas pequeñas cuando se muestra el overlay del ganador
        showSmallRoulette();

        setTimeout(() => {
            startConfetti(); // Asegúrate de que esta función esté definida en tus scripts
        }, 500);

        setTimeout(() => {
            closeButton.classList.remove('hidden');
        }, 3000);
    }

    // Función para mostrar el overlay de giro
    function showSpinOverlay(type) {
        overlay.classList.add('d-none');
        overlay.classList.remove('d-flex');
        closeButton.classList.add('hidden');
        spinOverlay.classList.remove('d-none');

        if (type === 'circular') {
            document.getElementById('spinOverlayCircular').classList.remove('d-none');
            document.getElementById('spinOverlayVertical').classList.add('d-none');
        } else if (type === 'vertical') {
            document.getElementById('spinOverlayVertical').classList.remove('d-none');
            document.getElementById('spinOverlayCircular').classList.add('d-none');
        }

        // Ocultar las ruletas pequeñas durante la animación de giro
        hideSmallRoulette();
    }

    // Función para ocultar las ruletas pequeñas
    function hideSmallRoulette() {
        if (currentRoulette === 'circular') {
            document.getElementById('circular-roulette').classList.add('d-none');
        } else if (currentRoulette === 'vertical') {
            document.getElementById('vertical-roulette').classList.add('d-none');
        }
    }

    // Función para mostrar las ruletas pequeñas
    function showSmallRoulette() {
        if (currentRoulette === 'circular') {
            document.getElementById('circular-roulette').classList.remove('d-none');
        } else if (currentRoulette === 'vertical') {
            document.getElementById('vertical-roulette').classList.remove('d-none');
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
