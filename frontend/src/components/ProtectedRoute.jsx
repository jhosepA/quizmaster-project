import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    // Si no está autenticado, lo redirigimos a la página de login
    return <Navigate to="/professor/login" replace />;
  }
  return children;
}
export default ProtectedRoute;