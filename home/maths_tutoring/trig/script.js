
const CHAR_SQUARED = "²" // \u00B2
const CHAR_DEGREE = "°" // \u00B0
const CHAR_MULT = "×" // \u00D7

const CANVAS_WIDTH = 500
const CANVAS_HEIGHT = 500


const knownSide1 = document.getElementById("known-side-1");
const knownSide2 = document.getElementById("known-side-2");
const knownAngle = document.getElementById("known-angle");

const generateButton = document.getElementById("generate-answer-button");
generateButton.addEventListener("click", () => {generateCosineAnswer()})

const answerText = document.getElementById("answer-output");

const cosineCanvas = document.getElementById("cosine-canvas"); 
const cosineCTX = cosineCanvas.getContext('2d'); 
cosineCanvas.width = CANVAS_WIDTH
cosineCanvas.height = CANVAS_HEIGHT

cosineCTX.fillStyle = "white"
cosineCTX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)



// wheel scroll for inputs
knownSide1.addEventListener('wheel', (WheelEvent) => {wheelInput(WheelEvent, knownSide1)});
knownSide2.addEventListener('wheel', (WheelEvent) => {wheelInput(WheelEvent, knownSide2)});
knownAngle.addEventListener('wheel', (WheelEvent) => {wheelInput(WheelEvent, knownAngle)});

const sessionCount = document.getElementById("session-data");



//----------------------------------------------------------------------------\
// PROBLEM SECTION
//-----------------------------------------------------------------------------

const problemText = document.getElementById("problem-answer-output");

const problemCanvas = document.getElementById("problem-canvas"); 
const problemCTX = problemCanvas.getContext('2d'); 
problemCanvas.width = CANVAS_WIDTH
problemCanvas.height = CANVAS_HEIGHT

problemCTX.fillStyle = "white"
problemCTX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

const generateProblemButton = document.getElementById("generate-problem-button");
generateProblemButton.addEventListener("click", () => {generateTrigProblem()})

// window.localStorage.setItem('totalCount', 0)

/**Allows for wheel scrolling to change numbers for inputs */
function wheelInput(event, inputElement) {
    if (event.deltaY < 0) {// Scrolling up
        if (parseInt(inputElement.value) + 1 <= parseInt(inputElement.getAttribute("max"))) {
            inputElement.value = parseInt(inputElement.value) + 1;
        }
      
    } else if (parseInt(inputElement.value) - 1 >= parseInt(inputElement.getAttribute("min"))) { // Scrolling down
        inputElement.value = parseInt(inputElement.value) - 1;
    }
    generateCosineAnswer()
    event.preventDefault(); // Prevent default scrolling behavior
}


function generateCosineAnswer() {
    // let answerSteps = []; 
    const b = knownSide1.value
    const c = knownSide2.value
    const angleA = knownAngle.value

    // answerSteps.push(`a² =   b²  +   c²  - 2bc       cos(A)`)
    // answerSteps.push(`a² = (${b})² + (${c})² - 2(${b})(${c}) cos(${angleA}°)`)
    // answerSteps.push(`a² = ${b**2} + ${c**2} - ${2*b*c} × ${toFix(Math.cos(angleA*Math.PI/180), 6)}`)
    // const step3 = b**2+c**2-(2*b*c*Math.cos(angleA*Math.PI/180))
    // answerSteps.push(`a² = ${toFix(step3, 6)}`)
    // answerSteps.push(`a  = √(${toFix(step3, 6)})`)
    // answerSteps.push(`a  = ${Math.sqrt(toFix(step3, 6))}`)

    // let stringAnswer = answerSteps.join("\n")
    answer = from2Sides(b, c, angleA, 2)

    answerText.innerText = answer.method;
    incrementTotalCount(1)
    
    drawTriangle(cosineCTX, answer.sides, answer.angles)
    console.log(`Answer: ${answer.sides}, ${answer.angles}`)
}

