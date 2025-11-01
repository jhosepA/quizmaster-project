import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './RankingPage.css';

function RankingPage() {
  const { shareCode } = useParams();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await axios.get(`https://quizmaster-backend-hkey.onrender.com/api/quizzes/${shareCode}/ranking`);
        setRanking(response.data);
      } catch (err) {
        console.error("Error al obtener el ranking:", err);
        setError("No se pudo cargar el ranking.");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [shareCode]);

  if (loading) {
    return <div className="ranking-container">Cargando ranking...</div>;
  }

  if (error) {
    return <div className="ranking-container error-message">{error}</div>;
  }

  return (
    <div className="ranking-container">
      <h2>Ranking del Quiz</h2>
      {ranking.length > 0 ? (
        <table className="ranking-table">
          <thead>
            <tr>
              <th>Posición</th>
              <th>Jugador</th>
              <th>Puntaje</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((entry, index) => (
              <tr key={index}>
                <td data-label="Posición">{index + 1}</td>
                <td data-label="Jugador">{entry.player_name}</td>
                <td data-label="Puntaje">{entry.score} / {entry.total_questions}</td>
                <td data-label="Fecha">{entry.submitted_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nadie ha respondido este quiz todavía. ¡Sé el primero!</p>
      )}
      <Link to="/" className="home-link">
        Volver al inicio
      </Link>
    </div>
  );
}

export default RankingPage;