import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './QuizPage.css'; // Importamos el CSS para los estilos

function QuizPage() {
  // useParams nos da un objeto con los parámetros de la URL, ej: { shareCode: 'a1b2c3' }
  const { shareCode } = useParams();

  // Tres estados para manejar el ciclo de vida de los datos
  const [quiz, setQuiz] = useState(null); // Para guardar los datos del quiz
  const [loading, setLoading] = useState(true); // Para saber si estamos cargando
  const [error, setError] = useState(null); // Para guardar cualquier error

  // useEffect se ejecuta cuando el componente se carga por primera vez
  useEffect(() => {
    // Definimos la función que buscará los datos del quiz
    const fetchQuiz = async () => {
      try {
        // Hacemos la llamada a nuestra API usando el shareCode de la URL
        const response = await axios.get(`http://localhost:5000/api/quizzes/${shareCode}`);
        // Si todo va bien, guardamos los datos en el estado
        setQuiz(response.data);
      } catch (err) {
        // Si el quiz no se encuentra (error 404) o hay otro problema
        console.error("Error al obtener el quiz:", err);
        setError("No se pudo encontrar el quiz. Verifica que el código sea correcto.");
      } finally {
        // Haya éxito o error, dejamos de cargar
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [shareCode]); // El efecto depende de shareCode. Si cambia, se vuelve a ejecutar.

  // --- Renderizado Condicional ---

  // 1. Mientras estamos cargando
  if (loading) {
    return <div className="quiz-container">Cargando quiz...</div>;
  }

  // 2. Si hubo un error
  if (error) {
    return <div className="quiz-container error-message">{error}</div>;
  }
  
  // 3. Si todo salió bien, mostramos el quiz
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
                <div key={option.id} className="option">
                  {option.option_text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizPage;