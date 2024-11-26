// confetti.js

let confettiContainer;
let confettiParticles = [];
let confettiAnimationId;
let isConfettiRunning = false;

const MAX_CONFETTI_PARTICLES = 100; // Adjust this number as needed

// Function to start the confetti animation
function startConfetti() {
    if (isConfettiRunning) return; // Avoid multiple instances
    isConfettiRunning = true;

    confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti-container');
    document.body.appendChild(confettiContainer);

    // Generate all confetti particles upfront
    createConfettiParticles();
    confettiAnimationId = requestAnimationFrame(updateConfetti);

    // Optional: Stop the confetti after a certain time
    // setTimeout(stopConfetti, 10000); // Stops after 10 seconds
}

// Function to stop the confetti animation
function stopConfetti() {
    isConfettiRunning = false;

    // Clear the array of particles
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

// Function to create the confetti particles
function createConfettiParticles() {
    const shapes = ['star', 'square', 'circle', 'triangle', 'heart'];
    const colors = ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0'];

    for (let i = 0; i < MAX_CONFETTI_PARTICLES; i++) {
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
                y: Math.random() * 2 + 1.5, // Lower fall speed
                rotation: (Math.random() - 0.5) * 10
            },
            position: {
                x: startX,
                y: -20
            },
            rotation: Math.random() * 360
        });
    }
}

// Function to update the confetti particles
function updateConfetti() {
    if (!isConfettiRunning) return;

    confettiParticles.forEach((particle) => {
        particle.position.x += particle.velocity.x;
        particle.position.y += particle.velocity.y;
        particle.rotation += particle.velocity.rotation;

        // Update each particle's style
        particle.element.style.transform = `translate3d(${particle.position.x}px, ${particle.position.y}px, 0) rotate(${particle.rotation}deg)`;

        // Recycle particles that have gone off-screen
        if (
            particle.position.y > window.innerHeight ||
            particle.position.x < -50 ||
            particle.position.x > window.innerWidth + 50
        ) {
            resetParticle(particle);
        }
    });

    confettiAnimationId = requestAnimationFrame(updateConfetti);
}

// Function to reset and recycle a confetti particle
function resetParticle(particle) {
    particle.position.x = Math.random() * window.innerWidth;
    particle.position.y = -20; // Start above the top of the screen

    particle.velocity = {
        x: (Math.random() - 0.5) * 1.5,
        y: Math.random() * 2 + 1.5,
        rotation: (Math.random() - 0.5) * 10
    };

    particle.rotation = Math.random() * 360;

    // Optionally change the particle's color and shape
    const shapes = ['star', 'square', 'circle', 'triangle', 'heart'];
    const colors = ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0'];

    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.element.className = 'confetti';
    particle.element.classList.add(`confetti--${shape}`);
    particle.element.style.backgroundColor = color;
    particle.element.style.color = color;
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