function incrementTotalCount(incAmount) {
    let total = window.localStorage.getItem('totalCount')
    if (total == null) {
        total = 0
    }
    window.localStorage.setItem('totalCount', (parseInt(total) + incAmount))
    sessionCount.innerText = total;
}

function generateTrigProblem() {
    // const randomProblemPick = getRandomInt(1, 4)
    
    let answer = 0
    switch (getRandomInt(1, 4)) {
        case 1: {
            
            const side1 = getRandomInt(1, 1000)
            const side2 = getRandomInt(side1*0.5, side1*1.5)
            const side3 = getRandomInt(Math.abs(side1-side2), side1+side2)
            console.log(`Problem One: Determine Triangle from 3 Sides: `); 
            console.log(`Side 1: ${side1}`)
            console.log(`Side 2: ${side2}`)
            console.log(`Side 3: ${side3}`)

            answer = from3Sides(side1, side2, side3)
            drawTriangle(problemCTX, answer.sides, answer.angles)
            break;
        }
        case 2: {
            
            const side1 = getRandomInt(1, 1000)
            const side2 = getRandomInt(1, 1000)
            const angleX = getRandomInt(15, 90)
            const angleIndex = getRandomInt(0, 3)

            console.log(`Problem Two: Determine Triangle from 2 Sides, 1 Angle`); 
            console.log(`Side 1: ${side1}`)
            console.log(`Side 2: ${side2}`)
            console.log(`Unknown Angle: ${angleX} @ position oppisite side${((angleIndex+1)%3)}`)

            answer = from2Sides(side1, side2, angleX, angleIndex)
            drawTriangle(problemCTX, answer.sides, answer.angles)
            break;
        }
        case 3: {
            
            const sideX = getRandomInt(1, 1000)
            const sideIndex = getRandomInt(0, 3)
            const angle1 = getRandomInt(15, 90)
            const angle2 = getRandomInt(15, 180-angle1)

            console.log(`Problem Three: Determine Triangle from 1 Side, 2 Angles`); 
            console.log(`Angle 1: ${angle1}`)
            console.log(`Angle 2: ${angle2}`)
            console.log(`Unknown Side: ${sideX} @ position oppisite side${(sideIndex+1)%3}`)

            answer = from1Sides(sideX, sideIndex, angle1, angle2)
            drawTriangle(problemCTX, answer.sides, answer.angles)
            break;
        }
        default: 
            console.log(`Random Pick of not 1-3`); 
    }

    // check if valid triangle 
    if (answer.sides.includes(NaN) || answer.angles.includes(NaN) || answer.angles.some(x => (x < 15))) {
        console.log(`Invalid Triangle, trying again`)
        generateTrigProblem()
    } else {
        console.log(`Answer: ${answer.sides}, ${answer.angles}`)
    }
    
    
}

/** Computes triangle from 3 side lengths given */
function from3Sides(side0, side1, side2) {
    let sides = [side0, side1, side2] 
    let angles = [
        getCosineAngle(side0, side1, side2), 
        getCosineAngle(side1, side0, side2), 
        getCosineAngle(side2, side1, side0), 
    ]
    
    return {sides: sides, angles: angles, method: ""}
}


