function getNextColor(index, totalItems) {
    const hue = (index / totalItems) * 360;
    const { r, g, b } = hslToRgb(hue, 100, 50);
    return { r, g, b };
}

// Conversion from HSL to RGB
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);
    return {
        r: Math.round(255 * f(0)),
        g: Math.round(255 * f(8)),
        b: Math.round(255 * f(4))
    };
}

window.getNextColor = getNextColor;
window.hslToRgb = hslToRgb;