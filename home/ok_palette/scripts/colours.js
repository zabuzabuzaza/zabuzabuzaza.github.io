// import Color from "https://colorjs.io/dist/color.js"; 
// 
/**For all "ring calculations", it is dist = (x-width/2)**2 + (y-height/2)**2 */
const INNER_RING = 180 
const INNER_RING_COMPARE = INNER_RING**2; 

/**For all "ring calculations", it is dist = (x-width/2)**2 + (y-height/2)**2 */
const OUTER_RING = 195; 
const OUTER_RING_COMPARE = OUTER_RING**2; 



var ringMaskData = new Uint8Array(1).fill(1)
var leftMaskData = new Uint8Array(1).fill(1)
var rightMaskData = new Uint8Array(1).fill(1)

/**Creates a mask for the area of the hue ring */
export function createRingMask(width, height) {
    ringMaskData = new Uint8Array(width * height).fill(1)
    for (let x = 0; x < width; x+= 1) {
        for (let y = 0; y < height; y+= 1) { 
            const offset = (x + y*width)
            const dist = (x-width/2)**2 + (y-height/2)**2; 

            if (dist < INNER_RING_COMPARE || dist > OUTER_RING_COMPARE) {
                
                ringMaskData[offset] = 0; // A
            } 
        }
    }
}

/**Plots the middle canvas with new lightness value for all hues and chroma + hue ring*/
export async function plotLight(mixerObj, chroma, lightness) {
    /**calculate hue and draw ring */
    function calcAndDraw(x, y) {
        const scaled = mixerObj.transform_func(x/width, y/height, 0)
        const polar = cart2Polar(scaled.ax, scaled.by); 
        const edgeColour = okLCH2RGB(lightness, chroma, polar.angle)

        // console.log(`rgb(${edgeColour[0]*100}% ${edgeColour[1]*100}% ${edgeColour[2]*100}%)`)

        ringCTX.strokeStyle = `rgb(${edgeColour[0]*100}% ${edgeColour[1]*100}% ${edgeColour[2]*100}%)`;
        ringCTX.beginPath()
        ringCTX.moveTo(width/2, height/2)
        ringCTX.lineTo(x, y)
        ringCTX.stroke()
    }

    const width = mixerObj.canvas.element.width
    const height = mixerObj.canvas.element.height

    let canvasCTX = mixerObj.canvas.ctx
    let canvasData = canvasCTX.createImageData(width, height)
    const canvasPixelData = new Uint8ClampedArray(canvasData.data.buffer).fill(255);

    let ringCTX = mixerObj.ring.ctx
    

    // iterate to draw hue ring
    for (let x = 0; x < width; x+= 1) {
        calcAndDraw(x, 0)
        calcAndDraw(x, width)
    } 
    for (let y = 0; y < height; y+= 1) {
        calcAndDraw(0, y)
        calcAndDraw(height, y)
    } 

    // get the data after drawing the hue ring
    let ringData = ringCTX.getImageData(0, 0, width, height)
    let ringPixelData = ringData.data 

    for (let x = 0; x < width; x+= 1) {
        for (let y = 0; y < height; y+= 1) { 
            // RANGES: a* = [-0.35, 0.35], b* = [-0.35, 0.35]
            const scaled = mixerObj.transform_func(x/width, y/height, 0)
            let col = okLAB2RGB(lightness, scaled.ax, scaled.by); 

            const offset = (x + y * width) * 4;
            
            // plot canvas pixel
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

            // apply ring mask 
            ringPixelData[offset + 3] = 255*ringMaskData[(x + y * width)]; // A
        }
    }

    // plot canvas 
    canvasCTX.putImageData(canvasData, 0, 0);

    // plot ring
    ringCTX.putImageData(ringData, 0, 0);

    // add dot for centre
    canvasCTX.strokeStyle = "black";
    canvasCTX.strokeRect(width/2, height/2, 1, 1); 
}

