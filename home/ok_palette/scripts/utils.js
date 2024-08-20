// un-used stuff that i don't want to delete


function cart2Polar(x, y) {
    const r = Math.sqrt(x ** 2 + y ** 2);
    const theta = Math.atan2(y, x) * 180 / Math.PI;
    return { theta, r };
}

export function plotLight2(mixerObj, chroma, lightness) {
    plotChroma(mixerObj, chroma, lightness)

    const width = mixerObj.canvas.element.width
    const height = mixerObj.canvas.element.height
    var canvasData = mixerObj.canvas.ctx.createImageData(width, height)
    const canvasPixelData = new Uint8ClampedArray(canvasData.data.buffer).fill(255);

    for (let x = 0; x <= width; x+= 1) {
        for (let y = 0; y <= height; y+= 1) { 
            // RANGES: a* = [-0.35, 0.35], b* = [-0.35, 0.35]
            const scaled = mixerObj.transform_func(x/width, y/height, 0)
            let col = okLAB2RGB(lightness, scaled.ax, scaled.by); 

            const offset = (x + y * width) * 4;
            
            canvasPixelData[offset] = col[0]*255; // R
            canvasPixelData[offset + 1] = col[1]*255; // G
            canvasPixelData[offset + 2] = col[2]*255; // B
            if (gamutCheck(col)) {
                canvasPixelData[offset + 3] = 255; // A
            } else {
                // pixelData[offset] = 255; // R
                // pixelData[offset + 1] = 255; // G
                // pixelData[offset + 2] = 255; // B
                canvasPixelData[offset + 3] = 55; // A
            }
        }
    }
    // const imageData = new ImageData(pixelData, 500, 500);
    mixerObj.canvas.ctx.putImageData(canvasData, 0, 0);

    // add dot for centre
    mixerObj.canvas.ctx.strokeStyle = "black";
    mixerObj.canvas.ctx.strokeRect(width/2, height/2, 1, 1); 
}

export function plotHueFlipped(canvasCTX, hue) {
    const width = canvasCTX.canvas.width
    const height = canvasCTX.canvas.height
    var imageData = canvasCTX.createImageData(width, height)
    const pixelData = new Uint8ClampedArray(imageData.data.buffer).fill(255);

    for (let x = 0; x <= width; x+= 1) {
        for (let y = 0; y <= height; y+= 1) { 
            // for reference, these are the ranges of values
            // lightness = [-0.05, 1/0.9 - 0.05] = [-0.05, 1.06111] (different to plotLight())
            // chroma = [0, 1/2.8] = [0, 0.35714]
            // hue = from param = [0, 360]
            let col = okLCH2RGB((y/(height*0.9))-0.05, (x/(width*2.8)), hue); 
            
            // const offset = (x + y * width) * 4;
            const offset = 4 * (width*height - (x + y * width));
            
            // if (col.inGamut('srgb')) {
            pixelData[offset] = col[0]*255; // R
            pixelData[offset + 1] = col[1]*255; // G
            pixelData[offset + 2] = col[2]*255; // B
            if (gamutCheck(col)) {
                
                pixelData[offset + 3] = 255; // A
            } else {
                // pixelData[offset] = 255; // R
                // pixelData[offset + 1] = 255; // G
                // pixelData[offset + 2] = 255; // B
                pixelData[offset + 3] = 55; // A
            }
        }
    }
    // const imageData = new ImageData(pixelData, 500, 500);
    canvasCTX.putImageData(imageData, 0, 0);
}

export function plotColours2(canvasCTX, lightnessF) {
    // get all combinations of colours at a specific lightness 
    // iterate throug hue (angle) and chroma (radius up to 0.4) starting around (250, 250) (so have to add 250 to x, y)
    const pxl_size = 1
    for (let x = 0; x <= 500; x+= pxl_size) {
        for (let y = 0; y <= 500; y+= pxl_size) { 
            let colour = okLAB2RGB(lightnessF, (x/500.0)-0.5, (y/500.0)-0.5); 
            
            

            // plot all combinations, if not inGamut(), plot white or whatever default 
            // if (colour.inGamut('srgb')) {
            if (gamutCheck(colour)) {
                // canvasCTX.fillStyle = colour.toString({inGamut:true}); 
                canvasCTX.fillStyle = `rgb(${colour[0]*100}% ${colour[1]*100}% ${colour[2]*100}%)`; 
                // console.log(colour.toString({inGamut:true}))

            } else {
                // canvasCTX.fillStyle = srgb.toString({inGamut:true}); 
                canvasCTX.fillStyle = "white";
            }
            canvasCTX.fillRect(x, y, pxl_size, pxl_size); 
            
        }
    }
}

