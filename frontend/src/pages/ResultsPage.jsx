import { useLocation, Link } from 'react-router-dom';
import './ResultsPage.css';

function ResultsPage() {
  const location = useLocation();

  // --- LA FORMA SEGURA DE ACCEDER A LOS DATOS ---
  // Primero verificamos que location.state exista, y luego que results exista dentro.
  const results = location.state ? location.state.results : null;

  // Si por alguna razón el usuario llega a esta página sin resultados,
  // le mostramos un mensaje para que vuelva al inicio.
  if (!results) {
    return (
      <div className="results-container">
        <h2>No hay resultados para mostrar.</h2>
        <p>Debes completar un quiz primero para ver tus resultados aquí.</p>
        <Link to="/" className="home-link">Volver al inicio</Link>
      </div>
    );
  }

  // Si llegamos aquí, 'results' existe y es seguro usarlo.
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
      <Link to="/" className="home-link">
        Jugar de nuevo
      </Link>
    </div>
  );
}

export default ResultsPage;