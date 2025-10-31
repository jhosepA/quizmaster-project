import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>QuizMaster AI</h1>
      </header>
      <main>
        {/* Aquí es donde React Router renderizará nuestras páginas (HomePage, QuizPage, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;