export function plotColours32(canvasCTX, lightnessF) {
    const rgba = (r, g, b, a) => (a << 24) | (b << 16) | (g << 8) | r;

    var data = canvasCTX.createImageData(500,500);
    const pixelData = new Uint32Array(data.data.buffer).fill(0xFFFFFFFF);

    for (let x = 0; x <= 500; x+= 1) {
        for (let y = 0; y <= 500; y+= 1) { 
            let col = okLAB2RGB(lightnessF, (x/500.0)-0.5, (y/500.0)-0.5); 

            const offset = (x + y * 500);
            const alpha = gamutCheck(col) ? 255 : 0;
            
            const pixelValue = rgba(
                col[0] * 255 & 0xFF,
                col[1] * 255 & 0xFF,
                col[2] * 255 & 0xFF,
                alpha
            );
            pixelData[offset] = pixelValue;
        }
    }

    // const imageData = new ImageData(pixelData, 500, 500);
    canvasCTX.putImageData(data, 0, 0);
}

function okLAB2RGB(l, a, b_star) {
    // oklab to xyz
    const l1 = 0.9999999984505196*l + 0.39633779217376774*a + 0.2158037580607588*b_star
    const m1 = 1.0000000088817607*l - 0.10556134232365633*a - 0.0638541747717059*b_star
    const s1 = 1.0000000546724108*l - 0.08948418209496574*a - 1.2914855378640917*b_star

    const ll = l1 * l1 * l1
    const m = m1 * m1 * m1 
    const s = s1 * s1 * s1

    let x = 1.2268798733741557*ll - 0.5578149965554813*m + 0.28139105017721594*s
    let y = -0.04057576262431372*ll + 1.1122868293970594*m - 0.07171106666151696*s
    let z = -0.07637294974672142*ll - 0.4214933239627916*m + 1.5869240244272422*s

    // XYZ to linear RGB
    let r = 3.2409699419045214*x - 1.5373831775700935*y - 0.49861076029300328*z
    let g = -0.96924363628087983*x + 1.8759675015077207*y + 0.041555057407175613*z
    let b = 0.055630079696993609*x - 0.20397695888897657*y + 1.0569715142428786*z

    // delinearise 
    // r = (r <= 0.0031308 ? 12.92 * r : 1.055*(r**(1.0/2.4)) - 0.055); 
    // g = (g <= 0.0031308 ? 12.92 * g : 1.055*(g**(1.0/2.4)) - 0.055);
    // b = (b <= 0.0031308 ? 12.92 * b : 1.055*(b**(1.0/2.4)) - 0.055);

    // delinearise approx
    // http://stereopsis.com/polygamma.html
    r = 1.49*r*r*r -3.23*r*r + 2.74*r
    g = 1.49*g*g*g -3.23*g*g + 2.74*g
    b = 1.49*b*b*b -3.23*b*b + 2.74*b

    return [r, g, b]
}

// wheel scroll on entry 
stepCount.addEventListener("input", sendColourValues); 
stepCount.addEventListener('wheel', (event) => {
    if (event.deltaY < 0) {// Scrolling up
        if (parseInt(stepCount.value) + 1 <= parseInt(stepCount.getAttribute("max"))) {
            stepCount.value = parseInt(stepCount.value) + 1;
        }
      
    } else if (parseInt(stepCount.value) - 1 >= parseInt(stepCount.getAttribute("min"))) { // Scrolling down
      stepCount.value = parseInt(stepCount.value) - 1;
    }
    sendColourValues()
    event.preventDefault(); // Prevent default scrolling behavior
});


