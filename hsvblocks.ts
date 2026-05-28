//% color="#5C2D91" icon="\uf042" block="Color"
//% subcategory="HSV"
namespace color {

    /**
     * Internal template generator for the inline HSV slider bubble.
     */
    //% blockId=color_hsv_local_shadow block="hue %hue sat %sat val %val"
    //% hue.min=0 hue.max=255 hue.defl=255 sat.min=0 sat.max=255 sat.defl=255 val.min=0 val.max=255 val.defl=255
    //% blockHidden=true
    export function _hsvTemplateShadow(hue: number, sat: number, val: number): number {
        return hsvToRgbNumber(hue, sat, val);
    }

    /**
     * Smoothly fades an unlimited sequence of color IDs to target colors simultaneously using HSV math.
     */
    //% blockId=color_fade_infinite_hsv_bubbles
    //% block="fade color indices %indices to HSV colors %targets over %duration=timePicker ms"
    //% inlineInputMode=inline indices.shadow=lists_create_with indices.defl=math_number targets.shadow=lists_create_with targets.defl=color_hsv_local_shadow duration.defl=1000 weight=100
    export function fadeColorsHsvInfinite(indices: number[], targets: number[], duration: number): void {
        if (!indices || !targets || indices.length === 0 || targets.length === 0) return;
        let startPaletteBuf = color.currentPalette().buf, count = Math.min(indices.length, targets.length);
        let slotIds: number[] = [], startHsvs: HsvColor[] = [], endRgbNumbers: number[] = [], endHsvs: HsvColor[] = [];
        for (let i = 0; i < count; i++) {
            let index = indices[i]; if (index < 0 || index > 15) continue; slotIds.push(index);
            startHsvs.push(rgbToHsv(startPaletteBuf[index * 3], startPaletteBuf[index * 3 + 1], startPaletteBuf[index * 3 + 2]));
            let targetVal = targets[i]; endRgbNumbers.push(targetVal);
            endHsvs.push(rgbToHsv((targetVal >> 16) & 0xFF, (targetVal >> 8) & 0xFF, targetVal & 0xFF));
        }
        if (slotIds.length === 0) return;
        control.runInParallel(() => {
            let startTime = control.millis();
            while (control.millis() - startTime < duration) {
                let elapsed = control.millis() - startTime, progress = Math.min(1, elapsed / duration), framePaletteBuf = color.currentPalette().buf;
                for (let k = 0; k < slotIds.length; k++) {
                    let index = slotIds[k], hStart = startHsvs[k].h, sStart = startHsvs[k].s, vStart = startHsvs[k].v, hEnd = endHsvs[k].h, sEnd = endHsvs[k].s, vEnd = endHsvs[k].v, diff = hEnd - hStart;
                    if (diff > 128) hEnd -= 256; else if (diff < -128) hEnd += 256;
                    let h = (hStart + progress * (hEnd - hStart)) % 256; if (h < 0) h += 256;
                    let s = sStart + progress * (sEnd - sStart), v = vStart + progress * (vEnd - vStart), rgbNum = hsvToRgbNumber(h, s, v);
                    framePaletteBuf[index * 3] = (rgbNum >> 16) & 0xFF; framePaletteBuf[index * 3 + 1] = (rgbNum >> 8) & 0xFF; framePaletteBuf[index * 3 + 2] = rgbNum & 0xFF;
                }
                color.setPalette(color.bufferToPalette(framePaletteBuf)); pause(25);
            }
            let finalPaletteBuf = control.createBuffer(startPaletteBuf.length);
            for (let b = 0; b < startPaletteBuf.length; b++) finalPaletteBuf[b] = color.currentPalette().buf[b];
            for (let m = 0; m < slotIds.length; m++) {
                let index = slotIds[m], finalColorNum = endRgbNumbers[m];
                finalPaletteBuf[index * 3] = (finalColorNum >> 16) & 0xFF; finalPaletteBuf[index * 3 + 1] = (finalColorNum >> 8) & 0xFF; finalPaletteBuf[index * 3 + 2] = finalColorNum & 0xFF;
            }
            color.setPalette(color.bufferToPalette(finalPaletteBuf));
        });
    }

