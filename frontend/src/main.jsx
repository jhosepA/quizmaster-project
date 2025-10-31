import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx';
import './index.css';

import HomePage from './pages/HomePage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import RankingPage from './pages/RankingPage.jsx';
// 1. Importar las nuevas páginas del profesor
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CreateQuizPage from './pages/CreateQuizPage.jsx';

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
      { path: "/professor/dashboard", element: <DashboardPage /> },
      { path: "/professor/create", element: <CreateQuizPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);