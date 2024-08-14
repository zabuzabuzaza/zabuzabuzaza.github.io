
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

const answerLabels = [["a", "b", "c"], ["A", "B", "C"]]
var currentHint = ""
var currentAnswer = ""

const problemText = document.getElementById("problem-answer-output");
problemText.style.display = 'none'; 

const problemCanvas = document.getElementById("problem-canvas"); 
const problemCTX = problemCanvas.getContext('2d'); 
problemCanvas.width = CANVAS_WIDTH
problemCanvas.height = CANVAS_HEIGHT

problemCTX.fillStyle = "white"
problemCTX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

const generateProblemButton = document.getElementById("generate-problem-button");
generateProblemButton.addEventListener("click", () => {generateTrigProblem()})

const toggleHintButton = document.getElementById('toggle-hint-button');
const toggleProblemButton = document.getElementById('toggle-problem-button');

toggleProblemButton.addEventListener('click', () => {
    problemText.innerText = currentAnswer
    if (toggleProblemButton.textContent === "See Answer") {
        problemText.style.display = 'inline'
        toggleProblemButton.textContent = "Hide Answer"
    } else {
        problemText.style.display = 'none'
        toggleProblemButton.textContent = "See Answer"
    }
    toggleHintButton.textContent = "See Hint"
});

toggleHintButton.addEventListener('click', () => {
    problemText.innerText = currentHint
    // if (problemText.style.display === 'none') {
    //         problemText.style.display = 'inline'
    //         // toggleHintButton.textContent = "Hide Hint"
    // }
    if (toggleHintButton.textContent === 'See Hint') {
        problemText.style.display = 'inline'
        toggleHintButton.textContent = "Hide Hint"
    } else {
        problemText.style.display = 'none'
        toggleHintButton.textContent = "See Hint"
    }
    toggleProblemButton.textContent = "See Answer"
});

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
    answer = from2Sides(b, c, angleA, 2)

    answerText.innerText = answerSteps.join("\n");
    incrementTotalCount(1)
    
    drawTriangle(cosineCTX, answer.sides, answer.angles)
    // console.log(`Sides: ${answer.sides}, ${answer.angles}`)
}

function incrementTotalCount(incAmount) {
    let total = window.localStorage.getItem('totalCount')
    if (total == null) {
        total = 0
    }
    window.localStorage.setItem('totalCount', (parseInt(total) + incAmount))
    sessionCount.innerText = total;
}

