// utilities.js

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Expose globally
window.easeOutCubic = easeOutCubic;
