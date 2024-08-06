
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

generateCosineAnswer()
function generateCosineAnswer() {
    let answerSteps = []; 
    const b = knownSide1.value
    const c = knownSide2.value
    const angleA = knownAngle.value

    answerSteps.push(`a² =   b²  +   c²  - 2bc       cos(A)`)
    answerSteps.push(`a² = (${b})² + (${c})² - 2(${b})(${c}) cos(${angleA}°)`)
    answerSteps.push(`a² = ${b**2} + ${c**2} - ${2*b*c} × ${toFix(Math.cos(angleA*Math.PI/180), 6)}`)
    const step3 = b**2+c**2-(2*b*c*Math.cos(angleA*Math.PI/180))
    answerSteps.push(`a² = ${toFix(step3, 6)}`)
    answerSteps.push(`a  = √(${toFix(step3, 6)})`)
    answerSteps.push(`a  = ${Math.sqrt(toFix(step3, 6))}`)

    let stringAnswer = answerSteps.join("\n")

    answerText.innerText = stringAnswer;
    incrementTotalCount(1)
    drawTriangle(cosineCTX, Math.sqrt(step3), b, c, angleA)
}

function incrementTotalCount(incAmount) {
    let total = window.localStorage.getItem('totalCount')
    if (total == null) {
        total = 0
    }
    window.localStorage.setItem('totalCount', (parseInt(total) + incAmount))
    sessionCount.innerText = total;
}

function drawTriangle(ctx, sideA, sideB, sideC, angleA) {
    ctx.reset(); 
    const sides = [sideA, sideB, sideC];  
    const angles = [
        angleA, 
        getCosineAngle(sideB, sideC, sideA), 
        getCosineAngle(sideC, sideB, sideA)
    ]; 

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
    const PADDING = 10
    ctx.font = "bold 32px serif";
    ctx.fillText(`a`, 
        points[0][0] - 4*PADDING, 
        (points[1][1] + points[0][1])/2
    )
    ctx.fillText(`${topSide}`, 
        ((points[0][0] + points[2][0])/2) + 2*PADDING, 
        ((points[0][1] + points[2][1])/2) - 2*PADDING
    )
    ctx.fillText(`${botSide}`, 
        ((points[1][0] + points[2][0])/2) + 2*PADDING, 
        ((points[1][1] + points[2][1])/2) + 2*PADDING
    )

    ctx.font = "bold 16px serif";
    ctx.fillText(`${toFix(botAngle, 2)}°`, 
        points[0][0] + PADDING, 
        points[0][1] + 2*PADDING
    )
    ctx.fillText(`${toFix(topAngle, 2)}°`, 
        points[1][0] + PADDING, 
        points[1][1] - 2*PADDING
    )
    ctx.fillText(`${toFix(leftAngle, 2)}°`, 
        points[2][0] - 2*PADDING, 
        points[2][1] + PADDING
    )

}


/**To determine angleA */
function getCosineAngle(sideA, sideB, sideC) {
    return rad2deg(Math.acos((sideB**2 + sideC**2 - sideA**2)/(2*sideB*sideC)))
}

function getCosineSide(sideB, sideC, angleA) {
    return Math.sqrt(sideB**2 + sideC**2 - (2*sideB*sideC*Math.cos(deg2Rad(angleA))))
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