generateTrigProblem()
function generateTrigProblem() {
    // const randomProblemPick = getRandomInt(1, 4)
    problemText.style.display = 'none'; 
    toggleProblemButton.textContent = "See Answer"
    let answer = 0
    // switch (getRandomInt(1, 4)) {
    switch (getRandomInt(1, 6)) {
        case 1: {
            
            const side1 = getRandomInt(1, 100)
            const side2 = getRandomInt(side1*0.5, side1*1.5)
            const side3 = getRandomInt(Math.abs(side1-side2), side1+side2)

            // only show side values [["", "", ""], ["A", "B", "C"]]
            let answerMask = [answerLabels[0].slice(), answerLabels[1].slice()]
            answerMask[0] = ["", "", ""]

            console.log(`Problem One: Determine Triangle from 3 Sides: `); 
            console.log(`\tSide ${answerLabels[0][0]}: ${side1}`)
            console.log(`\tSide ${answerLabels[0][1]}: ${side2}`)
            console.log(`\tSide ${answerLabels[0][2]}: ${side3}`)

            answer = from3Sides(side1, side2, side3)
            drawTriangle(problemCTX, answer.sides, answer.angles, answerMask)

            currentAnswer = answer.method; 
            currentHint = answer.hint; 
            // problemText.innerText = answer.method;
            break;
        }
        case 2: {
            
            const side1 = getRandomInt(1, 100)
            const side2 = getRandomInt(1, 100)
            const angleX = getRandomInt(15, 90)
            const angleIndex = getRandomInt(0, 3)
            
            // show first two sides and one of the angles [["", "", "c"], ["A", "B", "C"]]
            let answerMask = [answerLabels[0].slice(), answerLabels[1].slice()]
            answerMask[0][0] = ""
            answerMask[0][1] = ""
            answerMask[1][angleIndex] = ""

            console.log(`Problem Two: Determine Triangle from 2 Sides, 1 Angle`); 
            console.log(`\tSide ${answerLabels[0][0]}: ${side1}`)
            console.log(`\tSide ${answerLabels[0][1]}: ${side2}`)
            console.log(`\tAngle ${answerLabels[1][angleIndex]}: ${angleX}`)

            answer = from2Sides(side1, side2, angleX, angleIndex)
            drawTriangle(problemCTX, answer.sides, answer.angles, answerMask)

            currentAnswer = answer.method; 
            currentHint = answer.hint; 
            // problemText.innerText = answer.method;
            break;
        }
        case 3: {
            
            const sideX = getRandomInt(1, 100)
            const sideIndex = getRandomInt(0, 3)
            const angle1 = getRandomInt(15, 90)
            const angle2 = getRandomInt(15, 180-angle1)
            
            // only show one of the sides and the first two angles [["a", "b", "c"], ["", "", "C"]]
            let answerMask = [answerLabels[0].slice(), answerLabels[1].slice()]
            answerMask[0][sideIndex] = ""
            answerMask[1][0] = ""
            answerMask[1][1] = ""

            console.log(`Problem Three: Determine Triangle from 1 Side, 2 Angles`); 
            console.log(`\tAngle ${answerLabels[1][0]}: ${angle1}`)
            console.log(`\tAngle ${answerLabels[1][1]}: ${angle2}`)
            console.log(`\tSide ${answerLabels[0][sideIndex]}: ${sideX}`)

            answer = from1Sides(sideX, sideIndex, angle1, angle2)
            drawTriangle(problemCTX, answer.sides, answer.angles, answerMask)

            currentAnswer = answer.method; 
            currentHint = answer.hint; 
            // problemText.innerText = answer.method;
            break;
        }
        case 4: {
            const side2 = getRandomInt(1, 100)
            const side1 = getRandomInt(1, side2)
            const angle90 = 90
            const angleIndex = getRandomInt(1, 3) // either index 1 or 2

            // show first two sides and one of the angles [["", "", "c"], ["A", "B", "C"]]
            let answerMask = [answerLabels[0].slice(), answerLabels[1].slice()]
            answerMask[0][0] = ""
            answerMask[0][1] = ""
            answerMask[1][angleIndex] = ""

            console.log(`Problem Four: Determine Triangle from 2 Sides, 1 Angle, Right Angled`); 
            console.log(`\tSide ${answerLabels[0][0]}: ${side1}`)
            console.log(`\tSide ${answerLabels[0][1]}: ${side2}`)
            console.log(`\tAngle ${answerLabels[1][angleIndex]}: ${angle90} @ index ${angleIndex}`)

            answer = from2Sides90(side1, side2, angle90, angleIndex)
            
            drawTriangle(problemCTX, answer.sides, answer.angles, answerMask)

            currentAnswer = answer.method; 
            currentHint = answer.hint; 
            // problemText.innerText = answer.method;
            break;
        }
        case 5: {
            const sideX = getRandomInt(1, 100)
            const sideIndex = getRandomInt(0, 3)
            const angle1 = 90
            const angle2 = getRandomInt(15, 75)
            
            // only show one of the sides and the first two angles [["a", "b", "c"], ["", "", "C"]]
            let answerMask = [answerLabels[0].slice(), answerLabels[1].slice()]
            answerMask[0][sideIndex] = ""
            answerMask[1][0] = ""
            answerMask[1][1] = ""

            console.log(`Problem Five: Determine Triangle from 1 Side, 2 Angles, Right Angled`); 
            console.log(`\tAngle ${answerLabels[1][0]}: ${angle1}`)
            console.log(`\tAngle ${answerLabels[1][1]}: ${angle2}`)
            console.log(`\tSide ${answerLabels[0][sideIndex]}: ${sideX} @ index ${sideIndex}`)

            answer = from1Sides90(sideX, sideIndex, angle1, angle2)
            drawTriangle(problemCTX, answer.sides, answer.angles, answerMask)
            // console.log(`Sides ${answer.sides} \nAngles ${answer.angles}`)

            currentAnswer = answer.method; 
            currentHint = answer.hint; 
            // problemText.innerText = answer.method;
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
        console.log(
            `ANSWERS: \n` + 
            `\tSide ${answerLabels[0][0]}: ${toFix(answer.sides[0], 4)} \n` +
            `\tSide ${answerLabels[0][1]}: ${toFix(answer.sides[1], 4)} \n` +
            `\tSide ${answerLabels[0][2]}: ${toFix(answer.sides[2], 4)} \n` +
            `\tAngle ${answerLabels[1][0]}: ${toFix(answer.angles[0], 4)}° \n` +
            `\tAngle ${answerLabels[1][1]}: ${toFix(answer.angles[1], 4)}° \n` +
            `\tAngle ${answerLabels[1][2]}: ${toFix(answer.angles[2], 4)}° \n`
        )
    }
    
    
}

/** Computes triangle from 3 side lengths given */
function from3Sides(side0, side1, side2) {
    
    
    const angle0 = getCosineAngle(side0, side1, side2, 0)
    
    const angle1 = getCosineAngle(side1, side0, side2, 1)
    
    const angle2 = getCosineAngle(side2, side1, side0, 2)

    let sides = [side0, side1, side2] 
    let angles = [angle0.result, angle1.result, angle2.result]
    let methodSteps = [angle0.method, angle1.method, angle2.method]; 

    // problemText.innertext = methodSteps.join("\n")
    
    return {
        sides: sides, 
        angles: angles, 
        method: methodSteps.join("\n"), 
        hint: (
            `Solve all three angles with Cosine Rule. \n` + 
            `You can do it in any order you want.`
        )

    }
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
    let methodSteps = []
    let hintString = ""

    angles[angleIndex] = angleX

    if (angleIndex == 0) {
        const angle1 = getSineAngle(sides[1], sides[0], angles[0], 1, 0)
        angles[1] = angle1.result

        // const angle2 = 180 - angles[0] - angles[1]
        const angle2 = get180Angle(angles[0], angles[1], 2)
        angles[2] = angle2.result

        const side2 = getSineSide(sides[0], angles[2], angles[0], 2, 0)
        sides[2] = side2.result

        methodSteps = [angle1.method, angle2.method, side2.method]; 
        hintString = (
            `Side ${answerLabels[0][1]} has its opposite angle ${answerLabels[1][1]} missing? \n` + 
            `Use Sine rule to find that out. \n` +
            `Then find the 3rd angle ${answerLabels[1][2]} (you already know two of the other angles), \n` + 
            `and you can use Cosine rule OR Sine rule \n` + 
            `to find the last side ${answerLabels[0][2]}`
        )
    } else if (angleIndex == 1) {
        const angle0 = getSineAngle(sides[0], sides[1], angles[1], 0, 1)
        angles[0] = angle0.result

        // const angle2 = 180 - angles[0] - angles[1]
        const angle2 = get180Angle(angles[0], angles[1], 2)
        angles[2] = angle2.result

        const side2 = getSineSide(sides[0], angles[2], angles[0], 2, 0)
        sides[2] = side2.result

        methodSteps = [angle0.method, angle2.method, side2.method]; 
        hintString = (
            `Side ${answerLabels[0][0]} has its opposite angle ${answerLabels[1][0]} missing? \n` + 
            `Use Sine rule to find that out. \n` +
            `Then find the 3rd angle ${answerLabels[1][2]} (you already know two of the other angles), \n` + 
            `and you can use Cosine rule OR Sine rule \n` + 
            `to find the last side ${answerLabels[0][2]}`
        )
    } else if (angleIndex == 2) {
        const side2 = getCosineSide(sides[0], sides[1], angles[2], 2)
        sides[2] = side2.result

        const angle0 = getCosineAngle(sides[0], sides[1], sides[2], 0)
        angles[0] = angle0.result

        // const angle1 = 180 - angles[2] - angles[0]
        const angle1 = get180Angle(angles[2], angles[0], 1)
        angles[1] = angle1.result

        methodSteps = [side2.method, angle0.method, angle1.method]; 
        hintString = (
            `You can't use Sine rule because there's no side+angle pairs yet, \n` +
            `but you do know at least one angle and two sides, \n` + 
            `so you can find with last side ${answerLabels[0][2]} with Cosine Rule. \n\n` +
            `Now with all three sides, you can use \n Cosine rule to find the other two angles. \n` +
            `I'm going to pick angle ${answerLabels[1][0]} first but angle ${answerLabels[1][1]} is fine aswell. \n\n` +
            `If you're lazy, you can work out \nthe last angle just by subtracting from 180, \n` + 
            `or you can do it properly with Cosine Rule (both are fine).`
        )
    } else {
        console.log(`ERROR: UNKNOWN INDEX IN CALCULATING from2Sides`)
    }

    return {
        sides: sides, 
        angles: angles, 
        method: methodSteps.join("\n"), 
        hint: hintString
    }
}

function from2Sides90(side0, side1, angleX, angleIndex) {
    let sides = [side0, side1, 0]
    let angles = [0, 0, 0]
    let methodSteps = []
    let hintString = ""

    angles[angleIndex] = angleX

    if (angleIndex == 1) {
        // adjacent to be worked out
        const side2 = getPythagB(sides[1], sides[0], 1, 2, 0)
        sides[2] = side2.result

        const angle0 = getSineAngle90(sides[0], sides[1], 0, 2, 1)
        angles[0] = angle0.result

        const angle2 = getSineAngle90(sides[2], sides[1], 2, 0, 1)
        angles[2] = angle2.result

        methodSteps = [side2.method, angle0.method, angle2.method]; 
        
    } else if (angleIndex == 2) {
        // hypotenuse to be worked out
        const side2 = getPythagA(sides[0], sides[1], 2)
        sides[2] = side2.result

        const angle1 = getSineAngle90(sides[1], sides[2], [1], [0], [2])
        angles[1] = angle1.result

        const angle0 = getSineAngle90(sides[0], sides[2], [0], [1], [2])
        angles[0] = angle0.result

        methodSteps = [side2.method, angle1.method, angle0.method]; 
    } else {
        console.log(`INDEX NOT 1 OR 2`)
    }
    


    return {
        sides: sides, 
        angles: angles, 
        method: methodSteps.join("\n"), 
        hint: (
            `It's a right angled triangle. \n` + 
            `So use Pythagoras and SOH CAH TOA instead of \n` +
            `Cosine and Sine Rule`
        )
    }
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

    // angles[2] = 180 - angle0 - angle1
    const angle2 = get180Angle(angle0, angle1, 2)
    angles[2] = angle2.result
    sides[sideIndex] = sideX

    const unknownIndex1 = (sideIndex+1)%3
    const unknownSide1 = getSineSide(sides[sideIndex], angles[unknownIndex1], angles[sideIndex], unknownIndex1, sideIndex)
    sides[unknownIndex1] = unknownSide1.result

    const unknownIndex2 = (sideIndex+2)%3
    const unknownSide2 = getSineSide(sides[sideIndex], angles[unknownIndex2], angles[sideIndex], unknownIndex2, sideIndex)
    sides[unknownIndex2] = unknownSide2.result

    let methodSteps = [angle2.method, unknownSide1.method, unknownSide2.method]; 
    return {
        sides: sides, 
        angles: angles, 
        method: methodSteps.join("\n"), 
        hint: (
            `You already know two angles, so figure out \n` +
            `the last angle ${answerLabels[1][sideIndex]} first (all angles add to 180). \n\n` + 
            `There's at least a side+angle pair that is already complete \n ` +
            `(side ${answerLabels[0][sideIndex]} and angle ${answerLabels[1][sideIndex]}) \n` + 
            `so you can work out the other sides with Sine rule by \n` +
            `picking side ${answerLabels[0][sideIndex]} and angle ${answerLabels[1][sideIndex]} \n` + 
            `and the opposite angle to the side you are trying to work out.`
        )
    }
}

function from1Sides90(sideX, sideIndex, angle0, angle1) {
    let sides = [0, 0, 0]
    let angles = [angle0, angle1, 0]
    let methodSteps = []

    // angles[2] = 180 - angle0 - angle1
    const angle2 = get180Angle(angle0, angle1, 2)
    angles[2] = angle2.result
    sides[sideIndex] = sideX

    if (sideIndex == 0) {
        // side is hypotenuse
        const side1 = getSineOpp(angles[1], sides[sideIndex], 1, 2, 0)
        sides[1] = side1.result

        const side2 = getSineOpp(angles[2], sides[sideIndex], 2, 1, 0)
        sides[2] = side2.result

        methodSteps = [angle2.method, side1.method, side2.method]; 
    } else {
        // side0 is the hypotenuse
        const side0 = getSineHyp(angles[sideIndex], sides[sideIndex], sideIndex, 0)
        sides[0] = side0.result

        adjIndex = (sideIndex+1)%3 == 0 ? (sideIndex+2)%3: (sideIndex+1)%3
        const sideAdj = getSineOpp(angles[adjIndex], sides[0], adjIndex, 0)
        sides[adjIndex] = sideAdj.result

        methodSteps = [angle2.method, side0.method, sideAdj.method]; 
    }


    return {
        sides: sides, 
        angles: angles, 
        method: methodSteps.join("\n"), 
        hint: (
            `You already know two angles, so figure out \n` +
            `the last angle ${answerLabels[1][sideIndex]} first (all angles add to 180). \n\n` + 
            `It is a right angled triangle, \n ` +
            `So use Pythagoras and SOH CAH TOA instead of \n` + 
            `Cosine and Sine Rule` 
        )
    }
}

function drawTriangle(ctx, sides, angles, answerMask=[["", "", ""], ["", "", ""]]) {
    ctx.reset(); 

    // get longest side 
    const longestSide = Math.max(...sides);
    const longestSideIndex = sides.indexOf(longestSide);
    let leftSide = sides[0];
    let leftAngle = angles[0];

    // plot first side straight down from origin 
    let points = [[0, 0], [0, leftSide], [0, 0]]

    // pick any side that's not the longest 
    let topSide = sides[1]
    let topAngle = angles[1]

    let botSide = sides[2]
    let botAngle = angles[2]

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

    // check whether to show labels 
    const leftSideLabel  = (answerMask[0][0] == "")? answerLabels[0][0] + ": " + toFix(leftSide, 1): answerMask[0][0]; 
    const leftAngleLabel = (answerMask[1][0] == "")? answerLabels[1][0] + ": " +  toFix(leftAngle, 1): answerMask[1][0]; 
    const topSideLabel   = (answerMask[0][1] == "")? answerLabels[0][1] + ": " +  toFix(topSide, 1): answerMask[0][1]; 
    const topAngleLabel  = (answerMask[1][1] == "")? answerLabels[1][1] + ": " +  toFix(topAngle, 1): answerMask[1][1]; 
    const botSideLabel   = (answerMask[0][2] == "")? answerLabels[0][2] + ": " +  toFix(botSide, 1): answerMask[0][2]; 
    const botAngleLabel  = (answerMask[1][2] == "")? answerLabels[1][2] + ": " +  toFix(botAngle, 1): answerMask[1][2]; 

    // plot labels 
    const PADDING = 5
    ctx.font = "bold 28px serif";
    ctx.fillText(`${leftSideLabel}`, 
        points[0][0] - 20*PADDING, 
        (points[1][1] + points[0][1])/2
    )
    ctx.fillText(`${topSideLabel}`, 
        ((points[0][0] + points[2][0])/2) + 8*PADDING*(2*(90-botAngle)/90-1), 
        ((points[0][1] + points[2][1])/2) + 2*PADDING*((2*(90-botAngle)/90)**2-2)
    )
    ctx.fillText(`${botSideLabel}`, 
        ((points[1][0] + points[2][0])/2) + 4*PADDING*(4*(90-topAngle)/90-1), 
        ((points[1][1] + points[2][1])/2) - 4*PADDING*((2*(90-topAngle)/90)**2-2)
    )

    ctx.font = "bold 16px serif";
    ctx.fillText(`${botAngleLabel}°`, 
        points[0][0] + PADDING, 
        points[0][1] + 8*PADDING*((90-botAngle)/90 + 1)
    )
    ctx.fillText(`${topAngleLabel}°`, 
        points[1][0] + PADDING, 
        points[1][1] - 8*PADDING*((90-topAngle)/90 + 0.5)
    )
    ctx.fillText(`${leftAngleLabel}°`, 
        points[2][0] + 2*PADDING*((botAngle-topAngle)/90 - 5), 
        points[2][1] + 5*PADDING*((botAngle-topAngle)/90)
    )

    // console.log(`SIDES: left: ${leftSide} top: ${topSide} bot: ${botSide}`)
    // console.log(`ANGLE: left: ${leftAngle} top: ${topAngle} bot: ${botAngle}`)
}


/**To determine angleA */
function getCosineAngle(sideA, sideB, sideC, labelIndexA) {
    const a = answerLabels[0][labelIndexA]
    const b = answerLabels[0][(labelIndexA+1)%3]
    const c = answerLabels[0][(labelIndexA+2)%3]
    const A = answerLabels[1][labelIndexA]

    let answerSteps = []; 
    answerSteps.push(`To work out angle ${A} with Cosine Rule:`)
    answerSteps.push(`cos(${A}) = (${b}² +  ${c}² - ${a}²) / (- 2${b}${c})`)
    answerSteps.push(`cos(${A}) = ((${sideB})² +  (${sideC})² - (${sideA})²) / (- 2 × (${sideB}) × (${sideC}))`)
    answerSteps.push(`cos(${A}) = ((${sideB**2}) +  (${sideC**2}) - (${sideA**2})) / (- ${2*sideB*sideC})`)
    const step3 = (sideB**2 + sideC**2 - sideA**2)/(2*sideB*sideC)
    answerSteps.push(`cos(${A}) = ${toFix(step3, 6)}`)
    answerSteps.push(`    ${A}  = cos⁻¹(${toFix(step3, 6)})`)
    answerSteps.push(`    ${A}  = ${toFix(rad2deg(Math.acos(step3)), 6)}°`)
    answerSteps.push(" ")

    // let stringAnswer = 

    return {
        result: rad2deg(Math.acos((sideB**2 + sideC**2 - sideA**2)/(2*sideB*sideC))), 
        method: answerSteps.join("\n")
    }
}

function getCosineSide(sideB, sideC, angleA, labelIndexA) {
    const a = answerLabels[0][labelIndexA]
    const b = answerLabels[0][(labelIndexA+1)%3]
    const c = answerLabels[0][(labelIndexA+2)%3]
    const A = answerLabels[1][labelIndexA]


    let answerSteps = []; 
    answerSteps.push(`To work out side ${a} with Cosine Rule:`)
    answerSteps.push(`${a}² =   ${b}²  +   ${c}²  - 2${b}${c}       cos(${A})`)
    answerSteps.push(`${a}² = (${sideB})² + (${sideC})² - 2(${sideB})(${sideC}) cos(${angleA}°)`)
    answerSteps.push(`${a}² = ${sideB**2} + ${sideC**2} - ${2*sideB*sideC} × ${toFix(Math.cos(angleA*Math.PI/180), 6)}`)
    const step3 = sideB**2+sideC**2-(2*sideB*sideC*Math.cos(angleA*Math.PI/180))
    answerSteps.push(`${a}² = ${toFix(step3, 6)}`)
    answerSteps.push(`${a}  = √(${toFix(step3, 6)})`)
    answerSteps.push(`${a}  = ${Math.sqrt(toFix(step3, 6))}`)
    answerSteps.push(" ")

    // let stringAnswer = answerSteps.join("\n")

    return {
        result: Math.sqrt(sideB**2 + sideC**2 - (2*sideB*sideC*Math.cos(deg2Rad(angleA)))), 
        method: answerSteps.join("\n")
    }
}

/** Put the side whose angle you want first (side1 to find angle1) 
 * Label index is the index I'll call answerLabels with for the method prints
*/
function getSineAngle(side1, side2, angle2, labelIndex1, labelIndex2) {
    const A = answerLabels[1][labelIndex1]
    const a = answerLabels[0][labelIndex1]
    const B = answerLabels[1][labelIndex2]
    const b = answerLabels[0][labelIndex2]


    let answerSteps = []; 
    answerSteps.push(`To work out angle ${A} with Sine Rule:`)
    answerSteps.push(`(sin(${A}))/(${a}) = (sin(${B}))/(${b})`)
    answerSteps.push(`      sin(${A}) = (sin(${B}) × ${a})/(${b})`)
    answerSteps.push(`      sin(${A}) = (sin${angle2}° × ${side1})/(${side2})`)
    const step3 = (Math.sin(deg2Rad(angle2))*side1)/side2
    answerSteps.push(`      sin(${A}) = ${toFix(step3, 6)}`)
    answerSteps.push(`          ${A}  = sin⁻¹(${toFix(step3, 6)})`)
    answerSteps.push(`          ${A}  = ${toFix(rad2deg(Math.asin(step3)), 6)}°`)
    answerSteps.push(" ")

    return {
        result: rad2deg(Math.asin((side1 * Math.sin(deg2Rad(angle2)))/side2)), 
        method: answerSteps.join("\n")
    }
}

/** Put the angle whose side you want first (angle1 to find side1)  
 * Label index is the index I'll call answerLabels with for the method prints
*/
function getSineSide(side2, angle1, angle2, labelIndex1, labelIndex2) {
    const A = answerLabels[1][labelIndex1]
    const a = answerLabels[0][labelIndex1]
    const B = answerLabels[1][labelIndex2]
    const b = answerLabels[0][labelIndex2] 

    let answerSteps = []; 
    answerSteps.push(`To work out side ${a} with Sine Rule:`)
    answerSteps.push(`(${a})/(sin(${A})) = (${b})/(sin(${B}))`)
    answerSteps.push(`           ${a} = (${b} × sin(${A}))/(sin(${B}))`)
    answerSteps.push(`           ${a} = (${side2} × sin(${angle1}°))/(sin(${angle2}°))`)
    const step3 = (Math.sin(deg2Rad(angle1))*side2)/Math.sin(deg2Rad(angle2))
    answerSteps.push(`           ${a} = ${toFix(step3, 6)}`)
    answerSteps.push(" ")

    return {
        result: (side2 *Math.sin(deg2Rad(angle1)))/Math.sin(deg2Rad(angle2)), 
        method: answerSteps.join("\n")
    }
}

function get180Angle(angle1, angle2, labelIndexX) {
    const X = answerLabels[1][labelIndexX]
    const Y = answerLabels[1][(labelIndexX+1)%3]
    const Z = answerLabels[1][(labelIndexX+2)%3]


    let answerSteps = []; 
    answerSteps.push(`To work out the angle ${X}, `)
    answerSteps.push(`remember that all angles add up to 180:`)
    answerSteps.push(`${X}° + ${Y}° + ${Z}° = 180`)
    answerSteps.push(`          ${X}° = 180 - ${Y}° - ${Z}°`)
    answerSteps.push(`          ${X}° = 180 - ${angle1}° - ${angle2}°`)
    answerSteps.push(`          ${X}° = ${180 - angle1 - angle2}°`)
    answerSteps.push(" ")

    return {
        result: 180 - angle1 - angle2, 
        method: answerSteps.join("\n")
    }
}

//------------------------------------------------
// RIGHT ANGLE
//------------------------------------------------

function getPythagA(sideB, sideC, sideAIndex) {
    const A = answerLabels[0][sideAIndex]
    const B = answerLabels[0][(sideAIndex+1)%3]
    const C = answerLabels[0][(sideAIndex+2)%3]


    let answerSteps = []; 
    answerSteps.push(`Since it's a right angled triangle, \nwork out side ${A} with Pythagoras:`)
    answerSteps.push(`${A}² = ${B}² + ${C}²`)
    answerSteps.push(`${A}² = ${sideB}² + ${sideC}²`)
    answerSteps.push(`${A}² = ${sideB**2} + ${sideC**2}`)
    const step3 = Math.sqrt(sideB**2 + sideC**2)
    answerSteps.push(` ${A} = √${sideB**2 + sideC**2}`)
    answerSteps.push(` ${A} = ${toFix(step3, 6)}`)
    answerSteps.push(" ")

    return {
        result: step3, 
        method: answerSteps.join("\n")
    }
}

function getPythagB(sideA, sideC, sideAIndex, sideBIndex, sideCIndex) {
    const B = answerLabels[0][sideBIndex]
    const C = answerLabels[0][sideCIndex]
    const A = answerLabels[0][sideAIndex]


    let answerSteps = []; 
    answerSteps.push(`Since it's a right angled triangle, \nwork out side ${B} with Pythagoras:`)
    answerSteps.push(`${A}² = ${B}² + ${C}²`)
    answerSteps.push(`${B}² = ${A}² - ${C}²`)
    answerSteps.push(`${B}² = ${sideA}² - ${sideC}²`)
    answerSteps.push(`${B}² = ${sideA**2} - ${sideC**2}`)
    const step3 = Math.sqrt(sideA**2 - sideC**2)
    answerSteps.push(` ${B} = ${toFix(step3, 6)}`)
    answerSteps.push(" ")

    return {
        result: step3, 
        method: answerSteps.join("\n")
    }
}

function getSineAngle90(sideOpp, sideHyp, oppIndex, adjIndex, hypIndex) {
    const opp = answerLabels[0][oppIndex]
    const hyp = answerLabels[0][hypIndex]
    const A = answerLabels[1][oppIndex]

    let answerSteps = []; 
    answerSteps.push(`Work out angle ${A} with SOH CAH TOA:`)
    answerSteps.push(`sin(${A}) = (opp)/(hyp)`)
    answerSteps.push(`sin(${A}) = (${opp})/(${hyp})`)
    answerSteps.push(`sin(${A}) = (${sideOpp})/(${sideHyp})`)
    answerSteps.push(`     ${A} = sin⁻¹(${sideOpp}/${sideHyp})`)
    const step3 = rad2deg(Math.asin(sideOpp/sideHyp))
    answerSteps.push(`     ${A} = ${toFix(step3, 6)}°`)
    answerSteps.push(" ")

    return {
        result: step3, 
        method: answerSteps.join("\n")
    }
}

function getSineOpp(angle, sideHyp, oppIndex, hypIndex) {
    const opp = answerLabels[0][oppIndex]
    const hyp = answerLabels[0][hypIndex]
    const A = answerLabels[1][oppIndex]

    let answerSteps = []; 
    answerSteps.push(`Work out opposite ${opp} with SOH CAH TOA:`)
    answerSteps.push(`sin(${A}) = (opp)/(hyp)`)
    answerSteps.push(`sin(${A}) = (${opp})/(${hyp})`)
    answerSteps.push(`     ${opp} = ${hyp} × sin(${A}°)`)
    answerSteps.push(`     ${opp} = ${sideHyp} × sin(${angle}°)`)
    const step3 = sideHyp * Math.sin(deg2Rad(angle))
    answerSteps.push(`     ${opp} = ${toFix(step3, 6)}`)
    answerSteps.push(" ")
    return {
        result: step3, 
        method: answerSteps.join("\n")
    }
}

function getSineHyp(angle, sideOpp, oppIndex, hypIndex) {
    const opp = answerLabels[0][oppIndex]
    const hyp = answerLabels[0][hypIndex]
    const A = answerLabels[1][oppIndex]

    let answerSteps = []; 
    answerSteps.push(`Since it's a right angled triangle, work out hypotenuse ${hyp} with SOH CAH TOA:`)
    answerSteps.push(`sin(${A}) = (opp)/(hyp)`)
    answerSteps.push(`sin(${A}) = (${opp})/(${hyp})`)
    answerSteps.push(`     ${hyp} = ${opp}/sin(${A}°)`)
    answerSteps.push(`     ${hyp} = ${sideOpp}/sin(${angle}°)`)
    const step3 = sideOpp / Math.sin(deg2Rad(angle))
    answerSteps.push(`     ${hyp} = ${toFix(step3, 6)}`)
    answerSteps.push(" ")
    return {
        result: step3, 
        method: answerSteps.join("\n")
    }
}

function getCosAngle90(sideAdj, sideHyp, oppIndex, adjIndex, hypIndex) {
    const adj = answerLabels[0][adjIndex]
    const hyp = answerLabels[0][hypIndex]
    const A = answerLabels[1][oppIndex]

    let answerSteps = []; 
    answerSteps.push(`Since it's a right angled triangle, work out angle ${A} with SOH CAH TOA:`)
    answerSteps.push(`cos(${A}) = (adj)/(hyp)`)
    answerSteps.push(`cos(${A}) = (${adj})/(${hyp})`)
    answerSteps.push(`      ${A} = (cos⁻¹(${adj})/(${hyp})`)
    const step3 = rad2deg(Math.acos(sideAdj/sideHyp))
    answerSteps.push(`          ${A}  = ${toFix(step3, 6)}°`)
    answerSteps.push(" ")

    return {
        result: step3, 
        method: answerSteps.join("\n")
    }
}

function getCosAdj(angle, sideHyp, oppIndex, adjIndex, hypIndex) {
    const adj = answerLabels[0][adjIndex]
    const hyp = answerLabels[0][hypIndex]
    const A = answerLabels[1][oppIndex]

    let answerSteps = []; 
    answerSteps.push(`Since it's a right angled triangle, work out adacent ${adj} with SOH CAH TOA:`)
    answerSteps.push(`cos(${A}) = (adj)/(hyp)`)
    answerSteps.push(`cos(${A}) = (${adj})/(${hyp})`)
    answerSteps.push(`${adj} = ${hyp} × cos(${A}°)`)
    answerSteps.push(`${opp} = ${sideHyp} × cos(${angle}°)`)
    const step3 = sideHyp * Math.cos(deg2Rad(angle))
    answerSteps.push(`          ${opp} = ${step3})`)
    answerSteps.push(" ")
    return {
        result: step3, 
        method: answerSteps.join("\n")
    }
}

function getCosHyp(angle, sideOpp, oppIndex, adjIndex, hypIndex) {
    const adj = answerLabels[0][adjIndex]
    const hyp = answerLabels[0][hypIndex]
    const A = answerLabels[1][oppIndex]

    let answerSteps = []; 
    answerSteps.push(`Since it's a right angled triangle, work out hypotenuse ${hyp} with SOH CAH TOA:`)
    answerSteps.push(`cos(${A}) = (adj)/(hyp)`)
    answerSteps.push(`cos(${A}) = (${adj})/(${hyp})`)
    answerSteps.push(`${hyp} = ${adj}/cos(${A}°)`)
    answerSteps.push(`${hyp} = ${sideAdj}/cos(${angle}°)`)
    const step3 = sideAdj / Math.cos(deg2Rad(angle))
    answerSteps.push(`          ${hyp} = ${step3})`)
    answerSteps.push(" ")
    return {
        result: step3, 
        method: answerSteps.join("\n")
    }
}

function getTanAngle90(sideAdj, sideOpp, oppIndex, adjIndex, hypIndex) {
    const adj = answerLabels[0][adjIndex]
    const opp = answerLabels[0][oppIndex]
    const A = answerLabels[1][oppIndex]

    let answerSteps = []; 
    answerSteps.push(`Since it's a right angled triangle, work out angle ${A} with SOH CAH TOA:`)
    answerSteps.push(`tan(${A}) = (opp)/(adj)`)
    answerSteps.push(`tan(${A}) = (${opp})/(${adj})`)
    answerSteps.push(`      ${A} = (tan⁻¹(${opp})/(${adj})`)
    const step3 = rad2deg(Math.atan(sideOpp/sideAdj))
    answerSteps.push(`          ${A}  = ${toFix(step3, 6)}°`)
    answerSteps.push(" ")

    return {
        result: step3, 
        method: answerSteps.join("\n")
    }
}

function getTanOpp(angle, sideAdj, oppIndex, adjIndex, hypIndex) {
    const adj = answerLabels[0][adjIndex]
    const opp = answerLabels[0][oppIndex]
    const A = answerLabels[1][oppIndex]

    let answerSteps = []; 
    answerSteps.push(`Since it's a right angled triangle, work out opposite ${opp} with SOH CAH TOA:`)
    answerSteps.push(`tan(${A}) = (opp)/(adj)`)
    answerSteps.push(`tan(${A}) = (${opp})/(${adj})`)
    answerSteps.push(`${opp} = ${adj} × tan(${A}°)`)
    answerSteps.push(`${opp} = ${sideAdj} × tan(${angle}°)`)
    const step3 = sideAdj * Math.tan(deg2Rad(angle))
    answerSteps.push(`          ${opp} = ${step3})`)
    answerSteps.push(" ")
    return {
        result: step3, 
        method: answerSteps.join("\n")
    }
}

function getCosAdj(angle, sideOpp, oppIndex, adjIndex, hypIndex) {
    const adj = answerLabels[0][adjIndex]
    const opp = answerLabels[0][oppIndex]
    const A = answerLabels[1][oppIndex]

    let answerSteps = []; 
    answerSteps.push(`Since it's a right angled triangle, work out adacent ${adj} with SOH CAH TOA:`)
    answerSteps.push(`tan(${A}) = (opp)/(adj)`)
    answerSteps.push(`tan(${A}) = (${opp})/(${adj})`)
    answerSteps.push(`${adj} = ${opp} / tan(${A}°)`)
    answerSteps.push(`${adj} = ${sideOpp} / tan(${angle}°)`)
    const step3 = sideOpp / Math.tan(deg2Rad(angle))
    answerSteps.push(`          ${adj} = ${step3})`)
    answerSteps.push(" ")
    return {
        result: step3, 
        method: answerSteps.join("\n")
    }
}


//----------------------------------------------------------------
// CONVERSIONS
//

function deg2Rad(degree) {
    return degree*Math.PI/180
}

function rad2deg(radian) {
    return radian*180/Math.PI
}

function norm(array, divisor) {
    return array.map(x => x / divisor)
}

/**Used to round numbers to how ever many decimal places */
function toFix(num, places) {
    return (Math.round(num * 10**(places)) / 10**(places)).toFixed(places);
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

