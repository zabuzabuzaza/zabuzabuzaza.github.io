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
    plotHue, plotLight, plotChroma, cart2Polar, polar2Cart, createRingMask, 
    findFallbackColour, RGB2LCH, 
    plotPaletteLABBlend
} from "./colours.js"


// DOM MANAGEMENT
//------------------------------------------------------------------------------
// STYLE CONSTANTS 
const PLATTER_WIDTH = 300
const PLATTER_HEIGHT = 400
const MIXER_WIDTH = 400
const MIXER_HEIGHT = 400

const MIXER_CHROMA_SCALING = 0.9

// GENERAL STYLE ELEMENTS


// TOP DECK
const labpaletteBlendCanvas = document.getElementById("lab-palette-blend-canvas")
const labpaletteBlendCTX = labpaletteBlendCanvas.getContext('2d')

const paletteContainer = document.getElementById("palette-blocks-group")

// paletteBlendCTX.fillStyle = `red`
// paletteBlendCTX.fillRect(0, 0, paletteBlendCanvas.width, paletteBlendCanvas.height)

// MAIN MIDDLE DECK
//   LEFT PLATTER

const platterElementLeft = document.getElementById("platter-left")

const leftPlatterCanvas = document.getElementById("chroma-canvas-left"); 
leftPlatterCanvas.width = PLATTER_WIDTH
leftPlatterCanvas.height = PLATTER_HEIGHT

const leftPlatterOverlayCanvas = document.getElementById("chroma-canvas-overlay-left"); 
leftPlatterOverlayCanvas.width = PLATTER_WIDTH
leftPlatterOverlayCanvas.height = PLATTER_HEIGHT
leftPlatterOverlayCanvas.style.left = (PLATTER_WIDTH*0) + "px"
// leftPlatterOverlayCanvas.style.top = (PLATTER_WIDTH*0) + "px"

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

const pickerLeft = document.getElementById("picker-left"); 

// pickerLeft.addEventListener('input', (InputEvent) => {
//     rightSideActive = false; 
//     plotFromRGB(InputEvent, left)
// })
pickerLeft.addEventListener('change', (InputEvent) => {
    rightSideActive = false; 
    plotFromRGB(InputEvent, left)
})

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

