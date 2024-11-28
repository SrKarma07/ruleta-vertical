document.addEventListener("DOMContentLoaded", () => {
    const expandScreenBtn = document.getElementById("expandScreenBtn");

    // Alternar pantalla completa
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
            expandScreenBtn.style.visibility = 'hidden';  // Ocultar el botón cuando el overlay esté visible
        } else {
            expandScreenBtn.style.visibility = 'visible';  // Mostrar el botón cuando el overlay desaparezca
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.getElementById("backBtn");
    const startSpinBtnCircular = document.getElementById("startSpinBtnCircular");
    const startSpinBtnVertical = document.getElementById("startSpinBtnVertical");

    // Asegurarse de que el botón "Regresar" esté habilitado por defecto
    backBtn.disabled = false;
    console.log("Botón Regresar inicial: Habilitado");

    // Variable para verificar si el sorteo está en curso
    let isSpinInProgress = false;

    // Función para deshabilitar el botón "Regresar"
    function disableBackButton() {
        backBtn.disabled = true;
        console.log("Botón Regresar deshabilitado");
    }

    // Función para habilitar el botón "Regresar" después de un retraso
    function enableBackButton() {
        setTimeout(() => {
            backBtn.disabled = false;
            console.log("Botón Regresar habilitado después de 5 segundos");
        }, 5000); // 5 segundos
    }

    // Evento para "Iniciar sorteo" (ruleta circular o vertical)
    startSpinBtnCircular.addEventListener("click", () => {
        if (!isSpinInProgress) {
            console.log("Iniciando sorteo Circular...");
            disableBackButton(); // Deshabilitar el botón "Regresar"
            isSpinInProgress = true; // Marcar que el sorteo está en curso
            startSpin('circular'); // Iniciar el sorteo circular
        }
    });

    startSpinBtnVertical.addEventListener("click", () => {
        if (!isSpinInProgress) {
            console.log("Iniciando sorteo Vertical...");
            disableBackButton(); // Deshabilitar el botón "Regresar"
            isSpinInProgress = true; // Marcar que el sorteo está en curso
            startSpin('vertical'); // Iniciar el sorteo vertical
        }
    });

    // Función para iniciar el sorteo
    async function startSpin(type) {
        console.log(`Iniciando sorteo de tipo: ${type}`);

        // Simulamos que el sorteo dura 3 segundos
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log("Sorteo terminado, habilitando botón Regresar...");
        // Habilitar el botón "Regresar" después de que termine el sorteo
        enableBackButton();
        isSpinInProgress = false; // Marcar que el sorteo ha terminado
    }

    // Lógica para el botón de regresar
    const interfaces = [
        document.getElementById("roulette-selection"),        // Interfaz de selección de ruleta
        document.getElementById("roulette-configuration"),    // Interfaz de configuración de ruleta
        document.getElementById("spinOverlay"),               // Capa de giro
        document.getElementById("overlay")                    // Capa de ganador
    ];

    // Función para mostrar la interfaz según el índice
    function showInterface(index) {
        // Ocultar todas las interfaces
        interfaces.forEach((interfaceElement) => {
            interfaceElement.classList.add("d-none");
        });

        // Mostrar la interfaz correspondiente al índice
        if (interfaces[index]) {
            interfaces[index].classList.remove("d-none");
        }
    }

    // Inicialmente, mostramos la primera interfaz (selección de ruleta)
    showInterface(0);

    // Lógica para el botón de regresar
    backBtn.addEventListener("click", () => {
        if (isSpinInProgress) {
            // Si el sorteo está en progreso, evitar regresar
            console.log("El sorteo está en curso. No puedes regresar aún.");
            return;
        }

        // Buscar el índice de la interfaz visible (la que no tiene la clase d-none)
        const currentVisibleIndex = interfaces.findIndex((interfaceElement) => !interfaceElement.classList.contains("d-none"));

        if (currentVisibleIndex > 0) {
            // Si no estamos en la primera interfaz, retrocedemos al índice anterior
            showInterface(currentVisibleIndex - 1);
        } else {
            // Si estamos en la primera interfaz, mostramos un mensaje
            alert("Ya estás en la primera interfaz");
        }

        // Registrar en la consola cada vez que se haga clic en "Regresar"
        console.log("Botón Regresar presionado, regresando a la interfaz anterior");
    });

    // Mostrar u ocultar el botón según la visibilidad del overlay
    const overlay = document.getElementById("overlay");
    overlay.addEventListener("transitionend", () => {
        if (!overlay.classList.contains("d-none")) {
            backBtn.style.visibility = 'hidden';  // Ocultar el botón cuando el overlay esté visible
        } else {
            backBtn.style.visibility = 'visible';  // Mostrar el botón cuando el overlay desaparezca
        }
    });
});
