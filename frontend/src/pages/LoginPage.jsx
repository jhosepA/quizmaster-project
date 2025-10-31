import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // La contraseña secreta, "quemada" en el código
  const PROFESSOR_PASSWORD = 'profe'; 

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === PROFESSOR_PASSWORD) {
      login(); // Marcamos como autenticado
      navigate('/professor/dashboard'); // Redirigimos al panel
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
        <button type="submit">Entrar</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}
export default LoginPage;