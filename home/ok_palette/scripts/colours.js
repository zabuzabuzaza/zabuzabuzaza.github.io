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
export function plotLight(mixerObj, chroma, lightness) {
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
export function plotHue(colourObj) {
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

/**
 * Plots the hue ring on a canvas at a specific chroma value (in radius distance
 * from the centre). Lightness is constant. Only calls from input from mixer, 
 * since mixer plot itself would not change from mixer input, to save redrawing 
 * unchanged mixer/ 
 * @param {*} canvasCTX 
 * @param {*} chroma 
 */
export function plotChroma(middleObj, chroma, lightness) {
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
    let polar = polar2Cart(h, c)
    return okLAB2RGB(l, polar.a, polar.b)
}

function okLAB2RGB(l, a, b_star) {
    // oklab to xyz
    const l1 = 0.9999999984505196*l + 0.39633779217376774*a + 0.2158037580607588*b_star
    const m1 = 1.0000000088817607*l - 0.10556134232365633*a - 0.0638541747717059*b_star
    const s1 = 1.0000000546724108*l - 0.08948418209496574*a - 1.2914855378640917*b_star

    const ll = l1 * l1 * l1
    const m = m1 * m1 * m1 
    const s = s1 * s1 * s1

    let r = 4.07674166*ll -3.30771159*m + 0.23096993*s
    let g = -1.268438*ll + 2.6097574*m -0.3413194 *s
    let b = -0.07637294974672142*ll -0.4214933239627916*m + 1.5869240244272422*s

    // delinearise approx
    // http://stereopsis.com/polygamma.html
    r = 1.49*r*r*r -3.23*r*r + 2.74*r
    g = 1.49*g*g*g -3.23*g*g + 2.74*g
    b = 1.49*b*b*b -3.23*b*b + 2.74*b

    return [r, g, b]
}