/** Computes triangle from 2 sides given. For the angleIndex, side and angle pairs 
 * are for opposites (the angle pair for a side is the angle on the oppisite side
 * of the triangle). For this, we assume side0 has index 0, side1 index 1. 
 * 
 * For example, if the given angle is the one directly between 
 * side0 and side1, it would be the angle pair for side2, so the index would be 
 * 2. If the given angle was the opposite to side0, then 
 * the given angleIndex needs to be 0. 
 * 
 * Got it?
*/
function from2Sides(side0, side1, angleX, angleIndex) {
    let sides = [side0, side1, 0]
    let angles = [0, 0, 0]

    angles[angleIndex] = angleX

    if (angleIndex == 0) {
        angles[1] = getSineAngle(sides[1], sides[0], angles[0])
        angles[2] = 180 - angles[0] - angles[1]
        sides[2] = getSineSide(sides[0], angles[2], angles[0])
    } else if (angleIndex == 1) {
        angles[0] = getSineAngle(sides[0], sides[1], angles[1])
        angles[2] = 180 - angles[0] - angles[1]
        sides[2] = getSineSide(sides[0], angles[2], angles[0])
    } else if (angleIndex == 2) {
        sides[2] = getCosineSide(sides[0], sides[1], angles[2])
        angles[0] = getCosineAngle(sides[0], sides[1], sides[2])
        angles[1] = 180 - angles[2] - angles[0]
    } else {
        console.log(`ERROR: UNKNOWN INDEX IN CALCULATING from2Sides`)
    }

    let answerSteps = []; 
    answerSteps.push(`a² =   b²  +   c²  - 2bc       cos(A)`)
    answerSteps.push(`a² = (${side0})² + (${side1})² - 2(${side0})(${side1}) cos(${angleX}°)`)
    answerSteps.push(`a² = ${side0**2} + ${side1**2} - ${2*side0*side1} × ${toFix(Math.cos(angleX*Math.PI/180), 6)}`)
    const step3 = side0**2+side1**2-(2*side0*side1*Math.cos(angleX*Math.PI/180))
    answerSteps.push(`a² = ${toFix(step3, 6)}`)
    answerSteps.push(`a  = √(${toFix(step3, 6)})`)
    answerSteps.push(`a  = ${Math.sqrt(toFix(step3, 6))}`)

    let stringAnswer = answerSteps.join("\n")
    
    return {sides: sides, angles: angles, method: stringAnswer}
}

/** Computes triangle from 1 side(s) given. For the angleIndex, side and angle pairs 
 * are for opposites (the angle pair for a side is the angle on the oppisite side
 * of the triangle). For this, we assume angle0 has index 0, angle1 index 1. 
 * 
 * For example, if the given side is the one directly between 
 * angle0 and angle1, it would be the angle pair for angle2, so the index would be 
 * 2. If the given side was the opposite to angle1, then 
 * the given sideIndex needs to be 1. 
 * 
 * Got it?
*/
function from1Sides(sideX, sideIndex, angle0, angle1) {
    let sides = [0, 0, 0]
    let angles = [angle0, angle1, 0]

    angles[2] = 180 - angle0 - angle1
    sides[sideIndex] = sideX

    const unknownIndex1 = (sideIndex+1)%3
    sides[unknownIndex1] = getSineSide(sides[sideIndex], angles[unknownIndex1], angles[sideIndex])

    const unknownIndex2 = (sideIndex+2)%3
    sides[unknownIndex2] = getSineSide(sides[sideIndex], angles[unknownIndex2], angles[sideIndex])
    return {sides: sides, angles: angles, method: ""}
}



