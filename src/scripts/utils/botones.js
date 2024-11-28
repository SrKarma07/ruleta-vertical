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
