/*------------------------------------------------------------------------------
|                          |   Colour Palette Deck   |                         |   
|                          |      Palette Strip      |                         |   
|                          |                         |                         |   
|        Mix Left          |          Mix            |        Mix Right        |   
|     Chroma + Lightness   |      Chroma + Hue       |   Chroma + Lightness    |   
|                          |                         |                         |   
|                          |                         |                         |   
------------------------------------------------------------------------------*/
import { 
    plotHue, plotLight, plotChroma, cart2Polar, polar2Cart, createRingMask
} from "./colours.js"


// DOM MANAGEMENT
//------------------------------------------------------------------------------
// STYLE CONSTANTS 
const PLATTER_WIDTH = 300
const PLATTER_HEIGHT = 400
const MIXER_WIDTH = 400
const MIXER_HEIGHT = 400

const MIXER_CHROMA_SCALING = 0.8

// const CHROMA_RANGE = 

// MAIN MIDDLE DECK
//   LEFT PLATTER

const leftPlatterCanvas = document.getElementById("chroma-canvas-left"); 
leftPlatterCanvas.width = PLATTER_WIDTH
leftPlatterCanvas.height = PLATTER_HEIGHT

const leftPlatterOverlayCanvas = document.getElementById("chroma-canvas-overlay-left"); 
leftPlatterOverlayCanvas.width = PLATTER_WIDTH
leftPlatterOverlayCanvas.height = PLATTER_HEIGHT
leftPlatterOverlayCanvas.style.right = 0 + "px"

const leftPlatter = {
    canvas: {
        element: leftPlatterCanvas, 
        ctx: leftPlatterCanvas.getContext('2d'), 
    }, 
    overlay: {
        element: leftPlatterOverlayCanvas, 
        ctx: leftPlatterOverlayCanvas.getContext('2d')
    }   
}

const sliderLeftHue = document.getElementById("slider-left-hue");
const sliderLeftChr = document.getElementById("slider-left-chr");
const sliderLeftLht = document.getElementById("slider-left-lht");
const colourLeftHueLabel = document.getElementById("platter-controls-left-labels-hue");
const colourLeftChrLabel = document.getElementById("platter-controls-left-labels-chr");
const colourLeftLhtLabel = document.getElementById("platter-controls-left-labels-lht");

sliderLeftHue.addEventListener('input', (InputEvent) => {
    rightSideActive = false; 
    left.hue = InputEvent.target.value; 
    onSliderChange(left)
}); 
sliderLeftChr.addEventListener('input', (InputEvent) => {
    rightSideActive = false; 
    left.chr = InputEvent.target.value; 
    onSliderChange(left)
});
sliderLeftLht.addEventListener('input', (InputEvent) => {
    rightSideActive = false; 
    left.lht = InputEvent.target.value; 
    onSliderChange(left)
});

leftPlatterOverlayCanvas.addEventListener("mousedown", () => {mouseDown = true; } )
leftPlatterOverlayCanvas.addEventListener("mouseup", () => {mouseDown = false; } )
leftPlatterOverlayCanvas.addEventListener(
    // "mousedown", (MouseEvent) => getPlatterColour(MouseEvent, leftPlatter.overlay.element, -1) 
    "mousedown", (MouseEvent) => {
        rightSideActive = false; 
        getPlatterColour(MouseEvent, left)
    }

)
leftPlatterOverlayCanvas.addEventListener(
    "mousemove", (MouseEvent) => {
        rightSideActive = false; 
        getPlatterColour(MouseEvent, left)
    }
)


//   MIDDLE MIXER SECTION 
const middleMixerCanvas = document.getElementById("lightness-canvas"); 
middleMixerCanvas.width = MIXER_WIDTH
middleMixerCanvas.height = MIXER_HEIGHT

const middleMixerRing = document.getElementById("lightness-canvas-ring"); 
middleMixerRing.width = MIXER_WIDTH
middleMixerRing.height = MIXER_HEIGHT
middleMixerRing.style.left = 0 + "px"

const middleMixerOverlayCanvas = document.getElementById("lightness-canvas-overlay"); 
middleMixerOverlayCanvas.width = MIXER_WIDTH
middleMixerOverlayCanvas.height = MIXER_HEIGHT
middleMixerOverlayCanvas.style.left = 0 + "px" // in the future, the offset is -helf of difference between canvas and overlay size

