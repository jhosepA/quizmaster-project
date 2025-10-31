import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuizPage.css';

function QuizPage() {
  const { shareCode } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/quizzes/${shareCode}`);
        setQuiz(response.data);
      } catch (err) {
        console.error("Error al obtener el quiz:", err);
        setError("No se pudo encontrar el quiz. Verifica que el código sea correcto.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [shareCode]);

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: optionId
    }));
  };

  const handleSubmit = () => {
    const answersPayload = Object.entries(selectedAnswers).map(([question_id, option_id]) => ({
      question_id: parseInt(question_id),
      option_id
    }));

    axios.post(
      `http://localhost:5000/api/quizzes/${shareCode}/submit`, 
      { answers: answersPayload }
    )
    .then(response => {
      navigate('/results', { state: { results: response.data, shareCode: shareCode } });
    })
    .catch(err => {
      console.error("Error detallado al enviar el quiz:", err);
      setError("Hubo un problema al enviar tus respuestas. Revisa la consola.");
    });
  };

  if (loading) {
    return <div className="quiz-container">Cargando quiz...</div>;
  }

  if (error) {
    return <div className="quiz-container error-message">{error}</div>;
  }
  
  return (
    <div className="quiz-container">
      <h2>{quiz.title}</h2>
      <div className="questions-list">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="question-card">
            <h3>Pregunta {index + 1}</h3>
            <p className="question-text">{question.question_text}</p>
            <div className="options-list">
              {question.options.map((option) => (
                <div 
                  key={option.id}
                  className={`option ${selectedAnswers[question.id] === option.id ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(question.id, option.id)}
                >
                  {option.option_text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} className="submit-button">
        Finalizar Quiz
      </button>
    </div>
  );
}

export default QuizPage;