/** Plots to left or right canvas based in new hue infomation */
export async function plotHue(colourObj) {
    const width = colourObj.plot.canvas.element.width
    const height = colourObj.plot.canvas.element.height
    const imageData = colourObj.plot.canvas.ctx.createImageData(width, height)
    const pixelData = new Uint8ClampedArray(imageData.data.buffer).fill(255);

    for (let x = 0; x <= width; x+= 1) {
        for (let y = 0; y <= height; y+= 1) { 
            // for reference, these are the ranges of values
            // lightness  = [1.05, -0.06111] (different to plotLight())
            // chroma = [0, 1/2.8] = [0, 0.35714]
            // hue = from param = [0, 360]
            const scaled = colourObj.transform_func(y/height, x/width, colourObj.hue)
            let col = okLCH2RGB(scaled.y, scaled.x, scaled.hue); 
            
            const offset = colourObj.offset_func(x, y, width, height); 
            
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
    colourObj.plot.canvas.ctx.putImageData(imageData, 0, 0);
}

/** Plots to left or right canvas based in new hue infomation */
export function plotHueWorker(colourObj) {
    function drawPlatter() {
        colourObj.plot.canvas.ctx.putImageData(imageData, 0, 0);
    }
    
    const workerNum = 1
    const workers = []
    const width = colourObj.plot.canvas.element.width
    const height = colourObj.plot.canvas.element.height
    // const section_height = height / workerNum
    // const length = height*width*4

    
    const imageData = colourObj.plot.canvas.ctx.createImageData(width, height)
    const pixelDataFull = new Uint8ClampedArray(imageData.data.buffer);
    let workersDone = 0


    const platterWorker = new Worker('scripts/plotLeftPlatterWorker.js'); 
    workers.push(platterWorker); 

    platterWorker.onmessage = function(event) {
        const { data, offset } = event.data;
        // const more_offset = ((offset%length)+length*(workerNum+1)/workerNum)%length
        pixelDataFull.set(data, 0); 
        workersDone++; 


        // Check if all workers are done
        if (workersDone === workerNum) {
            // All workers are done, draw the image
            drawPlatter()
        }
    };

    const hueValue = colourObj.hue
    // let offsetFunc = colourObj.offset_func
    // const workIndex = parseInt(work)

    platterWorker.postMessage([height, width, hueValue])

        // const result = calcPixData(work, section_height, height, width, colourObj)
        // const more_offset = ((result.offset%length)+length*(workerNum+1)/workerNum)%length
        // // console.log(more_offset)
        // pixelDataFull.set(result.data, more_offset); 

    // for (let i = 0; i < numWorkers; i++) {
    //     const worker = new Worker('worker.js');
    //     workers.push(worker);

    //     worker.onmessage = function(event) {
    //         const { startRow, data } = event.data;
    //         results[i] = { startRow, data };

    //         // Check if all workers are done
    //         if (results.filter(r => r).length === numWorkers) {
    //             // All workers are done, draw the image
    //             drawImage();
    //         }
    //     };

    //     // Assign each worker a portion of the image to compute
    //     const startRow = i * rowsPerWorker;
    //     const endRow = Math.min(startRow + rowsPerWorker, height);

    //     worker.postMessage({ startRow, endRow, width });
    // }

    // 
    // const imageData = new ImageData(pixelData, 500, 500);
    // colourObj.plot.canvas.ctx.putImageData(imageData, 0, 0);
}

function calcPixData(index, section_height, height, width, colourObj) {
    const pixelData = new Uint8ClampedArray(section_height*width*4).fill(255);
    // console.log(`from row ${startRow} to row ${endRow}`)

    const startRow = index*section_height
    const endRow = (index+1)*section_height

    for (let x = 0; x <= width; x+= 1) {
        for (let y = startRow; y < endRow; y+= 1) { 
            // for reference, these are the ranges of values
            // lightness  = [1.05, -0.06111] (different to plotLight())
            // chroma = [0, 1/2.8] = [0, 0.35714]
            // hue = from param = [0, 360]
            const scaled = colourObj.transform_func(y/height, x/width, colourObj.hue)
            let col = okLCH2RGB(scaled.y, scaled.x, scaled.hue); 
            
            const offset = colourObj.offset_func(x, y-startRow, width, section_height); 
            
            
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

    return {data: pixelData, offset: colourObj.offset_func(0, -section_height+startRow, width, section_height)}
}

/**
 * Plots the hue ring on a canvas at a specific chroma value (in radius distance
 * from the centre). Lightness is constant. Only calls from input from mixer, 
 * since mixer plot itself would not change from mixer input, to save redrawing 
 * unchanged mixer/ 
 * @param {*} canvasCTX 
 * @param {*} chroma 
 */
export async function plotChroma(middleObj, chroma, lightness) {
    let plotCTX = middleObj.ring.ctx
    const width = plotCTX.canvas.width
    const height = plotCTX.canvas.height
    
    // const pixelData = new Uint8ClampedArray(imageData.data.buffer).fill(255);
    function calcAndDraw(x, y) {
        const scaled = middleObj.transform_func(x/width, y/height, 0)
        const polar = cart2Polar(scaled.ax, scaled.by); 
        const edgeColour = okLCH2RGB(lightness, chroma, polar.angle)

        plotCTX.strokeStyle = `rgb(${edgeColour[0]*100}% ${edgeColour[1]*100}% ${edgeColour[2]*100}%)`;
        plotCTX.beginPath()
        plotCTX.moveTo(width/2, height/2)
        plotCTX.lineTo(x, y)
        plotCTX.stroke()
    }

    // iterate over left and right of canvas
    for (let x = 0; x < width; x+= 1) {
        calcAndDraw(x, 0)
        calcAndDraw(x, width)
    } 

    for (let y = 0; y < height; y+= 1) {
        calcAndDraw(0, y)
        calcAndDraw(height, y)
    } 
    
    let imageData = plotCTX.getImageData(0, 0, width, height)
    let pixelData = imageData.data 
    for (let x = 0; x < width; x+= 1) {
        for (let y = 0; y < height; y+= 1) { 
            const offset = (x + y*width)
            pixelData[offset*4 + 3] = 255*ringMaskData[offset]; // A
        }
    }

    plotCTX.putImageData(imageData, 0, 0);
}


/**Plots the blended gradient between the current left and right colours 
 * on the top canvas
 */
export function plotPaletteLABBlend(leftObj, rightObj, plotCTX, steps) {
    const width = plotCTX.canvas.width
    const height = plotCTX.canvas.height
    // console.log(`Left Colour: ${leftObj.lht} ${leftObj.chr} ${leftObj.hue}`)
    // console.log(`Right Colour: ${rightObj.lht} ${rightObj.chr} ${rightObj.hue}`)

    // clamp to valid colour first 
    const fallbackLeftLCH = findFallbackColour(leftObj.lht, leftObj.chr, leftObj.hue)
    const fallbackRightLCH = findFallbackColour(rightObj.lht, rightObj.chr, rightObj.hue)

    const leftLAB = okLCH2LAB(fallbackLeftLCH[0], fallbackLeftLCH[1], fallbackLeftLCH[2])
    const rightLAB = okLCH2LAB(fallbackRightLCH[0], fallbackRightLCH[1], fallbackRightLCH[2])

    
    // create array of colours first
    let stepColours = Array(steps+1).fill(0)
    for (let x = 0; x <= steps; x++) {
        const normX = x / steps

        const interL = (normX * (parseFloat(rightLAB[0]) - parseFloat(leftLAB[0]))) + parseFloat(leftLAB[0])
        const interA = (normX * (parseFloat(rightLAB[1]) - parseFloat(leftLAB[1]))) + parseFloat(leftLAB[1])
        const interB = (normX * (parseFloat(rightLAB[2]) - parseFloat(leftLAB[2]))) + parseFloat(leftLAB[2])
        const rgbArray = okLAB2RGB(interL, interA, interB)//.map(x => x*255)
    
        stepColours[x] = {
            lab: [interL, interA, interB], 
            lch: okLAB2LCH(interL, interA, interB), 
            rgb: rgbArray, 
            hex: RGB2HEX(rgbArray), 
        }
    }

    // console.log(stepColours[0].hex)

    // plot smooth gradient on CTX
    steps = width
    for (let x = 0; x <= steps; x++) {
        const normX = x / steps

        const interL = (normX * (parseFloat(rightLAB[0]) - parseFloat(leftLAB[0]))) + parseFloat(leftLAB[0])
        const interA = (normX * (parseFloat(rightLAB[1]) - parseFloat(leftLAB[1]))) + parseFloat(leftLAB[1])
        const interB = (normX * (parseFloat(rightLAB[2]) - parseFloat(leftLAB[2]))) + parseFloat(leftLAB[2])

        plotCTX.fillStyle = `oklab(${interL} ${interA} ${interB})`
        plotCTX.fillRect(parseInt(x*width/(steps+1)), 0, parseInt(width/(steps+1))+1, height)
        // console.log(`x: ${x} | ${interL} | ${interA} | ${interB})`)
    }
    return stepColours
}

export function findFallbackColour(l, c, h) {
    if (gamutCheck(okLCH2RGB(l, c, h))) {
        return [l, c, h]
    }

    if (l > 1) {
        l = 1
    } else if (l < 0) {
        l = 0
    }

    let low = 0
    let mid = 0
    let high = c
    const maxIterations = 100
    for (let i = 1; i < maxIterations; i++) {
        mid = (low + high) / 2

        if (gamutCheck(okLCH2RGB(l, mid, h))) {
            low = mid 
        } else {
            high = mid
        }
        
        if ((high - low) < 0.0001) {
            return [l, low, h]
        }
    }

    return [Math.round(l), 0, h]
}


export function polar2Cart(theta, radius) {
    const a = radius * Math.cos(theta * Math.PI / 180);
    const b = radius * Math.sin(theta * Math.PI / 180);
    return { a, b };
}

export function cart2Polar(x, y) {
    let radius = Math.sqrt(x**2 + y**2)
    let theta = (Math.atan2(y, x)*180/Math.PI + 360) % 360

    // console.log(`rad: ${parseInt(radius*100)} theta: ${parseInt(theta)}`)
    return {rad: radius, angle: theta}
}

/** Accepts RGB normalised values, and checks for > 1 or < 0 */
function gamutCheck(colourArray) {
    if (colourArray[0] > 1 || colourArray[1] > 1 || colourArray[2] > 1) {
        return false
    } 
    if (colourArray[0] < 0 || colourArray[1] < 0 || colourArray[2] < 0) {
        return false
    } 
    return true
}


function okLCH2RGB(l, c, h) {
    const cart = polar2Cart(h, c)
    return okLAB2RGB(l, cart.a, cart.b)
}

/**Please normalise beforehand */
export function RGB2LCH(r, g, b) {
    const lab = RGB2LAB(r, g, b) 
    const polar = cart2Polar(lab[1], lab[2])
    return [lab[0], polar.rad, polar.angle]
}

function okLCH2LAB(l, c, h) {
    const cart = polar2Cart(h, c)
    return [l, cart.a, cart.b]
}

function okLAB2LCH(l, a, b) {
    const polar = cart2Polar(a, b)
    return [l, polar.rad, polar.angle]
}

// function notokLAB2RGB(l, a, b_star) {
//     // oklab to xyz
//     const l1 = 0.9999999984505196*l + 0.39633779217376774*a + 0.2158037580607588*b_star
//     const m1 = 1.0000000088817607*l - 0.10556134232365633*a - 0.0638541747717059*b_star
//     const s1 = 1.0000000546724108*l - 0.08948418209496574*a - 1.2914855378640917*b_star

//     const ll = l1 * l1 * l1
//     const m = m1 * m1 * m1 
//     const s = s1 * s1 * s1

//     let r = 4.07674166*ll -3.30771159*m + 0.23096993*s
//     let g = -1.268438*ll + 2.6097574*m -0.3413194 *s
//     let b = -0.07637294974672142*ll -0.4214933239627916*m + 1.5869240244272422*s

//     // delinearise approx
//     // http://stereopsis.com/polygamma.html
//     r = 1.49*r*r*r -3.23*r*r + 2.74*r
//     g = 1.49*g*g*g -3.23*g*g + 2.74*g
//     b = 1.49*b*b*b -3.23*b*b + 2.74*b

//     return [r, g, b]
// }

function okLAB2RGB(l, a, b_star) {
    // https://bottosson.github.io/posts/oklab/
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
    r = r <= 0.0031308 ? 12.92 * r : 1.055*(pow512(r)) - 0.055; 
    g = g <= 0.0031308 ? 12.92 * g : 1.055*(pow512(g)) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : 1.055*(pow512(b)) - 0.055;

    // // delinearise approx
    // // // http://stereopsis.com/polygamma.html
    // https://stackoverflow.com/questions/6475373/optimizations-for-pow-with-const-non-integer-exponent/
    // r = delinear(r)
    // g = delinear(g)
    // b = delinear(b)

    return [r, g, b]
}

function RGB2LAB(r, g, b) {
    // https://bottosson.github.io/posts/oklab/
    // https://bottosson.github.io/posts/colorwrong/#what-can-we-do%3F
    r = r < 0.04045 ? r / 12.92 : ((r + 0.055)/(1 + 0.055))**2.4; 
    g = g < 0.04045 ? g / 12.92 : ((g + 0.055)/(1 + 0.055))**2.4; 
    b = b < 0.04045 ? b / 12.92 : ((b + 0.055)/(1 + 0.055))**2.4; 

    let l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
	let m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
	let s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

    l = Math.cbrt(l);
    m = Math.cbrt(m);
    s = Math.cbrt(s);

    const ok_l = 0.2104542553*l + 0.7936177850*m - 0.0040720468*s
    const ok_a = 1.9779984951*l - 2.4285922050*m + 0.4505937099*s
    const ok_b = 0.0259040371*l + 0.7827717662*m - 0.8086757660*s

    return [ok_l, ok_a, ok_b]
}

/**Parameter is a 3 value array */
function RGB2HEX(rgb) {
    // return [rgb[0].toString(16), rgb[1].toString(16), rgb[2]).toString(16)]
    // return "#" + rgb.map(x => ((Math.round(x*255)).toString(16)).padStart(2, '0').toUpperCase()).join("")
    return rgb.map(x => ((Math.round(x*255)).toString(16)).padStart(2, '0').toUpperCase()).join("")
}

/**Angles need to be in degrees pls */
function interpAngle(a0, a1, x) {
    const delta = ((((a1-a0) % 360)+540) % 360) - 180 
    return (x*delta + a0 + 360) % 360
}

function pow512(x) {
    const cbrtx = Math.cbrt(x)
    return cbrtx*Math.sqrt(Math.sqrt(cbrtx))
    // return x**(5/12)
}