const middleMixer = {
    position: [0, 0], 
    canvas: {
        element: middleMixerCanvas, 
        ctx: middleMixerCanvas.getContext('2d', {willReadFrequently: true}), 
    }, 
    ring: {
        element: middleMixerRing, 
        ctx: middleMixerRing.getContext('2d', {willReadFrequently: true}), 
    }, 
    overlay: {
        element: middleMixerOverlayCanvas, 
        ctx: middleMixerOverlayCanvas.getContext('2d'), 
    }, 
    transform_func: customMixerRange, 
}

middleMixerOverlayCanvas.addEventListener("mousedown", () => {mouseDown = true; } )
middleMixerOverlayCanvas.addEventListener("mouseup", () => {mouseDown = false; } )
middleMixerOverlayCanvas.addEventListener(
    "mousedown", (MouseEvent) => getMixerColour(MouseEvent) 
)
middleMixerOverlayCanvas.addEventListener(
    "mousemove", (MouseEvent) => getMixerColour(MouseEvent) 
)






//   RIGHT PLATTER 
const rightPlatterCanvas = document.getElementById("chroma-canvas-right"); 
rightPlatterCanvas.width = PLATTER_WIDTH
rightPlatterCanvas.height = PLATTER_HEIGHT

const rightPlatterOverlayCanvas = document.getElementById("chroma-canvas-overlay-right"); 
rightPlatterOverlayCanvas.width = PLATTER_WIDTH
rightPlatterOverlayCanvas.height = PLATTER_HEIGHT
rightPlatterOverlayCanvas.style.left = 0 + "px"

const rightPlatter = {
    canvas: {
        element: rightPlatterCanvas, 
        ctx: rightPlatterCanvas.getContext('2d'), 
    }, 
    overlay: {
        element: rightPlatterOverlayCanvas, 
        ctx: rightPlatterOverlayCanvas.getContext('2d')
    }   
}



const sliderRightHue = document.getElementById("slider-right-hue");
const sliderRightChr = document.getElementById("slider-right-chr");
const sliderRightLht = document.getElementById("slider-right-lht");
const colourRightHueLabel = document.getElementById("platter-controls-right-labels-hue");
const colourRightChrLabel = document.getElementById("platter-controls-right-labels-chr");
const colourRightLhtLabel = document.getElementById("platter-controls-right-labels-lht");

sliderRightHue.addEventListener('input', (InputEvent) => {
    rightSideActive = true; 
    right.hue = InputEvent.target.value; 
    onSliderChange(right)
}); 
sliderRightChr.addEventListener('input', (InputEvent) => {
    rightSideActive = true; 
    right.chr = InputEvent.target.value; 
    onSliderChange(right)
});
sliderRightLht.addEventListener('input', (InputEvent) => {
    rightSideActive = true; 
    right.lht = InputEvent.target.value; 
    onSliderChange(right)
});


rightPlatterOverlayCanvas.addEventListener("mousedown", () => {mouseDown = true; } )
rightPlatterOverlayCanvas.addEventListener("mouseup", () => {mouseDown = false; } )
rightPlatterOverlayCanvas.addEventListener(
    "mousedown", (MouseEvent) => {
        rightSideActive = true; 
        getPlatterColour(MouseEvent, right)
    } 
)
rightPlatterOverlayCanvas.addEventListener(
    "mousemove", (MouseEvent) => {
        rightSideActive = true; 
        getPlatterColour(MouseEvent, right)
    }
)

// ----------------------------------------------------------------------------
// SCRIPT 
// ----------------------------------------------------------------------------

/**Mouse Status to change colour values */
let mouseDown = false; 
/**Boolean to check wich side is active to change platter */
let rightSideActive = false; 

const left = {
    lht: sliderLeftLht.value, 
    chr: sliderLeftChr.value, 
    hue: sliderLeftHue.value, 
    position: [0, 0], 
    plot: leftPlatter, 
    /**transforms x and y into lightness (-0.05, 1.0611) and chroma [0, 0.357]*/
    transform_func: customPlatterRangeFlipped, 
    offset_func: (x, y, width, height) => {return 4 * (width*height - (x + y * width))}, 
}

