
const CHAR_SQUARED = "²" // \u00B2
const CHAR_DEGREE = "°" // \u00B0
const CHAR_MULT = "×" // \u00D7


const knownSide1 = document.getElementById("known-side-1");
const knownSide2 = document.getElementById("known-side-2");
const knownAngle = document.getElementById("known-angle");

const generateButton = document.getElementById("generate-answer-button");
generateButton.addEventListener("click", () => {generateCosineAnswer()})

const answerText = document.getElementById("answer-output");


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
    answerSteps.push(`a² = ${b**2} + ${c**2} - ${2*b*c} × ${Math.cos(angleA*Math.PI/180)}`)
    const step3 = b**2+c**2-(2*b*c*Math.cos(angleA*Math.PI/180))
    answerSteps.push(`a² = ${step3}`)
    answerSteps.push(`a = ${Math.sqrt(step3)}`)

    let stringAnswer = answerSteps.join("\n")

    answerText.innerText = stringAnswer;
    incrementTotalCount(1)
}

function incrementTotalCount(incAmount) {
    let total = window.localStorage.getItem('totalCount')
    if (total == null) {
        total = 0
    }
    window.localStorage.setItem('totalCount', (parseInt(total) + incAmount))
    sessionCount.innerText = total;
}