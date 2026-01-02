import { useState, useEffect } from "react";
import { decode } from "html-entities";
import clsx from 'clsx';


/**
 * get data from the api, save data of results to triviaData
 * to make sure that the api's too much request doesn't get called twice, set it up as an anonymous function in the state?
 *
 *
 */

function App() {
  const [startQuiz, setStartQuiz] = useState(false);
  const [triviaData, setTriviaData] = useState([]);
  const [chosenAnswer, setChosenAnswer] = useState(false)

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
            correct: (item.correct_answer),
            incorrect_answers: (item.incorrect_answers),
            shuffledOptions: shuffle([...item.incorrect_answers, item.correct_answer]),
            selectedAnswer: ""
          }));
          setTriviaData(formattedData);
        }
      });
  }
}, [startQuiz]);

function handleAnswer(questionId, answer) {
  setTriviaData(prevData => prevData.map(question => {
    return question.id === questionId 
      ? { ...question, selectedAnswer: answer } 
      : question;
  }));
}

const triviaElements = triviaData.map((trivia) => {
  return (
    <div key={trivia.id} className="question">
      <p>{trivia.question}</p>
      {trivia.shuffledOptions.map(option => (
        <button 
          type="button"
          key={option} 
          onClick={() => handleAnswer(trivia.id, option)}
          className={clsx("answer", {
            "chosenAnswer": trivia.selectedAnswer === option
          })}
        >
          {decode(option)}
        </button>
      ))}
    </div>
  );
});

  function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}


  return (
    <>
      <main>
        {!startQuiz ? (
          <div className="intro">
            <h1>Quizzical</h1>
            <span>Some description if needed</span>
            <button className="start" onClick={handleStartQuiz}>Start quiz</button>
          </div>
        ) : (
          <form>
            {triviaElements}
            <button className="check-answer">Check Answers</button>
          </form>
        )}
      </main>
    </>
  );
}

export default App;