// add wheel events as well
sliderLeftHue.addEventListener('wheel', (WheelEvent) => {
    wheelInputLoop(WheelEvent, sliderLeftHue, 1)
    rightSideActive = false; 
    left.hue = WheelEvent.target.value; 
    onSliderChange(left)
}); 
sliderLeftChr.addEventListener('wheel', (WheelEvent) => {
    // wheelInput(WheelEvent, sliderLeftChr, parseFloat(sliderLeftChr.getAttribute("step")))
    wheelInput(WheelEvent, sliderLeftChr, 0.001)
    rightSideActive = false; 
    left.chr = WheelEvent.target.value; 
    onSliderChange(left)
});
sliderLeftLht.addEventListener('wheel', (WheelEvent) => {
    // wheelInput(WheelEvent, sliderLeftLht, parseFloat(sliderLeftLht.getAttribute("step")))
    wheelInput(WheelEvent, sliderLeftLht, 0.001)
    rightSideActive = false; 
    left.lht = WheelEvent.target.value; 
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
// middleMixerRing.style.top = 0 + "px"

const middleMixerOverlayCanvas = document.getElementById("lightness-canvas-overlay"); 
middleMixerOverlayCanvas.width = MIXER_WIDTH
middleMixerOverlayCanvas.height = MIXER_HEIGHT
middleMixerOverlayCanvas.style.left = 0 + "px" // in the future, the offset is -helf of difference between canvas and overlay size
// middleMixerOverlayCanvas.style.top = 0 + "px"

const middleMixer = {
    position: [0, 0], 
    hue_angle: 0, 
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
const platterElementRight = document.getElementById("platter-right")

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

const pickerRight = document.getElementById("picker-right"); 

// pickerRight.addEventListener('input', (InputEvent) => {
//     rightSideActive = true; 
//     plotFromRGB(InputEvent, right)
// })
pickerRight.addEventListener('change', (InputEvent) => {
    rightSideActive = true; 
    plotFromRGB(InputEvent, right)
})

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

// wheel events 
sliderRightHue.addEventListener('wheel', (WheelEvent) => {
    wheelInputLoop(WheelEvent, sliderRightHue, 1)
    rightSideActive = true; 
    right.hue = WheelEvent.target.value; 
    onSliderChange(right)
}); 
sliderRightChr.addEventListener('wheel', (WheelEvent) => {
    wheelInput(WheelEvent, sliderRightChr, 0.001)
    rightSideActive = true; 
    right.chr = WheelEvent.target.value; 
    onSliderChange(right)
});
sliderRightLht.addEventListener('wheel', (WheelEvent) => {
    wheelInput(WheelEvent, sliderRightLht, 0.001)
    rightSideActive = true; 
    right.lht = WheelEvent.target.value; 
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
    // offset_func: (x, y, width, height) => {return (x + y * width) * 4}
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
onLoad()




function onLoad() {
    createRingMask(MIXER_WIDTH, MIXER_HEIGHT)
    plotLight(middleMixer, right.chr, right.lht)
    plotHue(right)
    plotHue(left)

    updateOverlays(left)
    updateOverlays(right)



}

function setActiveColour() {
    if (rightSideActive) {
        platterElementRight.style.outlineColor = "black";
        platterElementLeft.style.outlineColor = "white";
    } else {
        platterElementLeft.style.outlineColor = "black";
        platterElementRight.style.outlineColor = "white";
    }
}

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

        // check colour 
        const fallBackLCH = findFallbackColour(colourObj.lht, colourObj.chr, colourObj.hue)
        
        // and clamp the chroma back the way it bloody came from
        colourObj.chr = fallBackLCH[1]
        colourObj.lht = fallBackLCH[0]

        const unscaled = colourObj.transform_func(scaled.y, scaled.x, 0, true)

        colourObj.position[0] = (((unscaled.x - 0.5)/rightSide)+0.5)*PLATTER_WIDTH
        colourObj.position[1] = (((unscaled.y - 0.5)/rightSide)+0.5)*PLATTER_HEIGHT

        
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
async function getMixerColour(event) {
    if (mouseDown) {
        const x = event.offsetX; 
        const y = event.offsetY; 

        middleMixer.position[0] = x; 
        middleMixer.position[1] = y; 

        const normX = x / MIXER_WIDTH; 
        const normY = y / MIXER_HEIGHT; 

        // transform to chroma and lightness 
        const labScaled = middleMixer.transform_func(normX, normY, 0); 
        const polarConvert = cart2Polar(labScaled.ax, labScaled.by)

        let colourObj = (rightSideActive) ? right: left; 
        colourObj.chr = polarConvert.rad
        colourObj.hue = polarConvert.angle

        // check colour 
        const fallBackLCH = findFallbackColour(colourObj.lht, colourObj.chr, colourObj.hue)

        // and clamp the chroma back from whence it came
        colourObj.chr = fallBackLCH[1]
        colourObj.hue = fallBackLCH[2]

        const cartReverse = polar2Cart(polarConvert.angle, polarConvert.rad)
        const unScaled = middleMixer.transform_func(cartReverse.a, cartReverse.b, 0, true)

        middleMixer.position[0] = unScaled.ax * MIXER_WIDTH
        middleMixer.position[1] = unScaled.by * MIXER_HEIGHT




        
        updateOverlays(colourObj)

        const promises = []
        promises.push(plotHue(colourObj))
        promises.push(plotLight(middleMixer, colourObj.chr, colourObj.lht))
        await Promise.all(promises)

        // plotHue(colourObj)
        // plotChroma(middleMixer, colourObj.chr, colourObj.lht)
    
    }
}

/**
 * Requires either the left or right platter context to plot the chroma plot to, 
 * but always plots to the mixer as well. 
 * 
 * Also calls updateColourLabel(). 
 * @param leftPlatterCTX or rightPlatterCTX
 */
async function onSliderChange(colourObj) {
    const promises = []
    promises.push(plotHue(colourObj))
    promises.push(plotLight(middleMixer, colourObj.chr, colourObj.lht))
    await Promise.all(promises)

    updateOverlays(colourObj)
}

/**
 * radius is the chroma value
 */
function updateOverlays(colourObj) {
    // check if input is only for hue, or for hue + chroma
    const midx = middleMixer.position[0]
    const midy = middleMixer.position[1]
    if ((midx-MIXER_WIDTH/2)**2 + (midy-MIXER_HEIGHT/2)**2 > 160**2) {
        setColourPositionsNoChroma()
    } else {
        setColourPositions()
    }

    setActiveColour()
    setPaletteColours()
    
    // update platter overlay
    const platterCTX = colourObj.plot.overlay.ctx; 
    platterCTX.reset()
    platterCTX.strokeStyle = "black";
    // platterCTX.strokeRect(colourObj.position[0], colourObj.position[1], 3, 3); 

    // horizontal
    platterCTX.fillRect(0, colourObj.position[1], PLATTER_WIDTH, 1)

    // vertical 
    platterCTX.fillRect(colourObj.position[0], 0, 1, PLATTER_HEIGHT)

    // update mixer overlay
    const middleCTX = middleMixer.overlay.ctx; 
    middleCTX.reset()
    middleCTX.strokeStyle = "black";
    middleCTX.lineWidth = 3
    // middleCTX.strokeRect(midx, midy, 3, 3); 

    // ray (line from middle to edge, then rotate)
    middleCTX.translate(MIXER_WIDTH/2, MIXER_HEIGHT/2)

    middleCTX.rotate((middleMixer.hue_angle-90)*Math.PI/180)
    middleCTX.fillRect(0, 0, 1, 160)
    middleCTX.strokeRect(-3, 179, 8, 17)
    
    middleCTX.translate(-MIXER_WIDTH/2, -MIXER_HEIGHT/2)
    

    // ring 
    middleCTX.lineWidth = 1
    // un-normalise radius value
    let radius = colourObj.chr*MIXER_HEIGHT/MIXER_CHROMA_SCALING
    middleCTX.beginPath()
    middleCTX.ellipse(MIXER_WIDTH/2, MIXER_HEIGHT/2, radius, radius, 0, 0, Math.PI*2); 
    middleCTX.stroke();
    
}

function plotFromRGB(InputEvent, colourObj) {
    const hex = InputEvent.target.value.slice(1)
    const rgb = [
        parseInt(hex.slice(0, 2), 16), 
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4), 16),
    ]
    

    const lch = RGB2LCH(rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0)
    console.log(`rgb: ${rgb}`)
    console.log(`lch: ${lch}`)

    colourObj.lht = lch[0]
    colourObj.chr = lch[1]
    colourObj.hue = lch[2]

    // console.log(`updatelch: ${left.lch[0]} ${lch[1]} ${lch[2]}`)
    
    onSliderChange(colourObj)
    // setColourPositions()
    // plotHue(colourObj)
    // plotLight(middleMixer, colourObj.chr, colourObj.lht)
    // updateOverlays(colourObj)
}

/**Please include the # in the hexValues */
function updatePickers(leftHEX, rightHEX) {
    // console.log(`setting left picker to:  ${leftHEX}`)
    pickerLeft.value = leftHEX
    pickerRight.value = rightHEX
}

function setPaletteColours() {
    // plotPaletteLABBlend(left, right, lchpaletteBlendCTX, 0)
    const stepColours = plotPaletteLABBlend(left, right, labpaletteBlendCTX, 13)

    // remove all previous blocks
    while (paletteContainer.firstChild) {
        paletteContainer.removeChild(paletteContainer.firstChild);
    }

    for (let i = 0; i < stepColours.length; i++) {
        const block = document.createElement('div')
        block.style.backgroundColor = `oklch(${stepColours[i].lch[0]} ${stepColours[i].lch[1]} ${stepColours[i].lch[2]})`; // Generate a different color for each block
        block.style.flexBasis = `${100 / stepColours.length}%`; // Set the width of each block based on the number of blocks

        const leftText = document.createElement('div')
        const midText = document.createElement('div')
        const rightText = document.createElement('div')

        leftText.classList.add("left")
        midText.classList.add("mid")
        rightText.classList.add("right")

        leftText.textContent = (
            `LCH\n` +
            `${toFix(stepColours[i].lch[0], 3)}\n` + 
            `${toFix(stepColours[i].lch[1], 3)}\n` +
            `${toFix(stepColours[i].lch[2], 1)}` 
        )
        midText.textContent = (
            `HEX\n` +
            `${stepColours[i].hex}\n` 
        )
        rightText.textContent = (
            `RGB\n` +
            `${toFix(stepColours[i].rgb[0]*255, 0)}\n` + 
            `${toFix(stepColours[i].rgb[1]*255, 0)}\n` +
            `${toFix(stepColours[i].rgb[2]*255, 0)}` 
        )
        // midText.textContent = (
        //     `LAB\n` +
        //     `${toFix(stepColours[i].lab[0], 3)}\n` + 
        //     `${toFix(stepColours[i].lab[1], 3)}\n` +
        //     `${toFix(stepColours[i].lab[2], 3)}` 
        // )

        block.appendChild(leftText)
        block.appendChild(midText)
        block.appendChild(rightText)
        block.classList.add("colour-block")

        // swap text colour if too dark
        if (stepColours[i].lch[0] < 0.40) {
            block.style.color = "white"
        } else {
            block.style.color = "black"
        }

        paletteContainer.appendChild(block);

        block.addEventListener("click", (PointerEvent) => {
            const hexBlock = PointerEvent.target.querySelector('.mid')
            let targetElement = 0
            if (hexBlock) {
                targetElement = hexBlock
            } else {
                targetElement = PointerEvent.target
            }

            const originalString = targetElement.textContent
            const splitString = originalString.split('\n')
            navigator.clipboard.writeText(splitString.slice(1).join(" "))

            targetElement.textContent = "COPIED\n" + splitString.slice(1).join("\n")
            // console.log(block.style.backgroundColor)
            targetElement.style.textShadow = `0px 0px 1px`

            setTimeout(() => {
                targetElement.textContent = originalString
                targetElement.style.textShadow = `unset`
                // targetElement.style.backgroundColor = "transparent"
            }, 500)
            
            
        })
    }

    updatePickers(stepColours[0].hex, stepColours[stepColours.length-1].hex)
}


/** Wrapper for setColourPositions, but does not update chroma position. 
 * This is for middleMixer inputs for the outer hue ring, where we want to keep 
 * chroma where it is. 
 */
function setColourPositionsNoChroma() {
    left.chr = sliderLeftChr.value
    right.chr = sliderRightChr.value

    setColourPositions()

    
}

/** Set new x, y positions based on lch values */
function setColourPositions() {

    // // resultant colours 
    // leftColourBlock.style.background = `oklch(${left.lht} ${left.chr} ${left.hue})`
    // rightColourBlock.style.background = `oklch(${right.lht} ${right.chr} ${right.hue})`

    // overlay lines on plots 
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
    middleMixer.hue_angle = activeColour.hue

    // set slider labels 
    sliderLeftHue.value = parseInt(left.hue)
    sliderLeftChr.value = left.chr
    sliderLeftLht.value = left.lht

    sliderRightHue.value = parseInt(right.hue)
    sliderRightChr.value = right.chr
    sliderRightLht.value = right.lht

    colourLeftHueLabel.textContent = `${String(parseInt(left.hue)).padStart(3, '0')}`; 
    colourLeftChrLabel.textContent = `${parseFloat(left.chr).toFixed(3)}`; 
    colourLeftLhtLabel.textContent = `${parseFloat(left.lht).toFixed(3)}`; 

    colourRightHueLabel.textContent = `${String(parseInt(right.hue)).padStart(3, '0')}`; 
    colourRightChrLabel.textContent = `${parseFloat(right.chr).toFixed(3)}`; 
    colourRightLhtLabel.textContent = `${parseFloat(right.lht).toFixed(3)}`; 
}

function wheelInput(event, inputElement, step) {

    if (event.deltaY < 0) {// Scrolling up
        if (parseFloat(inputElement.value) + step <= parseFloat(inputElement.getAttribute("max"))) {
            inputElement.value = parseFloat(inputElement.value) + step;
            // console.log(`${}`)
        }
      
    } else if (parseFloat(inputElement.value) - step >= parseFloat(inputElement.getAttribute("min"))) { // Scrolling down
        inputElement.value = parseFloat(inputElement.value) - step;
    }
    event.preventDefault(); // Prevent default scrolling behavior
}

function wheelInputLoop(event, inputElement, step) {

    if (event.deltaY < 0) {// Scrolling up
        if (parseFloat(inputElement.value) + step <= parseFloat(inputElement.getAttribute("max"))) {
            inputElement.value = parseFloat(inputElement.value) + step;
            // console.log(`${}`)
        } else {
            inputElement.value = inputElement.getAttribute("min");
        }
      
    } else if (parseFloat(inputElement.value) - step >= parseFloat(inputElement.getAttribute("min"))) { // Scrolling down
        inputElement.value = parseFloat(inputElement.value) - step;
    } else {
        inputElement.value = inputElement.getAttribute("max");
    }
    event.preventDefault(); // Prevent default scrolling behavior
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

/**Used to round numbers to how ever many decimal places */
function toFix(num, places) {
    return (Math.round(num * 10**(places)) / 10**(places)).toFixed(places);
}


