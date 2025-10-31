import { useLocation, Link } from 'react-router-dom';
import './ResultsPage.css';

function ResultsPage() {
  const location = useLocation();
  // Leemos tanto 'results' como 'shareCode' del estado
  const { results, shareCode } = location.state || {};

  if (!results) {
    return (
      <div className="results-container">
        <h2>No hay resultados para mostrar.</h2>
        <Link to="/" className="home-link">Volver al inicio</Link>
      </div>
    );
  }

  const percentage = (results.score / results.total_questions) * 100;

  return (
    <div className="results-container">
      <h2>¡Quiz Finalizado!</h2>
      <div className="score-summary">
        <p>Tu puntuación es:</p>
        <div className="score">
          {results.score} / {results.total_questions}
        </div>
        <div className="percentage">
          ({percentage.toFixed(2)}%)
        </div>
      </div>
      <div className="results-actions">
        <Link to="/" className="home-link">
          Jugar de nuevo
        </Link>
        {/* Añadimos el enlace al ranking si tenemos el shareCode */}
        {shareCode && (
          <Link to={`/quiz/${shareCode}/ranking`} className="ranking-link">
            Ver Ranking
          </Link>
        )}
      </div>
    </div>
  );
}

export default ResultsPage;