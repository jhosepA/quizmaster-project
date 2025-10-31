import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateQuizPage.css';

function CreateQuizPage() {
  const navigate = useNavigate();
  
  // Estado para el formulario manual
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question_text: '', options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }] },
  ]);
  
  // Estado para la sección de IA
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Estado general de la página
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- LÓGICA DE GENERACIÓN CON IA ---
  const handleGenerateWithAI = async () => {
    if (!aiTopic.trim()) {
      setError("Por favor, introduce un tema para la IA.");
      return;
    }
    setError('');
    setIsGenerating(true);

    try {
      const response = await axios.post('http://localhost:5000/api/generate-quiz-ai', {
        topic: aiTopic,
        num_questions: 5 // Puedes hacerlo configurable si quieres
      });

      // Rellenamos el formulario manual con los datos de la IA
      const aiQuiz = response.data;
      setTitle(aiQuiz.title);
      setQuestions(aiQuiz.questions);

    } catch (err) {
      console.error("Error al generar con IA:", err);
      setError("No se pudo generar el quiz con la IA. Inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Lógica del formulario manual (sin cambios) ---
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
    newQuestions[qIndex].options.forEach((opt, index) => {
      newQuestions[qIndex].options[index].is_correct = false;
    });
    newQuestions[qIndex].options[oIndex].is_correct = true;
    setQuestions(newQuestions);
  };
  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }] }]);
  };
  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ option_text: '', is_correct: false });
    setQuestions(newQuestions);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
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
      setSuccessMessage(`¡Quiz guardado! Código para compartir: ${response.data.share_code}`);
    } catch (err) {
      console.error("Error al crear el quiz:", err);
      setError("No se pudo guardar el quiz. Revisa todos los campos.");
    }
  };

  return (
    <div className="create-quiz-container">
      <h2>Crear Nuevo Quiz</h2>

      {/* --- SECCIÓN DE GENERACIÓN CON IA --- */}
      <div className="ai-generator-section">
        <h3>Generar con IA</h3>
        <div className="form-group-inline">
          <input
            type="text"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="Introduce un tema (ej: 'La Segunda Guerra Mundial')"
            disabled={isGenerating}
          />
          <button type="button" onClick={handleGenerateWithAI} disabled={isGenerating} className="btn-primary">
            {isGenerating ? 'Generando...' : 'Generar Quiz'}
          </button>
        </div>
      </div>

      <hr />

      {/* --- SECCIÓN DE CREACIÓN MANUAL --- */}
      <h3>Editor de Quiz</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título del Quiz</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="El título se rellenará automáticamente"
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
        <button type="submit" className="btn-primary btn-save">
          Guardar Quiz
        </button>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </form>
    </div>
  );
}

export default CreateQuizPage;