function drawTriangle(ctx, sides, angles, answer=true) {
    ctx.reset(); 

    // get longest side 
    const longestSide = Math.max(...sides);
    const longestSideIndex = sides.indexOf(longestSide);
    const leftSide = sides[0];
    const leftAngle = angles[0];

    // plot first side straight down from origin 
    let points = [[0, 0], [0, leftSide], [0, 0]]

    // pick any side that's not the longest 
    const topSide = sides[1]
    const topAngle = angles[1]

    const botSide = sides[2]
    const botAngle = angles[2]

    // calc final co-ordinate of triangle 
    points[2][0] = topSide*Math.sin(deg2Rad(botAngle))
    points[2][1] = topSide*Math.cos(deg2Rad(botAngle))
    // console.log(`Sides: ${sides}`)
    // console.log(`Angls: ${angles}`)
    // console.log(`(${p1X}, ${p1Y}) (${p2X}, ${p2Y}) (${p3X}, ${p3Y})`)

    // normalise 
    points = points.map(subArr => subArr.map(x => x / longestSide));

    // centroid 
    const centreX = (points[0][0] + points[1][0] + points[2][0])/3
    const centreY = (points[0][1] + points[1][1] + points[2][1])/3

    // console.log(`(${p1}) (${p2}) (${p3})`)
    // console.log(`Cnedorid XY: ${centreX}, ${centreY}`)

    // shift
    points = points.map(subArr => [subArr[0]-centreX, subArr[1]-centreY]);

    // scale back
    points = points.map(subArr => subArr.map(x => x * CANVAS_WIDTH*0.7));

    // shiftback
    points = points.map(subArr => subArr.map(x => x +(CANVAS_WIDTH/2)));

    // plot
    ctx.beginPath(); 
    ctx.moveTo(points[0][0], points[0][1]); 
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.lineTo(points[2][0], points[2][1]);
    ctx.lineTo(points[0][0], points[0][1]);
    ctx.stroke(); 

    ctx.fillRect(centreX/(CANVAS_WIDTH*0.8)+(CANVAS_WIDTH/2), centreY/(CANVAS_WIDTH*0.8)+(CANVAS_WIDTH/2), 3, 3)

    // plot labels 
    const PADDING = 5
    ctx.font = "bold 28px serif";
    ctx.fillText(`${toFix(leftSide, 1)}`, 
        points[0][0] - 16*PADDING, 
        (points[1][1] + points[0][1])/2
    )
    ctx.fillText(`${toFix(topSide, 1)}`, 
        ((points[0][0] + points[2][0])/2) + 2*PADDING*(8*(90-botAngle)/90), 
        ((points[0][1] + points[2][1])/2) - 2*PADDING
    )
    ctx.fillText(`${toFix(botSide, 1)}`, 
        ((points[1][0] + points[2][0])/2) + 4*PADDING*(8*(90-topAngle)/90), 
        ((points[1][1] + points[2][1])/2) + 4*PADDING
    )

    ctx.font = "bold 16px serif";
    ctx.fillText(`${toFix(botAngle, 1)}°`, 
        points[0][0] + PADDING, 
        points[0][1] + 8*PADDING*((90-botAngle)/90 + 1)
    )
    ctx.fillText(`${toFix(topAngle, 1)}°`, 
        points[1][0] + PADDING, 
        points[1][1] - 8*PADDING*((90-topAngle)/90 + 0.5)
    )
    ctx.fillText(`${toFix(leftAngle, 1)}°`, 
        points[2][0] - 10*PADDING, 
        points[2][1] + 10*PADDING*((90-topAngle)/90)**3
    )

    // console.log(`SIDES: left: ${leftSide} top: ${topSide} bot: ${botSide}`)
    // console.log(`ANGLE: left: ${leftAngle} top: ${topAngle} bot: ${botAngle}`)
}


/**To determine angleA */
function getCosineAngle(sideA, sideB, sideC) {
    return rad2deg(Math.acos((sideB**2 + sideC**2 - sideA**2)/(2*sideB*sideC)))
}

function getCosineSide(sideB, sideC, angleA) {
    return Math.sqrt(sideB**2 + sideC**2 - (2*sideB*sideC*Math.cos(deg2Rad(angleA))))
}

/** Put the side whose angle you want first (side1 to find angle1) */
function getSineAngle(side1, side2, angle2) {
    return rad2deg(Math.asin((side1 * Math.sin(deg2Rad(angle2)))/side2))
}

/** Put the angle whose side you want first (angle1 to find side1)  */
function getSineSide(side2, angle1, angle2) {
    return (side2 *Math.sin(deg2Rad(angle1)))/Math.sin(deg2Rad(angle2))
}

function deg2Rad(degree) {
    return degree*Math.PI/180
}

function rad2deg(radian) {
    return radian*180/Math.PI
}

function norm(array, divisor) {
    return array.map(x => x / divisor)
}

function toFix(num, places) {
    return (Math.round(num * 10**(places)) / 10**(places)).toFixed(places);
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

