// transiciones.js

document.addEventListener('DOMContentLoaded', function() {
    const rouletteSelection = document.getElementById('roulette-selection');
    const rouletteConfiguration = document.getElementById('roulette-configuration');

    const circularRouletteCard = document.getElementById('circularRouletteCard');
    const verticalRouletteCard = document.getElementById('verticalRouletteCard');

    const mainTitle = document.getElementById('mainTitle');

    // Evento para Ruleta Circular
    circularRouletteCard.addEventListener('click', function() {
        startTransition(circularRouletteCard, 'circular');
    });

    // Evento para Ruleta Vertical
    verticalRouletteCard.addEventListener('click', function() {
        startTransition(verticalRouletteCard, 'vertical');
    });

    function startTransition(cardElement, type) {
        // Clonar la tarjeta
        const cardClone = cardElement.cloneNode(true);
        document.body.appendChild(cardClone);

        // Obtener la posición y tamaño de la tarjeta original
        const rect = cardElement.getBoundingClientRect();

        // Aplicar estilos iniciales al clon
        cardClone.style.position = 'fixed';
        cardClone.style.top = rect.top + 'px';
        cardClone.style.left = rect.left + 'px';
        cardClone.style.width = rect.width + 'px';
        cardClone.style.height = rect.height + 'px';
        cardClone.style.margin = 0;
        cardClone.style.zIndex = 9999;
        cardClone.style.transition = 'transform 1s ease, opacity 1s ease';
        cardClone.style.background = 'transparent';

        // Ocultar la tarjeta original
        cardElement.style.visibility = 'hidden';

        // Forzar reflujo
        cardClone.getBoundingClientRect();

        // Calcular la traslación al centro
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const translateX = centerX - cardCenterX;
        const translateY = centerY - cardCenterY;

        // Aplicar la transformación para mover al centro y ampliar
        cardClone.style.transform = `translate(${translateX}px, ${translateY}px) scale(3)`;
        cardClone.style.opacity = '0';

        // Cambiar el fondo a blanco durante la transición
        document.body.classList.add('white-background');

        // Después de la animación, mostrar la siguiente interfaz
        setTimeout(function() {
            cardClone.parentNode.removeChild(cardClone);
            cardElement.style.visibility = 'visible'; // Restaurar visibilidad si es necesario

            rouletteSelection.classList.add('d-none');
            rouletteConfiguration.classList.remove('d-none');
            rouletteConfiguration.classList.add('show');

            // Restaurar el fondo original
            document.body.classList.remove('white-background');
        }, 1000); // Duración de la animación (1s)

        // Establecer el tipo de ruleta seleccionado
        window.currentRoulette = type;
    }

    // Ocultar el título después de la configuración
    const startRaffleBtn = document.getElementById('startRaffleBtn');
    startRaffleBtn.addEventListener('click', function() {
        mainTitle.classList.add('d-none');
    });
});
