const questions = document.querySelectorAll(".click-question .question");

questions.forEach(question => {
  question.addEventListener("click", function() {
    const answerId = this.id.replace("question", "answer");  // Construct answer ID from question ID
    const answerElement = document.getElementById(answerId);
    
    answerElement.style.display = answerElement.style.display === "none" ? "block" : "none";
  });
});