const right = {
    lht: sliderRightLht.value, 
    chr: sliderRightChr.value, 
    hue: sliderRightHue.value, 
    position: [0, 0], 
    plot: rightPlatter, 
    /**transforms x and y into lightness (-0.05, 1.0611) and chroma [0, 0.357]*/
    transform_func: customPlatterRange, 
    offset_func: (x, y, width, height) => {return (x + y * width) * 4}
}

//--------------------------------------------------------------------------
// ON LOAD 
//-----------------------------------------------------------------------------

createRingMask(MIXER_WIDTH, MIXER_HEIGHT)




/**
 * Gets the mouse cursor co-ordinates for the platter canvases, and translates 
 * them into (x => chroma, y => lightness) for their corresponding ranges. 
 * See colours.js plotLight for value ranges for chroma and lightness, which is 
 * just whatever looks best for now. All you need to do is make sure they're the same. 
 * 
 * @param {*} event 
 * @param {*} colourObject (left or right)
 */
function getPlatterColour(event, colourObj) {
    if (mouseDown) {
        const x = event.offsetX; 
        const y = event.offsetY; 

        colourObj.position[0] = x; 
        colourObj.position[1] = y; 
        
        const rightSide = rightSideActive? 1: -1; 
        const normX = ((x / PLATTER_WIDTH)-0.5)*rightSide + 0.5; 
        const normY = ((y / PLATTER_HEIGHT)-0.5)*rightSide + 0.5; 

        // console.log(`Clicked at ${normX} ${normY}`)

        const scaled = colourObj.transform_func(normY, normX, 0)

        colourObj.chr = scaled.x
        colourObj.lht = scaled.y
        updateOverlays(colourObj)

        // console.log(`Clicked at C:${colourObj.chr} L:${colourObj.lht}`)
        plotLight(middleMixer, colourObj.chr, colourObj.lht)
        

    }
}



/**
 * Gets the mouse cursor co-ordinates for the mixer canvas, and translates 
 * them into (x => a, y => b) for their corresponding ranges. 
 * See colours.js plotHue for value ranges for a and b, which is 
 * just whatever looks best for now. All you need to do is make sure they're the same. 
 * 
 * @param {*} event 
 */
function getMixerColour(event) {
    if (mouseDown) {
        const x = event.offsetX; 
        const y = event.offsetY; 

        middleMixer.position[0] = x; 
        middleMixer.position[1] = y; 

        const normX = x / MIXER_WIDTH; 
        const normY = y / MIXER_HEIGHT; 

        // console.log(`Mixer Clicked at ${normX} ${normY}`)

        // transform to chroma and lightness 
        const labScaled = middleMixer.transform_func(normX, normY, 0); 
        const polarConvert = cart2Polar(labScaled.ax, labScaled.by)

        let colourObj = (rightSideActive) ? right: left; 
        colourObj.chr = polarConvert.rad
        colourObj.hue = polarConvert.angle
        updateOverlays(colourObj)

        plotHue(colourObj)
        plotChroma(middleMixer, colourObj.chr, colourObj.lht)
        
        // hue ring still not working yet
        
        
        // plotChroma(middleMixer, right.chr, right.lht)
        // let pixelData = middleMixer.canvas.ctx.getImageData(0, 0, MIXER_WIDTH, MIXER_HEIGHT)
        // const offset = (x+y*MIXER_WIDTH)*4
        // console.log(`${pixelData.data[offset]} ${pixelData.data[offset+1]} ${pixelData.data[offset+2]} ${pixelData.data[offset+3]}`)
        
    }
}

/**
 * Requires either the left or right platter context to plot the chroma plot to, 
 * but always plots to the mixer as well. 
 * 
 * Also calls updateColourLabel(). 
 * @param leftPlatterCTX or rightPlatterCTX
 */
function onSliderChange(colourObj) {
    plotHue(colourObj)
    
    plotLight(middleMixer, colourObj.chr, colourObj.lht)

    updateOverlays(colourObj)
}

/**
 * radius is the chroma value
 */
