namespace color {
    export interface HsvColor { h: number; s: number; v: number; }
    export let customPaletteRegistry: Palette[] = [];
    export let basePaletteBuf: Buffer = null;
    export let lastBrightness: number = 100;

    export function rgbToHsv(r: number, g: number, b: number): HsvColor {
        let max = Math.max(r, Math.max(g, b)), min = Math.min(r, Math.min(g, b)), d = max - min, h = 0;
        let s = max === 0 ? 0 : d / max, v = max / 255;
        if (max !== min) {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 255), s: Math.round(s * 255), v: Math.round(v * 255) };
    }

    export function hsvToRgbNumber(h: number, s: number, v: number): number {
        h /= 255; s /= 255; v /= 255;
        let r = 0, g = 0, b = 0, i = Math.floor(h * 6), f = h * 6 - i;
        let p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break; case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break; case 5: r = v; g = p; b = q; break;
        }
        return (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);
    }
}
