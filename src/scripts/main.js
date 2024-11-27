// main.js

document.addEventListener('DOMContentLoaded', function () {
    // Variables y elementos del DOM
    const rouletteConfiguration = document.getElementById('roulette-configuration');

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

    // Inicializar
    updateNamesList(); // Asegúrate de que esta función esté definida en tus scripts

    // Eventos de botones
    startRaffleBtn.addEventListener('click', goToRouletteInterface);

    spinAgainBtn.addEventListener('click', spinAgain);
    newRaffleBtn.addEventListener('click', resetApplication);
    closeButton.addEventListener('click', closeOverlay);
    startSpinBtnCircular.addEventListener('click', () => startSpin('circular'));
    startSpinBtnVertical.addEventListener('click', () => startSpin('vertical'));
    // Función para cargar el footer dinámicamente
    function loadFooter() {
        fetch('./components/footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar el footer');
                }
                return response.text();
            })
            .then(data => {
                document.getElementById('footer-placeholder').innerHTML = data;
            })
            .catch(error => {
                console.error('Error cargando el footer:', error);
            });
    }

    // Llamar a la función para cargar el footer
    loadFooter();
    // Función para ir a la interfaz de la ruleta
    function goToRouletteInterface() {
        const items = dataManager.getItems();
        if (items.length === 0) {
            alert('Por favor, agregue participantes antes de continuar.');
            return;
        }
        rouletteConfiguration.classList.add('d-none');

        // Determinar el tipo de ruleta seleccionado
        // Asumiendo que hay alguna forma de determinar si es circular o vertical
        // Por ejemplo, a través de una variable global 'currentRoulette'
        // Asegúrate de establecer esta variable cuando el usuario selecciona la ruleta

        // Por ejemplo:
        // window.currentRoulette = 'circular' o 'vertical'

        // Aquí, asumo que 'currentRoulette' ya está establecido por alguna lógica previa

        // Mostrar el overlay de la ruleta antes de inicializar
        showSpinOverlay(window.currentRoulette);

        if (window.currentRoulette === 'circular') {
            ruletaCircular.init(
                document.getElementById('canvasBig'),
                dataManager.getItems(),
                dataManager.getColors(),
                numWinnersSelect,
                overlay,
                spinOverlay,
                winnerDiv,
                closeButton
            );
        } else if (window.currentRoulette === 'vertical') {
            ruletaVertical.init(
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
    }

    // Función para iniciar el sorteo
    async function startSpin(type) {
        const numWinners = parseInt(numWinnersSelect.value, 10) || 1;

        if (numWinners > dataManager.getItems().length) {
            alert('El número de ganadores excede el número de participantes.');
            return;
        }

        // Preparar la lista de ganadores
        const winners = [];

        for (let i = 0; i < numWinners; i++) {
            try {
                let winner;
                if (type === 'circular') {
                    winner = await ruletaCircular.spin();
                } else if (type === 'vertical') {
                    winner = await ruletaVertical.spin();
                }

                winners.push(winner);

                // Eliminar al ganador de los datos
                dataManager.removeItem(winner);

                // Actualizar las ruletas
                if (type === 'circular') {
                    ruletaCircular.init(
                        document.getElementById('canvasBig'),
                        dataManager.getItems(),
                        dataManager.getColors(),
                        numWinnersSelect,
                        overlay,
                        spinOverlay,
                        winnerDiv,
                        closeButton
                    );
                } else if (type === 'vertical') {
                    ruletaVertical.init(
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

            } catch (error) {
                console.error('Error durante el giro:', error);
                break;
            }
        }

        // Mostrar todos los ganadores
        if (winners.length > 0) {
            overlay.classList.remove('d-none');
            overlay.classList.add('d-flex');
            winnerDiv.innerHTML = 'Ganadores: <br>' + winners.join(' , ');
            spinOverlay.classList.add('d-none');
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

    // Función para cerrar el overlay del ganador y regresar a la ruleta grande
    function closeOverlay() {
        overlay.classList.add('d-none');
        overlay.classList.remove('d-flex');
        closeButton.classList.add('hidden');
        stopConfetti(); // Asegúrate de que esta función esté definida en tus scripts
        // Mostrar el overlay de la ruleta grande
        showSpinOverlay(currentRoulette);
    }

    // Función para mostrar el ganador (ya no será usada para múltiples ganadores)
    function showWinner(winnerName) {
        console.log("showWinner called with:", winnerName); // Depuración
        winnerDiv.textContent = `${winnerName}`;
        overlay.classList.remove('d-none');
        overlay.classList.add('d-flex');
        spinOverlay.classList.add('d-none');

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
    }

    // Función para reiniciar la aplicación
    function resetApplication() {
        location.reload();
    }

    // Exponer funciones globalmente para que las ruletas puedan llamarlas
    window.showWinner = showWinner;
    window.showSpinOverlay = showSpinOverlay;
});