    /**
     * Creates an editable named custom palette containing a clean horizontal list of exactly 16 HSV color slots.
     */
    //% blockId=color_create_editable_hsv_palette
    //% block="create palette %id with HSV colors %colors"
    //% inlineInputMode=inline id.enumName="HsvPaletteName" id.enumMemberName="palette" id.enumPromptHint="Name your new custom palette..." id.enumInitialMembers="Palette1, Palette2" colors.shadow=lists_create_with colors.defl=color_hsv_local_shadow weight=95
    export function setDropdownHsvPalette(id: number, colors: number[]): void {
        let buf = control.createBuffer(48);
        for (let i = 0; i < 16; i++) {
            let packedColor = (colors && i < colors.length) ? colors[i] : 0xFFFFFF;
            buf[i * 3] = (packedColor >> 16) & 0xFF; buf[i * 3 + 1] = (packedColor >> 8) & 0xFF; buf[i * 3 + 2] = packedColor & 0xFF;
        }
        customPaletteRegistry[id] = color.bufferToPalette(buf);
    }

    /**
     * Smoothly transitions the active screen palette to one of your custom user-named drop-down palette definitions.
     */
    //% blockId=color_fade_whole_dropdown_palette_hsv block="fade to palette %targetSelection over %duration=timePicker ms via HSV"
    //% targetSelection.enumName="HsvPaletteName" inlineInputMode=inline duration.defl=1000 weight=90
    export function fadeToDropdownPaletteHsv(targetSelection: number, duration: number): void {
        let target = customPaletteRegistry[targetSelection]; if (!target || !target.buf) { target = color.bufferToPalette(control.createBuffer(48)); }
        let startPaletteBuf = color.currentPalette().buf, targetBuf = target.buf, maxColors = Math.floor(Math.min(startPaletteBuf.length, targetBuf.length) / 3);
        if (maxColors === 0) return;
        let startHsvs: HsvColor[] = [], endHsvs: HsvColor[] = [];
        for (let i = 0; i < maxColors; i++) {
            startHsvs.push(rgbToHsv(startPaletteBuf[i * 3], startPaletteBuf[i * 3 + 1], startPaletteBuf[i * 3 + 2]));
            endHsvs.push(rgbToHsv(targetBuf[i * 3], targetBuf[i * 3 + 1], targetBuf[i * 3 + 2]));
        }
        control.runInParallel(() => {
            let startTime = control.millis();
            while (control.millis() - startTime < duration) {
                let elapsed = control.millis() - startTime, progress = Math.min(1, elapsed / duration), framePaletteBuf = color.currentPalette().buf;
                for (let k = 0; k < maxColors; k++) {
                    let hStart = startHsvs[k].h, sStart = startHsvs[k].s, vStart = startHsvs[k].v, hEnd = endHsvs[k].h, sEnd = endHsvs[k].s, vEnd = endHsvs[k].v, diff = hEnd - hStart;
                    if (diff > 128) hEnd -= 256; else if (diff < -128) hEnd += 256;
                    let h = (hStart + progress * (hEnd - hStart)) % 256; if (h < 0) h += 256;
                    let s = sStart + progress * (sEnd - sStart), v = vStart + progress * (vEnd - vStart), rgbNum = hsvToRgbNumber(h, s, v);
                    framePaletteBuf[k * 3] = (rgbNum >> 16) & 0xFF; framePaletteBuf[k * 3 + 1] = (rgbNum >> 8) & 0xFF; framePaletteBuf[k * 3 + 2] = rgbNum & 0xFF;
                }
                color.setPalette(color.bufferToPalette(framePaletteBuf)); pause(25);
            }
            color.setPalette(target);
        });
    }

    /**
     * Sets the screen brightness by scaling the active color palette channels (0 to 100).
     */
    //% blockId=color_set_screen_brightness block="set screen brightness to %brightness|%"
    //% brightness.min=0 brightness.max=100 brightness.defl=100 weight=85
    export function setScreenBrightness(brightness: number): void {
        brightness = Math.max(0, Math.min(100, brightness));
        let currentPal = color.currentPalette(); if (!currentPal || !currentPal.buf) return;
        if (basePaletteBuf == null || lastBrightness == 100) {
            basePaletteBuf = control.createBuffer(currentPal.buf.length);
            for (let i = 0; i < currentPal.buf.length; i++) { basePaletteBuf[i] = currentPal.buf[i]; }
        }
        let outBuf = control.createBuffer(basePaletteBuf.length), factor = brightness / 100;
        for (let i = 0; i < basePaletteBuf.length; i++) { outBuf[i] = Math.round(basePaletteBuf[i] * factor); }
        color.setPalette(color.bufferToPalette(outBuf)); lastBrightness = brightness;
    }
}
