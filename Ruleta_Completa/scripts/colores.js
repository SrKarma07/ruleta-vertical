// colores.js

// Function to get the next color in the color wheel
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

// Function to get the contrast color (white or black)
function getContrastColor({ r, g, b }) {
    return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#000" : "#fff";
}

// Conversion from RGB to HSL
function rgbToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
                break;
            case g:
                h = ((b - r) / d + 2) * 60;
                break;
            case b:
                h = ((r - g) / d + 4) * 60;
                break;
        }
    }
    return {h, s: s * 100, l: l * 100};
}

// Function to adjust color saturation
function adjustColorSaturation(rgbString, saturation) {
    const rgbValues = rgbString.match(/\d+/g).map(Number);
    let hsl = rgbToHSL(rgbValues[0], rgbValues[1], rgbValues[2]);
    hsl.s = saturation;
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
}

// Expose functions globally
window.getNextColor = getNextColor;
window.getContrastColor = getContrastColor;
window.hslToRgb = hslToRgb;
window.rgbToHSL = rgbToHSL;
window.adjustColorSaturation = adjustColorSaturation;
