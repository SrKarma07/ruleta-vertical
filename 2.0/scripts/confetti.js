// confetti.js

let confettiContainer;
let confettiParticles = [];
let confettiAnimationId;
let isConfettiRunning = false;

// Función para iniciar la animación de confeti
function startConfetti() {
    if (isConfettiRunning) return; // Evitar múltiples instancias
    isConfettiRunning = true;

    confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti-container');
    document.body.appendChild(confettiContainer);

    // Generar partículas en intervalos
    createConfettiParticles();
    confettiAnimationId = requestAnimationFrame(updateConfetti);
}

// Función para detener la animación de confeti
function stopConfetti() {
    isConfettiRunning = false;

    // Limpiar el array de partículas
    confettiParticles = [];

    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }

    if (confettiContainer && confettiContainer.parentNode) {
        confettiContainer.parentNode.removeChild(confettiContainer);
        confettiContainer = null;
    }
}

// Función para crear un lote de partículas de confeti
function createConfettiParticles() {
    const shapes = ['star', 'square', 'circle', 'triangle', 'heart'];
    const colors = ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0'];
    const numParticles = 10; // Reducir la cantidad de partículas en cada lote

    for (let i = 0; i < numParticles; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');

        const size = Math.random() * 6 + 4;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;

        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        confetti.classList.add(`confetti--${shape}`);

        const color = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.backgroundColor = color;
        confetti.style.color = color;

        const startX = Math.random() * window.innerWidth;
        confetti.style.left = startX + 'px';
        confetti.style.top = '-20px';

        confettiContainer.appendChild(confetti);

        confettiParticles.push({
            element: confetti,
            velocity: {
                x: (Math.random() - 0.5) * 1.5,
                y: Math.random() * 2 + 1.5, // Menor velocidad de caída
                rotation: (Math.random() - 0.5) * 10
            },
            position: {
                x: startX,
                y: -20
            },
            rotation: Math.random() * 360
        });
    }

    // Crear el siguiente lote de partículas en 200ms
    if (isConfettiRunning) setTimeout(createConfettiParticles, 200);
}

// Función para actualizar las partículas de confeti
function updateConfetti() {
    if (!isConfettiRunning) return;

    confettiParticles.forEach((particle) => {
        particle.position.x += particle.velocity.x;
        particle.position.y += particle.velocity.y;
        particle.rotation += particle.velocity.rotation;

        // Actualizar estilo de cada partícula
        particle.element.style.transform = `translate3d(${particle.position.x}px, ${particle.position.y}px, 0) rotate(${particle.rotation}deg)`;

        // Reiniciar partículas al final de la pantalla
        if (particle.position.y > window.innerHeight) {
            // Volver a la parte superior en una posición aleatoria
            particle.position.y = -20;
            particle.position.x = Math.random() * window.innerWidth;

            // Asignar nueva velocidad y rotación aleatoria
            particle.velocity.y = Math.random() * 2 + 1.5;
            particle.velocity.x = (Math.random() - 0.5) * 1.5;
            particle.rotation = Math.random() * 360;
        }
    });

    confettiAnimationId = requestAnimationFrame(updateConfetti);
}

// Estilos CSS para las partículas de confeti
const confettiStyles = document.createElement('style');
confettiStyles.type = 'text/css';
confettiStyles.innerHTML = `
.confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 10001;
}

.confetti {
    position: absolute;
    z-index: 10001;
    pointer-events: none;
    will-change: transform, opacity;
    opacity: 1;
    transition: opacity 0.5s ease-out;
}

.confetti--square {
    background-color: inherit;
}

.confetti--circle {
    background-color: inherit;
    border-radius: 50%;
}

.confetti--triangle {
    width: 0;
    height: 0;
    border-left: 0.3em solid transparent;
    border-right: 0.3em solid transparent;
    border-bottom: 0.5em solid;
    background: none;
    transform-origin: center;
}

.confetti--star {
    width: 0;
    height: 0;
    position: relative;
    display: inline-block;
    transform-origin: center;
}

.confetti--star::before,
.confetti--star::after {
    content: '';
    position: absolute;
    top: 0;
    left: -0.5em;
    width: 1em;
    height: 1em;
    background-color: inherit;
    transform: rotate(45deg);
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.confetti--heart {
    position: relative;
    width: 0.5em;
    height: 0.5em;
    background: inherit;
    transform: rotate(-45deg);
    transform-origin: center;
}

.confetti--heart::before,
.confetti--heart::after {
    content: '';
    position: absolute;
    width: 0.5em;
    height: 0.5em;
    background: inherit;
    border-radius: 50%;
}

.confetti--heart::before {
    top: -0.25em;
    left: 0;
}

.confetti--heart::after {
    left: -0.25em;
    top: 0;
}
`;
document.head.appendChild(confettiStyles);
