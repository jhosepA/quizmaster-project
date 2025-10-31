import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react'; // CORRECCIÓN 1: Importación nombrada
import './DashboardPage.css';

function DashboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQrCode, setActiveQrCode] = useState(null); 

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/quizzes');
        setQuizzes(response.data);
      } catch (err) {
        setError("No se pudieron cargar los quizzes.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const quizBaseUrl = `${window.location.protocol}//${window.location.hostname}:5173/quiz`;

  if (loading) return <div className="dashboard-container">Cargando...</div>;
  if (error) return <div className="dashboard-container error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Mis Quizzes</h2>
        <Link to="/professor/create" className="btn-create">Crear Nuevo Quiz</Link>
      </div>
      <table className="quizzes-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Código</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quiz) => (
            <tr key={quiz.id}>
              <td>{quiz.title}</td>
              <td><code className="share-code">{quiz.share_code}</code></td>
              <td className="actions-cell">
                <Link to={`/quiz/${quiz.share_code}/ranking`} className="btn-table">Ranking</Link>
                <button onClick={() => setActiveQrCode(activeQrCode === quiz.share_code ? null : quiz.share_code)} className="btn-table qr">
                  {activeQrCode === quiz.share_code ? 'Ocultar QR' : 'Mostrar QR'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeQrCode && (
        <div className="qr-modal-overlay" onClick={() => setActiveQrCode(null)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Escanea para unirte al quiz</h3>
            {/* CORRECCIÓN 2: Usar el nombre del componente importado */}
            <QRCodeCanvas
              value={`${quizBaseUrl}/${activeQrCode}`}
              size={256}
              level="H"
              includeMargin={true}
            />
            <p>URL: {`${quizBaseUrl}/${activeQrCode}`}</p>
            <button onClick={() => setActiveQrCode(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;