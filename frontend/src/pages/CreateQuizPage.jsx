import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateQuizPage.css';

function CreateQuizPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question_text: '', options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }], correct_option_index: null },
  ]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- Manejadores de cambios ---

  const handleQuestionChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].question_text = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].option_text = value;
    setQuestions(newQuestions);
  };

  const handleCorrectOptionChange = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    // Desmarcar la opción correcta anterior si la había
    newQuestions[qIndex].options.forEach((opt, index) => {
      newQuestions[qIndex].options[index].is_correct = false;
    });
    // Marcar la nueva opción correcta
    newQuestions[qIndex].options[oIndex].is_correct = true;
    setQuestions(newQuestions);
  };

  // --- Manejadores de acciones (Añadir/Eliminar) ---

  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }], correct_option_index: null }]);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ option_text: '', is_correct: false });
    setQuestions(newQuestions);
  };

  // --- Lógica de envío ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Formatear el payload para la API
    const payload = {
      title,
      questions: questions.map(q => ({
        question_text: q.question_text,
        options: q.options.map(o => ({
          option_text: o.option_text,
          is_correct: o.is_correct
        }))
      }))
    };

    try {
      const response = await axios.post('http://localhost:5000/api/quizzes', payload);
      setSuccessMessage(`¡Quiz creado! Código para compartir: ${response.data.share_code}`);
      // Opcional: redirigir después de un tiempo
      // setTimeout(() => navigate('/professor/dashboard'), 2000);
    } catch (err) {
      console.error("Error al crear el quiz:", err);
      setError("No se pudo crear el quiz. Revisa todos los campos.");
    }
  };

  return (
    <div className="create-quiz-container">
      <h2>Crear Nuevo Quiz</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título del Quiz</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Historia Universal"
            required
          />
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="question-editor">
            <h4>Pregunta {qIndex + 1}</h4>
            <input
              type="text"
              value={q.question_text}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              placeholder={`Texto de la pregunta ${qIndex + 1}`}
              required
            />
            <h5>Opciones</h5>
            {q.options.map((opt, oIndex) => (
              <div key={oIndex} className="option-editor">
                <input
                  type="radio"
                  name={`correct_option_${qIndex}`}
                  checked={opt.is_correct}
                  onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                  required
                />
                <input
                  type="text"
                  value={opt.option_text}
                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  placeholder={`Texto de la opción ${oIndex + 1}`}
                  required
                />
              </div>
            ))}
            <button type="button" onClick={() => addOption(qIndex)} className="btn-secondary">
              Añadir Opción
            </button>
          </div>
        ))}

        <button type="button" onClick={addQuestion} className="btn-secondary">
          Añadir Pregunta
        </button>
        <hr />
        <button type="submit" className="btn-primary">
          Crear Quiz
        </button>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </form>
    </div>
  );
}

export default CreateQuizPage;