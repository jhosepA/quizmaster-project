import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx';
import './index.css';
// Importamos nuestros componentes de página
import HomePage from './pages/HomePage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import RankingPage from './pages/RankingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CreateQuizPage from './pages/CreateQuizPage.jsx';
// 1. Importar el proveedor de autenticación
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // --- Rutas del Estudiante ---
      { path: "/", element: <HomePage /> },
      { path: "/quiz/:shareCode", element: <QuizPage /> },
      { path: "/results", element: <ResultsPage /> },
      { path: "/quiz/:shareCode/ranking", element: <RankingPage /> },

      // --- Rutas del Profesor ---
      { path: "/professor/login", element: <LoginPage /> },
      { 
        path: "/professor/dashboard", 
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute> 
      },
      { 
        path: "/professor/create", 
        element: <ProtectedRoute><CreateQuizPage /></ProtectedRoute> 
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);