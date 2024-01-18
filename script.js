const container = document.querySelector(".container");
const feedbackModal = document.querySelector(".feedback-modal");
const feedback = document.querySelector(".modal-content");
const scoreBody = document.querySelector(".score");
const viewRulesButton = document.querySelector("#start-button");
const cancelQuizButton = document.querySelector(".cancel-quiz");

let timerInterval;
let score = 0;

// Open rules modal
viewRulesButton.addEventListener("click", function () {
  document.querySelector("#rules").style.display = "flex";
  viewRulesButton.style.display = "none";
});

cancelQuizButton.addEventListener("click", function () {
  document.querySelector("#rules").style.display = "none";
  viewRulesButton.style.display = "block";
});

function startQuiz() {
  document.querySelector("#rules").style.display = "none";

  createQuiz();
  startTimer();
  fetchData();
}

function createQuiz() {
  const quizBody = document.createElement("section");
  quizBody.id = "quiz-body";

  // Reset quiz display
  const existingQuizBody = document.getElementById("quiz-body");

  if (existingQuizBody) {
    existingQuizBody.remove();
  }

  quizBody.innerHTML = `
      <section class="question">
     
      </section>

      <section class="options">
        <div class="option-a">
          <button type="submit"></button>
        </div>

        <div class="option-b">
          <button type="submit"></button>
        </div>

        <div class="option-c">
          <button type="submit"></button>
        </div>

        <div class="option-d">
          <button type="submit"></button>
        </div>
      </section>
    `;

  container.append(quizBody);
}

//Display result
function resultDisplay() {
  feedbackModal.style.display = "flex";

  if (score === 15) {
    feedback.textContent = `Wow, you scored ${score}/15 `;
    feedback.style.backgroundColor = "#a379fa";
  } else if (score > 5 && score <= 14) {
    feedback.textContent = `Congrats, you scored ${score}/15 `;
    feedback.style.backgroundColor = "#6e61ff";
  } else if (score > 0 && score <= 5) {
    feedback.textContent = `Hmm, you should study. ${score}/15 `;
    feedback.style.backgroundColor = "#fff";
  } else {
    feedback.textContent = `Well, that was something... ${score}/15 `;
    feedback.style.backgroundColor = "#FF0000";
  }

  // Restart quiz / return to rules screen
  setTimeout(() => {
    feedbackModal.style.display = "none";
    document.querySelector("#rules").style.display = "flex";
    document.getElementById("quiz-body").style.display = "none";

    // Resets score and timer
    score = 0;
    scoreBody.innerHTML = score;
    clearInterval(timerInterval);
    document.querySelector(".timer").innerHTML = "";
  }, 3000);
}

//Display question
function handleQuiz(response) {
  const questionText = document.querySelector(".question");
  const optionA = document.querySelector(".option-a button");
  const optionB = document.querySelector(".option-b button");
  const optionC = document.querySelector(".option-c button");
  const optionD = document.querySelector(".option-d button");

  let correctAnswer = "";
  let currentQuestionIndex = 0;
  const questions = response.data;

  const setQuiz = (index) => {
    const currentQuestion = questions[index];

    questionText.textContent = `${currentQuestionIndex + 1}. ${
      currentQuestion.question
    }`;
    optionA.textContent = `A) ${currentQuestion.answers.answer_a}`;
    optionB.textContent = `B) ${currentQuestion.answers.answer_b}`;
    optionC.textContent = `C) ${currentQuestion.answers.answer_c}`;
    optionD.textContent = `D) ${currentQuestion.answers.answer_d}`;

    for (const key in currentQuestion.correct_answers) {
      if (currentQuestion.correct_answers[key] === "true") {
        correctAnswer = key;
        break;
      }
    }
  };

  setQuiz(currentQuestionIndex);

  optionA.addEventListener("click", () => {
    checkAnswer("answer_a_correct");
  });
  optionB.addEventListener("click", () => {
    checkAnswer("answer_b_correct");
  });
  optionC.addEventListener("click", () => {
    checkAnswer("answer_c_correct");
  });
  optionD.addEventListener("click", () => {
    checkAnswer("answer_d_correct");
  });

  //user feedback for answers
  const checkAnswer = (selectedAnswer) => {
    if (selectedAnswer === correctAnswer) {
      feedbackModal.style.display = "flex";
      feedback.textContent = "Yayy, correct!";
      feedback.style.backgroundColor = "#00FF00";
      score++;
      scoreBody.innerHTML = score;
    } else {
      feedbackModal.style.display = "flex";
      feedback.textContent = "Oof, wrong!";
      feedback.style.backgroundColor = "#FF0000";
    }

    setTimeout(() => {
      feedbackModal.style.display = "none";

      // Move to next question after a delay
      setTimeout(() => {
        currentQuestionIndex++;

        if (currentQuestionIndex < 15) {
          setQuiz(currentQuestionIndex);
        } else {
          resultDisplay();
        }
      }, 500);
    }, 1500);
  };
}

function startTimer() {
  let minutes = 4;
  let seconds = 60;
  const timerDisplay = document.querySelector(".timer");

  timerInterval = setInterval(() => {
    seconds--;
    if (seconds < 0) {
      if (minutes > 0) {
        minutes--;
        seconds = 59;
      } else {
        clearInterval(timerInterval);
        submitQuiz();
        return;
      }
    }

    timerDisplay.textContent = `${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;

    if (minutes === 0 && seconds <= 59) {
      timerDisplay.style.color = "red";
    }
  }, 1000);
}

function submitQuiz() {
  setTimeout(() => {
    feedbackModal.style.display = "flex";
    feedback.textContent = "Time's up!";
    feedback.style.backgroundColor = "#FF0000";

    setTimeout(() => {
      resultDisplay();
    }, 3000);
  }, 1000);
}

function fetchData() {
  axios
    .get(apiUrl)
    .then((response) => {
      handleQuiz(response);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

document.querySelector(".start-quiz").addEventListener("click", startQuiz);
