import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <--- LA LÍNEA CORREGIDA
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const PROFESSOR_PASSWORD = 'profe'; 

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === PROFESSOR_PASSWORD) {
      login();
      navigate('/professor/dashboard');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Acceso del Profesor</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
        />
        <Link to="/" className="back-link">Volver al Inicio</Link>
        <button type="submit">Entrar</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}
export default LoginPage;