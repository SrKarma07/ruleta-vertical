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

    // Listamos las interfaces que tenemos en el HTML
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
        // Buscar el índice de la interfaz visible (la que no tiene la clase d-none)
        const currentVisibleIndex = interfaces.findIndex((interfaceElement) => !interfaceElement.classList.contains("d-none"));

        if (currentVisibleIndex > 0) {
            // Si no estamos en la primera interfaz, retrocedemos al índice anterior
            showInterface(currentVisibleIndex - 1);
        } else {
            // Si estamos en la primera interfaz, mostramos un mensaje
            alert("Ya estás en la primera interfaz");
        }
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
