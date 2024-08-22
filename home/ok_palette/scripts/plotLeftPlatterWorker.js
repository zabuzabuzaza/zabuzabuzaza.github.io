
self.onmessage = function(event) {
    const  [height, width, hueValue]  = event.data 
    // console.log(`${workerIndex}`)
    const pixelData = new Uint8ClampedArray(height*width*4).fill(255);
    
    // console.log(`from row ${startRow} to row ${endRow}`)

    for (let x = 0; x <= width; x+= 1) {
        for (let y = 0; y <= height; y+= 1) { 
            // for reference, these are the ranges of values
            // lightness  = [1.05, -0.06111] (different to plotLight())
            // chroma = [0, 1/2.8] = [0, 0.35714]
            // hue = from param = [0, 360]
            const scaled = transform_func(y/height, x/width, hueValue)
            let col = okLCH2RGB(scaled.y, scaled.x, scaled.hue); 
            
            const offset = offset_func(x, y, width, height); 
            
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
    // console.log(pixelData)

    // return {data: pixelData, offset: colourObj.offset_func(0, -section_height+startRow, width, section_height)}
    self.postMessage({data: pixelData, offset: 0}); 
}; 

function okLCH2RGB(l, c, h) {
    const cart = polar2Cart(h, c)
    return okLAB2RGB(l, cart.a, cart.b)
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

    // delinearise 
    r = r <= 0.0031308 ? 12.92 * r : 1.055*(pow512(r)) - 0.055; 
    g = g <= 0.0031308 ? 12.92 * g : 1.055*(pow512(g)) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : 1.055*(pow512(b)) - 0.055;
    // https://stackoverflow.com/questions/6475373/optimizations-for-pow-with-const-non-integer-exponent/

    return [r, g, b]
}

function pow512(x) {
    const cbrtx = Math.cbrt(x)
    return cbrtx*Math.sqrt(Math.sqrt(cbrtx))
}

function offset_func(x, y, width, height) {
    return 4 * (width*height - (x + y * width))
}

function transform_func(y, x, h, inverse=false) {
    if (inverse) {
        return {
            y: (parseFloat(y) + 0.05)*0.9, 
            x: x*2.8, 
            hue: h, 
        }
    }
    return {
        y: (y/0.9)-0.05, 
        x: x/2.8, 
        hue: h, 
    }
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

function polar2Cart(theta, radius) {
    const a = radius * Math.cos(theta * Math.PI / 180);
    const b = radius * Math.sin(theta * Math.PI / 180);
    return { a, b };
}

function cart2Polar(x, y) {
    let radius = Math.sqrt(x**2 + y**2)
    let theta = (Math.atan2(y, x)*180/Math.PI + 360) % 360

    // console.log(`rad: ${parseInt(radius*100)} theta: ${parseInt(theta)}`)
    return {rad: radius, angle: theta}
}