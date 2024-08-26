const questions = document.querySelectorAll(".click-question .question");

const menuContent = document.querySelector('.menu');
const menuToggle = document.querySelector('.menu-tag');

let markingCount = 0; 
let assemblyCount = 0; 
let partCount = 0; 

const markingCounterElement = document.getElementById('marking-count');
const assemblyCounterElement = document.getElementById('assembly-count');
const partCounterElement = document.getElementById('part-count');

let softwareCount = 0; 
const softwareList = [
  "Revit", 
  "AutoCAD", 
  "Solidworks", 
  "Inventor", 
  "ANSYS", 
  "Creo", 
  "Blender", 
  "Illustrator", 
  "Clip Studio Paint", 
  "Krita", 
  "Python", 
  "MATLAB", 
  "Java", 
  "R", 
  "C", 
  "Golang", 
  "Javascript", 
  "MS Office", 
  "LaTeX", 
  "Revu", 
  "Publisher"
]

const softwareCounterElement = document.getElementById('software-count');

menuToggle.addEventListener('click', () => {
  menuContent.classList.toggle('open');
  if (menuContent.classList.contains('open')) {
    menuContent.style.transform = 'translateY(10%)';
  } else {
    menuContent.style.transform = 'translateY(93%)';
  }
});

setInterval(() => {
  markingCount++;
  if (markingCount > 36) {
    markingCount = 0;
  }
  markingCounterElement.textContent = markingCount.toString();
}, 500);

setInterval(() => {
  assemblyCount++;
  if (assemblyCount > 540) {
    assemblyCount = 0;
  }
  assemblyCounterElement.textContent = assemblyCount.toString();
}, 50);

setInterval(() => {
  partCount += 7;
  if (partCount > 1512) {
    partCount = 0;
  }
  partCounterElement.textContent = partCount.toString();
}, 25);

setInterval(() => {
  softwareCount++;
  if (softwareCount >= softwareList.length) {
    softwareCount = 0;
  }
  softwareCounterElement.textContent = softwareList[softwareCount];
}, 150);


