document.addEventListener("DOMContentLoaded", () => {
    const expandScreenBtn = document.getElementById("expandScreenBtn");
    expandScreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error al intentar activar pantalla completa: ${err.message}`);
            });
        } else {
            document.exitFullscreen().catch((err) => {
                console.error(`Error al intentar salir de pantalla completa: ${err.message}`);
            });
        }
    });

    // Mostrar u ocultar el botón según la visibilidad del overlay
    const overlay = document.getElementById("overlay");
    overlay.addEventListener("transitionend", () => {
        if (!overlay.classList.contains("d-none")) {
            expandScreenBtn.style.visibility = 'hidden';  
        } else {
            expandScreenBtn.style.visibility = 'visible';  
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.getElementById("backBtn");
    const startSpinBtnCircular = document.getElementById("startSpinBtnCircular");
    const startSpinBtnVertical = document.getElementById("startSpinBtnVertical");

    backBtn.disabled = false;
    let isSpinInProgress = false;
    function disableBackButton() {
        backBtn.disabled = true;
    }

    // Función para habilitar el botón "Regresar" después de un retraso
    function enableBackButton() {
        setTimeout(() => {
            backBtn.disabled = false;
        }, 5000); // 5 segundos
    }

    // Evento para "Iniciar sorteo" (ruleta circular o vertical)
    startSpinBtnCircular.addEventListener("click", () => {
        if (!isSpinInProgress) {
            disableBackButton(); // Deshabilitar el botón "Regresar"
            isSpinInProgress = true; // Marcar que el sorteo está en curso
            startSpin('circular'); // Iniciar el sorteo circular
        }
    });

    startSpinBtnVertical.addEventListener("click", () => {
        if (!isSpinInProgress) {
            disableBackButton(); // Deshabilitar el botón "Regresar"
            isSpinInProgress = true; // Marcar que el sorteo está en curso
            startSpin('vertical'); // Iniciar el sorteo vertical
        }
    });

    // Función para iniciar el sorteo
    async function startSpin(type) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        enableBackButton();
        isSpinInProgress = false;
    }

    // Lógica para el botón de regresar
    const interfaces = [
        document.getElementById("roulette-selection"), 
        document.getElementById("roulette-configuration"),   
        document.getElementById("spinOverlay"),               
        document.getElementById("overlay")                    
    ];

    // Función para mostrar la interfaz según el índice
    function showInterface(index) {
        interfaces.forEach((interfaceElement) => {
            interfaceElement.classList.add("d-none");
        });
        if (interfaces[index]) {
            interfaces[index].classList.remove("d-none");
        }
    }
    showInterface(0);

    // Lógica para el botón de regresar
    backBtn.addEventListener("click", () => {
        if (isSpinInProgress) {
            return;
        }
        const currentVisibleIndex = interfaces.findIndex((interfaceElement) => !interfaceElement.classList.contains("d-none"));
        if (currentVisibleIndex > 0) {
            showInterface(currentVisibleIndex - 1);
        } 
    });

    // Mostrar u ocultar el botón según la visibilidad del overlay
    const overlay = document.getElementById("overlay");
    overlay.addEventListener("transitionend", () => {
        if (!overlay.classList.contains("d-none")) {
            backBtn.style.visibility = 'hidden';
        } else {
            backBtn.style.visibility = 'visible';  
    }});
});