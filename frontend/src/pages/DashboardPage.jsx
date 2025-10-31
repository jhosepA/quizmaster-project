import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './DashboardPage.css';

function DashboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/quizzes');
        setQuizzes(response.data);
      } catch (err) {
        console.error("Error al obtener los quizzes:", err);
        setError("No se pudieron cargar los quizzes.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) {
    return <div className="dashboard-container">Cargando quizzes...</div>;
  }

  if (error) {
    return <div className="dashboard-container error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Mis Quizzes</h2>
        <Link to="/professor/create" className="btn-create">
          Crear Nuevo Quiz
        </Link>
      </div>
      {quizzes.length > 0 ? (
        <table className="quizzes-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Código para Compartir</th>
              <th>N° de Preguntas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td>{quiz.title}</td>
                <td>
                  <code className="share-code">{quiz.share_code}</code>
                </td>
                <td>{quiz.question_count}</td>
                <td>
                  <Link to={`/quiz/${quiz.share_code}/ranking`} className="btn-table">
                    Ver Ranking
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aún no has creado ningún quiz. ¡Crea el primero!</p>
      )}
    </div>
  );
}

export default DashboardPage;