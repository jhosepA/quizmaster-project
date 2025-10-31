// --- PASO 1: Todas las importaciones van primero ---
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuizPage.css';

// --- PASO 2: La declaración de la función del componente ---
function QuizPage() {
  
  // --- PASO 3: Los hooks de React van al principio de la función ---
  const { shareCode } = useParams();
  const navigate = useNavigate();

  // Declaración de todos los estados del componente
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- El resto de la lógica del componente ---

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
    setIsSubmitting(true);
    const answersPayload = Object.entries(selectedAnswers).map(([question_id, option_id]) => ({
      question_id: parseInt(question_id),
      option_id
    }));

    axios.post(
      `http://localhost:5000/api/quizzes/${shareCode}/submit`, 
      { answers: answersPayload, player_name: playerName || 'Anónimo' }
    )
    .then(response => {
      navigate('/results', { state: { results: response.data, shareCode: shareCode } });
    })
    .catch(err => {
      console.error("Error detallado al enviar el quiz:", err);
      setError("Hubo un problema al enviar tus respuestas. Revisa la consola.");
      setIsSubmitting(false);
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
      <Link to="/" className="btn-back">← Cambiar de Quiz</Link>
      <h2>{quiz.title}</h2>
      <div className="player-name-section">
        <input
          type="text"
          placeholder="Introduce tu nombre"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="player-name-input"
        />
      </div>
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
      <button onClick={handleSubmit} className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Finalizar Quiz'}
      </button>
    </div>
  );
}

export default QuizPage;