function updateOverlays(colourObj) {
    setColourPositions()


    // update platter overlay
    const platterCTX = colourObj.plot.overlay.ctx; 
    platterCTX.reset()
    platterCTX.strokeStyle = "black";
    platterCTX.strokeRect(colourObj.position[0], colourObj.position[1], 3, 3); 

    // horizontal
    platterCTX.fillRect(0, colourObj.position[1], PLATTER_WIDTH, 1)

    // vertical 
    platterCTX.fillRect(colourObj.position[0], 0, 1, PLATTER_HEIGHT)

    // update mixer overlay
    const x = middleMixer.position[0]
    const y = middleMixer.position[1]
    // console.log(`${x} ${y}`)

    const middleCTX = middleMixer.overlay.ctx; 
    middleCTX.reset()
    middleCTX.strokeStyle = "black";
    middleCTX.strokeRect(x, y, 3, 3); 
    

    // ray (line from middle to edge, then rotate)
    middleCTX.beginPath()
    middleCTX.moveTo(MIXER_WIDTH/2, MIXER_HEIGHT/2)
    middleCTX.lineTo(x, y)
    middleCTX.stroke()

    // ring 
    // un-normalise radius value
    const radius = colourObj.chr*MIXER_HEIGHT/MIXER_CHROMA_SCALING
    middleCTX.beginPath()
    middleCTX.ellipse(MIXER_WIDTH/2, MIXER_HEIGHT/2, radius, radius, 0, 0, Math.PI*2); 
    middleCTX.stroke();
}

/** Set new x, y positions based on lch values */
function setColourPositions() {
    const newLeftPos = left.transform_func(left.lht, left.chr, 0, true)
    left.position[0] = (1-newLeftPos.x)*PLATTER_WIDTH
    left.position[1] = (1-newLeftPos.y)*PLATTER_HEIGHT

    const newRightPos = right.transform_func(right.lht, right.chr, 0, true)
    right.position[0] = newRightPos.x*PLATTER_WIDTH
    right.position[1] = newRightPos.y*PLATTER_HEIGHT

    let activeColour = rightSideActive? right: left; 
    const hc2xy = polar2Cart(activeColour.hue, activeColour.chr)
    const newMiddlePos = middleMixer.transform_func(hc2xy.a, hc2xy.b, 0, true)
    
    middleMixer.position[0] = newMiddlePos.ax*MIXER_WIDTH
    middleMixer.position[1] = newMiddlePos.by*MIXER_HEIGHT

    // set slider labels 
    sliderLeftHue.value = left.hue
    sliderLeftChr.value = left.chr
    sliderLeftLht.value = left.lht

    sliderRightHue.value = right.hue
    sliderRightChr.value = right.chr
    sliderRightLht.value = right.lht

    colourLeftHueLabel.textContent = `${parseInt(sliderLeftHue.value)}`; 
    colourLeftChrLabel.textContent = `${parseFloat(sliderLeftChr.value)}`; 
    colourLeftLhtLabel.textContent = `${parseFloat(sliderLeftLht.value)}`; 

    colourRightHueLabel.textContent = `${parseInt(sliderRightHue.value)}`; 
    colourRightChrLabel.textContent = `${parseFloat(sliderRightChr.value)}`; 
    colourRightLhtLabel.textContent = `${parseFloat(sliderRightLht.value)}`; 
}



/**
 * To flip the original function (x/a) + b along 0.5 vertical axis, 
 * (1 + ab - x)/a
 */
function customPlatterRange(y, x, h, inverse=false) {
    if (inverse) {
        return {
            y: -((y*0.9)-1+0.045), 
            x: x*2.8, 
            hue: h, 
        }
    }
    return {
        y: (1-0.045-y)/0.9, 
        x: x/2.8, 
        hue: h, 
    }
}

/**
 * To flip the original function (x/a) + b along 0.5 vertical axis, 
 * (1 + ab - x)/a. This is the non-flipped one
 */
function customPlatterRangeFlipped(y, x, h, inverse=false) {
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

function customMixerRange(ax, by, noChange, inverse=false) {
    if (inverse) {
        return {
            ax: (ax/MIXER_CHROMA_SCALING)+0.5, 
            by: (by/MIXER_CHROMA_SCALING)+0.5, 
            z: noChange, 
        }
    }
    return {
        ax: (ax-0.5)*MIXER_CHROMA_SCALING, 
        by: (by-0.5)*MIXER_CHROMA_SCALING, 
        z: noChange, 
    }
}


