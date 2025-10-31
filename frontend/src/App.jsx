import { Outlet, Link } from 'react-router-dom'; // <--- LA LÍNEA CORREGIDA
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <Link to="/" className="home-link-header"><h1>QuizMaster AI</h1></Link>
          <Link to="/professor/login" className="professor-link-header">Acceso Profesor</Link>
        </div>
      </header>
      <main>
        {/* Aquí es donde React Router renderizará nuestras páginas */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;