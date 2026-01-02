import { useState, useEffect } from "react";
import { decode } from "html-entities";
import clsx from "clsx";

/**
 * get data from the api, save data of results to triviaData
 * to make sure that the api's too much request doesn't get called twice, set it up as an anonymous function in the state?
 *
 *
 */

function App() {
  const [startQuiz, setStartQuiz] = useState(false);
  const [triviaData, setTriviaData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [checkAllAnswer, setCheckAllAnswer] = useState(false)
  const score = triviaData.filter(
    (question) => question.selectedAnswer === question.correct
  ).length;

  function handleStartQuiz() {
    setStartQuiz((prev) => !prev);
  }

  useEffect(() => {
    if (startQuiz) {
      fetch("https://opentdb.com/api.php?amount=5")
        .then((res) => res.json())
        .then((data) => {
          if (data.results) {
            const formattedData = data.results.map((item) => ({
              id: crypto.randomUUID(),
              question: decode(item.question),
              correct: item.correct_answer,
              incorrect_answers: item.incorrect_answers,
              shuffledOptions: shuffle([
                ...item.incorrect_answers,
                item.correct_answer,
              ]),
              selectedAnswer: "",
            }));
            setTriviaData(formattedData);
          }
        });
    }
  }, [startQuiz]);

  function handleAnswer(questionId, answer) {
    setTriviaData((prevData) =>
      prevData.map((question) => {
        return question.id === questionId
          ? { ...question, selectedAnswer: answer }
          : question;
      })
    );
  }

  const triviaElements = triviaData.map((trivia) => {
    return (
      <div key={trivia.id} className="question">
        <p>{trivia.question}</p>
        {trivia.shuffledOptions.map((option) => {
          const isSelected = trivia.selectedAnswer === option;
          const isCorrect = option === trivia.correct;

          return (
            <button
              type="button"
              key={option}
              onClick={() => !showResults && handleAnswer(trivia.id, option)}
              className={clsx("answer", {
                chosenAnswer: isSelected && !showResults,

                correct: showResults && isCorrect,
                incorrect: showResults && isSelected && !isCorrect,
                dimmed: showResults && !isCorrect && !isSelected,
              })}
            >
              {decode(option)}
            </button>
          );
        })}
      </div>
    );
  });

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const allAnswered = triviaData.every((quiz) => quiz.selectedAnswer !== "");

    if (allAnswered) {
      if (checkAllAnswer === true) {
        setCheckAllAnswer(false)
      }
      setShowResults(true);
    } else {
      setCheckAllAnswer(true)
    }
  }

  function handleRestart() {
    setTriviaData([]);
    setShowResults(false);
    setStartQuiz(false);
  }

  return (
    <>
      <main>
        {!startQuiz ? (
          <div className="intro">
            <h1>Quizzical</h1>
            <span>A fun, interactive trivia game built with React. It fetches real-time questions from the OpenTDB API.</span>
            <button className="start" onClick={handleStartQuiz}>
              Start quiz
            </button>
          </div>
        ) : (
          <form method="post" onSubmit={handleSubmit}>
            {triviaElements}
            {checkAllAnswer && <p style={{color: "red", marginBottom: "0px", fontSize: "12px" }}>"Please answer all questions before checking!"</p>}
            {!showResults && (
              <button className="check-answer">Check Answers</button>
            )}
            {showResults && (
              <div className="game-result">
                <span>You scored {score}/5 correct answers</span>{" "}
                <button onClick={handleRestart} className="play-again">
                  Play again
                </button>
              </div>
            )}
          </form>
        )}
      </main>
    </>
  );
}

export default App;
